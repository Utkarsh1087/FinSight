from decimal import Decimal
from django.db.models import Sum, Count, Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Invoice, InvoicePayment, InvoiceStatus, InvoiceType
from .serializers import InvoiceSerializer, InvoicePaymentSerializer
from apps.accounts.permissions import IsFinanceUserOrAdmin, ReadOnlyOrFinanceAdmin
from apps.audit.utils import record_audit_log
from apps.controls.rules import evaluate_financial_controls

class InvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

    def get_queryset(self):
        qs = Invoice.objects.all().prefetch_related("payments")
        status_val = self.request.query_params.get("status")
        type_val = self.request.query_params.get("type")
        party_name = self.request.query_params.get("party_name")
        search = self.request.query_params.get("search")

        if status_val:
            qs = qs.filter(status__iexact=status_val)
        if type_val:
            qs = qs.filter(invoice_type__iexact=type_val)
        if party_name:
            qs = qs.filter(party_name__icontains=party_name)
        if search:
            qs = qs.filter(
                Q(invoice_number__icontains=search) |
                Q(party_name__icontains=search) |
                Q(reference__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        invoice = serializer.save(created_by=self.request.user)
        invoice.update_status()
        invoice.save()

        record_audit_log(
            user=self.request.user,
            action="INVOICE_CREATED",
            entity_type="Invoice",
            entity_id=str(invoice.id),
            details=f"Created {invoice.get_invoice_type_display()} #{invoice.invoice_number} for {invoice.party_name} [₹{invoice.total_amount}]"
        )
        evaluate_financial_controls(invoice=invoice)

class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all().prefetch_related("payments")
    serializer_class = InvoiceSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

    def perform_update(self, serializer):
        invoice = serializer.save()
        invoice.update_status()
        invoice.save()
        record_audit_log(
            user=self.request.user,
            action="INVOICE_UPDATED",
            entity_type="Invoice",
            entity_id=str(invoice.id),
            details=f"Updated Invoice #{invoice.invoice_number}"
        )
        evaluate_financial_controls(invoice=invoice)

class RecordInvoicePaymentView(APIView):
    permission_classes = [IsFinanceUserOrAdmin]

    def post(self, request, pk):
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        amount_str = request.data.get("amount")
        if not amount_str:
            return Response({"error": "Payment amount is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount_str))
            if amount <= 0:
                raise ValueError()
        except Exception:
            return Response({"error": "Invalid payment amount."}, status=status.HTTP_400_BAD_REQUEST)

        payment = InvoicePayment.objects.create(
            invoice=invoice,
            amount=amount,
            payment_date=request.data.get("payment_date") or invoice.issue_date,
            payment_method=request.data.get("payment_method", "Bank Transfer"),
            reference_no=request.data.get("reference_no", ""),
            notes=request.data.get("notes", ""),
            recorded_by=request.user
        )

        invoice.paid_amount += amount
        invoice.update_status()
        invoice.save()

        record_audit_log(
            user=request.user,
            action="INVOICE_PAYMENT_RECORDED",
            entity_type="InvoicePayment",
            entity_id=str(payment.id),
            details=f"Recorded payment of ₹{amount} on Invoice #{invoice.invoice_number}"
        )
        evaluate_financial_controls(invoice=invoice)

        return Response({
            "message": "Payment recorded successfully.",
            "payment": InvoicePaymentSerializer(payment).data,
            "invoice": InvoiceSerializer(invoice).data
        }, status=status.HTTP_201_CREATED)

class InvoiceSummaryStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_invoices = Invoice.objects.count()
        pending_invoices = Invoice.objects.filter(status=InvoiceStatus.PENDING).count()
        overdue_invoices = Invoice.objects.filter(status=InvoiceStatus.OVERDUE).count()
        paid_invoices = Invoice.objects.filter(status=InvoiceStatus.PAID).count()
        
        total_outstanding = sum((inv.outstanding_amount for inv in Invoice.objects.exclude(status=InvoiceStatus.PAID)), Decimal("0.00"))
        total_receivable = sum((inv.outstanding_amount for inv in Invoice.objects.filter(invoice_type=InvoiceType.RECEIVABLE).exclude(status=InvoiceStatus.PAID)), Decimal("0.00"))
        total_payable = sum((inv.outstanding_amount for inv in Invoice.objects.filter(invoice_type=InvoiceType.PAYABLE).exclude(status=InvoiceStatus.PAID)), Decimal("0.00"))

        return Response({
            "total_invoices": total_invoices,
            "pending_count": pending_invoices,
            "overdue_count": overdue_invoices,
            "paid_count": paid_invoices,
            "total_outstanding": float(total_outstanding),
            "total_receivable": float(total_receivable),
            "total_payable": float(total_payable)
        })

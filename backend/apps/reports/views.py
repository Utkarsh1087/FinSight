import csv
from decimal import Decimal
from django.http import HttpResponse
from django.db.models import Sum, Count
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.reconciliation.models import ReconciliationBatch, ReconciliationMatch, DiscrepancyException
from apps.invoices.models import Invoice, InvoiceStatus
from apps.expenses.models import Expense, ExpenseCategory
from apps.inventory.models import WarehouseStock, Product, Warehouse

class FinancialOverviewReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_invoices = Invoice.objects.count()
        overdue_invoices = Invoice.objects.filter(status=InvoiceStatus.OVERDUE).count()
        total_rec_batches = ReconciliationBatch.objects.count()
        latest_batch = ReconciliationBatch.objects.filter(status="COMPLETED").order_by("-created_at").first()
        
        total_expenses = Expense.objects.aggregate(t=Sum("amount"))["t"] or Decimal("0.00")
        total_inventory_val = sum((s.total_valuation for s in WarehouseStock.objects.all()), Decimal("0.00"))

        return Response({
            "reconciliation": {
                "total_batches": total_rec_batches,
                "latest_batch_name": latest_batch.name if latest_batch else "N/A",
                "match_rate": latest_batch.match_rate if latest_batch else 0.0,
                "matched_count": latest_batch.matched_count if latest_batch else 0,
                "exception_count": latest_batch.exception_count if latest_batch else 0,
                "unreconciled_diff": float(latest_batch.unreconciled_difference) if latest_batch else 0.0,
            },
            "invoices": {
                "total_count": total_invoices,
                "overdue_count": overdue_invoices,
                "total_outstanding": float(sum((inv.outstanding_amount for inv in Invoice.objects.exclude(status=InvoiceStatus.PAID)), Decimal("0.00"))),
            },
            "expenses": {
                "total_recorded": float(total_expenses),
                "count": Expense.objects.count(),
            },
            "inventory": {
                "total_valuation": float(total_inventory_val),
                "total_units": sum(s.quantity_on_hand for s in WarehouseStock.objects.all()),
            }
        })


class ExportReconciliationCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, batch_id):
        try:
            batch = ReconciliationBatch.objects.get(pk=batch_id)
        except ReconciliationBatch.DoesNotExist:
            return Response({"error": "Batch not found."}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="reconciliation_exceptions_{batch.period.replace(" ", "_")}.csv"'

        writer = csv.writer(response)
        writer.writerow(["Rank", "Side", "Category", "Amount", "Reason", "Suggested Action", "Status"])

        for exc in batch.exceptions.all():
            writer.writerow([
                exc.rank,
                exc.get_side_display(),
                exc.get_category_display(),
                f"{exc.amount:.2f}",
                exc.reason,
                exc.suggested_action,
                exc.get_status_display()
            ])

        return response


class ExportInvoicesCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="invoices_report.csv"'

        writer = csv.writer(response)
        writer.writerow(["Invoice Number", "Party Name", "Type", "Issue Date", "Due Date", "Total Amount", "Paid Amount", "Outstanding", "Status", "Days Overdue"])

        for inv in Invoice.objects.all():
            writer.writerow([
                inv.invoice_number,
                inv.party_name,
                inv.get_invoice_type_display(),
                inv.issue_date.isoformat(),
                inv.due_date.isoformat(),
                f"{inv.total_amount:.2f}",
                f"{inv.paid_amount:.2f}",
                f"{inv.outstanding_amount:.2f}",
                inv.get_status_display(),
                inv.days_overdue
            ])

        return response


class ExportExpensesCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="expenses_report.csv"'

        writer = csv.writer(response)
        writer.writerow(["Date", "Title", "Vendor", "Category", "Amount", "Payment Method", "Description"])

        for exp in Expense.objects.all():
            writer.writerow([
                exp.date.isoformat(),
                exp.title,
                exp.vendor,
                exp.get_category_display(),
                f"{exp.amount:.2f}",
                exp.payment_method,
                exp.description or ""
            ])

        return response


class ExportInventoryCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="inventory_valuation_report.csv"'

        writer = csv.writer(response)
        writer.writerow(["Warehouse Code", "Warehouse Name", "Country", "Product SKU", "Product Name", "Unit Cost", "Quantity On Hand", "Total Valuation"])

        for stock in WarehouseStock.objects.select_related("warehouse", "product").all():
            writer.writerow([
                stock.warehouse.code,
                stock.warehouse.name,
                stock.warehouse.country,
                stock.product.sku,
                stock.product.name,
                f"{stock.product.unit_cost:.2f}",
                stock.quantity_on_hand,
                f"{stock.total_valuation:.2f}"
            ])

        return response

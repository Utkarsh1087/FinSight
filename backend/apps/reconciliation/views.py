import io
import csv
from decimal import Decimal
from datetime import datetime
import pandas as pd
from django.utils import timezone
from django.db.models import Q
from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import (
    ReconciliationBatch,
    BankTransaction,
    CompanyTransaction,
    ReconciliationMatch,
    DiscrepancyException,
    BatchStatus,
    MatchStatus,
    ExceptionStatus,
)
from .serializers import (
    ReconciliationBatchSerializer,
    ReconciliationMatchSerializer,
    DiscrepancyExceptionSerializer,
    BankTransactionSerializer,
    CompanyTransactionSerializer,
)
from .engine import execute_reconciliation
from apps.accounts.permissions import IsFinanceUserOrAdmin, ReadOnlyOrFinanceAdmin
from apps.audit.utils import record_audit_log
from apps.notifications.utils import create_notification, NotificationType

class ReconciliationBatchListCreateView(generics.ListCreateAPIView):
    queryset = ReconciliationBatch.objects.all().order_by("-created_at")
    serializer_class = ReconciliationBatchSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        batch = serializer.save(created_by=self.request.user)
        record_audit_log(
            user=self.request.user,
            action="RECONCILIATION_BATCH_CREATED",
            entity_type="ReconciliationBatch",
            entity_id=str(batch.id),
            details=f"Created reconciliation batch '{batch.name}' for period {batch.period}"
        )

class ReconciliationBatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReconciliationBatch.objects.all()
    serializer_class = ReconciliationBatchSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]


class UploadAndParseCSVView(APIView):
    permission_classes = [IsFinanceUserOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            batch = ReconciliationBatch.objects.get(pk=pk)
        except ReconciliationBatch.DoesNotExist:
            return Response({"error": "Reconciliation batch not found."}, status=status.HTTP_404_NOT_FOUND)

        bank_file = request.FILES.get("bank_file")
        gl_file = request.FILES.get("gl_file")

        if not bank_file and not gl_file:
            return Response({"error": "Please provide at least one CSV file ('bank_file' or 'gl_file')."}, status=status.HTTP_400_BAD_REQUEST)

        created_bank = 0
        created_gl = 0

        # Parse Bank CSV
        if bank_file:
            try:
                content = bank_file.read().decode("utf-8-sig")
                reader = csv.DictReader(io.StringIO(content))
                
                # Check required columns
                required_cols = {"Date", "Amount"}
                if not required_cols.issubset(set(reader.fieldnames or [])):
                    return Response(
                        {"error": f"Invalid Bank CSV format. Required columns: Date, Amount (Found: {reader.fieldnames})"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                batch.bank_transactions.all().delete()
                bank_objects = []
                for row in reader:
                    date_val = datetime.strptime(row.get("Date", "").strip(), "%Y-%m-%d").date()
                    amt_val = Decimal(str(row.get("Amount", "0")).replace(",", "").strip())
                    desc_val = row.get("Description", row.get("Memo", "Bank Transaction")).strip()
                    ref_val = row.get("Reference", row.get("DocNo", "")).strip()

                    bank_objects.append(
                        BankTransaction(
                            batch=batch,
                            date=date_val,
                            description=desc_val,
                            reference=ref_val,
                            amount=amt_val,
                        )
                    )
                BankTransaction.objects.bulk_create(bank_objects)
                created_bank = len(bank_objects)
                batch.bank_file = bank_file
                batch.total_bank_rows = created_bank
            except Exception as e:
                return Response({"error": f"Failed to parse Bank CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Parse GL CSV
        if gl_file:
            try:
                content = gl_file.read().decode("utf-8-sig")
                reader = csv.DictReader(io.StringIO(content))

                required_cols = {"Date", "Amount"}
                if not required_cols.issubset(set(reader.fieldnames or [])):
                    return Response(
                        {"error": f"Invalid Company/GL CSV format. Required columns: Date, Amount (Found: {reader.fieldnames})"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                batch.company_transactions.all().delete()
                gl_objects = []
                for row in reader:
                    date_val = datetime.strptime(row.get("Date", "").strip(), "%Y-%m-%d").date()
                    amt_val = Decimal(str(row.get("Amount", "0")).replace(",", "").strip())
                    acct_val = row.get("Account", "1010 Cash — Operating").strip()
                    memo_val = row.get("Memo", row.get("Description", row.get("Vendor", "GL Entry"))).strip()
                    doc_val = row.get("DocNo", row.get("Invoice Number", row.get("Reference", ""))).strip()

                    gl_objects.append(
                        CompanyTransaction(
                            batch=batch,
                            date=date_val,
                            account=acct_val,
                            memo=memo_val,
                            doc_no=doc_val,
                            amount=amt_val,
                        )
                    )
                CompanyTransaction.objects.bulk_create(gl_objects)
                created_gl = len(gl_objects)
                batch.gl_file = gl_file
                batch.total_gl_rows = created_gl
            except Exception as e:
                return Response({"error": f"Failed to parse GL CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        batch.save()
        record_audit_log(
            user=request.user,
            action="CSV_UPLOADED",
            entity_type="ReconciliationBatch",
            entity_id=str(batch.id),
            details=f"Uploaded files for batch '{batch.name}' (Bank rows: {created_bank}, GL rows: {created_gl})"
        )

        return Response({
            "message": "Files uploaded and parsed successfully.",
            "bank_rows_imported": created_bank,
            "gl_rows_imported": created_gl,
            "batch": ReconciliationBatchSerializer(batch).data
        })


class RunReconciliationView(APIView):
    permission_classes = [IsFinanceUserOrAdmin]

    def post(self, request, pk):
        try:
            batch = ReconciliationBatch.objects.get(pk=pk)
        except ReconciliationBatch.DoesNotExist:
            return Response({"error": "Reconciliation batch not found."}, status=status.HTTP_404_NOT_FOUND)

        if batch.bank_transactions.count() == 0 or batch.company_transactions.count() == 0:
            return Response(
                {"error": "Both Bank and General Ledger transactions must be loaded before running reconciliation."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            completed_batch = execute_reconciliation(batch)
            
            record_audit_log(
                user=request.user,
                action="RECONCILIATION_RUN",
                entity_type="ReconciliationBatch",
                entity_id=str(batch.id),
                details=f"Ran reconciliation on '{batch.name}': {completed_batch.matched_count} matches, {completed_batch.exception_count} exceptions, proof difference: ₹{completed_batch.unreconciled_difference}"
            )

            create_notification(
                title="Reconciliation Completed",
                message=f"Batch '{batch.name}' completed: {completed_batch.matched_count} transactions matched, {completed_batch.exception_count} discrepancies flagged.",
                notification_type=NotificationType.RECONCILIATION_COMPLETED,
                metadata={"batch_id": batch.id}
            )

            return Response({
                "message": "Reconciliation engine executed successfully.",
                "batch": ReconciliationBatchSerializer(completed_batch).data
            })
        except Exception as e:
            return Response({"error": f"Reconciliation execution error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReconciliationMatchListView(generics.ListAPIView):
    serializer_class = ReconciliationMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        batch_id = self.kwargs.get("batch_id")
        qs = ReconciliationMatch.objects.filter(batch_id=batch_id).select_related("bank_tx", "company_tx")
        
        pass_name = self.request.query_params.get("pass_name")
        status_val = self.request.query_params.get("status")
        min_conf = self.request.query_params.get("min_confidence")
        search = self.request.query_params.get("search")

        if pass_name:
            qs = qs.filter(pass_name__iexact=pass_name)
        if status_val:
            qs = qs.filter(status__iexact=status_val)
        if min_conf:
            try:
                qs = qs.filter(confidence_score__gte=float(min_conf))
            except ValueError:
                pass
        if search:
            qs = qs.filter(
                Q(bank_tx__description__icontains=search) |
                Q(company_tx__memo__icontains=search) |
                Q(bank_tx__reference__icontains=search) |
                Q(company_tx__doc_no__icontains=search)
            )
        return qs


class ApproveMatchView(APIView):
    permission_classes = [IsFinanceUserOrAdmin]

    def post(self, request, pk):
        try:
            match = ReconciliationMatch.objects.get(pk=pk)
            match.status = MatchStatus.APPROVED
            match.reviewed_by = request.user
            match.reviewed_at = timezone.now()
            match.review_notes = request.data.get("notes", "")
            match.save()

            record_audit_log(
                user=request.user,
                action="MATCH_APPROVED",
                entity_type="ReconciliationMatch",
                entity_id=str(match.id),
                details=f"Approved match #{match.id} (Bank {match.bank_tx_id} <-> GL {match.company_tx_id})"
            )
            return Response(ReconciliationMatchSerializer(match).data)
        except ReconciliationMatch.DoesNotExist:
            return Response({"error": "Match record not found."}, status=status.HTTP_404_NOT_FOUND)


class RejectMatchView(APIView):
    permission_classes = [IsFinanceUserOrAdmin]

    def post(self, request, pk):
        try:
            match = ReconciliationMatch.objects.get(pk=pk)
            match.status = MatchStatus.REJECTED
            match.reviewed_by = request.user
            match.reviewed_at = timezone.now()
            match.review_notes = request.data.get("notes", "Rejected by user")
            match.save()

            # Mark transactions back as unreconciled
            match.bank_tx.is_reconciled = False
            match.bank_tx.save()
            match.company_tx.is_reconciled = False
            match.company_tx.save()

            record_audit_log(
                user=request.user,
                action="MATCH_REJECTED",
                entity_type="ReconciliationMatch",
                entity_id=str(match.id),
                details=f"Rejected match #{match.id}: {match.review_notes}"
            )
            return Response(ReconciliationMatchSerializer(match).data)
        except ReconciliationMatch.DoesNotExist:
            return Response({"error": "Match record not found."}, status=status.HTTP_404_NOT_FOUND)


class DiscrepancyExceptionListView(generics.ListAPIView):
    serializer_class = DiscrepancyExceptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        batch_id = self.kwargs.get("batch_id")
        qs = DiscrepancyException.objects.filter(batch_id=batch_id).select_related("bank_tx", "company_tx")

        side = self.request.query_params.get("side")
        category = self.request.query_params.get("category")
        status_val = self.request.query_params.get("status")
        search = self.request.query_params.get("search")

        if side:
            qs = qs.filter(side__iexact=side)
        if category:
            qs = qs.filter(category__iexact=category)
        if status_val:
            qs = qs.filter(status__iexact=status_val)
        if search:
            qs = qs.filter(
                Q(reason__icontains=search) |
                Q(suggested_action__icontains=search) |
                Q(category__icontains=search) |
                Q(bank_tx__description__icontains=search) |
                Q(company_tx__memo__icontains=search)
            )
        return qs


class ResolveExceptionView(APIView):
    permission_classes = [IsFinanceUserOrAdmin]

    def post(self, request, pk):
        try:
            exc = DiscrepancyException.objects.get(pk=pk)
            exc.status = ExceptionStatus.RESOLVED
            exc.reviewed_by = request.user
            exc.reviewed_at = timezone.now()
            exc.review_notes = request.data.get("notes", "Resolved")
            exc.save()

            record_audit_log(
                user=request.user,
                action="EXCEPTION_RESOLVED",
                entity_type="DiscrepancyException",
                entity_id=str(exc.id),
                details=f"Resolved exception #{exc.id} ({exc.category}): {exc.review_notes}"
            )
            return Response(DiscrepancyExceptionSerializer(exc).data)
        except DiscrepancyException.DoesNotExist:
            return Response({"error": "Exception record not found."}, status=status.HTTP_404_NOT_FOUND)

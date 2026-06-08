from rest_framework import serializers
from .models import (
    ReconciliationBatch,
    BankTransaction,
    CompanyTransaction,
    ReconciliationMatch,
    DiscrepancyException,
)

class BankTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankTransaction
        fields = ["id", "batch", "date", "description", "reference", "amount", "is_reconciled", "cents_key"]

class CompanyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyTransaction
        fields = ["id", "batch", "date", "account", "memo", "doc_no", "amount", "is_reconciled", "cents_key"]

class ReconciliationMatchSerializer(serializers.ModelSerializer):
    bank_tx = BankTransactionSerializer(read_only=True)
    company_tx = CompanyTransactionSerializer(read_only=True)
    reviewed_by_email = serializers.CharField(source="reviewed_by.email", read_only=True)

    class Meta:
        model = ReconciliationMatch
        fields = [
            "id", "batch", "bank_tx", "company_tx", "pass_name",
            "confidence_score", "amount_delta", "date_delta",
            "fuzzy_score", "status", "review_notes",
            "reviewed_by_email", "reviewed_at", "created_at"
        ]

class DiscrepancyExceptionSerializer(serializers.ModelSerializer):
    bank_tx = BankTransactionSerializer(read_only=True)
    company_tx = CompanyTransactionSerializer(read_only=True)
    reviewed_by_email = serializers.CharField(source="reviewed_by.email", read_only=True)

    class Meta:
        model = DiscrepancyException
        fields = [
            "id", "batch", "side", "bank_tx", "company_tx",
            "category", "amount", "reason", "suggested_action",
            "rank", "status", "review_notes",
            "reviewed_by_email", "reviewed_at", "created_at"
        ]

class ReconciliationBatchSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = ReconciliationBatch
        fields = [
            "id", "name", "period", "status", "bank_file", "gl_file",
            "total_bank_rows", "total_gl_rows", "matched_count", "exception_count",
            "opening_balance", "bank_closing_balance", "gl_closing_balance",
            "adjusted_bank_balance", "adjusted_gl_balance", "unreconciled_difference",
            "match_rate", "timing_window_days", "tolerance_amount", "fuzzy_threshold",
            "created_by_email", "created_at", "completed_at"
        ]
        read_only_fields = [
            "id", "status", "total_bank_rows", "total_gl_rows", "matched_count",
            "exception_count", "bank_closing_balance", "gl_closing_balance",
            "adjusted_bank_balance", "adjusted_gl_balance", "unreconciled_difference",
            "match_rate", "created_by_email", "created_at", "completed_at"
        ]

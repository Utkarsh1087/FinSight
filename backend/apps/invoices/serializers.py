from rest_framework import serializers
from .models import Invoice, InvoicePayment

class InvoicePaymentSerializer(serializers.ModelSerializer):
    recorded_by_email = serializers.CharField(source="recorded_by.email", read_only=True)

    class Meta:
        model = InvoicePayment
        fields = [
            "id", "invoice", "payment_date", "amount",
            "payment_method", "reference_no", "notes",
            "recorded_by_email", "created_at"
        ]
        read_only_fields = ["id", "recorded_by_email", "created_at"]

class InvoiceSerializer(serializers.ModelSerializer):
    payments = InvoicePaymentSerializer(many=True, read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    created_by_email = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "invoice_number", "party_name", "invoice_type",
            "issue_date", "due_date", "total_amount", "paid_amount",
            "outstanding_amount", "days_overdue", "status",
            "description", "reference", "payments",
            "created_by_email", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "outstanding_amount", "days_overdue", "created_by_email", "created_at", "updated_at"]

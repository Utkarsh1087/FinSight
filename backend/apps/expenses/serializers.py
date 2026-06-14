from rest_framework import serializers
from .models import Expense, ExpenseCategory

class ExpenseSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source="created_by.email", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id", "title", "vendor", "amount", "date",
            "category", "category_display", "description",
            "payment_method", "receipt_doc", "created_by_email",
            "created_at"
        ]
        read_only_fields = ["id", "created_by_email", "created_at"]

from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Expense, ExpenseCategory
from .serializers import ExpenseSerializer
from apps.accounts.permissions import ReadOnlyOrFinanceAdmin
from apps.audit.utils import record_audit_log
from apps.controls.rules import evaluate_financial_controls

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

    def get_queryset(self):
        qs = Expense.objects.all()
        category = self.request.query_params.get("category")
        vendor = self.request.query_params.get("vendor")
        search = self.request.query_params.get("search")

        if category:
            qs = qs.filter(category__iexact=category)
        if vendor:
            qs = qs.filter(vendor__icontains=vendor)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(vendor__icontains=search) |
                Q(description__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        expense = serializer.save(created_by=self.request.user)
        record_audit_log(
            user=self.request.user,
            action="EXPENSE_RECORDED",
            entity_type="Expense",
            entity_id=str(expense.id),
            details=f"Recorded expense '{expense.title}' for ₹{expense.amount} ({expense.get_category_display()})"
        )
        evaluate_financial_controls(expense=expense)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

class ExpenseAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_amount = Expense.objects.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        total_count = Expense.objects.count()

        # Group by Category
        categories = (
            Expense.objects.values("category")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )

        category_data = [
            {
                "category": item["category"],
                "name": dict(ExpenseCategory.choices).get(item["category"], item["category"]),
                "total": float(item["total"]),
                "count": item["count"],
            }
            for item in categories
        ]

        # Group by Month
        monthly = (
            Expense.objects.annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("month")
        )

        monthly_data = [
            {
                "month": item["month"].strftime("%b %Y") if item["month"] else "N/A",
                "total": float(item["total"]),
                "count": item["count"],
            }
            for item in monthly
        ]

        return Response({
            "total_expenses": float(total_amount),
            "expense_count": total_count,
            "by_category": category_data,
            "monthly_trends": monthly_data,
        })

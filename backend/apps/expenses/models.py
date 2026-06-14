from django.db import models
from django.conf import settings
from datetime import date

class ExpenseCategory(models.TextChoices):
    TRAVEL = "TRAVEL", "Travel & Entertainment"
    SOFTWARE = "SOFTWARE", "Software & Cloud Services"
    LOGISTICS = "LOGISTICS", "Logistics & Shipping"
    OFFICE = "OFFICE", "Office & Facilities"
    INVENTORY = "INVENTORY", "Inventory Procurement"
    SALARY = "SALARY", "Payroll & Contractor Fees"
    OTHER = "OTHER", "Other Operational Expenses"

class Expense(models.Model):
    title = models.CharField(max_length=200)
    vendor = models.CharField(max_length=200, db_index=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField(default=date.today, db_index=True)
    category = models.CharField(
        max_length=50,
        choices=ExpenseCategory.choices,
        default=ExpenseCategory.OFFICE,
        db_index=True
    )
    description = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=100, default="Corporate Card")
    receipt_doc = models.FileField(upload_to="expenses/receipts/", blank=True, null=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_expenses"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f"{self.title} - {self.vendor} (₹{self.amount})"

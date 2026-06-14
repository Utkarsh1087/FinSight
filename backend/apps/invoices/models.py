from django.db import models
from django.conf import settings
from decimal import Decimal
from datetime import date

class InvoiceStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PARTIALLY_PAID = "PARTIALLY_PAID", "Partially Paid"
    PAID = "PAID", "Paid"
    OVERDUE = "OVERDUE", "Overdue"
    DISPUTED = "DISPUTED", "Disputed"

class InvoiceType(models.TextChoices):
    PAYABLE = "ACCOUNTS_PAYABLE", "Accounts Payable (Vendor)"
    RECEIVABLE = "ACCOUNTS_RECEIVABLE", "Accounts Receivable (Customer)"

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=100, unique=True, db_index=True)
    party_name = models.CharField(max_length=200, db_index=True) # Vendor or Customer
    invoice_type = models.CharField(
        max_length=30,
        choices=InvoiceType.choices,
        default=InvoiceType.PAYABLE,
        db_index=True
    )
    issue_date = models.DateField(default=date.today, db_index=True)
    due_date = models.DateField(db_index=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(
        max_length=30,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.PENDING,
        db_index=True
    )
    description = models.TextField(blank=True, null=True)
    reference = models.CharField(max_length=100, blank=True, null=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_invoices"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-due_date", "-id"]

    def __str__(self):
        return f"Invoice #{self.invoice_number} - {self.party_name} [₹{self.total_amount}]"

    @property
    def outstanding_amount(self) -> Decimal:
        return max(Decimal("0.00"), self.total_amount - self.paid_amount)

    @property
    def days_overdue(self) -> int:
        if self.status == InvoiceStatus.PAID:
            return 0
        today = date.today()
        if today > self.due_date:
            return (today - self.due_date).days
        return 0

    def update_status(self):
        if self.paid_amount >= self.total_amount:
            self.status = InvoiceStatus.PAID
        elif self.paid_amount > Decimal("0.00"):
            if date.today() > self.due_date:
                self.status = InvoiceStatus.OVERDUE
            else:
                self.status = InvoiceStatus.PARTIALLY_PAID
        else:
            if date.today() > self.due_date:
                self.status = InvoiceStatus.OVERDUE
            else:
                self.status = InvoiceStatus.PENDING


class InvoicePayment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    payment_date = models.DateField(default=date.today)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.CharField(max_length=50, default="Bank Transfer") # EFT, Wire, Check, Credit Card
    reference_no = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date", "-id"]

    def __str__(self):
        return f"Payment ₹{self.amount} on {self.invoice.invoice_number} ({self.payment_date})"

from django.db import models
from django.conf import settings
from decimal import Decimal

class RuleType(models.TextChoices):
    HIGH_PAYMENT = "HIGH_PAYMENT", "Payment Threshold Violation (> ₹100k)"
    DUPLICATE_TRANSACTION = "DUPLICATE_TRANSACTION", "Duplicate Transaction / Payment Flag"
    AMOUNT_MISMATCH = "AMOUNT_MISMATCH", "Invoice vs Bank Amount Mismatch"
    OVERDUE_INVOICE = "OVERDUE_INVOICE", "Critical Overdue Invoice Alert"
    UNMATCHED_NO_INVOICE = "UNMATCHED_NO_INVOICE", "Unmatched Bank Transaction without Invoice"

class ViolationSeverity(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    CRITICAL = "CRITICAL", "Critical"

class ViolationStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    INVESTIGATING = "INVESTIGATING", "Investigating"
    RESOLVED = "RESOLVED", "Resolved"
    IGNORED = "IGNORED", "Ignored / False Positive"

class ControlRule(models.Model):
    name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=50, choices=RuleType.choices, unique=True, db_index=True)
    description = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=ViolationSeverity.choices,
        default=ViolationSeverity.HIGH
    )
    threshold_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("100000.00"))
    is_enabled = models.BooleanField(default=True, db_index=True)
    requires_admin_approval = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        status = "Active" if self.is_enabled else "Disabled"
        return f"{self.name} [{self.get_severity_display()}] — {status}"


class ControlViolation(models.Model):
    rule = models.ForeignKey(ControlRule, on_delete=models.CASCADE, related_name="violations")
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=ViolationSeverity.choices,
        default=ViolationSeverity.HIGH,
        db_index=True
    )
    status = models.CharField(
        max_length=30,
        choices=ViolationStatus.choices,
        default=ViolationStatus.OPEN,
        db_index=True
    )
    related_entity_type = models.CharField(max_length=100, blank=True, null=True) # Invoice, BankTransaction, Expense, etc.
    related_entity_id = models.CharField(max_length=100, blank=True, null=True)
    assigned_reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_violations"
    )
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_violations"
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Violation [{self.severity}] {self.title} ({self.status})"

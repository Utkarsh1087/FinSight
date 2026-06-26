from django.db import models
from django.conf import settings

class NotificationType(models.TextChoices):
    OVERDUE_INVOICE = "OVERDUE_INVOICE", "Overdue Invoice"
    DUPLICATE_PAYMENT = "DUPLICATE_PAYMENT", "Duplicate Payment"
    LARGE_TRANSACTION = "LARGE_TRANSACTION", "Large Transaction"
    CONTROL_VIOLATION = "CONTROL_VIOLATION", "Control Violation"
    LOW_INVENTORY = "LOW_INVENTORY", "Low Inventory"
    RECONCILIATION_COMPLETED = "RECONCILIATION_COMPLETED", "Reconciliation Completed"
    SYSTEM = "SYSTEM", "System Alert"

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications"
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True
    )
    is_read = models.BooleanField(default=False, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"

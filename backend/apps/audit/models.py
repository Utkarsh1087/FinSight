from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs"
    )
    user_email = models.CharField(max_length=255, blank=True, null=True)
    user_role = models.CharField(max_length=50, blank=True, null=True)
    action = models.CharField(max_length=100, db_index=True)
    entity_type = models.CharField(max_length=100, db_index=True)
    entity_id = models.CharField(max_length=100, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at", "action"]),
            models.Index(fields=["entity_type", "entity_id"]),
        ]

    def __str__(self):
        actor = self.user_email or (self.user.email if self.user else "System")
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {actor} — {self.action} ({self.entity_type})"

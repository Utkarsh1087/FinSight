from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "id", "user_email", "user_role", "action",
            "entity_type", "entity_id", "details",
            "metadata", "ip_address", "created_at"
        ]
        read_only_fields = fields

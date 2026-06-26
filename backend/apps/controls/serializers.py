from rest_framework import serializers
from .models import ControlRule, ControlViolation

class ControlRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlRule
        fields = [
            "id", "name", "rule_type", "description",
            "severity", "threshold_amount", "is_enabled",
            "requires_admin_approval", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

class ControlViolationSerializer(serializers.ModelSerializer):
    rule_name = serializers.CharField(source="rule.name", read_only=True)
    rule_type = serializers.CharField(source="rule.rule_type", read_only=True)
    assigned_reviewer_email = serializers.CharField(source="assigned_reviewer.email", read_only=True)
    resolved_by_email = serializers.CharField(source="resolved_by.email", read_only=True)

    class Meta:
        model = ControlViolation
        fields = [
            "id", "rule", "rule_name", "rule_type",
            "title", "description", "severity", "status",
            "related_entity_type", "related_entity_id",
            "assigned_reviewer", "assigned_reviewer_email",
            "resolution_notes", "resolved_by_email",
            "resolved_at", "created_at"
        ]
        read_only_fields = ["id", "rule_name", "rule_type", "assigned_reviewer_email", "resolved_by_email", "resolved_at", "created_at"]

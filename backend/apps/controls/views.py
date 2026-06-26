from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ControlRule, ControlViolation, ViolationStatus
from .serializers import ControlRuleSerializer, ControlViolationSerializer
from .rules import ensure_default_rules
from apps.accounts.permissions import IsAdminRole, IsFinanceUserOrAdmin, ReadOnlyOrFinanceAdmin
from apps.audit.utils import record_audit_log

class ControlRuleListCreateView(generics.ListCreateAPIView):
    queryset = ControlRule.objects.all()
    serializer_class = ControlRuleSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

    def get_queryset(self):
        ensure_default_rules()
        return ControlRule.objects.all()

    def perform_create(self, serializer):
        rule = serializer.save()
        record_audit_log(
            user=self.request.user,
            action="CONTROL_RULE_CREATED",
            entity_type="ControlRule",
            entity_id=str(rule.id),
            details=f"Created control rule '{rule.name}'"
        )

class ControlRuleToggleView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            rule = ControlRule.objects.get(pk=pk)
            is_enabled = request.data.get("is_enabled")
            if is_enabled is not None:
                rule.is_enabled = bool(is_enabled)
            threshold = request.data.get("threshold_amount")
            if threshold is not None:
                rule.threshold_amount = threshold
            rule.save()

            record_audit_log(
                user=request.user,
                action="CONTROL_RULE_UPDATED",
                entity_type="ControlRule",
                entity_id=str(rule.id),
                details=f"Updated rule '{rule.name}': Enabled={rule.is_enabled}, Threshold={rule.threshold_amount}"
            )
            return Response(ControlRuleSerializer(rule).data)
        except ControlRule.DoesNotExist:
            return Response({"error": "Control rule not found."}, status=status.HTTP_404_NOT_FOUND)

class ControlViolationListView(generics.ListAPIView):
    serializer_class = ControlViolationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ControlViolation.objects.select_related("rule", "assigned_reviewer", "resolved_by").all()
        status_val = self.request.query_params.get("status")
        severity = self.request.query_params.get("severity")
        search = self.request.query_params.get("search")
        if status_val:
            qs = qs.filter(status__iexact=status_val)
        if severity:
            qs = qs.filter(severity__iexact=severity)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(rule__name__icontains=search) |
                Q(resolution_notes__icontains=search)
            )
        return qs

class ControlViolationResolveView(APIView):
    permission_classes = [IsFinanceUserOrAdmin]

    def post(self, request, pk):
        try:
            violation = ControlViolation.objects.get(pk=pk)
            action = request.data.get("action", "RESOLVE") # RESOLVE, IGNORE, INVESTIGATE
            notes = request.data.get("notes", "")

            if action == "IGNORE":
                violation.status = ViolationStatus.IGNORED
            elif action == "INVESTIGATE":
                violation.status = ViolationStatus.INVESTIGATING
            else:
                violation.status = ViolationStatus.RESOLVED

            violation.resolution_notes = notes
            violation.resolved_by = request.user
            violation.resolved_at = timezone.now()
            violation.save()

            record_audit_log(
                user=request.user,
                action="VIOLATION_UPDATED",
                entity_type="ControlViolation",
                entity_id=str(violation.id),
                details=f"Updated violation #{violation.id} to {violation.status}: {notes}"
            )
            return Response(ControlViolationSerializer(violation).data)
        except ControlViolation.DoesNotExist:
            return Response({"error": "Violation record not found."}, status=status.HTTP_404_NOT_FOUND)

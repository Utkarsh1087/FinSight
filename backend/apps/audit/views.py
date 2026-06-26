from rest_framework import generics, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all().order_by("-created_at")
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get("action")
        entity_type = self.request.query_params.get("entity_type")
        search = self.request.query_params.get("search")

        if action:
            qs = qs.filter(action__icontains=action)
        if entity_type:
            qs = qs.filter(entity_type__iexact=entity_type)
        if search:
            qs = qs.filter(details__icontains=search)
        return qs

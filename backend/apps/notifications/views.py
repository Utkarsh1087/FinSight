from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return notifications for the specific user + broadcast notifications (user is null)
        return Notification.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True)
        ).order_by("-created_at")

class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            Q(user=request.user) | Q(user__isnull=True)
        ).update(is_read=True)
        return Response({"message": "All notifications marked as read."})

class MarkSingleNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(
                Q(pk=pk) & (Q(user=request.user) | Q(user__isnull=True))
            )
            notif.is_read = True
            notif.save()
            return Response(NotificationSerializer(notif).data)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

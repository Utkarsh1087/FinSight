from django.urls import path
from .views import (
    NotificationListView,
    MarkAllNotificationsReadView,
    MarkSingleNotificationReadView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("mark-all-read/", MarkAllNotificationsReadView.as_view(), name="notification-mark-all-read"),
    path("<int:pk>/read/", MarkSingleNotificationReadView.as_view(), name="notification-mark-single-read"),
]

from .models import Notification, NotificationType

def create_notification(title, message, notification_type=NotificationType.SYSTEM, user=None, metadata=None):
    """
    Helper to trigger an in-app notification.
    """
    try:
        return Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            metadata=metadata or {}
        )
    except Exception as e:
        print(f"[NOTIFICATION CREATION ERROR] {e}")
        return None

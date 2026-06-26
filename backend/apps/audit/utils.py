from .models import AuditLog

def record_audit_log(user=None, action="", entity_type="", entity_id=None, details="", metadata=None, ip_address=None):
    """
    Utility to record an immutable audit log entry.
    """
    try:
        user_email = user.email if user and hasattr(user, "email") else "system@finsight.internal"
        user_role = user.role if user and hasattr(user, "role") else "SYSTEM"
        
        # Only assign user relation if it is an authenticated User instance
        user_instance = user if (user and hasattr(user, "is_authenticated") and user.is_authenticated) else None

        AuditLog.objects.create(
            user=user_instance,
            user_email=user_email,
            user_role=user_role,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else "",
            details=details,
            metadata=metadata or {},
            ip_address=ip_address
        )
    except Exception as e:
        # Prevent audit log failure from crashing transactions, but print for logging
        print(f"[AUDIT LOGGING ERROR] {e}")

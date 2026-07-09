from rest_framework import permissions
from .models import UserRole

class IsAdminRole(permissions.BasePermission):
    """Allows access only to Admin role users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_admin_role
        )

class IsFinanceUserOrAdmin(permissions.BasePermission):
    """Allows access to Finance Users and Admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_finance_role
        )

class ReadOnlyOrFinanceAdmin(permissions.BasePermission):
    """Allows safe methods (GET, HEAD, OPTIONS) to all authenticated users, but mutations only to Finance/Admin."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_finance_role

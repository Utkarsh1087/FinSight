from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    UserListView,
    UpdateUserRoleView,
    OrganizationDetailView,
    TeamMemberListCreateView,
    TeamMemberDetailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("users/", UserListView.as_view(), name="auth-user-list"),
    path("users/<int:pk>/role/", UpdateUserRoleView.as_view(), name="auth-user-role-update"),
    
    # Organization & Team Management (Admin Only)
    path("organization/", OrganizationDetailView.as_view(), name="org-detail"),
    path("organization/members/", TeamMemberListCreateView.as_view(), name="org-members-list-create"),
    path("organization/members/<int:pk>/", TeamMemberDetailView.as_view(), name="org-member-detail"),
]

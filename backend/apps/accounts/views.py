from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from .models import User, UserRole, Organization
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    OrganizationSerializer,
    TeamMemberSerializer,
    InviteMemberSerializer
)
from .permissions import IsAdminRole
from apps.audit.utils import record_audit_log

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        record_audit_log(
            user=user,
            action="USER_REGISTERED",
            entity_type="User",
            entity_id=str(user.id),
            details=f"New organization founder registered: {user.email} with Admin role",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        record_audit_log(
            user=user,
            action="USER_LOGIN",
            entity_type="User",
            entity_id=str(user.id),
            details=f"User login successful: {user.email}",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        record_audit_log(
            user=request.user,
            action="USER_LOGOUT",
            entity_type="User",
            entity_id=str(request.user.id),
            details=f"User logout: {request.user.email}",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

class UpdateUserRoleView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        new_role = request.data.get("role")
        if new_role not in UserRole.values:
            return Response({"error": f"Invalid role. Must be one of: {UserRole.values}"}, status=status.HTTP_400_BAD_REQUEST)

        old_role = user.role
        user.role = new_role
        user.save()

        record_audit_log(
            user=request.user,
            action="USER_ROLE_CHANGED",
            entity_type="User",
            entity_id=str(user.id),
            details=f"Changed role of {user.email} from {old_role} to {new_role}",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response(UserSerializer(user).data)

class OrganizationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        org = request.user.organization
        if not org:
            org, _ = Organization.objects.get_or_create(
                name="Acme Global Corporation",
                defaults={"slug": "acme-global"}
            )
            request.user.organization = org
            request.user.save()
        return Response(OrganizationSerializer(org).data)

    def patch(self, request):
        if not request.user.is_admin_role:
            return Response({"error": "Only Administrators can modify organization settings."}, status=status.HTTP_403_FORBIDDEN)
        org = request.user.organization
        if not org:
            org, _ = Organization.objects.get_or_create(
                name="Acme Global Corporation",
                defaults={"slug": "acme-global"}
            )
            request.user.organization = org
            request.user.save()
        serializer = OrganizationSerializer(org, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        record_audit_log(
            user=request.user,
            action="ORGANIZATION_UPDATED",
            entity_type="Organization",
            entity_id=str(org.id),
            details=f"Updated company profile: {org.name}",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response(serializer.data)

class TeamMemberListCreateView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        org = request.user.organization
        if org:
            members = User.objects.filter(organization=org).order_by("-created_at")
        else:
            members = User.objects.all().order_by("-created_at")
        return Response(TeamMemberSerializer(members, many=True).data)

    def post(self, request):
        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        email = data["email"].strip().lower()
        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        username = email.split("@")[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        org = request.user.organization
        if not org:
            org, _ = Organization.objects.get_or_create(
                name="Acme Global Corporation",
                defaults={"slug": "acme-global"}
            )
            request.user.organization = org
            request.user.save()

        user = User.objects.create_user(
            email=email,
            username=username,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role=data.get("role", UserRole.FINANCE_USER),
            department=data.get("department", "Finance Operations"),
            organization=org
        )
        user.set_password(data.get("password", "Member@123"))
        user.save()

        record_audit_log(
            user=request.user,
            action="TEAM_MEMBER_INVITED",
            entity_type="User",
            entity_id=str(user.id),
            details=f"Admin {request.user.email} added team member {user.email} with role {user.role}",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response(TeamMemberSerializer(user).data, status=status.HTTP_201_CREATED)

class TeamMemberDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            member = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Team member not found."}, status=status.HTTP_404_NOT_FOUND)

        if member.id == request.user.id and request.data.get("role") and request.data.get("role") != UserRole.ADMIN:
            return Response({"error": "You cannot remove your own Admin role."}, status=status.HTTP_400_BAD_REQUEST)

        new_role = request.data.get("role")
        if new_role and new_role not in UserRole.values:
            return Response({"error": f"Invalid role. Must be one of: {UserRole.values}"}, status=status.HTTP_400_BAD_REQUEST)

        old_role = member.role
        if new_role:
            member.role = new_role
        if "department" in request.data:
            member.department = request.data["department"]
        if "is_active" in request.data:
            member.is_active = request.data["is_active"]
        member.save()

        record_audit_log(
            user=request.user,
            action="TEAM_MEMBER_UPDATED",
            entity_type="User",
            entity_id=str(member.id),
            details=f"Admin {request.user.email} updated {member.email}: role {old_role} -> {member.role}",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response(TeamMemberSerializer(member).data)

    def delete(self, request, pk):
        try:
            member = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Team member not found."}, status=status.HTTP_404_NOT_FOUND)

        if member.id == request.user.id:
            return Response({"error": "You cannot remove yourself from the organization."}, status=status.HTTP_400_BAD_REQUEST)

        email = member.email
        member.delete()

        record_audit_log(
            user=request.user,
            action="TEAM_MEMBER_REMOVED",
            entity_type="User",
            entity_id=str(pk),
            details=f"Admin {request.user.email} removed member {email} from organization",
            ip_address=request.META.get("REMOTE_ADDR")
        )
        return Response({"message": f"Member {email} removed successfully."}, status=status.HTTP_200_OK)

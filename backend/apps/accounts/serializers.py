from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserRole, Organization

class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "country", "currency", "tax_id", "member_count", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "member_count"]

    def get_member_count(self, obj):
        return obj.members.count()

class UserSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "role", "department", "phone", "organization", "organization_name", "created_at"
        ]
        read_only_fields = ["id", "created_at", "organization_name"]

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "role", "department", "phone", "is_active", "created_at"
        ]
        read_only_fields = ["id", "created_at"]

class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True, default="")
    last_name = serializers.CharField(required=False, allow_blank=True, default="")
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.FINANCE_USER)
    department = serializers.CharField(required=False, allow_blank=True, default="Finance Operations")
    password = serializers.CharField(required=False, allow_blank=True, default="Member@123")

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default="My Company")

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "password", "role", "department", "phone", "company_name"
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        company_name = validated_data.pop("company_name", "My Company") or "My Company"
        
        # Create organization for new company registration
        slug = company_name.lower().replace(" ", "-")[:40]
        org, _ = Organization.objects.get_or_create(
            name=company_name,
            defaults={"slug": f"{slug}-{User.objects.count() + 1}"}
        )
        
        user = User.objects.create_user(**validated_data)
        user.organization = org
        # Company registrar becomes Admin
        user.role = UserRole.ADMIN
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                # Try finding by email
                try:
                    user_obj = User.objects.get(email=email)
                    if user_obj.check_password(password):
                        user = user_obj
                except User.DoesNotExist:
                    pass
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            if not user.is_active:
                raise serializers.ValidationError("Account is inactive.")
            data["user"] = user
            return data
        raise serializers.ValidationError("Must provide email and password.")

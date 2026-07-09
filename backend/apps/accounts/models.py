from django.contrib.auth.models import AbstractUser
from django.db import models

class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    FINANCE_USER = "FINANCE_USER", "Finance User"
    VIEWER = "VIEWER", "Viewer"

class Organization(models.Model):
    name = models.CharField(max_length=200, default="Acme Global Corporation")
    slug = models.SlugField(max_length=200, unique=True, default="acme-corp")
    country = models.CharField(max_length=100, default="India")
    currency = models.CharField(max_length=10, default="INR")
    tax_id = models.CharField(max_length=50, blank=True, null=True, default="GSTIN27AABCU9603R1ZM")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.currency})"

class User(AbstractUser):
    email = models.EmailField(unique=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="members"
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.FINANCE_USER,
        db_index=True
    )
    department = models.CharField(max_length=100, default="Finance Operations")
    phone = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_admin_role(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    @property
    def is_finance_role(self):
        return self.role in [UserRole.ADMIN, UserRole.FINANCE_USER] or self.is_superuser

    @property
    def is_viewer_role(self):
        return self.role == UserRole.VIEWER

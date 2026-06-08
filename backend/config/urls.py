"""
FinSight URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/reconciliation/", include("apps.reconciliation.urls")),
    path("api/invoices/", include("apps.invoices.urls")),
    path("api/expenses/", include("apps.expenses.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/controls/", include("apps.controls.urls")),
    path("api/ai/", include("apps.ai.urls")),
    path("api/audit-logs/", include("apps.audit.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

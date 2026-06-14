from django.urls import path
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseAnalyticsView,
)

urlpatterns = [
    path("", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("analytics/", ExpenseAnalyticsView.as_view(), name="expense-analytics"),
    path("<int:pk>/", ExpenseDetailView.as_view(), name="expense-detail"),
]

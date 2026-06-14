from django.urls import path
from .views import (
    InvoiceListCreateView,
    InvoiceDetailView,
    RecordInvoicePaymentView,
    InvoiceSummaryStatsView,
)

urlpatterns = [
    path("", InvoiceListCreateView.as_view(), name="invoice-list-create"),
    path("summary/", InvoiceSummaryStatsView.as_view(), name="invoice-summary-stats"),
    path("<int:pk>/", InvoiceDetailView.as_view(), name="invoice-detail"),
    path("<int:pk>/payments/", RecordInvoicePaymentView.as_view(), name="invoice-record-payment"),
]

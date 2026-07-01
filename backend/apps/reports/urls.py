from django.urls import path
from .views import (
    FinancialOverviewReportView,
    ExportReconciliationCSVView,
    ExportInvoicesCSVView,
    ExportExpensesCSVView,
    ExportInventoryCSVView,
)

urlpatterns = [
    path("overview/", FinancialOverviewReportView.as_view(), name="report-overview"),
    path("reconciliation/<int:batch_id>/export-csv/", ExportReconciliationCSVView.as_view(), name="report-export-recon-csv"),
    path("invoices/export-csv/", ExportInvoicesCSVView.as_view(), name="report-export-invoices-csv"),
    path("expenses/export-csv/", ExportExpensesCSVView.as_view(), name="report-export-expenses-csv"),
    path("inventory/export-csv/", ExportInventoryCSVView.as_view(), name="report-export-inventory-csv"),
]

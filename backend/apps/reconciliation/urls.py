from django.urls import path
from .views import (
    ReconciliationBatchListCreateView,
    ReconciliationBatchDetailView,
    UploadAndParseCSVView,
    RunReconciliationView,
    ReconciliationMatchListView,
    ApproveMatchView,
    RejectMatchView,
    DiscrepancyExceptionListView,
    ResolveExceptionView,
)

urlpatterns = [
    path("batches/", ReconciliationBatchListCreateView.as_view(), name="reconciliation-batch-list"),
    path("batches/<int:pk>/", ReconciliationBatchDetailView.as_view(), name="reconciliation-batch-detail"),
    path("batches/<int:pk>/upload/", UploadAndParseCSVView.as_view(), name="reconciliation-batch-upload"),
    path("batches/<int:pk>/run/", RunReconciliationView.as_view(), name="reconciliation-batch-run"),
    path("batches/<int:batch_id>/matches/", ReconciliationMatchListView.as_view(), name="reconciliation-batch-matches"),
    path("matches/<int:pk>/approve/", ApproveMatchView.as_view(), name="reconciliation-match-approve"),
    path("matches/<int:pk>/reject/", RejectMatchView.as_view(), name="reconciliation-match-reject"),
    path("batches/<int:batch_id>/exceptions/", DiscrepancyExceptionListView.as_view(), name="reconciliation-batch-exceptions"),
    path("exceptions/<int:pk>/resolve/", ResolveExceptionView.as_view(), name="reconciliation-exception-resolve"),
]

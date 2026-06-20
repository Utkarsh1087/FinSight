from django.urls import path
from .views import (
    WarehouseListCreateView,
    ProductListCreateView,
    ProductDetailView,
    WarehouseStockListView,
    InventoryTransferListCreateView,
    InventoryValuationSummaryView,
)

urlpatterns = [
    path("warehouses/", WarehouseListCreateView.as_view(), name="warehouse-list-create"),
    path("products/", ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("stock/", WarehouseStockListView.as_view(), name="warehouse-stock-list"),
    path("transfers/", InventoryTransferListCreateView.as_view(), name="inventory-transfer-list-create"),
    path("valuation/", InventoryValuationSummaryView.as_view(), name="inventory-valuation-summary"),
]

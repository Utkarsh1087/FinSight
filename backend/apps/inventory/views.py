from decimal import Decimal
from django.db.models import Sum, F, Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Warehouse, Product, WarehouseStock, InventoryTransfer
from .serializers import (
    WarehouseSerializer,
    ProductSerializer,
    WarehouseStockSerializer,
    InventoryTransferSerializer,
)
from apps.accounts.permissions import IsFinanceUserOrAdmin, ReadOnlyOrFinanceAdmin
from apps.audit.utils import record_audit_log
from apps.notifications.utils import create_notification, NotificationType

class WarehouseListCreateView(generics.ListCreateAPIView):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

    def perform_create(self, serializer):
        product = serializer.save()
        # Initialize stock rows across all active warehouses
        for wh in Warehouse.objects.filter(is_active=True):
            WarehouseStock.objects.get_or_create(warehouse=wh, product=product, defaults={"quantity_on_hand": 0})

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

class WarehouseStockListView(generics.ListAPIView):
    serializer_class = WarehouseStockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = WarehouseStock.objects.select_related("warehouse", "product").all()
        wh_code = self.request.query_params.get("warehouse")
        search = self.request.query_params.get("search")

        if wh_code:
            qs = qs.filter(warehouse__code__iexact=wh_code)
        if search:
            qs = qs.filter(
                Q(product__name__icontains=search) |
                Q(product__sku__icontains=search)
            )
        return qs

class InventoryTransferListCreateView(generics.ListCreateAPIView):
    queryset = InventoryTransfer.objects.select_related("source_warehouse", "target_warehouse", "product").all()
    serializer_class = InventoryTransferSerializer
    permission_classes = [ReadOnlyOrFinanceAdmin]

    def create(self, request, *args, **kwargs):
        source_id = request.data.get("source_warehouse")
        target_id = request.data.get("target_warehouse")
        product_id = request.data.get("product")
        quantity_str = request.data.get("quantity")
        notes = request.data.get("notes", "")

        try:
            source_wh = Warehouse.objects.get(pk=source_id)
            target_wh = Warehouse.objects.get(pk=target_id)
            product = Product.objects.get(pk=product_id)
            quantity = int(quantity_str)
            if quantity <= 0:
                raise ValueError()
        except Exception as e:
            return Response({"error": "Invalid transfer parameters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            transfer = InventoryTransfer.execute_transfer(
                source_wh=source_wh,
                target_wh=target_wh,
                product=product,
                quantity=quantity,
                user=request.user,
                notes=notes
            )

            record_audit_log(
                user=request.user,
                action="INVENTORY_TRANSFER",
                entity_type="InventoryTransfer",
                entity_id=str(transfer.id),
                details=f"Transferred {quantity} units of {product.sku} ({product.name}) from {source_wh.name} to {target_wh.name}"
            )

            # Check if source warehouse reached below threshold
            src_stock = WarehouseStock.objects.get(warehouse=source_wh, product=product)
            if src_stock.quantity_on_hand < product.min_stock_threshold:
                create_notification(
                    title="Low Inventory Alert",
                    message=f"Stock for '{product.name}' in {source_wh.name} has fallen to {src_stock.quantity_on_hand} units (Threshold: {product.min_stock_threshold}).",
                    notification_type=NotificationType.LOW_INVENTORY,
                    metadata={"product_id": product.id, "warehouse_id": source_wh.id}
                )

            return Response(InventoryTransferSerializer(transfer).data, status=status.HTTP_201_CREATED)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as ex:
            return Response({"error": f"Transfer failed: {str(ex)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InventoryValuationSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        stocks = WarehouseStock.objects.select_related("warehouse", "product").all()
        total_valuation = sum((s.total_valuation for s in stocks), Decimal("0.00"))
        total_units = sum(s.quantity_on_hand for s in stocks)

        by_warehouse = {}
        for s in stocks:
            w_code = s.warehouse.code
            if w_code not in by_warehouse:
                by_warehouse[w_code] = {
                    "warehouse_code": w_code,
                    "warehouse_name": s.warehouse.name,
                    "country": s.warehouse.country,
                    "total_units": 0,
                    "total_value": 0.0,
                }
            by_warehouse[w_code]["total_units"] += s.quantity_on_hand
            by_warehouse[w_code]["total_value"] += float(s.total_valuation)

        return Response({
            "total_inventory_value": float(total_valuation),
            "total_units_on_hand": total_units,
            "warehouse_breakdown": list(by_warehouse.values()),
        })

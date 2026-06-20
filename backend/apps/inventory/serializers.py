from rest_framework import serializers
from .models import Warehouse, Product, WarehouseStock, InventoryTransfer

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["id", "name", "code", "country", "city", "address", "is_active", "created_at"]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "sku", "name", "description", "category",
            "unit_cost", "selling_price", "min_stock_threshold", "created_at"
        ]

class WarehouseStockSerializer(serializers.ModelSerializer):
    warehouse_code = serializers.CharField(source="warehouse.code", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    unit_cost = serializers.DecimalField(source="product.unit_cost", max_digits=12, decimal_places=2, read_only=True)
    total_valuation = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = WarehouseStock
        fields = [
            "id", "warehouse", "warehouse_code", "warehouse_name",
            "product", "product_sku", "product_name",
            "quantity_on_hand", "quantity_incoming", "quantity_outgoing",
            "unit_cost", "total_valuation", "updated_at"
        ]

class InventoryTransferSerializer(serializers.ModelSerializer):
    source_wh_name = serializers.CharField(source="source_warehouse.name", read_only=True)
    target_wh_name = serializers.CharField(source="target_warehouse.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    initiated_by_email = serializers.CharField(source="initiated_by.email", read_only=True)

    class Meta:
        model = InventoryTransfer
        fields = [
            "id", "reference_no", "source_warehouse", "source_wh_name",
            "target_warehouse", "target_wh_name", "product", "product_sku",
            "product_name", "quantity", "status", "transfer_date",
            "notes", "initiated_by_email", "created_at"
        ]
        read_only_fields = ["id", "reference_no", "status", "initiated_by_email", "created_at"]

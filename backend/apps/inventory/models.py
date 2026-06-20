from django.db import models, transaction
from django.conf import settings
from decimal import Decimal
from datetime import date

class TransferStatus(models.TextChoices):
    PENDING = "PENDING", "Pending Approval"
    IN_TRANSIT = "IN_TRANSIT", "In Transit"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"

class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True, db_index=True) # e.g. WH-INDIA, WH-USA, WH-GERMANY
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.name} ({self.country}) [{self.code}]"


class Product(models.Model):
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, default="Instruments")
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    min_stock_threshold = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sku"]

    def __str__(self):
        return f"{self.sku} — {self.name}"


class WarehouseStock(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="stocks")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="warehouse_stocks")
    quantity_on_hand = models.IntegerField(default=0)
    quantity_incoming = models.IntegerField(default=0)
    quantity_outgoing = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("warehouse", "product")
        ordering = ["warehouse", "product"]

    def __str__(self):
        return f"{self.warehouse.code} : {self.product.sku} ({self.quantity_on_hand} in stock)"

    @property
    def total_valuation(self) -> Decimal:
        return self.product.unit_cost * self.quantity_on_hand


class InventoryTransfer(models.Model):
    reference_no = models.CharField(max_length=100, unique=True, db_index=True)
    source_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="outgoing_transfers")
    target_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="incoming_transfers")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="transfers")
    quantity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=30,
        choices=TransferStatus.choices,
        default=TransferStatus.COMPLETED,
        db_index=True
    )
    transfer_date = models.DateField(default=date.today)
    notes = models.TextField(blank=True, null=True)
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transfer #{self.reference_no}: {self.quantity}x {self.product.sku} from {self.source_warehouse.code} to {self.target_warehouse.code}"

    @classmethod
    @transaction.atomic
    def execute_transfer(cls, source_wh, target_wh, product, quantity, user=None, notes=""):
        if source_wh == target_wh:
            raise ValueError("Source and target warehouse cannot be the same.")
        
        # Check source stock
        src_stock, _ = WarehouseStock.objects.get_or_create(warehouse=source_wh, product=product)
        if src_stock.quantity_on_hand < quantity:
            raise ValueError(f"Insufficient stock in {source_wh.name}. Available: {src_stock.quantity_on_hand}, Requested: {quantity}")

        # Deduct from source
        src_stock.quantity_on_hand -= quantity
        src_stock.save()

        # Add to target
        tgt_stock, _ = WarehouseStock.objects.get_or_create(warehouse=target_wh, product=product)
        tgt_stock.quantity_on_hand += quantity
        tgt_stock.save()

        ref_no = f"TRF-{date.today().strftime('%Y%m%d')}-{cls.objects.count() + 1001}"
        transfer = cls.objects.create(
            reference_no=ref_no,
            source_warehouse=source_wh,
            target_warehouse=target_wh,
            product=product,
            quantity=quantity,
            status=TransferStatus.COMPLETED,
            notes=notes,
            initiated_by=user
        )
        return transfer

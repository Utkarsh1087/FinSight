from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import UserRole
from apps.reconciliation.models import (
    ReconciliationBatch,
    BankTransaction,
    CompanyTransaction,
    ReconciliationMatch,
    DiscrepancyException,
)
from apps.reconciliation.engine import execute_reconciliation
from apps.invoices.models import Invoice, InvoiceStatus, InvoiceType
from apps.expenses.models import Expense, ExpenseCategory
from apps.inventory.models import Warehouse, Product, WarehouseStock, InventoryTransfer
from apps.controls.models import ControlRule, ControlViolation, RuleType
from apps.controls.rules import ensure_default_rules, evaluate_financial_controls

User = get_user_model()

class FinSightCoreTestSuite(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="admin@test.com",
            username="admin_test",
            password="Password123",
            role=UserRole.ADMIN
        )
        self.finance = User.objects.create_user(
            email="finance@test.com",
            username="finance_test",
            password="Password123",
            role=UserRole.FINANCE_USER
        )
        self.viewer = User.objects.create_user(
            email="viewer@test.com",
            username="viewer_test",
            password="Password123",
            role=UserRole.VIEWER
        )
        ensure_default_rules()

    def test_authentication_and_login(self):
        resp = self.client.post("/api/auth/login/", {
            "email": "admin@test.com",
            "password": "Password123"
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("token", resp.data)
        self.assertEqual(resp.data["user"]["role"], "ADMIN")

    def test_rbac_permissions(self):
        # Viewer attempting to create an invoice should be forbidden
        self.client.force_authenticate(user=self.viewer)
        resp = self.client.post("/api/invoices/", {
            "invoice_number": "INV-TEST-001",
            "party_name": "Test Vendor",
            "due_date": "2026-06-30",
            "total_amount": "5000.00"
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # Finance user should be allowed
        self.client.force_authenticate(user=self.finance)
        resp = self.client.post("/api/invoices/", {
            "invoice_number": "INV-TEST-001",
            "party_name": "Test Vendor",
            "due_date": "2026-06-30",
            "total_amount": "5000.00"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_reconciliation_three_pass_engine(self):
        batch = ReconciliationBatch.objects.create(
            name="Test June Batch",
            period="June 2026",
            created_by=self.finance
        )

        # 1. Exact match pair
        BankTransaction.objects.create(
            batch=batch, date=date(2026, 6, 10), description="EFT BELL PAYMENT", reference="REF100", amount=Decimal("-5000.00")
        )
        CompanyTransaction.objects.create(
            batch=batch, date=date(2026, 6, 10), memo="Bell Canada — payment", doc_no="REF100", amount=Decimal("-5000.00")
        )

        # 2. Timing match pair (3 days clearing lag)
        BankTransaction.objects.create(
            batch=batch, date=date(2026, 6, 15), description="CHQ 1050 WESCO", reference="CHQ1050", amount=Decimal("-12000.00")
        )
        CompanyTransaction.objects.create(
            batch=batch, date=date(2026, 6, 12), memo="WESCO Distribution — invoice", doc_no="CHQ1050", amount=Decimal("-12000.00")
        )

        # 3. Tolerance / Fuzzy match pair (40 cents diff + similar vendor)
        BankTransaction.objects.create(
            batch=batch, date=date(2026, 6, 18), description="PAD SHELL FLEET CARD SVC", reference="REF550", amount=Decimal("-3500.00")
        )
        CompanyTransaction.objects.create(
            batch=batch, date=date(2026, 6, 18), memo="Shell Fleet Card — invoice payment", doc_no="REF550", amount=Decimal("-3500.40")
        )

        # 4. Bank fee exception
        BankTransaction.objects.create(
            batch=batch, date=date(2026, 6, 30), description="MONTHLY SERVICE FEE ACCT 1010", reference="FEE01", amount=Decimal("-75.00")
        )

        execute_reconciliation(batch)
        batch.refresh_from_db()

        self.assertEqual(batch.matched_count, 3)
        self.assertEqual(batch.exception_count, 1)

        exact_match = batch.matches.filter(pass_name="Exact").first()
        self.assertIsNotNone(exact_match)
        self.assertEqual(exact_match.confidence_score, 100.0)

        timing_match = batch.matches.filter(pass_name="Timing").first()
        self.assertIsNotNone(timing_match)
        self.assertEqual(timing_match.date_delta, 3)

        tol_match = batch.matches.filter(pass_name="Tolerance").first()
        self.assertIsNotNone(tol_match)
        self.assertEqual(tol_match.amount_delta, Decimal("0.40"))

        fee_exc = batch.exceptions.first()
        self.assertEqual(fee_exc.category, "BANK_CHARGE")

    def test_inventory_transfer_atomicity(self):
        wh_src = Warehouse.objects.create(name="WH India", code="WH-IN-T", country="India", city="BLR")
        wh_tgt = Warehouse.objects.create(name="WH USA", code="WH-US-T", country="USA", city="CHI")
        product = Product.objects.create(
            sku="TST-PRD-01",
            name="Test Instrument",
            unit_cost=Decimal("1000.00"),
            selling_price=Decimal("1500.00"),
            min_stock_threshold=5
        )
        WarehouseStock.objects.create(warehouse=wh_src, product=product, quantity_on_hand=20)
        WarehouseStock.objects.create(warehouse=wh_tgt, product=product, quantity_on_hand=5)

        transfer = InventoryTransfer.execute_transfer(
            source_wh=wh_src,
            target_wh=wh_tgt,
            product=product,
            quantity=8,
            user=self.finance,
            notes="Test transfer"
        )

        src_stock = WarehouseStock.objects.get(warehouse=wh_src, product=product)
        tgt_stock = WarehouseStock.objects.get(warehouse=wh_tgt, product=product)

        self.assertEqual(src_stock.quantity_on_hand, 12)
        self.assertEqual(tgt_stock.quantity_on_hand, 13)
        self.assertEqual(transfer.status, "COMPLETED")

    def test_financial_control_high_payment_rule(self):
        exp = Expense.objects.create(
            title="Major Server Farm Upgrade",
            vendor="Dell Enterprise",
            amount=Decimal("150000.00"),
            date=date.today(),
            category=ExpenseCategory.SOFTWARE,
            created_by=self.finance
        )
        evaluate_financial_controls(expense=exp)
        
        violation = ControlViolation.objects.filter(related_entity_type="Expense", related_entity_id=str(exp.id)).first()
        self.assertIsNotNone(violation)
        self.assertEqual(violation.severity, "CRITICAL")

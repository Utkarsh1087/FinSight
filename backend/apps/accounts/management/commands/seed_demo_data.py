import random
from decimal import Decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import UserRole
from apps.inventory.models import Warehouse, Product, WarehouseStock, InventoryTransfer
from apps.invoices.models import Invoice, InvoicePayment, InvoiceStatus, InvoiceType
from apps.expenses.models import Expense, ExpenseCategory
from apps.reconciliation.models import (
    ReconciliationBatch,
    BankTransaction,
    CompanyTransaction,
)
from apps.reconciliation.engine import execute_reconciliation
from apps.controls.rules import ensure_default_rules, evaluate_financial_controls
from apps.audit.utils import record_audit_log
from apps.notifications.utils import create_notification, NotificationType

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds comprehensive realistic demo data for FinSight operations platform"

    def handle(self, *args, **options):
        self.stdout.write("Starting FinSight demo data seeding...")
        random.seed(42)

        # 1. Organization & Users
        from apps.accounts.models import Organization
        default_org, _ = Organization.objects.get_or_create(
            slug="acme-global",
            defaults={
                "name": "Acme Global Corporation",
                "country": "India",
                "currency": "INR",
                "tax_id": "GSTIN27AABCU9603R1ZM",
            }
        )

        admin_user, _ = User.objects.get_or_create(
            email="admin@finsight.com",
            defaults={
                "username": "admin",
                "first_name": "Alexander",
                "last_name": "Wright",
                "role": UserRole.ADMIN,
                "department": "Finance Leadership",
                "is_staff": True,
                "is_superuser": True
            }
        )
        admin_user.set_password("Admin@123")
        admin_user.role = UserRole.ADMIN
        admin_user.organization = default_org
        admin_user.save()

        finance_user, _ = User.objects.get_or_create(
            email="finance@finsight.com",
            defaults={
                "username": "finance_lead",
                "first_name": "Elena",
                "last_name": "Rostova",
                "role": UserRole.FINANCE_USER,
                "department": "Treasury & Reconciliation",
            }
        )
        finance_user.set_password("Finance@123")
        finance_user.role = UserRole.FINANCE_USER
        finance_user.organization = default_org
        finance_user.save()

        viewer_user, _ = User.objects.get_or_create(
            email="viewer@finsight.com",
            defaults={
                "username": "auditor_viewer",
                "first_name": "Marcus",
                "last_name": "Chen",
                "role": UserRole.VIEWER,
                "department": "Internal Audit",
            }
        )
        viewer_user.set_password("Viewer@123")
        viewer_user.role = UserRole.VIEWER
        viewer_user.organization = default_org
        viewer_user.save()

        self.stdout.write(self.style.SUCCESS("[OK] Seeded Organization, Admin, Finance User, and Viewer accounts."))

        # 2. Control Rules
        ensure_default_rules()
        self.stdout.write(self.style.SUCCESS("[OK] Seeded Financial Control Rules."))
        # 3. Warehouses & Products
        wh_in, _ = Warehouse.objects.get_or_create(
            code="WH-INDIA",
            defaults={"name": "Bengaluru Central Warehouse", "country": "India", "city": "Bengaluru", "address": "Electronic City Phase 1"}
        )
        wh_us, _ = Warehouse.objects.get_or_create(
            code="WH-USA",
            defaults={"name": "North America Logistics Hub", "country": "USA", "city": "Chicago", "address": "O'Hare Logistics Park"}
        )
        wh_de, _ = Warehouse.objects.get_or_create(
            code="WH-GERMANY",
            defaults={"name": "European Distribution Centre", "country": "Germany", "city": "Frankfurt", "address": "Airport CargoCity South"}
        )

        products_data = [
            ("MIC-SCN-4K", "Microscope Scanner 4K Pro", "High-throughput automated slide scanner with digital optical zoom", "Diagnostics", 85000.00, 125000.00, 5),
            ("OPT-LNS-HD", "Precision Optical Lens HD", "Multi-coated apochromatic objective lens 40x", "Optics", 12000.00, 19500.00, 15),
            ("LSR-MOD-X1", "Laser Sensor Module X1", "High-precision distance and alignment laser sensor", "Sensors", 18500.00, 28000.00, 20),
            ("DIG-BRD-500", "Digital Controller Board v5", "FPGA multi-channel data acquisition board", "Electronics", 32000.00, 48000.00, 10),
            ("FIB-CBL-100", "Fiber Optic Cable Reel (100m)", "Armored multi-mode low latency optical fiber", "Cabling", 4500.00, 7200.00, 30),
            ("PWR-UNT-PRO", "Stabilized Precision Power Unit", "Medical grade low-ripple switching power supply", "Power", 9500.00, 15000.00, 12),
        ]

        for sku, name, desc, cat, ucost, sprice, min_th in products_data:
            p, _ = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    "name": name,
                    "description": desc,
                    "category": cat,
                    "unit_cost": Decimal(str(ucost)),
                    "selling_price": Decimal(str(sprice)),
                    "min_stock_threshold": min_th
                }
            )
            # Allocate realistic stock
            WarehouseStock.objects.update_or_create(warehouse=wh_in, product=p, defaults={"quantity_on_hand": random.randint(25, 60)})
            WarehouseStock.objects.update_or_create(warehouse=wh_us, product=p, defaults={"quantity_on_hand": random.randint(15, 45)})
            WarehouseStock.objects.update_or_create(warehouse=wh_de, product=p, defaults={"quantity_on_hand": random.randint(10, 30)})

        # Seed sample transfer
        p_scanner = Product.objects.get(sku="MIC-SCN-4K")
        InventoryTransfer.objects.get_or_create(
            reference_no="TRF-20260615-1001",
            defaults={
                "source_warehouse": wh_in,
                "target_warehouse": wh_us,
                "product": p_scanner,
                "quantity": 5,
                "status": "COMPLETED",
                "transfer_date": date(2026, 6, 15),
                "notes": "Quarterly stock replenishment for North America sales pipeline",
                "initiated_by": finance_user
            }
        )
        self.stdout.write(self.style.SUCCESS("[OK] Seeded Warehouses, Products, Stocks, and Transfers."))

        # 4. Invoices (300+ realistic invoices)
        vendors = [
            ("Bell Canada Infra", InvoiceType.PAYABLE),
            ("Rogers Network Services", InvoiceType.PAYABLE),
            ("Telecon Engineering", InvoiceType.PAYABLE),
            ("WESCO Distribution", InvoiceType.PAYABLE),
            ("United Rentals Canada", InvoiceType.PAYABLE),
            ("Brandt Tractor Equipment", InvoiceType.PAYABLE),
            ("Vermeer Industrial Canada", InvoiceType.PAYABLE),
            ("Intact Commercial Insurance", InvoiceType.PAYABLE),
            ("Milton Hydro Electric", InvoiceType.PAYABLE),
            ("Petro-Canada Fleet Fuel", InvoiceType.PAYABLE),
            ("Shell Canada Fleet Services", InvoiceType.PAYABLE),
            ("Home Depot Commercial Pro", InvoiceType.PAYABLE),
            ("Staples Business Logistics", InvoiceType.PAYABLE),
            ("AWS Cloud Infrastructure", InvoiceType.PAYABLE),
            ("Microsoft Azure Services", InvoiceType.PAYABLE),
            # Receivables / Customers
            ("Metro Health Diagnostic Labs", InvoiceType.RECEIVABLE),
            ("Apex Imaging Research Institute", InvoiceType.RECEIVABLE),
            ("Global Telecom Infrastructure Ltd", InvoiceType.RECEIVABLE),
            ("St. Jude University Hospital", InvoiceType.RECEIVABLE),
            ("Bavarian Medical Systems GmbH", InvoiceType.RECEIVABLE),
        ]

        base_date = date(2026, 5, 1)
        invoice_objects = []

        for i in range(1, 320):
            vendor, inv_type = random.choice(vendors)
            issue = base_date + timedelta(days=random.randint(0, 55))
            due = issue + timedelta(days=random.choice([15, 30, 45]))
            
            amount = Decimal(str(round(random.uniform(2500, 95000), 2)))
            
            # Determine status realistically
            today = date.today()
            if due < today:
                status = random.choices(
                    [InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.DISPUTED],
                    weights=[60, 25, 10, 5]
                )[0]
            else:
                status = random.choices(
                    [InvoiceStatus.PENDING, InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID],
                    weights=[65, 25, 10]
                )[0]

            paid_amount = Decimal("0.00")
            if status == InvoiceStatus.PAID:
                paid_amount = amount
            elif status == InvoiceStatus.PARTIALLY_PAID:
                paid_amount = Decimal(str(round(float(amount) * random.uniform(0.3, 0.7), 2)))

            inv_num = f"INV-2026-{1000 + i}"
            invoice_objects.append(
                Invoice(
                    invoice_number=inv_num,
                    party_name=vendor,
                    invoice_type=inv_type,
                    issue_date=issue,
                    due_date=due,
                    total_amount=amount,
                    paid_amount=paid_amount,
                    status=status,
                    description=f"Monthly service billing #{inv_num} for {vendor}",
                    reference=f"REF-{20000 + i}",
                    created_by=finance_user
                )
            )

        Invoice.objects.bulk_create(invoice_objects, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(invoice_objects)} Invoices."))

        # 5. Expenses (120+ categorized expenses)
        categories = list(ExpenseCategory.values)
        expense_objects = []
        for i in range(1, 135):
            cat = random.choice(categories)
            exp_date = base_date + timedelta(days=random.randint(0, 60))
            amt = Decimal(str(round(random.uniform(500, 115000), 2)))
            v_name, _ = random.choice(vendors)
            expense_objects.append(
                Expense(
                    title=f"{cat.title()} - {v_name}",
                    vendor=v_name,
                    amount=amt,
                    date=exp_date,
                    category=cat,
                    description=f"Authorized operational expense for {cat.lower()} requisition #{4000 + i}",
                    payment_method=random.choice(["Corporate Card", "EFT Bank Transfer", "Direct Debit", "Wire"]),
                    created_by=finance_user
                )
            )
        Expense.objects.bulk_create(expense_objects)
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(expense_objects)} Expenses."))

        # 6. Reconciliation Batch with 500+ Bank and GL Transactions
        batch, _ = ReconciliationBatch.objects.get_or_create(
            name="Operating Account Cash Reconciliation — June 2026",
            defaults={
                "period": "June 2026",
                "opening_balance": Decimal("184352.19"),
                "timing_window_days": 5,
                "tolerance_amount": Decimal("1.00"),
                "fuzzy_threshold": 0.35,
                "created_by": finance_user
            }
        )

        batch.bank_transactions.all().delete()
        batch.company_transactions.all().delete()

        bank_rows = []
        gl_rows = []

        # (A) 380 Exact Matched transactions
        for i in range(380):
            tx_date = date(2026, 6, 1) + timedelta(days=random.randint(0, 27))
            amt = round(random.uniform(150, 45000) * random.choice([1, -1]), 2)
            amt_dec = Decimal(f"{amt:.2f}")
            vendor, _ = random.choice(vendors)
            doc_no = f"CHQ#{1000 + i}" if amt < 0 else f"REF4{1000 + i}"
            memo = f"{vendor} — payment" if amt < 0 else f"{vendor} — billing receipt"
            bank_desc = f"EFT {vendor.upper()}"

            bank_rows.append(BankTransaction(batch=batch, date=tx_date, description=bank_desc, reference=doc_no, amount=amt_dec))
            gl_rows.append(CompanyTransaction(batch=batch, date=tx_date, account="1010 Cash — Operating", memo=memo, doc_no=doc_no, amount=amt_dec))

        # (B) 60 Timing lag transactions (Bank date is 1-4 days late)
        for i in range(60):
            gl_date = date(2026, 6, 2) + timedelta(days=random.randint(0, 22))
            bank_date = gl_date + timedelta(days=random.randint(1, 4))
            amt = round(random.uniform(500, 32000) * -1, 2)
            amt_dec = Decimal(f"{amt:.2f}")
            vendor, _ = random.choice(vendors)
            doc_no = f"CHQ#{2000 + i}"
            memo = f"{vendor} — equipment parts"
            bank_desc = f"CHQ {2000 + i} {vendor.upper()}"

            bank_rows.append(BankTransaction(batch=batch, date=bank_date, description=bank_desc, reference=doc_no, amount=amt_dec))
            gl_rows.append(CompanyTransaction(batch=batch, date=gl_date, account="1010 Cash — Operating", memo=memo, doc_no=doc_no, amount=amt_dec))

        # (C) 40 Tolerance / Fuzzy matches (Cents keying errors or FX residual within ₹1.00)
        for i in range(40):
            tx_date = date(2026, 6, 3) + timedelta(days=random.randint(0, 24))
            base_amt = round(random.uniform(800, 18000) * random.choice([1, -1]), 2)
            diff = round(random.uniform(0.05, 0.95) * random.choice([1, -1]), 2)
            bank_amt = Decimal(f"{base_amt:.2f}")
            gl_amt = Decimal(f"{(base_amt + diff):.2f}")

            vendor, _ = random.choice(vendors)
            bank_desc = f"PAD {vendor.upper()} SVC REF{5000 + i}"
            gl_memo = f"{vendor} — monthly invoice payment"

            bank_rows.append(BankTransaction(batch=batch, date=tx_date, description=bank_desc, reference=f"REF{5000 + i}", amount=bank_amt))
            gl_rows.append(CompanyTransaction(batch=batch, date=tx_date, account="1010 Cash — Operating", memo=gl_memo, doc_no=f"REF{5000 + i}", amount=gl_amt))

        # (D) Planted Exceptions (14 discrete breaks)
        # Bank-only
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 30), description="MONTHLY SERVICE FEE ACCT 1010", reference="BANK-FEE-01", amount=Decimal("-75.00")))
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 30), description="INTEREST EARNED ON OPERATING BALANCE", reference="BANK-INT-01", amount=Decimal("312.43")))
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 25), description="WIRE TRANSFER FEE OUTGOING REF8821", reference="WIRE-FEE-01", amount=Decimal("-45.00")))
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 22), description="NSF RETURNED ITEM FEE CHQ 1022", reference="NSF-01", amount=Decimal("-48.00")))
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 28), description="INTEREST EXPENSE OVERDRAFT FACILITY", reference="OD-INT-01", amount=Decimal("-537.00")))
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 18), description="UNIDENTIFIED PREAUTH DEBIT REQ331", reference="UNID-DR", amount=Decimal("-1260.00")))
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 14), description="E-TRANSFER RECEIVED T4X99A", reference="UNID-CR", amount=Decimal("2150.00")))

        # GL-only
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 29), account="1010 Cash — Operating", memo="Vermeer Industrial — drill head rebuild", doc_no="CHQ#1080", amount=Decimal("-15890.23")))
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 29), account="1010 Cash — Operating", memo="Milton Hydro — facility power", doc_no="CHQ#1081", amount=Decimal("-2340.55")))
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 30), account="1010 Cash — Operating", memo="Brandt Tractor — hydraulic service", doc_no="CHQ#1082", amount=Decimal("-4178.09")))
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 30), account="1010 Cash — Operating", memo="United Rentals — generator rental", doc_no="CHQ#1083", amount=Decimal("-7412.66")))
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 30), account="1010 Cash — Operating", memo="Rogers Network — progress billing milestone", doc_no="REF40947", amount=Decimal("48310.77")))
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 30), account="1010 Cash — Operating", memo="Bell Canada Infra — underground holdback release", doc_no="REF40957", amount=Decimal("12764.31")))
        
        # Duplicate GL entry
        dup_amt = Decimal("-10230.18")
        bank_rows.append(BankTransaction(batch=batch, date=date(2026, 6, 12), description="EFT TELECON DESIGN PAYMENT", reference="CHQ#1072", amount=dup_amt))
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 12), account="1010 Cash — Operating", memo="Telecon Design — engineering invoice", doc_no="CHQ#1072", amount=dup_amt))
        gl_rows.append(CompanyTransaction(batch=batch, date=date(2026, 6, 12), account="1010 Cash — Operating", memo="Telecon Design — engineering invoice", doc_no="CHQ#1072", amount=dup_amt))

        # Bulk save
        BankTransaction.objects.bulk_create(bank_rows)
        CompanyTransaction.objects.bulk_create(gl_rows)

        self.stdout.write(self.style.SUCCESS(f"[OK] Saved {len(bank_rows)} Bank Transactions and {len(gl_rows)} GL Transactions."))

        # Run Engine
        execute_reconciliation(batch)
        self.stdout.write(self.style.SUCCESS(f"[OK] Executed Reconciliation Engine on '{batch.name}': {batch.matched_count} matches, {batch.exception_count} exceptions, Proof Difference: Rs. {batch.unreconciled_difference}."))

        # Trigger initial notifications & audit logs
        record_audit_log(
            user=admin_user,
            action="INITIAL_SYSTEM_SEED",
            entity_type="System",
            entity_id="0",
            details="Seeded initial production data for FinSight operations."
        )

        create_notification(
            title="System Ready",
            message="FinSight environment initialized with 500+ transactions, 300+ invoices, and 3-pass reconciliation proof.",
            notification_type=NotificationType.SYSTEM
        )

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] FinSight demo data seeding complete! Ready for live execution."))

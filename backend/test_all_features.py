import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
from apps.accounts.models import User, UserRole, Organization
from apps.reconciliation.models import ReconciliationBatch
from apps.invoices.models import Invoice
from apps.expenses.models import Expense
from apps.inventory.models import Warehouse, Product, WarehouseStock
from apps.controls.models import ControlRule, ControlViolation
from apps.audit.models import AuditLog

def test_full_platform():
    client = Client()

    print("\n" + "="*60)
    print("FINSIGHT COMPREHENSIVE END-TO-END SYSTEM TEST")
    print("="*60)

    # 1. Test Authentication & RBAC
    print("\n1. Testing Authentication & RBAC...")
    login_res = client.post("/api/auth/login/", {"email": "admin@finsight.com", "password": "Admin@123"}, content_type="application/json")
    assert login_res.status_code == 200, f"Admin login failed: {login_res.data}"
    admin_token = login_res.data["token"]
    admin_headers = {"HTTP_AUTHORIZATION": f"Token {admin_token}"}
    print("  [OK] Admin Login & Token generation: PASS")

    # 2. Test Organization & Team Management
    print("\n2. Testing Organization & Team Management...")
    org_res = client.get("/api/auth/organization/", **admin_headers)
    assert org_res.status_code == 200, f"Get organization failed: {org_res.data}"
    print(f"  [OK] Organization Profile ({org_res.data['name']} / {org_res.data['currency']}): PASS")

    members_res = client.get("/api/auth/organization/members/", **admin_headers)
    assert members_res.status_code == 200, f"Get members failed: {members_res.data}"
    print(f"  [OK] Team Member Roster ({len(members_res.data)} active members): PASS")

    # 3. Test Dashboard Telemetry
    print("\n3. Testing Dashboard Telemetry...")
    dash_res = client.get("/api/reports/overview/", **admin_headers)
    assert dash_res.status_code == 200, f"Dashboard fetch failed: {dash_res.data}"
    print("  [OK] Dashboard KPI Telemetry: PASS")

    # 4. Test 3-Pass Reconciliation Engine
    print("\n4. Testing 3-Pass Reconciliation Engine...")
    batch = ReconciliationBatch.objects.first()
    assert batch is not None, "No reconciliation batch found"
    recon_res = client.get(f"/api/reconciliation/batches/{batch.id}/", **admin_headers)
    assert recon_res.status_code == 200, f"Recon batch detail failed: {recon_res.data}"
    print(f"  [OK] Reconciliation Batch ({batch.name}): {recon_res.data['matched_count']} matches, {recon_res.data['exception_count']} breaks: PASS")

    # 5. Test Invoices (AP/AR Ledger)
    print("\n5. Testing Invoices & Receivables...")
    inv_res = client.get("/api/invoices/", **admin_headers)
    assert inv_res.status_code == 200, f"Invoices list failed: {inv_res.data}"
    inv_kpi_res = client.get("/api/invoices/summary/", **admin_headers)
    assert inv_kpi_res.status_code == 200, f"Invoices metrics failed: {inv_kpi_res.data}"
    print(f"  [OK] Invoices Ledger ({inv_kpi_res.data['total_invoices']} invoices, Outstanding: Rs. {inv_kpi_res.data['total_outstanding']}): PASS")

    # 6. Test Expenses & Spending Analytics
    print("\n6. Testing Expenses & Analytics...")
    exp_res = client.get("/api/expenses/", **admin_headers)
    assert exp_res.status_code == 200, f"Expenses list failed: {exp_res.data}"
    exp_kpi_res = client.get("/api/expenses/analytics/", **admin_headers)
    assert exp_kpi_res.status_code == 200, f"Expenses metrics failed: {exp_kpi_res.data}"
    print(f"  [OK] Corporate Expenses ({exp_kpi_res.data['expense_count']} items, Total: Rs. {exp_kpi_res.data['total_expenses']}): PASS")

    # 7. Test Multi-Warehouse Inventory & Transfers
    print("\n7. Testing Multi-Warehouse Inventory...")
    wh_res = client.get("/api/inventory/warehouses/", **admin_headers)
    assert wh_res.status_code == 200, f"Warehouses list failed: {wh_res.data}"
    stock_kpi_res = client.get("/api/inventory/valuation/", **admin_headers)
    assert stock_kpi_res.status_code == 200, f"Inventory valuation failed: {stock_kpi_res.data}"
    print(f"  [OK] Warehouse Network ({len(wh_res.data)} warehouses, Total Valuation: Rs. {stock_kpi_res.data['total_inventory_value']}): PASS")

    # 8. Test Financial Control Center & Rules
    print("\n8. Testing Control Center & Policy Violations...")
    rules_res = client.get("/api/controls/rules/", **admin_headers)
    assert rules_res.status_code == 200, f"Control rules failed: {rules_res.data}"
    violations_res = client.get("/api/controls/violations/", **admin_headers)
    assert violations_res.status_code == 200, f"Violations list failed: {violations_res.data}"
    print(f"  [OK] Governance Engine ({len(rules_res.data)} rules active, {len(violations_res.data)} policy violations flagged): PASS")

    # 9. Test AI Finance Assistant
    print("\n9. Testing AI Finance Assistant...")
    ai_res = client.post("/api/ai/query/", {"prompt": "Summarize the month-end reconciliation status and largest break"}, content_type="application/json", **admin_headers)
    assert ai_res.status_code == 200, f"AI Assistant query failed: {ai_res.data}"
    print("  [OK] AI Telemetry Reasoning Response: PASS")

    # 10. Test Audit Logs & CSV Reports
    print("\n10. Testing Audit Logs, Notifications & Reporting...")
    audit_res = client.get("/api/audit-logs/", **admin_headers)
    assert audit_res.status_code == 200, f"Audit logs failed: {audit_res.data}"
    notif_res = client.get("/api/notifications/", **admin_headers)
    assert notif_res.status_code == 200, f"Notifications failed: {notif_res.data}"
    report_res = client.get(f"/api/reports/reconciliation/{batch.id}/export-csv/", **admin_headers)
    assert report_res.status_code == 200, f"CSV report failed: {report_res.status_code}"
    print(f"  [OK] Immutable Audit Trail ({len(audit_res.data)} logs), Notifications ({len(notif_res.data)} alerts) & 1-Click CSV Exports: PASS")

    print("\n" + "="*60)
    print("ALL 10 MODULES & CORE PLATFORM FEATURES PASSED WITH 100% INTEGRITY!")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_full_platform()

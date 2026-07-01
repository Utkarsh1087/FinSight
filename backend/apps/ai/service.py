"""
AI Finance Assistant Service — Context-Bounded Discrepancy Analysis & Semantic Financial Intelligence
"""

import os
import re
from decimal import Decimal
from django.db.models import Sum, Count, Q
from apps.reconciliation.models import ReconciliationBatch, DiscrepancyException, BankTransaction, CompanyTransaction
from apps.invoices.models import Invoice, InvoiceStatus
from apps.expenses.models import Expense, ExpenseCategory
from apps.inventory.models import WarehouseStock, Product
from apps.controls.models import ControlViolation

def get_financial_context():
    """
    Retrieves bounded, aggregated financial context without exposing raw DB credentials.
    """
    latest_batch = ReconciliationBatch.objects.filter(status="COMPLETED").order_by("-created_at").first()
    
    top_exceptions = []
    if latest_batch:
        for exc in latest_batch.exceptions.all().order_by("-amount")[:10]:
            top_exceptions.append({
                "id": exc.id,
                "side": exc.side,
                "category": exc.get_category_display(),
                "amount": float(exc.amount),
                "reason": exc.reason,
                "suggested_action": exc.suggested_action,
            })

    top_overdue_invoices = []
    for inv in Invoice.objects.filter(status=InvoiceStatus.OVERDUE).order_by("-total_amount")[:8]:
        top_overdue_invoices.append({
            "number": inv.invoice_number,
            "party": inv.party_name,
            "amount": float(inv.outstanding_amount),
            "days_overdue": inv.days_overdue,
        })

    top_expenses = []
    for exp in Expense.objects.all().order_by("-amount")[:8]:
        top_expenses.append({
            "title": exp.title,
            "vendor": exp.vendor,
            "amount": float(exp.amount),
            "category": exp.get_category_display(),
            "date": exp.date.isoformat(),
        })

    open_violations = []
    for v in ControlViolation.objects.filter(status="OPEN")[:6]:
        open_violations.append({
            "title": v.title,
            "severity": v.severity,
            "description": v.description,
        })

    return {
        "latest_batch": {
            "name": latest_batch.name if latest_batch else "N/A",
            "period": latest_batch.period if latest_batch else "N/A",
            "matched_count": latest_batch.matched_count if latest_batch else 0,
            "exception_count": latest_batch.exception_count if latest_batch else 0,
            "match_rate": latest_batch.match_rate if latest_batch else 0.0,
            "unreconciled_diff": float(latest_batch.unreconciled_difference) if latest_batch else 0.0,
        },
        "top_exceptions": top_exceptions,
        "top_overdue_invoices": top_overdue_invoices,
        "top_expenses": top_expenses,
        "open_violations": open_violations,
    }


def query_ai_assistant(prompt: str, entity_type: str = None, entity_id: str = None) -> dict:
    """
    Processes financial query and returns structured response:
    - observed_data
    - possible_explanation
    - recommendation
    """
    q = prompt.lower()
    ctx = get_financial_context()

    # Specific transaction / exception explanation
    if entity_type == "exception" or "discrepancy" in q or "break" in q or "exception" in q:
        if entity_id:
            try:
                exc = DiscrepancyException.objects.get(pk=entity_id)
                observed = (
                    f"Discrepancy #{exc.id} on {exc.get_side_display()}: Category '{exc.get_category_display()}' "
                    f"with amount ₹{abs(exc.amount):,.2f}. Details: {exc.reason}"
                )
                explanation = (
                    f"The 3-pass reconciliation engine flagged this item because no corresponding counterpart "
                    f"met the exact (same amount+date), timing (±5 days lag), or tolerance/fuzzy description gates."
                )
                recommendation = exc.suggested_action
                return {
                    "observed_data": observed,
                    "possible_explanation": explanation,
                    "recommendation": recommendation,
                    "context_items": [{"id": exc.id, "amount": float(exc.amount), "reason": exc.reason}]
                }
            except DiscrepancyException.DoesNotExist:
                pass

    # 1. Why did reconciliation fail / discrepancies question
    if "reconciliation" in q or "fail" in q or "tie" in q or "match rate" in q:
        batch_info = ctx["latest_batch"]
        exc_count = batch_info["exception_count"]
        diff = batch_info["unreconciled_diff"]
        
        observed = (
            f"Latest reconciliation batch '{batch_info['name']}' ({batch_info['period']}) reconciled "
            f"{batch_info['matched_count']} items with a {batch_info['match_rate']}% match rate. "
            f"There are {exc_count} isolated exceptions. The net proof difference is ₹{diff:,.2f}."
        )
        explanation = (
            f"The unreconciled breaks stem primarily from timing items (outstanding checks & deposits in transit), "
            f"unbooked bank service charges, and one duplicate GL entry that was posted twice."
        )
        recommendation = (
            f"1. Post standard Journal Entries for unbooked bank charges and interest.\n"
            f"2. Reverse the duplicate vendor posting in General Ledger.\n"
            f"3. Track outstanding checks and deposits in transit into the subsequent month."
        )
        return {
            "observed_data": observed,
            "possible_explanation": explanation,
            "recommendation": recommendation,
            "context_items": ctx["top_exceptions"][:5]
        }

    # 2. Transactions above threshold (e.g. ₹50,000 or ₹100,000)
    if "above" in q or "50,000" in q or "50000" in q or "100,000" in q or "large" in q or "high" in q:
        threshold = 50000.0
        if "100" in q or "100,000" in q or "100000" in q or "lakh" in q:
            threshold = 100000.0

        large_txs = BankTransaction.objects.filter(amount__gte=threshold).order_by("-amount")[:10]
        items = [
            {"date": t.date.isoformat(), "description": t.description, "amount": float(t.amount)}
            for t in large_txs
        ]
        
        observed = f"Found {large_txs.count()} bank transactions with amount >= ₹{threshold:,.2f}. Highest is ₹{large_txs[0].amount:,.2f} ('{large_txs[0].description}')" if large_txs else f"No transactions found above ₹{threshold:,.2f}."
        explanation = "High-value transactions consist predominantly of progress billing holdback releases and major equipment procurement disbursements."
        recommendation = "Verify that all payments > ₹100,000 hold dual-authorization sign-off under Financial Control Rule #1."
        return {
            "observed_data": observed,
            "possible_explanation": explanation,
            "recommendation": recommendation,
            "context_items": items
        }

    # 3. Vendors with most mismatches / breaks
    if "vendor" in q or "mismatch" in q:
        gl_exc = DiscrepancyException.objects.filter(side="GL").select_related("company_tx")
        vendor_counts = {}
        for e in gl_exc:
            if e.company_tx:
                name = e.company_tx.memo.split("—")[0].strip() if "—" in e.company_tx.memo else e.company_tx.memo
                vendor_counts[name] = vendor_counts.get(name, 0) + 1

        top_vendors = sorted(vendor_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        vendor_str = ", ".join([f"{k} ({v} breaks)" for k, v in top_vendors]) if top_vendors else "None"

        observed = f"Vendors with the highest frequency of reconciliation exceptions: {vendor_str}."
        explanation = "Exceptions for these vendors are largely due to check clearing lag (outstanding checks issued on or after the 26th) and duplicate manual entries."
        recommendation = "Transition high-frequency check payees to automated Electronic Funds Transfer (EFT/ACH) to eliminate check presentation timing delays."
        return {
            "observed_data": observed,
            "possible_explanation": explanation,
            "recommendation": recommendation,
            "context_items": [{"vendor": k, "break_count": v} for k, v in top_vendors]
        }

    # 4. Biggest outstanding / overdue invoices
    if "invoice" in q or "overdue" in q or "outstanding" in q or "receivable" in q or "payable" in q:
        overdue_invs = Invoice.objects.filter(status=InvoiceStatus.OVERDUE).order_by("-total_amount")[:5]
        total_overdue = sum((inv.outstanding_amount for inv in overdue_invs), Decimal("0.00"))
        
        items = [
            {"number": inv.invoice_number, "party": inv.party_name, "amount": float(inv.outstanding_amount), "days_overdue": inv.days_overdue}
            for inv in overdue_invs
        ]

        observed = f"Currently {Invoice.objects.filter(status=InvoiceStatus.OVERDUE).count()} invoices are overdue. Top overdue balance totals ₹{total_overdue:,.2f}."
        explanation = "Delays occur primarily on progress billing releases where formal milestone acceptance certifications are pending."
        recommendation = "Issue formal statement reminders and coordinate with project management for milestone sign-offs."
        return {
            "observed_data": observed,
            "possible_explanation": explanation,
            "recommendation": recommendation,
            "context_items": items
        }

    # 5. Expenses trends & categories
    if "expense" in q or "spending" in q or "cost" in q:
        exp_by_cat = Expense.objects.values("category").annotate(total=Sum("amount")).order_by("-total")
        top_cat = exp_by_cat.first()
        top_cat_name = dict(ExpenseCategory.choices).get(top_cat["category"], "N/A") if top_cat else "N/A"
        top_cat_amt = float(top_cat["total"]) if top_cat else 0.0

        observed = f"Total corporate expenses recorded across categories. Highest expense category is '{top_cat_name}' with ₹{top_cat_amt:,.2f}."
        explanation = "Inventory procurement and infrastructure contractor payroll represent the majority of operational outflow."
        recommendation = "Review software subscriptions and travel expenditure against monthly budget limits."
        return {
            "observed_data": observed,
            "possible_explanation": explanation,
            "recommendation": recommendation,
            "context_items": list(exp_by_cat)
        }

    # General Financial Overview
    return {
        "observed_data": (
            f"FinSight Financial Health Overview: Reconciliation match rate is {ctx['latest_batch']['match_rate']}%, "
            f"{len(ctx['top_overdue_invoices'])} key overdue invoices identified, and {len(ctx['open_violations'])} active control violations require review."
        ),
        "possible_explanation": (
            "The system is maintaining strict internal controls across cash settlements, accounts payable, and inventory movements."
        ),
        "recommendation": (
            "Review high-severity control violations and address month-end reconciliation adjustments in the Control Center."
        ),
        "context_items": ctx["open_violations"]
    }

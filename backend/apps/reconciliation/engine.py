"""
Reconciliation Engine — High precision 3-Pass Bank-to-GL Matching & Anomaly Classifier
"""

import re
from datetime import datetime, date
from difflib import SequenceMatcher
from decimal import Decimal
import pandas as pd
import numpy as np
from django.utils import timezone
from .models import (
    ReconciliationBatch,
    BankTransaction,
    CompanyTransaction,
    ReconciliationMatch,
    DiscrepancyException,
    BatchStatus,
    MatchStatus,
    ExceptionSide,
    ExceptionCategory,
    ExceptionStatus,
)
from apps.controls.rules import evaluate_financial_controls

STOPWORDS = {
    "EFT", "PAD", "POS", "DEP", "CHQ", "ADP", "PPD", "INC", "LTD",
    "SVC", "PMT", "PAYMENT", "INVOICE", "THE", "OF", "AND", "CDA",
    "CANADA", "REF", "CORP", "PVT", "LLC", "ONLINE", "TRANSFER", "NEFT", "RTGS", "IMPS", "UPI"
}

FEE_PATTERN = re.compile(r"\bFEE\b|SERVICE CHARGE|SVC CHG|\bNSF\b|OVERDRAFT|BANK CHG", re.I)
INT_PATTERN = re.compile(r"\bINTEREST\b|\bINT\b", re.I)
CHQ_PATTERN = re.compile(r"CHQ#|CHECK#|CHEQUE", re.I)
DEP_PATTERN = re.compile(r"DEP|DEPOSIT|HOLD RELEASE|MILESTONE|BILLING", re.I)


def normalize_text(desc: str) -> str:
    if not desc or not isinstance(desc, str):
        return ""
    text = re.sub(r"(CHQ#\d+|REF\d+|INV-\d+|TXN\d+)", "", desc, flags=re.I)
    tokens = [t for t in re.findall(r"[A-Z0-9]+", text.upper()) if t not in STOPWORDS]
    return " ".join(tokens)


def text_similarity(str_a: str, str_b: str) -> float:
    norm_a = normalize_text(str_a)
    norm_b = normalize_text(str_b)
    if not norm_a or not norm_b:
        return 0.0
    seq = SequenceMatcher(None, norm_a, norm_b).ratio()
    tokens_a = set(norm_a.split())
    tokens_b = set(norm_b.split())
    jaccard = len(tokens_a & tokens_b) / len(tokens_a | tokens_b) if (tokens_a | tokens_b) else 0.0
    return max(seq, jaccard)


def execute_reconciliation(batch: ReconciliationBatch):
    """
    Executes 3-pass reconciliation on the given batch.
    """
    batch.status = BatchStatus.PROCESSING
    batch.save()

    try:
        bank_txs = list(batch.bank_transactions.all())
        gl_txs = list(batch.company_transactions.all())

        # Clear existing matches/exceptions for rerun
        batch.matches.all().delete()
        batch.exceptions.all().delete()
        for b in bank_txs:
            b.is_reconciled = False
        for g in gl_txs:
            g.is_reconciled = False

        bank_open = {b.id: b for b in bank_txs}
        gl_open = {g.id: g for g in gl_txs}

        matches_to_create = []

        # =========================================================================
        # PASS 1 — EXACT MATCH: Same signed amount (cents) AND same date
        # =========================================================================
        gl_exact_map = {}
        for gid, g in gl_open.items():
            key = (g.cents_key, g.date)
            gl_exact_map.setdefault(key, []).append(gid)

        for bid in list(bank_open.keys()):
            b = bank_open[bid]
            key = (b.cents_key, b.date)
            if key in gl_exact_map and gl_exact_map[key]:
                gid = gl_exact_map[key].pop(0)
                g = gl_open.pop(gid)
                del bank_open[bid]

                b.is_reconciled = True
                g.is_reconciled = True

                matches_to_create.append(
                    ReconciliationMatch(
                        batch=batch,
                        bank_tx=b,
                        company_tx=g,
                        pass_name="Exact",
                        confidence_score=100.0,
                        amount_delta=Decimal("0.00"),
                        date_delta=0,
                        fuzzy_score=1.0,
                        status=MatchStatus.APPROVED,
                    )
                )

        # =========================================================================
        # PASS 2 — TIMING MATCH: Same signed amount, date within ±TIMING_WINDOW_DAYS
        # =========================================================================
        gl_cents_map = {}
        for gid, g in gl_open.items():
            gl_cents_map.setdefault(g.cents_key, []).append(gid)

        timing_window = batch.timing_window_days

        for bid in list(bank_open.keys()):
            b = bank_open[bid]
            if b.cents_key in gl_cents_map and gl_cents_map[b.cents_key]:
                candidates = gl_cents_map[b.cents_key]
                best_gid = None
                best_diff = None

                for gid in candidates:
                    g = gl_open[gid]
                    diff = abs((b.date - g.date).days)
                    if diff <= timing_window:
                        if best_diff is None or diff < best_diff:
                            best_diff = diff
                            best_gid = gid

                if best_gid is not None:
                    candidates.remove(best_gid)
                    g = gl_open.pop(best_gid)
                    del bank_open[bid]

                    b.is_reconciled = True
                    g.is_reconciled = True

                    # Confidence calculation based on clearing days
                    confidence = max(88.0, 100.0 - (best_diff * 2.0))

                    matches_to_create.append(
                        ReconciliationMatch(
                            batch=batch,
                            bank_tx=b,
                            company_tx=g,
                            pass_name="Timing",
                            confidence_score=round(confidence, 1),
                            amount_delta=Decimal("0.00"),
                            date_delta=(b.date - g.date).days,
                            fuzzy_score=round(text_similarity(b.description, g.memo), 2),
                            status=MatchStatus.APPROVED,
                        )
                    )

        # =========================================================================
        # PASS 3 — TOLERANCE + FUZZY MATCH: Amount within tolerance, date within ±7 days, fuzzy score >= threshold
        # =========================================================================
        tol_cents = int(round(float(batch.tolerance_amount) * 100))
        fuzzy_threshold = batch.fuzzy_threshold
        tol_window_days = 7

        for bid in list(bank_open.keys()):
            b = bank_open[bid]
            best_gid = None
            best_score = -1.0
            best_date_diff = 0
            best_amt_diff = 0.0

            for gid, g in gl_open.items():
                # Same sign check (both positive or both negative)
                if (b.cents_key > 0 and g.cents_key > 0) or (b.cents_key < 0 and g.cents_key < 0):
                    amt_diff = abs(b.cents_key - g.cents_key)
                    if amt_diff <= tol_cents:
                        date_diff = abs((b.date - g.date).days)
                        if date_diff <= tol_window_days:
                            sim = text_similarity(b.description, g.memo)
                            if sim >= fuzzy_threshold and sim > best_score:
                                best_score = sim
                                best_gid = gid
                                best_date_diff = (b.date - g.date).days
                                best_amt_diff = float(b.amount - g.amount)

            if best_gid is not None:
                g = gl_open.pop(best_gid)
                del bank_open[bid]

                b.is_reconciled = True
                g.is_reconciled = True

                # Confidence: fuzzy weight (60%) + amount closeness (25%) + date closeness (15%)
                amt_factor = max(0.0, 1.0 - (abs(best_amt_diff) / (float(batch.tolerance_amount) or 1.0)))
                date_factor = max(0.0, 1.0 - (abs(best_date_diff) / tol_window_days))
                confidence = (best_score * 60.0) + (amt_factor * 25.0) + (date_factor * 15.0)

                matches_to_create.append(
                    ReconciliationMatch(
                        batch=batch,
                        bank_tx=b,
                        company_tx=g,
                        pass_name="Tolerance",
                        confidence_score=round(confidence, 1),
                        amount_delta=Decimal(f"{best_amt_diff:.2f}"),
                        date_delta=best_date_diff,
                        fuzzy_score=round(best_score, 2),
                        status=MatchStatus.APPROVED if confidence >= 75.0 else MatchStatus.PENDING_REVIEW,
                    )
                )

        # Bulk save matches & updated transactions
        ReconciliationMatch.objects.bulk_create(matches_to_create)
        BankTransaction.objects.bulk_update(bank_txs, ["is_reconciled"])
        CompanyTransaction.objects.bulk_update(gl_txs, ["is_reconciled"])

        # =========================================================================
        # CLASSIFY EXCEPTIONS
        # =========================================================================
        exceptions_to_create = []

        # Bank side unmatched
        for b in bank_open.values():
            desc = b.description
            amt = b.amount
            abs_amt = abs(amt)

            if FEE_PATTERN.search(desc):
                cat = ExceptionCategory.NSF if "NSF" in desc.upper() else ExceptionCategory.BANK_CHARGE
                reason = "Bank charge / fee not booked in General Ledger"
                action = f"Book Journal Entry: DR 6220 Bank Charges / CR 1010 Cash (₹{abs_amt:.2f})"
            elif INT_PATTERN.search(desc):
                cat = ExceptionCategory.INTEREST
                if amt > 0:
                    reason = "Interest earned credited by bank — not in GL"
                    action = f"Book Journal Entry: DR 1010 Cash / CR 7010 Interest Income (₹{abs_amt:.2f})"
                else:
                    reason = "Interest charged by bank — not in GL"
                    action = f"Book Journal Entry: DR 6210 Interest Expense / CR 1010 Cash (₹{abs_amt:.2f})"
            elif amt > 0:
                cat = ExceptionCategory.UNIDENTIFIED_CREDIT
                reason = "Unidentified bank credit — funds received without matching invoice/customer entry"
                action = f"Investigate with AR & operations: trace remittance source before booking (₹{abs_amt:.2f})"
            else:
                cat = ExceptionCategory.UNIDENTIFIED_DEBIT
                reason = "Unidentified bank debit — funds withdrawn without matching AP/expense entry"
                action = f"Investigate with AP: verify payee details and obtain invoice (₹{abs_amt:.2f})"

            exceptions_to_create.append(
                DiscrepancyException(
                    batch=batch,
                    side=ExceptionSide.BANK,
                    bank_tx=b,
                    category=cat,
                    amount=amt,
                    reason=reason,
                    suggested_action=action,
                )
            )

        # GL side unmatched
        # Check for potential duplicates among matched GL transactions
        matched_gl_tuples = {(m.company_tx.amount, m.company_tx.memo) for m in matches_to_create}

        for g in gl_open.values():
            amt = g.amount
            abs_amt = abs(amt)
            memo = g.memo
            doc = g.doc_no or ""

            if (g.amount, g.memo) in matched_gl_tuples:
                cat = ExceptionCategory.DUPLICATE_POSTING
                reason = f"Duplicate posting in GL: an identical entry already cleared the bank"
                action = f"Reverse duplicate Journal Entry #{doc or 'GL'} (₹{abs_amt:.2f})"
            elif CHQ_PATTERN.search(doc) or CHQ_PATTERN.search(memo) or amt < 0:
                cat = ExceptionCategory.OUTSTANDING_CHECK
                reason = "Outstanding payment / check written near period end — not yet presented at bank"
                action = "Carry on reconciliation as timing item; confirm clearing in subsequent statement"
            elif DEP_PATTERN.search(memo) or amt > 0:
                cat = ExceptionCategory.DEPOSIT_IN_TRANSIT
                reason = "Deposit in transit — receipt booked at month-end, clearing bank early next period"
                action = "Verify funds credited in subsequent bank statement"
            else:
                cat = ExceptionCategory.MISSING_TRANSACTION
                reason = "GL entry not reflected in bank statement"
                action = "Investigate transaction status with accounting team"

            exceptions_to_create.append(
                DiscrepancyException(
                    batch=batch,
                    side=ExceptionSide.GL,
                    company_tx=g,
                    category=cat,
                    amount=amt,
                    reason=reason,
                    suggested_action=action,
                )
            )

        # Sort exceptions by absolute dollar exposure descending and assign ranks
        exceptions_to_create.sort(key=lambda e: abs(e.amount), reverse=True)
        for idx, exc in enumerate(exceptions_to_create, start=1):
            exc.rank = idx

        DiscrepancyException.objects.bulk_create(exceptions_to_create)

        # =========================================================================
        # RECONCILIATION PROOF SUMMARY
        # =========================================================================
        total_bank_delta = sum(b.amount for b in bank_txs)
        total_gl_delta = sum(g.amount for g in gl_txs)

        bank_closing = batch.opening_balance + total_bank_delta
        gl_closing = batch.opening_balance + total_gl_delta

        # Breakdowns
        dit_total = sum(e.amount for e in exceptions_to_create if e.category == ExceptionCategory.DEPOSIT_IN_TRANSIT)
        os_total = sum(e.amount for e in exceptions_to_create if e.category == ExceptionCategory.OUTSTANDING_CHECK)
        unbooked_total = sum(e.amount for e in exceptions_to_create if e.category in [ExceptionCategory.BANK_CHARGE, ExceptionCategory.INTEREST, ExceptionCategory.NSF])
        dup_total = sum(e.amount for e in exceptions_to_create if e.category == ExceptionCategory.DUPLICATE_POSTING)
        unid_total = sum(e.amount for e in exceptions_to_create if e.category in [ExceptionCategory.UNIDENTIFIED_CREDIT, ExceptionCategory.UNIDENTIFIED_DEBIT])
        residual_total = sum(m.amount_delta for m in matches_to_create if m.pass_name == "Tolerance")

        adj_bank = bank_closing + dit_total + os_total
        adj_gl = gl_closing + unbooked_total - dup_total + unid_total + residual_total
        unreconciled_diff = round(adj_bank - adj_gl, 2)

        batch.total_bank_rows = len(bank_txs)
        batch.total_gl_rows = len(gl_txs)
        batch.matched_count = len(matches_to_create)
        batch.exception_count = len(exceptions_to_create)
        batch.bank_closing_balance = bank_closing
        batch.gl_closing_balance = gl_closing
        batch.adjusted_bank_balance = adj_bank
        batch.adjusted_gl_balance = adj_gl
        batch.unreconciled_difference = unreconciled_diff
        batch.match_rate = round((len(matches_to_create) / (len(bank_txs) or 1)) * 100, 1)
        batch.status = BatchStatus.COMPLETED
        batch.completed_at = timezone.now()
        batch.save()

        # Run financial control checks automatically
        evaluate_financial_controls(batch=batch)

        return batch

    except Exception as exc:
        batch.status = BatchStatus.FAILED
        batch.save()
        raise exc

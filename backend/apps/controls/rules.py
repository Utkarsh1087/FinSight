"""
Financial Control Rules Evaluator
"""

from decimal import Decimal
from datetime import date
from django.utils import timezone
from .models import ControlRule, ControlViolation, RuleType, ViolationSeverity, ViolationStatus
from apps.notifications.utils import create_notification, NotificationType

def ensure_default_rules():
    """
    Ensures default financial control rules are populated in DB.
    """
    default_rules = [
        {
            "rule_type": RuleType.HIGH_PAYMENT,
            "name": "High Value Payment Rule (> ₹100,000)",
            "description": "Requires executive approval and secondary audit for any single outgoing payment or expense exceeding ₹100,000.",
            "severity": ViolationSeverity.CRITICAL,
            "threshold_amount": Decimal("100000.00"),
            "requires_admin_approval": True,
        },
        {
            "rule_type": RuleType.DUPLICATE_TRANSACTION,
            "name": "Duplicate Payment Detection Rule",
            "description": "Detects identical payments or invoice entries posted multiple times with matching amounts and dates.",
            "severity": ViolationSeverity.HIGH,
            "threshold_amount": Decimal("0.00"),
            "requires_admin_approval": True,
        },
        {
            "rule_type": RuleType.AMOUNT_MISMATCH,
            "name": "Invoice vs Settlement Amount Variance",
            "description": "Flags discrepancies where bank settlement amount differs from booked invoice amount.",
            "severity": ViolationSeverity.HIGH,
            "threshold_amount": Decimal("10.00"),
            "requires_admin_approval": False,
        },
        {
            "rule_type": RuleType.OVERDUE_INVOICE,
            "name": "Critical Overdue Invoice (> 15 Days)",
            "description": "Triggers alert for any invoice unpaid beyond 15 days past the due date.",
            "severity": ViolationSeverity.MEDIUM,
            "threshold_amount": Decimal("0.00"),
            "requires_admin_approval": False,
        },
        {
            "rule_type": RuleType.UNMATCHED_NO_INVOICE,
            "name": "Unmatched Debit without Invoice",
            "description": "Flags bank withdrawals that have no corresponding AP invoice or expense receipt in the system.",
            "severity": ViolationSeverity.HIGH,
            "threshold_amount": Decimal("5000.00"),
            "requires_admin_approval": True,
        },
    ]

    for rule_data in default_rules:
        ControlRule.objects.get_or_create(
            rule_type=rule_data["rule_type"],
            defaults=rule_data
        )


def evaluate_financial_controls(batch=None, invoice=None, expense=None):
    """
    Evaluates enabled control rules against transactions, batches, invoices, and expenses.
    """
    ensure_default_rules()
    active_rules = {r.rule_type: r for r in ControlRule.objects.filter(is_enabled=True)}

    # 1. Evaluate Expense high value check
    if expense and RuleType.HIGH_PAYMENT in active_rules:
        rule = active_rules[RuleType.HIGH_PAYMENT]
        if expense.amount >= rule.threshold_amount:
            # Check if violation already exists
            if not ControlViolation.objects.filter(
                rule=rule,
                related_entity_type="Expense",
                related_entity_id=str(expense.id)
            ).exists():
                ControlViolation.objects.create(
                    rule=rule,
                    title=f"High Value Expense: ₹{expense.amount:,.2f} to {expense.vendor}",
                    description=f"Expense '{expense.title}' recorded for ₹{expense.amount:,.2f} exceeds policy threshold of ₹{rule.threshold_amount:,.2f}.",
                    severity=rule.severity,
                    related_entity_type="Expense",
                    related_entity_id=str(expense.id)
                )
                create_notification(
                    title="High Value Payment Flagged",
                    message=f"Expense of ₹{expense.amount:,.2f} to {expense.vendor} requires approval.",
                    notification_type=NotificationType.LARGE_TRANSACTION,
                    metadata={"expense_id": expense.id}
                )

    # 2. Evaluate Invoice overdue check
    if invoice and RuleType.OVERDUE_INVOICE in active_rules:
        rule = active_rules[RuleType.OVERDUE_INVOICE]
        if invoice.days_overdue > 15:
            if not ControlViolation.objects.filter(
                rule=rule,
                related_entity_type="Invoice",
                related_entity_id=str(invoice.id)
            ).exists():
                ControlViolation.objects.create(
                    rule=rule,
                    title=f"Critical Overdue Invoice #{invoice.invoice_number} ({invoice.days_overdue} days)",
                    description=f"Invoice #{invoice.invoice_number} from/to {invoice.party_name} for ₹{invoice.outstanding_amount:,.2f} is {invoice.days_overdue} days overdue.",
                    severity=rule.severity,
                    related_entity_type="Invoice",
                    related_entity_id=str(invoice.id)
                )
                create_notification(
                    title="Overdue Invoice Alert",
                    message=f"Invoice #{invoice.invoice_number} ({invoice.party_name}) is {invoice.days_overdue} days overdue.",
                    notification_type=NotificationType.OVERDUE_INVOICE,
                    metadata={"invoice_id": invoice.id}
                )

    # 3. Evaluate Reconciliation Batch exceptions for control violations
    if batch:
        for exc in batch.exceptions.all():
            # Check duplicate rule
            if exc.category == "DUPLICATE_POSTING" and RuleType.DUPLICATE_TRANSACTION in active_rules:
                rule = active_rules[RuleType.DUPLICATE_TRANSACTION]
                if not ControlViolation.objects.filter(
                    rule=rule,
                    related_entity_type="DiscrepancyException",
                    related_entity_id=str(exc.id)
                ).exists():
                    ControlViolation.objects.create(
                        rule=rule,
                        title=f"Duplicate Payment Detected: ₹{abs(exc.amount):,.2f}",
                        description=f"Batch '{batch.name}': {exc.reason}. Suggested Action: {exc.suggested_action}",
                        severity=rule.severity,
                        related_entity_type="DiscrepancyException",
                        related_entity_id=str(exc.id)
                    )
                    create_notification(
                        title="Duplicate Payment Detected",
                        message=f"Duplicate GL entry of ₹{abs(exc.amount):,.2f} detected in batch '{batch.name}'.",
                        notification_type=NotificationType.DUPLICATE_PAYMENT,
                        metadata={"exception_id": exc.id, "batch_id": batch.id}
                    )

            # Check unidentified withdrawals / unmatched no invoice
            if exc.category == "UNIDENTIFIED_DEBIT" and RuleType.UNMATCHED_NO_INVOICE in active_rules:
                rule = active_rules[RuleType.UNMATCHED_NO_INVOICE]
                if abs(exc.amount) >= rule.threshold_amount:
                    if not ControlViolation.objects.filter(
                        rule=rule,
                        related_entity_type="DiscrepancyException",
                        related_entity_id=str(exc.id)
                    ).exists():
                        ControlViolation.objects.create(
                            rule=rule,
                            title=f"Unmatched Bank Debit: ₹{abs(exc.amount):,.2f}",
                            description=f"Bank withdrawal of ₹{abs(exc.amount):,.2f} has no matching company invoice or GL entry.",
                            severity=rule.severity,
                            related_entity_type="DiscrepancyException",
                            related_entity_id=str(exc.id)
                        )
                        create_notification(
                            title="Unmatched Debit Alert",
                            message=f"Unmatched bank debit of ₹{abs(exc.amount):,.2f} needs investigation.",
                            notification_type=NotificationType.CONTROL_VIOLATION,
                            metadata={"exception_id": exc.id}
                        )

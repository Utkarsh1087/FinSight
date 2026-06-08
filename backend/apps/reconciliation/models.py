from django.db import models
from django.conf import settings
from decimal import Decimal

class BatchStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PROCESSING = "PROCESSING", "Processing"
    COMPLETED = "COMPLETED", "Completed"
    FAILED = "FAILED", "Failed"

class MatchStatus(models.TextChoices):
    PENDING_REVIEW = "PENDING_REVIEW", "Pending Review"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"

class ExceptionSide(models.TextChoices):
    BANK = "BANK", "Bank Side"
    GL = "GL", "Company/GL Side"

class ExceptionCategory(models.TextChoices):
    BANK_CHARGE = "BANK_CHARGE", "Bank Charge / Service Fee"
    INTEREST = "INTEREST", "Interest Income / Expense"
    NSF = "NSF", "NSF Returned Item"
    UNIDENTIFIED_CREDIT = "UNIDENTIFIED_CREDIT", "Unidentified Credit"
    UNIDENTIFIED_DEBIT = "UNIDENTIFIED_DEBIT", "Unidentified Debit"
    OUTSTANDING_CHECK = "OUTSTANDING_CHECK", "Outstanding Check / Payment"
    DEPOSIT_IN_TRANSIT = "DEPOSIT_IN_TRANSIT", "Deposit in Transit"
    DUPLICATE_POSTING = "DUPLICATE_POSTING", "Possible Duplicate Posting"
    AMOUNT_MISMATCH = "AMOUNT_MISMATCH", "Amount Mismatch"
    DATE_MISMATCH = "DATE_MISMATCH", "Date Mismatch"
    MISSING_TRANSACTION = "MISSING_TRANSACTION", "Missing Transaction"

class ExceptionStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    RESOLVED = "RESOLVED", "Resolved"
    IGNORED = "IGNORED", "Ignored"

class ReconciliationBatch(models.Model):
    name = models.CharField(max_length=255)
    period = models.CharField(max_length=100, default="June 2026")
    status = models.CharField(
        max_length=20,
        choices=BatchStatus.choices,
        default=BatchStatus.PENDING,
        db_index=True
    )
    bank_file = models.FileField(upload_to="reconciliation/bank_files/", blank=True, null=True)
    gl_file = models.FileField(upload_to="reconciliation/gl_files/", blank=True, null=True)
    
    total_bank_rows = models.IntegerField(default=0)
    total_gl_rows = models.IntegerField(default=0)
    matched_count = models.IntegerField(default=0)
    exception_count = models.IntegerField(default=0)
    
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("184352.19"))
    bank_closing_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    gl_closing_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    adjusted_bank_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    adjusted_gl_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    unreconciled_difference = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    
    match_rate = models.FloatField(default=0.0)
    timing_window_days = models.IntegerField(default=5)
    tolerance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("1.00"))
    fuzzy_threshold = models.FloatField(default=0.35)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reconciliation_batches"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.period}) - {self.status}"


class BankTransaction(models.Model):
    batch = models.ForeignKey(ReconciliationBatch, on_delete=models.CASCADE, related_name="bank_transactions")
    date = models.DateField(db_index=True)
    description = models.CharField(max_length=255)
    reference = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    is_reconciled = models.BooleanField(default=False, db_index=True)
    cents_key = models.IntegerField(db_index=True, default=0)

    class Meta:
        ordering = ["date", "id"]

    def save(self, *args, **kwargs):
        self.cents_key = int(round(float(self.amount) * 100))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bank: {self.date} | {self.description} | ₹{self.amount}"


class CompanyTransaction(models.Model):
    batch = models.ForeignKey(ReconciliationBatch, on_delete=models.CASCADE, related_name="company_transactions")
    date = models.DateField(db_index=True)
    account = models.CharField(max_length=150, default="1010 Cash — Operating")
    memo = models.CharField(max_length=255)
    doc_no = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    is_reconciled = models.BooleanField(default=False, db_index=True)
    cents_key = models.IntegerField(db_index=True, default=0)

    class Meta:
        ordering = ["date", "id"]

    def save(self, *args, **kwargs):
        self.cents_key = int(round(float(self.amount) * 100))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"GL: {self.date} | {self.memo} | {self.doc_no} | ₹{self.amount}"


class ReconciliationMatch(models.Model):
    batch = models.ForeignKey(ReconciliationBatch, on_delete=models.CASCADE, related_name="matches")
    bank_tx = models.ForeignKey(BankTransaction, on_delete=models.CASCADE, related_name="matched_pair")
    company_tx = models.ForeignKey(CompanyTransaction, on_delete=models.CASCADE, related_name="matched_pair")
    
    pass_name = models.CharField(max_length=50, default="Exact") # Exact, Timing, Tolerance, Manual
    confidence_score = models.FloatField(default=100.0) # 0 to 100 %
    amount_delta = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    date_delta = models.IntegerField(default=0) # Days difference
    fuzzy_score = models.FloatField(default=1.0)
    
    status = models.CharField(
        max_length=20,
        choices=MatchStatus.choices,
        default=MatchStatus.APPROVED,
        db_index=True
    )
    review_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_matches"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-confidence_score", "id"]

    def __str__(self):
        return f"Match ({self.pass_name}) - Bank {self.bank_tx_id} <-> GL {self.company_tx_id} [{self.confidence_score}%]"


class DiscrepancyException(models.Model):
    batch = models.ForeignKey(ReconciliationBatch, on_delete=models.CASCADE, related_name="exceptions")
    side = models.CharField(max_length=10, choices=ExceptionSide.choices, db_index=True)
    bank_tx = models.ForeignKey(BankTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name="exception_records")
    company_tx = models.ForeignKey(CompanyTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name="exception_records")
    
    category = models.CharField(
        max_length=50,
        choices=ExceptionCategory.choices,
        default=ExceptionCategory.MISSING_TRANSACTION,
        db_index=True
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    reason = models.CharField(max_length=255)
    suggested_action = models.TextField()
    rank = models.IntegerField(default=1)
    
    status = models.CharField(
        max_length=20,
        choices=ExceptionStatus.choices,
        default=ExceptionStatus.OPEN,
        db_index=True
    )
    review_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_exceptions"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-amount", "id"]

    def __str__(self):
        return f"Exception [{self.side}] {self.get_category_display()}: ₹{self.amount} - {self.reason}"

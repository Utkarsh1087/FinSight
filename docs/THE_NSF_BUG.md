# The NSF Bug: A Domain Pattern-Matching Case Study

*A case study on regex boundary vulnerabilities in financial text parsing, how edge-case testing caught it, and why precision matters in automated accounting systems.*

---

## The setup

In the initial implementation of the exception classifier — the component that inspects unmatched bank transactions — a simple substring pattern was used to detect bank charges:

```python
FEE_PATTERN = re.compile(r"FEE|SERVICE CHARGE|SVC CHG|NSF|OVERDRAFT", re.I)
```

Monthly account fee matches `FEE`. NSF returned item matches `NSF`. Wire service charge matches `SERVICE CHARGE`.

## The edge case

During synthetic edge-case verification, an incoming Interac e-transfer was tested — $2,150 hitting the bank account with no matching entry in the books. The expected diagnosis is:
*"unidentified bank credit — verify origin before booking."*

The engine's diagnosis:

> **E-TRANSFER RECEIVED T4X99A** → *Bank charge — not booked in GL.*
> *Suggested action: Book JE — DR 6220 Bank Charges / CR 1010 Cash.*

The unanchored classifier had evaluated $2,150 of incoming funds and incorrectly recommended
**debiting it to bank-charge expense**.

## The analysis

Inspecting the description string:

```
E - T R A - N S F - E R
        ↑ ↑ ↑
```

**tra·NSF·er.** The letters N-S-F — added to catch *non-sufficient funds* fees — sit directly within the word "transfer." The unanchored regex lacked word boundaries, causing it to match NSF inside common banking words like e-transfer, wire transfer, and inter-account transfers.

## The fix

Adding word boundary anchors:

```python
# before
FEE_PATTERN = re.compile(r"FEE|SERVICE CHARGE|SVC CHG|NSF|OVERDRAFT", re.I)

# after
FEE_PATTERN = re.compile(r"\bFEE\b|SERVICE CHARGE|SVC CHG|\bNSF\b|OVERDRAFT", re.I)
```

`\b` is a word boundary anchor — requiring NSF to stand alone as a distinct token. "NSF RETURNED ITEM FEE" matches, whereas "E-TRANSFER" does not. `\bFEE\b` and interest regexes were hardened identically to avoid matching vendors such as "McAfee" or "Fee-land".

## Key Takeaways

1. **Deterministic Edge-Case Verification**: Synthetic data ensures every expected failure and classification branch has a verifiable, ground-truth test case.
2. **Domain-Specific Logic Bugs**: In financial automation, silent misclassifications (such as routing a deposit to an expense account) are far more hazardous than crashes.
3. **Word Boundaries in Regex**: Substring matching on financial memo fields requires token boundary enforcement (`\b`).

---

*The fixed pattern lives in [`src/reconcile.py`](../src/reconcile.py) — see
`FEE_PATTERN`. The e-transfer row that caught it is planted in
[`src/generate_data.py`](../src/generate_data.py) under the bank-only exceptions.*

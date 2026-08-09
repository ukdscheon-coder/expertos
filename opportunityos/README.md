# OpportunityOS MVP

A mobile-first PWA prototype for Business Opportunity Intelligence.

## What it does
- Company DNA profile
- Rule + semantic keyword scoring
- Eligibility uncertainty caps
- APPLY / REVIEW / CONTACT / PREPARE / MONITOR / AUTOMATE / SKIP actions
- Saved opportunities
- £29 Business Opportunity Intelligence Report preview
- Print/PDF report
- PWA offline cache

## Safety / data integrity
All bundled opportunities are explicitly marked DEMO. The prototype never presents them as live tenders. A production connector must preserve source URL, issuer, fetched_at, eligibility evidence and source status before `APPLY` is allowed.

## Simulation issues handled
1. Missing or invalid company profile -> safe defaults.
2. Expired/invalid deadlines -> score 0 or unknown date.
3. Unknown eligibility -> score capped below high-confidence levels.
4. Foreign/local ambiguity -> risk warning and score cap.
5. Empty filtered results -> empty state.
6. localStorage blocked -> app continues without persistence.
7. External text injection -> HTML escaped before render.
8. Mobile safe-area / bottom nav -> iPhone safe-area CSS.
9. Offline mode -> service worker with network-first fallback.
10. Demo vs live data confusion -> persistent DEMO warnings and source labels.

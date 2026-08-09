# OpportunityOS MVP Simulation Report

## Tested personas
1. UK healthcare/AI SME, max project £250k
2. Korean healthcare importer, max project £50k
3. Unrelated UK bakery profile

## Expected outcomes after fixes
- UK healthcare SME: UK healthcare AI = APPLY; AI security = APPLY/REVIEW; Korea partner = CONTACT; shipping = MONITOR; automation = AUTOMATE.
- Korean importer: UK-only tender is capped below 50 and becomes SKIP; Korea partner becomes relevant; UK local/partner opportunity is capped due to local partner uncertainty.
- Unrelated business: sector-mismatched opportunities remain low and do not become APPLY.

## Problems found and fixed
### 1. Missing repository
Previous `project-legacy-app` was no longer present in the connected GitHub account.
**Fix:** OpportunityOS was added as an isolated `/opportunityos/` module inside the existing public `expertos` repository, leaving ExpertOS root files untouched.

### 2. Demo data could be mistaken for live public tenders
**Fix:** Every bundled opportunity has `demo:true`; detail view and report preview warn that official source verification is mandatory.

### 3. Unknown eligibility could still produce over-confident scores
**Fix:** Two or more unknown eligibility conditions cap confidence below 90. Demo data is capped at 94. Local-partner uncertainty caps cross-border opportunities.

### 4. UK-only tender could be recommended to a non-UK company
**Fix:** `foreign=uk_only` caps a non-UK company below 50, automatically changing APPLY to SKIP.

### 5. Expired opportunities
**Fix:** Parsed expired deadlines receive score 0 and disappear from recommendation results.

### 6. Country aliases caused false mismatches
`KR` did not initially match user-entered `Korea`.
**Fix:** Added market normalisation for UK/Britain/United Kingdom, KR/Korea/South Korea, EU/Europe, and Global/Worldwide.

### 7. localStorage can fail in privacy mode
**Fix:** persistence is wrapped in try/catch; core analysis continues without storage.

### 8. External text may contain HTML/script payloads
**Fix:** all opportunity text is escaped before insertion into generated HTML.

### 9. iPhone safe area could cover bottom navigation
**Fix:** CSS uses `env(safe-area-inset-top/bottom)` and a fixed safe-area-aware bottom navigation.

### 10. Network loss
**Fix:** service worker uses a network-first cache with offline fallback to the app shell.

## Still intentionally not production-ready
- Live Contracts Finder / Find a Tender ingestion
- Supabase company/account persistence
- Stripe payment
- Real LLM eligibility extraction
- Source hash / fetched_at audit trail
- Automatic email alerts
- Authentication and multi-tenant security

These are next-stage integrations; the current build is a functional UX and decision-engine MVP designed to validate whether users will pay for the report and ranked actions before infrastructure cost is added.

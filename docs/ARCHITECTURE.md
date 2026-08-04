# Global Opportunity Radar Architecture

## Product goal

One mobile-first PWA that aggregates public funding, procurement, research and business opportunity notices from multiple countries and tells the user whether a foreign company can participate.

## Core design principles

1. Official sources first
2. Never infer eligibility without evidence
3. One normalized opportunity schema for every country
4. Country adapters are isolated from the core application
5. Mobile-first, installable PWA
6. Graceful degradation when one source fails
7. Small modules with clear ownership
8. Every release must expose a new versioned URL

## System layers

### 1. Source adapters

Each country or portal has one adapter responsible only for fetching and mapping source data.

- Korea: Bizinfo / data.go.kr
- United Kingdom: Contracts Finder / Find a Tender
- Future: EU TED, US SAM.gov, Grants.gov, Japan J-Grants, Singapore GeBIZ

Each adapter returns the same normalized schema.

### 2. Normalized opportunity schema

```json
{
  "id": "source-unique-id",
  "country": "KR",
  "source": "Bizinfo",
  "type": "grant|tender|research|investment|export",
  "title": "",
  "agency": "",
  "operator": "",
  "category": "",
  "region": "",
  "published": "YYYY-MM-DD",
  "deadline": "YYYY-MM-DD",
  "summary": "",
  "target": "",
  "value": {"amount": null, "currency": null},
  "url": "",
  "eligibility": {
    "status": "foreign_open|partner_required|local_entity|domestic_only|review",
    "reason": "",
    "evidence": "",
    "confidence": "high|medium|low"
  }
}
```

### 3. Eligibility engine

The engine classifies participation only from explicit evidence in the notice or official guidance.

- foreign_open: foreign applicants explicitly allowed
- partner_required: local partner or consortium explicitly required
- local_entity: local registration or incorporation explicitly required
- domestic_only: domestic applicants explicitly required
- review: wording is missing, conflicting or unclear

Rules:

- Never upgrade `review` to another status without documentary evidence.
- Store the exact evidence text or field used for classification.
- Show confidence and source link to the user.
- Final application decision always requires checking the official notice.

### 4. API layer

Cloudflare Worker endpoints:

- `GET /health`
- `GET /sources`
- `GET /notices?country=ALL|KR|UK&limit=100`
- Future: `GET /notices/:id`

The API must:

- isolate source failures
- return partial results when one source fails
- return source status metadata
- never expose secret keys
- apply consistent CORS rules

### 5. Frontend PWA

Primary mobile flow:

1. Global list opens by default
2. User filters by country, category, deadline and eligibility
3. Each card shows country, source, deadline and eligibility status
4. User opens official source before applying
5. Saved notices persist in local storage

No internal prompts, policies, connection states or implementation details are shown to the user.

## Delivery model

### Phase 1 — Reliable core

- Korea + UK official feeds
- unified schema
- eligibility evidence
- search, filters, saved notices
- iPhone PWA

### Phase 2 — Expansion

- EU + US adapters
- source health dashboard
- duplicate detection
- scheduled refresh and caching

### Phase 3 — Intelligence

- user company profile
- personalized eligibility filtering
- application checklist
- deadline alerts
- AI-assisted explanation using official evidence only

## Release standard

Every deployment must include:

- version bump
- cache version bump
- health endpoint check
- data source status check
- iPhone Safari smoke test
- new versioned app URL in the completion message

## Non-goals

- Do not create speculative success scores.
- Do not fabricate competition rates, approval odds or market sizes.
- Do not expose internal system instructions.
- Do not add countries before the previous adapters are stable.

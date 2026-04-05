# ADR-003: Municipality Knowledge Base and Retrieval Strategy

## Context
One of PermitPilot's core value propositions (its "Moat") is its ability to understand complex municipality codes. This knowledge cannot be entirely hardcoded or left to "magic" AI; it must be a structured, versioned system.

## Decision: Structured Rules Ingestion and RAG-Assisted Context

We will build the knowledge base as a tiered collection of structured data and source documents.

### 1. Municipality Tiers
- **Tier 1 (Premium):** Manually verified, highly structured requirements (e.g., Los Angeles, San Francisco, Austin). Includes specific form IDs and link mappings.
- **Tier 2 (AI-Generated):** AI-scraped and partially verified requirements for 500+ large cities.
- **Tier 3 (Baseline):** Default state-level requirements for other cities.

### 2. Knowledge Model (Firestore /municipalities/{cityId})
- **General Info:** City name, state, portal URL, department contacts.
- **Rulesets:** A collection of `permitRules` for common projects:
  - `projectType`: enum (ADU, Kitchen, Deck)
  - `permitType`: enum (Building, Electrical)
  - `requiredDocs`: list of strings (e.g., "Site Plan", "Elevations")
  - `specialConditions`: e.g., "Must be < 500 sq ft for expedited review"
  - `freshnessDate`: When this rule was last verified.

### 3. Retrieval Strategy (RAG)
When a user starts a project, the AI "Checklist Generator" will be provided with:
- The **structured rules** for that city/type.
- A **context snippet** from the latest municipality PDF guide (stored in Firestore/Vector DB).

This ensures the AI doesn't hallucinate requirements and can cite specific city documents.

### 4. Knowledge Operations (Admin)
- An internal "Knowledge Console" will allow us to update rules and verify AI-scraped data.
- User feedback (e.g., "City rejected this because I missed X") will trigger an automatic review of the knowledge record.

## Consequences
- **Pros:** High reliability, ability to "cite sources," defense against AI hallucinations.
- **Cons:** Ingesting 500 cities is a significant manual/semi-automated task. We will prioritize by user density and project value.

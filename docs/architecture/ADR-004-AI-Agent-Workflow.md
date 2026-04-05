# ADR-004: AI Agent Workflow Integration (Genkit)

## Context
AI should be a "pilot," not a "black box." Existing Genkit flows (Checklist, Autofill, Validation) must be integrated into the persistent application state and user feedback loop.

## Decision: Agent-Centric Workflow with Persistent Context

We will refactor existing flows to use the Firestore domain model as context and store their outputs as "Recommendations."

### 1. Refactored AI Agents
- **Project Planner (Flow: `generate-permit-checklist`):**
  - **Inputs:** Project Photos, Voice/Text Description, Municipality context (from ADR-003).
  - **Output:** A structured `ProjectPlan` (list of permits needed).
  - **Action:** Saves recommended permits to `/projects/{projectId}/permits/` as `DRAFT`.
- **Permit Specialist (Flow: `generate-checklist-items`):**
  - **Inputs:** Permit Type, Project context, Municipality rules (ADR-003).
  - **Output:** A structured `Checklist` (list of docs/tasks).
  - **Action:** Populates `/projects/{projectId}/permits/{permitId}/checklistItems/`.
- **Document Reviewer (Flow: `validate-application-against-codes`):**
  - **Inputs:** Uploaded Document (OCR text/image), Checklist requirement ID.
  - **Output:** Validation status (Pass/Fail) and reason.
  - **Action:** Updates `status` and `validationMessage` in `checklistItems`.

### 2. User Feedback Loop (The "Pilot" Interaction)
- AI outputs are never applied silently. They appear as "AI Recommendations" for the user to approve or reject.
- User rejection of an AI recommendation is logged to improve the model or the knowledge base (ADR-003).

### 3. Safety and Auditing
- Every AI-generated output stores its **Genkit flow ID**, **model version**, and **timestamp**.
- High-risk decisions (e.g., "Submission is Ready") must pass a stricter AI validation or require human override.

## Consequences
- **Pros:** Transparent AI, data-driven improvement, reliable and traceable operations.
- **Cons:** More complex UI to handle "Proposed" vs "Applied" states.

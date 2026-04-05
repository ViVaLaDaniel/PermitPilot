# ADR-002: Permit Application Lifecycle and State Machine

## Context
Permit applications follow a strict sequence of events. To reduce errors and improve trust, PermitPilot must enforce valid state transitions and guard specific actions (like submission) with requirement checks.

## Decision: Explicit Finite State Machine (FSM)

Each `Permit` in `/projects/{projectId}/permits/` will follow this lifecycle.

### 1. States
- **DRAFT:** Default state. User is collecting initial project details and generating the checklist.
- **READY_FOR_SUBMISSION:** All mandatory checklist items have a `status` of `Uploaded` or `Validated`.
- **SUBMITTED:** The permit package has been sent (manually or via adapter).
- **IN_REVIEW:** Confirmation from the municipality received.
- **REVISIONS_REQUIRED:** Feedback received; some checklist items marked as `Error`.
- **APPROVED:** Permit granted.
- **INSPECTION_SCHEDULED:** Post-approval phase; inspection date set.
- **FINALED:** Project complete and closed by the municipality.

### 2. Guardrails and Actions
- **Submission Guard:** The "Submit" action remains disabled until the state is `READY_FOR_SUBMISSION`.
- **Requirement Validation:** AI/Human validation of a document transitions a checklist item from `Uploaded` to `Validated`.
- **Status Sync:** Status changes in the municipality portal (if monitored) trigger a transition from `SUBMITTED` to `IN_REVIEW` or `APPROVED`.

### 3. State Management Implementation
- State transitions will be logged in `/projects/{projectId}/permits/{permitId}/history/{historyId}` to provide a timeline view.
- Client-side logic will use the state to determine UI visibility (e.g., hiding the upload button after `SUBMITTED`).

## Consequences
- **Pros:** Clear progress tracking for the contractor, reduced likelihood of incomplete submissions.
- **Cons:** Requires rigorous validation logic to ensure the "Ready" state is actually accurate.

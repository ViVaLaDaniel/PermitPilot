# PermitPilot Architecture

## Product intent

`PermitPilot` should become an AI-assisted permit operations platform for contractors and project managers.

The product must help teams:

- determine which permits are needed
- collect and validate required documents
- track permit workflow status
- reduce submission errors and missed inspections

## Current state

The repository already has stronger product intent than most of the portfolio:

- Next.js app structure
- Firebase-oriented backend thinking
- AI tooling via Genkit / Google GenAI
- a clear blueprint in `docs/blueprint.md`
- an initial domain sketch in `docs/backend.json`

That is a good start, but the system still reads more like a concept with screens than an operating product.

## Architectural diagnosis

What is strong:

- the problem is expensive and real
- the product scope is business-facing
- the repo already implies workflows, not just UI

What is still weak:

- no explicit system decomposition
- no stable workflow state machine
- no municipality knowledge lifecycle
- no submission adapter architecture
- no review and audit model

## Target system

The target product should have five major layers:

1. customer workspace
2. permit intelligence layer
3. document workflow layer
4. submission and tracking layer
5. admin and municipality ops layer

## Target user surfaces

Core surfaces:

- project dashboard
- permit checklist workspace
- document autofill workspace
- permit status timeline
- municipality knowledge view
- admin review and operations console

## Core domains

Minimum domain entities:

- `Organization`
- `User`
- `Project`
- `Municipality`
- `PermitType`
- `PermitRequirement`
- `PermitApplication`
- `Checklist`
- `ChecklistItem`
- `Document`
- `DocumentExtraction`
- `ValidationIssue`
- `SubmissionAttempt`
- `InspectionEvent`
- `NotificationEvent`
- `AuditEvent`

## Workflow architecture

The main workflow should be:

1. user creates project
2. system resolves municipality and project type
3. permit intelligence layer proposes permit set
4. checklist is generated from municipality requirements
5. user uploads documents and project data
6. autofill pipeline extracts and maps fields
7. validation layer finds missing or conflicting data
8. submission layer either prepares package or pushes to adapter
9. tracking layer updates status and inspections

## AI architecture

AI should be used as a controlled subsystem, not as unchecked magic.

Needed AI responsibilities:

- site/project classification
- permit requirement retrieval
- document extraction
- field normalization
- validation explanation
- checklist generation

Needed safeguards:

- source-backed municipality knowledge
- confidence scoring
- human-review path for low-confidence outputs
- prompt and model version tracking
- auditability of AI-generated recommendations

## Municipality knowledge architecture

This is one of the product's moats and must be designed explicitly.

Needed components:

- municipality source registry
- normalized permit requirement model
- update pipeline for code changes
- versioned requirement records
- confidence and freshness metadata

## Submission architecture

Submission should not be treated as one generic step.

Use an adapter model:

- `manual package export`
- `headless browser submission adapter`
- `email or upload handoff adapter`

This keeps the platform usable even when each municipality behaves differently.

## Data and storage direction

Recommended truth model:

- relational database for projects, applications, requirements and statuses
- object storage for uploaded documents
- job queue for extraction, validation and notifications
- analytics store or derived tables for cycle-time and SLA visibility

## Security and compliance

Required safeguards:

- role-based access per organization
- audit trail for checklist and status changes
- server-side secret handling
- signed access to stored files
- clear separation between AI suggestion and final user action

## Gap analysis

What still needs to be built or clarified:

- a stable project and permit state machine
- structured municipality knowledge ingestion
- document processing pipeline
- adapter-based submission strategy
- review and exception handling model
- admin operations surface

## Architectural decision

This project should stay one of the flagship repos.

The right path is to harden the workflow and system design around one believable contractor use case first, then expand municipality coverage and automation depth.

# PermitPilot Tasks

## Current objective

Turn `PermitPilot` into a believable permit operations MVP with one strong contractor workflow.

## Phase 0: Product contract

- [ ] Define the first ICP: GC, small contractor, permit expeditor, or operations manager
- [ ] Define the first project type for MVP
- [ ] Define the first municipality or municipality set for launch
- [ ] Define the smallest useful permit workflow end to end

## Phase 1: Domain foundation

- [ ] Finalize the domain model for project, permit, checklist, document and inspection entities
- [ ] Define the permit application state machine
- [ ] Define requirement freshness and municipality versioning model
- [ ] Choose the primary database and storage strategy

## Phase 2: Knowledge layer

- [ ] Build a normalized municipality requirement model
- [ ] Define a municipality knowledge ingestion process
- [ ] Add freshness metadata and confidence scoring for requirement records
- [ ] Add admin tools for correcting municipality knowledge

## Phase 3: Document workflow

- [ ] Implement file upload and storage
- [ ] Implement document extraction pipeline
- [ ] Implement field mapping into application forms
- [ ] Implement validation issue generation and review
- [ ] Implement checklist completion tracking

## Phase 4: Submission and tracking

- [ ] Define the first submission adapter strategy
- [ ] Implement package export or manual submission support first
- [ ] Track submission attempts and status history
- [ ] Add inspection dates and reminder workflow
- [ ] Add notification events for status changes

## Phase 5: Customer workspace

- [ ] Build project dashboard truth around real project data
- [ ] Build permit checklist workspace
- [ ] Build document autofill workspace on real entities
- [ ] Build status timeline view
- [ ] Add role-aware views for owner vs operator

## Phase 6: Admin and governance

- [ ] Add admin review queue for low-confidence AI results
- [ ] Add municipality operations console
- [ ] Add audit logs for status and checklist changes
- [ ] Add permissions and organization boundaries

## Phase 7: Quality and delivery

- [ ] Add `.env.example`
- [ ] Add smoke tests for project creation, checklist generation and status tracking
- [ ] Add error monitoring and job failure visibility
- [ ] Upgrade README and screenshots to flagship-case quality

## Definition of done for MVP

- [ ] A contractor can create a project and see required permits
- [ ] The system generates and stores a usable checklist
- [ ] Documents can be uploaded and validated
- [ ] Permit status and inspection timeline are tracked on real data
- [ ] AI outputs are reviewable and not treated as blind truth
- [ ] The repo reads like an operating product, not a concept shell

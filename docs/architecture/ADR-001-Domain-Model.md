# ADR-001: Domain Model and Persistence Strategy

## Context
PermitPilot currently uses a conceptual Firestore structure defined in `docs/backend.json`. To turn it into a flagship product, we need a stable domain model that supports:
- Multi-tenancy (Organizations).
- Complex permit workflows (multiple permits per project).
- Granular requirement tracking (checklists).
- AI-assisted document processing.

## Decision: Hierarchical Multi-Tenant Firestore Structure

We will use a path-based ownership model to simplify security rules and querying.

### 1. User and Organization Layer
- `/users/{userId}`: User profile, preferences, and organization membership.
- `/organizations/{orgId}`: Shared workspace for teams (future-proofing).

### 2. Project Layer
- `/projects/{projectId}`: The central entity for a specific site/address.
  - `name`: string
  - `address`: object (street, city, state, zip)
  - `municipalityId`: string (reference to `/municipalities/`)
  - `projectType`: enum (Residential_ADU, Commercial_Renovation, etc.)
  - `createdBy`: userId
  - `createdAt`: timestamp

### 3. Permit Layer
- `/projects/{projectId}/permits/{permitId}`: Specific permit applications.
  - `type`: enum (Building, Electrical, Plumbing, Mechanical)
  - `status`: enum (Draft, Ready_for_Submission, Submitted, In_Review, Approved, Rejected, Inspection_Scheduled, Finaled)
  - `checklistId`: string (reference to the generated checklist)
  - `submittedAt`: timestamp
  - `approvedAt`: timestamp
  - `inspectionDate`: timestamp

### 4. Requirement and Checklist Layer
- `/projects/{projectId}/permits/{permitId}/checklistItems/{itemId}`: Individual tasks or documents.
  - `label`: string (e.g., "Site Plan")
  - `description`: string
  - `status`: enum (Pending, Uploaded, Validated, Error)
  - `documentId`: string (reference to the uploaded file)
  - `isRequired`: boolean
  - `aiConfidence`: number (if generated/validated by AI)

### 5. Municipality Knowledge Layer (The "Moat")
- `/municipalities/{cityId}`: General city info and metadata.
- `/municipalities/{cityId}/permitRules/{typeId}`: Structured rules for AI context.
  - `requirements`: array of objects (name, description, typical_forms)
  - `averageProcessingTime`: number (days)
  - `lastUpdated`: timestamp
  - `sourceUrls`: array of strings

## Persistence Choice: Firebase Firestore & Storage
- **Firestore:** For real-time updates and hierarchical data.
- **Firebase Storage:** For binary files (blueprints, PDFs), using a matching path structure: `projects/{projectId}/permits/{permitId}/documents/{docId}`.

## Consequences
- **Pros:** Fast development, real-time sync, clear ownership in paths.
- **Cons:** Denormalization is required for global analytics (e.g., "all pending permits across all projects"). This will be handled via Collection Group queries or a future migration to a relational DB (Supabase/Postgres) if the relational complexity exceeds Firestore's limits.

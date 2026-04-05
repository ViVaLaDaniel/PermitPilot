
export type PermitStatus = 
  | 'DRAFT' 
  | 'READY_FOR_SUBMISSION' 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'REVISIONS_REQUIRED' 
  | 'APPROVED' 
  | 'INSPECTION_SCHEDULED' 
  | 'FINALED';

export type ChecklistItemStatus = 'PENDING' | 'UPLOADED' | 'VALIDATED' | 'ERROR';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: ChecklistItemStatus;
  isRequired: boolean;
  documentId?: string; // Reference to Firebase Storage path
  validationMessage?: string;
}

export interface Permit {
  id: string;
  type: 'Building' | 'Electrical' | 'Plumbing' | 'Mechanical';
  status: PermitStatus;
  checklist: ChecklistItem[];
  submittedAt?: string;
  approvedAt?: string;
  inspectionDate?: string;
  history: {
    status: PermitStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  projectType: 'ADU' | 'Residential_Remodel' | 'Commercial_FitOut';
  municipalityId: 'los-angeles' | 'san-francisco' | 'austin'; // Starting with LA
  permits: Permit[];
  createdAt: string;
  createdBy: string;
}

// Knowledge Base Structure for MVP
export interface MunicipalityRules {
  cityId: string;
  cityName: string;
  projects: {
    type: string;
    description: string;
    requiredPermits: {
      type: string;
      requirements: {
        label: string;
        description: string;
        isRequired: boolean;
      }[];
    }[];
  }[];
}

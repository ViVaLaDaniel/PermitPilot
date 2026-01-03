export type Permit = {
  id: string;
  projectName: string;
  permitType: string;
  status: 'Approved' | 'In Review' | 'Rejected' | 'Inspection Scheduled';
  submittedDate: string;
  approvedDate?: string;
  inspectionDate?: string;
  city: string;
};

export const mockPermits: Permit[] = [
  {
    id: 'PERMIT-001',
    projectName: 'Downtown Office Renovation',
    permitType: 'Building',
    status: 'Approved',
    submittedDate: '2023-10-15',
    approvedDate: '2023-11-05',
    city: 'San Francisco, CA',
  },
  {
    id: 'PERMIT-002',
    projectName: 'Lakeside Deck Construction',
    permitType: 'Deck',
    status: 'Inspection Scheduled',
    submittedDate: '2023-11-01',
    approvedDate: '2023-11-20',
    inspectionDate: '2023-12-10',
    city: 'Austin, TX',
  },
  {
    id: 'PERMIT-003',
    projectName: 'Suburban Kitchen Remodel',
    permitType: 'Electrical',
    status: 'In Review',
    submittedDate: '2023-11-18',
    city: 'New York, NY',
  },
  {
    id: 'PERMIT-004',
    projectName: 'Commercial HVAC Upgrade',
    permitType: 'Mechanical',
    status: 'In Review',
    submittedDate: '2023-11-22',
    city: 'Chicago, IL',
  },
  {
    id: 'PERMIT-005',
    projectName: 'New Residential Foundation',
    permitType: 'Foundation',
    status: 'Rejected',
    submittedDate: '2023-10-20',
    city: 'Houston, TX',
  },
];

export type Municipality = {
    id: string;
    city: string;
    state: string;
    permitProbabilityScore: number;
    website: string;
};

export const mockMunicipalities: Municipality[] = [
    { id: '1', city: 'New York', state: 'NY', permitProbabilityScore: 65, website: 'https://www.nyc.gov/site/buildings/index.page' },
    { id: '2', city: 'Los Angeles', state: 'CA', permitProbabilityScore: 72, website: 'https://www.ladbs.org/' },
    { id: '3', city: 'Chicago', state: 'IL', permitProbabilityScore: 58, website: 'https://www.chicago.gov/city/en/depts/bldgs.html' },
    { id: '4', city: 'Houston', state: 'TX', permitProbabilityScore: 85, website: 'https://www.houstonpermittingcenter.org/' },
    { id: '5', city: 'Phoenix', state: 'AZ', permitProbabilityScore: 88, website: 'https://www.phoenix.gov/pdd' },
    { id: '6', city: 'Philadelphia', state: 'PA', permitProbabilityScore: 61, website: 'https://www.phila.gov/li/' },
    { id: '7', city: 'San Antonio', state: 'TX', permitProbabilityScore: 82, website: 'https://www.sanantonio.gov/dsd' },
    { id: '8', city: 'San Diego', state: 'CA', permitProbabilityScore: 75, website: 'https://www.sandiego.gov/development-services' },
    { id: '9', city: 'Dallas', state: 'TX', permitProbabilityScore: 84, website: 'https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/Pages/default.aspx' },
    { id: '10', city: 'San Jose', state: 'CA', permitProbabilityScore: 78, website: 'https://www.sanjoseca.gov/your-government/departments/planning-building-code-enforcement' },
];

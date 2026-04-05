import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  type Firestore,
  DocumentReference,
  CollectionReference
} from "firebase/firestore";
import { 
  Project, 
  Permit, 
  ChecklistItem, 
  PermitStatus, 
  ChecklistItemStatus 
} from "@/lib/data";
import { type GeneratePermitChecklistOutput } from "@/ai/flows/generate-permit-checklist-from-photos-and-voice";

/**
 * Service to handle project lifecycle in Firestore according to ADR-001/002.
 * Structure: projects/{projectId} -> permits/{permitId} -> checklistItems/{itemId}
 */

export const projectService = {
  /**
   * Creates a full project structure from AI recommendation
   */
  async createProject(
    firestore: Firestore, 
    userId: string, 
    data: GeneratePermitChecklistOutput
  ): Promise<string> {
    const projectRef = doc(collection(firestore, "projects"));
    const projectId = projectRef.id;

    const projectData: Partial<Project> = {
      id: projectId,
      name: data.projectName,
      projectType: data.projectType as any,
      municipalityId: data.municipalityId as any,
      address: {
        street: "", // To be filled by user later
        city: data.municipalityId === 'los-angeles' ? 'Los Angeles' : '',
        state: 'CA',
        zip: ""
      },
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    // 1. Create the main project document
    await setDoc(projectRef, projectData);

    // 2. Create permits and their checklist items
    for (const permitRec of data.permits) {
      const permitRef = doc(collection(firestore, `projects/${projectId}/permits`));
      const permitId = permitRef.id;

      const permitData: Partial<Permit> = {
        id: permitId,
        type: permitRec.type,
        status: 'DRAFT',
        history: [{
          status: 'DRAFT',
          timestamp: new Date().toISOString(),
          note: 'Project initialized from AI recommendation'
        }]
      };

      await setDoc(permitRef, permitData);

      // 3. Create checklist items for each permit
      const checklistItemsCol = collection(firestore, `projects/${projectId}/permits/${permitId}/checklistItems`);
      
      for (const req of permitRec.requirements) {
        const itemRef = doc(checklistItemsCol);
        const itemData: ChecklistItem = {
          id: itemRef.id,
          label: req.label,
          description: req.description,
          status: 'PENDING',
          isRequired: req.isRequired
        };
        await setDoc(itemRef, itemData);
      }
    }

    return projectId;
  },

  /**
   * Reads a project with its permits and checklist items
   */
  async getProjectWithPermits(firestore: Firestore, projectId: string): Promise<Project | null> {
    const projectSnap = await getDoc(doc(firestore, "projects", projectId));
    
    if (!projectSnap.exists()) return null;
    
    const project = projectSnap.data() as Project;
    
    // Get permits
    const permitsSnap = await getDocs(collection(firestore, `projects/${projectId}/permits`));
    project.permits = [];

    for (const permitDoc of permitsSnap.docs) {
      const permit = permitDoc.data() as Permit;
      
      // Get checklist items for each permit
      const itemsSnap = await getDocs(collection(firestore, `projects/${projectId}/permits/${permit.id}/checklistItems`));
      permit.checklist = itemsSnap.docs.map(d => d.data() as ChecklistItem);
      
      project.permits.push(permit);
    }

    return project;
  },

  /**
   * Gets all projects for a specific user
   */
  async getUserProjects(firestore: Firestore, userId: string): Promise<Project[]> {
    const q = query(collection(firestore, "projects"), where("createdBy", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const projects: Project[] = [];
    for (const doc of querySnapshot.docs) {
      const p = doc.data() as Project;
      // Note: This only returns the top-level project data. 
      // Individual permits should be fetched on the detail page for performance.
      projects.push(p);
    }
    return projects;
  },

  /**
   * Updates a single checklist item and re-evaluates permit status
   */
  async updateChecklistItem(
    firestore: Firestore,
    projectId: string,
    permitId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ): Promise<void> {
    const itemRef = doc(firestore, `projects/${projectId}/permits/${permitId}/checklistItems`, itemId);
    await updateDoc(itemRef, updates);

    // After each update, check if we need to transition the permit status
    await this.evaluatePermitStatus(firestore, projectId, permitId);
  },

  /**
   * Implementation of ADR-002 state machine: 
   * Transition DRAFT -> READY_FOR_SUBMISSION when all required items are uploaded/validated.
   */
  async evaluatePermitStatus(firestore: Firestore, projectId: string, permitId: string): Promise<void> {
    const permitRef = doc(firestore, `projects/${projectId}/permits`, permitId);
    const permitSnap = await getDoc(permitRef);
    if (!permitSnap.exists()) return;

    const permit = permitSnap.data() as Permit;
    
    // Only transition from DRAFT or REVISIONS_REQUIRED
    if (permit.status !== 'DRAFT' && permit.status !== 'REVISIONS_REQUIRED') return;

    const itemsSnap = await getDocs(collection(firestore, `projects/${projectId}/permits/${permitId}/checklistItems`));
    const items = itemsSnap.docs.map(d => d.data() as ChecklistItem);

    const requiredItems = items.filter(i => i.isRequired);
    const allRequiredCompleted = requiredItems.every(i => i.status === 'UPLOADED' || i.status === 'VALIDATED');

    if (allRequiredCompleted && requiredItems.length > 0) {
      const newStatus: PermitStatus = 'READY_FOR_SUBMISSION';
      await updateDoc(permitRef, {
        status: newStatus,
        history: arrayUnion({
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: 'Automatic transition: All required documents uploaded.'
        })
      });
    }
  }
};

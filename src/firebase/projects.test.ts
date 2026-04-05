import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from './projects';
import { 
  setDoc, 
  getDoc, 
  getDocs, 
  doc, 
  collection, 
  updateDoc 
} from 'firebase/firestore';

vi.mock('firebase/firestore');

describe('projectService', () => {
  const mockFirestore = {} as any;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project with permits and checklist items', async () => {
      const mockRecommendation = {
        projectName: 'Test ADU',
        projectType: 'ADU',
        municipalityId: 'los-angeles',
        permits: [
          {
            type: 'Building',
            requirements: [
              { label: 'Site Plan', description: 'Plot plan', isRequired: true }
            ]
          }
        ]
      } as any;

      // Mock doc and collection to return strings or refs
      vi.mocked(doc).mockReturnValue({ id: 'project-id' } as any);
      vi.mocked(collection).mockReturnValue({} as any);

      const projectId = await projectService.createProject(mockFirestore, mockUserId, mockRecommendation);

      expect(projectId).toBe('project-id');
      expect(setDoc).toHaveBeenCalled();
      expect(doc).toHaveBeenCalled();
    });
  });

  describe('evaluatePermitStatus', () => {
    it('should transition to READY_FOR_SUBMISSION when all required items are uploaded', async () => {
      const projectId = 'proj-1';
      const permitId = 'perm-1';

      // Mock permit data
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'DRAFT' })
      } as any);

      // Mock checklist items - all required items are UPLOADED
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { data: () => ({ isRequired: true, status: 'UPLOADED' }) },
          { data: () => ({ isRequired: false, status: 'PENDING' }) }
        ]
      } as any);

      await projectService.evaluatePermitStatus(mockFirestore, projectId, permitId);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'READY_FOR_SUBMISSION' })
      );
    });

    it('should not transition if required items are missing', async () => {
      const projectId = 'proj-1';
      const permitId = 'perm-1';

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'DRAFT' })
      } as any);

      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          { data: () => ({ isRequired: true, status: 'PENDING' }) }
        ]
      } as any);

      await projectService.evaluatePermitStatus(mockFirestore, projectId, permitId);

      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
});

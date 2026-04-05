import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Permit, Project } from "./data";

/**
 * Bundles all VALIDATED documents of a specific permit into a ZIP file,
 * along with a summary text file containing extracted AI data.
 */
export async function exportPermitPackage(project: Project, permit: Permit) {
  const zip = new JSZip();
  const folderName = `${project.name.replace(/[^a-z0-9]/gi, '_')}_${permit.type}_Permit_Package`;
  const folder = zip.folder(folderName);
  if (!folder) throw new Error("Could not create ZIP folder");

  let summaryContent = `PERMIT SUBMISSION PACKAGE\n`;
  summaryContent += `Project: ${project.name}\n`;
  summaryContent += `Address: ${project.address.street}, ${project.address.city}, ${project.address.state} ${project.address.zip}\n`;
  summaryContent += `Type: ${project.projectType}\n`;
  summaryContent += `Permit: ${permit.type}\n`;
  summaryContent += `Municipality: ${project.municipalityId}\n`;
  summaryContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
  summaryContent += `--- EXTRACTED DATA SUMMARY ---\n\n`;

  const validatedItems = permit.checklist.filter(item => item.status === 'VALIDATED' || item.status === 'UPLOADED');
  
  if (validatedItems.length === 0) {
    throw new Error("No validated or uploaded documents to export.");
  }

  for (const item of validatedItems) {
    if (!item.documentId) continue;

    // Build the summary
    summaryContent += `[${item.label}]\n`;
    summaryContent += `Description: ${item.description}\n`;
    if (item.extractedData && Object.keys(item.extractedData).length > 0) {
      summaryContent += `AI Extracted Fields:\n`;
      Object.entries(item.extractedData).forEach(([key, value]) => {
        summaryContent += `  - ${key}: ${value}\n`;
      });
    } else {
      summaryContent += `No extracted data.\n`;
    }
    summaryContent += `\n`;

    // Fetch and add the file to the ZIP
    try {
      // In a real app, this requires CORS to be set up on the Firebase Storage bucket.
      // For MVP, we attempt to fetch the public download URL.
      // We will need the actual download URL stored, or we need to resolve it.
      // Wait, `item.documentId` currently holds the storage path (e.g. projects/.../documents/...)
      // But we don't store the URL. We should import getStorage and getDownloadURL.
      const { getStorage, ref, getDownloadURL } = await import("firebase/storage");
      const storage = getStorage();
      const fileRef = ref(storage, item.documentId);
      const url = await getDownloadURL(fileRef);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${item.label}`);
      
      const blob = await response.blob();
      // Extract extension from the path or mime type
      const ext = item.documentId.split('.').pop() || 'pdf'; 
      const safeLabel = item.label.replace(/[^a-z0-9]/gi, '_');
      
      folder.file(`${safeLabel}.${ext}`, blob);
    } catch (error) {
      console.error(`Error adding ${item.label} to zip:`, error);
      summaryContent += `ERROR: Could not include file for ${item.label} in this package.\n\n`;
    }
  }

  folder.file("Submission_Summary.txt", summaryContent);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${folderName}.zip`);
}

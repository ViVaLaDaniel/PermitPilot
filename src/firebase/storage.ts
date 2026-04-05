import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadDocument(projectId: string, permitId: string, itemId: string, file: File): Promise<{url: string, path: string}> {
  const storage = getStorage();
  const path = `projects/${projectId}/permits/${permitId}/documents/${itemId}_${file.name}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  return { url, path };
}

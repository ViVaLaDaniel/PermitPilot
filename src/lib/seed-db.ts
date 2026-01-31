"use server";
import { collection, writeBatch, getDocs, Firestore, doc } from "firebase/firestore";
import { mockMunicipalities, mockPermits } from "./data";

/**
 * Seeds the 'municipalities' and user-specific 'permits' collections in Firestore.
 * This function is intended to be called from a server-side script or a one-time admin action.
 * It checks if the collections are empty before seeding to prevent duplicate data.
 *
 * @param firestore - The Firestore database instance.
 * @param userId - The ID of the user for whom to seed permit data.
 */
export async function seedDatabase(firestore: Firestore, userId: string) {
  // Seed Municipalities
  const municipalitiesRef = collection(firestore, "municipalities");
  const municipalitiesSnapshot = await getDocs(municipalitiesRef);
  if (municipalitiesSnapshot.empty) {
    const municipalitiesBatch = writeBatch(firestore);
    mockMunicipalities.forEach((municipality) => {
      const docRef = doc(collection(firestore, "municipalities"), municipality.id);
      municipalitiesBatch.set(docRef, municipality);
    });
    await municipalitiesBatch.commit();
    console.log("Database 'municipalities' has been seeded.");
  } else {
    console.log("'municipalities' collection already contains data. Seeding skipped.");
  }

  // Seed Permits for a specific user
  const userPermitsRef = collection(firestore, `users/${userId}/permits`);
  const userPermitsSnapshot = await getDocs(userPermitsRef);
  if (userPermitsSnapshot.empty) {
    const permitsBatch = writeBatch(firestore);
    mockPermits.forEach((permit) => {
      // Note: In a real scenario, you'd likely want unique IDs, but for mock data this is okay.
      const docRef = doc(collection(firestore, `users/${userId}/permits`), permit.id);
      permitsBatch.set(docRef, permit);
    });
    await permitsBatch.commit();
    console.log(`Database 'permits' for user ${userId} has been seeded.`);
  } else {
    console.log(`'permits' collection for user ${userId} already contains data. Seeding skipped.`);
  }
}

import { db, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { updateDeck } from './firestore';

// Initialize Storage
const storage = getStorage(db);

// Upload deck file
export async function uploadDeck(file: File, deckId: string): Promise<string> {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Create storage reference: decks/{userId}/{deckId}/{fileName}
  const storageRef = ref(storage, `decks/${user.uid}/${deckId}/${file.name}`);
  
  // Upload file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

// Delete deck file
export async function deleteDeckFile(fileUrl: string): Promise<void> {
  const fileRef = ref(storage, fileUrl);
  await deleteObject(fileRef);
}

// Upload profile picture
export async function uploadProfilePicture(file: File): Promise<string> {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

export { storage };

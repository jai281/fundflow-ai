import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

// Collections
const USERS_COLLECTION = 'users';
const DECKS_COLLECTION = 'decks';
const INVESTORS_COLLECTION = 'investors';
const MATCHES_COLLECTION = 'matches';
const OUTREACH_COLLECTION = 'outreach';

// User operations
export async function createUser(userId: string, data: {
  email: string;
  name: string;
  stage: string;
  sector: string;
  geography: string;
  createdAt: Timestamp;
}) {
  await addDoc(collection(db, USERS_COLLECTION), {
    userId,
    ...data,
  });
}

export async function getUser(userId: string) {
  const q = query(collection(db, USERS_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

// Deck operations
export async function createDeck(data: {
  userId: string;
  fileName: string;
  fileUrl?: string;
  readinessScore?: number;
  feedback?: DocumentData;
  status: 'uploaded' | 'analyzing' | 'completed' | 'error';
  createdAt: Timestamp;
}) {
  const docRef = await addDoc(collection(db, DECKS_COLLECTION), data);
  return docRef.id;
}

export async function getDeck(deckId: string) {
  const docRef = doc(db, DECKS_COLLECTION, deckId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateDeck(deckId: string, data: Partial<{
  readinessScore: number;
  feedback: DocumentData;
  status: string;
  fileUrl: string;
}>) {
  const docRef = doc(db, DECKS_COLLECTION, deckId);
  await updateDoc(docRef, data);
}

export async function getUserDecks(userId: string) {
  const q = query(
    collection(db, DECKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Investor operations
export async function createInvestor(data: {
  name: string;
  firm: string;
  type: 'angel' | 'vc' | 'accelerator';
  stages: string[];
  sectors: string[];
  geography: string[];
  chequeSizeMin?: number;
  chequeSizeMax?: number;
  contactEmail?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  notes?: string;
}) {
  await addDoc(collection(db, INVESTORS_COLLECTION), data);
}

export async function searchInvestors(filters: {
  stages?: string[];
  sectors?: string[];
  geography?: string[];
  type?: string;
}) {
  let q = query(collection(db, INVESTORS_COLLECTION));
  
  if (filters.type) {
    q = query(q, where('type', '==', filters.type));
  }
  
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Client-side filtering for arrays
  if (filters.stages) {
    results = results.filter(inv => 
      filters.stages!.some(stage => inv.stages?.includes(stage))
    );
  }
  
  if (filters.sectors) {
    results = results.filter(inv => 
      filters.sectors!.some(sector => inv.sectors?.includes(sector))
    );
  }
  
  return results;
}

// Match operations
export async function createMatch(data: {
  userId: string;
  deckId: string;
  investorId: string;
  matchScore: number;
  reasons: string[];
  status: 'pending' | 'contacted' | 'responded' | 'meeting_scheduled';
  createdAt: Timestamp;
}) {
  await addDoc(collection(db, MATCHES_COLLECTION), data);
}

export async function getUserMatches(userId: string) {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where('userId', '==', userId),
    orderBy('matchScore', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Outreach operations
export async function createOutreach(data: {
  userId: string;
  matchId: string;
  investorId: string;
  template: string;
  status: 'draft' | 'sent' | 'opened' | 'replied';
  sentAt?: Timestamp;
}) {
  await addDoc(collection(db, OUTREACH_COLLECTION), data);
}

export async function updateOutreach(outreachId: string, data: Partial<{
  status: string;
  sentAt: Timestamp;
}>) {
  const docRef = doc(db, OUTREACH_COLLECTION, outreachId);
  await updateDoc(docRef, data);
}

export { Timestamp };

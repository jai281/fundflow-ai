import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';

// Sign up
export async function signUp(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Sign in
export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Sign out
export async function logOut() {
  await signOut(auth);
}

// Auth state listener
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Password reset
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

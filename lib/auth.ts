import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuthInstance, getDb } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const userCredential = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
  await updateProfile(userCredential.user, { displayName });
  await setDoc(doc(getDb(), 'users', userCredential.user.uid), {
    email,
    displayName,
    createdAt: new Date(),
    subscription: 'free',
  });
  return userCredential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(getAuthInstance(), email, password);
  return userCredential.user;
}

export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(getAuthInstance(), googleProvider);
  const userDoc = await getDoc(doc(getDb(), 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(getDb(), 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      createdAt: new Date(),
      subscription: 'free',
    });
  }
  return userCredential.user;
}

export async function logout() {
  await signOut(getAuthInstance());
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export type { User };

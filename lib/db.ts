import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDb, getStorageInstance } from './firebase';

export interface Conocimiento {
  id?: string;
  habilidad: string;
  snippet_conocimiento: string;
  contexto_uso: string;
  fecha_actualizacion: Date;
  multimedia_ref: string;
  tags: string[];
}

function getUserCollection(userId: string) {
  return collection(getDb(), 'users', userId, 'Memoria_Tecnica');
}

export async function addConocimiento(
  userId: string,
  data: Omit<Conocimiento, 'id' | 'fecha_actualizacion'>
) {
  const ref = await addDoc(getUserCollection(userId), {
    ...data,
    fecha_actualizacion: Timestamp.now(),
  });
  return ref.id;
}

export async function updateConocimiento(
  userId: string,
  id: string,
  data: Partial<Omit<Conocimiento, 'id' | 'fecha_actualizacion'>>
) {
  const docRef = doc(getDb(), 'users', userId, 'Memoria_Tecnica', id);
  await updateDoc(docRef, {
    ...data,
    fecha_actualizacion: Timestamp.now(),
  });
}

export async function deleteConocimiento(userId: string, id: string) {
  const docRef = doc(getDb(), 'users', userId, 'Memoria_Tecnica', id);
  await deleteDoc(docRef);
}

export async function getConocimiento(userId: string, id: string) {
  const docRef = doc(getDb(), 'users', userId, 'Memoria_Tecnica', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      fecha_actualizacion: data.fecha_actualizacion?.toDate?.() || new Date(),
    } as Conocimiento;
  }
  return null;
}

export async function getAllConocimientos(userId: string) {
  const q = query(
    getUserCollection(userId),
    orderBy('fecha_actualizacion', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      fecha_actualizacion: data.fecha_actualizacion?.toDate?.() || new Date(),
    } as Conocimiento;
  });
}

export async function getConocimientosByCategoria(
  userId: string,
  habilidad: string
) {
  const q = query(
    getUserCollection(userId),
    where('habilidad', '==', habilidad),
    orderBy('fecha_actualizacion', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      fecha_actualizacion: data.fecha_actualizacion?.toDate?.() || new Date(),
    } as Conocimiento;
  });
}

export function searchConocimientos(
  conocimientos: Conocimiento[],
  searchTerm: string
): Conocimiento[] {
  const term = searchTerm.toLowerCase();
  return conocimientos.filter(
    (c) =>
      c.habilidad.toLowerCase().includes(term) ||
      c.snippet_conocimiento.toLowerCase().includes(term) ||
      c.contexto_uso.toLowerCase().includes(term) ||
      c.tags.some((t) => t.toLowerCase().includes(term))
  );
}

export async function exportConocimientos(userId: string) {
  const data = await getAllConocimientos(userId);
  return JSON.stringify(data, null, 2);
}

export async function importConocimientos(userId: string, jsonData: string) {
  const data: Conocimiento[] = JSON.parse(jsonData);
  for (const item of data) {
    const { id, fecha_actualizacion, ...rest } = item;
    await addDoc(getUserCollection(userId), {
      ...rest,
      fecha_actualizacion: Timestamp.now(),
    });
  }
}

export async function uploadMultimedia(userId: string, file: File): Promise<string> {
  const storage = getStorageInstance();
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
  const fileRef = ref(storage, `users/${userId}/multimedia/${filename}`);
  
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

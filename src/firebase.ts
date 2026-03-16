import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "firebase/firestore";
import { Offerta } from "./types/quote";

const firebaseConfig = {
  apiKey: "AIzaSyAxaOkLqolRVhk5I1x2irwCkrla1ok6YJc",
  authDomain: "quotygenerator.firebaseapp.com",
  projectId: "quotygenerator",
  storageBucket: "quotygenerator.appspot.com",
  messagingSenderId: "1057153155273",
  appId: "1:1057153155273:web:73901c969a2c177cd18d18"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Funzione per caricare il PDF su Firebase Storage
export const uploadPDF = async (pdfBlob: Blob, uid: string, nomeCliente: string): Promise<string> => {
  const timestamp = new Date().getTime();
  const storageRef = ref(storage, `offerte/${uid}/${timestamp}_${nomeCliente}.pdf`);
  await uploadBytes(storageRef, pdfBlob);
  return getDownloadURL(storageRef);
};

// Funzione per salvare una nuova offerta su Firestore
export const saveOfferta = async (offertaData: Omit<Offerta, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, "offerte"), offertaData);
  return docRef.id;
};

// Funzione per aggiornare un'offerta esistente su Firestore
export const updateOfferta = async (offertaId: string, dataToUpdate: Partial<Offerta>): Promise<void> => {
  const offertaRef = doc(db, "offerte", offertaId);
  await updateDoc(offertaRef, dataToUpdate);
};

// Funzione per recuperare le offerte di un utente
export const getOfferteByUID = async (uid: string): Promise<Offerta[]> => {
  const q = query(
    collection(db, "offerte"), 
    where("uid", "==", uid), 
    orderBy("dataCreazione", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offerta));
};


import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, Timestamp, query, where, orderBy, deleteDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Offerta } from "./types/quote";

const firebaseConfig = {
  apiKey: "AIzaSyAxaOkLqolRVhk5I1x2irwCkrla1ok6YJc",
  authDomain: "quotygenerator.firebaseapp.com",
  projectId: "quotygenerator",
  storageBucket: "quotygenerator.appspot.com",
  messagingSenderId: "1057153155273",
  appId: "1:1057153155273:web:73901c969a2c177cd18d18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);

const offerteCollection = collection(db, "offerte");

export const saveOfferta = async (offerta: Omit<Offerta, 'id'>) => {
  const docRef = await addDoc(offerteCollection, offerta);
  return docRef.id;
};

export const updateOfferta = async (id: string, offerta: Partial<Offerta>) => {
  const offertaDoc = doc(db, "offerte", id);
  await updateDoc(offertaDoc, offerta);
};

export const getOfferte = async (uid: string): Promise<Offerta[]> => {
  const q = query(offerteCollection, where("uid", "==", uid), orderBy("dataCreazione", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offerta));
};

export const deleteOfferta = async (id: string) => {
    const offertaDoc = doc(db, "offerte", id);
    await deleteDoc(offertaDoc);
};

export const updateDataScadenza = async (offertaId: string, nuovaData: Date) => {
  const offertaDoc = doc(db, "offerte", offertaId);
  await updateDoc(offertaDoc, {
    dataScadenza: Timestamp.fromDate(nuovaData)
  });
};


import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, Timestamp, query, where, orderBy, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Offerta, Revision } from "./types/quote";

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

export const getRevisions = async (offertaId: string): Promise<Revision[]> => {
  const revisionsCollection = collection(db, `offerte/${offertaId}/revisions`);
  const q = query(revisionsCollection, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Revision));
};

export const saveRevision = async (offertaId: string, offertaCorrente: Offerta, userId: string): Promise<void> => {
  const revisionData = {
    timestamp: Timestamp.now(),
    savedBy: userId,
    snapshot: offertaCorrente,
  };
  const revisionsCollection = collection(db, `offerte/${offertaId}/revisions`);
  await addDoc(revisionsCollection, revisionData);
};

export const aggiornaProposteScadute = async (uid: string): Promise<void> => {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const offerte = await getOfferte(uid);

  const daAggiornare = offerte.filter(o => {
    if (o.stato === 'persa' || o.stato === 'vinta') return false;
    const scadenza = o.dataScadenza.toDate();
    scadenza.setHours(0, 0, 0, 0);
    return scadenza < oggi;
  });

  await Promise.all(
    daAggiornare.map(o => {
      const scadenza = o.dataScadenza.toDate();
      scadenza.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((oggi.getTime() - scadenza.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 5) {
        return updateOfferta(o.id!, { stato: 'persa' });
      } else {
        return updateOfferta(o.id!, { stato: 'scaduta' });
      }
    })
  );
};
export const getOnboardingCompletato = async (uid: string): Promise<boolean> => {
  const docRef = doc(db, 'utenti', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  return docSnap.data()?.onboardingCompletato === true;
};

export const segnaOnboardingCompletato = async (uid: string): Promise<void> => {
  const docRef = doc(db, 'utenti', uid);
  await setDoc(docRef, { onboardingCompletato: true }, { merge: true });
};
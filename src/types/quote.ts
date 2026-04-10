import { Timestamp } from "firebase/firestore";

export type DocumentType = 'standard' | 'modulo';

export interface LegaleRappresentante {
  cognome: string;
  nome: string;
  luogoDiNascita: string;
  dataDiNascita: string;
  codiceFiscale: string;
}

export interface DatiAzienda {
  partitaIva: string;
  codiceFiscaleAzienda: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono: string;
  cellulare: string;
  pec: string;
  email: string;
  codiceUnivoco: string;
}

export interface ClientData {
  ragioneSociale: string;
  partitaIva: string;
  nomeReferente: string;
  cognomeReferente: string;
  emailCliente: string;
  telefonoCliente: string;
  mezziTrattativa: string;
  documentType: DocumentType;
  legaleRappresentante: LegaleRappresentante;
  datiAzienda: DatiAzienda;
}

export interface PaymentInfo {
  condizioniPagamento: string;
  condizioniFornitura: string;
  validitaOfferta: string;
  durataContrattuale: string;
}

export interface Service {
  id: string;
  nome: string;
  descrizione: string;
  categoria: 'dispositivi' | 'fleet_vehicles' | 'crono' | 'crono_plus' | 'crono_gold' | 'crono_premium' | 'servizio_rimorchi' | 'tractor' | 'asset' | 'piattaforme' | 'servizi_aggiuntivi' | 'centrale_operativa' | 'accessori' | 'software' | 'cold' | 'driver';
  prezzoListino: number;
  prezzoScontato?: number;
  prezzoRiservato: number;
  periodo: 'MENSILE' | 'ANNUALE' | 'U.T.';
  isCrono?: boolean;
}

export interface SelectedService extends Service {
  quantita: number;
  prezzoUnitario: number;
  customTitle?: string;
  customDescription?: string;
}

export interface QuoteData {
  clientData: ClientData;
  paymentInfo: PaymentInfo;
  selectedServices: SelectedService[];
  smartRounding: boolean;
  showTotals: boolean;
  totals: {
    mensile: number;
    annuale: number;
    unaTantum: number;
    carteAziendaSuggerite: number;
  };
}

export interface Offerta {
  id?: string;
  uid: string;
  cliente: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
    azienda: string;
    partitaIva: string;
    nMezzi: number;
  };
  servizi: SelectedService[];
  condizioni: {
    durata: string;
    pagamento: string;
    validitaOfferta: string;
    note: string;
    preset: string;
  };
  totale: number;
  dataCreazione: Timestamp;
  dataScadenza: Timestamp;
  stato: 'bozza' | 'inviata' | 'scaduta' | 'persa' | 'vinta';
}

export interface Revision {
  id: string;
  timestamp: Timestamp;
  savedBy: string; // uid dell'utente che ha salvato la revisione
  snapshot: Offerta; // snapshot completo dell'offerta in quel momento
}

export interface ClientData {
  ragioneSociale: string;
  referente: string;
  numeroMezzi: number;
}

export interface Configuration {
  tipoVeicolo: 'truck' | 'light';
  durataContratto: 12 | 24 | 36 | 60;
}

export interface PaymentInfo {
  modalitaPagamento: string;
  validitaOfferta: string;
}

export interface Service {
  id: string;
  nome: string;
  descrizione: string;
  categoria: 'dispositivi' | 'fleet_base' | 'fleet_plus' | 'fleet_premium' | 'crono' | 'crono_telematica' | 'piattaforme' | 'accessori';
  prezzoListino: number;
  prezzoScontato: number;
  prezzoRiservato: number;
  periodo: 'MENSILE' | 'ANNUALE' | 'U.T.';
  isCrono?: boolean;
  applicaA?: 'truck' | 'light' | 'entrambi';
}

export interface SelectedService extends Service {
  quantita: number;
}

export interface QuoteData {
  clientData: ClientData;
  configuration: Configuration;
  paymentInfo: PaymentInfo;
  selectedServices: SelectedService[];
  totals: {
    mensile: number;
    annuale: number;
    unaTantum: number;
    carteAziendaQuantita: number;
    carteAziendaCosto: number;
  };
}

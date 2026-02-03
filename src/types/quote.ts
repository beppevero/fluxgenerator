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
  categoria: 'tachigrafo' | 'cronotachigrafo' | 'telematica' | 'accessori';
  prezzoListino: number;
  prezzoRiservato: number;
  tipo: 'mensile' | 'unaTantum';
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
    unaTantum: number;
    carteAziendaQuantita: number;
    carteAziendaCosto: number;
  };
}

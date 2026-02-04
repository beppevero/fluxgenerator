export interface ClientData {
  ragioneSociale: string;
  redattoDa: string;
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
  categoria: 'dispositivi' | 'fleet_base' | 'fleet_gold' | 'fleet_plus' | 'fleet_premium' | 'crono' | 'crono_telematica' | 'crono_premium' | 'servizio_rimorchi' | 'tractor' | 'asset' | 'piattaforme' | 'servizi_aggiuntivi' | 'centrale_operativa' | 'accessori' | 'software';
  prezzoListino: number;
  prezzoScontato: number;
  prezzoRiservato: number;
  periodo: 'MENSILE' | 'ANNUALE' | 'U.T.';
  isCrono?: boolean;
}

export interface SelectedService extends Service {
  quantita: number;
  prezzoUnitario: number; // Prezzo editabile
}

export interface QuoteData {
  clientData: ClientData;
  paymentInfo: PaymentInfo;
  selectedServices: SelectedService[];
  totals: {
    mensile: number;
    annuale: number;
    unaTantum: number;
    carteAziendaSuggerite: number;
  };
}

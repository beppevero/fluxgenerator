import { Service } from '@/types/quote';

export const servicesList: Service[] = [
  // DISPOSITIVI
  {
    id: 'dispositivo-bordo',
    nome: 'DISPOSITIVO DI BORDO',
    descrizione: 'Dispositivo GPS / 4G (dispositivo in vendita) - Localizzazione Real Time, Percorsi, Soste via WEB, App GT FLEET 365, Geofencing, Reportistica',
    categoria: 'dispositivi',
    prezzoListino: 200.00,
    prezzoScontato: 190.00,
    prezzoRiservato: 150.00,
    periodo: 'U.T.',
    applicaA: 'entrambi'
  },
  {
    id: 'dispositivo-rimorchio',
    nome: 'DISPOSITIVO RIMORCHIO',
    descrizione: 'Dispositivo GPS per Rimorchio / Batteria ricaricabile / IP67 - Localizzazione Real Time, Notifica aggancio/sgancio rimorchio',
    categoria: 'dispositivi',
    prezzoListino: 200.00,
    prezzoScontato: 180.00,
    prezzoRiservato: 162.00,
    periodo: 'U.T.',
    applicaA: 'truck'
  },

  // GT FLEET 365 BASE
  {
    id: 'fleet-base-annuale',
    nome: 'GT FLEET 365 BASE',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti, Mezzi d\'Opera (dispositivo in comodato d\'uso) - Localizzazione, App, Geofencing, Reportistica, Assistenza',
    categoria: 'fleet_base',
    prezzoListino: 200.00,
    prezzoScontato: 150.00,
    prezzoRiservato: 120.00,
    periodo: 'ANNUALE',
    applicaA: 'entrambi'
  },
  {
    id: 'fleet-base-mensile',
    nome: 'GT FLEET 365 BASE',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti, Mezzi d\'Opera (dispositivo in comodato d\'uso) - Localizzazione, App, Geofencing, Reportistica, Assistenza',
    categoria: 'fleet_base',
    prezzoListino: 19.00,
    prezzoScontato: 16.00,
    prezzoRiservato: 12.00,
    periodo: 'MENSILE',
    applicaA: 'entrambi'
  },
  {
    id: 'fleet-gold-annuale',
    nome: 'GT FLEET 365 GOLD',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti (dispositivo in comodato d\'uso) - Include funzionalità BASE + Avvisi Scadenze, Manutenzioni, Referenti Notifiche',
    categoria: 'fleet_base',
    prezzoListino: 275.00,
    prezzoScontato: 245.00,
    prezzoRiservato: 170.00,
    periodo: 'ANNUALE',
    applicaA: 'entrambi'
  },
  {
    id: 'fleet-gold-mensile',
    nome: 'GT FLEET 365 GOLD',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti (dispositivo in comodato d\'uso) - Include funzionalità BASE + Avvisi Scadenze, Manutenzioni, Referenti Notifiche',
    categoria: 'fleet_base',
    prezzoListino: 25.00,
    prezzoScontato: 22.00,
    prezzoRiservato: 17.00,
    periodo: 'MENSILE',
    applicaA: 'entrambi'
  },

  // GT FLEET 365 PLUS
  {
    id: 'fleet-plus-annuale',
    nome: 'GT FLEET 365 PLUS',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti - Include Allarme Taglio Cavi, Antijammer, Blocco Avviamento, Parking Protection, Tasto SOS',
    categoria: 'fleet_plus',
    prezzoListino: 250.00,
    prezzoScontato: 220.00,
    prezzoRiservato: 190.00,
    periodo: 'ANNUALE',
    applicaA: 'entrambi'
  },
  {
    id: 'fleet-plus-mensile',
    nome: 'GT FLEET 365 PLUS',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti - Include Allarme Taglio Cavi, Antijammer, Blocco Avviamento, Parking Protection, Tasto SOS',
    categoria: 'fleet_plus',
    prezzoListino: 23.00,
    prezzoScontato: 21.00,
    prezzoRiservato: 19.00,
    periodo: 'MENSILE',
    applicaA: 'entrambi'
  },

  // GT FLEET 365 PREMIUM
  {
    id: 'fleet-premium-annuale',
    nome: 'GT FLEET 365 PREMIUM',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti - Km da odometro, Consumo Carburante telematica, tutte le funzionalità PLUS',
    categoria: 'fleet_premium',
    prezzoListino: 297.00,
    prezzoScontato: 267.00,
    prezzoRiservato: 240.30,
    periodo: 'ANNUALE',
    applicaA: 'entrambi'
  },
  {
    id: 'fleet-premium-mensile',
    nome: 'GT FLEET 365 PREMIUM',
    descrizione: 'Mezzi Aziendali, Mezzi Pesanti - Km da odometro, Consumo Carburante telematica, tutte le funzionalità PLUS',
    categoria: 'fleet_premium',
    prezzoListino: 27.00,
    prezzoScontato: 24.00,
    prezzoRiservato: 21.60,
    periodo: 'MENSILE',
    applicaA: 'entrambi'
  },

  // GT FLEET 365 TRUCK CRONO
  {
    id: 'crono-base-annuale',
    nome: 'GT FLEET 365 TRUCK CRONO',
    descrizione: 'Mezzi Pesanti - Cronotachigrafo Digitale, Scarico File DDD, Report Truck Base, Tempi guida autista Real Time',
    categoria: 'crono',
    prezzoListino: 350.00,
    prezzoScontato: 316.00,
    prezzoRiservato: 284.40,
    periodo: 'ANNUALE',
    isCrono: true,
    applicaA: 'truck'
  },
  {
    id: 'crono-base-mensile',
    nome: 'GT FLEET 365 TRUCK CRONO',
    descrizione: 'Mezzi Pesanti - Cronotachigrafo Digitale, Scarico File DDD, Report Truck Base, Tempi guida autista Real Time',
    categoria: 'crono',
    prezzoListino: 32.00,
    prezzoScontato: 28.00,
    prezzoRiservato: 25.20,
    periodo: 'MENSILE',
    isCrono: true,
    applicaA: 'truck'
  },

  // GT FLEET 365 TRUCK CRONO TELEMATICA
  {
    id: 'crono-telematica-annuale',
    nome: 'GT FLEET 365 TRUCK CRONO TELEMATICA',
    descrizione: 'Mezzi Pesanti - Km da odometro, Consumo Carburante, Cronotachigrafo, Scarico DDD, Tempi guida Real Time',
    categoria: 'crono_telematica',
    prezzoListino: 430.00,
    prezzoScontato: 380.00,
    prezzoRiservato: 342.00,
    periodo: 'ANNUALE',
    isCrono: true,
    applicaA: 'truck'
  },
  {
    id: 'crono-telematica-mensile',
    nome: 'GT FLEET 365 TRUCK CRONO TELEMATICA',
    descrizione: 'Mezzi Pesanti - Km da odometro, Consumo Carburante, Cronotachigrafo, Scarico DDD, Tempi guida Real Time',
    categoria: 'crono_telematica',
    prezzoListino: 39.00,
    prezzoScontato: 35.00,
    prezzoRiservato: 31.50,
    periodo: 'MENSILE',
    isCrono: true,
    applicaA: 'truck'
  },

  // GT FLEET 365 TRUCK CRONO PREMIUM
  {
    id: 'crono-premium-annuale',
    nome: 'GT FLEET 365 TRUCK CRONO PREMIUM',
    descrizione: 'Mezzi Pesanti - Blocco Avviamento, Parking Protection, Allarmi, Tasto SOS, Telematica completa, Cronotachigrafo',
    categoria: 'crono_telematica',
    prezzoListino: 430.00,
    prezzoScontato: 380.00,
    prezzoRiservato: 342.00,
    periodo: 'ANNUALE',
    isCrono: true,
    applicaA: 'truck'
  },
  {
    id: 'crono-premium-mensile',
    nome: 'GT FLEET 365 TRUCK CRONO PREMIUM',
    descrizione: 'Mezzi Pesanti - Blocco Avviamento, Parking Protection, Allarmi, Tasto SOS, Telematica completa, Cronotachigrafo',
    categoria: 'crono_telematica',
    prezzoListino: 39.00,
    prezzoScontato: 35.00,
    prezzoRiservato: 31.50,
    periodo: 'MENSILE',
    isCrono: true,
    applicaA: 'truck'
  },

  // PIATTAFORME CRONO
  {
    id: 'crono-silver',
    nome: 'CRONO - DDD MANAGER - SILVER',
    descrizione: 'Piattaforma web crono, Archivio dati e reportistica (per flotta), Assistenza tecnica, Archiviazione dati 2 anni',
    categoria: 'piattaforme',
    prezzoListino: 800.00,
    prezzoScontato: 600.00,
    prezzoRiservato: 600.00,
    periodo: 'ANNUALE',
    isCrono: true,
    applicaA: 'truck'
  },
  {
    id: 'crono-gold',
    nome: 'CRONO - DDD MANAGER - GOLD',
    descrizione: 'Piattaforma web crono, Archiviazione 5 anni, Report automatici, Terminale comodato d\'uso, Consulenza legale',
    categoria: 'piattaforme',
    prezzoListino: 1600.00,
    prezzoScontato: 1200.00,
    prezzoRiservato: 1200.00,
    periodo: 'ANNUALE',
    isCrono: true,
    applicaA: 'truck'
  },

  // CARTA AZIENDALE CRONO
  {
    id: 'carta-aziendale',
    nome: 'CARTA AZIENDALE CRONO (25 MEZZI)',
    descrizione: 'Copia carta aziendale crono - obbligatoria ogni 25 mezzi per servizi Crono',
    categoria: 'accessori',
    prezzoListino: 160.00,
    prezzoScontato: 120.00,
    prezzoRiservato: 120.00,
    periodo: 'ANNUALE',
    isCrono: true,
    applicaA: 'truck'
  },

  // PIANI DI VIAGGIO
  {
    id: 'piani-viaggio-annuale',
    nome: 'GT FLEET 365 - PIANI DI VIAGGIO',
    descrizione: 'Predisposizione piano viaggio via web/app, Trasmissione al driver, Gestione automatica geo fencing, Reportistica',
    categoria: 'accessori',
    prezzoListino: 360.00,
    prezzoScontato: 240.00,
    prezzoRiservato: 240.00,
    periodo: 'ANNUALE',
    applicaA: 'entrambi'
  },
  {
    id: 'piani-viaggio-mensile',
    nome: 'GT FLEET 365 - PIANI DI VIAGGIO',
    descrizione: 'Predisposizione piano viaggio via web/app, Trasmissione al driver, Gestione automatica geo fencing, Reportistica',
    categoria: 'accessori',
    prezzoListino: 40.00,
    prezzoScontato: 30.00,
    prezzoRiservato: 30.00,
    periodo: 'MENSILE',
    applicaA: 'entrambi'
  },

  // SERVIZIO RIMORCHI
  {
    id: 'servizio-rimorchi',
    nome: 'GT FLEET 365 SERVIZIO RIMORCHI',
    descrizione: 'Localizzazione rimorchio sganciato, Geofencing, Gestione scadenze e manutenzioni, Km percorsi',
    categoria: 'accessori',
    prezzoListino: 110.00,
    prezzoScontato: 100.00,
    prezzoRiservato: 90.00,
    periodo: 'ANNUALE',
    applicaA: 'truck'
  }
];

export const CARTA_AZIENDA_COSTO = 120; // €120 annuale per carta
export const MEZZI_PER_CARTA = 25; // 1 carta ogni 25 mezzi

export const categorieLabels: Record<string, string> = {
  dispositivi: 'Dispositivi',
  fleet_base: 'GT Fleet 365 Base/Gold',
  fleet_plus: 'GT Fleet 365 Plus',
  fleet_premium: 'GT Fleet 365 Premium',
  crono: 'GT Fleet 365 Truck Crono',
  crono_telematica: 'GT Fleet 365 Truck Crono Telematica/Premium',
  piattaforme: 'Piattaforme Crono',
  accessori: 'Accessori & Servizi'
};

export const durateContratto = [
  { value: 12, label: '12 mesi' },
  { value: 24, label: '24 mesi' },
  { value: 36, label: '36 mesi' },
  { value: 60, label: '60 mesi' }
];

export const tipiVeicolo = [
  { value: 'truck', label: 'Truck (> 35 q.li)' },
  { value: 'light', label: 'Veicoli Leggeri (< 35 q.li)' }
];

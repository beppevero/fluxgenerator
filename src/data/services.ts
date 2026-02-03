import { Service } from '@/types/quote';

export const servicesList: Service[] = [
  // Tachigrafo
  {
    id: 'tachi-base',
    nome: 'Gestione Tachigrafo Base',
    categoria: 'tachigrafo',
    prezzoListino: 12.00,
    prezzoRiservato: 9.50,
    tipo: 'mensile',
    applicaA: 'entrambi'
  },
  {
    id: 'tachi-plus',
    nome: 'Gestione Tachigrafo Plus',
    categoria: 'tachigrafo',
    prezzoListino: 18.00,
    prezzoRiservato: 14.50,
    tipo: 'mensile',
    applicaA: 'entrambi'
  },
  {
    id: 'tachi-premium',
    nome: 'Gestione Tachigrafo Premium',
    categoria: 'tachigrafo',
    prezzoListino: 25.00,
    prezzoRiservato: 20.00,
    tipo: 'mensile',
    applicaA: 'entrambi'
  },
  
  // Cronotachigrafo
  {
    id: 'crono-scarico',
    nome: 'Crono Scarico Remoto',
    categoria: 'cronotachigrafo',
    prezzoListino: 22.00,
    prezzoRiservato: 18.00,
    tipo: 'mensile',
    isCrono: true,
    applicaA: 'truck'
  },
  {
    id: 'crono-analisi',
    nome: 'Crono Analisi Completa',
    categoria: 'cronotachigrafo',
    prezzoListino: 30.00,
    prezzoRiservato: 25.00,
    tipo: 'mensile',
    isCrono: true,
    applicaA: 'truck'
  },
  {
    id: 'crono-compliance',
    nome: 'Crono Compliance Manager',
    categoria: 'cronotachigrafo',
    prezzoListino: 45.00,
    prezzoRiservato: 38.00,
    tipo: 'mensile',
    isCrono: true,
    applicaA: 'truck'
  },
  
  // Telematica
  {
    id: 'tele-tracking',
    nome: 'GPS Tracking Base',
    categoria: 'telematica',
    prezzoListino: 15.00,
    prezzoRiservato: 12.00,
    tipo: 'mensile',
    applicaA: 'entrambi'
  },
  {
    id: 'tele-fleet',
    nome: 'Fleet Management',
    categoria: 'telematica',
    prezzoListino: 28.00,
    prezzoRiservato: 23.00,
    tipo: 'mensile',
    applicaA: 'entrambi'
  },
  {
    id: 'tele-pro',
    nome: 'Telematica Professional',
    categoria: 'telematica',
    prezzoListino: 40.00,
    prezzoRiservato: 34.00,
    tipo: 'mensile',
    applicaA: 'entrambi'
  },
  
  // Accessori Una Tantum
  {
    id: 'acc-installazione',
    nome: 'Installazione Dispositivo',
    categoria: 'accessori',
    prezzoListino: 120.00,
    prezzoRiservato: 95.00,
    tipo: 'unaTantum',
    applicaA: 'entrambi'
  },
  {
    id: 'acc-formazione',
    nome: 'Formazione Personale',
    categoria: 'accessori',
    prezzoListino: 350.00,
    prezzoRiservato: 280.00,
    tipo: 'unaTantum',
    applicaA: 'entrambi'
  },
  {
    id: 'acc-configurazione',
    nome: 'Configurazione Sistema',
    categoria: 'accessori',
    prezzoListino: 200.00,
    prezzoRiservato: 150.00,
    tipo: 'unaTantum',
    applicaA: 'entrambi'
  },
  {
    id: 'acc-migrazione',
    nome: 'Migrazione Dati',
    categoria: 'accessori',
    prezzoListino: 450.00,
    prezzoRiservato: 380.00,
    tipo: 'unaTantum',
    applicaA: 'entrambi'
  }
];

export const CARTA_AZIENDA_COSTO = 50; // €50 una tantum per carta
export const MEZZI_PER_CARTA = 25; // 1 carta ogni 25 mezzi

export const categorieLabels: Record<string, string> = {
  tachigrafo: 'Gestione Tachigrafo',
  cronotachigrafo: 'Cronotachigrafo',
  telematica: 'Telematica & Fleet',
  accessori: 'Accessori & Setup'
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

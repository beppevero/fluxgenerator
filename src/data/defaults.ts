import { ClientData, LegaleRappresentante, DatiAzienda } from "@/types/quote";

export const emptyLegaleRappresentante: LegaleRappresentante = {
  cognome: "",
  nome: "",
  luogoDiNascita: "",
  dataDiNascita: "",
  codiceFiscale: "",
};

export const emptyDatiAzienda: DatiAzienda = {
  partitaIva: "",
  codiceFiscaleAzienda: "",
  indirizzo: "",
  citta: "",
  cap: "",
  provincia: "",
  telefono: "",
  cellulare: "",
  pec: "",
  email: "",
  codiceUnivoco: "",
};

export const emptyClientData: ClientData = {
  ragioneSociale: "",
  documentType: "standard",
  legaleRappresentante: { ...emptyLegaleRappresentante },
  datiAzienda: { ...emptyDatiAzienda },
};

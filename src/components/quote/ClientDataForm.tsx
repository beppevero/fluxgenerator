import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, MapPin, Hash, Mail, Truck } from "lucide-react";
import { ClientData, DocumentType, LegaleRappresentante, DatiAzienda } from "@/types/quote";

interface ClientDataFormProps {
  clientData: ClientData;
  onChange: (data: ClientData) => void;
}

export function ClientDataForm({ clientData, onChange }: ClientDataFormProps) {
  const docType = clientData.documentType || 'standard';
  const isModulo = docType === 'modulo';
  const lr = clientData.legaleRappresentante;
  const da = clientData.datiAzienda;

  const updateLR = (field: keyof LegaleRappresentante, value: string) => {
    onChange({ ...clientData, legaleRappresentante: { ...lr, [field]: value } });
  };

  const updateDA = (field: keyof DatiAzienda, value: string) => {
    onChange({ ...clientData, datiAzienda: { ...da, [field]: value } });
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <Building2 className="w-4 h-4 text-accent" />
        Anagrafica Cliente
      </h3>
      
      <div className="space-y-4">
        {/* Tipo Documento */}
        <div className="space-y-2">
          <Label className="text-white/90 font-medium">Tipo Documento</Label>
          <div className="flex rounded-xl overflow-hidden border border-black/8">
            <button
              type="button"
              onClick={() => onChange({ ...clientData, documentType: 'standard' })}
              className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-300 ${
                docType === 'standard'
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : 'bg-white/40 text-muted-foreground hover:bg-white/60'
              }`}
            >
              Proposta Standard
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...clientData, documentType: 'modulo' })}
              className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-300 ${
                docType === 'modulo'
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : 'bg-white/40 text-muted-foreground hover:bg-white/60'
              }`}
            >
              Modulo
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {docType === 'standard' 
              ? 'PDF completo con tutte le sezioni legali e contrattuali.' 
              : 'Copia Commissione: dati legale rappresentante, tabella economica e firme.'}
          </p>
        </div>

        {/* Ragione Sociale - always visible */}
        <div className="space-y-1.5">
          <Label htmlFor="ragioneSociale" className="text-white/90 font-medium">Ragione Sociale *</Label>
          <Input
            id="ragioneSociale"
            placeholder="Inserisci ragione sociale"
            value={clientData.ragioneSociale}
            onChange={(e) => onChange({ ...clientData, ragioneSociale: e.target.value })}
            className="glass-input font-medium border-white/20"
            required
          />
        </div>

        {/* Proposta Standard fields */}
        {!isModulo && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="partitaIva" className="text-white/90 font-medium">P. IVA</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="partitaIva"
                  placeholder="Inserisci Partita IVA"
                  value={clientData.partitaIva}
                  onChange={(e) => onChange({ ...clientData, partitaIva: e.target.value })}
                  className="glass-input pl-9 border-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nomeReferente" className="text-white/90 font-medium">Nome Referente</Label>
                <Input
                  id="nomeReferente"
                  placeholder="Nome"
                  value={clientData.nomeReferente}
                  onChange={(e) => onChange({ ...clientData, nomeReferente: e.target.value })}
                  className="glass-input border-white/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cognomeReferente" className="text-white/90 font-medium">Cognome Referente</Label>
                <Input
                  id="cognomeReferente"
                  placeholder="Cognome"
                  value={clientData.cognomeReferente}
                  onChange={(e) => onChange({ ...clientData, cognomeReferente: e.target.value })}
                  className="glass-input border-white/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emailCliente" className="text-white/90 font-medium">Email Cliente</Label>
              <Input
                id="emailCliente"
                type="email"
                placeholder="es. mario.rossi@azienda.it"
                value={clientData.emailCliente}
                onChange={(e) => onChange({ ...clientData, emailCliente: e.target.value })}
                className="glass-input border-white/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefonoCliente" className="text-white/90 font-medium">Telefono / WhatsApp</Label>
              <Input
                id="telefonoCliente"
                type="tel"
                placeholder="es. +39 333 1234567"
                value={clientData.telefonoCliente}
                onChange={(e) => onChange({ ...clientData, telefonoCliente: e.target.value })}
                className="glass-input border-white/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mezziTrattativa" className="text-white/90 font-medium">N° Mezzi Trattativa</Label>
              <Input
                id="mezziTrattativa"
                type="number"
                placeholder="N° mezzi"
                value={clientData.mezziTrattativa}
                onChange={(e) => onChange({ ...clientData, mezziTrattativa: e.target.value })}
                className="glass-input border-white/20"
              />
            </div>
          </>
        )}

        {/* Modulo fields */}
        {isModulo && (
          <>
            {/* Legale Rappresentante */}
            <div className="space-y-3 p-3 rounded-lg border border-black/6 bg-white/30">
              <h4 className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" />
                Legale Rappresentante
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Cognome</Label>
                  <Input placeholder="Cognome" value={lr.cognome} onChange={(e) => updateLR('cognome', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Nome</Label>
                  <Input placeholder="Nome" value={lr.nome} onChange={(e) => updateLR('nome', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Luogo di Nascita</Label>
                  <Input placeholder="Luogo di nascita" value={lr.luogoDiNascita} onChange={(e) => updateLR('luogoDiNascita', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Data di Nascita</Label>
                  <Input placeholder="GG/MM/AAAA" value={lr.dataDiNascita} onChange={(e) => updateLR('dataDiNascita', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground/60 text-[11px]">Codice Fiscale</Label>
                <Input placeholder="Codice Fiscale" value={lr.codiceFiscale} onChange={(e) => updateLR('codiceFiscale', e.target.value)} className="glass-input h-8 text-xs uppercase" />
              </div>
            </div>

            {/* Dati Azienda */}
            <div className="space-y-3 p-3 rounded-lg border border-black/6 bg-white/30">
              <h4 className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                Dati Azienda
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">P.IVA</Label>
                  <Input placeholder="Partita IVA" value={da.partitaIva} onChange={(e) => updateDA('partitaIva', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">C.F. Azienda</Label>
                  <Input placeholder="Codice Fiscale Azienda" value={da.codiceFiscaleAzienda} onChange={(e) => updateDA('codiceFiscaleAzienda', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground/60 text-[11px]">Indirizzo</Label>
                <Input placeholder="Via/Piazza, n°" value={da.indirizzo} onChange={(e) => updateDA('indirizzo', e.target.value)} className="glass-input h-8 text-xs" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Città</Label>
                  <Input placeholder="Città" value={da.citta} onChange={(e) => updateDA('citta', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">CAP</Label>
                  <Input placeholder="CAP" value={da.cap} onChange={(e) => updateDA('cap', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Prov.</Label>
                  <Input placeholder="Prov." value={da.provincia} onChange={(e) => updateDA('provincia', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Telefono</Label>
                  <Input placeholder="Telefono" value={da.telefono} onChange={(e) => updateDA('telefono', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">Cellulare</Label>
                  <Input placeholder="Cellulare" value={da.cellulare} onChange={(e) => updateDA('cellulare', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">PEC</Label>
                  <Input placeholder="PEC" value={da.pec} onChange={(e) => updateDA('pec', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground/60 text-[11px]">E-mail</Label>
                  <Input placeholder="Email" value={da.email} onChange={(e) => updateDA('email', e.target.value)} className="glass-input h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground/60 text-[11px]">Codice Univoco (SDI)</Label>
                <Input placeholder="Codice Univoco" value={da.codiceUnivoco} onChange={(e) => updateDA('codiceUnivoco', e.target.value)} className="glass-input h-8 text-xs" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { ClientData } from "@/types/quote";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building, FileText, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ClientFormProps {
  clientData: ClientData;
  onChange: (data: ClientData) => void;
}

export function ClientForm({ clientData, onChange }: ClientFormProps) {
  const handleFieldChange = (section: keyof ClientData, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    onChange({
      ...clientData,
      [section]: {
        // @ts-ignore
        ...clientData[section],
        [field]: value,
      },
    });
  };
  
  const handleRootChange = (field: keyof ClientData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...clientData, [field]: e.target.value });
  };

  return (
    <div className="space-y-6">
        <div className="form-section">
          <h3 className="form-section-title">
            <FileText className="w-4 h-4 text-accent" />
            Tipo di Documento
          </h3>
          <div className="flex space-x-2 p-1 rounded-lg bg-white/30 backdrop-blur-md border border-white/40 w-full">
            <Button 
                onClick={() => onChange({ ...clientData, documentType: 'preventivo' })} 
                variant={clientData.documentType === 'preventivo' ? 'default' : 'ghost'}
                className={`w-1/2 transition-all duration-300 rounded-md ${clientData.documentType === 'preventivo' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-700 hover:bg-white/60'}`}>
                <Eye className="w-4 h-4 mr-2"/> Preventivo
            </Button>
            <Button 
                onClick={() => onChange({ ...clientData, documentType: 'modulo' })} 
                variant={clientData.documentType === 'modulo' ? 'default' : 'ghost'}
                className={`w-1/2 transition-all duration-300 rounded-md ${clientData.documentType === 'modulo' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-700 hover:bg-white/60'}`}>
                <FileText className="w-4 h-4 mr-2"/> Modulo d'Ordine
            </Button>
        </div>
      </div>

      {/* Dati Azienda */}
      <div className="form-section">
        <h3 className="form-section-title">
            <Building className="w-4 h-4 text-accent" />
            Dati Azienda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ragioneSociale" className="text-slate-800">Ragione Sociale</Label>
            <Input id="ragioneSociale" placeholder="Es. Mario Rossi S.R.L." value={clientData.ragioneSociale} onChange={handleRootChange('ragioneSociale')} className="glass-input" />
          </div>
          <div>
            <Label htmlFor="partitaIva" className="text-slate-800">Partita IVA</Label>
            <Input id="partitaIva" placeholder="01234567890" value={clientData.partitaIva} onChange={handleRootChange('partitaIva')} className="glass-input"/>
          </div>
          <div>
            <Label htmlFor="indirizzo" className="text-slate-800">Indirizzo Sede Legale</Label>
            <Input id="indirizzo" placeholder="Via Roma, 1" value={clientData.datiAzienda.indirizzo} onChange={handleFieldChange('datiAzienda', 'indirizzo')} className="glass-input"/>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
                <Label htmlFor="cap" className="text-slate-800">CAP</Label>
                <Input id="cap" placeholder="70024" value={clientData.datiAzienda.cap} onChange={handleFieldChange('datiAzienda', 'cap')} className="glass-input"/>
            </div>
            <div>
                <Label htmlFor="citta" className="text-slate-800">Città</Label>
                <Input id="citta" placeholder="Gravina in Puglia" value={clientData.datiAzienda.citta} onChange={handleFieldChange('datiAzienda', 'citta')} className="glass-input"/>
            </div>
            <div>
                <Label htmlFor="provincia" className="text-slate-800">Provincia</Label>
                <Input id="provincia" placeholder="BA" value={clientData.datiAzienda.provincia} onChange={handleFieldChange('datiAzienda', 'provincia')} className="glass-input"/>
            </div>
          </div>
          <div>
            <Label htmlFor="pec" className="text-slate-800">PEC</Label>
            <Input id="pec" type="email" placeholder="azienda@pec.it" value={clientData.datiAzienda.pec} onChange={handleFieldChange('datiAzienda', 'pec')} className="glass-input"/>
          </div>
          <div>
            <Label htmlFor="sdi" className="text-slate-800">Codice SDI</Label>
            <Input id="sdi" placeholder="SUBM70N" value={clientData.datiAzienda.codiceSdi} onChange={handleFieldChange('datiAzienda', 'codiceSdi')} className="glass-input"/>
          </div>
        </div>
      </div>

      {/* Legale Rappresentante */}
      {clientData.documentType === 'modulo' && (
        <div className="form-section">
          <h3 className="form-section-title">
            <User className="w-4 h-4 text-accent" />
            Legale Rappresentante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="nomeLR" className="text-slate-800">Nome</Label>
                <Input id="nomeLR" placeholder="Mario" value={clientData.legaleRappresentante.nome} onChange={handleFieldChange('legaleRappresentante', 'nome')} className="glass-input"/>
            </div>
            <div>
                <Label htmlFor="cognomeLR" className="text-slate-800">Cognome</Label>
                <Input id="cognomeLR" placeholder="Rossi" value={clientData.legaleRappresentante.cognome} onChange={handleFieldChange('legaleRappresentante', 'cognome')} className="glass-input"/>
            </div>
            <div>
                <Label htmlFor="luogoNascitaLR" className="text-slate-800">Luogo di Nascita</Label>
                <Input id="luogoNascitaLR" placeholder="Gravina in Puglia" value={clientData.legaleRappresentante.luogoDiNascita} onChange={handleFieldChange('legaleRappresentante', 'luogoDiNascita')} className="glass-input"/>
            </div>
            <div>
                <Label htmlFor="dataNascitaLR" className="text-slate-800">Data di Nascita</Label>
                <Input id="dataNascitaLR" type="date" value={clientData.legaleRappresentante.dataDiNascita} onChange={handleFieldChange('legaleRappresentante', 'dataDiNascita')} className="glass-input"/>
            </div>
            <div className="col-span-2">
                <Label htmlFor="codiceFiscaleLR" className="text-slate-800">Codice Fiscale</Label>
                <Input id="codiceFiscaleLR" placeholder="RSSMRA80A01E285V" value={clientData.legaleRappresentante.codiceFiscale} onChange={handleFieldChange('legaleRappresentante', 'codiceFiscale')} className="glass-input"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

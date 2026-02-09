import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { ClientData, DocumentType } from "@/types/quote";

interface ClientDataFormProps {
  clientData: ClientData;
  onChange: (data: ClientData) => void;
}

export function ClientDataForm({ clientData, onChange }: ClientDataFormProps) {
  const docType = clientData.documentType || 'standard';

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <Building2 className="w-4 h-4 text-accent" />
        Anagrafica Cliente
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ragioneSociale" className="text-foreground/80">Ragione Sociale *</Label>
          <Input
            id="ragioneSociale"
            placeholder="Inserisci ragione sociale"
            value={clientData.ragioneSociale}
            onChange={(e) => onChange({ ...clientData, ragioneSociale: e.target.value })}
            className="glass-input"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground/80">Tipo Documento</Label>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              type="button"
              onClick={() => onChange({ ...clientData, documentType: 'standard' })}
              className={`flex-1 py-2 px-3 text-xs font-medium transition-all ${
                docType === 'standard'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              Proposta Standard
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...clientData, documentType: 'modulo' })}
              className={`flex-1 py-2 px-3 text-xs font-medium transition-all ${
                docType === 'modulo'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              Modulo
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {docType === 'standard' 
              ? 'PDF completo con tutte le sezioni legali e contrattuali.' 
              : 'PDF breve: copertina, tabella economica, condizioni e firme.'}
          </p>
        </div>
      </div>
    </div>
  );
}

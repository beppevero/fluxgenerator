import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Truck } from "lucide-react";
import { ClientData } from "@/types/quote";

interface ClientDataFormProps {
  clientData: ClientData;
  onChange: (data: ClientData) => void;
}

export function ClientDataForm({ clientData, onChange }: ClientDataFormProps) {
  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <Building2 className="w-4 h-4 text-accent" />
        Dati Cliente
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ragioneSociale">Ragione Sociale</Label>
          <Input
            id="ragioneSociale"
            placeholder="Inserisci ragione sociale"
            value={clientData.ragioneSociale}
            onChange={(e) => onChange({ ...clientData, ragioneSociale: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="referente" className="flex items-center gap-2">
            <User className="w-3 h-3" />
            Referente
          </Label>
          <Input
            id="referente"
            placeholder="Nome referente"
            value={clientData.referente}
            onChange={(e) => onChange({ ...clientData, referente: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="numeroMezzi" className="flex items-center gap-2">
            <Truck className="w-3 h-3" />
            Numero Mezzi
          </Label>
          <Input
            id="numeroMezzi"
            type="number"
            min={1}
            placeholder="Es: 50"
            value={clientData.numeroMezzi || ''}
            onChange={(e) => onChange({ ...clientData, numeroMezzi: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
}

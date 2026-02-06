import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
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
      </div>
    </div>
  );
}

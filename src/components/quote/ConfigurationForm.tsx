import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Clock } from "lucide-react";
import { Configuration } from "@/types/quote";
import { durateContratto, tipiVeicolo } from "@/data/services";

interface ConfigurationFormProps {
  configuration: Configuration;
  onChange: (config: Configuration) => void;
}

export function ConfigurationForm({ configuration, onChange }: ConfigurationFormProps) {
  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <Settings className="w-4 h-4 text-accent" />
        Configurazione
      </h3>
      
      <div className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo Veicolo</Label>
          <RadioGroup
            value={configuration.tipoVeicolo}
            onValueChange={(value) => onChange({ ...configuration, tipoVeicolo: value as 'truck' | 'light' })}
            className="flex flex-col gap-2"
          >
            {tipiVeicolo.map((tipo) => (
              <div key={tipo.value} className="flex items-center space-x-3 p-3 rounded-md border border-border hover:border-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value={tipo.value} id={tipo.value} />
                <Label htmlFor={tipo.value} className="cursor-pointer flex-1 text-sm">
                  {tipo.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Durata Contratto
          </Label>
          <RadioGroup
            value={configuration.durataContratto.toString()}
            onValueChange={(value) => onChange({ ...configuration, durataContratto: parseInt(value) as 12 | 24 | 36 | 60 })}
            className="grid grid-cols-2 gap-2"
          >
            {durateContratto.map((durata) => (
              <div key={durata.value} className="flex items-center space-x-2 p-3 rounded-md border border-border hover:border-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value={durata.value.toString()} id={`durata-${durata.value}`} />
                <Label htmlFor={`durata-${durata.value}`} className="cursor-pointer text-sm">
                  {durata.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

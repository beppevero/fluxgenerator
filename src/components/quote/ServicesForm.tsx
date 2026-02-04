import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListChecks, Info, AlertCircle } from "lucide-react";
import { Service, SelectedService } from "@/types/quote";
import { servicesList, categorieLabels, MEZZI_PER_CARTA } from "@/data/services";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServicesFormProps {
  selectedServices: SelectedService[];
  onChange: (services: SelectedService[]) => void;
  carteAziendaSuggerite: number;
}

export function ServicesForm({ selectedServices, onChange, carteAziendaSuggerite }: ServicesFormProps) {
  const groupedServices = servicesList.reduce((acc, service) => {
    if (!acc[service.categoria]) {
      acc[service.categoria] = [];
    }
    acc[service.categoria].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const isSelected = (serviceId: string) => 
    selectedServices.some(s => s.id === serviceId);

  const getSelectedService = (serviceId: string) =>
    selectedServices.find(s => s.id === serviceId);

  const toggleService = (service: Service) => {
    if (isSelected(service.id)) {
      onChange(selectedServices.filter(s => s.id !== service.id));
    } else {
      onChange([...selectedServices, { 
        ...service, 
        quantita: 1,
        prezzoUnitario: service.prezzoRiservato
      }]);
    }
  };

  const updateQuantita = (serviceId: string, value: string) => {
    // Allow empty string for full keyboard editing, default to 1 on blur if empty
    const quantita = value === '' ? 0 : parseInt(value, 10);
    onChange(selectedServices.map(s => 
      s.id === serviceId ? { ...s, quantita: isNaN(quantita) ? 1 : quantita } : s
    ));
  };

  const handleQuantitaBlur = (serviceId: string, value: string) => {
    // Ensure minimum of 1 when field loses focus
    const quantita = parseInt(value, 10);
    if (isNaN(quantita) || quantita < 1) {
      onChange(selectedServices.map(s => 
        s.id === serviceId ? { ...s, quantita: 1 } : s
      ));
    }
  };

  const updatePrezzoUnitario = (serviceId: string, prezzo: number) => {
    onChange(selectedServices.map(s => 
      s.id === serviceId ? { ...s, prezzoUnitario: prezzo } : s
    ));
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case 'MENSILE': return '/mese';
      case 'ANNUALE': return '/anno';
      case 'U.T.': return 'U.T.';
      default: return periodo;
    }
  };

  const hasCronoService = selectedServices.some(s => s.isCrono);

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <ListChecks className="w-4 h-4 text-accent" />
        Servizi e Dispositivi
      </h3>
      
      <p className="text-xs text-muted-foreground mb-4 italic">
        * L'installazione è a carico del cliente
      </p>

      {/* Suggerimento Carte Azienda */}
      {hasCronoService && carteAziendaSuggerite > 0 && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2 backdrop-blur-sm">
          <AlertCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium">Suggerimento:</span> Con i servizi Crono selezionati, si consiglia l'aggiunta di <strong>{carteAziendaSuggerite}</strong> Carta/e Aziendale/i (€50 U.T. ogni {MEZZI_PER_CARTA} mezzi totali).
          </div>
        </div>
      )}
      
      <div className="space-y-5">
        {Object.entries(groupedServices).map(([categoria, services]) => (
          <div key={categoria} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-accent border-b border-border/30 pb-1">
              {categorieLabels[categoria]}
            </h4>
            
            <div className="space-y-2">
              {services.map((service) => {
                const selected = getSelectedService(service.id);
                const isChecked = isSelected(service.id);
                
                return (
                  <div
                    key={service.id}
                    className={`p-3 rounded-lg border transition-all backdrop-blur-sm ${
                      isChecked
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-border/30 bg-white/30 hover:border-accent/30'
                    }`}
                  >
                    <div 
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => toggleService(service)}
                    >
                      <Checkbox
                        id={service.id}
                        checked={isChecked}
                        className="mt-0.5 border-white/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={service.id} className="cursor-pointer text-sm font-medium block text-foreground">
                            {service.nome}
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs glass-card-intense">
                              <p className="text-xs">{service.descrizione}</p>
                            </TooltipContent>
                          </Tooltip>
                          {service.isCrono && (
                            <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                              Crono
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-xs text-muted-foreground">
                            Listino: <span className="line-through">{formatPrice(service.prezzoListino)}</span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Scontato: <span className="line-through">{formatPrice(service.prezzoScontato)}</span>
                          </span>
                          <span className="text-xs font-medium text-accent">
                            Riservato: {formatPrice(service.prezzoRiservato)}
                          </span>
                          <Badge variant="secondary" className="text-xs bg-white/10 border-white/20">
                            {getPeriodoLabel(service.periodo)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Campi editabili quando selezionato */}
                    {isChecked && selected && (
                      <div className="mt-3 pt-3 border-t border-border/20 grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">N° Servizi</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={selected.quantita === 0 ? '' : selected.quantita}
                            onChange={(e) => updateQuantita(service.id, e.target.value)}
                            onBlur={(e) => handleQuantitaBlur(service.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 text-sm glass-input"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Prezzo Unitario €</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={selected.prezzoUnitario}
                            onChange={(e) => updatePrezzoUnitario(service.id, parseFloat(e.target.value) || 0)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 text-sm glass-input"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Totale Riga</Label>
                          <div className="h-8 flex items-center text-sm font-semibold text-accent">
                            {formatPrice(selected.prezzoUnitario * selected.quantita)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

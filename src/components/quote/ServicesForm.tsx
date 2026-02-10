import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListChecks, Info, Search, Check, Lock } from "lucide-react";
import { Service, SelectedService } from "@/types/quote";
import { servicesList, categorieLabels } from "@/data/services";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServicesFormProps {
  selectedServices: SelectedService[];
  onChange: (services: SelectedService[]) => void;
}

export function ServicesForm({ selectedServices, onChange }: ServicesFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [periodoFilter, setPeriodoFilter] = useState<string | null>(null);

  // Filter services based on search query and periodo filter
  const filteredServices = useMemo(() => {
    let result = servicesList;
    
    if (periodoFilter) {
      result = result.filter(service => service.periodo === periodoFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(service => 
        service.nome.toLowerCase().includes(query) ||
        service.descrizione.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [searchQuery, periodoFilter]);

  const groupedServices = useMemo(() => {
    return filteredServices.reduce((acc, service) => {
      if (!acc[service.categoria]) {
        acc[service.categoria] = [];
      }
      acc[service.categoria].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, [filteredServices]);

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
    const quantita = value === '' ? 0 : parseInt(value, 10);
    onChange(selectedServices.map(s => 
      s.id === serviceId ? { ...s, quantita: isNaN(quantita) ? 1 : quantita } : s
    ));
  };

  const handleQuantitaBlur = (serviceId: string, value: string) => {
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

  
  const AUTO_MANAGED_IDS = ['carta-aziendale', 'centrale-ondemand-annuale'];
  const isAutoManaged = (id: string) => AUTO_MANAGED_IDS.includes(id);

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <ListChecks className="w-4 h-4 text-accent" />
        Servizi e Dispositivi
      </h3>
      
      {/* Periodo Filter */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Filtra per:</span>
        {([
          { value: 'U.T.', label: 'Una Tantum' },
          { value: 'ANNUALE', label: 'Annuale' },
          { value: 'MENSILE', label: 'Mensile' },
        ] as const).map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setPeriodoFilter(periodoFilter === opt.value ? null : opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
              periodoFilter === opt.value
                ? 'bg-accent text-white border-accent shadow-md'
                : 'bg-white/50 text-foreground/70 border-black/8 hover:border-accent/40 hover:bg-white/70'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cerca servizio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 glass-input"
        />
      </div>
      
      <p className="text-xs text-muted-foreground mb-4 italic">
        * L'installazione è a carico del cliente
      </p>
      
      <div className="space-y-5">
        {Object.keys(groupedServices).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nessun servizio trovato per "{searchQuery}"</p>
          </div>
        ) : (
          Object.entries(groupedServices).map(([categoria, services]) => (
            <div key={categoria} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-accent border-b border-border/30 pb-1">
                {categorieLabels[categoria]}
              </h4>
              
              <div className="space-y-2">
                {services.map((service) => {
                  const selected = getSelectedService(service.id);
                  const isChecked = isSelected(service.id);
                  const managed = isAutoManaged(service.id);
                  
                  return (
                    <div
                      key={service.id}
                      className={`p-3 rounded-xl border transition-all backdrop-blur-sm relative service-row-hover ${
                        isChecked
                          ? managed
                            ? 'border-accent/40 bg-accent/5 shadow-sm opacity-80'
                            : 'border-accent/60 bg-accent/10 shadow-sm'
                          : 'border-black/6 bg-white/50 hover:border-accent/30'
                      }`}
                    >
                      {/* Check / Lock icon */}
                      {isChecked && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          {managed ? <Lock className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}
                      
                      <div 
                        className={`flex items-start gap-3 ${managed && isChecked ? 'cursor-default' : 'cursor-pointer'}`}
                        onClick={() => !managed && toggleService(service)}
                      >
                        <Checkbox
                          id={service.id}
                          checked={isChecked}
                          disabled={managed}
                          className="mt-0.5 h-5 w-5 border-2 border-accent/60 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                        <div className="flex-1 min-w-0 pr-6">
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
                            {managed && isChecked && (
                              <Badge variant="outline" className="text-xs border-accent/30 text-muted-foreground">
                                Auto
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
                            <Badge variant="secondary" className="text-xs bg-black/5 border-black/8">
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
                            {managed ? (
                              <div className="h-8 flex items-center text-sm font-medium text-foreground/70">
                                {selected.quantita}
                              </div>
                            ) : (
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
                            )}
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
          ))
        )}
      </div>
    </div>
  );
}

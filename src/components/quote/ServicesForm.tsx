import { useState, useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// Detect if a service has a paired annuale/mensile counterpart
function getPairedId(id: string): string | null {
  if (id.endsWith('-annuale')) return id.replace('-annuale', '-mensile');
  if (id.endsWith('-mensile')) return id.replace('-mensile', '-annuale');
  return null;
}

function getBaseId(id: string): string {
  return id.replace(/-annuale$/, '').replace(/-mensile$/, '');
}

export function ServicesForm({ selectedServices, onChange }: ServicesFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track which periodo the user picked per paired service (keyed by base id)
  const [periodoOverrides, setPeriodoOverrides] = useState<Record<string, 'ANNUALE' | 'MENSILE'>>({});

  // Build a map of paired services for quick lookup
  const pairedServiceMap = useMemo(() => {
    const map = new Map<string, Service>();
    servicesList.forEach(s => map.set(s.id, s));
    return map;
  }, []);

  // Identify which service IDs are the "mensile" half of a pair
  const mensileOfPair = useMemo(() => {
    const set = new Set<string>();
    servicesList.forEach(s => {
      if (s.id.endsWith('-mensile')) {
        const annualeId = s.id.replace('-mensile', '-annuale');
        if (pairedServiceMap.has(annualeId)) {
          set.add(s.id);
        }
      }
    });
    return set;
  }, [pairedServiceMap]);

  const filteredServices = useMemo(() => {
    let result = servicesList;
    
    // Remove mensile duplicates of paired services (they'll be accessible via toggle)
    result = result.filter(s => !mensileOfPair.has(s.id));
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(service => 
        service.nome.toLowerCase().includes(query) ||
        service.descrizione.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [searchQuery, mensileOfPair, pairedServiceMap]);

  const categoryOrder = [
    'dispositivi',
    'fleet_vehicles',
    'fleet_truck',
    'fleet_trailers',
    'tractor',
    'asset',
    'driver',
    'piattaforme',
    'software',
    'servizi_aggiuntivi',
    'centrale_operativa',
  ];

  const groupedServices = useMemo(() => {
    const grouped = filteredServices.reduce((acc, service) => {
      if (!acc[service.categoria]) {
        acc[service.categoria] = [];
      }
      acc[service.categoria].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    const sortedEntries = Object.entries(grouped).sort(
      ([catA], [catB]) => categoryOrder.indexOf(catA) - categoryOrder.indexOf(catB)
    );

    return Object.fromEntries(sortedEntries);
  }, [filteredServices]);

  const isSelected = (serviceId: string) => 
    selectedServices.some(s => s.id === serviceId);

  const getSelectedService = (serviceId: string) =>
    selectedServices.find(s => s.id === serviceId);

  // Check if either variant of a paired service is selected
  const isPairSelected = (serviceId: string) => {
    if (isSelected(serviceId)) return true;
    const pairedId = getPairedId(serviceId);
    return pairedId ? isSelected(pairedId) : false;
  };

  const getSelectedPairService = (serviceId: string): SelectedService | undefined => {
    const sel = getSelectedService(serviceId);
    if (sel) return sel;
    const pairedId = getPairedId(serviceId);
    return pairedId ? getSelectedService(pairedId) : undefined;
  };

  // Get the currently active periodo for a paired service
  const getActivePeriodo = useCallback((service: Service): 'ANNUALE' | 'MENSILE' => {
    const baseId = getBaseId(service.id);
    // If user has overridden, use that
    if (periodoOverrides[baseId]) return periodoOverrides[baseId];
    // If one variant is selected, use its periodo
    const pairedId = getPairedId(service.id);
    if (isSelected(service.id)) return service.periodo as 'ANNUALE' | 'MENSILE';
    if (pairedId && isSelected(pairedId)) {
      const paired = pairedServiceMap.get(pairedId);
      return (paired?.periodo as 'ANNUALE' | 'MENSILE') || 'ANNUALE';
    }
    return 'ANNUALE';
  }, [periodoOverrides, selectedServices, pairedServiceMap]);

  // Get the active service variant for a paired service
  const getActiveServiceVariant = useCallback((service: Service): Service => {
    const pairedId = getPairedId(service.id);
    if (!pairedId || !pairedServiceMap.has(pairedId)) return service;
    
    const activePeriodo = getActivePeriodo(service);
    if (service.periodo === activePeriodo) return service;
    const paired = pairedServiceMap.get(pairedId);
    return paired || service;
  }, [getActivePeriodo, pairedServiceMap]);

  const hasPair = (serviceId: string): boolean => {
    const pairedId = getPairedId(serviceId);
    return !!pairedId && pairedServiceMap.has(pairedId);
  };

  const toggleService = (service: Service) => {
    // For paired services, use the active variant
    const activeService = getActiveServiceVariant(service);
    const pairSelected = isPairSelected(service.id);
    
    if (pairSelected) {
      // Remove whichever variant is selected
      const pairedId = getPairedId(service.id);
      onChange(selectedServices.filter(s => s.id !== service.id && s.id !== pairedId));
    } else {
      onChange([...selectedServices, { 
        ...activeService, 
        quantita: 1,
        prezzoUnitario: activeService.prezzoRiservato
      }]);
    }
  };

  const handlePeriodoToggle = (service: Service, newPeriodo: 'ANNUALE' | 'MENSILE') => {
    const baseId = getBaseId(service.id);
    setPeriodoOverrides(prev => ({ ...prev, [baseId]: newPeriodo }));

    // If a variant is currently selected, swap it
    const currentSelectedId = isSelected(service.id) ? service.id : getPairedId(service.id);
    if (currentSelectedId && isSelected(currentSelectedId)) {
      const targetId = newPeriodo === 'ANNUALE' 
        ? baseId + '-annuale' 
        : baseId + '-mensile';
      const targetService = pairedServiceMap.get(targetId);
      if (targetService && targetId !== currentSelectedId) {
        onChange(selectedServices.map(s => {
          if (s.id !== currentSelectedId) return s;
          return {
            ...targetService,
            quantita: s.quantita,
            prezzoUnitario: targetService.prezzoRiservato,
            prezzoListino: Math.round(targetService.prezzoRiservato * 1.6 * 100) / 100,
            customTitle: s.customTitle,
            customDescription: s.customDescription,
          };
        }));
      }
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
    onChange(selectedServices.map(s => {
      if (s.id !== serviceId) return s;
      // Ricalcola prezzoListino come +60% sul prezzo unitario inserito
      return { ...s, prezzoUnitario: prezzo, prezzoListino: Math.round(prezzo * 1.6 * 100) / 100 };
    }));
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case 'MENSILE': return 'Mensile';
      case 'ANNUALE': return 'Annuale';
      case 'U.T.': return 'U.T.';
      default: return periodo;
    }
  };

  const AUTO_MANAGED_IDS = ['carta-aziendale'];
  const isAutoManaged = (id: string) => AUTO_MANAGED_IDS.includes(id);

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <ListChecks className="w-4 h-4 text-accent" />
        Servizi e Dispositivi
      </h3>
      
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
                  const isPaired = hasPair(service.id);
                  const activeVariant = isPaired ? getActiveServiceVariant(service) : service;
                  const activePeriodo = isPaired ? getActivePeriodo(service) : null;
                  const selected = isPaired ? getSelectedPairService(service.id) : getSelectedService(service.id);
                  const isChecked = isPaired ? isPairSelected(service.id) : isSelected(service.id);
                  const managed = isAutoManaged(service.id) || (isPaired && (isAutoManaged(service.id) || isAutoManaged(getPairedId(service.id) || '')));
                  
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
                      <div 
                        className={`flex items-start gap-3 ${managed && isChecked ? 'cursor-default' : 'cursor-pointer'}`}
                        onClick={() => !managed && toggleService(service)}
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isChecked ? 'bg-accent border-accent' : 'border-accent/60'
                        }`}>
                          {isChecked && !managed && <Check className="w-3 h-3 text-white" />}
                          {isChecked && managed && <Lock className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center gap-2">
                            {service.id === 'custom-service' ? (
                              <Input
                                placeholder="Titolo servizio personalizzato..."
                                value={selected?.customTitle || ""}
                                onChange={(e) => {
                                  onChange(selectedServices.map(s => 
                                    s.id === service.id ? { ...s, customTitle: e.target.value } : s
                                  ));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-7 text-sm glass-input max-w-[300px]"
                              />
                            ) : (
                              <Label htmlFor={service.id} className="cursor-pointer text-sm font-semibold block text-white">
                                {service.nome}
                              </Label>
                            )}
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
                              Listino: {(() => {
                                const listino = selected?.prezzoListino ?? activeVariant.prezzoListino;
                                return listino === 0 ? '—' : formatPrice(listino);
                              })()}
                            </span>
                            <span className="text-xs font-medium text-accent">
                              Riservato: {formatPrice(activeVariant.prezzoRiservato)}
                            </span>
                            {/* Periodo toggle for paired services */}
                            {isPaired && activePeriodo ? (
                              <div 
                                className="inline-flex rounded-full border border-black/10 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => handlePeriodoToggle(service, 'ANNUALE')}
                                  className={`px-2 py-0.5 text-xs font-medium transition-all ${
                                    activePeriodo === 'ANNUALE'
                                      ? 'bg-accent text-white'
                                      : 'bg-white/50 text-foreground/60 hover:bg-white/80'
                                  }`}
                                >
                                  Annuale
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePeriodoToggle(service, 'MENSILE')}
                                  className={`px-2 py-0.5 text-xs font-medium transition-all ${
                                    activePeriodo === 'MENSILE'
                                      ? 'bg-accent text-white'
                                      : 'bg-white/50 text-foreground/60 hover:bg-white/80'
                                  }`}
                                >
                                  Mensile
                                </button>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-black/5 border-black/8">
                                {getPeriodoLabel(service.periodo)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Descrizione personalizzata per servizio custom */}
                      {service.id === 'custom-service' && isChecked && selected && (
                        <div className="mt-2">
                          <Textarea
                            placeholder="Descrizione del servizio personalizzato..."
                            value={selected.customDescription || ""}
                            onChange={(e) => {
                              onChange(selectedServices.map(s => 
                                s.id === service.id ? { ...s, customDescription: e.target.value } : s
                              ));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm glass-input min-h-[60px]"
                          />
                        </div>
                      )}
                      
                      {/* Campi editabili quando selezionato */}
                      {isChecked && selected && (
                        <div className="mt-3 pt-3 border-t border-border/20 grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-white/70 font-medium">N° Servizi</Label>
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
                                onChange={(e) => updateQuantita(selected.id, e.target.value)}
                                onBlur={(e) => handleQuantitaBlur(selected.id, e.target.value)}
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
                              onChange={(e) => updatePrezzoUnitario(selected.id, parseFloat(e.target.value) || 0)}
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

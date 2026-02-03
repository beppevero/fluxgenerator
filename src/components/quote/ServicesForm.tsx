import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import { Service, SelectedService, Configuration } from "@/types/quote";
import { servicesList, categorieLabels } from "@/data/services";

interface ServicesFormProps {
  configuration: Configuration;
  selectedServices: SelectedService[];
  onChange: (services: SelectedService[]) => void;
}

export function ServicesForm({ configuration, selectedServices, onChange }: ServicesFormProps) {
  const filteredServices = servicesList.filter(
    (service) => service.applicaA === 'entrambi' || service.applicaA === configuration.tipoVeicolo
  );

  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.categoria]) {
      acc[service.categoria] = [];
    }
    acc[service.categoria].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const isSelected = (serviceId: string) => 
    selectedServices.some(s => s.id === serviceId);

  const toggleService = (service: Service) => {
    if (isSelected(service.id)) {
      onChange(selectedServices.filter(s => s.id !== service.id));
    } else {
      onChange([...selectedServices, { ...service, quantita: 1 }]);
    }
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <ListChecks className="w-4 h-4 text-accent" />
        Servizi
      </h3>
      
      <div className="space-y-5">
        {Object.entries(groupedServices).map(([categoria, services]) => (
          <div key={categoria} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {categorieLabels[categoria]}
            </h4>
            
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer ${
                    isSelected(service.id)
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/30'
                  }`}
                  onClick={() => toggleService(service)}
                >
                  <Checkbox
                    id={service.id}
                    checked={isSelected(service.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={service.id} className="cursor-pointer text-sm font-medium block">
                      {service.nome}
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-accent">
                        {formatPrice(service.prezzoRiservato)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(service.prezzoListino)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {service.tipo === 'mensile' ? '/mese' : 'U.T.'}
                      </Badge>
                    </div>
                  </div>
                  {service.isCrono && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Crono
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

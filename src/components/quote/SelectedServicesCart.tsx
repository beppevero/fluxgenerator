import { ShoppingCart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SelectedService } from "@/types/quote";

interface SelectedServicesCartProps {
  selectedServices: SelectedService[];
  onRemove: (id: string) => void;
}

function getBaseId(id: string): string {
  return id.replace(/-annuale$/, '').replace(/-mensile$/, '');
}

export function SelectedServicesCart({ selectedServices, onRemove }: SelectedServicesCartProps) {
  if (selectedServices.length === 0) return null;

  const handleClick = (id: string) => {
    const baseId = getBaseId(id);
    const el = document.getElementById(`service-row-${baseId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-accent');
      setTimeout(() => el.classList.remove('ring-2', 'ring-accent'), 1500);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <ShoppingCart className="w-4 h-4 text-accent" />
        Carrello Servizi
        <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent border-accent/30">
          {selectedServices.length}
        </Badge>
      </h3>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedServices.map((s) => {
          const label = s.id === 'custom-service'
            ? (s.customTitle?.trim() || 'Servizio Personalizzato')
            : s.nome;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleClick(s.id)}
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 hover:bg-accent/20 hover:border-accent/60 transition-all text-xs"
              title="Clicca per modificare"
            >
              <span className="font-medium text-white truncate max-w-[180px]">{label}</span>
              <span className="text-accent font-semibold">×{s.quantita}</span>
              <span className="text-muted-foreground">{formatPrice(s.prezzoUnitario * s.quantita)}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onRemove(s.id); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemove(s.id); } }}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/30 transition-colors cursor-pointer"
                aria-label="Rimuovi"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

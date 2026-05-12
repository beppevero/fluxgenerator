import { ShoppingCart, X, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SelectedService } from "@/types/quote";

interface SelectedServicesCartProps {
  selectedServices: SelectedService[];
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantita: number) => void;
}

function getBaseId(id: string): string {
  return id.replace(/-annuale$/, '').replace(/-mensile$/, '');
}

export function SelectedServicesCart({ selectedServices, onRemove, onQuantityChange }: SelectedServicesCartProps) {
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

  const AUTO_MANAGED_IDS = ['carta-aziendale'];

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
          const isManaged = AUTO_MANAGED_IDS.includes(s.id);
          return (
            <div
              key={s.id}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 hover:border-accent/60 transition-all text-xs"
            >
              <button
                type="button"
                onClick={() => handleClick(s.id)}
                className="font-medium text-white truncate max-w-[180px] hover:text-accent transition-colors"
                title="Clicca per modificare"
              >
                {label}
              </button>

              <div className="inline-flex items-center gap-0.5 ml-1 rounded-full bg-black/30 border border-white/10 px-0.5">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onQuantityChange(s.id, Math.max(1, s.quantita - 1)); }}
                  disabled={isManaged || s.quantita <= 1}
                  className="p-0.5 rounded-full hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Diminuisci"
                >
                  <Minus className="w-3 h-3 text-white" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={s.quantita}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    onQuantityChange(s.id, isNaN(v) || v < 1 ? 1 : v);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isManaged}
                  className="w-7 text-center bg-transparent text-white text-xs font-semibold focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onQuantityChange(s.id, s.quantita + 1); }}
                  disabled={isManaged}
                  className="p-0.5 rounded-full hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Aumenta"
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>

              <span className="text-muted-foreground ml-1">{formatPrice(s.prezzoUnitario * s.quantita)}</span>

              {!isManaged && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(s.id); }}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/30 transition-colors"
                  aria-label="Rimuovi"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

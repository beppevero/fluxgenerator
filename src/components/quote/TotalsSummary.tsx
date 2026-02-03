import { TrendingUp, CreditCard } from "lucide-react";

interface TotalsSummaryProps {
  totals: {
    mensile: number;
    unaTantum: number;
    carteAziendaQuantita: number;
    carteAziendaCosto: number;
  };
}

export function TotalsSummary({ totals }: TotalsSummaryProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price);

  return (
    <div className="form-section bg-primary text-primary-foreground">
      <h3 className="form-section-title text-primary-foreground">
        <TrendingUp className="w-4 h-4" />
        Riepilogo Totali
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-primary-foreground/20">
          <span className="text-sm opacity-90">Canoni Mensili</span>
          <span className="text-lg font-bold">{formatPrice(totals.mensile)}</span>
        </div>
        
        <div className="flex justify-between items-center pb-2 border-b border-primary-foreground/20">
          <span className="text-sm opacity-90">Costi Una Tantum</span>
          <span className="text-lg font-bold">{formatPrice(totals.unaTantum)}</span>
        </div>

        {totals.carteAziendaQuantita > 0 && (
          <div className="flex items-center gap-2 text-xs opacity-80">
            <CreditCard className="w-3 h-3" />
            <span>Include {totals.carteAziendaQuantita} Carta Azienda ({formatPrice(totals.carteAziendaCosto)})</span>
          </div>
        )}
      </div>
    </div>
  );
}

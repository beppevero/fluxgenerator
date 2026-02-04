import { Calculator, TrendingUp, Calendar, Zap } from "lucide-react";

interface TotalsSummaryProps {
  totals: {
    mensile: number;
    annuale: number;
    unaTantum: number;
    carteAziendaSuggerite: number;
  };
}

export function TotalsSummary({ totals }: TotalsSummaryProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price);

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <Calculator className="w-4 h-4 text-accent" />
        Riepilogo Economico
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card-intense rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Mensile</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {formatPrice(totals.mensile)}
          </p>
        </div>
        
        <div className="glass-card-intense rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Annuale</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {formatPrice(totals.annuale)}
          </p>
        </div>
        
        <div className="glass-card-intense rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Una Tantum</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {formatPrice(totals.unaTantum)}
          </p>
        </div>
      </div>
    </div>
  );
}

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
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase">Mensile</span>
          </div>
          <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
            {formatPrice(totals.mensile)}
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-600 uppercase">Annuale</span>
          </div>
          <p className="text-xl font-bold text-green-800 dark:text-green-300">
            {formatPrice(totals.annuale)}
          </p>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-semibold text-orange-600 uppercase">Una Tantum</span>
          </div>
          <p className="text-xl font-bold text-orange-800 dark:text-orange-300">
            {formatPrice(totals.unaTantum)}
          </p>
        </div>
      </div>
    </div>
  );
}

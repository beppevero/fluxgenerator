import { Calculator, TrendingUp, Calendar, Zap } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface TotalsSummaryProps {
  totals: {
    mensile: number;
    annuale: number;
    unaTantum: number;
    carteAziendaSuggerite: number;
  };
}

function AnimatedPrice({ value }: { value: number }) {
  const animated = useAnimatedCounter(value, 500);
  return (
    <span>
      {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(animated)}
    </span>
  );
}

export function TotalsSummary({ totals }: TotalsSummaryProps) {
  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <Calculator className="w-4 h-4 text-accent" />
        Riepilogo Economico
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card-intense rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Mensile</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            <AnimatedPrice value={totals.mensile} />
          </p>
        </div>
        
        <div className="glass-card-intense rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Annuale</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            <AnimatedPrice value={totals.annuale} />
          </p>
        </div>
        
        <div className="glass-card-intense rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Una Tantum</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            <AnimatedPrice value={totals.unaTantum} />
          </p>
        </div>
      </div>
    </div>
  );
}

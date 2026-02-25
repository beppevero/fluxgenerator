import { Calculator, TrendingUp, Calendar, Zap } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TotalsSummaryProps {
  totals: {
    mensile: number;
    annuale: number;
    unaTantum: number;
    carteAziendaSuggerite: number;
  };
  smartRounding: boolean;
  onRoundingChange: (value: boolean) => void;
}

function roundToNearestTen(value: number): number {
  return Math.floor(value / 10) * 10;
}

function AnimatedPrice({ value, smartRounding }: { value: number, smartRounding: boolean }) {
  const displayValue = smartRounding ? roundToNearestTen(value) : value;
  const animated = useAnimatedCounter(displayValue, 500);
  return (
    <span>
      {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(animated)}
    </span>
  );
}

export function TotalsSummary({ totals, smartRounding, onRoundingChange }: TotalsSummaryProps) {
  return (
    <div className="form-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="form-section-title mb-0">
          <Calculator className="w-4 h-4 text-accent" />
          Riepilogo Economico
        </h3>
        <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Switch 
            id="smart-rounding" 
            checked={smartRounding}
            onCheckedChange={onRoundingChange}
          />
          <Label htmlFor="smart-rounding" className="text-[10px] uppercase tracking-wider text-white/60 cursor-pointer">
            Arrotondamento Chiusura
          </Label>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card-intense rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Mensile</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            <AnimatedPrice value={totals.mensile} smartRounding={smartRounding} />
          </p>
        </div>
        
        <div className="glass-card-intense rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Annuale</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            <AnimatedPrice value={totals.annuale} smartRounding={smartRounding} />
          </p>
        </div>
        
        <div className="glass-card-intense rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase">Una Tantum</span>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            <AnimatedPrice value={totals.unaTantum} smartRounding={smartRounding} />
          </p>
        </div>
      </div>
    </div>
  );
}

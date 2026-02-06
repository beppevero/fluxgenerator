import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, FileText, Clock, CalendarDays, Zap } from "lucide-react";
import { PaymentInfo } from "@/types/quote";

export type PresetType = "STANDARD" | "RENTRI" | "INCENTIVO" | null;

interface PaymentFormProps {
  paymentInfo: PaymentInfo;
  onChange: (info: PaymentInfo) => void;
  activePreset: PresetType;
  onPresetChange: (preset: PresetType) => void;
}

const PRESET_DATA: Record<Exclude<PresetType, null>, { testo: string; durata: string }> = {
  STANDARD: {
    testo: `- I dispositivi sono forniti in comodato d'uso gratuito;\n- Solo per telematica di Bordo: si richiede l'invio dei libretti dei mezzi per un previo controllo di compatibilità;\n- Consegna stimata in 1/4 settimane dal saldo;\n- Recesso: non ammesso nel 1° anno. Dal 2° anno, penale del 50% dei canoni residui.`,
    durata: "24",
  },
  RENTRI: {
    testo: `- I dispositivi sono forniti in comodato d'uso gratuito;\n- Consegna stimata in 1/4 settimane dal saldo;\n- Recesso: non ammesso nel 1° anno. Dal 2° anno, penale del 50% dei canoni residui.\n- Conformità R.E.N.T.R.I. (Art. 16 D.M. 59/2023): Il sistema garantisce i requisiti tecnici per la tracciabilità rifiuti.\n- Responsabilità: Il Cliente resta l'unico responsabile della trasmissione dati al portale RENTRI e dell'associazione FIR digitale.`,
    durata: "36",
  },
  INCENTIVO: {
    testo: `- I dispositivi sono forniti in vendita;\n- Consegna stimata in 1/4 settimane dal saldo;\n- Idoneità Transizione 4.0: Il dispositivo rientra tra i beni strumentali interconnessi (Allegato A, Legge 232/2016) per agevolazioni fiscali.`,
    durata: "60",
  },
};

const PRESET_LABELS: { key: Exclude<PresetType, null>; label: string }[] = [
  { key: "STANDARD", label: "STANDARD" },
  { key: "RENTRI", label: "R.E.N.T.R.I." },
  { key: "INCENTIVO", label: "INCENTIVO 4.0/5.0" },
];

const validitaOptions = [
  { value: "1 giorno", label: "1 giorno (Last Minute)" },
  { value: "3 giorni", label: "3 giorni" },
  { value: "7 giorni", label: "7 giorni" },
  { value: "10 giorni", label: "10 giorni" },
  { value: "15 giorni", label: "15 giorni" },
  { value: "30 giorni", label: "30 giorni" },
];

export function PaymentForm({ paymentInfo, onChange, activePreset, onPresetChange }: PaymentFormProps) {
  const handlePresetClick = (presetKey: Exclude<PresetType, null>) => {
    if (activePreset === presetKey) {
      // Deselect: clear condizioniFornitura, reset durata to 24
      onPresetChange(null);
      onChange({
        ...paymentInfo,
        condizioniFornitura: "",
        durataContrattuale: "24",
      });
    } else {
      const data = PRESET_DATA[presetKey];
      onPresetChange(presetKey);
      onChange({
        ...paymentInfo,
        condizioniFornitura: data.testo,
        durataContrattuale: data.durata,
      });
    }
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <CreditCard className="w-4 h-4 text-accent" />
        Condizioni e Note
      </h3>
      
      <div className="space-y-4">
        {/* Preset Buttons */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground/90 font-medium">
            <Zap className="w-3 h-3" />
            Preset Condizioni
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_LABELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetClick(key)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border
                  ${activePreset === key
                    ? 'bg-accent text-accent-foreground border-accent shadow-md scale-105'
                    : 'bg-white/50 text-foreground/70 border-border hover:bg-white/80 hover:border-accent/50 hover:text-foreground'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="durataContrattuale" className="flex items-center gap-2 text-foreground/90 font-medium">
              <CalendarDays className="w-3 h-3" />
              Durata
            </Label>
            <Select
              value={paymentInfo.durataContrattuale}
              onValueChange={(value) => onChange({ ...paymentInfo, durataContrattuale: value })}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Mesi" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border z-50">
                <SelectItem value="12">12 mesi</SelectItem>
                <SelectItem value="24">24 mesi</SelectItem>
                <SelectItem value="36">36 mesi</SelectItem>
                <SelectItem value="60">60 mesi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condizioniPagamento" className="flex items-center gap-2 text-foreground/90 font-medium">
              <CreditCard className="w-3 h-3" />
              Cond. Pagamento
            </Label>
            <Input
              id="condizioniPagamento"
              placeholder="Es: RIBA 30gg"
              value={paymentInfo.condizioniPagamento}
              onChange={(e) => onChange({ ...paymentInfo, condizioniPagamento: e.target.value })}
              className="glass-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="validitaOfferta" className="flex items-center gap-2 text-foreground/90 font-medium">
              <Clock className="w-3 h-3" />
              Validità Offerta
            </Label>
            <Select
              value={paymentInfo.validitaOfferta}
              onValueChange={(value) => onChange({ ...paymentInfo, validitaOfferta: value })}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Seleziona..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-border z-50">
                {validitaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condizioniFornitura" className="flex items-center gap-2 text-foreground/90 font-medium">
            <FileText className="w-3 h-3" />
            Condizioni di Fornitura
          </Label>
          <Textarea
            id="condizioniFornitura"
            placeholder="Inserisci note logistiche e clausole contrattuali estese..."
            value={paymentInfo.condizioniFornitura}
            onChange={(e) => onChange({ ...paymentInfo, condizioniFornitura: e.target.value })}
            rows={4}
            className="resize-none glass-input"
          />
        </div>
      </div>
    </div>
  );
}

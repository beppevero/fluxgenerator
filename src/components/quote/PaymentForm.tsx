import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, FileText, Clock, CalendarDays, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { PaymentInfo } from "@/types/quote";

export type PresetType = "STANDARD" | "RENTRI" | "INCENTIVO" | "PA" | null;

interface PaymentFormProps {
  paymentInfo: PaymentInfo;
  onChange: (info: PaymentInfo) => void;
  activePreset: PresetType;
  onPresetChange: (preset: PresetType) => void;
}

const PRESET_DATA: Record<Exclude<PresetType, null>, { testo: string; durata: string }> = {
  STANDARD: {
    testo: `- I dispositivi sono forniti in comodato d'uso gratuito;\n- Solo per telematica di Bordo: si richiede l'invio dei libretti dei mezzi per un previo controllo di compatibilità dei dispositivi con il mezzo;\n- I tempi di consegna sono stimati in 1/4 settimane dalla sottoscrizione e successivo saldo della presente proposta commerciale;\n- Non è ammessa disdetta anticipata entro il primo anno di contratto. A partire dal secondo anno, in caso di recesso anticipato, il Cliente sarà tenuto al pagamento di un corrispettivo pari al 50% dei canoni residui fino alla naturale scadenza contrattuale.`,
    durata: "24",
  },
  RENTRI: {
    testo: `- I dispositivi sono forniti in comodato d'uso gratuito;\n- I tempi di consegna sono stimati in 1/4 settimane dalla sottoscrizione e successivo saldo della presente proposta commerciale;\n- Non è ammessa disdetta anticipata entro il primo anno di contratto. A partire dal secondo anno, in caso di recesso anticipato, il Cliente sarà tenuto al pagamento di un corrispettivo pari al 50% dei canoni residui fino alla naturale scadenza contrattuale.\n- Il Fornitore garantisce che il servizio di localizzazione veicolare (di seguito, il 'Sistema') è conforme ai requisiti tecnici e funzionali stabiliti per i sistemi di geolocalizzazione previsti dall'Articolo 16 del D.M. n. 59/2023 (R.E.N.T.R.I.) e dal relativo Decreto Direttoriale attuativo (D.D. n. 253/2024 e ss.mm.ii.).\n- Il Sistema è progettato per rilevare, registrare e rendere disponibili le informazioni relative al percorso, al tempo di percorrenza e alla posizione geografica degli autoveicoli oggetto del servizio, secondo gli standard richiesti per la tracciabilità dei rifiuti.\n- Il Cliente (Trasportatore) resta l'unico responsabile per l'adempimento degli obblighi di trasmissione dei dati di geolocalizzazione al R.E.N.T.R.I. e per la corretta associazione del percorso al Formulario di Identificazione del Rifiuto (FIR) digitale, secondo le modalità e le tempistiche definite dalla normativa vigente.`,
    durata: "36",
  },
  INCENTIVO: {
    testo: `- I dispositivi sono forniti in vendita;\n- I tempi di consegna sono stimati in 1/4 settimane dalla sottoscrizione e successivo saldo della presente proposta commerciale;\n- Il dispositivo proposto rientra tra i beni strumentali interconnessi e conformi ai requisiti previsti dal Piano Nazionale Industria 4.0 (oggi Transizione 4.0), come da Allegato A della Legge n. 232/2016, e risulta pertanto idoneo ai fini delle agevolazioni fiscali previste dalla normativa vigente.`,
    durata: "60",
  },
  PA: {
    testo: `- L'offerta è da intendersi al netto di IVA. Si applicherà il regime di Split Payment (Scissione dei pagamenti) ai sensi dell'art. 17-ter del DPR 633/72, con fatturazione elettronica obbligatoria tramite sistema SDI;\n- I dispositivi sono forniti in vendita;\n- Modalità di perfezionamento: La fornitura sarà gestita tramite Ordine Diretto o Trattativa Diretta su portale MePA (o altra piattaforma di e-procurement indicata dall'Ente), previa emissione di CIG (Codice Identificativo Gara);\n- Modalità di pagamento: Il pagamento avverrà tramite bonifico bancario su conto corrente dedicato alla tracciabilità dei flussi finanziari (L. 136/2010), con scadenza a 30 giorni data ricevimento fattura, previa verifica di regolarità contributiva (DURC) e attestazione di regolare esecuzione/collaudo;\n- Le attività di installazione e configurazione sono a carico dell'Ente. L'azienda fornirà la documentazione tecnica necessaria e il supporto remoto per il primo avvio;\n- La consegna del materiale avverrà entro 4/8 settimane dalla data di ricezione dell'ordinativo di fornitura (OdF) sul portale MePA o dalla notifica del provvedimento di affidamento definitivo.`,
    durata: "12",
  },
};

const PRESET_LABELS: { key: Exclude<PresetType, null>; label: string }[] = [
  { key: "STANDARD", label: "STANDARD" },
  { key: "RENTRI", label: "R.E.N.T.R.I." },
  { key: "INCENTIVO", label: "INCENTIVO 4.0/5.0" },
  { key: "PA", label: "P.A." },
];

const validitaOptions = [
  { value: "1 giorno", label: "1 giorno (Last Minute)" },
  { value: "3 giorni", label: "3 giorni" },
  { value: "7 giorni", label: "7 giorni" },
  { value: "10 giorni", label: "10 giorni" },
  { value: "15 giorni", label: "15 giorni" },
  { value: "30 giorni", label: "30 giorni" },
  { value: "data-personalizzata", label: "Personalizzata" },
];

const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const GIORNI_SETTIMANA = ["Lu","Ma","Me","Gi","Ve","Sa","Do"];

function MiniCalendar({ onSelect, onClose }: { onSelect: (date: string) => void; onClose: () => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d < todayMidnight) return;
    setSelectedDay(day);
    const gg = String(day).padStart(2, '0');
    const mm = String(viewMonth + 1).padStart(2, '0');
    onSelect(`${gg}.${mm}.${viewYear}`);
  };

  const isToday = (day: number) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayMidnight;
  };

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1000,
        bottom: '100%',
        left: 0,
        right: 0,
        marginBottom: '4px',
        backgroundColor: 'rgba(15, 23, 42, 0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header mese/anno */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={prevMonth}
          style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px' }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>
          {MESI[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Giorni settimana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
        {GIORNI_SETTIMANA.map(g => (
          <div key={g} style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, padding: '2px 0' }}>
            {g}
          </div>
        ))}
      </div>

      {/* Celle giorni */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, idx) => (
          <div key={idx}>
            {day ? (
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={isPast(day)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: isPast(day) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedDay === day ? 700 : isToday(day) ? 600 : 400,
                  transition: 'all 0.15s ease',
                  backgroundColor: selectedDay === day
                    ? '#0095ff'
                    : isToday(day)
                    ? 'rgba(0,149,255,0.2)'
                    : 'transparent',
                  color: isPast(day)
                    ? 'rgba(255,255,255,0.2)'
                    : selectedDay === day
                    ? 'white'
                    : isToday(day)
                    ? '#0095ff'
                    : 'rgba(255,255,255,0.85)',
                }}
              >
                {day}
              </button>
            ) : <div />}
          </div>
        ))}
      </div>

      {/* Pulsante chiudi */}
      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: '12px',
          width: '100%',
          padding: '8px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        Annulla
      </button>
    </div>
  );
}

const selectClassName = "w-full h-10 px-3 rounded-xl text-sm text-white border border-white/20 cursor-pointer backdrop-blur-sm outline-none focus:border-[rgba(0,149,255,0.5)] focus:shadow-[0_0_0_2px_rgba(0,149,255,0.2)]";
const selectStyle = { backgroundColor: 'rgba(255,255,255,0.08)', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' };

export function PaymentForm({ paymentInfo, onChange, activePreset, onPresetChange }: PaymentFormProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const isPresetText = (text: string) => Object.values(PRESET_DATA).some(p => p.testo === text);
  const isCustomDate = !validitaOptions.slice(0, -1).some(o => o.value === paymentInfo.validitaOfferta);

  const handleValiditaChange = (value: string) => {
    if (value === "data-personalizzata") {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      onChange({ ...paymentInfo, validitaOfferta: value });
    }
  };

  const handleDateSelect = (formatted: string) => {
    onChange({ ...paymentInfo, validitaOfferta: formatted });
    setShowCalendar(false);
  };

  const handlePresetClick = (presetKey: Exclude<PresetType, null>) => {
    if (activePreset === presetKey) {
      onPresetChange(null);
      onChange({ ...paymentInfo, condizioniFornitura: "", durataContrattuale: "24" });
    } else {
      const currentText = paymentInfo.condizioniFornitura.trim();
      if (currentText && !isPresetText(currentText)) {
        const confirmed = window.confirm("Il campo 'Condizioni di Fornitura' contiene testo personalizzato. Vuoi sovrascriverlo con il preset?");
        if (!confirmed) return;
      }
      const data = PRESET_DATA[presetKey];
      onPresetChange(presetKey);
      onChange({ ...paymentInfo, condizioniFornitura: data.testo, durataContrattuale: data.durata });
    }
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <CreditCard className="w-4 h-4 text-accent" />
        Condizioni e Note
      </h3>

      <div className="space-y-4">
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${
                  activePreset === key
                    ? 'bg-accent text-accent-foreground border-accent shadow-md scale-105'
                    : 'bg-white/50 text-foreground/70 border-black/8 hover:bg-white/70 hover:border-accent/40 hover:text-foreground'
                }`}
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
            <select
              id="durataContrattuale"
              value={paymentInfo.durataContrattuale}
              onChange={(e) => onChange({ ...paymentInfo, durataContrattuale: e.target.value })}
              className={selectClassName}
              style={selectStyle}
            >
              <option value="12" style={{ backgroundColor: '#0b1120', color: 'white' }}>12 mesi</option>
              <option value="24" style={{ backgroundColor: '#0b1120', color: 'white' }}>24 mesi</option>
              <option value="36" style={{ backgroundColor: '#0b1120', color: 'white' }}>36 mesi</option>
              <option value="60" style={{ backgroundColor: '#0b1120', color: 'white' }}>60 mesi</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condizioniPagamento" className="flex items-center gap-2 text-foreground/90 font-medium">
              <CreditCard className="w-3 h-3" />
              Cond. Pagamento
            </Label>
            <Input
              id="condizioniPagamento"
              placeholder="Es: B.B.A."
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
            <div ref={calendarRef} style={{ position: 'relative' }}>
              <select
                id="validitaOfferta"
                value={isCustomDate ? "data-personalizzata" : paymentInfo.validitaOfferta}
                onChange={(e) => handleValiditaChange(e.target.value)}
                className={selectClassName}
                style={selectStyle}
              >
                {validitaOptions.map((option) => (
                  <option key={option.value} value={option.value} style={{ backgroundColor: '#0b1120', color: 'white' }}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isCustomDate && !showCalendar && (
                <p className="text-xs text-accent/80 font-medium px-1 mt-1">{paymentInfo.validitaOfferta}</p>
              )}
              {showCalendar && (
                <MiniCalendar
                  onSelect={handleDateSelect}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
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
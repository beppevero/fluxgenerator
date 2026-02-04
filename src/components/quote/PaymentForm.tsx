import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, FileText, Clock, CalendarDays } from "lucide-react";
import { PaymentInfo } from "@/types/quote";

interface PaymentFormProps {
  paymentInfo: PaymentInfo;
  onChange: (info: PaymentInfo) => void;
}

export function PaymentForm({ paymentInfo, onChange }: PaymentFormProps) {
  return (
    <div className="form-section">
      <h3 className="form-section-title">
        <CreditCard className="w-4 h-4 text-accent" />
        Condizioni e Note
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="durataContrattuale" className="flex items-center gap-2 text-foreground/90 font-medium">
              <CalendarDays className="w-3 h-3" />
              Durata Contrattuale
            </Label>
            <Select
              value={paymentInfo.durataContrattuale}
              onValueChange={(value) => onChange({ ...paymentInfo, durataContrattuale: value })}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Seleziona durata" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border">
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
              Condizioni di Pagamento
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
            <Input
              id="validitaOfferta"
              placeholder="Es: 30 giorni"
              value={paymentInfo.validitaOfferta}
              onChange={(e) => onChange({ ...paymentInfo, validitaOfferta: e.target.value })}
              className="glass-input"
            />
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

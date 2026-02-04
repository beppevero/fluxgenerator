import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, FileText, Clock } from "lucide-react";
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condizioniPagamento" className="flex items-center gap-2">
              <CreditCard className="w-3 h-3" />
              Condizioni di Pagamento
            </Label>
            <Input
              id="condizioniPagamento"
              placeholder="Es: RIBA 30gg, Bonifico anticipato"
              value={paymentInfo.condizioniPagamento}
              onChange={(e) => onChange({ ...paymentInfo, condizioniPagamento: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="validitaOfferta" className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Validità Offerta
            </Label>
            <Input
              id="validitaOfferta"
              placeholder="Es: 30 giorni dalla data"
              value={paymentInfo.validitaOfferta}
              onChange={(e) => onChange({ ...paymentInfo, validitaOfferta: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condizioniFornitura" className="flex items-center gap-2">
            <FileText className="w-3 h-3" />
            Condizioni di Fornitura
          </Label>
          <Textarea
            id="condizioniFornitura"
            placeholder="Inserisci note logistiche e clausole contrattuali estese..."
            value={paymentInfo.condizioniFornitura}
            onChange={(e) => onChange({ ...paymentInfo, condizioniFornitura: e.target.value })}
            rows={4}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}

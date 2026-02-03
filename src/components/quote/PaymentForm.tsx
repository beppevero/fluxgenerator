import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, CalendarDays } from "lucide-react";
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
        Condizioni Pagamento
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="modalitaPagamento">Modalità di Pagamento</Label>
          <Textarea
            id="modalitaPagamento"
            placeholder="Es: RIBA 30gg, Bonifico anticipato, 50% acconto e saldo 30gg"
            value={paymentInfo.modalitaPagamento}
            onChange={(e) => onChange({ ...paymentInfo, modalitaPagamento: e.target.value })}
            className="resize-none min-h-[80px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="validitaOfferta" className="flex items-center gap-2">
            <CalendarDays className="w-3 h-3" />
            Validità Offerta
          </Label>
          <Input
            id="validitaOfferta"
            placeholder="Es: 30 giorni dalla data di emissione"
            value={paymentInfo.validitaOfferta}
            onChange={(e) => onChange({ ...paymentInfo, validitaOfferta: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

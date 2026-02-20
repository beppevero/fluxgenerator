import { forwardRef } from "react";
import { QuoteData } from "@/types/quote";
import fluxLogo from "@/assets/flux-logo.png";
import gtFleet365Logo from "@/assets/gt-fleet-365-logo.png";
import macnilLogo from "@/assets/macnil-logo.png";

interface QuotePreviewProps {
  quoteData: QuoteData;
}

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(({
  quoteData,
}, ref) => {
  const { clientData, paymentInfo, selectedServices, totals } = quoteData;
  const isModulo = clientData.documentType === 'modulo';
  const lr = clientData.legaleRappresentante;
  const da = clientData.datiAzienda;

  const formatPrice = (price: number) => new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(price);

  const formatDateFull = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  const calculateExpiryDate = () => {
    const validita = paymentInfo.validitaOfferta;
    if (!validita) return "";
    const daysMatch = validita.match(/^(\d+)/);
    if (!daysMatch) return validita;
    const days = parseInt(daysMatch[1], 10);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return `${String(expiryDate.getDate()).padStart(2, '0')}.${String(expiryDate.getMonth() + 1).padStart(2, '0')}.${expiryDate.getFullYear()}`;
  };

  const ragioneSociale = clientData.ragioneSociale || "RAGIONE SOCIALE AZIENDA";
  const sectionTitleStyle = "text-[11px] font-bold text-[#0066b3] mb-3 uppercase tracking-tight border-b border-gray-100 pb-1";
  const legalTextStyle = "text-[9px] text-gray-600 leading-relaxed pdf-text-flow";

  const renderEconomicTable = () => (
    <div className="mb-6 px-8">
      <h3 className={sectionTitleStyle}>1. Valorizzazione economica</h3>
      {selectedServices.length > 0 ? (
        <table className="w-full text-[9px] border-collapse" style={{ display: 'table' }}>
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-[8px] font-bold uppercase tracking-wider">
              <th className="text-left p-2 border-b border-gray-200">Servizio</th>
              <th className="text-center p-2 border-b border-gray-200">Quantità</th>
              <th className="text-right p-2 border-b border-gray-200">Prezzo Unitario</th>
              <th className="text-right p-2 border-b border-gray-200">Totale</th>
            </tr>
          </thead>
          <tbody>
            {selectedServices.map((service) => (
              <tr key={service.id} className="border-b border-gray-50">
                <td className="p-2">
                  <div className="font-bold text-gray-800">{service.nome}</div>
                  <div className="text-[7px] text-gray-400 uppercase">{service.periodo}</div>
                </td>
                <td className="p-2 text-center text-gray-600">{service.quantita}</td>
                <td className="p-2 text-right text-gray-600">{formatPrice(service.prezzoUnitario)}</td>
                <td className="p-2 text-right font-bold text-gray-900">{formatPrice(service.prezzoUnitario * service.quantita)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="py-8 text-center text-gray-300 border-2 border-dashed rounded-xl italic">
          Nessun servizio selezionato
        </div>
      )}
    </div>
  );

  return (
    <div ref={ref} className="bg-white text-gray-900 min-h-full py-12 flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="px-12 flex items-center justify-between mb-16">
        <img src={gtFleet365Logo} alt="GT Fleet 365" className="h-10" />
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Data emissione</div>
          <div className="text-sm font-bold text-gray-900">{formatDateFull()}</div>
        </div>
      </div>

      {/* Hero Section for standard PDF */}
      {!isModulo && (
        <div className="px-12 mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider mb-4">
            Commercial Proposal
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight mb-2">
            {ragioneSociale}
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Soluzioni intelligenti per la gestione della flotta aziendale.
          </p>
        </div>
      )}

      {renderEconomicTable()}

      {/* Conditions */}
      <div className="px-12 mb-12">
        <h3 className={sectionTitleStyle}>2. Condizioni Generali</h3>
        <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div>
            <div className="text-[8px] text-gray-400 uppercase font-bold mb-1">Validità Offerta</div>
            <div className="text-sm font-bold text-gray-800">{calculateExpiryDate()}</div>
          </div>
          <div>
            <div className="text-[8px] text-gray-400 uppercase font-bold mb-1">Durata Contrattuale</div>
            <div className="text-sm font-bold text-gray-800">{paymentInfo.durataContrattuale} mesi</div>
          </div>
          <div className="col-span-2">
            <div className="text-[8px] text-gray-400 uppercase font-bold mb-1">Metodo di Pagamento</div>
            <div className="text-sm font-bold text-gray-800">{paymentInfo.condizioniPagamento || "Da concordare"}</div>
          </div>
        </div>
      </div>

      {/* Footer / Logos */}
      <div className="mt-auto px-12 pt-12 border-t border-gray-100 flex items-center justify-between opacity-50 grayscale">
        <img src={macnilLogo} alt="Macnil" className="h-6" />
        <div className="text-[8px] text-gray-400 text-center">
          Progetto GT Fleet 365 - Digital Transformation<br/>
          MAC&NIL S.r.l. - Gravina in Puglia (BA)
        </div>
        <img src={fluxLogo} alt="Flux" className="h-4" />
      </div>
    </div>
  );
});

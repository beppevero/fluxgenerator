import { forwardRef } from "react";
import { QuoteData } from "@/types/quote";

interface QuotePreviewProps {
  quoteData: QuoteData;
}

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(
  ({ quoteData }, ref) => {
    const { clientData, paymentInfo, selectedServices, totals } = quoteData;

    const formatPrice = (price: number) =>
      new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price);

    const formatDate = () => {
      return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date());
    };

    const formatDateShort = () => {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    };

    const serviziMensili = selectedServices.filter(s => s.periodo === 'MENSILE');
    const serviziAnnuali = selectedServices.filter(s => s.periodo === 'ANNUALE');
    const serviziUnaTantum = selectedServices.filter(s => s.periodo === 'U.T.');

    const getPeriodoLabel = (periodo: string) => {
      switch (periodo) {
        case 'MENSILE': return 'Mensile';
        case 'ANNUALE': return 'Annuale';
        case 'U.T.': return 'Una Tantum';
        default: return periodo;
      }
    };

    const totaleMezzi = selectedServices.reduce((sum, s) => sum + s.quantita, 0);

    return (
      <div 
        ref={ref} 
        className="bg-white text-quote-text p-8 min-h-full"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header */}
        <div className="border-b-4 border-primary pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                PROPOSTA COMMERCIALE
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Servizi Fleet Management
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary tracking-tight">Flux</div>
              <p className="text-sm text-muted-foreground mt-1">
                Data: {formatDate()}
              </p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="quote-section-title">Dati Cliente</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><span className="font-medium">Ragione Sociale:</span> {clientData.ragioneSociale || '—'}</p>
            <p><span className="font-medium">Partita IVA:</span> {clientData.partitaIva || '—'}</p>
          </div>
        </div>

        {/* Services Table */}
        {selectedServices.length > 0 && (
          <div className="mb-6">
            <h3 className="quote-section-title">Dettaglio Servizi</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="quote-table-header">
                  <th className="text-left p-3 rounded-tl-md">Servizio</th>
                  <th className="text-left p-3">Descrizione</th>
                  <th className="text-right p-3">Listino</th>
                  <th className="text-right p-3">Scontato</th>
                  <th className="text-right p-3">Riservato</th>
                  <th className="text-center p-3">N° Servizi</th>
                  <th className="text-center p-3">Periodo</th>
                  <th className="text-right p-3 rounded-tr-md">Totale</th>
                </tr>
              </thead>
              <tbody>
                {selectedServices.map((service) => (
                  <tr key={service.id} className="quote-table-row">
                    <td className="p-3 font-medium">{service.nome}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[150px]">
                      {service.descrizione.length > 50 
                        ? service.descrizione.substring(0, 50) + '...'
                        : service.descrizione}
                    </td>
                    <td className="text-right p-3 text-muted-foreground line-through text-xs">
                      {formatPrice(service.prezzoListino)}
                    </td>
                    <td className="text-right p-3 text-muted-foreground line-through text-xs">
                      {formatPrice(service.prezzoScontato)}
                    </td>
                    <td className="text-right p-3 font-medium">
                      {formatPrice(service.prezzoUnitario)}
                    </td>
                    <td className="text-center p-3 font-medium">
                      {service.quantita}
                    </td>
                    <td className="text-center p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        service.periodo === 'MENSILE' ? 'bg-blue-100 text-blue-700' :
                        service.periodo === 'ANNUALE' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {getPeriodoLabel(service.periodo)}
                      </span>
                    </td>
                    <td className="text-right p-3 font-semibold text-accent">
                      {formatPrice(service.prezzoUnitario * service.quantita)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Installation Note */}
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> L'installazione dei dispositivi è a carico del cliente.
          </p>
        </div>

        {/* Totals Summary */}
        {selectedServices.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            {serviziMensili.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Totale Canoni Mensili</p>
                <p className="text-lg font-bold text-blue-800">
                  {formatPrice(totals.mensile)}
                </p>
              </div>
            )}
            {serviziAnnuali.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-xs text-green-600 uppercase font-semibold mb-1">Totale Canoni Annuali</p>
                <p className="text-lg font-bold text-green-800">
                  {formatPrice(totals.annuale)}
                </p>
              </div>
            )}
            {serviziUnaTantum.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-xs text-orange-600 uppercase font-semibold mb-1">Totale Una Tantum</p>
                <p className="text-lg font-bold text-orange-800">
                  {formatPrice(totals.unaTantum)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {selectedServices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Seleziona i servizi dal form per visualizzare il preventivo</p>
          </div>
        )}

        {/* Conditions */}
        {(paymentInfo.condizioniPagamento || paymentInfo.validitaOfferta || paymentInfo.condizioniFornitura) && (
          <div className="space-y-4 mb-6">
            {(paymentInfo.condizioniPagamento || paymentInfo.validitaOfferta) && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="quote-section-title">Condizioni di Pagamento</h3>
                <div className="space-y-1 text-sm">
                  {paymentInfo.condizioniPagamento && (
                    <p><span className="font-medium">Modalità:</span> {paymentInfo.condizioniPagamento}</p>
                  )}
                  {paymentInfo.validitaOfferta && (
                    <p><span className="font-medium">Validità Offerta:</span> {paymentInfo.validitaOfferta}</p>
                  )}
                </div>
              </div>
            )}
            
            {paymentInfo.condizioniFornitura && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="quote-section-title">Condizioni di Fornitura</h3>
                <p className="text-sm whitespace-pre-wrap">{paymentInfo.condizioniFornitura}</p>
              </div>
            )}
          </div>
        )}

        {/* Grand Total */}
        {selectedServices.length > 0 && (
          <div className="bg-primary text-primary-foreground rounded-lg p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Riepilogo Offerta</h3>
                <p className="text-sm opacity-80">Totale N° Servizi: {totaleMezzi}</p>
              </div>
              <div className="text-right space-y-1">
                {totals.mensile > 0 && (
                  <p className="text-sm">
                    <span className="opacity-80">Mensile: </span>
                    <span className="font-bold">{formatPrice(totals.mensile)}</span>
                  </p>
                )}
                {totals.annuale > 0 && (
                  <p className="text-sm">
                    <span className="opacity-80">Annuale: </span>
                    <span className="font-bold">{formatPrice(totals.annuale)}</span>
                  </p>
                )}
                {totals.unaTantum > 0 && (
                  <p className="text-sm">
                    <span className="opacity-80">Una Tantum: </span>
                    <span className="font-bold">{formatPrice(totals.unaTantum)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-quote-border text-center text-xs text-muted-foreground">
          <p>Documento generato automaticamente • I prezzi si intendono IVA esclusa</p>
        </div>
      </div>
    );
  }
);

QuotePreview.displayName = "QuotePreview";

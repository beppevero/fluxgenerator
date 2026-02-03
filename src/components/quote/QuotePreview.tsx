import { forwardRef } from "react";
import { QuoteData } from "@/types/quote";
import { durateContratto, tipiVeicolo, categorieLabels } from "@/data/services";

interface QuotePreviewProps {
  quoteData: QuoteData;
}

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(
  ({ quoteData }, ref) => {
    const { clientData, configuration, paymentInfo, selectedServices, totals } = quoteData;

    const formatPrice = (price: number) =>
      new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price);

    const formatDate = () => {
      return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date());
    };

    const tipoVeicoloLabel = tipiVeicolo.find(t => t.value === configuration.tipoVeicolo)?.label;
    const durataLabel = durateContratto.find(d => d.value === configuration.durataContratto)?.label;

    const serviziMensili = selectedServices.filter(s => s.tipo === 'mensile');
    const serviziUnaTantum = selectedServices.filter(s => s.tipo === 'unaTantum');

    const hasCronoService = selectedServices.some(s => s.isCrono);

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
            <div className="text-right text-sm text-muted-foreground">
              <p>Data: {formatDate()}</p>
              <p className="mt-1">Rif. #{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="quote-section-title">Dati Cliente</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Ragione Sociale:</span> {clientData.ragioneSociale || '—'}</p>
              <p><span className="font-medium">Referente:</span> {clientData.referente || '—'}</p>
              <p><span className="font-medium">N. Mezzi:</span> {clientData.numeroMezzi || '—'}</p>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="quote-section-title">Configurazione</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Tipo Veicolo:</span> {tipoVeicoloLabel}</p>
              <p><span className="font-medium">Durata Contratto:</span> {durataLabel}</p>
            </div>
          </div>
        </div>

        {/* Services Table - Monthly */}
        {serviziMensili.length > 0 && (
          <div className="mb-6">
            <h3 className="quote-section-title">Servizi – Canoni Mensili</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="quote-table-header">
                  <th className="text-left p-3 rounded-tl-md">Servizio</th>
                  <th className="text-right p-3">Listino</th>
                  <th className="text-right p-3 rounded-tr-md">Prezzo Riservato</th>
                </tr>
              </thead>
              <tbody>
                {serviziMensili.map((service) => (
                  <tr key={service.id} className="quote-table-row">
                    <td className="p-3">{service.nome}</td>
                    <td className="text-right p-3 text-muted-foreground line-through">
                      {formatPrice(service.prezzoListino)}
                    </td>
                    <td className="text-right p-3 font-semibold text-accent">
                      {formatPrice(service.prezzoRiservato)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary/5 font-semibold">
                  <td className="p-3" colSpan={2}>Totale Mensile per Mezzo</td>
                  <td className="text-right p-3 text-primary">
                    {formatPrice(serviziMensili.reduce((sum, s) => sum + s.prezzoRiservato, 0))}
                  </td>
                </tr>
                <tr className="bg-primary/10 font-bold text-primary">
                  <td className="p-3 rounded-bl-md" colSpan={2}>
                    Totale Canoni Mensili ({clientData.numeroMezzi} mezzi)
                  </td>
                  <td className="text-right p-3 rounded-br-md">
                    {formatPrice(totals.mensile)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Services Table - One Time */}
        {(serviziUnaTantum.length > 0 || hasCronoService) && (
          <div className="mb-6">
            <h3 className="quote-section-title">Costi Una Tantum</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="quote-table-header">
                  <th className="text-left p-3 rounded-tl-md">Voce</th>
                  <th className="text-center p-3">Qtà</th>
                  <th className="text-right p-3">Listino</th>
                  <th className="text-right p-3 rounded-tr-md">Prezzo Riservato</th>
                </tr>
              </thead>
              <tbody>
                {serviziUnaTantum.map((service) => (
                  <tr key={service.id} className="quote-table-row">
                    <td className="p-3">{service.nome}</td>
                    <td className="text-center p-3">{clientData.numeroMezzi}</td>
                    <td className="text-right p-3 text-muted-foreground line-through">
                      {formatPrice(service.prezzoListino * clientData.numeroMezzi)}
                    </td>
                    <td className="text-right p-3 font-semibold text-accent">
                      {formatPrice(service.prezzoRiservato * clientData.numeroMezzi)}
                    </td>
                  </tr>
                ))}
                {hasCronoService && totals.carteAziendaQuantita > 0 && (
                  <tr className="quote-table-row bg-accent/5">
                    <td className="p-3">
                      Carta Azienda <span className="text-xs text-muted-foreground">(1 ogni 25 mezzi)</span>
                    </td>
                    <td className="text-center p-3">{totals.carteAziendaQuantita}</td>
                    <td className="text-right p-3 text-muted-foreground">—</td>
                    <td className="text-right p-3 font-semibold text-accent">
                      {formatPrice(totals.carteAziendaCosto)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-primary/10 font-bold text-primary">
                  <td className="p-3 rounded-bl-md" colSpan={3}>Totale Una Tantum</td>
                  <td className="text-right p-3 rounded-br-md">
                    {formatPrice(totals.unaTantum)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Empty State */}
        {selectedServices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Seleziona i servizi dal form per visualizzare il preventivo</p>
          </div>
        )}

        {/* Payment Conditions */}
        {(paymentInfo.modalitaPagamento || paymentInfo.validitaOfferta) && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="quote-section-title">Condizioni</h3>
            <div className="space-y-2 text-sm">
              {paymentInfo.modalitaPagamento && (
                <p><span className="font-medium">Modalità di Pagamento:</span> {paymentInfo.modalitaPagamento}</p>
              )}
              {paymentInfo.validitaOfferta && (
                <p><span className="font-medium">Validità Offerta:</span> {paymentInfo.validitaOfferta}</p>
              )}
            </div>
          </div>
        )}

        {/* Grand Total */}
        {selectedServices.length > 0 && (
          <div className="bg-primary text-primary-foreground rounded-lg p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Riepilogo Offerta</h3>
                <p className="text-sm opacity-80">Contratto {durataLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Canone Mensile</p>
                <p className="text-2xl font-bold">{formatPrice(totals.mensile)}</p>
                {totals.unaTantum > 0 && (
                  <p className="text-sm opacity-80 mt-1">
                    + {formatPrice(totals.unaTantum)} una tantum
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

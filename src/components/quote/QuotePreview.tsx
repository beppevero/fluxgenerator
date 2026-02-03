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

    const serviziMensili = selectedServices.filter(s => s.periodo === 'MENSILE');
    const serviziAnnuali = selectedServices.filter(s => s.periodo === 'ANNUALE');
    const serviziUnaTantum = selectedServices.filter(s => s.periodo === 'U.T.');

    const hasCronoService = selectedServices.some(s => s.isCrono);

    const getPeriodoLabel = (periodo: string) => {
      switch (periodo) {
        case 'MENSILE': return 'Mensile';
        case 'ANNUALE': return 'Annuale';
        case 'U.T.': return 'Una Tantum';
        default: return periodo;
      }
    };

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

        {/* Services Tables */}
        {selectedServices.length > 0 && (
          <div className="mb-6">
            <h3 className="quote-section-title">Dettaglio Servizi</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="quote-table-header">
                  <th className="text-left p-3 rounded-tl-md">Servizio</th>
                  <th className="text-left p-3 max-w-[200px]">Descrizione</th>
                  <th className="text-right p-3">Listino</th>
                  <th className="text-right p-3">Scontato</th>
                  <th className="text-right p-3">Riservato</th>
                  <th className="text-center p-3 rounded-tr-md">Periodo</th>
                </tr>
              </thead>
              <tbody>
                {selectedServices.map((service) => (
                  <tr key={service.id} className="quote-table-row">
                    <td className="p-3 font-medium">{service.nome}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[200px]">
                      {service.descrizione.length > 60 
                        ? service.descrizione.substring(0, 60) + '...'
                        : service.descrizione}
                    </td>
                    <td className="text-right p-3 text-muted-foreground line-through">
                      {formatPrice(service.prezzoListino)}
                    </td>
                    <td className="text-right p-3 text-muted-foreground line-through">
                      {formatPrice(service.prezzoScontato)}
                    </td>
                    <td className="text-right p-3 font-semibold text-accent">
                      {formatPrice(service.prezzoRiservato)}
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
                  </tr>
                ))}
                {hasCronoService && totals.carteAziendaQuantita > 0 && (
                  <tr className="quote-table-row bg-accent/5">
                    <td className="p-3 font-medium">CARTA AZIENDALE CRONO</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      Obbligatoria ogni 25 mezzi per servizi Crono (x{totals.carteAziendaQuantita})
                    </td>
                    <td className="text-right p-3 text-muted-foreground">—</td>
                    <td className="text-right p-3 text-muted-foreground">—</td>
                    <td className="text-right p-3 font-semibold text-accent">
                      {formatPrice(totals.carteAziendaCosto)}
                    </td>
                    <td className="text-center p-3">
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        Annuale
                      </span>
                    </td>
                  </tr>
                )}
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
                <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Totale Mensile</p>
                <p className="text-lg font-bold text-blue-800">
                  {formatPrice(totals.mensile)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ({clientData.numeroMezzi} mezzi)
                </p>
              </div>
            )}
            {serviziAnnuali.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-xs text-green-600 uppercase font-semibold mb-1">Totale Annuale</p>
                <p className="text-lg font-bold text-green-800">
                  {formatPrice(totals.annuale)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ({clientData.numeroMezzi} mezzi)
                </p>
              </div>
            )}
            {(serviziUnaTantum.length > 0 || totals.carteAziendaCosto > 0) && (
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-xs text-orange-600 uppercase font-semibold mb-1">Una Tantum</p>
                <p className="text-lg font-bold text-orange-800">
                  {formatPrice(totals.unaTantum)}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  ({clientData.numeroMezzi} mezzi)
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
                <p className="text-sm opacity-80">Contratto {durataLabel} • {clientData.numeroMezzi} mezzi</p>
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

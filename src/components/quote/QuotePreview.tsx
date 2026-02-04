import { forwardRef } from "react";
import { QuoteData } from "@/types/quote";
import fluxLogo from "@/assets/flux-logo.png";

interface QuotePreviewProps {
  quoteData: QuoteData;
}

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(
  ({ quoteData }, ref) => {
    const { clientData, paymentInfo, selectedServices, totals } = quoteData;

    const formatPrice = (price: number) =>
      new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price);

    const formatDateFull = () => {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    };

    const formatDateLong = () => {
      return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date());
    };

    const totaleMezzi = selectedServices.reduce((sum, s) => sum + s.quantita, 0);

    // Calcoli per la tabella: Canoni e Una Tantum separati
    const totaleCanoneMensile = selectedServices
      .filter(s => s.periodo === 'MENSILE')
      .reduce((sum, s) => sum + (s.prezzoUnitario * s.quantita), 0);

    const totaleCanoneAnnuale = selectedServices
      .filter(s => s.periodo === 'ANNUALE')
      .reduce((sum, s) => sum + (s.prezzoUnitario * s.quantita), 0);

    const totaleUnaTantum = selectedServices
      .filter(s => s.periodo === 'U.T.')
      .reduce((sum, s) => sum + (s.prezzoUnitario * s.quantita), 0);

    const ragioneSociale = clientData.ragioneSociale || "RAGIONE SOCIALE AZIENDA";

    return (
      <div 
        ref={ref} 
        className="bg-white text-gray-900 min-h-full"
        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
      >
        {/* ============ PAGINA 1 - FRONTESPIZIO ============ */}
        <div className="p-8 min-h-[700px] flex flex-col">
          {/* Header con logo */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div className="text-xs text-gray-500 leading-tight">
              Piattaforma Software Avanzata | Mobilità, Gestione,<br />
              Controllo e Sicurezza, Telematica di Mezzi Aziendali e Asset
            </div>
            <img src={fluxLogo} alt="Flux" className="h-12 w-auto" />
          </div>

          {/* Contenuto centrale - Frontespizio */}
          <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
            <h2 className="text-lg text-gray-600 font-medium mb-2">
              Progetto per la DIGITAL TRANSFORMATION
            </h2>
            <h3 className="text-base text-gray-500 mb-8">
              nella Gestione dei Mezzi Aziendali
            </h3>
            
            <div className="my-8">
              <h1 className="text-3xl font-bold text-[#0ea5e9] tracking-tight mb-8">
                Proposta Commerciale
              </h1>
              
              <div className="bg-gray-50 border-l-4 border-[#0ea5e9] px-8 py-6 inline-block">
                <p className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                  {ragioneSociale}
                </p>
              </div>
            </div>
          </div>

          {/* Footer pagina 1 */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-400 text-center">
              Data emissione: {formatDateFull()}
            </div>
          </div>
        </div>

        {/* Divisore di pagina per PDF */}
        <div className="border-t-4 border-dashed border-gray-200 my-4" style={{ pageBreakBefore: 'always' }}></div>

        {/* ============ PAGINA 2 - VALORIZZAZIONE ECONOMICA ============ */}
        <div className="p-8">
          {/* Header ripetuto */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-6">
            <div>
              <div className="text-xs text-gray-500 leading-tight mb-2">
                Piattaforma Software Avanzata | Mobilità, Gestione, Controllo e Sicurezza
              </div>
              <h2 className="text-xl font-bold text-gray-900 uppercase">
                {ragioneSociale}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Emesso il: {formatDateLong()}
              </p>
            </div>
            <img src={fluxLogo} alt="Flux" className="h-10 w-auto" />
          </div>

          {/* SEZIONE 1: VALORIZZAZIONE ECONOMICA */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#0ea5e9] mb-4 flex items-center gap-2">
              <span className="bg-[#0ea5e9] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              VALORIZZAZIONE ECONOMICA DELLA FORNITURA GT FLEET 365
            </h3>

            {selectedServices.length > 0 ? (
              <>
                <table className="w-full text-sm border-collapse mb-4">
                  <thead>
                    <tr className="bg-[#0ea5e9] text-white text-xs font-semibold uppercase">
                      <th className="text-left p-3 border border-[#0ea5e9]">Servizio</th>
                      <th className="text-center p-3 border border-[#0ea5e9] w-20">N° Servizi</th>
                      <th className="text-right p-3 border border-[#0ea5e9] w-28">Canone Unitario</th>
                      <th className="text-right p-3 border border-[#0ea5e9] w-28">Una Tantum</th>
                      <th className="text-right p-3 border border-[#0ea5e9] w-28">Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedServices.map((service, idx) => {
                      const isUnaTantum = service.periodo === 'U.T.';
                      const totaleRiga = service.prezzoUnitario * service.quantita;
                      
                      return (
                        <tr key={service.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 border border-gray-200">
                            <div className="font-medium text-gray-900">{service.nome}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {service.periodo === 'MENSILE' && '(Canone Mensile)'}
                              {service.periodo === 'ANNUALE' && '(Canone Annuale)'}
                              {service.periodo === 'U.T.' && '(Una Tantum)'}
                            </div>
                          </td>
                          <td className="p-3 border border-gray-200 text-center font-medium">
                            {service.quantita}
                          </td>
                          <td className="p-3 border border-gray-200 text-right">
                            {!isUnaTantum ? formatPrice(service.prezzoUnitario) : '—'}
                          </td>
                          <td className="p-3 border border-gray-200 text-right">
                            {isUnaTantum ? formatPrice(service.prezzoUnitario) : '—'}
                          </td>
                          <td className="p-3 border border-gray-200 text-right font-semibold text-[#0ea5e9]">
                            {formatPrice(totaleRiga)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={2} className="p-3 border border-gray-200 text-right">
                        TOTALI
                      </td>
                      <td className="p-3 border border-gray-200 text-right">
                        {totaleCanoneMensile > 0 && (
                          <div className="text-blue-600">{formatPrice(totaleCanoneMensile)}/mese</div>
                        )}
                        {totaleCanoneAnnuale > 0 && (
                          <div className="text-green-600">{formatPrice(totaleCanoneAnnuale)}/anno</div>
                        )}
                        {totaleCanoneMensile === 0 && totaleCanoneAnnuale === 0 && '—'}
                      </td>
                      <td className="p-3 border border-gray-200 text-right text-orange-600">
                        {totaleUnaTantum > 0 ? formatPrice(totaleUnaTantum) : '—'}
                      </td>
                      <td className="p-3 border border-gray-200 text-right text-[#0ea5e9] text-base">
                        {formatPrice(totals.mensile + totals.annuale + totals.unaTantum)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Riepilogo Totali */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {totaleCanoneMensile > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                      <p className="text-xs text-blue-600 uppercase font-semibold">Canone Mensile</p>
                      <p className="text-lg font-bold text-blue-800">{formatPrice(totaleCanoneMensile)}</p>
                    </div>
                  )}
                  {totaleCanoneAnnuale > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                      <p className="text-xs text-green-600 uppercase font-semibold">Canone Annuale</p>
                      <p className="text-lg font-bold text-green-800">{formatPrice(totaleCanoneAnnuale)}</p>
                    </div>
                  )}
                  {totaleUnaTantum > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 text-center">
                      <p className="text-xs text-orange-600 uppercase font-semibold">Una Tantum</p>
                      <p className="text-lg font-bold text-orange-800">{formatPrice(totaleUnaTantum)}</p>
                    </div>
                  )}
                </div>

                {/* Nota Installazione */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  <strong>Nota:</strong> L'installazione dei dispositivi è a carico del cliente.
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-lg mb-1">Tabella Preventivo</p>
                <p className="text-sm">Seleziona i servizi dal form per visualizzare la valorizzazione economica</p>
              </div>
            )}
          </div>

          {/* SEZIONE 2: CONDIZIONI DI FORNITURA */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#0ea5e9] mb-4 flex items-center gap-2">
              <span className="bg-[#0ea5e9] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              CONDIZIONI DI FORNITURA
            </h3>

            <div className="border border-gray-200 rounded-lg p-4 min-h-[120px]">
              {paymentInfo.condizioniPagamento || paymentInfo.validitaOfferta || paymentInfo.condizioniFornitura ? (
                <div className="space-y-3">
                  {(paymentInfo.condizioniPagamento || paymentInfo.validitaOfferta) && (
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                      {paymentInfo.condizioniPagamento && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase font-semibold">Condizioni di Pagamento:</span>
                          <p className="text-sm font-medium text-gray-900">{paymentInfo.condizioniPagamento}</p>
                        </div>
                      )}
                      {paymentInfo.validitaOfferta && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase font-semibold">Validità Offerta:</span>
                          <p className="text-sm font-medium text-gray-900">{paymentInfo.validitaOfferta}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {paymentInfo.condizioniFornitura && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Note e Clausole:</span>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{paymentInfo.condizioniFornitura}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  Inserisci le condizioni di fornitura nel form a sinistra
                </p>
              )}
            </div>
          </div>

          {/* SEZIONE 3: ESONERO RESPONSABILITÀ (Testo standard) */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#0ea5e9] mb-4 flex items-center gap-2">
              <span className="bg-[#0ea5e9] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              ESONERO RESPONSABILITÀ
            </h3>
            <div className="text-xs text-gray-600 leading-relaxed space-y-2">
              <p>
                Premesso che il prodotto installato sul mezzo dell'Abbonato è adibito esclusivamente alla registrazione 
                ed all'invio di dati verso la piattaforma telematica, resta inteso che né il fornitore, né soggetti 
                ad esso collegati saranno ritenuti responsabili per:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>gli eventuali danni a persone o a cose provocati dall'utilizzo del sistema;</li>
                <li>gli eventuali danni determinati dalla mancata erogazione del servizio dovuta a interruzioni della rete;</li>
                <li>gli eventuali danni derivanti dalla mancata erogazione del servizio per mancata ricezione del segnale GPS;</li>
                <li>gli eventuali danni o furto del veicolo derivanti dalla sospensione del servizio per manutenzione.</li>
              </ul>
            </div>
          </div>

          {/* SEZIONE FIRME */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-2">IL FORNITORE</p>
                <p className="text-xs text-gray-500 mb-4">(timbro e firma leggibile)</p>
                <div className="border-b-2 border-gray-300 h-16"></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-2 uppercase">{ragioneSociale}</p>
                <p className="text-xs text-gray-500 mb-4">(timbro e firma leggibile)</p>
                <div className="border-b-2 border-gray-300 h-16"></div>
              </div>
            </div>

            {/* Dati Fatturazione */}
            {clientData.partitaIva && (
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Dati Fatturazione: <strong className="text-gray-700">{ragioneSociale}</strong> — P.IVA: <strong className="text-gray-700">{clientData.partitaIva}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>Documento generato automaticamente • I prezzi si intendono IVA esclusa</p>
            <p className="mt-2 text-gray-300">Credit to Beppe Vero</p>
          </div>
        </div>
      </div>
    );
  }
);

QuotePreview.displayName = "QuotePreview";

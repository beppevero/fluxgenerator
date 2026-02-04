import { forwardRef } from "react";
import { QuoteData } from "@/types/quote";
import fluxLogo from "@/assets/flux-logo.png";
import gtFleet365Logo from "@/assets/gt-fleet-365-logo.png";
import macnilLogo from "@/assets/macnil-logo.png";

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

    // Calcoli per la tabella
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
    const redattoDa = clientData.redattoDa || "Nome Commerciale";

    // Stili comuni
    const headerStyle = "flex justify-between items-start border-b border-gray-200 pb-3 mb-4";
    const sectionTitleStyle = "text-sm font-bold text-[#0066b3] mb-3 flex items-center gap-2";
    const sectionNumberStyle = "bg-[#0066b3] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0";
    const legalTextStyle = "text-[10px] text-gray-600 leading-relaxed";
    
    // Stile per page break A4
    const pageBreakStyle = { pageBreakBefore: 'always' as const };

    return (
      <div 
        ref={ref} 
        className="bg-white text-gray-900 min-h-full"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px' }}
      >
        {/* ============ PAGINA 1 - FRONTESPIZIO ============ */}
        <div className="p-6 min-h-[600px] flex flex-col" style={{ pageBreakAfter: 'always' }}>
          {/* Header con logo */}
          <div className={headerStyle}>
            <div className="text-[9px] text-gray-500 leading-tight">
              Piattaforma Software Avanzata | Mobilità, Gestione,<br />
              Controllo e Sicurezza, Telematica di Mezzi Aziendali e Asset
            </div>
            <img src={fluxLogo} alt="Flux" className="h-10 w-auto" />
          </div>

          {/* Contenuto centrale */}
          <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
            {/* Logo GT Fleet 365 sopra il titolo */}
            <img src={gtFleet365Logo} alt="GT Fleet 365" className="h-12 w-auto mb-4" />
            
            <h2 className="text-base text-gray-600 font-medium mb-1">
              Progetto per la DIGITAL TRANSFORMATION
            </h2>
            <h3 className="text-sm text-gray-500 mb-6">
              nella Gestione dei Mezzi Aziendali
            </h3>
            
            <h1 className="text-2xl font-bold text-[#0066b3] tracking-tight mb-6">
              Proposta Commerciale
            </h1>
            
            <div className="bg-gray-50 border-l-4 border-[#0066b3] px-6 py-4">
              <p className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                {ragioneSociale}
              </p>
            </div>
          </div>

          {/* Footer pagina 1 - Data emissione e Redatto da */}
          <div className="mt-auto pt-3 border-t border-gray-200 text-[9px] text-gray-400 flex justify-between items-center">
            <span>Data emissione: {formatDateFull()}</span>
            <span>Redatto da: <strong className="text-gray-600">{redattoDa}</strong></span>
          </div>
        </div>

        {/* ============ PAGINA 2+ - CONTENUTO ============ */}
        <div className="p-6">
          {/* Header ripetuto - senza ragione sociale */}
          <div className={headerStyle}>
            <div>
              <div className="text-[9px] text-gray-500 leading-tight mb-1">
                Piattaforma Software Avanzata | Mobilità, Gestione, Controllo e Sicurezza
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Emesso il: {formatDateLong()}
              </p>
            </div>
            <img src={fluxLogo} alt="Flux" className="h-8 w-auto" />
          </div>

          {/* SEZIONE 1: VALORIZZAZIONE ECONOMICA */}
          <div className="mb-6">
            <h3 className={sectionTitleStyle}>
              <span className={sectionNumberStyle}>1</span>
              VALORIZZAZIONE ECONOMICA DELLA FORNITURA GT FLEET 365
            </h3>

            {selectedServices.length > 0 ? (
              <>
                <table className="w-full text-[10px] border-collapse mb-3">
                  <thead>
                    <tr className="bg-[#0066b3] text-white text-[9px] font-semibold uppercase">
                      <th className="text-left p-2 border border-[#0066b3]">Servizio</th>
                      <th className="text-center p-2 border border-[#0066b3] w-16">N° Servizi</th>
                      <th className="text-right p-2 border border-[#0066b3] w-24">Canone Unit.</th>
                      <th className="text-right p-2 border border-[#0066b3] w-20">U.T.</th>
                      <th className="text-right p-2 border border-[#0066b3] w-24">Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedServices.map((service, idx) => {
                      const isUnaTantum = service.periodo === 'U.T.';
                      const totaleRiga = service.prezzoUnitario * service.quantita;
                      
                      return (
                        <tr key={service.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-2 border border-gray-200">
                            <div className="font-medium text-gray-900">{service.nome}</div>
                            <div className="text-[8px] text-gray-500">
                              {service.periodo === 'MENSILE' && '(Mensile)'}
                              {service.periodo === 'ANNUALE' && '(Annuale)'}
                              {service.periodo === 'U.T.' && '(Una Tantum)'}
                            </div>
                          </td>
                          <td className="p-2 border border-gray-200 text-center font-medium">
                            {service.quantita}
                          </td>
                          <td className="p-2 border border-gray-200 text-right">
                            {!isUnaTantum ? formatPrice(service.prezzoUnitario) : '—'}
                          </td>
                          <td className="p-2 border border-gray-200 text-right">
                            {isUnaTantum ? formatPrice(service.prezzoUnitario) : '—'}
                          </td>
                          <td className="p-2 border border-gray-200 text-right font-semibold text-[#0066b3]">
                            {formatPrice(totaleRiga)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold text-[10px]">
                      <td colSpan={2} className="p-2 border border-gray-200 text-right">TOTALI</td>
                      <td className="p-2 border border-gray-200 text-right">
                        {totaleCanoneMensile > 0 && <div className="text-blue-600">{formatPrice(totaleCanoneMensile)}/mese</div>}
                        {totaleCanoneAnnuale > 0 && <div className="text-green-600">{formatPrice(totaleCanoneAnnuale)}/anno</div>}
                      </td>
                      <td className="p-2 border border-gray-200 text-right text-orange-600">
                        {totaleUnaTantum > 0 ? formatPrice(totaleUnaTantum) : '—'}
                      </td>
                      <td className="p-2 border border-gray-200 text-right text-[#0066b3] font-bold">
                        {formatPrice(totals.mensile + totals.annuale + totals.unaTantum)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800">
                  <strong>Nota:</strong> L'installazione dei dispositivi è a carico del cliente.
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded">
                <p>Seleziona i servizi dal form per visualizzare la tabella</p>
              </div>
            )}
          </div>

          {/* SEZIONE 2: CONDIZIONI DI FORNITURA */}
          <div className="mb-6">
            <h3 className={sectionTitleStyle}>
              <span className={sectionNumberStyle}>2</span>
              CONDIZIONI DI FORNITURA
            </h3>

            <div className="border border-gray-200 rounded p-3 min-h-[80px]">
              {paymentInfo.condizioniPagamento || paymentInfo.validitaOfferta || paymentInfo.condizioniFornitura || paymentInfo.durataContrattuale ? (
                <div className="space-y-2 text-[10px]">
                  <div className="grid grid-cols-3 gap-3 pb-2 border-b border-gray-100">
                    {paymentInfo.durataContrattuale && (
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Durata Contrattuale:</span>
                        <p className="font-medium text-gray-900">{paymentInfo.durataContrattuale} mesi</p>
                      </div>
                    )}
                    {paymentInfo.condizioniPagamento && (
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Condizioni di Pagamento:</span>
                        <p className="font-medium text-gray-900">{paymentInfo.condizioniPagamento}</p>
                      </div>
                    )}
                    {paymentInfo.validitaOfferta && (
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Validità Offerta:</span>
                        <p className="font-medium text-gray-900">{paymentInfo.validitaOfferta}</p>
                      </div>
                    )}
                  </div>
                  {paymentInfo.condizioniFornitura && (
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-semibold">Note:</span>
                      <p className="text-gray-700 whitespace-pre-wrap">{paymentInfo.condizioniFornitura}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-[10px] text-center py-2">
                  Inserisci le condizioni di fornitura nel form
                </p>
              )}
            </div>
          </div>

          {/* PAGE BREAK - Sezioni legali */}
          <div style={pageBreakStyle}>
            {/* SEZIONE 3: ESONERO RESPONSABILITÀ DI MACNIL */}
            <div className="mb-6">
              <h3 className={sectionTitleStyle}>
                <span className={sectionNumberStyle}>3</span>
                ESONERO RESPONSABILITÀ DI MACNIL
              </h3>
              <div className={legalTextStyle + " space-y-2"}>
                <p>
                  Premesso che il prodotto installato sul mezzo dell'Abbonato è adibito esclusivamente alla registrazione ed all'invio di dati verso la piattaforma telematica MACNIL e/o all'invio di notifiche di allarme per tentativo di furto (se previsto) o effrazione verso la piattaforma software di centrale operativa (se previsto), resta inteso che né MACNIL, né soggetti ad essa collegati e/o da questa incaricati saranno ritenuti responsabili, se non per documentate ipotesi di dolo o colpa grave, per:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>gli eventuali danni a persone o a cose provocati dall'utilizzo del sistema;</li>
                  <li>gli eventuali danni determinati dalla mancata erogazione del servizio dovuta a:
                    <ul className="list-none ml-4 mt-1 space-y-0.5">
                      <li>(i) interruzioni, sospensioni o limitazioni della rete telefonica "fissa", della diffusione di INTERNET, del segnale GSM, 2G, 4G, 5G e GPS dovute a mancato o difettoso funzionamento dei mezzi tecnici di emissione;</li>
                      <li>(ii) interruzioni dovute a cause accidentali, a fatti di terzi o a disposizioni legislative o amministrative sopravvenute;</li>
                      <li>(iii) interruzioni dovute a qualsiasi causa non imputabile a MACNIL.</li>
                    </ul>
                  </li>
                  <li>gli eventuali danni derivanti dalla mancata ricezione del segnale GSM/GPS in ambienti non raggiungibili (gallerie, garage sotterranei, traghetti, ambienti schermati);</li>
                  <li>gli eventuali danni o furto del veicolo derivanti dalla sospensione del servizio per messa in MANUTENZIONE;</li>
                  <li>gli eventuali danni determinati dal mancato o ritardato intervento della forza pubblica, del soccorso medico o meccanico;</li>
                  <li>gli eventuali danni derivanti dal furto, lo smarrimento o il danneggiamento del mezzo.</li>
                </ul>
                <p>
                  MACNIL non è responsabile dell'utilizzo errato e/o del non soddisfacente funzionamento dei Prodotti, dovuti a qualsiasi causa non dipendente da MACNIL medesima. MACNIL non è responsabile per l'erronea installazione del prodotto, dei sensori o di altri accessori.
                </p>
                <p>Ugualmente non saranno a carico di MACNIL:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2">
                  <li>Gli eventuali danni e/o i costi dovuti a persone o a cose provocati dall'utilizzo dei Prodotti;</li>
                  <li>Gli eventuali danni e/o i costi per mancato o ritardato intervento della forza pubblica, del soccorso medico ovvero meccanico;</li>
                  <li>Gli eventuali danni e/o i costi derivanti dal furto, dal danneggiamento, dallo smarrimento del mezzo e di tutti i beni in esso contenuti;</li>
                  <li>Gli eventuali danni e/o i costi derivanti dal mancato rispetto delle procedure stabilite con la Centrale Operativa;</li>
                  <li>Gli eventuali danni e/o i costi derivanti da qualsiasi vizio e/o difetto dei Prodotti, anche se non coperti dalla garanzia del costruttore.</li>
                </ol>
              </div>
            </div>

            {/* SEZIONE 4: ALTRE NORME CONTRATTUALI */}
            <div className="mb-6">
              <h3 className={sectionTitleStyle}>
                <span className={sectionNumberStyle}>4</span>
                ALTRE NORME CONTRATTUALI
              </h3>
              <div className={legalTextStyle + " space-y-2"}>
                <p>
                  Il Contratto avrà la durata stabilita a decorrere dall'accettazione da parte del cliente intendendosi per tale la consegna del Dispositivo di Bordo al Richiedente. Alla scadenza il Contratto si intenderà tacitamente rinnovato, e così per le successive scadenze, salvo disdetta di una delle Parti da comunicarsi per iscritto, con un preavviso di almeno 30 giorni rispetto alla scadenza, mediante raccomandata A/R.
                </p>
                <p>
                  In caso di cessazione e/o risoluzione del contratto, per qualsiasi causa e/o ragione, il Richiedente si impegna e obbliga a restituire, entro e non oltre 15 giorni, direttamente in favore del proprietario del dispositivo MACNIL, con sede in Gravina in Puglia (BA) a Via Pasteur, 26 (P.IVA 05607900726), il dispositivo installato sui propri veicoli. In caso di ritardata consegna oltre i 15 giorni, di mancata consegna e/o di restituzione del dispositivo danneggiato, escluso in caso del furto del mezzo, MACNIL è autorizzata ad emettere fattura per il dispositivo per € 390,00 + IVA che il Richiedente è obbligato a pagare.
                </p>
              </div>
            </div>
          </div>

          {/* PAGE BREAK - Certificazioni, Manutenzione, GDPR */}
          <div style={pageBreakStyle}>
            {/* SEZIONE 5: CERTIFICAZIONI */}
            <div className="mb-6">
              <h3 className={sectionTitleStyle}>
                <span className={sectionNumberStyle}>5</span>
                CERTIFICAZIONI
              </h3>
              <div className={legalTextStyle + " space-y-2"}>
                <p>
                  MACNIL nel presentare la propria offerta tecnico/economica comunica che, nell'intento di garantire ai propri Clienti un livello di qualità elevato nella fornitura dei propri servizi di progettazione, realizzazione, assistenza tecnica e manutenzione, ha elaborato un Sistema Integrato di Gestione ISO 9001/14001/27001 con Linee Guida 27017 e 27018, oltre che tutte le certificazioni di seguito riportate:
                </p>
                <p className="text-[9px] text-gray-500 italic">
                  (ISO 9001, ISO 14001, ISO 27001, ISO 27017, ISO 27018, ESG Impact, Rating Impresa 5.0, Tinexta Certified)
                </p>
              </div>
            </div>

            {/* SEZIONE 6: MANUTENZIONE E GARANZIA */}
            <div className="mb-6">
              <h3 className={sectionTitleStyle}>
                <span className={sectionNumberStyle}>6</span>
                MANUTENZIONE E GARANZIA
              </h3>
              <div className={legalTextStyle + " space-y-2"}>
                <p>
                  MACNIL garantisce il buon funzionamento dei servizi abilitati, l'assenza di vizi o difetti per tutto il periodo contrattuale.
                </p>
                <p>
                  Il fornitore MACNIL presterà all'utente, direttamente, l'assistenza tecnica sui prodotti forniti e servizi abilitati.
                </p>
                <p>
                  La MACNIL si impegna ad offrire all'utente finale un servizio di Assistenza Tecnica, a mezzo telefono e whatsapp, mettendo a disposizione il recapito del proprio Customer Care, <strong>(080.246.42.45)</strong> attivo dal lunedì al venerdì, dalle 8:30 alle 18:30. Assistenza Tecnica attiva H24 con apertura Ticket attraverso il tasto Help all'interno dell'home page della piattaforma. Il canone mensile include la manutenzione correttiva e l'adeguamento normativo, ma non include le personalizzazioni richieste dall'utente.
                </p>
                <p>
                  Nel caso in cui tali vizi/difetti o il non corretto funzionamento degli apparecchi vengano scoperti nel corso del periodo di garanzia e non siano imputabili all'utente per dolo o colpa grave, i vizi o difetti dovranno essere eliminati o i prodotti dovranno essere sostituiti o riparati a completa cura e spese della MACNIL. Sono a carico dell'utente le spese di spedizione verso MACNIL, mentre le spese di spedizione da MACNIL all'utente sono a carico di MACNIL. La spedizione dovrà avvenire entro 10 giorni dalla comunicazione di autorizzazione sostituzione. In mancanza di restituzione entro il termine indicato, l'utente dovrà versare l'importo di € 390,00 + IVA per ogni dispositivo. Il termine di denuncia di vizi/difetti è di 8 giorni dalla data della scoperta.
                </p>
              </div>
            </div>

            {/* SEZIONE 7: TRATTAMENTO DATI - GDPR */}
            <div className="mb-6">
              <h3 className={sectionTitleStyle}>
                <span className={sectionNumberStyle}>7</span>
                TRATTAMENTO DATI PERSONALE DEI CLIENTI – GDPR - LEGGE SULLA PRIVACY
              </h3>
              <div className={legalTextStyle + " space-y-2"}>
                <p>
                  Si precisa che i dati presenti nella Banca Dati del Cliente sui Server della MACNIL, li potrà utilizzare solo il Cliente. Inoltre, tali dati non saranno ceduti a terzi o utilizzati per fini diversi da quelli per i quali il Cliente si impegna a imputarli sui server della MACNIL o trasmetterli alla MACNIL per importazione.
                </p>
                <p>
                  Ai sensi dell'art. 13 del D. Lgs. 196/2003 (Codice Privacy) e dell'art. 13 del Regolamento UE n. 2016/679 (GDPR 2016/679), recante disposizioni a tutela delle persone e di altri soggetti rispetto al trattamento dei dati personali, i dati personali forniti dal cliente formeranno oggetto di trattamento nel rispetto della normativa sopra richiamata.
                </p>
              </div>
            </div>
          </div>

          {/* PAGE BREAK - Controversie e Firme */}
          <div style={pageBreakStyle}>
            {/* SEZIONE 8: CONTROVERSIE */}
            <div className="mb-6">
              <h3 className={sectionTitleStyle}>
                <span className={sectionNumberStyle}>8</span>
                CONTROVERSIE
              </h3>
              <div className={legalTextStyle}>
                <p>
                  Il presente contratto è disciplinato e interpretato secondo la legge italiana. Per qualsiasi controversia che dovesse sorgere tra le parti in ordine all'esistenza, alla validità, all'efficacia, all'interpretazione, all'esecuzione e/o estinzione del presente contratto e/o dei suoi allegati sarà competente in via esclusiva il <strong>Foro di Bari</strong>, con ciò escludendo specificatamente la competenza di fori alternativi ex artt. 18, 19 e 20 codice procedura civile.
                </p>
              </div>
            </div>

            {/* Luogo e Data */}
            <div className="mb-6 text-[11px]">
              <p>Gravina in Puglia, lì <strong>{formatDateLong()}</strong></p>
            </div>

            {/* SEZIONE FIRME */}
            <div className="mb-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-gray-700 mb-1">MAC&NIL s.r.l.</p>
                  <p className="text-[9px] text-gray-500 mb-3">(timbro e firma leggibile)</p>
                  <div className="border-b-2 border-gray-400 h-12 mb-1"></div>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-gray-700 mb-1 uppercase">{ragioneSociale}</p>
                  <p className="text-[9px] text-gray-500 mb-3">(timbro e firma leggibile)</p>
                  <div className="border-b-2 border-gray-400 h-12 mb-1"></div>
                </div>
              </div>

              {/* Clausola vessatoria */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-[9px] text-gray-600">
                <p className="mb-3">
                  Ai sensi e per gli effetti di cui agli art. 1341, comma 2°, e 1342, c.c. si approvano specificamente i seguenti articoli: <strong>Articoli 3 e 4</strong>.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 mb-1">MAC&NIL s.r.l.</p>
                    <p className="text-gray-500 mb-2">(timbro e firma leggibile)</p>
                    <div className="border-b-2 border-gray-400 h-10"></div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 mb-1 uppercase">{ragioneSociale}</p>
                    <p className="text-gray-500 mb-2">(timbro e firma leggibile)</p>
                    <div className="border-b-2 border-gray-400 h-10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer documento */}
            <div className="mt-6 pt-3 border-t border-gray-200 text-center text-[9px] text-gray-400">
              <p>Documento generato automaticamente • I prezzi si intendono IVA esclusa</p>
            </div>

            {/* FOOTER AZIENDALE - Ultima pagina */}
            <div className="mt-8 pt-4 border-t-2 border-[#0066b3]/20">
              <div className="flex items-center justify-center gap-4 mb-3">
                <img src={macnilLogo} alt="MACNIL" className="h-8 w-auto opacity-80" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-medium text-gray-700">
                  MAC&NIL s.r.l. | Via L. Pasteur, 26 - 70023 Gravina in Puglia (BA)
                </p>
                <p className="text-[9px] text-gray-500">
                  P.I. 05607900726 | Tel. e Whatsapp +39 080 2464245 | <a href="http://www.macnil.it" className="text-[#0066b3] hover:underline">www.macnil.it</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

QuotePreview.displayName = "QuotePreview";
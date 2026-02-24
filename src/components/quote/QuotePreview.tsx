import { forwardRef, useEffect, useRef } from "react";
import { QuoteData } from "@/types/quote";
import fluxLogo from "@/assets/flux-logo.png";
import gtFleet365Logo from "@/assets/gt-fleet-365-logo.png";
import macnilLogo from "@/assets/macnil-logo.png";

interface QuotePreviewProps {
  quoteData: QuoteData;
  highlightServiceId?: string | null;
  activeSection?: string | null;
}

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(({
  quoteData,
  highlightServiceId,
  activeSection,
}, ref) => {
  const { clientData, paymentInfo, selectedServices, totals } = quoteData;
  const isModulo = clientData.documentType === 'modulo';
  const lr = clientData.legaleRappresentante;
  const da = clientData.datiAzienda;
  
  const headerRef = useRef<HTMLDivElement>(null);
  const economicTableRef = useRef<HTMLTableElement>(null);
  const conditionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };
    
    if (activeSection === 'client' && headerRef.current) {
      headerRef.current.scrollIntoView(scrollOptions);
    } else if (activeSection === 'services' && economicTableRef.current) {
      economicTableRef.current.scrollIntoView(scrollOptions);
    } else if (activeSection === 'payment' && conditionsRef.current) {
      conditionsRef.current.scrollIntoView(scrollOptions);
    }
  }, [activeSection]);

  useEffect(() => {
    if (highlightServiceId && economicTableRef.current) {
      economicTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightServiceId, selectedServices]);

  const formatPrice = (price: number) => new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(price);

  const formatDateFull = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  const formatDateLong = () => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date());
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
  const sectionTitleStyle = "text-sm font-bold text-[#0066b3] mb-3";
  const legalTextStyle = "text-[10px] text-gray-600 leading-relaxed pdf-text-flow";

  // ─── Shared: Economic Table ───
  const renderEconomicTable = () => (
    <div className="mb-6">
      <h3 className={sectionTitleStyle}>
        1. VALORIZZAZIONE ECONOMICA DELLA FORNITURA GT FLEET 365
      </h3>
      {selectedServices.length > 0 ? (
        <>
          <table ref={economicTableRef} className="w-full text-[10px] border-collapse mb-3" style={{ display: 'table' }}>
            <thead style={{ display: 'table-header-group' }}>
              <tr className="bg-[#0066b3] text-white text-[9px] font-semibold uppercase">
                <th className="text-left p-2 border border-[#0066b3]" style={{ width: '15%' }}>Servizio</th>
                <th className="text-left p-2 border border-[#0066b3]" style={{ width: '32%' }}>Descrizione</th>
                <th className="text-center p-2 border border-[#0066b3]" style={{ width: '7%' }}>N° Servizi</th>
                <th className="text-center p-2 border border-[#0066b3]" style={{ width: '8%' }}>Durata</th>
                <th className="text-center p-2 border border-[#0066b3]" style={{ width: '11%' }}>Prezzo Listino</th>
                <th className="text-center p-2 border border-[#0066b3]" style={{ width: '11%' }}>Canone Unitario</th>
                <th className="text-center p-2 border border-[#0066b3]" style={{ width: '11%' }}>Una Tantum</th>
              </tr>
            </thead>
            <tbody>
              {selectedServices.map((service, idx) => {
                const isUnaTantum = service.periodo === 'U.T.';
                const durataLabel = paymentInfo.durataContrattuale ? `${paymentInfo.durataContrattuale} mesi` : '—';
                const isHighlighted = highlightServiceId === service.id;
                
                return (
                  <tr 
                    key={service.id} 
                    className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${isHighlighted ? 'animate-pulse bg-blue-100 ring-2 ring-primary/20' : ''}`} 
                    style={{ pageBreakInside: 'avoid', transition: 'all 0.5s ease' }}
                  >
                    <td className="p-2 border border-gray-200 align-middle">
                      <div className="font-medium text-gray-900 text-[9px]">{service.nome}</div>
                      <div className="text-[7px] text-gray-500">
                        {service.periodo === 'MENSILE' && '(Mensile)'}
                        {service.periodo === 'ANNUALE' && '(Annuale)'}
                        {service.periodo === 'U.T.' && '(Una Tantum)'}
                      </div>
                    </td>
                    <td className="p-2 border border-gray-200 text-[8px] text-gray-600 align-middle leading-snug">{service.descrizione}</td>
                    <td className="p-2 border border-gray-200 text-center font-medium align-middle">{service.quantita}</td>
                    <td className="p-2 border border-gray-200 text-center align-middle">{!isUnaTantum ? durataLabel : '—'}</td>
                    <td className="p-2 border border-gray-200 text-right align-middle">
                      <span className="text-gray-600">{formatPrice(service.prezzoListino)}</span>
                    </td>
                    <td className="p-2 border border-gray-200 text-right align-middle">
                      {!isUnaTantum ? <span className="font-semibold">{formatPrice(service.prezzoUnitario)}</span> : '—'}
                    </td>
                    <td className="p-2 border border-gray-200 text-right align-middle">
                      {isUnaTantum ? <span className="font-semibold">{formatPrice(service.prezzoUnitario)}</span> : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[10px] text-gray-600 italic mt-2">
            Nota: L'installazione dei dispositivi è a carico del cliente.
          </p>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded">
          <p>Seleziona i servizi dal form per visualizzare la tabella</p>
        </div>
      )}
    </div>
  );

  // ─── Shared: Conditions ───
  const renderConditions = () => (
    <div ref={conditionsRef} className={`mb-6 transition-all duration-500 rounded-lg p-2 ${activeSection === 'payment' ? 'ring-4 ring-primary/10 bg-blue-50/30' : ''}`}>
      <h3 className={sectionTitleStyle}>2. CONDIZIONI DI FORNITURA</h3>
      <div className="border border-gray-200 rounded p-3 min-h-[80px]">
        {paymentInfo.condizioniPagamento || paymentInfo.validitaOfferta || paymentInfo.condizioniFornitura || paymentInfo.durataContrattuale ? (
          <div className="space-y-2 text-[10px]">
            <div className="grid grid-cols-4 gap-3 pb-2 border-b border-gray-100">
              {paymentInfo.durataContrattuale && (
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-semibold">Durata Contrattuale:</span>
                  <p className="font-medium text-gray-900">{paymentInfo.durataContrattuale} mesi</p>
                </div>
              )}
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Data Emissione:</span>
                <p className="font-medium text-gray-900">{formatDateFull()}</p>
              </div>
              {paymentInfo.condizioniPagamento && (
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-semibold">Condizioni di Pagamento:</span>
                  <p className="font-medium text-gray-900">{paymentInfo.condizioniPagamento}</p>
                </div>
              )}
              {paymentInfo.validitaOfferta && (
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-semibold">Validità Offerta:</span>
                  <p className="font-medium text-gray-900">{calculateExpiryDate()}</p>
                </div>
              )}
            </div>
            {paymentInfo.condizioniFornitura && (
              <div>
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
  );

  // ─── Standard: Date + Signatures ───
  const renderStandardSignatures = () => (
    <>
      <div className="mb-6 text-[11px]">
        <p>Gravina in Puglia, lì <strong>{formatDateLong()}</strong></p>
      </div>
      <div className="mb-6 pt-4 border-t border-gray-200" style={{ pageBreakInside: 'avoid' }}>
        <div className="border border-gray-300 rounded p-4">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-[11px] font-semibold text-gray-700 mb-1">MAC&NIL s.r.l.</p>
              <div className="border-b-2 border-gray-400 h-16 mb-1"></div>
              <p className="text-[9px] text-gray-500 mt-1">(timbro e firma leggibile)</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{ragioneSociale}</p>
              <div className="border-b-2 border-gray-400 h-16 mb-1"></div>
              <p className="text-[9px] text-gray-500 mt-1">(timbro e firma leggibile)</p>
            </div>
          </div>
        </div>
        <div className="mt-3 p-4 border border-gray-300 rounded text-[9px] text-gray-500 leading-relaxed">
          <p className="mb-3 text-[9px]">
            Ai sensi e per gli effetti di cui agli art. 1341, comma 2°, e 1342, c.c. si approvano specificamente i seguenti articoli: <strong className="text-gray-600">Articoli 3 e 4</strong>.
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-[11px] font-semibold text-gray-700 mb-1">MAC&NIL s.r.l.</p>
              <div className="border-b-2 border-gray-400 h-16 mb-1"></div>
              <p className="text-[9px] text-gray-500 mt-1">(timbro e firma leggibile)</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{ragioneSociale}</p>
              <div className="border-b-2 border-gray-400 h-16 mb-1"></div>
              <p className="text-[9px] text-gray-500 mt-1">(timbro e firma leggibile)</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ─── Modulo: Triple Signature Block ───
  const renderModuloSignatures = () => (
    <div style={{ pageBreakInside: 'avoid' }}>
      {/* Clausola contrattuale */}
      <div className="mb-5 p-3 border border-gray-200 rounded bg-gray-50">
        <p className="text-[10px] text-gray-700 leading-relaxed">
          Il Contratto tra il Cliente e MAC&NIL Srl si perfeziona in base alla procedura contenuta nelle Condizioni Generali di Contratto rilasciate a parte che il cliente dichiara di aver ricevuto, conoscere ed accettare.
        </p>
      </div>

      {/* FIRMA 1 – Accettazione Ordine */}
      <div className="mb-5 border border-gray-300 rounded p-4" style={{ pageBreakInside: 'avoid' }}>
        <p className="text-[10px] font-semibold text-gray-700 mb-3">
          Firma del Cliente – Per accettazione della presente Copia Commissione
        </p>
        <p className="text-[9px] text-gray-500 mb-3 leading-relaxed">
          La firma conferma le obbligazioni del Cliente previste nella presente Copia Commissione, anche con riferimento alla modalità di pagamento prescelta.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 mb-1">Data</p>
            <div className="border-b-2 border-gray-400 h-8 mb-1"></div>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 mb-1">Firma del Cliente</p>
            <div className="border-b-2 border-gray-400 h-8 mb-1"></div>
            <p className="text-[8px] text-gray-400 mt-1">(per esteso e leggibile)</p>
          </div>
        </div>
      </div>

      {/* FIRMA 2 – Clausole Vessatorie */}
      <div className="mb-5 border border-gray-300 rounded p-4" style={{ pageBreakInside: 'avoid' }}>
        <p className="text-[10px] font-semibold text-gray-700 mb-2">
          Approvazione specifica ai sensi degli artt. 1341 e 1342 c.c.
        </p>
        <p className="text-[9px] text-gray-600 leading-relaxed mb-3">
          Il Cliente dichiara di aver preso visione delle Condizioni Generali di Contratto per la Gestione del Servizio e, ai sensi e per gli effetti degli art. 1341 e 1342 Cod. Civ., dichiara di approvare specificatamente le seguenti clausole:
        </p>
        <p className="text-[8px] text-gray-500 leading-relaxed mb-4">
          Art. 1 (Termini e Condizioni dell'Abbonamento); Art. 2 (Oggetto dell'Abbonamento); Art. 3 (Attivazione dell'Abbonamento); Art. 4 (Obblighi dell'Abbonato); Art. 5 (Prezzo dell'Abbonamento alla Centrale Operativa e Modalità di Pagamento); Art. 6 (Durata del Contratto); Art. 7 (Manutenzione e Garanzia); Art. 8 (Esonero Responsabilità di MACNIL); Art. 9 (Falsi Allarmi); Art. 10 (Recesso dal Contratto); Art. 11 (Risoluzione del Contratto); Art. 12 (Riservatezza); Art. 13 (Trattamento e Protezione dei Dati Personali); Art. 14 (Obblighi assunti da MACNIL quale Responsabile del Trattamento dei Dati Personali); Art. 15 (Cessione); Art. 16 (Legge Applicabile e Foro Competente).
        </p>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 mb-1">Data</p>
            <div className="border-b-2 border-gray-400 h-8 mb-1"></div>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 mb-1">Firma del Cliente</p>
            <div className="border-b-2 border-gray-400 h-8 mb-1"></div>
            <p className="text-[8px] text-gray-400 mt-1">(per esteso e leggibile)</p>
          </div>
        </div>
      </div>

      {/* FIRMA 3 – Privacy */}
      <div className="mb-5 border border-gray-300 rounded p-4" style={{ pageBreakInside: 'avoid' }}>
        <p className="text-[10px] font-semibold text-gray-700 mb-2">
          Autorizzazione al trattamento dei dati personali
        </p>
        <p className="text-[9px] text-gray-600 leading-relaxed mb-3">
          Ai sensi dell'Art. 13 del D. Lgs. 196/2003 e dell'Art. 13 del Regolamento UE n. 2016/679 (GDPR), in relazione e per le finalità specificatamente indicate nell'informativa, esprimo il mio consenso al trattamento, diffusione e comunicazione, anche a terzi, dei dati personali forniti.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 mb-1">Data</p>
            <div className="border-b-2 border-gray-400 h-8 mb-1"></div>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 mb-1">Firma del Cliente</p>
            <div className="border-b-2 border-gray-400 h-8 mb-1"></div>
            <p className="text-[8px] text-gray-400 mt-1">(per esteso e leggibile)</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Modulo: Representative Data Block ───
  const renderModuloHeader = () => {
    const nomeCompleto = [lr.nome, lr.cognome].filter(Boolean).join(' ') || '_______________';
    const luogoNascita = lr.luogoDiNascita || '_______________';
    const dataNascita = lr.dataDiNascita || '_______________';
    const cf = lr.codiceFiscale || '_______________';

    return (
      <div className="mb-6">
        <p className="text-[11px] text-gray-800 leading-relaxed mb-4">
          Con la presente il sottoscritto <strong>{nomeCompleto}</strong>, nato a <strong>{luogoNascita}</strong> il <strong>{dataNascita}</strong>, C.F. <strong>{cf}</strong>, in qualità di Legale Rappresentante della società <strong>{ragioneSociale}</strong>,
          {da.partitaIva && <> P.IVA <strong>{da.partitaIva}</strong>,</>}
          {da.indirizzo && <> con sede in <strong>{da.indirizzo}</strong>,</>}
          {da.citta && <> <strong>{da.citta}</strong></>}
          {da.cap && <> (<strong>{da.cap}</strong>)</>}
          {da.provincia && <> <strong>{da.provincia}</strong></>}
        </p>

        <h3 className="text-sm font-bold text-[#0066b3] mb-2 uppercase">CHIEDE</h3>
        <p className="text-[11px] text-gray-800 leading-relaxed">
          alla MAC&NIL Srl la fornitura e l'attivazione dei servizi di Gestione, Controllo e Sicurezza Mezzi e dispositivi di Localizzazione Satellitare – Progetto denominato GT FLEET 365.
        </p>
        <p className="text-[9px] text-gray-500 italic mt-2">
          Gli importi si intendono escluso IVA, spese di spedizione e installazione – Fatturazione Anticipata.
        </p>
      </div>
    );
  };

  // ═══════ RENDER ═══════
  if (isModulo) {
    return (
      <div ref={ref} className="bg-white text-gray-900 min-h-full" style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '11px',
        padding: '0 12mm',
      }}>
        {/* Header con logo e titolo */}
        <div className="text-center pt-4 mb-6">
          <img src={gtFleet365Logo} alt="GT Fleet 365" style={{ height: '40px', margin: '0 auto 12px' }} />
          <h1 style={{
            fontSize: '16px', fontWeight: 700, color: '#0066b3',
            letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            COPIA COMMISSIONE - ORDINE
          </h1>
        </div>

        {renderModuloHeader()}
        {renderEconomicTable()}
        {renderConditions()}
        {renderModuloSignatures()}
      </div>
    );
  }

  // ═══════ STANDARD ═══════
  return (
    <div ref={ref} className="bg-white text-gray-900 min-h-full" style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11px'
    }}>
      {/* ============ PAGINA 1 - FRONTESPIZIO ============ */}
      <div ref={headerRef} className={`transition-all duration-500 ${activeSection === 'client' ? 'ring-4 ring-primary/10 bg-blue-50/30' : ''}`} style={{
        height: '257mm',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        padding: '20mm 12mm 15mm 12mm',
        marginBottom: 0,
        position: 'relative',
      }}>
        <div style={{ marginTop: '30mm', marginBottom: '50px' }}>
          <img src={gtFleet365Logo} alt="GT Fleet 365" style={{ height: '55px' }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '80px', lineHeight: '1.6' }}>
          <span style={{ fontSize: '14px', color: '#333', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Progetto per la</span>
          <br />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#222', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>DIGITAL TRANSFORMATION</span>
          <br />
          <span style={{ fontSize: '14px', color: '#333', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>nella Gestione dei Mezzi Aziendali</span>
        </div>
        <h1 style={{
          fontSize: '18px', fontWeight: 700, color: '#0066b3', textAlign: 'center',
          letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '25px',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}>
          PROPOSTA COMMERCIALE
        </h1>
        <p style={{
          fontSize: '18pt', fontWeight: 700, color: '#000', textAlign: 'center',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}>
          {ragioneSociale}
        </p>
      </div>

      {/* ============ CONTENUTO ============ */}
      <div style={{ marginTop: 0, padding: '0 12mm', position: 'relative', boxSizing: 'border-box' }}>
        {renderEconomicTable()}
        {renderConditions()}

        {/* SEZIONE 3: ESONERO RESPONSABILITÀ */}
        <div className="mb-6">
          <h3 className={sectionTitleStyle}>3. ESONERO RESPONSABILITÀ DI MACNIL</h3>
          <div className={legalTextStyle + " space-y-2"}>
            <p>Premesso che il prodotto installato sul mezzo dell'Abbonato è adibito esclusivamente alla registrazione ed all'invio di dati verso la piattaforma telematica MACNIL e/o all'invio di notifiche di allarme per tentativo di furto (se previsto) o effrazione verso la piattaforma software di centrale operativa (se previsto), resta inteso che né MACNIL, né soggetti ad essa collegati e/o da questa incaricati saranno ritenuti responsabili, se non per documentate ipotesi di dolo o colpa grave, per:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>gli eventuali danni a persone o a cose provocati dall'utilizzo del sistema;</li>
              <li>gli eventuali danni determinati dalla mancata erogazione del servizio dovuta a:
                <ul className="list-none ml-4 mt-1 space-y-0.5">
                  <li>(I) interruzioni, sospensioni o limitazioni della rete telefonica "fissa", della diffusione di INTERNET, del segnale GSM, 2G, 4G, 5G e GPS dovute a mancato o difettoso funzionamento dei mezzi tecnici di emissione;</li>
                  <li>(II) interruzioni dovute a cause accidentali, a fatti di terzi o a disposizioni legislative o amministrative sopravvenute;</li>
                  <li>(III) interruzioni dovute a qualsiasi causa non imputabile a MACNIL.</li>
                </ul>
              </li>
              <li>gli eventuali danni derivanti dalla mancata ricezione del segnale GSM/GPS in ambienti non raggiungibili (gallerie, garage sotterranei, traghetti, ambienti schermati);</li>
              <li>gli eventuali danni o furto del veicolo derivanti dalla sospensione del servizio per messa in MANUTENZIONE;</li>
              <li>gli eventuali danni determinati dal mancato o ritardato intervento della forza pubblica, del soccorso medico o meccanico;</li>
              <li>gli eventuali danni derivanti dal furto, lo smarrimento o il danneggiamento del mezzo.</li>
            </ul>
            <p>MACNIL non è responsabile dell'utilizzo errato e/o del non soddisfacente funzionamento dei Prodotti, dovuti a qualsiasi causa non dipendente da MACNIL medesima. MACNIL non è responsabile per l'erronea installazione del prodotto, dei sensori o di altri accessori.</p>
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
          <h3 className={sectionTitleStyle}>4. ALTRE NORME CONTRATTUALI</h3>
          <div className={legalTextStyle + " space-y-2"}>
            <p>Il Contratto avrà la durata stabilita a decorrere dall'accettazione da parte del cliente intendendosi per tale la consegna del Dispositivo di Bordo al Richiedente. Alla scadenza il Contratto si intenderà tacitamente rinnovato, e così per le successive scadenze, salvo disdetta di una delle Parti da comunicarsi per iscritto, con un preavviso di almeno 30 giorni rispetto alla scadenza, mediante raccomandata A/R.</p>
            <p>In caso di cessazione e/o risoluzione del contratto, per qualsiasi causa e/o ragione, il Richiedente si impegna e obbliga a restituire, entro e non oltre 15 giorni, direttamente in favore del proprietario del dispositivo MACNIL, con sede in Gravina in Puglia (BA) a Via Pasteur, 26 (P.IVA 05607900726), il dispositivo installato sui propri veicoli. In caso di ritardata consegna oltre i 15 giorni, di mancata consegna e/o di restituzione del dispositivo danneggiato, escluso in caso del furto del mezzo, MACNIL è autorizzata ad emettere fattura per il dispositivo per € 390,00 + IVA che il Richiedente è obbligato a pagare.</p>
          </div>
        </div>

        {renderStandardSignatures()}
      </div>
    </div>
  );
});


import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Trash2, Send, ArrowUp, LogOut, Archive } from "lucide-react";
import { ClientDataForm } from "@/components/quote/ClientDataForm";
import { ServicesForm } from "@/components/quote/ServicesForm";
import { PaymentForm } from "@/components/quote/PaymentForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { TotalsSummary } from "@/components/quote/TotalsSummary";
import { ClientData, PaymentInfo, SelectedService, QuoteData, Offerta } from "@/types/quote";
import { emptyClientData } from "@/data/defaults";
import { PresetType } from "@/components/quote/PaymentForm";
import { MEZZI_PER_CARTA, servicesList } from "@/data/services";
import html2pdf from "html2pdf.js";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { saveOfferta, updateOfferta, uploadPDF } from "@/firebase";

const CARTA_AZIENDALE_ID = 'carta-aziendale';
const SHADOW_ID = 'dispositivo-shadow';
const CENTRALE_ONDEMAND_ANNUALE_ID = 'centrale-ondemand-annuale';
const DDD_EXCLUDED_IDS = ['crono-silver', 'crono-gold'];

const isCronoTrigger = (s: SelectedService) =>
  s.isCrono && !DDD_EXCLUDED_IDS.includes(s.id) && s.id !== CARTA_AZIENDALE_ID;

const Index = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [clientData, setClientData] = useState<ClientData>({ ...emptyClientData });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    condizioniPagamento: "",
    condizioniFornitura: "",
    validitaOfferta: "30 giorni",
    durataContrattuale: "24"
  });
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [activePreset, setActivePreset] = useState<PresetType>(null);
  const [smartRounding, setSmartRounding] = useState(false);
  const [showTotals, setShowTotals] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const lastEditedServiceId = useRef<string | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [offertaCorrenteId, setOffertaCorrenteId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state && location.state.offertaDaRiaprire) {
      const offerta: Offerta = location.state.offertaDaRiaprire;
      setClientData(prev => ({
        ...prev,
        ragioneSociale: offerta.cliente.azienda,
        nomeReferente: offerta.cliente.nome,
        emailCliente: offerta.cliente.email,
        mezziTrattativa: offerta.cliente.nMezzi.toString(),
      }));
      setPaymentInfo({
        condizioniPagamento: offerta.condizioni.pagamento,
        validitaOfferta: offerta.condizioni.validitaOfferta,
        durataContrattuale: offerta.condizioni.durata,
        condizioniFornitura: offerta.condizioni.note,
      });
      setSelectedServices(offerta.servizi);
      setActivePreset(offerta.condizioni.preset as PresetType);
      setOffertaCorrenteId(null);
    }
  }, [location.state]);

  const triggerScroll = useCallback((section: string) => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setActiveSection(section);
      setTimeout(() => setActiveSection(null), 1000);
    }, 150);
  }, []);

  useEffect(() => {
    const updated = [...selectedServices];
    let changed = false;

    const cronoMezzi = updated.filter(isCronoTrigger).reduce((sum, s) => sum + s.quantita, 0);
    const carteNeeded = cronoMezzi > 0 ? Math.ceil(cronoMezzi / MEZZI_PER_CARTA) : 0;
    const cartaIdx = updated.findIndex(s => s.id === CARTA_AZIENDALE_ID);

    if (carteNeeded > 0) {
      if (cartaIdx >= 0) {
        if (updated[cartaIdx].quantita !== carteNeeded) {
          updated[cartaIdx] = { ...updated[cartaIdx], quantita: carteNeeded };
          changed = true;
        }
      } else {
        const cartaService = servicesList.find(s => s.id === CARTA_AZIENDALE_ID);
        if (cartaService) {
          updated.push({ ...cartaService, quantita: carteNeeded, prezzoUnitario: cartaService.prezzoRiservato });
          changed = true;
        }
      }
    } else if (cartaIdx >= 0) {
      updated.splice(cartaIdx, 1);
      changed = true;
    }

    const shadowService = updated.find(s => s.id === SHADOW_ID);
    const centraleIdx = updated.findIndex(s => s.id === CENTRALE_ONDEMAND_ANNUALE_ID);

    if (shadowService) {
      if (centraleIdx >= 0) {
        if (updated[centraleIdx].quantita !== shadowService.quantita) {
          updated[centraleIdx] = { ...updated[centraleIdx], quantita: shadowService.quantita };
          changed = true;
        }
      } else {
        const centraleService = servicesList.find(s => s.id === CENTRALE_ONDEMAND_ANNUALE_ID);
        if (centraleService) {
          updated.push({ ...centraleService, quantita: shadowService.quantita, prezzoUnitario: centraleService.prezzoRiservato });
          changed = true;
        }
      }
    } else if (centraleIdx >= 0) {
      updated.splice(centraleIdx, 1);
      changed = true;
    }

    if (changed) {
      setSelectedServices(updated);
    }
  }, [selectedServices]);

  const handleServicesChange = useCallback((services: SelectedService[]) => {
    if (services.length > selectedServices.length) {
      const newService = services.find(s => !selectedServices.some(old => old.id === s.id));
      if (newService) lastEditedServiceId.current = newService.id;
    } else if (services.length === selectedServices.length) {
      const changedService = services.find(s => {
        const old = selectedServices.find(o => o.id === s.id);
        return old && (old.quantita !== s.quantita || old.prezzoUnitario !== s.prezzoUnitario);
      });
      if (changedService) lastEditedServiceId.current = changedService.id;
    }
    setSelectedServices(services);
  }, [selectedServices]);

  const totals = useMemo(() => {
    const mensile = selectedServices.filter(s => s.periodo === "MENSILE").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);
    const annuale = selectedServices.filter(s => s.periodo === "ANNUALE").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);
    const unaTantum = selectedServices.filter(s => s.periodo === "U.T.").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);
    const hasCronoService = selectedServices.some(s => s.isCrono);
    const totaleMezzi = selectedServices.reduce((sum, s) => sum + s.quantita, 0);
    const carteAziendaSuggerite = hasCronoService ? Math.ceil(totaleMezzi / MEZZI_PER_CARTA) : 0;
    return { mensile, annuale, unaTantum, carteAziendaSuggerite };
  }, [selectedServices]);

  const quoteData: QuoteData = { clientData, paymentInfo, selectedServices, totals, smartRounding, showTotals };
  const canExport = clientData.ragioneSociale.trim().length > 0 && selectedServices.length > 0;

  const saveOrUpdateOfferta = async (stato: 'bozza' | 'inviata', pdfBlob: Blob) => {
    if (!user) return;

    const pdfUrl = await uploadPDF(pdfBlob, user.uid, clientData.ragioneSociale.trim());

    const dataCreazione = Timestamp.now();
    const validitaGiorni = parseInt(paymentInfo.validitaOfferta) || 30;
    const dataScadenza = new Date(dataCreazione.toDate());
    dataScadenza.setDate(dataScadenza.getDate() + validitaGiorni);

    const offertaData: Omit<Offerta, 'id'> = {
      uid: user.uid,
      cliente: {
        nome: clientData.nomeReferente,
        email: clientData.emailCliente,
        azienda: clientData.ragioneSociale,
        nMezzi: parseInt(clientData.mezziTrattativa) || 0
      },
      servizi: selectedServices,
      condizioni: {
        durata: paymentInfo.durataContrattuale,
        pagamento: paymentInfo.condizioniPagamento,
        validitaOfferta: paymentInfo.validitaOfferta,
        note: paymentInfo.condizioniFornitura,
        preset: activePreset || ''
      },
      totale: showTotals ? totals.annuale + totals.mensile * 12 + totals.unaTantum : 0,
      dataCreazione: dataCreazione,
      dataScadenza: Timestamp.fromDate(dataScadenza),
      stato,
      pdfUrl
    };

    if (offertaCorrenteId) {
      await updateOfferta(offertaCorrenteId, { ...offertaData });
    } else {
      const newId = await saveOfferta(offertaData);
      setOffertaCorrenteId(newId);
    }
  };

  const handleExportPDF = useCallback(async (isSending: boolean = false) => {
    if (!previewRef.current || !canExport) return;
    const element = previewRef.current;
    const nomeAzienda = clientData.ragioneSociale.trim() || "Cliente";
    const oggi = new Date();
    const gg = String(oggi.getDate()).padStart(2, '0');
    const mm = String(oggi.getMonth() + 1).padStart(2, '0');
    const aaaa = oggi.getFullYear();
    const dataFormattata = `${gg}${mm}${aaaa}`;
    const prefix = clientData.documentType === 'modulo' ? 'Modulo Ordine' : 'Proposta Commerciale';
    const filename = `${prefix}_${nomeAzienda}_${dataFormattata}.pdf`;

    const previewOnlyElements = element.querySelectorAll('.pdf-preview-only');
    previewOnlyElements.forEach(el => (el as HTMLElement).style.display = 'none');

    const opt = {
      margin: [20, 12, 20, 12] as [number, number, number, number],
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

    if (!isSending) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    await saveOrUpdateOfferta(isSending ? 'inviata' : 'bozza', pdfBlob);
    toast.success(isSending ? "Offerta inviata e salvata nell'archivio" : "Offerta salvata nell'archivio");

    previewOnlyElements.forEach(el => (el as HTMLElement).style.display = '');
  }, [clientData, paymentInfo, selectedServices, canExport, offertaCorrenteId, user, activePreset, showTotals, totals]);

  const handleClearAll = useCallback(() => {
    setClientData({ ...emptyClientData });
    setPaymentInfo({
      condizioniPagamento: "",
      condizioniFornitura: "",
      validitaOfferta: "30 giorni",
      durataContrattuale: "24"
    });
    setSelectedServices([]);
    setActivePreset(null);
    lastEditedServiceId.current = null;
    setOffertaCorrenteId(null);
  }, []);

  const handleSend = useCallback(() => {
    if (!clientData.emailCliente?.trim() || !clientData.mezziTrattativa?.trim()) return;

    const validitaGiorni = parseInt(paymentInfo.validitaOfferta) || 30;
    const dataScadenza = new Date();
    dataScadenza.setDate(dataScadenza.getDate() + validitaGiorni);
    const gg = String(dataScadenza.getDate()).padStart(2, '0');
    const mm = String(dataScadenza.getMonth() + 1).padStart(2, '0');
    const aaaa = dataScadenza.getFullYear();
    const dataValidita = `${gg}.${mm}.${aaaa}`;

    const nMezzi = parseInt(clientData.mezziTrattativa) || 1;
    const mezziTesto = nMezzi === 1 ? 'mezzo' : 'mezzi';

    const nome = clientData.nomeReferente?.trim();
    const cognome = clientData.cognomeReferente?.trim();
    const useLei = !nome && !!cognome;
    let saluto = '';
    if (nome && cognome) saluto = `Buongiorno ${nome} ${cognome}`;
    else if (cognome) saluto = `Buongiorno sig./sig.ra ${cognome}`;
    else if (nome) saluto = `Buongiorno ${nome}`;
    else saluto = `Buongiorno`;

    const corpo = useLei
      ? `${saluto},\n\ncome da accordi, Le invio la proposta commerciale calcolata su base annuale per n° ${nMezzi} ${mezziTesto}.\n\nLe segnalo che l'offerta è valida fino al ${dataValidita} e, in caso di accettazione, il modulo d'ordine va stampato, compilato e inviato via mail.\n\nAlla lettura dell'offerta, sarebbe ottimo sentirci telefonicamente per un confronto diretto e valutare insieme ogni aspetto della proposta.\n\nResto a disposizione per qualsiasi chiarimento. A presto!`
      : `${saluto},\n\ncome da accordi, ti invio la proposta commerciale calcolata su base annuale per n° ${nMezzi} ${mezziTesto}.\n\nTi segnalo che l'offerta è valida fino al ${dataValidita} e, in caso di accettazione, il modulo d'ordine va stampato, compilato e inviato via mail.\n\nAlla lettura dell'offerta, sarebbe ottimo sentirci telefonicamente per un confronto diretto e valutare insieme ogni aspetto della proposta.\n\nResto a disposizione per qualsiasi chiarimento. A presto!`;

    const oggetto = `Proposta Commerciale GT FLEET 365 - ${clientData.ragioneSociale}`;
    const mailtoLink = `mailto:${clientData.emailCliente}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;
    window.open(mailtoLink, '_blank');
    handleExportPDF(true);
  }, [clientData, paymentInfo, handleExportPDF]);

  const handleScrollToTop = () => {
    const viewport = document.querySelector('#form-scroll-area [data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.error("Scroll viewport not found!");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out: ", error);
    }
  };
  
  const glassButtonBaseStyle = "px-5 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ease-in-out shadow-lg backdrop-filter backdrop-blur-lg border hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg";

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
        <header className="p-6 flex items-center justify-between bg-transparent">
          <h1 className="text-2xl font-bold text-white">QUOTY</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearAll}
              className={`${glassButtonBaseStyle} bg-white/20 border-white/30 hover:bg-white/30 text-white`}
            >
              <Trash2 className="w-4 h-4" /> Pulisci
            </button>
            <button
              onClick={handleSend}
              disabled={!clientData.emailCliente?.trim() || !clientData.mezziTrattativa?.trim()}
              className={`${glassButtonBaseStyle} bg-blue-500/50 border-blue-400/50 hover:bg-blue-500/70 text-white`}
            >
              <Send className="w-4 h-4" /> Invia
            </button>
            <button
              onClick={() => handleExportPDF(false)}
              disabled={!canExport}
              className={`${glassButtonBaseStyle} bg-red-500/50 border-red-400/50 hover:bg-red-500/70 text-white`}
            >
              <FileText className="w-4 h-4" /> Esporta
            </button>
            <button
              onClick={() => navigate('/archivio')}
              className={`${glassButtonBaseStyle} bg-yellow-400/50 border-yellow-300/50 hover:bg-yellow-400/70 text-yellow-100`}
            >
              <Archive className="w-4 h-4" /> Archivio
            </button>
          </div>
        </header>

        {/* Main Interface */}
        <main className="flex-1 p-6 pt-0 overflow-hidden">
          <div className="h-full rounded-[2rem] overflow-hidden flex flex-col lg:flex-row border border-white/10 shadow-2xl bg-transparent">
            {/* Left Column: Forms */}
            <div className="flex-1 lg:max-w-[45%] border-r border-white/5 bg-black/20">
              <ScrollArea id="form-scroll-area" className="h-[calc(100vh-140px)]">
                <div className="p-8 space-y-8">
                  <div onFocus={() => triggerScroll('client')}>
                    <ClientDataForm clientData={clientData} onChange={setClientData} />
                  </div>
                  <div onFocus={() => triggerScroll('payment')} onClick={() => triggerScroll('payment')}>
                    <PaymentForm 
                      paymentInfo={paymentInfo} 
                      onChange={setPaymentInfo} 
                      activePreset={activePreset} 
                      onPresetChange={(p) => { setActivePreset(p); triggerScroll('payment'); }}
                      showTotals={showTotals}
                      onShowTotalsChange={setShowTotals}
                    />
                  </div>
                  <div onFocus={() => triggerScroll('services')} onClick={() => triggerScroll('services')}>
                    <ServicesForm selectedServices={selectedServices} onChange={handleServicesChange} />
                  </div>
                  <TotalsSummary totals={totals} smartRounding={smartRounding} onRoundingChange={setSmartRounding} />
                </div>
              </ScrollArea>
            </div>

            {/* Right Column: Preview */}
            <div className="flex-1 bg-black/40 relative">
              <div className="absolute inset-0 flex flex-col">
                <div className="px-8 py-4 border-b border-white/5">
                  {/* Spazio per la barra superiore */}
                </div>
                <div className="flex-1 overflow-hidden p-8 flex justify-center">
                  <div className="w-full max-w-[800px] h-full shadow-2xl rounded-lg overflow-hidden">
                    <ScrollArea className="h-full bg-white">
                      <QuotePreview 
                        ref={previewRef} 
                        quoteData={quoteData} 
                        highlightServiceId={lastEditedServiceId.current}
                        activeSection={activeSection}
                        onReorderServices={setSelectedServices}
                      />
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="p-4 text-center text-[10px] text-white/20 uppercase tracking-[0.2em]">
          QUOTY &copy; 2024 • Smart Quote Generator
        </footer>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={handleScrollToTop}
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full h-12 w-12"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleLogout}
          variant="destructive"
          size="icon"
          className="bg-red-500/80 backdrop-blur-sm hover:bg-red-500/90 text-white rounded-full h-12 w-12"
        >
          <LogOut className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Index;

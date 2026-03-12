import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, X, Trash2, Send, ArrowUp, LogOut } from "lucide-react";
import { ClientDataForm } from "@/components/quote/ClientDataForm";
import { ServicesForm } from "@/components/quote/ServicesForm";
import { PaymentForm } from "@/components/quote/PaymentForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { TotalsSummary } from "@/components/quote/TotalsSummary";
import { ClientData, PaymentInfo, SelectedService, QuoteData } from "@/types/quote";
import { emptyClientData } from "@/data/defaults";
import { PresetType } from "@/components/quote/PaymentForm";
import { MEZZI_PER_CARTA, servicesList } from "@/data/services";
import html2pdf from "html2pdf.js";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const lastEditedServiceId = useRef<string | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const triggerScroll = useCallback((section: string) => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setActiveSection(section);
      setTimeout(() => setActiveSection(null), 1000);
    }, 150);
  }, []);

  useEffect(() => {
    let updated = [...selectedServices];
    let changed = false;

    const cronoMezzi = updated
      .filter(isCronoTrigger)
      .reduce((sum, s) => sum + s.quantita, 0);
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

  const quoteData: QuoteData = { clientData, paymentInfo, selectedServices, totals, smartRounding };
  const canExport = clientData.ragioneSociale.trim().length > 0 && selectedServices.length > 0;

  const handleExportPDF = useCallback(() => {
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
    html2pdf().set(opt).from(element).save().then(() => {
      previewOnlyElements.forEach(el => (el as HTMLElement).style.display = '');
    });
  }, [clientData.ragioneSociale, canExport, clientData.documentType]);

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
    handleExportPDF();
  }, [clientData, paymentInfo, handleExportPDF]);

  const handleScrollToTop = () => {
    const viewport = document.querySelector('#form-scroll-area [data-radix-scroll-area-viewport]');
    console.log("Attempting to scroll. Viewport element:", viewport);
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
      // Optionally, show a toast or message to the user
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between bg-transparent">
          <h1 className="text-2xl font-bold text-white">QUOTY</h1>

          <div className="flex items-center gap-3">
            <button onClick={handleClearAll} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Pulisci
            </button>
            <button
              onClick={handleSend}
              disabled={!clientData.emailCliente?.trim() || !clientData.mezziTrattativa?.trim()}
              className={`px-5 py-2 rounded-lg bg-[#0066b3] text-white text-sm flex items-center gap-2 ${
                !clientData.emailCliente?.trim() || !clientData.mezziTrattativa?.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#005299]'
              }`}
            >
              <Send className="w-4 h-4" /> Invia
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!canExport}
              className={`px-5 py-2 rounded-lg bg-[#EF4444] text-white text-sm flex items-center gap-2 ${!canExport ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FileText className="w-4 h-4" /> Esporta
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
                    <PaymentForm paymentInfo={paymentInfo} onChange={setPaymentInfo} activePreset={activePreset} onPresetChange={(p) => { setActivePreset(p); triggerScroll('payment'); }} />
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
                  {/* Spazio per la barra superiore, come richiesto */}
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

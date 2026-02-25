import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Brush, AlertCircle } from "lucide-react";
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
import fluxNewLogo from "@/assets/Gemini_Generated_Image_nr2mofnr2mofnr2m_1771920931147.png";

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

  const triggerScroll = useCallback((section: string) => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setActiveSection(section);
      // Reset after animation
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
    // Individua il servizio aggiunto o modificato
    if (services.length > selectedServices.length) {
      // Servizio aggiunto
      const newService = services.find(s => !selectedServices.some(old => old.id === s.id));
      if (newService) lastEditedServiceId.current = newService.id;
    } else if (services.length === selectedServices.length) {
      // Servizio modificato
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
    const prefix = clientData.documentType === 'modulo' ? 'Copia Commissione' : 'Proposta Commerciale';
    const filename = `${prefix}_${nomeAzienda}_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.pdf`;

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

  return (
    <div className="relative min-h-screen">
      <div className="flux-bg" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={fluxNewLogo} alt="Flux Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                FLUX <span className="text-white/40 font-light">|</span> <span className="font-medium text-white/90">Smart Quote</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleClearAll} className="px-4 py-2 rounded-xl glass-card text-sm font-medium hover:bg-white/10 flex items-center gap-2">
              <Brush className="w-4 h-4" /> Pulisci
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!canExport}
              className={`px-5 py-2 rounded-xl btn-primary text-sm flex items-center gap-2 ${!canExport ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FileText className="w-4 h-4" /> Esporta PDF
            </button>
          </div>
        </header>

        {/* Main Interface */}
        <main className="flex-1 p-6 pt-0 overflow-hidden">
          <div className="h-full glass-container rounded-[2rem] overflow-hidden flex flex-col lg:flex-row border border-white/10 shadow-2xl">
            {/* Left Column: Forms */}
            <div className="flex-1 lg:max-w-[45%] border-r border-white/5 bg-black/20">
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="p-8 space-y-8">
                  <div onFocus={() => triggerScroll('client')}>
                    <ClientDataForm clientData={clientData} onChange={setClientData} />
                  </div>
                  <div onFocus={() => triggerScroll('services')} onClick={() => triggerScroll('services')}>
                    <ServicesForm selectedServices={selectedServices} onChange={handleServicesChange} />
                  </div>
                  <div onFocus={() => triggerScroll('payment')} onClick={() => triggerScroll('payment')}>
                    <PaymentForm paymentInfo={paymentInfo} onChange={setPaymentInfo} activePreset={activePreset} onPresetChange={(p) => { setActivePreset(p); triggerScroll('payment'); }} />
                  </div>
                  <TotalsSummary totals={totals} smartRounding={smartRounding} onRoundingChange={setSmartRounding} />
                </div>
              </ScrollArea>
            </div>

            {/* Right Column: Preview */}
            <div className="flex-1 bg-black/40 relative">
              <div className="absolute inset-0 flex flex-col">
                <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/60 uppercase tracking-widest">Document Preview</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs text-white/40 font-mono">LIVE UPDATE</span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-8 flex justify-center">
                  <div className="w-full max-w-[800px] h-full shadow-2xl rounded-lg overflow-hidden glass-card">
                    <ScrollArea className="h-full bg-white">
                      <QuotePreview 
                        ref={previewRef} 
                        quoteData={quoteData} 
                        highlightServiceId={lastEditedServiceId.current}
                        activeSection={activeSection}
                      />
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="p-4 text-center text-[10px] text-white/20 uppercase tracking-[0.2em]">
          Flux Platform &copy; 2026 • Intelligent Fleet Management
        </footer>
      </div>
    </div>
  );
};

export default Index;

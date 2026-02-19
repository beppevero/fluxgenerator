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

// IDs for automation
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
    durataContrattuale: "24" // Default changed to 24 months
  });
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [activePreset, setActivePreset] = useState<PresetType>(null);
  

  // === AUTOMAZIONI SERVIZI ===
  useEffect(() => {
    let updated = [...selectedServices];
    let changed = false;

    // 1. Automazione Crono → Carta Aziendale
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

    // 2. Automazione Shadow → Centrale Operativa On Demand
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


  const totals = useMemo(() => {
    const mensile = selectedServices.filter(s => s.periodo === "MENSILE").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);
    const annuale = selectedServices.filter(s => s.periodo === "ANNUALE").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);
    const unaTantum = selectedServices.filter(s => s.periodo === "U.T.").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);
    const hasCronoService = selectedServices.some(s => s.isCrono);
    const totaleMezzi = selectedServices.reduce((sum, s) => sum + s.quantita, 0);
    const carteAziendaSuggerite = hasCronoService ? Math.ceil(totaleMezzi / MEZZI_PER_CARTA) : 0;
    return {
      mensile,
      annuale,
      unaTantum,
      carteAziendaSuggerite
    };
  }, [selectedServices]);

  const quoteData: QuoteData = {
    clientData,
    paymentInfo,
    selectedServices,
    totals
  };

  // Validation for export button
  const canExport = clientData.ragioneSociale.trim().length > 0 && selectedServices.length > 0;

  const formatDateForFilename = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`;
  };

  const handleExportPDF = useCallback(() => {
    if (!previewRef.current || !canExport) return;
    const element = previewRef.current;
    const nomeAzienda = clientData.ragioneSociale.trim() || "Cliente";
    const prefix = clientData.documentType === 'modulo' ? 'Copia Commissione' : 'Proposta Commerciale';
    const filename = `${prefix}_${nomeAzienda}_${formatDateForFilename()}.pdf`;

    // Nascondi gli indicatori di anteprima prima della generazione PDF
    const previewOnlyElements = element.querySelectorAll('.pdf-preview-only');
    previewOnlyElements.forEach(el => (el as HTMLElement).style.display = 'none');

    const opt = {
      margin: [20, 12, 20, 12] as [number, number, number, number],
      filename,
      image: {
        type: "jpeg" as const,
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4",
        orientation: "portrait" as const
      },
      pagebreak: {
        mode: ['css', 'legacy']
      }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      // Ripristina gli indicatori di anteprima dopo la generazione
      previewOnlyElements.forEach(el => (el as HTMLElement).style.display = '');
    });
  }, [clientData.ragioneSociale, canExport]);

  // Reset ALL states
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
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 pt-4 px-4 flex items-center justify-between">
        {/* Left - Logo & Title */}
        <div className="inline-flex items-center gap-3 glass-card-intense px-5 py-2.5 rounded-full">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-light tracking-wide leading-none" style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>FLUX</span>
            <span className="text-sm font-light leading-none" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>|</span>
            <span className="text-sm font-light tracking-wide leading-none" style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>Smart Quote</span>
          </div>
        </div>
        {/* Right - Action Buttons */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button onClick={handleClearAll} className="btn-action-secondary-sm">
              <Brush className="w-4 h-4" />
              Pulisci
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!canExport}
              className={`btn-action-primary-sm ${!canExport ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FileText className="w-4 h-4" />
              Esporta PDF
            </button>
          </div>
          {!canExport && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px]" style={{
              background: 'rgba(255, 100, 100, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255, 100, 100, 0.3)',
              color: 'rgba(255, 200, 200, 0.9)'
            }}>
              <AlertCircle className="w-3 h-3" />
              <span>Compila Ragione Sociale e seleziona almeno un servizio</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Form */}
          <div className="glass-card p-4">
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="space-y-4 pr-3">
                <ClientDataForm clientData={clientData} onChange={setClientData} />
                <ServicesForm selectedServices={selectedServices} onChange={setSelectedServices} />
                <PaymentForm paymentInfo={paymentInfo} onChange={setPaymentInfo} activePreset={activePreset} onPresetChange={setActivePreset} />
                <TotalsSummary totals={totals} />
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview */}
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderBottom: '0.5px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Anteprima Preventivo</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
                  background: 'rgba(0, 255, 200, 0.8)',
                  boxShadow: '0 0 8px rgba(0, 255, 200, 0.6)'
                }}></div>
                <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Aggiornamento live</span>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <QuotePreview ref={previewRef} quoteData={quoteData} />
            </ScrollArea>
          </div>
        </div>
      </main>

      {/* Footer - Solo UI, non nel PDF */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center">
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Credit to Beppe Vero</p>
      </footer>
    </div>
  );
};

export default Index;

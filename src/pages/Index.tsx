import { useState, useRef, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Brush, AlertCircle, Scissors } from "lucide-react";
import { ClientDataForm } from "@/components/quote/ClientDataForm";
import { ServicesForm } from "@/components/quote/ServicesForm";
import { PaymentForm } from "@/components/quote/PaymentForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { TotalsSummary } from "@/components/quote/TotalsSummary";
import { ClientData, PaymentInfo, SelectedService, QuoteData } from "@/types/quote";
import { PresetType } from "@/components/quote/PaymentForm";
import { MEZZI_PER_CARTA } from "@/data/services";
import html2pdf from "html2pdf.js";
import fluxLogo from "@/assets/flux-logo.png";

const Index = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [clientData, setClientData] = useState<ClientData>({
    ragioneSociale: "",
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    condizioniPagamento: "",
    condizioniFornitura: "",
    validitaOfferta: "30 giorni",
    durataContrattuale: "24" // Default changed to 24 months
  });
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [activePreset, setActivePreset] = useState<PresetType>(null);
  const [showPageBreaks, setShowPageBreaks] = useState(false);

  // Calculate totals
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
    const filename = `Proposta Commerciale_${nomeAzienda}_${formatDateForFilename()}.pdf`;

    // Nascondi gli indicatori di anteprima prima della generazione PDF
    const previewOnlyElements = element.querySelectorAll('.pdf-preview-only');
    previewOnlyElements.forEach(el => (el as HTMLElement).style.display = 'none');

    const opt = {
      margin: [20, 20, 20, 20] as [number, number, number, number],
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
        mode: ['css', 'legacy'],
        after: '.html2pdf__page-break'
      }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      // Ripristina gli indicatori di anteprima dopo la generazione
      previewOnlyElements.forEach(el => (el as HTMLElement).style.display = '');
    });
  }, [clientData.ragioneSociale, canExport]);

  // Reset ALL states
  const handleClearAll = useCallback(() => {
    setClientData({
      ragioneSociale: "",
    });
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
        <div className="inline-flex items-center gap-3 glass-card-intense px-4 py-2 rounded-full">
          <img src={fluxLogo} alt="Flux Logo" className="h-7 w-auto" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground tracking-tight leading-none">FLUX</span>
            <span className="text-[10px] text-muted-foreground leading-none">Fleet Quotes Generator</span>
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
            <div className="flex items-center gap-1 text-[10px] text-amber-600">
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
                <ServicesForm selectedServices={selectedServices} onChange={setSelectedServices} carteAziendaSuggerite={totals.carteAziendaSuggerite} />
                <PaymentForm paymentInfo={paymentInfo} onChange={setPaymentInfo} activePreset={activePreset} onPresetChange={setActivePreset} />
                <TotalsSummary totals={totals} />
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview */}
          <div className="glass-card overflow-hidden">
            <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Anteprima Preventivo</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPageBreaks(!showPageBreaks)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all ${
                    showPageBreaks
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Scissors className="w-3 h-3" />
                  {showPageBreaks ? 'Nascondi pagine' : 'Mostra pagine'}
                </button>
                <span className="text-xs text-muted-foreground">Aggiornamento live</span>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <QuotePreview ref={previewRef} quoteData={quoteData} showPageBreaks={showPageBreaks} />
            </ScrollArea>
          </div>
        </div>
      </main>

      {/* Footer - Solo UI, non nel PDF */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center">
        <p className="text-xs text-foreground/30">Credit to Beppe Vero</p>
      </footer>
    </div>
  );
};

export default Index;

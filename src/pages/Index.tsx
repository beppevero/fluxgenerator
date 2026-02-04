import { useState, useRef, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { ClientDataForm } from "@/components/quote/ClientDataForm";
import { ServicesForm } from "@/components/quote/ServicesForm";
import { PaymentForm } from "@/components/quote/PaymentForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { TotalsSummary } from "@/components/quote/TotalsSummary";
import { ClientData, PaymentInfo, SelectedService, QuoteData } from "@/types/quote";
import { MEZZI_PER_CARTA } from "@/data/services";
import html2pdf from "html2pdf.js";
import fluxLogo from "@/assets/flux-logo.png";
const Index = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [clientData, setClientData] = useState<ClientData>({
    ragioneSociale: "",
    redattoDa: ""
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    condizioniPagamento: "",
    condizioniFornitura: "",
    validitaOfferta: "30 giorni dalla data di emissione",
    durataContrattuale: "36"
  });
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

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
  const formatDateForFilename = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };
  const handleExportPDF = useCallback(() => {
    if (!previewRef.current) return;
    const element = previewRef.current;
    const nomeAzienda = clientData.ragioneSociale.trim() || "Cliente";
    const filename = `Proposta Commerciale_${nomeAzienda}_${formatDateForFilename()}.pdf`;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
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
      }
    };
    html2pdf().set(opt).from(element).save();
  }, [clientData.ragioneSociale]);
  return <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card-intense border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between text-inherit">
          <div className="flex items-center gap-3">
            <img src={fluxLogo} alt="Flux Logo" className="h-10 w-auto" />
          </div>
          <button onClick={handleExportPDF} className="btn-adobe-pdf">
            <FileText className="w-5 h-5" />
            Esporta PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Form */}
          <div className="space-y-4">
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="space-y-4 pr-4">
                <ClientDataForm clientData={clientData} onChange={setClientData} />
                <ServicesForm selectedServices={selectedServices} onChange={setSelectedServices} carteAziendaSuggerite={totals.carteAziendaSuggerite} />
                <PaymentForm paymentInfo={paymentInfo} onChange={setPaymentInfo} />
                <TotalsSummary totals={totals} />
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview */}
          <div className="glass-card overflow-hidden">
            <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Anteprima Preventivo</span>
              <span className="text-xs text-muted-foreground">Aggiornamento live</span>
            </div>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <QuotePreview ref={previewRef} quoteData={quoteData} />
            </ScrollArea>
          </div>
        </div>
      </main>

      {/* Footer - Solo UI, non nel PDF */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center">
        <p className="text-xs text-foreground/30">Credit to Beppe Vero</p>
      </footer>
    </div>;
};
export default Index;
import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown, Zap } from "lucide-react";
import { ClientDataForm } from "@/components/quote/ClientDataForm";
import { ServicesForm } from "@/components/quote/ServicesForm";
import { PaymentForm } from "@/components/quote/PaymentForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { TotalsSummary } from "@/components/quote/TotalsSummary";
import { ClientData, PaymentInfo, SelectedService, QuoteData } from "@/types/quote";
import { MEZZI_PER_CARTA } from "@/data/services";
import html2pdf from "html2pdf.js";

const Index = () => {
  const previewRef = useRef<HTMLDivElement>(null);

  const [clientData, setClientData] = useState<ClientData>({
    ragioneSociale: "",
    partitaIva: "",
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    condizioniPagamento: "",
    condizioniFornitura: "",
    validitaOfferta: "30 giorni dalla data di emissione",
  });

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Calculate totals
  const totals = useMemo(() => {
    // Monthly services
    const mensile = selectedServices
      .filter((s) => s.periodo === "MENSILE")
      .reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);

    // Annual services
    const annuale = selectedServices
      .filter((s) => s.periodo === "ANNUALE")
      .reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);

    // One-time services
    const unaTantum = selectedServices
      .filter((s) => s.periodo === "U.T.")
      .reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0);

    // Carte Azienda suggerite (1 per 25 mezzi totali se Crono service selezionato)
    const hasCronoService = selectedServices.some((s) => s.isCrono);
    const totaleMezzi = selectedServices.reduce((sum, s) => sum + s.quantita, 0);
    const carteAziendaSuggerite = hasCronoService
      ? Math.ceil(totaleMezzi / MEZZI_PER_CARTA)
      : 0;

    return {
      mensile,
      annuale,
      unaTantum,
      carteAziendaSuggerite,
    };
  }, [selectedServices]);

  const quoteData: QuoteData = {
    clientData,
    paymentInfo,
    selectedServices,
    totals,
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
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(element).save();
  }, [clientData.ragioneSociale]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Flux</h1>
              <p className="text-xs text-muted-foreground">Fleet Management Quoter</p>
            </div>
          </div>
          <Button onClick={handleExportPDF} className="gap-2">
            <FileDown className="w-4 h-4" />
            Scarica PDF
          </Button>
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
                <ServicesForm
                  selectedServices={selectedServices}
                  onChange={setSelectedServices}
                  carteAziendaSuggerite={totals.carteAziendaSuggerite}
                />
                <PaymentForm paymentInfo={paymentInfo} onChange={setPaymentInfo} />
                <TotalsSummary totals={totals} />
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Anteprima Preventivo</span>
              <span className="text-xs text-muted-foreground">Aggiornamento live</span>
            </div>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <QuotePreview ref={previewRef} quoteData={quoteData} />
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

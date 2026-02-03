import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown, FileText } from "lucide-react";
import { ClientDataForm } from "@/components/quote/ClientDataForm";
import { ConfigurationForm } from "@/components/quote/ConfigurationForm";
import { ServicesForm } from "@/components/quote/ServicesForm";
import { PaymentForm } from "@/components/quote/PaymentForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { TotalsSummary } from "@/components/quote/TotalsSummary";
import { ClientData, Configuration, PaymentInfo, SelectedService, QuoteData } from "@/types/quote";
import { CARTA_AZIENDA_COSTO, MEZZI_PER_CARTA } from "@/data/services";
import html2pdf from "html2pdf.js";

const Index = () => {
  const previewRef = useRef<HTMLDivElement>(null);

  const [clientData, setClientData] = useState<ClientData>({
    ragioneSociale: "",
    referente: "",
    numeroMezzi: 0,
  });

  const [configuration, setConfiguration] = useState<Configuration>({
    tipoVeicolo: "truck",
    durataContratto: 36,
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    modalitaPagamento: "",
    validitaOfferta: "30 giorni dalla data di emissione",
  });

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Calculate totals
  const totals = useMemo(() => {
    const numeroMezzi = clientData.numeroMezzi || 0;
    
    // Monthly services
    const mensilePerMezzo = selectedServices
      .filter((s) => s.tipo === "mensile")
      .reduce((sum, s) => sum + s.prezzoRiservato, 0);
    const mensile = mensilePerMezzo * numeroMezzi;

    // One-time services
    const unaTantumBase = selectedServices
      .filter((s) => s.tipo === "unaTantum")
      .reduce((sum, s) => sum + s.prezzoRiservato * numeroMezzi, 0);

    // Carte Azienda (1 per 25 veicoli if Crono service selected)
    const hasCronoService = selectedServices.some((s) => s.isCrono);
    const carteAziendaQuantita = hasCronoService
      ? Math.ceil(numeroMezzi / MEZZI_PER_CARTA)
      : 0;
    const carteAziendaCosto = carteAziendaQuantita * CARTA_AZIENDA_COSTO;

    const unaTantum = unaTantumBase + carteAziendaCosto;

    return {
      mensile,
      unaTantum,
      carteAziendaQuantita,
      carteAziendaCosto,
    };
  }, [clientData.numeroMezzi, selectedServices]);

  const quoteData: QuoteData = {
    clientData,
    configuration,
    paymentInfo,
    selectedServices,
    totals,
  };

  const handleExportPDF = useCallback(() => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `Preventivo_${clientData.ragioneSociale || "Cliente"}_${new Date().toISOString().split("T")[0]}.pdf`,
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
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Generatore Preventivi</h1>
              <p className="text-xs text-muted-foreground">Fleet Management Services</p>
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
                <ConfigurationForm configuration={configuration} onChange={setConfiguration} />
                <ServicesForm
                  configuration={configuration}
                  selectedServices={selectedServices}
                  onChange={setSelectedServices}
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

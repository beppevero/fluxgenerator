'use client';
import { useState, useRef, useMemo } from 'react';
import { ClientForm } from "@/components/quote/ClientForm";
import { ServicesForm } from "@/components/quote/ServicesForm";
import { PaymentForm } from "@/components/quote/PaymentForm";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { QuoteData, SelectedService } from "@/types/quote";
import { Button } from '@/components/ui/button';
import { Printer, Eye, FileText, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function Home() {
  const [quoteData, setQuoteData] = useState<QuoteData>({
    clientData: {
      documentType: 'preventivo',
      ragioneSociale: '',
      partitaIva: '',
      legaleRappresentante: {
        nome: '',
        cognome: '',
        luogoDiNascita: '',
        dataDiNascita: '',
        codiceFiscale: '',
      },
      datiAzienda: {
        indirizzo: '',
        cap: '',
        citta: '',
        provincia: '',
        pec: '',
        codiceSdi: '',
        email: '',
        telefono: '',
      },
    },
    selectedServices: [],
    paymentInfo: {
      condizioniPagamento: 'Bonifico Bancario 30gg', 
      validitaOfferta: '15 giorni', 
      durataContrattuale: '36',
      condizioniFornitura: `CONDIZIONI DI FORNITURA:\n- Canoni di servizio con fatturazione trimestrale anticipata;\n- Tutti i corrispettivi si intendono al netto dell'IVA;\n- L'installazione dei dispositivi è a carico del cliente.`,
    },
    totals: {
      totaleAnnuale: 0,
      totaleMensile: 0,
      totaleUnaTantum: 0,
    },
    smartRounding: true,
  });

  const [activeTab, setActiveTab] = useState(0);
  const quotePreviewRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ content: () => quotePreviewRef.current });

  const updateTotals = (services: SelectedService[]) => {
    const totals = services.reduce((acc, s) => {
        const itemTotal = s.quantita * s.prezzoUnitario;
        if (s.periodo === 'ANNUALE') acc.totaleAnnuale += itemTotal;
        else if (s.periodo === 'MENSILE') acc.totaleMensile += itemTotal;
        else if (s.periodo === 'U.T.') acc.totaleUnaTantum += itemTotal;
        return acc;
    }, { totaleAnnuale: 0, totaleMensile: 0, totaleUnaTantum: 0 });
    
    setQuoteData(prev => ({ ...prev, selectedServices: services, totals }));
  };
  
  const grandTotal = useMemo(() => {
    const { totaleAnnuale, totaleMensile, totaleUnaTantum } = quoteData.totals;
    return (totaleAnnuale / 12 + totaleMensile) * (parseInt(quoteData.paymentInfo.durataContrattuale, 10) || 0) + totaleUnaTantum;
  }, [quoteData.totals, quoteData.paymentInfo.durataContrattuale]);

  const tabs = [
    {
      name: 'Cliente',
      component: <ClientForm clientData={quoteData.clientData} onChange={(data) => setQuoteData(prev => ({ ...prev, clientData: data }))} />,
    },
    {
      name: 'Servizi',
      component: <ServicesForm selectedServices={quoteData.selectedServices} onChange={updateTotals} />,
    },
    {
      name: 'Pagamento',
      component: <PaymentForm paymentInfo={quoteData.paymentInfo} onChange={(data) => setQuoteData(prev => ({ ...prev, paymentInfo: data }))} />,
    },
  ];

  const formatPrice = (price: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <main className="min-h-screen w-full p-4 lg:p-6 flex flex-col">
      <header className="flex items-center justify-between pb-4 bg-white/20 backdrop-blur-3xl border-b border-white/30 rounded-t-2xl px-6 pt-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-sky-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Quoty</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrint} className="glass-input h-10 bg-white/50">
            <Printer className="w-4 h-4 mr-2" /> Stampa PDF
          </Button>
          <div className="text-right pl-3">
            <p className="text-sm font-medium text-slate-700">Totale Fornitura</p>
            <p className="text-xl font-bold text-sky-500">{formatPrice(grandTotal)}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 overflow-hidden">
        {/* Colonna sinistra - Tabs */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2 p-1 rounded-lg bg-white/30 backdrop-blur-md border border-white/40">
                  {tabs.map((tab, index) => (
                      <Button 
                          key={tab.name} 
                          onClick={() => setActiveTab(index)} 
                          variant={activeTab === index ? 'default' : 'ghost'}
                          className={`transition-all duration-300 rounded-md ${activeTab === index ? 'bg-sky-500 text-white shadow-md' : 'text-slate-700 hover:bg-white/60'}`}>
                          {tab.name}
                      </Button>
                  ))}
              </div>
              <div className="flex items-center gap-2">
                  <Button onClick={() => setActiveTab(p => Math.max(0, p - 1))} variant="ghost" size="icon" disabled={activeTab === 0} className="hover:bg-white/50 rounded-lg">
                      <ChevronLeft />
                  </Button>
                  <Button onClick={() => setActiveTab(p => Math.min(tabs.length - 1, p + 1))} variant="ghost" size="icon" disabled={activeTab === tabs.length - 1} className="hover:bg-white/50 rounded-lg">
                      <ChevronRight />
                  </Button>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300/80 scrollbar-track-transparent">
              {tabs[activeTab].component}
          </div>
        </div>

        {/* Colonna destra - Preview */}
        <div className="overflow-hidden rounded-2xl relative bg-white/40 border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <span className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>{quoteData.clientData.documentType === 'preventivo' ? 'Preventivo' : 'Modulo Ordine'}</span>
            <div className="w-8 h-8 rounded-lg bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/50">
              {quoteData.clientData.documentType === 'preventivo' ? <Eye className="w-5 h-5 text-slate-700" /> : <FileText className="w-5 h-5 text-slate-700" />}
            </div>
          </div>
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300/80 scrollbar-track-transparent bg-white/20">
            <QuotePreview ref={quotePreviewRef} quoteData={quoteData} />
          </div>
        </div>
      </div>
    </main>
  );
}

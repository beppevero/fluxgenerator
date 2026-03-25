import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Trash2, Send, ArrowUp, LogOut, Archive, Save, X, AlertTriangle, Share2, Menu } from "lucide-react";
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
import { saveOfferta, updateOfferta, getOfferte, aggiornaProposteScadute } from "@/firebase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// --- Animated Toast Icons ---
const SuccessToastIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="24" cy="24" r="22" 
      stroke="#22C55E" stroke-width="4" 
      stroke-dasharray="151" 
      stroke-dashoffset="151"
      style={{ animation: 'draw-circle 600ms ease-out forwards' }}
    />
    <path 
      d="M15 24 L21 30 L33 18" 
      stroke="white" stroke-width="4" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      stroke-dasharray="29"
      stroke-dashoffset="29"
      style={{ animation: 'draw-check 400ms ease-out 400ms forwards' }}
    />
  </svg>
);

const ErrorToastIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="24" cy="24" r="22" 
      stroke="#EF4444" stroke-width="4" 
      stroke-dasharray="151" 
      stroke-dashoffset="151"
      style={{ animation: 'draw-circle 600ms ease-out forwards' }}
    />
    <path 
      d="M16 16 L32 32" 
      stroke="white" stroke-width="4" 
      stroke-linecap="round" 
      stroke-dasharray="22.6"
      stroke-dashoffset="22.6"
      style={{ animation: 'draw-x-first 200ms ease-out 400ms forwards' }}
    />
    <path 
      d="M32 16 L16 32" 
      stroke="white" stroke-width="4" 
      stroke-linecap="round"
      stroke-dasharray="22.6"
      stroke-dashoffset="22.6"
      style={{ animation: 'draw-x-second 200ms ease-out 400ms forwards' }}
    />
  </svg>
);

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
  const [expiringOffers, setExpiringOffers] = useState<Offerta[]>([]);
  const [showExpiringBanner, setShowExpiringBanner] = useState(true);
  const [upcomingBadgeCount, setUpcomingBadgeCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkOffers = async () => {
      if (import.meta.env.PROD && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      await aggiornaProposteScadute(user.uid);
      const allOffers = await getOfferte(user.uid);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiringToday: Offerta[] = [];

      for (const offerta of allOffers) {
        const scadenza = offerta.dataScadenza.toDate();
        scadenza.setHours(0, 0, 0, 0);

        const diffTime = scadenza.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          expiringToday.push(offerta);
        }
      }

      setExpiringOffers(expiringToday);
      if (expiringToday.length > 0) {
        setShowExpiringBanner(true);
      }
      
      setUpcomingBadgeCount(expiringToday.length);

      if (Notification.permission === 'granted') {
        const todayString = today.toISOString().split('T')[0];
        expiringToday.forEach(offerta => {
          const notificationKey = `notifiche_${offerta.id}_${todayString}`;
          if (!localStorage.getItem(notificationKey)) {
            new Notification('Quoty — Follow-up', {
              body: `Follow-up con ${offerta.cliente.azienda} — offerta in scadenza oggi`,
              icon: '/favicon.png'
            });
            localStorage.setItem(notificationKey, 'true');
          }
        });
      }
    };

    checkOffers();
  }, [user, location.state]);

  useEffect(() => {
    if (location.state && location.state.offertaDaRiaprire) {
      const offerta: Offerta = location.state.offertaDaRiaprire;
      const isDuplicate = location.state.isDuplicate || false;

      setClientData(prev => ({
        ...prev,
        ragioneSociale: offerta.cliente.azienda,
        partitaIva: offerta.cliente.partitaIva || '',
        nomeReferente: offerta.cliente.nome,
        cognomeReferente: offerta.cliente.cognome || '',
        emailCliente: offerta.cliente.email,
        telefonoCliente: offerta.cliente.telefono || '',
        mezziTrattativa: offerta.cliente.nMezzi.toString(),
      }));
      setPaymentInfo({
        condizioniPagamento: offerta.condizioni.pagamento,
        validitaOfferta: (() => {
          const raw = offerta.dataScadenza;
          const d = typeof raw.toDate === 'function' ? raw.toDate() : new Date(raw.seconds * 1000);
          const gg = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const aaaa = d.getFullYear();
          return `${gg}.${mm}.${aaaa}`;
        })(),
        durataContrattuale: offerta.condizioni.durata,
        condizioniFornitura: offerta.condizioni.note,
      });
      setSelectedServices(offerta.servizi);
      setActivePreset(offerta.condizioni.preset as PresetType);
      
      if (isDuplicate) {
        setOffertaCorrenteId(null);
        // Clone intelligente: resetta validità a 30 giorni
        setPaymentInfo(prev => ({
          ...prev,
          validitaOfferta: "30 giorni",
        }));
      } else {
        setOffertaCorrenteId(offerta.id!);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

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

  const createOrUpdateOfferta = async (stato: 'bozza' | 'inviata') => {
    if (!user) throw new Error("Utente non autenticato.");

    const dataCreazione = Timestamp.now();
    let dataScadenza = new Date(dataCreazione.toDate());

    const validita = paymentInfo.validitaOfferta;
    if (validita.includes("giorni")) {
      const giorni = parseInt(validita.split(' ')[0]);
      if (!isNaN(giorni)) {
        dataScadenza.setDate(dataScadenza.getDate() + giorni);
      }
    } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(validita)) {
      const parts = validita.split('.');
      dataScadenza = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      dataScadenza.setDate(dataScadenza.getDate() + 30);
    }

    const offertaData: Omit<Offerta, 'id'> = {
      uid: user.uid,
      cliente: {
        nome: clientData.nomeReferente,
        cognome: clientData.cognomeReferente,
        email: clientData.emailCliente,
        telefono: clientData.telefonoCliente,
        azienda: clientData.ragioneSociale,
        partitaIva: clientData.partitaIva,
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
      totale: totals.annuale + totals.mensile * 12 + totals.unaTantum,
      dataCreazione: dataCreazione,
      dataScadenza: Timestamp.fromDate(dataScadenza),
      stato,
    };

    try {
      if (offertaCorrenteId) {
        await updateOfferta(offertaCorrenteId, { ...offertaData });
      } else {
        const newId = await saveOfferta(offertaData);
        setOffertaCorrenteId(newId);
      }
    } catch (error) {
      console.error("Errore durante il salvataggio dell'offerta: ", error);
      throw new Error("Impossibile salvare i dati dell'offerta.");
    }
  };

  const generatePdf = useCallback(async (options?: { download: boolean }) => {
    if (!previewRef.current || !canExport) {
      toast.error("Impossibile generare il PDF. Assicurati di aver compilato i campi necessari.");
      return null;
    }
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

    if (options?.download) {
      await html2pdf().set(opt).from(element).save();
    }

    previewOnlyElements.forEach(el => (el as HTMLElement).style.display = '');

  }, [clientData, canExport, previewRef]);

  const handleSave = useCallback(async () => {
    if (!canExport) return;
    try {
      await createOrUpdateOfferta('bozza');
      toast.success("Proposta salvata con successo.");
    } catch (error) {
      console.error("Errore in handleSave: ", error);
      toast.error("Salvataggio non riuscito.");
    }
  }, [createOrUpdateOfferta, canExport]);
  
  const handleExportPDF = useCallback(async () => {
    try {
      await generatePdf({ download: true });
      await createOrUpdateOfferta('bozza');
      toast.success("Proposta esportata e salvata come bozza.");
    } catch (error) {
      console.error("Errore in handleExportPDF: ", error);
      toast.error((error as Error).message || "Si è verificato un errore imprevisto.");
    }
  }, [generatePdf, createOrUpdateOfferta]);

  const handleSend = useCallback(() => {
    if (!clientData.emailCliente?.trim() || !clientData.mezziTrattativa?.trim()) {
      toast.warning("Inserisci l'email del cliente e il numero di mezzi.");
      return;
    }

    try {
      let dataScadenza = new Date();
      const validita = paymentInfo.validitaOfferta;
      if (validita.includes("giorni")) {
        const giorni = parseInt(validita.split(' ')[0]);
        if (!isNaN(giorni)) {
          dataScadenza.setDate(dataScadenza.getDate() + giorni);
        }
      } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(validita)) {
        const parts = validita.split('.');
        dataScadenza = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        dataScadenza.setDate(dataScadenza.getDate() + 30);
      }
      const dataValidita = dataScadenza.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const nMezzi = parseInt(clientData.mezziTrattativa) || 1;
      const mezziTesto = nMezzi === 1 ? 'mezzo' : 'mezzi';

      const nome = clientData.nomeReferente?.trim();
      const cognome = clientData.cognomeReferente?.trim();
      const useLei = !nome && !!cognome;
      let saluto = 'Buongiorno';
      if (nome && cognome) saluto = `Buongiorno ${nome} ${cognome}`;
      else if (cognome) saluto = `Buongiorno sig./sig.ra ${cognome}`;
      else if (nome) saluto = `Buongiorno ${nome}`;

      const corpo = `${saluto},\n\ncome da accordi, ${useLei ? 'Le' : 'ti'} invio la proposta commerciale calcolata su base annuale per n° ${nMezzi} ${mezziTesto}.\n\n${useLei ? 'Le' : 'Ti'} segnalo che l'offerta è valida fino al ${dataValidita} e, in caso di accettazione, il modulo d'ordine va stampato, compilato e inviato via mail.\n\nAlla lettura dell'offerta, sarebbe ottimo sentirci telefonicamente per un confronto diretto e valutare insieme ogni aspetto della proposta.\n\nResto a disposizione per qualsiasi chiarimento. A presto!`;

      const oggetto = `Proposta Commerciale GT FLEET 365 - ${clientData.ragioneSociale}`;
      const mailtoLink = `mailto:${clientData.emailCliente}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;
      
      window.open(mailtoLink, '_blank');
      toast.success("Proposta inviata! PDF in download...");

    } catch(error) {
       console.error("Errore nella preparazione della mail: ", error);
       toast.error("Impossibile aprire il client di posta.");
       return;
    }

    const runBackgroundTasks = async () => {
        try {
            await createOrUpdateOfferta('inviata');
            await generatePdf({ download: true });
        } catch (err) {
            console.error("Errore durante le operazioni in background (invio): ", err);
            toast.error("Errore nel salvataggio o nella generazione del PDF.");
        }
    };

    runBackgroundTasks();

  }, [clientData, paymentInfo, createOrUpdateOfferta, generatePdf]);

  const handleWhatsApp = useCallback(() => {
    if (!clientData.mezziTrattativa?.trim()) {
      toast.warning("Inserisci il numero di mezzi.");
      return;
    }
    let dataScadenza = new Date();
    const validita = paymentInfo.validitaOfferta;
    if (validita.includes("giorni")) {
      const giorni = parseInt(validita.split(' ')[0]);
      if (!isNaN(giorni)) dataScadenza.setDate(dataScadenza.getDate() + giorni);
    } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(validita)) {
      const parts = validita.split('.');
      dataScadenza = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      dataScadenza.setDate(dataScadenza.getDate() + 30);
    }
    const dataValidita = dataScadenza.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const nMezzi = parseInt(clientData.mezziTrattativa) || 1;
    const mezziTesto = nMezzi === 1 ? 'mezzo' : 'mezzi';
    const nome = clientData.nomeReferente?.trim();
    const cognome = clientData.cognomeReferente?.trim();
    let saluto = 'Ciao';
    if (nome && cognome) saluto = `Ciao ${nome} ${cognome}`;
    else if (nome) saluto = `Ciao ${nome}`;
    else if (cognome) saluto = `Ciao ${cognome}`;
    const testo = `${saluto}, come da accordi ti invio la proposta commerciale per n° ${nMezzi} ${mezziTesto}, valida fino al ${dataValidita}. Resto a disposizione per un confronto. A presto!`;
    const telefono = clientData.telefonoCliente?.trim().replace(/\s+/g, '').replace(/^\+/, '');
    const waLink = telefono
      ? `https://wa.me/${telefono}?text=${encodeURIComponent(testo)}`
      : `https://wa.me/?text=${encodeURIComponent(testo)}`;
    window.open(waLink, '_blank');
    toast.success("Messaggio WhatsApp pronto");
  }, [clientData, paymentInfo]);

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
  
  const glassButtonBaseStyle = "relative px-5 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ease-in-out shadow-lg backdrop-filter backdrop-blur-lg border hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg";

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
      <header className="p-6 flex items-center justify-between bg-transparent">
          <h1 className="text-2xl font-bold text-white">QUOTY</h1>
          <div className="flex items-center gap-3">

            {/* Pulsanti scorrevoli */}
            <div
              className="flex items-center gap-3 overflow-hidden transition-all duration-500 ease-in-out"
              style={{ maxWidth: menuOpen ? '800px' : '0px', opacity: menuOpen ? 1 : 0 }}
            >
              <button
                id="tour-invia"
                onClick={handleSend}
                disabled={!canExport}
                className={`${glassButtonBaseStyle} bg-blue-500/50 border-blue-400/50 hover:bg-blue-500/70 text-white whitespace-nowrap`}
              >
                <Send className="w-4 h-4" /> Invia Mail
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button
                    id="tour-condividi"
                    disabled={!canExport}
                    className={`${glassButtonBaseStyle} bg-red-500/50 border-red-400/50 hover:bg-red-500/70 text-white whitespace-nowrap`}
                  >
                    <Share2 className="w-4 h-4" /> Condividi
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" /> Esporta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleWhatsApp}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-green-500" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.979l6.304-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.733.979 1.004-3.651-.233-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                    </svg>
                    Invia WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
              id="tour-salva"
                onClick={handleSave}
                disabled={!canExport}
                className={`${glassButtonBaseStyle} bg-green-500/50 border-green-400/50 hover:bg-green-500/70 text-white whitespace-nowrap`}
              >
                <Save className="w-4 h-4" /> Salva
              </button>
              <button
              id="tour-archivio"
                onClick={() => navigate('/archivio')}
                className={`${glassButtonBaseStyle} bg-yellow-400/50 border-yellow-300/50 hover:bg-yellow-400/70 text-yellow-100 whitespace-nowrap`}
              >
                <Archive className="w-4 h-4" /> Archivio
                {upcomingBadgeCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                    {upcomingBadgeCount}
                  </div>
                )}
              </button>
            </div>

            {/* Pulisci — tondo con solo icona */}
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="icon"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full h-12 w-12 border-white/20"
            >
              <Trash2 className="h-5 w-5" />
            </Button>

            {/* Hamburger — tondo */}
            <Button
              onClick={() => {
                setMenuOpen(prev => {
                  if (!prev) {
                    setTimeout(() => setMenuOpen(false), 5000);
                  }
                  return !prev;
                });
              }}
              variant="outline"
              size="icon"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full h-12 w-12 border-white/20"
            >
              <Menu className="h-5 w-5" />
            </Button>

          </div>
        </header>
        
        {expiringOffers.length > 0 && showExpiringBanner && (
          <div className="mx-6 mb-4 p-4 rounded-lg bg-black/30 backdrop-blur-lg border border-yellow-500/50 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              <span className="font-medium">
                {expiringOffers.length} {expiringOffers.length === 1 ? 'proposta in' : 'proposte in'} scadenza oggi.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/archivio')} variant="outline" className="border-yellow-400/80 text-yellow-300 hover:bg-yellow-400/20 hover:text-yellow-200">Vai all'Archivio</Button>
              <Button onClick={() => setShowExpiringBanner(false)} variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 pt-0 overflow-hidden">
          <div className="h-full rounded-[2rem] overflow-hidden flex flex-col lg:flex-row border border-white/10 shadow-2xl bg-transparent">
            <div className="flex-1 lg:max-w-[45%] border-r border-white/5 bg-black/20">
              <ScrollArea id="form-scroll-area" className="h-[calc(100vh-140px)]">
                <div className="p-8 space-y-8">
                <div id="tour-form" onFocus={() => triggerScroll('client')}>
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

            <div className="flex-1 bg-black/40 relative">
              <div className="absolute inset-0 flex flex-col">
                <div className="px-8 py-4 border-b border-white/5">
                </div>
                <div className="flex-1 overflow-hidden p-8 flex justify-center">
                <div id="tour-preview" className="w-full max-w-[800px] h-full shadow-2xl rounded-lg overflow-hidden">
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
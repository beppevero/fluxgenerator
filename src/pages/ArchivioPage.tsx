import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getOfferte, updateDataScadenza, deleteOfferta, getRevisions, saveRevision, updateOfferta } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Offerta, Revision } from "../types/quote";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Pencil, Copy, Trash2, Search, FilePenLine, CalendarPlus, Clock } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { RevisionHistoryDialog } from "@/components/RevisionHistoryDialog";

const ArchivioPage = () => {
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStato, setFiltroStato] = useState<'tutti' | 'bozza' | 'inviata' | 'scaduta' | 'persa' | 'vinta'>('tutti');
  const [sortKey, setSortKey] = useState<'azienda' | 'dataCreazione' | 'dataScadenza' | null>(null);
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

const handleSort = (key: 'azienda' | 'dataCreazione' | 'dataScadenza') => {
  if (sortKey === key) {
    setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
  } else {
    setSortKey(key);
    setSortDir('asc');
  }
};
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedOfferta, setSelectedOfferta] = useState<Offerta | null>(null);
  const [offertaToDelete, setOffertaToDelete] = useState<Offerta | null>(null);
  const [newScadenza, setNewScadenza] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [currentOffertaForRevision, setCurrentOffertaForRevision] = useState<Offerta | null>(null);
  const [clienteStorico, setClienteStorico] = useState<string | null>(null);
  const [isStoricoClienteOpen, setIsStoricoClienteOpen] = useState(false);

  const fetchOfferte = useCallback(async () => {
    if (user) {
      try {
        const offerteOttenute = await getOfferte(user.uid);
        setOfferte(offerteOttenute);
      } catch (error) {
        console.error("Errore nel recupero delle offerte: ", error);
        toast.error("Non è stato possibile caricare l'archivio.");
      }
    }
  }, [user]);

  useEffect(() => {
    fetchOfferte();
  }, [fetchOfferte]);

  const filteredOfferte = useMemo(() => {
    const filtered = offerte.filter(offerta => {
      const matchSearch = !searchTerm.trim() || 
        offerta.cliente.azienda.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchStato = filtroStato === 'tutti' || offerta.stato === filtroStato;
      return matchSearch && matchStato;
    });
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;
      if (sortKey === 'azienda') {
        valA = a.cliente.azienda.toLowerCase();
        valB = b.cliente.azienda.toLowerCase();
      } else if (sortKey === 'dataCreazione') {
        valA = a.dataCreazione.toMillis();
        valB = b.dataCreazione.toMillis();
      } else {
        valA = a.dataScadenza.toMillis();
        valB = b.dataScadenza.toMillis();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [offerte, searchTerm, filtroStato, sortKey, sortDir]);

  const getBadgeColor = (dataScadenza: Timestamp) => {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const scadenza = dataScadenza.toDate();
    scadenza.setHours(0, 0, 0, 0);
    const diffTime = scadenza.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "bg-red-700/80 hover:bg-red-700/90 border border-red-500/50";
    if (diffDays === 0) return "bg-yellow-600/80 hover:bg-yellow-600/90 border border-yellow-400/50";
    return "bg-green-600/80 hover:bg-green-600/90 border border-green-400/50";
  };

  const handleOpenModal = (offerta: Offerta) => {
    setSelectedOfferta(offerta);
    setNewScadenza(offerta.dataScadenza.toDate());
    setIsModalOpen(true);
  };

  const handleUpdateScadenza = async () => {
    if (!selectedOfferta || !newScadenza) return;
    try {
      await updateDataScadenza(selectedOfferta.id!, newScadenza);
      toast.success("Data di scadenza aggiornata.");
      fetchOfferte();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Errore nell'aggiornamento della data: ", error);
      toast.error("Aggiornamento non riuscito.");
    }
  };

  const handleOpenDeleteDialog = (offerta: Offerta) => {
    setOffertaToDelete(offerta);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!offertaToDelete) return;
    try {
      await deleteOfferta(offertaToDelete.id!);
      toast.success("Proposta eliminata con successo.");
      fetchOfferte();
      setIsDeleteDialogOpen(false);
      setOffertaToDelete(null);
    } catch (error) {
      console.error("Errore durante l'eliminazione: ", error);
      toast.error("Eliminazione non riuscita.");
    }
  };

  const handleChangeStato = async (offerta: Offerta, nuovoStato: 'bozza' | 'inviata' | 'scaduta' | 'persa' | 'vinta') => {
    if (!offerta.id) return;
    // Optimistic update locale
    setOfferte(prev => prev.map(o => o.id === offerta.id ? { ...o, stato: nuovoStato } : o));
    try {
      await updateOfferta(offerta.id, { stato: nuovoStato });
      toast.success("Stato aggiornato.");
    } catch (error) {
      console.error("Errore aggiornamento stato:", error);
      toast.error("Aggiornamento stato non riuscito.");
      // Rollback ricaricando da Firestore
      fetchOfferte();
    }
  };

  const handleOpenStorico = (azienda: string) => {
    setClienteStorico(azienda);
    setIsStoricoClienteOpen(true);
  };

  // MODIFICATA: salva snapshot automatico prima di riaprire, poi naviga sempre
  const riapriOfferta = async (offerta: Offerta) => {
    if (offerta.id && user) {
      try {
        await saveRevision(offerta.id, offerta, user.uid);
      } catch (error) {
        console.error("Errore nel salvataggio automatico della revisione:", error);
        toast.error("Impossibile salvare la revisione.");
      }
    }
    navigate("/", { state: { offertaDaRiaprire: offerta, isDuplicate: false } });
  };

  const duplicaOfferta = (offerta: Offerta) => {
    navigate("/", { state: { offertaDaRiaprire: offerta, isDuplicate: true } });
  };

  const handleOpenRevisions = async (offerta: Offerta) => {
    if (!offerta.id) return;
    try {
      const fetchedRevisions = await getRevisions(offerta.id);
      setRevisions(fetchedRevisions);
      setCurrentOffertaForRevision(offerta);
    } catch (error) {
      console.error("Errore nel recupero delle revisioni: ", error);
      toast.error("Impossibile caricare lo storico delle revisioni.");
    }
  };

  const handleSaveCurrentRevision = async (offerta: Offerta) => {
    if (!offerta.id || !user) return;
    try {
      await saveRevision(offerta.id, offerta, user.uid);
      toast.success("Revisione corrente salvata con successo!");
      handleOpenRevisions(offerta);
    } catch (error) {
      console.error("Errore nel salvataggio della revisione:", error);
      toast.error("Salvataggio della revisione non riuscito.");
    }
  };

  const handleViewRevision = (revision: Revision) => {
    setSelectedRevision(revision);
    setIsRevisionDialogOpen(true);
  };

  const handleDownloadIcs = (offerta: Offerta) => {
    const scadenza = offerta.dataScadenza.toDate();
    const formatDate = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');
    const icsDate = formatDate(scadenza);
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Quoty//IT',
      'BEGIN:VEVENT',
      `DTSTART:${icsDate}T083000`,
      `DTEND:${icsDate}T083100`,
      `SUMMARY:Scadenza Proposta - ${offerta.cliente.azienda}`,
      `DESCRIPTION:Scadenza proposta commerciale per ${offerta.cliente.azienda}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    const nomeAzienda = offerta.cliente.azienda.toLowerCase().replace(/\s+/g, '_');
    const nomeFile = `scadenza_${nomeAzienda}_${icsDate}.ics`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const glassButtonBaseStyle = "px-5 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ease-in-out shadow-lg backdrop-filter backdrop-blur-lg border hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg";

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Archivio</h1>
          <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
          {(['tutti', 'bozza', 'inviata', 'scaduta', 'persa', 'vinta'] as const).map((stato) => (
                <button
                  key={stato}
                  onClick={() => setFiltroStato(stato)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                    filtroStato === stato
                      ? 'bg-white/30 border-white/50 text-white'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {stato === 'tutti' ? 'Tutte' : stato === 'bozza' ? 'In Gestione' : stato === 'inviata' ? 'Inviata' : stato === 'scaduta' ? 'Scaduta' : stato === 'persa' ? 'Persa' : 'Vinta'}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 pl-12 pr-4 py-2 bg-black/20 border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
            </div>
            <button
              onClick={() => navigate('/')}
              className={`${glassButtonBaseStyle} bg-white/20 border-white/30 hover:bg-white/30 text-white`}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-4 shadow-lg backdrop-blur-lg">
          <Table>
            <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5 bg-white/5">
                <TableHead
                  className="text-white cursor-pointer hover:text-white/70 transition-colors select-none"
                  onClick={() => handleSort('azienda')}
                >
                  Cliente / Azienda {sortKey === 'azienda' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </TableHead>
                <TableHead
                  className="text-white text-center cursor-pointer hover:text-white/70 transition-colors select-none"
                  onClick={() => handleSort('dataCreazione')}
                >
                  Data Creazione {sortKey === 'dataCreazione' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </TableHead>
                <TableHead
                  className="text-white text-center cursor-pointer hover:text-white/70 transition-colors select-none"
                  onClick={() => handleSort('dataScadenza')}
                >
                  Data Scadenza {sortKey === 'dataScadenza' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </TableHead>
                <TableHead className="text-white text-center">Stato</TableHead>
<TableHead className="text-white text-center">Valore</TableHead>
<TableHead className="text-white text-center">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOfferte.map((offerta) => (
                <TableRow key={offerta.id} className={`border-white/10 hover:bg-white/10 transition-colors ${filteredOfferte.indexOf(offerta) % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {(() => {
                    const oggi = new Date();
                    const creazione = offerta.dataCreazione.toDate();
                    const isOggi = creazione.toDateString() === oggi.toDateString();
                    return isOggi ? <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" /> : null;
                  })()}
                  <button
                    onClick={() => handleOpenStorico(offerta.cliente.azienda)}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    {offerta.cliente.azienda}
                  </button>
                </div>
              </TableCell>
                  <TableCell className="text-center">{offerta.dataCreazione.toDate().toLocaleDateString("it-IT")}</TableCell>
                  <TableCell className="text-center">
                    {offerta.stato === 'bozza' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Badge className={`${offerta.stato === 'vinta' || offerta.stato === 'persa' ? 'bg-gray-600/80 border border-gray-500/50' : getBadgeColor(offerta.dataScadenza)} text-white`}>
                          {offerta.dataScadenza.toDate().toLocaleDateString("it-IT")}
                        </Badge>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(offerta)} className="h-6 w-6 group">
                              <Pencil className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Modifica scadenza</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none">
                          <Badge className={`cursor-pointer ${
                            offerta.stato === 'inviata' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            offerta.stato === 'scaduta' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                            offerta.stato === 'persa' ? 'bg-red-700 text-white hover:bg-red-800' :
                            offerta.stato === 'vinta' ? 'bg-green-600 text-white hover:bg-green-700' :
                            'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}>
                            {offerta.stato === 'bozza' ? 'In Gestione' :
                           offerta.stato === 'inviata' ? 'Inviata' :
                           offerta.stato === 'scaduta' ? 'Scaduta' :
                           offerta.stato === 'persa' ? 'Persa' :
                           offerta.stato === 'vinta' ? 'Vinta' : offerta.stato}
                          
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem onClick={() => handleChangeStato(offerta, 'bozza')}>In Gestione</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStato(offerta, 'inviata')}>Inviata</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStato(offerta, 'scaduta')}>Scaduta</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStato(offerta, 'persa')}>Persa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStato(offerta, 'vinta')}>Vinta</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {offerta.totale > 0
                      ? `€ ${offerta.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadIcs(offerta)}>
                            <CalendarPlus className="h-4 w-4 text-gray-400 hover:text-teal-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Aggiungi al Calendario</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => duplicaOfferta(offerta)}>
                            <Copy className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplica</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => riapriOfferta(offerta)}>
                            <FilePenLine className="h-4 w-4 text-gray-400 hover:text-green-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Modifica</TooltipContent>
                      </Tooltip>

                      <DropdownMenu onOpenChange={(open) => open && handleOpenRevisions(offerta)}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Clock className="h-4 w-4 text-gray-400 hover:text-indigo-500 transition-colors" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Storico</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Revisioni Salvate</DropdownMenuLabel>
                          {revisions.map((rev, index) => (
                            <DropdownMenuItem key={rev.id} onClick={() => handleViewRevision(rev)}>
                              <span>{rev.timestamp.toDate().toLocaleString('it-IT')}</span>
                              {index === 0 && <Badge className="ml-2">attuale</Badge>}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSaveCurrentRevision(offerta)}>
                            Salva revisione corrente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(offerta)}>
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Elimina</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal Modifica Scadenza */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900/80 border-gray-700/50 backdrop-blur-lg text-white">
            <DialogHeader>
              <DialogTitle>Modifica Data di Scadenza</DialogTitle>
              <DialogDescription className="text-gray-400">
                Seleziona la nuova data per l'offerta a <span className="font-semibold text-white">{selectedOfferta?.cliente.azienda}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <Calendar
                mode="single"
                selected={newScadenza}
                onSelect={setNewScadenza}
                className="rounded-md border border-gray-700"
                initialFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Annulla</Button>
              </DialogClose>
              <Button type="submit" onClick={handleUpdateScadenza}>Conferma</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Conferma Eliminazione */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900/80 border-gray-700/50 backdrop-blur-lg text-white">
            <DialogHeader>
              <DialogTitle>Conferma Eliminazione</DialogTitle>
              <DialogDescription className="text-gray-400 pt-2">
                Sei sicuro di voler eliminare l'offerta per <span className="font-semibold text-white">{offertaToDelete?.cliente.azienda}</span>? <br/> L'azione è irreversibile.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Annulla</Button>
              </DialogClose>
              <Button type="submit" variant="destructive" onClick={handleConfirmDelete}>Conferma Eliminazione</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revision History Dialog */}
        {currentOffertaForRevision && (
          <RevisionHistoryDialog
            isOpen={isRevisionDialogOpen}
            onClose={() => setIsRevisionDialogOpen(false)}
            revision={selectedRevision}
            offerta={currentOffertaForRevision}
          />
        )}

{/* Dialog Storico Cliente */}
<Dialog open={isStoricoClienteOpen} onOpenChange={setIsStoricoClienteOpen}>
          <DialogContent className="sm:max-w-[600px] bg-gray-900/80 border-gray-700/50 backdrop-blur-lg text-white">
            <DialogHeader>
              <DialogTitle>Storico — {clienteStorico}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tutte le proposte per questo cliente
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {offerte
                .filter(o => o.cliente.azienda === clienteStorico)
                .sort((a, b) => b.dataCreazione.toMillis() - a.dataCreazione.toMillis())
                .map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-300">
                        {o.dataCreazione.toDate().toLocaleDateString('it-IT')}
                      </span>
                      {o.stato !== 'bozza' && (
                        <span className="text-xs text-gray-500">
                          Scadenza: {o.dataScadenza.toDate().toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {o.totale > 0 && (
                        <span className="text-sm font-medium text-white">
                          € {o.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <Badge className={
                        o.stato === 'inviata' ? 'bg-blue-600 text-white' :
                        o.stato === 'scaduta' ? 'bg-orange-600 text-white' :
                        o.stato === 'persa' ? 'bg-red-700 text-white' :
                        o.stato === 'vinta' ? 'bg-green-600 text-white' :
                        'bg-secondary text-secondary-foreground'
                      }>
                        {o.stato === 'bozza' ? 'In Gestione' :
                         o.stato === 'inviata' ? 'Inviata' :
                         o.stato === 'scaduta' ? 'Scaduta' :
                         o.stato === 'persa' ? 'Persa' :
                         o.stato === 'vinta' ? 'Vinta' : o.stato}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="ghost">Chiudi</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ArchivioPage;
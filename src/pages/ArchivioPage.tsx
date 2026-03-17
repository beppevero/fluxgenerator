
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getOfferte, updateDataScadenza, deleteOfferta } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Offerta } from "../types/quote";
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
import { Home, Pencil, Copy, Trash2, Search, FilePenLine, CalendarPlus } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
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

const ArchivioPage = () => {
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedOfferta, setSelectedOfferta] = useState<Offerta | null>(null);
  const [offertaToDelete, setOffertaToDelete] = useState<Offerta | null>(null);
  const [newScadenza, setNewScadenza] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    if (!searchTerm.trim()) {
      return offerte;
    }
    return offerte.filter(offerta => 
      offerta.cliente.azienda.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [offerte, searchTerm]);

  const getBadgeColor = (dataScadenza: Timestamp) => {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const scadenza = dataScadenza.toDate();
    scadenza.setHours(0, 0, 0, 0);
    const diffTime = scadenza.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "bg-red-700/80 hover:bg-red-700/90 border border-red-500/50";
    if (diffDays <= 7) return "bg-yellow-600/80 hover:bg-yellow-600/90 border border-yellow-400/50";
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
      toast.success("Offerta eliminata con successo.");
      fetchOfferte();
      setIsDeleteDialogOpen(false);
      setOffertaToDelete(null);
    } catch (error) {
      console.error("Errore durante l'eliminazione: ", error);
      toast.error("Eliminazione non riuscita.");
    }
  };

  const riapriOfferta = (offerta: Offerta) => {
    navigate("/", { state: { offertaDaRiaprire: offerta, isDuplicate: false } });
  };

  const duplicaOfferta = (offerta: Offerta) => {
    navigate("/", { state: { offertaDaRiaprire: offerta, isDuplicate: true } });
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
      `DTSTART:${icsDate}`,
      `DTEND:${icsDate}`,
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
          <h1 className="text-2xl font-bold">Archivio Offerte</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                  type="text"
                  placeholder="Cerca per azienda..."
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
              Torna alla Home
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-4 shadow-lg backdrop-blur-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white">Cliente / Azienda</TableHead>
                <TableHead className="text-white text-center">Data Creazione</TableHead>
                <TableHead className="text-white text-center">Data Scadenza</TableHead>
                <TableHead className="text-white text-center">Stato</TableHead>
                <TableHead className="text-white text-center">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOfferte.map((offerta) => (
                <TableRow key={offerta.id} className="border-white/10 hover:bg-black/10">
                  <TableCell className="font-medium">{offerta.cliente.azienda}</TableCell>
                  <TableCell className="text-center">{offerta.dataCreazione.toDate().toLocaleDateString("it-IT")}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge className={`${getBadgeColor(offerta.dataScadenza)} text-white`}>
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
                  </TableCell>
                  <TableCell className="text-center capitalize"><Badge variant={offerta.stato === 'inviata' ? 'default' : 'secondary'}>{offerta.stato}</Badge></TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadIcs(offerta)}>
                            <CalendarPlus className="h-4 w-4 text-gray-400 hover:text-teal-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Aggiungi al calendario</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => duplicaOfferta(offerta)}>
                            <Copy className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplica e Modifica</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => riapriOfferta(offerta)}>
                            <FilePenLine className="h-4 w-4 text-gray-400 hover:text-green-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Riapri e continua a modificare</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(offerta)}>
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Elimina Offerta</TooltipContent>
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

      </div>
    </TooltipProvider>
  );
};

export default ArchivioPage;

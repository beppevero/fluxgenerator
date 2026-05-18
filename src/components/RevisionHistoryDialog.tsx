import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { Revision, Offerta, QuoteData } from "@/types/quote";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

interface RevisionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  revision: Revision | null;
  offerta: Offerta; // Pass the original offer
}

export function RevisionHistoryDialog({ isOpen, onClose, revision, offerta }: RevisionHistoryDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  if (!revision) return null;

  const quoteData: QuoteData = {
    clientData: {
        ragioneSociale: revision.snapshot.cliente.azienda,
        partitaIva: "",
        nomeReferente: revision.snapshot.cliente.nome,
        cognomeReferente: "",
        emailCliente: revision.snapshot.cliente.email,
        telefonoCliente: revision.snapshot.cliente.telefono || "",
        mezziTrattativa: revision.snapshot.cliente.nMezzi.toString(),
        hubspotUrl: revision.snapshot.cliente.hubspotUrl || "",
        documentType: 'standard',
        legaleRappresentante: { cognome: "", nome: "", luogoDiNascita: "", dataDiNascita: "", codiceFiscale: "" },
        datiAzienda: { partitaIva: "", codiceFiscaleAzienda: "", indirizzo: "", citta: "", cap: "", provincia: "", telefono: "", cellulare: "", pec: "", email: "", codiceUnivoco: "" },
    },
    paymentInfo: {
        condizioniPagamento: revision.snapshot.condizioni.pagamento,
        condizioniFornitura: revision.snapshot.condizioni.note,
        validitaOfferta: revision.snapshot.condizioni.validitaOfferta,
        durataContrattuale: revision.snapshot.condizioni.durata,
    },
    selectedServices: revision.snapshot.servizi,
    smartRounding: false, // Default or from snapshot if available
    showTotals: true, // Default or from snapshot if available
    totals: {
        mensile: revision.snapshot.servizi.filter(s => s.periodo === "MENSILE").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0),
        annuale: revision.snapshot.servizi.filter(s => s.periodo === "ANNUALE").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0),
        unaTantum: revision.snapshot.servizi.filter(s => s.periodo === "U.T.").reduce((sum, s) => sum + s.prezzoUnitario * s.quantita, 0),
        carteAziendaSuggerite: 0, // Calculate if needed
    },
  };

  const generatePdf = async () => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const nomeAzienda = revision.snapshot.cliente.azienda.trim() || "Cliente";
    const revTimestamp = revision.timestamp.toDate();
    const dataFormattata = `${String(revTimestamp.getDate()).padStart(2, '0')}${String(revTimestamp.getMonth() + 1).padStart(2, '0')}${revTimestamp.getFullYear()}`;
    const oraFormattata = `${String(revTimestamp.getHours()).padStart(2, '0')}${String(revTimestamp.getMinutes()).padStart(2, '0')}`;
    const filename = `REVISIONE_Proposta_${nomeAzienda}_${dataFormattata}_${oraFormattata}.pdf`;

    const opt = {
      margin: [20, 12, 20, 12] as [number, number, number, number],
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    await html2pdf().set(opt).from(element).save();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Revisione del {" "}
            {revision.timestamp.toDate().toLocaleString("it-IT", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full bg-white">
            <QuotePreview ref={previewRef} quoteData={quoteData} />
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Chiudi</Button>
          <Button onClick={generatePdf}>Esporta PDF di questa Revisione</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

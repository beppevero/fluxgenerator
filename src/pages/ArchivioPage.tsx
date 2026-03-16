import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOfferteByUID } from "../firebase";
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
import { Home } from 'lucide-react';

const ArchivioPage = () => {
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getOfferteByUID(user.uid).then(setOfferte);
    }
  }, [user]);

  const getBadgeColor = (dataScadenza: Date) => {
    const oggi = new Date();
    const setteGiorni = new Date();
    setteGiorni.setDate(oggi.getDate() + 7);

    if (dataScadenza < oggi) return "bg-red-500";
    if (dataScadenza <= setteGiorni) return "bg-yellow-500";
    return "bg-green-500";
  };

  const riapriOfferta = (offerta: Offerta) => {
    navigate("/", { state: { offertaDaRiaprire: offerta } });
  };

  const glassButtonBaseStyle = "px-5 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ease-in-out shadow-lg backdrop-filter backdrop-blur-lg border hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg";

  return (
    <div className="container mx-auto p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Archivio Offerte</h1>
        <button
          onClick={() => navigate('/')}
          className={`${glassButtonBaseStyle} bg-white/20 border-white/30 hover:bg-white/30 text-white`}
        >
          <Home className="mr-2 h-4 w-4" />
          Torna alla Home
        </button>
      </div>
      <div className="rounded-lg border border-white/10 bg-black/20 p-4 shadow-lg backdrop-blur-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white">Cliente / Azienda</TableHead>
              <TableHead className="text-white">Data Creazione</TableHead>
              <TableHead className="text-white">Data Scadenza</TableHead>
              <TableHead className="text-white">Stato</TableHead>
              <TableHead className="text-white">Totale</TableHead>
              <TableHead className="text-white">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerte.map((offerta) => (
              <TableRow key={offerta.id} className="border-white/10">
                <TableCell>{offerta.cliente.nome} / {offerta.cliente.azienda}</TableCell>
                <TableCell>{offerta.dataCreazione.toDate().toLocaleDateString("it-IT")}</TableCell>
                <TableCell>
                  <Badge className={`${getBadgeColor(offerta.dataScadenza.toDate())} text-white`}>
                    {offerta.dataScadenza.toDate().toLocaleDateString("it-IT")}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{offerta.stato}</TableCell>
                <TableCell>{offerta.totale > 0 ? `${offerta.totale.toFixed(2)} €` : "-"}</TableCell>
                <TableCell className="space-x-2">
                  {offerta.pdfUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={offerta.pdfUrl} target="_blank" rel="noopener noreferrer">Apri PDF</a>
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => riapriOfferta(offerta)}>
                    Riapri
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArchivioPage;

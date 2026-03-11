import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quoty - Preventivi Rapidi",
  description: "Genera preventivi e moduli d'ordine in pochi click.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} bg-[#f0f4f8]`}>
        <div className="liquid-background">
          <div className="liquid-shape shape1"></div>
          <div className="liquid-shape shape2"></div>
          <div className="liquid-shape shape3"></div>
        </div>
        <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}

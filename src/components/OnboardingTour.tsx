import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

const steps: TourStep[] = [
  {
    targetId: "tour-form",
    title: "📋 Anagrafica Cliente",
    description: "Inizia compilando i dati del cliente. Ragione sociale, referente, email e telefono alimentano automaticamente il PDF.",
  },
  {
    targetId: "tour-preview",
    title: "👁️ Anteprima PDF",
    description: "Il documento si aggiorna in tempo reale mentre compili. Quello che vedi qui è esattamente il PDF che riceverà il cliente.",
  },
  {
    targetId: "tour-hamburger",
    title: "☰ Menu azioni",
    description: "Da qui accedi a tutte le azioni principali: invia per email, condividi su WhatsApp, salva o vai all'archivio.",
  },
  {
    targetId: "tour-invia",
    title: "📧 Invia Mail",
    description: "Apre il client di posta con destinatario, oggetto e corpo precompilati. Il PDF viene scaricato automaticamente.",
  },
  {
    targetId: "tour-condividi",
    title: "📤 Condividi",
    description: "Esporta il PDF o invia il testo della proposta direttamente su WhatsApp al numero del cliente.",
  },
  {
    targetId: "tour-salva",
    title: "💾 Salva",
    description: "Salva la proposta in archivio come bozza. Potrai riaprirla e modificarla in qualsiasi momento.",
  },
  {
    targetId: "tour-archivio",
    title: "🗂️ Archivio",
    description: "Tutte le tue proposte in un unico posto. Filtra per stato, ordina per data, gestisci il ciclo di vita di ogni trattativa.",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onRequestMenuOpen?: (open: boolean) => void;
}

const OnboardingTour = ({ onComplete, onRequestMenuOpen }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const step = steps[currentStep];
    // Open menu for steps that target menu items
    const menuStepIds = ['tour-invia', 'tour-condividi', 'tour-salva', 'tour-archivio'];
    if (onRequestMenuOpen) {
      onRequestMenuOpen(menuStepIds.includes(step.targetId));
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 400);
    }
  }, [currentStep, onRequestMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      const el = document.getElementById(steps[currentStep].targetId);
      if (el) setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep]);

  const padding = 12;
  const highlight = targetRect ? {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  } : null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Overlay scuro con buco */}
      {highlight && (
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={highlight.left}
                y={highlight.top}
                width={highlight.width}
                height={highlight.height}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      )}

      {/* Tooltip */}
      <div
        className="pointer-events-auto fixed left-1/2 -translate-x-1/2 bottom-12 w-full max-w-md px-4"
      >
        <div className="bg-gray-900/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-lg p-6 text-white">
          {/* Progress */}
          <div className="flex gap-1.5 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= currentStep ? 'bg-blue-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-1">Step {currentStep + 1} di {steps.length}</p>
          <h3 className="text-lg font-bold mb-2">{steps[currentStep].title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{steps[currentStep].description}</p>

          {/* Bottoni */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={onComplete}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Salta tour
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Indietro
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    onComplete();
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {currentStep < steps.length - 1 ? 'Avanti' : 'Inizia a usare Quoty!'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
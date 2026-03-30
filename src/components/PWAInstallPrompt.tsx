import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAInstallPrompt() {
  const { isInstallable, isPWA, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já dispensou o prompt
    const wasDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Mostrar prompt após 3 segundos se for instalável e não for PWA
    if (isInstallable && !isPWA) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isPWA]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Não mostrar se:
  // - Não for instalável
  // - Já estiver rodando como PWA
  // - Foi dispensado
  // - Prompt não deve ser mostrado
  if (!isInstallable || isPWA || dismissed || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-2xl p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone size={24} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              Instalar Tarifa Zero
            </h3>
            <p className="text-sm text-white/90 mb-3">
              Adicione à tela inicial para acesso rápido e experiência completa
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                <Download size={18} />
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-white/90 hover:text-white transition"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/80 space-y-1">
          <div>✓ Acesso rápido pela tela inicial</div>
          <div>✓ Funciona offline (dados em cache)</div>
          <div>✓ Sem necessidade de baixar da loja</div>
        </div>
      </div>
    </div>
  );
}

import { Eye, EyeOff, Trophy, X } from 'lucide-react';

interface BackgroundWarningModalProps {
  isOpen: boolean;
  onClose: () => void; // Entendeu, vai manter na tela
  onStop: () => void;  // Quer encerrar a gravação
}

export default function BackgroundWarningModal({ isOpen, onClose, onStop }: BackgroundWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 p-6 border-b border-amber-100">
          <div className="flex items-start gap-3">
            <EyeOff size={28} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Gravação só funciona com o app aberto</h2>
              <p className="text-sm text-gray-600 mt-1">
                Se você minimizar ou trocar de app, a coleta de localização é pausada automaticamente pelo Android.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Pontuação */}
          <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
            <Trophy size={22} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Pontuação e contribuição</p>
              <p className="mt-0.5">
                Você só ganha pontos e contribui com a criação de rotas enquanto o app estiver visível na tela.
                Se sair, a gravação para — mas você pode continuar usando o app normalmente.
              </p>
            </div>
          </div>

          {/* Dica */}
          <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
            <Eye size={22} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-semibold">Dica para contribuir melhor</p>
              <p className="mt-0.5">
                Deixe o app aberto com a tela ligada durante a viagem. A tela não vai apagar sozinha enquanto estiver gravando.
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Entendi, vou manter o app aberto
            </button>
            <button
              onClick={onStop}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Encerrar gravação agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

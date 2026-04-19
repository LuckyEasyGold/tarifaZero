import { PauseCircle, PlayCircle, StopCircle } from 'lucide-react';

interface RecordingPausedModalProps {
  isOpen: boolean;
  pointsCollected: number;
  onResume: () => void;  // Continuar gravando
  onStop: () => void;    // Encerrar e salvar o que tem
}

export default function RecordingPausedModal({ isOpen, pointsCollected, onResume, onStop }: RecordingPausedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-orange-50 p-6 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <PauseCircle size={32} className="text-orange-500" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Gravação pausada</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {pointsCollected} pontos coletados até agora
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-gray-600">
            A gravação foi pausada porque o app ficou em segundo plano. O que deseja fazer?
          </p>

          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            <PlayCircle size={20} />
            Continuar gravando
          </button>

          <button
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            <StopCircle size={20} />
            Encerrar e salvar o que gravei
          </button>
        </div>
      </div>
    </div>
  );
}

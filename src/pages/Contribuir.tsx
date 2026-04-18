import { useState, useEffect } from 'react';
import { Play, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSimpleWifi } from '@/hooks/useSimpleWifi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DownloadAppModal from '@/components/DownloadAppModal';
import ValidationWarningModal from '@/components/ValidationWarningModal';

interface Linha {
  id: string;
  code: string;
  name: string;
  colorHex: string;
}

export default function Contribuir() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  const geolocation = useGeolocation();
  const wifiScanner = useSimpleWifi();
  const navigate = useNavigate();

  // Carregar linhas disponíveis
  useEffect(() => {
    fetch('/api/lines')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLinhas(data.data);
        }
      })
      .catch(err => console.error('Erro ao carregar linhas:', err));
  }, []);

  const handleStartRecording = () => {
    if (!selectedLineId) {
      toast.error('Selecione uma linha primeiro');
      return;
    }

    // Se não for app nativo, mostrar modal para baixar app
    if (!wifiScanner.isNative) {
      setShowDownloadModal(true);
      return;
    }

    // Mostrar modal de aviso antes de iniciar
    setShowWarningModal(true);
  };

  const handleConfirmStart = async () => {
    setShowWarningModal(false);

    // Pedir permissão de localização
    const hasPermission = await geolocation.requestPermission();
    if (!hasPermission) {
      toast.error('Permissão de localização necessária');
      return;
    }

    // Iniciar sessão de gravação na nova API
    try {
      const response = await fetch('/api/trajectories/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineId: selectedLineId }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error('Erro ao iniciar gravação: ' + result.error);
        return;
      }

      const linha = linhas.find(l => l.id === selectedLineId);

      // Redirecionar para Home em modo gravação
      navigate(`/?recording=true&lineId=${selectedLineId}&sessionId=${result.data.sessionId}&lineName=${encodeURIComponent(linha?.name || '')}&lineColor=${encodeURIComponent(linha?.colorHex || '#3B82F6')}`);
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      toast.error('Erro ao iniciar gravação');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Contribuir</h1>
          <p className="text-sm text-gray-600 mt-1">Ajude a mapear as rotas de ônibus</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Seleção de Linha e Controles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Iniciar Criação de Rota
          </h2>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a linha que você está
          </label>
          <select
            value={selectedLineId}
            onChange={(e) => setSelectedLineId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          >
            <option value="">Escolha uma linha...</option>
            {linhas.map((linha) => (
              <option key={linha.id} value={linha.id}>
                {linha.code} - {linha.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleStartRecording}
            disabled={!selectedLineId}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <Play size={20} />
            Gravar Rota
          </button>

          {!wifiScanner.isNative && selectedLineId && (
            <p className="mt-2 text-xs text-center text-blue-600">
              📱 Contribuição disponível apenas no aplicativo Android
            </p>
          )}

          {/* Informações sobre validação */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Como funciona a validação:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Sua rota será gravada e armazenada</li>
                  <li>O sistema compara com outras gravações</li>
                  <li>Quando 3+ rotas forem 90% similares, vira rota oficial</li>
                  <li>Paradas também passam por validação colaborativa</li>
                </ul>
              </div>
            </div>
          </div>

          {geolocation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{geolocation.error}</p>
            </div>
          )}
        </div>

        {/* Card informativo */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={24} className="text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Sua contribuição importa!</h3>
          </div>
          <p className="text-sm text-green-800 mb-3">
            Ao gravar rotas, você ajuda a melhorar o aplicativo para todos os usuários.
          </p>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <MapPin size={14} />
            <span>Mesmo com o app fechado, o GPS continua coletando dados</span>
          </div>
        </div>
      </div>

      {/* Modal de Aviso */}
      <ValidationWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={handleConfirmStart}
        title="Importante: Validação de Rotas"
        description="As rotas gravadas por você serão verificadas antes de fazer parte da rota oficial. O sistema compara múltiplas gravações para garantir precisão."
        warningText="⚠️ Feche o aplicativo assim que descer do ônibus para finalizar a gravação."
        confirmText="Entendi, começar gravação"
        cancelText="Cancelar"
      />

      {/* Modal Download App */}
      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
}

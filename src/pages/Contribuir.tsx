import { useState, useEffect } from 'react';
import { MapPin, Play, Square, AlertCircle, CheckCircle, Map as MapIcon, Trophy, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWifiScanner } from '@/hooks/useWifiScanner';
import { trackingService } from '@/services/trackingService';
import { toast } from 'sonner';
import BusMap from '@/components/map/BusMap';
import { Link } from 'react-router-dom';

interface Linha {
  id: string;
  code: string;
  name: string;
  colorHex: string;
}

export default function Contribuir() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [selectedLine, setSelectedLine] = useState<Linha | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pointsCollected, setPointsCollected] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [trackingPath, setTrackingPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [showMap, setShowMap] = useState(false);
  const [wifiValidated, setWifiValidated] = useState(false);
  const [identifiedLine, setIdentifiedLine] = useState<Linha | null>(null);
  const [wifiCheckInProgress, setWifiCheckInProgress] = useState(false);
  const [selectedWifi, setSelectedWifi] = useState<{ ssid: string; bssid: string } | null>(null);
  const [showWifiCard, setShowWifiCard] = useState(false);
  
  const geolocation = useGeolocation();
  const wifiScanner = useWifiScanner();

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

  // Verificar Wi-Fi automaticamente quando redes forem detectadas (apenas no APK)
  useEffect(() => {
    if (wifiScanner.isNative && wifiScanner.networks.length > 0 && !wifiValidated && !isTracking && !showWifiCard) {
      setShowWifiCard(true);
    }
  }, [wifiScanner.networks, wifiScanner.isNative, wifiValidated, isTracking, showWifiCard]);

  const handleWifiSelection = async (network: { ssid: string; bssid: string }) => {
    setSelectedWifi(network);
    setWifiCheckInProgress(true);
    setShowWifiCard(false);
    
    try {
      const response = await fetch('/api/wifi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ssid: network.ssid,
          bssid: network.bssid,
          lineId: selectedLineId
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setWifiValidated(true);
        toast.success(
          `Obrigado! Wi-Fi salvo e associado à linha 🚌`,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error('Erro ao salvar Wi-Fi:', error);
      toast.error('Erro ao salvar Wi-Fi');
    } finally {
      setWifiCheckInProgress(false);
    }
  };

  // Adicionar ponto ao caminho quando localização mudar
  useEffect(() => {
    if (isTracking && geolocation.latitude && geolocation.longitude) {
      setTrackingPath(prev => [
        ...prev,
        { lat: geolocation.latitude!, lng: geolocation.longitude! }
      ]);
    }
  }, [geolocation.latitude, geolocation.longitude, isTracking]);

  // Enviar dados de localização periodicamente quando tracking está ativo
  useEffect(() => {
    if (isTracking && geolocation.latitude && geolocation.longitude && sessionId) {
      const sendTrackingData = async () => {
        const result = await trackingService.submitTrackingData({
          lineId: selectedLineId,
          latitude: geolocation.latitude!,
          longitude: geolocation.longitude!,
          accuracy: geolocation.accuracy,
          speed: geolocation.speed,
          heading: geolocation.heading,
          sessionId,
        });

        if (result.success) {
          setPointsCollected(prev => prev + 1);
        }
      };

      sendTrackingData();
    }
  }, [geolocation.latitude, geolocation.longitude, isTracking, sessionId, selectedLineId]);

  const handleStartTracking = async () => {
    if (!selectedLineId) {
      toast.error('Selecione uma linha primeiro');
      return;
    }

    // No APK, verificar se WiFi foi validado
    if (wifiScanner.isNative && !wifiValidated) {
      toast.error('Escolha o Wi-Fi do ônibus primeiro', {
        duration: 5000
      });
      setShowWifiCard(true);
      return;
    }

    // Pedir permissão de localização
    const hasPermission = await geolocation.requestPermission();
    if (!hasPermission) {
      toast.error('Permissão de localização necessária');
      return;
    }

    // Iniciar sessão no backend
    const sessionResult = await trackingService.startSession(selectedLineId);
    
    if (!sessionResult.success) {
      toast.error('Erro ao iniciar sessão: ' + sessionResult.error);
      return;
    }

    const linha = linhas.find(l => l.id === selectedLineId);
    setSelectedLine(linha || null);
    setSessionId(sessionResult.data!.sessionId);
    setSessionStartTime(new Date());
    setIsTracking(true);
    setPointsCollected(0);
    setTrackingPath([]);
    setShowMap(true);
    
    // Iniciar tracking de GPS
    geolocation.startTracking();
    
    toast.success('Obrigado por ajudar! Continue no ônibus e vamos mapear a rota juntos 🚌', {
      duration: 6000
    });
  };

  const handleStopTracking = async () => {
    if (!sessionId) return;

    // Parar tracking de GPS
    geolocation.stopTracking();
    
    // Finalizar sessão no backend
    const result = await trackingService.stopSession(sessionId);
    
    if (result.success) {
      toast.success(`Rota salva! ${result.data?.pointsCollected} pontos coletados. Obrigado! 🎉`);
    }

    setIsTracking(false);
    setSessionId(null);
    setSessionStartTime(null);
    setShowMap(false);
  };

  const handleMarkBusStop = async () => {
    if (!isTracking || !geolocation.latitude || !geolocation.longitude) {
      toast.error('Você precisa estar criando uma rota para marcar paradas');
      return;
    }

    // Salvar coordenada como parada
    try {
      await fetch('/api/stops/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineId: selectedLineId,
          lat: geolocation.latitude,
          lng: geolocation.longitude,
          sessionId
        })
      });

      toast.success('📍 Ponto de ônibus marcado!', { duration: 3000 });
    } catch (error) {
      console.error('Erro ao marcar parada:', error);
      toast.error('Erro ao marcar parada');
    }
  };

  const formatDuration = () => {
    if (!sessionStartTime) return '00:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Criar linha virtual para o mapa com o caminho percorrido
  const trackingLineForMap = selectedLine && trackingPath.length > 0 ? [{
    id: 'tracking-' + selectedLine.id,
    nome: selectedLine.name + ' (Sua Rota)',
    cor: selectedLine.colorHex,
    corHex: selectedLine.colorHex,
    rota: trackingPath,
    paradas: [],
    horarioInicio: '00:00',
    horarioFim: '23:59',
    intervaloMinutos: 0,
  }] : [];

  // Posição atual do usuário para mostrar no mapa
  const currentPosition = geolocation.latitude && geolocation.longitude ? [{
    linhaId: selectedLineId,
    coordenadas: { lat: geolocation.latitude, lng: geolocation.longitude },
    velocidade: geolocation.speed || 0,
    ultimaAtualizacao: new Date(),
    sentido: 'ida' as const,
  }] : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Contribuir</h1>
          <p className="text-sm text-gray-600 mt-1">Ajude a mapear as rotas de ônibus</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Status de Criação de Rota Ativo */}
        {isTracking && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-900">Criando Rota</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
              <div>
                <div className="text-gray-600">Tempo</div>
                <div className="font-mono font-semibold">{formatDuration()}</div>
              </div>
              <div>
                <div className="text-gray-600">Pontos</div>
                <div className="font-mono font-semibold">{pointsCollected}</div>
              </div>
              <div>
                <div className="text-gray-600">Precisão</div>
                <div className="font-mono font-semibold">
                  {geolocation.accuracy ? `${Math.round(geolocation.accuracy)}m` : '-'}
                </div>
              </div>
            </div>
            
            {/* Botão para marcar parada */}
            <button
              onClick={handleMarkBusStop}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <MapPin size={18} />
              Marcar Ponto de Ônibus Aqui
            </button>
          </div>
        )}

        {/* Mapa em Tempo Real */}
        {isTracking && showMap && trackingPath.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Rota Sendo Criada</h3>
              </div>
            </div>
            <div className="h-[400px]">
              <BusMap
                linhas={trackingLineForMap}
                posicoes={currentPosition}
                isMobile={true}
              />
            </div>
            <div className="p-3 bg-gray-50 text-xs text-gray-600 text-center">
              {trackingPath.length} pontos no caminho
            </div>
          </div>
        )}

        {/* Seleção de Linha e Controles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isTracking ? 'Criando Rota' : 'Iniciar Criação de Rota'}
          </h2>
          
          {!isTracking ? (
            <>
              {/* Indicador de Wi-Fi Validado (apenas APK) */}
              {wifiScanner.isNative && wifiValidated && selectedWifi && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">Wi-Fi selecionado!</div>
                    <div className="text-sm text-green-700">
                      {selectedWifi.ssid} - Pronto para criar rota
                    </div>
                  </div>
                </div>
              )}

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
                onClick={handleStartTracking}
                disabled={!selectedLineId || (wifiScanner.isNative && !wifiValidated)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Iniciar Criação de Rota
              </button>

              {wifiScanner.isNative && !wifiValidated && (
                <p className="mt-2 text-xs text-center text-gray-600">
                  Primeiro escolha o Wi-Fi do ônibus
                </p>
              )}
            </>
          ) : (
            <button
              onClick={handleStopTracking}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <Square size={20} />
              Finalizar e Salvar Rota
            </button>
          )}

          {geolocation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{geolocation.error}</p>
            </div>
          )}
        </div>

        {/* Card de Seleção de WiFi (apenas APK) */}
        {wifiScanner.isNative && showWifiCard && wifiScanner.networks.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wifi size={24} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Escolha o Wi-Fi do Ônibus</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Selecione a rede Wi-Fi do ônibus para ajudar a identificar esta linha:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {wifiScanner.networks.map((network, index) => (
                <button
                  key={index}
                  onClick={() => handleWifiSelection(network)}
                  disabled={wifiCheckInProgress || !selectedLineId}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition border border-gray-200 hover:border-blue-300 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Wifi size={16} className="text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{network.ssid || 'Rede Oculta'}</div>
                      <div className="text-xs text-gray-500">{network.bssid}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {network.level} dBm
                  </div>
                </button>
              ))}
            </div>

            {!selectedLineId && (
              <p className="mt-3 text-xs text-center text-red-600">
                Selecione uma linha primeiro
              </p>
            )}

            <button
              onClick={() => setShowWifiCard(false)}
              className="mt-4 w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Como Funciona */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Como Funciona?</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">1️⃣</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Entre no Ônibus</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {wifiScanner.isNative 
                    ? 'Escolha o Wi-Fi do ônibus quando solicitado'
                    : 'Selecione a linha do ônibus que você está'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">2️⃣</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Inicie a Criação da Rota</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Clique em "Iniciar Criação de Rota" e mantenha o app aberto durante a viagem
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">3️⃣</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Marque os Pontos de Ônibus</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quando o ônibus parar em um ponto, clique em "Marcar Ponto de Ônibus Aqui"
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">4️⃣</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Finalize ao Descer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quando chegar ao seu destino, clique em "Finalizar e Salvar Rota"
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Dica:</strong> Seus dados são anônimos e ajudam a criar um mapa preciso 
              das rotas de ônibus para toda a comunidade!
            </p>
          </div>
        </div>

        {/* Link para Ranking */}
        <Link
          to="/ranking"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <Trophy size={32} />
            <div>
              <h3 className="font-semibold text-lg">Ver Ranking</h3>
              <p className="text-sm text-white/90">Confira os top contribuidores</p>
            </div>
          </div>
          <div className="text-3xl">→</div>
        </Link>
      </div>
    </div>
  );
}

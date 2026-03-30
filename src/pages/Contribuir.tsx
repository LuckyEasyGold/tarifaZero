import { useState, useEffect } from 'react';
import { MapPin, Navigation, Play, Square, AlertCircle, CheckCircle, Map as MapIcon, Trophy, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWifiDetection } from '@/hooks/useWifiDetection';
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
  const wifiInfo = useWifiDetection();
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
      // Mostrar card para usuário escolher WiFi
      setShowWifiCard(true);
    }
  }, [wifiScanner.networks, wifiScanner.isNative]);

  const handleWifiSelection = async (network: { ssid: string; bssid: string }) => {
    setSelectedWifi(network);
    setWifiCheckInProgress(true);
    
    try {
      const response = await fetch('/api/wifi/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ssid: network.ssid,
          bssid: network.bssid 
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.line) {
        setWifiValidated(true);
        setIdentifiedLine(result.line);
        setSelectedLineId(result.line.id);
        setShowWifiCard(false);
        
        toast.success(
          `Obrigado! Wi-Fi do ônibus identificado como Linha ${result.line.code} 🚌`,
          { duration: 5000 }
        );
      } else {
        // WiFi não identificado, salvar como novo
        toast.info(
          `Wi-Fi selecionado! Agora você pode iniciar a criação da rota.`,
          { duration: 4000 }
        );
        setWifiValidated(true);
        setShowWifiCard(false);
      }
    } catch (error) {
      console.error('Erro ao verificar Wi-Fi:', error);
      toast.error('Erro ao verificar Wi-Fi');
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
      
      // Mostrar card de WiFi
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
    nome: selectedLine.name + ' (Seu Tracking)',
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
          <p className="text-sm text-gray-600 mt-1">Ajude a melhorar o sistema</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Status de Tracking Ativo */}
        {isTracking && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-900">Tracking Ativo</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
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
            {geolocation.speed !== null && geolocation.speed > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Velocidade: <span className="font-semibold">{Math.round(geolocation.speed * 3.6)} km/h</span>
              </div>
            )}
          </div>
        )}

        {/* Mapa em Tempo Real */}
        {isTracking && showMap && trackingPath.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Seu Deslocamento</h3>
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {showMap ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div className="h-[400px]">
              <BusMap
                linhas={trackingLineForMap}
                posicoes={currentPosition}
                isMobile={true}
              />
            </div>
            <div className="p-3 bg-gray-50 text-xs text-gray-600 text-center">
              {trackingPath.length} pontos no caminho • Linha azul mostra seu percurso
            </div>
          </div>
        )}

        {/* Seleção de Linha e Controles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isTracking ? 'Tracking em Andamento' : 'Iniciar Tracking'}
          </h2>
          
          {!isTracking ? (
            <>
              {/* Indicador de Wi-Fi Validado */}
              {wifiScanner.isNative && identifiedLine && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">Wi-Fi do ônibus detectado!</div>
                    <div className="text-sm text-green-700">
                      Linha {identifiedLine.code} identificada automaticamente
                    </div>
                  </div>
                </div>
              )}

              {/* Aviso se não detectou Wi-Fi no app nativo */}
              {wifiScanner.isNative && !wifiValidated && wifiScanner.networks.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} className="text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-900">Wi-Fi do ônibus não detectado</div>
                    <div className="text-sm text-yellow-700">
                      Escolha a rede Wi-Fi do ônibus abaixo para continuar
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
                disabled={wifiScanner.isNative && wifiValidated}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 disabled:bg-gray-100"
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
                Estou no Ônibus - Iniciar Tracking
              </button>

              {wifiScanner.isNative && !wifiValidated && (
                <p className="mt-2 text-xs text-center text-gray-600">
                  Primeiro escolha a rede Wi-Fi do ônibus abaixo
                </p>
              )}
            </>
          ) : (
            <button
              onClick={handleStopTracking}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <Square size={20} />
              Parar Tracking
            </button>
          )}

          {geolocation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{geolocation.error}</p>
            </div>
          )}
        </div>

        {/* Informações de Conexão */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status da Conexão</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">GPS</span>
              <span className={`text-sm font-semibold ${geolocation.latitude ? 'text-green-600' : 'text-gray-400'}`}>
                {geolocation.latitude ? '✓ Ativo' : '○ Inativo'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Internet</span>
              <span className={`text-sm font-semibold ${wifiInfo.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {wifiInfo.isConnected ? '✓ Conectado' : '✗ Desconectado'}
              </span>
            </div>

            {wifiInfo.effectiveType && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tipo de Conexão</span>
                <span className="text-sm font-semibold text-gray-900">
                  {wifiInfo.effectiveType.toUpperCase()}
                </span>
              </div>
            )}

            {geolocation.latitude && geolocation.longitude && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 font-mono">
                  Lat: {geolocation.latitude.toFixed(6)}<br/>
                  Lng: {geolocation.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scanner de Wi-Fi (apenas no app nativo) */}
        {wifiScanner.isNative && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Redes Wi-Fi Detectadas</h2>
              <button
                onClick={wifiScanner.scan}
                disabled={wifiScanner.isScanning}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                {wifiScanner.isScanning ? 'Escaneando...' : 'Atualizar'}
              </button>
            </div>

            {!isTracking && !wifiValidated && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Primeiro passo:</strong> Escolha a rede Wi-Fi do ônibus abaixo para poder iniciar o tracking
              </div>
            )}

            {wifiScanner.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mb-3">
                {wifiScanner.error}
              </div>
            )}

            {wifiScanner.networks.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {wifiScanner.networks.map((network, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isTracking && !wifiValidated) {
                        // Simular seleção da rede para validação
                        checkWifiAndIdentifyLine();
                      }
                    }}
                    disabled={isTracking || wifiValidated}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                      wifiValidated 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                    } ${isTracking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Wifi size={16} className={wifiValidated ? 'text-green-600' : 'text-blue-600'} />
                      <div className="text-left">
                        <div className="font-medium text-sm">{network.ssid || 'Rede Oculta'}</div>
                        <div className="text-xs text-gray-500">{network.bssid}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-600">
                        {network.level} dBm
                      </div>
                      {wifiValidated && (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                Nenhuma rede Wi-Fi detectada
              </div>
            )}
          </div>
        )}

        {/* Aviso PWA - WiFi não disponível */}
        {!wifiScanner.isNative && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📱 Usando PWA ou Navegador?</h3>
                <p className="text-sm text-gray-700 mb-3">
                  O PWA e navegadores não conseguem detectar redes WiFi por limitações de segurança.
                </p>
                <div className="bg-white rounded-lg p-3 mb-3 text-sm">
                  <strong className="text-gray-900">Para contribuir com o mapeamento:</strong>
                  <ol className="mt-2 space-y-1 text-gray-700 list-decimal list-inside">
                    <li>Baixe o APK completo do aplicativo</li>
                    <li>Instale no seu celular</li>
                    <li>Use o APK quando estiver no ônibus</li>
                  </ol>
                </div>
                <p className="text-xs text-gray-600">
                  💡 <strong>Dica:</strong> O PWA é perfeito para visualizar dados (mapa, linhas, ranking), 
                  mas o APK é necessário para contribuir com tracking!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Como Contribuir */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Como você pode ajudar?</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Compartilhe sua localização</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quando estiver no ônibus, ative o tracking para ajudar a mapear a rota real.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Mantenha o app aberto</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Durante a viagem, mantenha o app aberto para coletar dados continuamente.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Navigation size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Dados anônimos</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Seus dados são anônimos e usados apenas para melhorar as rotas.
                </p>
              </div>
            </div>
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

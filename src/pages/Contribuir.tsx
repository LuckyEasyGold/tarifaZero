import { useState, useEffect } from 'react';
import { Play, AlertCircle, CheckCircle, Trophy, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSimpleWifi } from '@/hooks/useSimpleWifi';
import { trackingService } from '@/services/trackingService';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import DownloadAppModal from '@/components/DownloadAppModal';

interface Linha {
  id: string;
  code: string;
  name: string;
  colorHex: string;
}

export default function Contribuir() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [wifiValidated, setWifiValidated] = useState(false);
  const [wifiCheckInProgress, setWifiCheckInProgress] = useState(false);
  const [selectedWifi, setSelectedWifi] = useState<{ ssid: string; bssid: string } | null>(null);
  const [showWifiCard, setShowWifiCard] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [manualBssid, setManualBssid] = useState('');
  const [manualSsid, setManualSsid] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
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

  // Mostrar card WiFi automaticamente quando linha for selecionada (apenas no APK)
  useEffect(() => {
    if (wifiScanner.isNative && selectedLineId && !wifiValidated) {
      console.log('[Contribuir] Linha selecionada, iniciando scan automático');
      // Fazer scan automático
      const doScan = async () => {
        await wifiScanner.scan();
        // Mostrar card após o scan
        setShowWifiCard(true);
      };
      doScan();
    }
  }, [selectedLineId, wifiScanner.isNative, wifiValidated]);

  // Atualizar card quando redes forem detectadas
  useEffect(() => {
    if (wifiScanner.isNative && wifiScanner.networks.length > 0 && selectedLineId && !wifiValidated) {
      setShowWifiCard(true);
    }
  }, [wifiScanner.networks, wifiScanner.isNative, selectedLineId, wifiValidated]);

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

  const handleManualBssidSubmit = async () => {
    const bssidPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    
    if (!manualBssid.trim()) {
      toast.error('Digite o MAC/BSSID do WiFi');
      return;
    }
    
    if (!bssidPattern.test(manualBssid.trim())) {
      toast.error('MAC/BSSID inválido. Formato: AA:BB:CC:DD:EE:FF');
      return;
    }
    
    await handleWifiSelection({
      ssid: manualSsid.trim() || 'Manual',
      bssid: manualBssid.trim().toUpperCase()
    });
    
    setShowManualInput(false);
    setManualBssid('');
    setManualSsid('');
  };

  const handleSkipWifi = () => {
    setWifiValidated(true);
    setSelectedWifi({ ssid: 'GPS Only', bssid: 'GPS-BASED' });
    toast.success('Modo GPS ativado - WiFi não será usado', { duration: 3000 });
  };

  const handleStartTracking = async () => {
    if (!selectedLineId) {
      toast.error('Selecione uma linha primeiro');
      return;
    }

    // Se não for app nativo, mostrar modal para baixar app
    if (!wifiScanner.isNative) {
      setShowDownloadModal(true);
      return;
    }

    // No APK, verificar se WiFi foi validado (mas não bloquear se não estiver)
    // Se WiFi não foi validado, perguntar se o usuário quer continuar sem validação
    if (wifiScanner.isNative && !wifiValidated) {
      const confirmarSemWifi = window.confirm(
        'WiFi não validado. Deseja continuar mesmo assim?\n\n' +
        'A rota será gravada mas não terá validação oficial.\n\n' +
        'Você pode validar depois usando o BSSID do ônibus.'
      );
      
      if (!confirmarSemWifi) {
        setShowWifiCard(true);
        return;
      }
      
      // Usuário optou por continuar sem WiFi
      setWifiValidated(true);
      setSelectedWifi({ ssid: 'GPS Only - Sem Validacao', bssid: 'GPS-NO-VALIDATION' });
      toast.info('Modo sem validação ativado', { duration: 3000 });
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
    
    // Redirecionar para Home em modo gravação
    navigate(`/?recording=true&lineId=${selectedLineId}&sessionId=${sessionResult.data!.sessionId}&lineName=${encodeURIComponent(linha?.name || '')}&lineColor=${encodeURIComponent(linha?.colorHex || '#3B82F6')}`);
  };

  // Validar BSSID do WiFi selecionado contra o banco
  useEffect(() => {
    const validateWifiBssid = async () => {
      if (!selectedWifi?.bssid || !selectedLineId) return;

      try {
        const response = await fetch('/api/wifi/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bssid: selectedWifi.bssid }),
        });
        
        const result = await response.json();
        
        if (result.success && result.line.id === selectedLineId) {
          // BSSID válido e corresponde à linha selecionada
          setWifiValidated(true);
          toast.success('✅ WiFi validado! Rota terá validação oficial.', { duration: 4000 });
        } else if (result.success) {
          // BSSID válido mas para outra linha
          toast.warning('⚠️ Este WiFi pertence a outra linha', { duration: 4000 });
        }
      } catch (error) {
        console.error('Erro ao validar WiFi:', error);
      }
    };

    validateWifiBssid();
  }, [selectedWifi, selectedLineId]);

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
          
              {/* Indicador de scan em andamento (apenas APK) */}
              {wifiScanner.isNative && wifiScanner.isScanning && !showWifiCard && selectedLineId && !wifiValidated && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <div className="flex-1">
                    <div className="font-medium text-purple-900">Escaneando redes Wi-Fi...</div>
                    <div className="text-sm text-purple-700">
                      Aguarde enquanto procuramos o Wi-Fi do ônibus
                    </div>
                  </div>
                </div>
              )}

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

              {/* Botão para escanear WiFi manualmente (apenas APK) */}
              {wifiScanner.isNative && selectedLineId && !wifiValidated && (
                <button
                  onClick={async () => {
                    await wifiScanner.scan();
                    setShowWifiCard(true);
                  }}
                  disabled={wifiScanner.isScanning}
                  className="w-full mb-2 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <Wifi size={20} />
                  {wifiScanner.isScanning ? 'Escaneando...' : 'Escanear Redes Wi-Fi'}
                </button>
              )}

              {/* Botão para pular WiFi (apenas APK) */}
              {wifiScanner.isNative && selectedLineId && !wifiValidated && (
                <button
                  onClick={handleSkipWifi}
                  className="w-full mb-4 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  ⚡ Pular validação WiFi (modo GPS)
                </button>
              )}

              <button
                onClick={handleStartTracking}
                disabled={!selectedLineId}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Iniciar Criação de Rota
              </button>

              {wifiScanner.isNative && !wifiValidated && selectedLineId && (
                <p className="mt-2 text-xs text-center text-orange-600">
                  ⚠️ WiFi não validado - rota sem validação oficial
                </p>
              )}
              
              {!wifiScanner.isNative && selectedLineId && (
                <p className="mt-2 text-xs text-center text-blue-600">
                  📱 Contribuição disponível apenas no aplicativo Android
                </p>
              )}

          {geolocation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{geolocation.error}</p>
            </div>
          )}
        </div>

        {/* Card de Seleção de WiFi (apenas APK) */}
        {wifiScanner.isNative && showWifiCard && (
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wifi size={24} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Escolha o Wi-Fi do Ônibus</h2>
            </div>
            
            {wifiScanner.isScanning ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Escaneando redes Wi-Fi...</p>
              </div>
            ) : wifiScanner.networks.length > 0 ? (
              <>
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
                          {network.capabilities && (
                            <div className="text-xs text-gray-400 mt-0.5">{network.capabilities}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">{network.level} dBm</div>
                        {network.frequency > 0 && (
                          <div className="text-xs text-gray-500">{network.frequency} MHz</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Wifi size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma rede Wi-Fi detectada</p>
                <button
                  onClick={async () => await wifiScanner.scan()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {wifiScanner.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{wifiScanner.error}</p>
              </div>
            )}

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

      {/* Modal para baixar app */}
      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
}

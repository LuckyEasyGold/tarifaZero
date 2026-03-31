import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Square } from 'lucide-react';
import BusMap from '@/components/map/BusMap';
import RecordingBanner from '@/components/RecordingBanner';
import MarkStopModal from '@/components/MarkStopModal';
import { useGeolocation } from '@/hooks/useGeolocation';
import { trackingService } from '@/services/trackingService';
import { toast } from 'sonner';
import type { PosicaoOnibus } from '@/types';
import { getActiveUsers, sendHeartbeat, type ActiveUser } from '@/services/userService';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Route {
  points: RoutePoint[];
}

interface Line {
  id: string;
  code: string;
  name: string;
  colorHex: string;
  startTime: string;
  endTime: string;
  intervalMin: number;
  routes: Route[];
  stops: Stop[];
}

interface BusPosition extends PosicaoOnibus {
  id: string;
  pontoAtualIndex?: number;
  direcaoIda?: boolean;
  progresso?: number;
  timestamp: Date;
  direcao: number;
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const linhaFiltro = searchParams.get('linha'); // ID da linha para filtrar
  
  // Modo gravação
  const isRecording = searchParams.get('recording') === 'true';
  const recordingLineId = searchParams.get('lineId');
  const recordingSessionId = searchParams.get('sessionId');
  const recordingLineName = searchParams.get('lineName');
  const recordingLineColor = searchParams.get('lineColor');
  
  const [linhas, setLinhas] = useState<any[]>([]);
  const [posicoes, setPosicoes] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  
  // Estados do modo gravação
  const [recordingPath, setRecordingPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [pointsCollected, setPointsCollected] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showMarkStopModal, setShowMarkStopModal] = useState(false);
  
  const geolocation = useGeolocation();

  // Iniciar gravação quando entrar em modo recording
  useEffect(() => {
    if (isRecording && recordingSessionId) {
      setSessionStartTime(new Date());
      geolocation.startTracking();
      toast.success('Gravação iniciada! 🔴', { duration: 3000 });
    }
  }, [isRecording, recordingSessionId]);

  // Adicionar ponto ao caminho quando localização mudar
  useEffect(() => {
    if (isRecording && geolocation.latitude && geolocation.longitude) {
      setRecordingPath(prev => [
        ...prev,
        { lat: geolocation.latitude!, lng: geolocation.longitude! }
      ]);
    }
  }, [geolocation.latitude, geolocation.longitude, isRecording]);

  // Enviar dados de localização periodicamente quando gravando
  useEffect(() => {
    if (isRecording && geolocation.latitude && geolocation.longitude && recordingSessionId && recordingLineId) {
      const sendTrackingData = async () => {
        const result = await trackingService.submitTrackingData({
          lineId: recordingLineId,
          latitude: geolocation.latitude!,
          longitude: geolocation.longitude!,
          accuracy: geolocation.accuracy,
          speed: geolocation.speed,
          heading: geolocation.heading,
          sessionId: recordingSessionId,
        });

        if (result.success) {
          setPointsCollected(prev => prev + 1);
        }
      };

      sendTrackingData();
    }
  }, [geolocation.latitude, geolocation.longitude, isRecording, recordingSessionId, recordingLineId]);

  // Função para formatar duração
  const formatDuration = () => {
    if (!sessionStartTime) return '00:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Função para finalizar gravação
  const handleStopRecording = async () => {
    if (!recordingSessionId) return;

    // Parar tracking de GPS
    geolocation.stopTracking();
    
    // Finalizar sessão no backend
    const result = await trackingService.stopSession(recordingSessionId);
    
    if (result.success) {
      toast.success(`Rota salva! ${result.data?.pointsCollected} pontos coletados. Obrigado! 🎉`);
    }

    // Redirecionar para página Contribuir
    navigate('/contribuir');
  };

  // Função para marcar parada
  const handleMarkStop = async (stopName: string) => {
    if (!isRecording || !geolocation.latitude || !geolocation.longitude || !recordingLineId) {
      toast.error('Erro ao marcar parada');
      return;
    }

    try {
      await fetch('/api/stops/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineId: recordingLineId,
          lat: geolocation.latitude,
          lng: geolocation.longitude,
          sessionId: recordingSessionId,
          name: stopName
        })
      });

      toast.success(`📍 Parada "${stopName}" marcada!`, { duration: 3000 });
    } catch (error) {
      console.error('Erro ao marcar parada:', error);
      toast.error('Erro ao marcar parada');
    }
  };

  // Carregar posições salvas do localStorage
  const carregarPosicoesSalvas = (): BusPosition[] | null => {
    try {
      const saved = localStorage.getItem('busPositions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Converter strings de data de volta para Date
        return parsed.map((pos: any) => ({
          ...pos,
          timestamp: new Date(pos.timestamp),
          ultimaAtualizacao: new Date(pos.ultimaAtualizacao)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar posições salvas:', error);
    }
    return null;
  };

  // Salvar posições no localStorage
  const salvarPosicoes = (posicoes: BusPosition[]) => {
    try {
      localStorage.setItem('busPositions', JSON.stringify(posicoes));
    } catch (error) {
      console.error('Erro ao salvar posições:', error);
    }
  };

  // Calcular onde o ônibus deveria estar baseado no tempo decorrido
  const calcularPosicaoAtual = (pos: BusPosition, linha: any, tempoDecorridoMs: number): BusPosition => {
    const VELOCIDADE_MEDIA_KMH = 25;
    const VELOCIDADE_MEDIA_MS = (VELOCIDADE_MEDIA_KMH * 1000) / 3600;
    const distanciaPercorrida = VELOCIDADE_MEDIA_MS * (tempoDecorridoMs / 1000); // metros

    let pontoAtual = pos.pontoAtualIndex || 0;
    let direcao = pos.direcaoIda !== false;
    let progresso = pos.progresso || 0;
    let distanciaRestante = distanciaPercorrida;

    // Simular movimento até consumir toda a distância
    while (distanciaRestante > 0 && linha.rota.length > 1) {
      const pontoBase = linha.rota[pontoAtual];
      const proximoIndex = direcao 
        ? Math.min(pontoAtual + 1, linha.rota.length - 1)
        : Math.max(pontoAtual - 1, 0);
      const proximoPonto = linha.rota[proximoIndex];

      if (!pontoBase || !proximoPonto) break;

      const latDiff = proximoPonto.lat - pontoBase.lat;
      const lngDiff = proximoPonto.lng - pontoBase.lng;
      const distanciaGraus = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      const distanciaSegmento = distanciaGraus * 111000;

      const distanciaAteProximo = distanciaSegmento * (1 - progresso);

      if (distanciaRestante >= distanciaAteProximo) {
        // Completa este segmento e vai para o próximo
        distanciaRestante -= distanciaAteProximo;
        progresso = 0;
        
        if (direcao) {
          if (proximoIndex >= linha.rota.length - 1) {
            direcao = false;
            pontoAtual = linha.rota.length - 1;
          } else {
            pontoAtual = proximoIndex;
          }
        } else {
          if (proximoIndex <= 0) {
            direcao = true;
            pontoAtual = 0;
          } else {
            pontoAtual = proximoIndex;
          }
        }
      } else {
        // Para no meio deste segmento
        progresso += distanciaRestante / distanciaSegmento;
        distanciaRestante = 0;
      }
    }

    // Calcular coordenadas interpoladas
    const pontoBase = linha.rota[pontoAtual];
    const proximoIndex = direcao 
      ? Math.min(pontoAtual + 1, linha.rota.length - 1)
      : Math.max(pontoAtual - 1, 0);
    const proximoPonto = linha.rota[proximoIndex];

    const latInterpolada = pontoBase.lat + (proximoPonto.lat - pontoBase.lat) * progresso;
    const lngInterpolada = pontoBase.lng + (proximoPonto.lng - pontoBase.lng) * progresso;

    return {
      ...pos,
      coordenadas: { lat: latInterpolada, lng: lngInterpolada },
      pontoAtualIndex: pontoAtual,
      direcaoIda: direcao,
      progresso: progresso,
      sentido: direcao ? 'ida' : 'volta',
      ultimaAtualizacao: new Date()
    };
  };

  useEffect(() => {
    // Buscar linhas da API
    fetch('/api/lines')
      .then(res => res.json())
      .then(async data => {
        if (data.success) {
          // Buscar detalhes de cada linha
          const linhasDetalhadas = await Promise.all(
            data.data.map(async (linha: any) => {
              const res = await fetch(`/api/lines/${linha.id}`);
              const detalhes = await res.json();
              return detalhes.success ? detalhes.data : null;
            })
          );

          const linhasValidas = linhasDetalhadas.filter(l => l !== null) as Line[];
          
          // Converter para formato do mapa
          const linhasFormatadas = linhasValidas.map(linha => ({
            id: linha.id,
            nome: linha.name,
            cor: linha.colorHex,
            corHex: linha.colorHex,
            rota: linha.routes[0]?.points.map(p => ({ lat: p.lat, lng: p.lng })) || [],
            paradas: linha.stops.map(s => ({
              id: s.id,
              nome: s.name,
              coordenadas: { lat: s.lat, lng: s.lng }
            })),
            horarioInicio: linha.startTime,
            horarioFim: linha.endTime,
            intervaloMinutos: linha.intervalMin
          }));

          setLinhas(linhasFormatadas);

          // Tentar carregar posições salvas
          const posicoesSalvas = carregarPosicoesSalvas();
          
          if (posicoesSalvas && posicoesSalvas.length > 0) {
            console.log('📍 Carregando posições salvas e calculando posição atual...');
            
            // Calcular onde os ônibus deveriam estar agora
            const agora = new Date();
            const posicoesAtualizadas = posicoesSalvas.map(pos => {
              const linha = linhasFormatadas.find(l => l.id === pos.linhaId);
              if (!linha) return pos;
              
              const tempoDecorrido = agora.getTime() - pos.ultimaAtualizacao.getTime();
              return calcularPosicaoAtual(pos, linha, tempoDecorrido);
            });
            
            console.log('🚌 Posições restauradas e atualizadas');
            setPosicoes(posicoesAtualizadas as BusPosition[]);
          } else {
            // Criar posições iniciais (1 por linha)
            const posicoesSimuladas: BusPosition[] = [];
            linhasFormatadas.forEach(linha => {
              if (linha.rota.length > 0) {
                const pontoInicial = linha.rota[0];
                if (pontoInicial) {
                  posicoesSimuladas.push({
                    id: `${linha.id}-bus`,
                    linhaId: linha.id,
                    coordenadas: pontoInicial,
                    velocidade: 25,
                    direcao: 0,
                    timestamp: new Date(),
                    ultimaAtualizacao: new Date(),
                    sentido: 'ida',
                    pontoAtualIndex: 0,
                    direcaoIda: true,
                    progresso: 0
                  });
                }
              }
            });

            console.log('🚌 Criando posições iniciais:', posicoesSimuladas.length, 'ônibus');
            setPosicoes(posicoesSimuladas);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar linhas:', err);
        setLoading(false);
      });
  }, []);

  // Simular movimento dos ônibus com interpolação suave
  useEffect(() => {
    if (posicoes.length === 0 || linhas.length === 0) return;

    const VELOCIDADE_MEDIA_KMH = 25; // km/h
    const VELOCIDADE_MEDIA_MS = (VELOCIDADE_MEDIA_KMH * 1000) / 3600; // m/s
    const INTERVALO_MS = 100; // Atualizar a cada 100ms para movimento suave
    const DISTANCIA_POR_FRAME = VELOCIDADE_MEDIA_MS * (INTERVALO_MS / 1000); // metros por frame

    let frameCount = 0;
    const SALVAR_A_CADA_FRAMES = 50; // Salvar a cada 5 segundos (50 frames * 100ms)

    const interval = setInterval(() => {
      setPosicoes(prevPosicoes => {
        const novasPosicoes = prevPosicoes.map(pos => {
          const linha = linhas.find(l => l.id === pos.linhaId);
          if (!linha || linha.rota.length === 0) return pos;

          // Estado do ônibus (armazenado no próprio objeto)
          const pontoAtualIndex = pos.pontoAtualIndex || 0;
          const direcao = pos.direcaoIda !== false; // true = ida, false = volta
          const progresso = pos.progresso || 0; // 0 a 1 entre dois pontos

          const pontoAtual = linha.rota[pontoAtualIndex];
          const proximoIndex = direcao 
            ? Math.min(pontoAtualIndex + 1, linha.rota.length - 1)
            : Math.max(pontoAtualIndex - 1, 0);
          const proximoPonto = linha.rota[proximoIndex];

          if (!pontoAtual || !proximoPonto) return pos;

          // Calcular distância entre pontos (aproximação simples)
          const latDiff = proximoPonto.lat - pontoAtual.lat;
          const lngDiff = proximoPonto.lng - pontoAtual.lng;
          const distanciaGraus = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          const distanciaMetros = distanciaGraus * 111000; // 1 grau ≈ 111km

          // Calcular incremento de progresso
          const incremento = distanciaMetros > 0 ? DISTANCIA_POR_FRAME / distanciaMetros : 1;
          let novoProgresso = progresso + incremento;

          let novoPontoIndex = pontoAtualIndex;
          let novaDirecao = direcao;

          // Se completou o segmento
          if (novoProgresso >= 1) {
            novoProgresso = 0;
            
            if (direcao) {
              // Indo
              if (proximoIndex >= linha.rota.length - 1) {
                // Chegou no fim, inverte direção
                novaDirecao = false;
                novoPontoIndex = linha.rota.length - 1;
              } else {
                novoPontoIndex = proximoIndex;
              }
            } else {
              // Voltando
              if (proximoIndex <= 0) {
                // Chegou no início, inverte direção
                novaDirecao = true;
                novoPontoIndex = 0;
              } else {
                novoPontoIndex = proximoIndex;
              }
            }
          }

          // Interpolar posição entre pontos
          const pontoBase = linha.rota[novoPontoIndex];
          const pontoDestino = linha.rota[novaDirecao 
            ? Math.min(novoPontoIndex + 1, linha.rota.length - 1)
            : Math.max(novoPontoIndex - 1, 0)
          ];

          const latInterpolada = pontoBase.lat + (pontoDestino.lat - pontoBase.lat) * novoProgresso;
          const lngInterpolada = pontoBase.lng + (pontoDestino.lng - pontoBase.lng) * novoProgresso;

          return {
            ...pos,
            coordenadas: { lat: latInterpolada, lng: lngInterpolada },
            pontoAtualIndex: novoPontoIndex,
            direcaoIda: novaDirecao,
            progresso: novoProgresso,
            velocidade: VELOCIDADE_MEDIA_KMH,
            sentido: novaDirecao ? 'ida' : 'volta',
            timestamp: new Date(),
            ultimaAtualizacao: new Date()
          };
        });

        // Salvar posições periodicamente
        frameCount++;
        if (frameCount >= SALVAR_A_CADA_FRAMES) {
          salvarPosicoes(novasPosicoes);
          frameCount = 0;
        }

        return novasPosicoes as BusPosition[];
      });
    }, INTERVALO_MS);

    return () => clearInterval(interval);
  }, [posicoes.length, linhas]);

  // Buscar usuários ativos e enviar heartbeat
  useEffect(() => {
    const anonymousId = localStorage.getItem('anonymousId');
    if (!anonymousId) {
      console.log('❌ Sem anonymousId - usuário não fez onboarding');
      return;
    }

    console.log('✅ AnonymousId encontrado:', anonymousId);

    // Buscar usuários ativos inicialmente
    getActiveUsers()
      .then(response => {
        console.log('👥 Usuários ativos:', response.count);
        setActiveUsers(response.users);
      })
      .catch(err => console.error('Erro ao buscar usuários ativos:', err));

    // Enviar heartbeat a cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      // Pegar localização atual se disponível
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('📍 Enviando heartbeat com localização:', {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            sendHeartbeat(
              anonymousId,
              position.coords.latitude,
              position.coords.longitude,
              false // não está tracking na tela Home
            ).catch(err => console.error('Erro ao enviar heartbeat:', err));
          },
          (error) => {
            console.log('⚠️ Erro ao obter localização:', error.message);
            // Se não conseguir localização, envia sem coordenadas
            sendHeartbeat(anonymousId, undefined, undefined, false)
              .catch(err => console.error('Erro ao enviar heartbeat:', err));
          }
        );
      } else {
        console.log('⚠️ Geolocalização não disponível');
        sendHeartbeat(anonymousId, undefined, undefined, false)
          .catch(err => console.error('Erro ao enviar heartbeat:', err));
      }
    }, 30000); // 30 segundos

    // Buscar usuários ativos a cada 10 segundos
    const usersInterval = setInterval(() => {
      getActiveUsers()
        .then(response => {
          console.log('🔄 Atualizando usuários ativos:', response.count);
          setActiveUsers(response.users);
        })
        .catch(err => console.error('Erro ao buscar usuários ativos:', err));
    }, 10000); // 10 segundos

    // Enviar heartbeat imediatamente ao carregar
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 Heartbeat inicial com localização');
          sendHeartbeat(
            anonymousId,
            position.coords.latitude,
            position.coords.longitude,
            false
          ).catch(err => console.error('Erro ao enviar heartbeat inicial:', err));
        },
        () => {
          console.log('⚠️ Heartbeat inicial sem localização');
          sendHeartbeat(anonymousId, undefined, undefined, false)
            .catch(err => console.error('Erro ao enviar heartbeat inicial:', err));
        }
      );
    }

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(usersInterval);
    };
  }, []);

  // Filtrar linhas e posições se houver filtro
  const linhasFiltradas = linhaFiltro 
    ? linhas.filter(l => l.id === linhaFiltro)
    : linhas;
  
  const posicoesFiltradas = linhaFiltro
    ? posicoes.filter(p => p.linhaId === linhaFiltro)
    : posicoes;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center pb-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col pb-16">
      {/* Banner de gravação */}
      {isRecording && recordingLineName && (
        <RecordingBanner
          lineName={recordingLineName}
          duration={formatDuration()}
          pointsCollected={pointsCollected}
          accuracy={geolocation.accuracy}
        />
      )}
      
      {/* Mapa ocupa toda a tela */}
      <div className="flex-1 relative">
        <BusMap 
          linhas={linhasFiltradas} 
          posicoes={posicoesFiltradas}
          activeUsers={activeUsers}
          isMobile={false}
        />
        
        {/* Botões flutuantes quando gravando */}
        {isRecording && (
          <>
            {/* Botão Marcar Parada */}
            <button
              onClick={() => setShowMarkStopModal(true)}
              className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition flex items-center justify-center z-10"
              title="Marcar Parada de Ônibus"
            >
              <MapPin size={28} />
            </button>
            
            {/* Botão Finalizar */}
            <button
              onClick={handleStopRecording}
              className="fixed bottom-24 left-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition flex items-center justify-center z-10"
              title="Finalizar Gravação"
            >
              <Square size={24} />
            </button>
          </>
        )}
      </div>
      
      {/* Modal para marcar parada */}
      <MarkStopModal
        isOpen={showMarkStopModal}
        onClose={() => setShowMarkStopModal(false)}
        onSave={handleMarkStop}
      />
    </div>
  );
}

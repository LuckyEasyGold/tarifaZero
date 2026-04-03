import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Bus, Navigation, Map, User } from 'lucide-react';
import { useScheduledTimes } from '@/hooks/useScheduledTimes';

interface Stop {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  code: string;
}

interface RoutePoint {
  lat: number;
  lng: number;
  sequence: number;
}

interface Route {
  id: string;
  direction: string;
  points: RoutePoint[];
}

interface LinhaDetalhes {
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

interface BusPosition {
  coordenadas: { lat: number; lng: number };
  velocidade: number;
  sentido: 'ida' | 'volta';
  pontoAtualIndex?: number;
  direcaoIda?: boolean;
  progresso?: number;
}

// Calcular distância entre dois pontos (Haversine)
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function LinhaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [linha, setLinha] = useState<LinhaDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [busPosition, setBusPosition] = useState<BusPosition | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [proximaParada, setProximaParada] = useState<Stop | null>(null);
  const [distanciaProximaParada, setDistanciaProximaParada] = useState<number | null>(null);
  const [tempoEstimado, setTempoEstimado] = useState<number | null>(null);
  const [paradaMaisProxima, setParadaMaisProxima] = useState<Stop | null>(null);
  const [distanciaUsuarioParada, setDistanciaUsuarioParada] = useState<number | null>(null);
  const [tempoUsuarioParada, setTempoUsuarioParada] = useState<number | null>(null);
  const [tempoOnibusAteUsuario, setTempoOnibusAteUsuario] = useState<number | null>(null);

  // Hook para horários programados
  const { schedules, nextSchedule } = useScheduledTimes(id);

  useEffect(() => {
    if (!id) return;

    console.log('🔍 Buscando linha com ID:', id);
    
    fetch(`/api/lines/${id}`)
      .then(res => {
        console.log('📡 Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('📦 Data recebido:', data);
        if (data.success) {
          setLinha(data.data);
        } else {
          console.error('❌ API retornou success: false', data.error);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Erro ao carregar linha:', err);
        setLoading(false);
      });
  }, [id]);

  // Carregar posição do ônibus do localStorage
  useEffect(() => {
    if (!linha) return;

    const carregarPosicao = () => {
      try {
        const saved = localStorage.getItem('busPositions');
        if (saved) {
          const positions = JSON.parse(saved);
          const posicaoLinha = positions.find((p: any) => p.linhaId === linha.id);
          
          if (posicaoLinha) {
            setBusPosition({
              coordenadas: posicaoLinha.coordenadas,
              velocidade: posicaoLinha.velocidade || 25,
              sentido: posicaoLinha.sentido || 'ida',
              pontoAtualIndex: posicaoLinha.pontoAtualIndex,
              direcaoIda: posicaoLinha.direcaoIda,
              progresso: posicaoLinha.progresso
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar posição:', error);
      }
    };

    carregarPosicao();
    
    // Atualizar a cada 2 segundos
    const interval = setInterval(carregarPosicao, 2000);
    return () => clearInterval(interval);
  }, [linha]);

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Não foi possível obter localização:', error);
        }
      );
    }
  }, []);

  // Calcular próxima parada e informações
  useEffect(() => {
    if (!linha || !busPosition || linha.stops.length === 0) return;

    const rota = linha.routes[0]?.points || [];
    if (rota.length === 0) return;

    // Encontrar próxima parada baseado na posição atual do ônibus
    const pontoAtual = busPosition.pontoAtualIndex || 0;
    const direcao = busPosition.direcaoIda !== false;

    // Encontrar paradas à frente na rota
    let proximaStop: Stop | null = null;
    let menorDistancia = Infinity;

    linha.stops.forEach(stop => {
      const distancia = calcularDistancia(
        busPosition.coordenadas.lat,
        busPosition.coordenadas.lng,
        stop.lat,
        stop.lng
      );

      // Verificar se a parada está à frente na direção do movimento
      if (distancia < menorDistancia && distancia > 0.05) { // Mais de 50m
        proximaStop = stop;
        menorDistancia = distancia;
      }
    });

    if (proximaStop) {
      setProximaParada(proximaStop);
      setDistanciaProximaParada(menorDistancia);
      
      // Calcular tempo estimado do ônibus (velocidade média 25 km/h)
      const tempoHoras = menorDistancia / 25;
      const tempoMinutos = Math.round(tempoHoras * 60);
      setTempoEstimado(tempoMinutos);
    }
  }, [linha, busPosition]);

  // Calcular parada mais próxima do usuário
  useEffect(() => {
    if (!linha || !userLocation || linha.stops.length === 0) return;

    let paradaProxima: Stop | null = null;
    let menorDistancia = Infinity;

    // Encontrar a parada mais próxima do usuário
    linha.stops.forEach(stop => {
      const distancia = calcularDistancia(
        userLocation.lat,
        userLocation.lng,
        stop.lat,
        stop.lng
      );

      if (distancia < menorDistancia) {
        paradaProxima = stop;
        menorDistancia = distancia;
      }
    });

    if (paradaProxima) {
      setParadaMaisProxima(paradaProxima);
      setDistanciaUsuarioParada(menorDistancia);
      
      // Calcular tempo caminhando (velocidade média 5 km/h)
      const tempoUsuarioHoras = menorDistancia / 5;
      const tempoUsuarioMin = Math.round(tempoUsuarioHoras * 60);
      setTempoUsuarioParada(tempoUsuarioMin);
    }
  }, [linha, userLocation]);

  // Calcular tempo do ônibus até a parada do usuário
  useEffect(() => {
    if (!linha || !busPosition || !paradaMaisProxima || !linha.routes[0]?.points) return;

    const rota = linha.routes[0].points;
    if (rota.length === 0) return;

    // Encontrar índice da parada do usuário na rota
    let indiceParadaUsuario = -1;
    let menorDistanciaParada = Infinity;
    
    rota.forEach((ponto, index) => {
      const dist = calcularDistancia(
        ponto.lat,
        ponto.lng,
        paradaMaisProxima.lat,
        paradaMaisProxima.lng
      );
      
      if (dist < menorDistanciaParada) {
        menorDistanciaParada = dist;
        indiceParadaUsuario = index;
      }
    });

    if (indiceParadaUsuario === -1) return;

    // Calcular distância do ônibus até a parada do usuário seguindo a rota
    const pontoAtualOnibus = busPosition.pontoAtualIndex || 0;
    const direcao = busPosition.direcaoIda !== false;

    let distanciaTotal = 0;

    if (direcao) {
      // Indo: calcular do ponto atual até a parada do usuário
      if (indiceParadaUsuario >= pontoAtualOnibus) {
        // Parada está à frente
        for (let i = pontoAtualOnibus; i < indiceParadaUsuario; i++) {
          const p1 = rota[i];
          const p2 = rota[i + 1];
          distanciaTotal += calcularDistancia(p1.lat, p1.lng, p2.lat, p2.lng);
        }
      } else {
        // Parada já passou, ônibus precisa ir até o fim e voltar
        // Ir até o fim
        for (let i = pontoAtualOnibus; i < rota.length - 1; i++) {
          const p1 = rota[i];
          const p2 = rota[i + 1];
          distanciaTotal += calcularDistancia(p1.lat, p1.lng, p2.lat, p2.lng);
        }
        // Voltar até a parada
        for (let i = rota.length - 1; i > indiceParadaUsuario; i--) {
          const p1 = rota[i];
          const p2 = rota[i - 1];
          distanciaTotal += calcularDistancia(p1.lat, p1.lng, p2.lat, p2.lng);
        }
      }
    } else {
      // Voltando: calcular do ponto atual até a parada do usuário
      if (indiceParadaUsuario <= pontoAtualOnibus) {
        // Parada está à frente (na volta)
        for (let i = pontoAtualOnibus; i > indiceParadaUsuario; i--) {
          const p1 = rota[i];
          const p2 = rota[i - 1];
          distanciaTotal += calcularDistancia(p1.lat, p1.lng, p2.lat, p2.lng);
        }
      } else {
        // Parada já passou, ônibus precisa ir até o início e voltar
        // Ir até o início
        for (let i = pontoAtualOnibus; i > 0; i--) {
          const p1 = rota[i];
          const p2 = rota[i - 1];
          distanciaTotal += calcularDistancia(p1.lat, p1.lng, p2.lat, p2.lng);
        }
        // Voltar até a parada
        for (let i = 0; i < indiceParadaUsuario; i++) {
          const p1 = rota[i];
          const p2 = rota[i + 1];
          distanciaTotal += calcularDistancia(p1.lat, p1.lng, p2.lat, p2.lng);
        }
      }
    }

    // Calcular tempo (velocidade média 25 km/h)
    const tempoHoras = distanciaTotal / 25;
    const tempoMinutos = Math.round(tempoHoras * 60);
    setTempoOnibusAteUsuario(tempoMinutos);

  }, [linha, busPosition, paradaMaisProxima]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!linha) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <p className="text-gray-600 mb-4">Linha não encontrada</p>
        <button
          onClick={() => navigate('/linhas')}
          className="text-blue-600 hover:underline"
        >
          Voltar para linhas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/linhas')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: linha.colorHex }}
            >
              <Bus size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{linha.name}</h1>
              <p className="text-sm text-gray-600">{linha.code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações em Tempo Real */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
        {/* 1. Card de Parada Mais Próxima de Você */}
        {paradaMaisProxima ? (
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={20} className="text-green-600" />
              <h2 className="font-semibold text-gray-900">Parada Mais Próxima de Você</h2>
            </div>
            
            {userLocation ? (
              <div className="space-y-2">
                <div>
                  <p className="font-medium text-gray-900">{paradaMaisProxima.name}</p>
                  {paradaMaisProxima.description && (
                    <p className="text-sm text-gray-600 mt-1">{paradaMaisProxima.description}</p>
                  )}
                </div>
                
                {distanciaUsuarioParada !== null && (
                  <div className="flex items-center justify-between pt-2 border-t border-green-200">
                    <span className="text-sm text-gray-600">Sua distância:</span>
                    <span className="font-medium text-green-600">
                      {distanciaUsuarioParada < 1 
                        ? `${Math.round(distanciaUsuarioParada * 1000)} m`
                        : `${distanciaUsuarioParada.toFixed(1)} km`
                      }
                    </span>
                  </div>
                )}
                
                {tempoUsuarioParada !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tempo caminhando (5 km/h):</span>
                    <span className="font-medium text-green-600">
                      {tempoUsuarioParada} min
                    </span>
                  </div>
                )}

                {busPosition && tempoOnibusAteUsuario !== null && (
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">🚌 Ônibus chega em:</span>
                      <span className="font-bold text-green-700 text-xl">
                        {tempoOnibusAteUsuario} min
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Tempo estimado até o ônibus passar nesta parada
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Permita o acesso à localização para ver a parada mais próxima de você
              </p>
            )}
          </div>
        ) : userLocation && linha.stops.length > 0 ? (
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={20} className="text-green-600" />
              <h2 className="font-semibold text-gray-900">Parada Mais Próxima de Você</h2>
            </div>
            <p className="text-sm text-gray-600">
              Calculando parada mais próxima...
            </p>
          </div>
        ) : null}

        {/* Card de Próximo Horário Programado */}
        {nextSchedule.nextTime && (
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-yellow-600" />
              <h2 className="font-semibold text-gray-900">Próximo Horário</h2>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Horário:</span>
                <span className="font-bold text-yellow-700 text-2xl">
                  {nextSchedule.nextTime}
                </span>
              </div>

              {nextSchedule.minutesUntil !== null && (
                <div className="flex items-center justify-between pt-2 border-t border-yellow-200">
                  <span className="text-sm text-gray-600">Falta:</span>
                  <span className="font-medium text-yellow-600">
                    {nextSchedule.minutesUntil} minutos
                  </span>
                </div>
              )}

              {nextSchedule.nextStop && (
                <div className="mt-2 pt-2 border-t border-yellow-200">
                  <p className="text-xs text-gray-500">Parada:</p>
                  <p className="text-sm font-medium text-gray-700">{nextSchedule.nextStop}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card de Todos os Horários */}
        {schedules.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Horários de Hoje</h2>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {schedules
                  .filter(s => {
                    const now = new Date();
                    const dayOfWeek = now.getDay();
                    let dayType = 'weekday';
                    if (dayOfWeek === 0) dayType = 'sunday';
                    if (dayOfWeek === 6) dayType = 'saturday';
                    return s.dayOfWeek === dayType;
                  })
                  .map((schedule, index) => {
                    const now = new Date();
                    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    const isPast = schedule.time < currentTime;
                    const isNext = schedule.time === nextSchedule.nextTime;

                    return (
                      <div
                        key={index}
                        className={`
                          text-center py-2 px-1 rounded text-sm font-medium
                          ${isNext ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400' : ''}
                          ${isPast && !isNext ? 'bg-gray-100 text-gray-400' : ''}
                          ${!isPast && !isNext ? 'bg-blue-50 text-blue-700' : ''}
                        `}
                      >
                        {schedule.time}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Card de Próxima Parada */}
        {proximaParada && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={20} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">Próxima Parada</h2>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-900">{proximaParada.name}</p>
                {proximaParada.description && (
                  <p className="text-sm text-gray-600 mt-1">{proximaParada.description}</p>
                )}
              </div>
              
              {distanciaProximaParada !== null && (
                <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                  <span className="text-sm text-gray-600">Distância do ônibus:</span>
                  <span className="font-medium text-blue-600">
                    {distanciaProximaParada < 1 
                      ? `${Math.round(distanciaProximaParada * 1000)} m`
                      : `${distanciaProximaParada.toFixed(1)} km`
                    }
                  </span>
                </div>
              )}
              
              {tempoEstimado !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo estimado do ônibus:</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {tempoEstimado} min
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Card de Posição Atual */}
        {busPosition && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Navigation size={20} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">Posição Atual</h2>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sentido:</span>
                <span className="font-medium text-gray-900">
                  {busPosition.sentido === 'ida' ? '🚌 Ida' : '🔄 Volta'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Velocidade:</span>
                <span className="font-medium text-gray-900">{busPosition.velocidade} km/h</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Botão Ver no Mapa */}
        <button
          onClick={() => navigate(`/?linha=${linha.id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Map size={20} />
          Ver no Mapa
        </button>

        {/* 5. Card de Informações da Linha */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">Informações da Linha</h2>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Horário de operação:</span>
              <span className="font-medium text-gray-900">{linha.startTime} - {linha.endTime}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Intervalo:</span>
              <span className="font-medium text-gray-900">{linha.intervalMin} minutos</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total de paradas:</span>
              <span className="font-medium text-gray-900">{linha.stops.length}</span>
            </div>
          </div>
        </div>

        {/* 6. Lista de Todas as Paradas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Todas as Paradas</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {linha.stops
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((stop, index) => (
                <div key={stop.id} className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{stop.name}</h3>
                    {stop.description && (
                      <p className="text-sm text-gray-600 mt-1">{stop.description}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

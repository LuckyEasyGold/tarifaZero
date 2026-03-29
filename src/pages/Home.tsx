import { useState, useEffect } from 'react';
import BusMap from '@/components/map/BusMap';
import type { PosicaoOnibus } from '@/types';

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
  const [linhas, setLinhas] = useState<any[]>([]);
  const [posicoes, setPosicoes] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(true);

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
            setPosicoes(posicoesAtualizadas);
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

        return novasPosicoes;
      });
    }, INTERVALO_MS);

    return () => clearInterval(interval);
  }, [posicoes.length, linhas]);

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
      {/* Mapa ocupa toda a tela */}
      <div className="flex-1 relative">
        <BusMap 
          linhas={linhas} 
          posicoes={posicoes}
          isMobile={false}
        />
      </div>
    </div>
  );
}

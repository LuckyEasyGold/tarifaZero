import { useState, useEffect } from 'react';
import BusMap from '@/components/map/BusMap';

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

interface BusPosition {
  id: string;
  linhaId: string;
  coordenadas: { lat: number; lng: number };
  velocidade: number;
  direcao: number;
  timestamp: Date;
}

export default function Home() {
  const [linhas, setLinhas] = useState<any[]>([]);
  const [posicoes, setPosicoes] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(true);

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

          // Simular posições de ônibus
          const posicoesSimuladas: BusPosition[] = [];
          linhasFormatadas.forEach(linha => {
            if (linha.rota.length > 0) {
              // Criar 2-3 ônibus por linha em posições diferentes
              const numOnibus = Math.floor(Math.random() * 2) + 2;
              for (let i = 0; i < numOnibus; i++) {
                const pontoIndex = Math.floor((linha.rota.length / numOnibus) * i);
                const ponto = linha.rota[pontoIndex];
                if (ponto) {
                  posicoesSimuladas.push({
                    id: `${linha.id}-bus-${i}`,
                    linhaId: linha.id,
                    coordenadas: ponto,
                    velocidade: Math.random() * 30 + 20, // 20-50 km/h
                    direcao: Math.random() * 360,
                    timestamp: new Date(),
                    ultimaAtualizacao: new Date()
                  });
                }
              }
            }
          });

          setPosicoes(posicoesSimuladas);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar linhas:', err);
        setLoading(false);
      });
  }, []);

  // Simular movimento dos ônibus
  useEffect(() => {
    if (posicoes.length === 0 || linhas.length === 0) return;

    const interval = setInterval(() => {
      setPosicoes(prevPosicoes => 
        prevPosicoes.map(pos => {
          const linha = linhas.find(l => l.id === pos.linhaId);
          if (!linha || linha.rota.length === 0) return pos;

          // Encontrar ponto mais próximo na rota
          let menorDistancia = Infinity;
          let indiceMaisProximo = 0;
          
          linha.rota.forEach((ponto: any, index: number) => {
            const distancia = Math.sqrt(
              Math.pow(ponto.lat - pos.coordenadas.lat, 2) +
              Math.pow(ponto.lng - pos.coordenadas.lng, 2)
            );
            if (distancia < menorDistancia) {
              menorDistancia = distancia;
              indiceMaisProximo = index;
            }
          });

          // Mover para o próximo ponto
          const proximoIndice = (indiceMaisProximo + 1) % linha.rota.length;
          const proximoPonto = linha.rota[proximoIndice];

          return {
            ...pos,
            coordenadas: proximoPonto,
            timestamp: new Date(),
            ultimaAtualizacao: new Date()
          };
        })
      );
    }, 3000); // Atualizar a cada 3 segundos

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
          isMobile={true}
        />
      </div>
    </div>
  );
}

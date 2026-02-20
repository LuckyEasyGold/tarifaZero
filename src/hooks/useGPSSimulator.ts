import { useState, useEffect, useCallback, useRef } from 'react';
import type { LatLng, PosicaoOnibus, LinhaOnibus } from '@/types';

interface UseGPSSimulatorProps {
  linha: LinhaOnibus;
  velocidadeSimulacao?: number; // km/h
  intervaloAtualizacao?: number; // ms
}

interface UseGPSSimulatorReturn {
  posicao: PosicaoOnibus | null;
  progressoRota: number;
  distanciaTotal: number;
  distanciaPercorrida: number;
  tempoEstimadoChegada: number; // minutos
  paradaAtual: string | null;
  proximaParada: string | null;
  isSimulando: boolean;
  iniciarSimulacao: () => void;
  pausarSimulacao: () => void;
  reiniciarSimulacao: () => void;
}

// Calcular distância entre dois pontos em km (fórmula de Haversine)
const calcularDistancia = (p1: LatLng, p2: LatLng): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Interpolar entre dois pontos
const interpolar = (p1: LatLng, p2: LatLng, fracao: number): LatLng => {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * fracao,
    lng: p1.lng + (p2.lng - p1.lng) * fracao,
  };
};

export const useGPSSimulator = ({
  linha,
  velocidadeSimulacao = 30, // 30 km/h padrão
  intervaloAtualizacao = 1000, // 1 segundo
}: UseGPSSimulatorProps): UseGPSSimulatorReturn => {
  const [posicao, setPosicao] = useState<PosicaoOnibus | null>(null);
  const [progressoRota, setProgressoRota] = useState(0);
  const [isSimulando, setIsSimulando] = useState(false);
  const [paradaAtual, setParadaAtual] = useState<string | null>(null);
  const [proximaParada, setProximaParada] = useState<string | null>(null);
  
  const indiceSegmentoRef = useRef(0);
  const progressoSegmentoRef = useRef(0);
  const distanciasSegmentosRef = useRef<number[]>([]);
  const distanciaTotalRef = useRef(0);
  
  // Calcular distâncias dos segmentos da rota
  useEffect(() => {
    const distancias: number[] = [];
    let total = 0;
    
    for (let i = 0; i < linha.rota.length - 1; i++) {
      const dist = calcularDistancia(linha.rota[i], linha.rota[i + 1]);
      distancias.push(dist);
      total += dist;
    }
    
    distanciasSegmentosRef.current = distancias;
    distanciaTotalRef.current = total;
  }, [linha]);
  
  // Encontrar parada mais próxima
  const encontrarParadaMaisProxima = useCallback((coordAtual: LatLng): { atual: string | null, proxima: string | null } => {
    let menorDistancia = Infinity;
    let paradaMaisProxima: string | null = null;
    let indiceParada = -1;
    
    linha.paradas.forEach((parada, index) => {
      const dist = calcularDistancia(coordAtual, parada.coordenadas);
      if (dist < menorDistancia) {
        menorDistancia = dist;
        paradaMaisProxima = parada.nome;
        indiceParada = index;
      }
    });
    
    // Se estiver muito próximo de uma parada (menos de 100m), é a parada atual
    const atual = menorDistancia < 0.1 ? paradaMaisProxima : null;
    
    // Próxima parada é a seguinte na lista
    const proxima = indiceParada >= 0 && indiceParada < linha.paradas.length - 1 
      ? linha.paradas[indiceParada + 1].nome 
      : null;
    
    return { atual, proxima };
  }, [linha.paradas]);
  
  // Simulação do movimento
  useEffect(() => {
    if (!isSimulando) return;
    
    const interval = setInterval(() => {
      const distancias = distanciasSegmentosRef.current;
      const distanciaTotal = distanciaTotalRef.current;
      
      if (distanciaTotal === 0 || distancias.length === 0) return;
      
      // Calcular distância percorrida neste intervalo
      const distanciaIntervalo = velocidadeSimulacao / 3600; // km por segundo
      
      // Avançar no segmento atual
      let novoProgressoSegmento = progressoSegmentoRef.current + 
        (distanciaIntervalo / distancias[indiceSegmentoRef.current]);
      
      // Se passou para o próximo segmento
      while (novoProgressoSegmento >= 1 && indiceSegmentoRef.current < distancias.length - 1) {
        novoProgressoSegmento -= 1;
        indiceSegmentoRef.current++;
      }
      
      // Se chegou ao final da rota
      if (indiceSegmentoRef.current >= distancias.length - 1 && novoProgressoSegmento >= 1) {
        novoProgressoSegmento = 1;
        setIsSimulando(false);
      }
      
      progressoSegmentoRef.current = novoProgressoSegmento;
      
      // Calcular posição atual
      const p1 = linha.rota[indiceSegmentoRef.current];
      const p2 = linha.rota[indiceSegmentoRef.current + 1];
      const coordAtual = interpolar(p1, p2, novoProgressoSegmento);
      
      // Calcular progresso total
      let distanciaPercorrida = 0;
      for (let i = 0; i < indiceSegmentoRef.current; i++) {
        distanciaPercorrida += distancias[i];
      }
      distanciaPercorrida += distancias[indiceSegmentoRef.current] * novoProgressoSegmento;
      
      const progressoTotal = distanciaPercorrida / distanciaTotal;
      
      // Encontrar paradas
      const { atual, proxima } = encontrarParadaMaisProxima(coordAtual);
      
      // Calcular tempo até próxima parada
      let distanciaAteProximaParada = 0;
      if (proxima) {
        const indiceProxima = linha.paradas.findIndex(p => p.nome === proxima);
        if (indiceProxima >= 0) {
          const coordProxima = linha.paradas[indiceProxima].coordenadas;
          distanciaAteProximaParada = calcularDistancia(coordAtual, coordProxima);
        }
      }
      const tempoAteProximaParada = (distanciaAteProximaParada / velocidadeSimulacao) * 60;
      
      setPosicao({
        linhaId: linha.id,
        coordenadas: coordAtual,
        velocidade: velocidadeSimulacao,
        ultimaAtualizacao: new Date(),
        sentido: 'ida',
        proximaParada: proxima || undefined,
        tempoChegadaMinutos: Math.round(tempoAteProximaParada),
      });
      
      setProgressoRota(progressoTotal);
      setParadaAtual(atual);
      setProximaParada(proxima);
      
    }, intervaloAtualizacao);
    
    return () => clearInterval(interval);
  }, [isSimulando, linha, velocidadeSimulacao, intervaloAtualizacao, encontrarParadaMaisProxima]);
  
  const iniciarSimulacao = useCallback(() => {
    setIsSimulando(true);
  }, []);
  
  const pausarSimulacao = useCallback(() => {
    setIsSimulando(false);
  }, []);
  
  const reiniciarSimulacao = useCallback(() => {
    indiceSegmentoRef.current = 0;
    progressoSegmentoRef.current = 0;
    setProgressoRota(0);
    setPosicao({
      linhaId: linha.id,
      coordenadas: linha.rota[0],
      velocidade: 0,
      ultimaAtualizacao: new Date(),
      sentido: 'ida',
    });
    setParadaAtual(linha.paradas[0]?.nome || null);
    setProximaParada(linha.paradas[1]?.nome || null);
  }, [linha]);
  
  // Inicializar posição
  useEffect(() => {
    reiniciarSimulacao();
  }, [reiniciarSimulacao]);
  
  const distanciaPercorrida = progressoRota * distanciaTotalRef.current;
  const tempoEstimadoChegada = ((distanciaTotalRef.current - distanciaPercorrida) / velocidadeSimulacao) * 60;
  
  return {
    posicao,
    progressoRota,
    distanciaTotal: distanciaTotalRef.current,
    distanciaPercorrida,
    tempoEstimadoChegada,
    paradaAtual,
    proximaParada,
    isSimulando,
    iniciarSimulacao,
    pausarSimulacao,
    reiniciarSimulacao,
  };
};

export default useGPSSimulator;

import { useEffect, useRef } from 'react';
import { useGPSSimulator } from '@/hooks/useGPSSimulator';
import type { LinhaOnibus, PosicaoOnibus } from '@/types';

interface SimuladorLinhaProps {
  linha: LinhaOnibus;
  onPosicaoAtualizada: (posicao: PosicaoOnibus | null) => void;
}

const SimuladorLinha = ({ linha, onPosicaoAtualizada }: SimuladorLinhaProps) => {
  const ultimaPosicaoRef = useRef<PosicaoOnibus | null>(null);
  
  const simulador = useGPSSimulator({
    linha,
    velocidadeSimulacao: 35,
    intervaloAtualizacao: 1000,
  });

  // Iniciar simulação automaticamente
  useEffect(() => {
    simulador.reiniciarSimulacao();
    simulador.iniciarSimulacao();
  }, [simulador]);

  // Notificar quando a posição muda
  useEffect(() => {
    if (simulador.posicao !== ultimaPosicaoRef.current) {
      ultimaPosicaoRef.current = simulador.posicao;
      onPosicaoAtualizada(simulador.posicao);
    }
  }, [simulador.posicao, onPosicaoAtualizada]);

  return null;
};

export default SimuladorLinha;

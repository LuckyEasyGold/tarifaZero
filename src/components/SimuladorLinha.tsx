import { useEffect, useRef } from 'react';
import { useGPSSimulator } from '@/hooks/useGPSSimulator';
import type { LinhaOnibus, PosicaoOnibus } from '@/types';

interface SimuladorLinhaProps {
  linha: LinhaOnibus;
  onPosicaoAtualizada: (posicao: PosicaoOnibus | null) => void;
}

const SimuladorLinha = ({ linha, onPosicaoAtualizada }: SimuladorLinhaProps) => {
  const iniciouRef = useRef(false);
  
  const simulador = useGPSSimulator({
    linha,
    velocidadeSimulacao: 35,
    intervaloAtualizacao: 1000,
  });

  // Iniciar simulação apenas uma vez por linha
  useEffect(() => {
    if (!iniciouRef.current) {
      simulador.reiniciarSimulacao();
      simulador.iniciarSimulacao();
      iniciouRef.current = true;
    }
  }, [linha.id]); // Reinicia apenas quando a linha muda

  // Notificar quando a posição muda
  useEffect(() => {
    onPosicaoAtualizada(simulador.posicao);
  }, [simulador.posicao, onPosicaoAtualizada]);

  return null;
};

export default SimuladorLinha;

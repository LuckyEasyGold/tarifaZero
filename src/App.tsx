import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BusMap from '@/components/map/BusMap';
import InfoPanel from '@/components/InfoPanel';
import { todasLinhas } from '@/data/linhas';
import type { LinhaOnibus } from '@/types';
import { useGPSSimulator } from '@/hooks/useGPSSimulator';
import './App.css';

function App() {
  const [linhaSelecionada, setLinhaSelecionada] = useState<LinhaOnibus>(todasLinhas[0]);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hook de simulação GPS
  const {
    posicao,
    progressoRota,
    paradaAtual,
    proximaParada,
    isSimulando,
    iniciarSimulacao,
    pausarSimulacao,
    reiniciarSimulacao,
  } = useGPSSimulator({
    linha: linhaSelecionada,
    velocidadeSimulacao: 35,
    intervaloAtualizacao: 1000,
  });

  // Reiniciar simulação quando mudar de linha
  useEffect(() => {
    reiniciarSimulacao();
  }, [linhaSelecionada, reiniciarSimulacao]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Layout Principal */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* Mapa - Agora sem o seletor */}
          <div className={`${isMobile ? 'h-[400px]' : 'col-span-2 h-[600px]'}`}>
            <div className="bg-white rounded-xl shadow-sm border h-full overflow-hidden relative">
              <BusMap
                linha={linhaSelecionada}
                posicao={posicao}
              />
            </div>
          </div>

          {/* Painel de Informações - Agora com o seletor */}
          <div className={`${isMobile ? '' : 'col-span-1 overflow-y-auto max-h-[600px]'}`}>
            <InfoPanel
              linha={linhaSelecionada}
              posicao={posicao}
              progressoRota={progressoRota}
              paradaAtual={paradaAtual}
              proximaParada={proximaParada}
              isSimulando={isSimulando}
              onIniciar={iniciarSimulacao}
              onPausar={pausarSimulacao}
              onReiniciar={reiniciarSimulacao}
              linhas={todasLinhas}
              onSelecionarLinha={setLinhaSelecionada}
            />
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Legenda do Mapa</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: linhaSelecionada.corHex }}
              />
              <span className="text-gray-600">Ônibus em movimento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white" />
              <span className="text-gray-600">Parada de ônibus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gray-400" />
              <span className="text-gray-600">Rota completa</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-1"
                style={{ backgroundColor: linhaSelecionada.corHex }}
              />
              <span className="text-gray-600">Rota percorrida</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 Tarifa Zero - Rastreamento de Ônibus</p>
          <p className="mt-1">Dados atualizados em tempo real</p>
          <p className="mt-1">Desenvolvedor: Vinicius Ribeiro Ramos : 42 99153-2962</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
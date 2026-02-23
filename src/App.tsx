import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BusMap from '@/components/map/BusMap';
import InfoPanel from '@/components/InfoPanel';
import { todasLinhas } from '@/data/linhas';
import type { LinhaOnibus } from '@/types';
import { useGPSSimulator } from '@/hooks/useGPSSimulator';
import { Instagram, Facebook, User, ExternalLink } from 'lucide-react';
import './App.css';
// Importação correta do JSON
import apoiadoresData from '@/data/apoiadores.json';

// Tipo para os apoiadores
interface Apoiador {
  id: number;
  nome: string;
  redeSocial: string;
  tipo: 'instagram' | 'facebook' | 'outro';
}

function App() {
  const [linhaSelecionada, setLinhaSelecionada] = useState<LinhaOnibus>(todasLinhas[0]);
  const [isMobile, setIsMobile] = useState(false);
  // Use o import direto, não precisa de estado
  const [apoiadores] = useState<Apoiador[]>(apoiadoresData as Apoiador[]);

  // REMOVA este useEffect que faz fetch - não é necessário
  // useEffect(() => {
  //   fetch('/apoiadores.json')
  //     .then(res => res.json())
  //     .then(data => setApoiadores(data))
  //     .catch(err => console.error("Erro ao carregar apoiadores", err));
  // }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    posicao, progressoRota, paradaAtual, proximaParada,
    isSimulando, iniciarSimulacao, pausarSimulacao, reiniciarSimulacao,
  } = useGPSSimulator({
    linha: linhaSelecionada,
    velocidadeSimulacao: 35,
    intervaloAtualizacao: 1000,
  });

  useEffect(() => {
    reiniciarSimulacao();
  }, [linhaSelecionada, reiniciarSimulacao]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      <Header />
      <div className="bg-blue-600 py-2 border-t border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white">
          <p className="text-xs sm:text-sm font-medium animate-pulse text-center w-full sm:w-auto">
            🚀 Projeto em Expansão: Ajude a monitorar os ônibus do Tarifa Zero em Palmas!
          </p>
          {!isMobile && (
            <a href="#contribuir" className="text-xs bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-bold hover:bg-yellow-300 transition">
              Apoiar Projeto
            </a>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          <div className={`${isMobile ? 'h-[400px]' : 'col-span-2 h-[600px]'}`}>
            <div className="bg-white rounded-xl shadow-sm border h-full overflow-hidden relative z-0">
              <BusMap linha={linhaSelecionada} posicao={posicao} isMobile={isMobile} />
            </div>
          </div>

          <div className={`${isMobile ? '' : 'col-span-1 overflow-y-auto max-h-[600px]'}`}>
            <InfoPanel
              linha={linhaSelecionada} posicao={posicao} progressoRota={progressoRota}
              paradaAtual={paradaAtual} proximaParada={proximaParada} isSimulando={isSimulando}
              onIniciar={iniciarSimulacao} onPausar={pausarSimulacao} onReiniciar={reiniciarSimulacao}
              linhas={todasLinhas} onSelecionarLinha={setLinhaSelecionada}
            />
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Legenda do Mapa</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: linhaSelecionada.corHex }} />
              <span className="text-gray-600">Ônibus em movimento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white" />
              <span className="text-gray-600">Parada</span>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE DOAÇÃO */}
        <section id="contribuir" className="mt-12 bg-white rounded-xl shadow-md border-2 border-blue-100 overflow-hidden">
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <h2 className="text-xl font-bold text-blue-900">Apoie o Projeto Tarifa Zero</h2>
            <p className="text-sm text-blue-700 mt-1">Projeto independente do IFPR Palmas.</p>
          </div>
          
          <div className="p-6 grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Meta: 5 GPS ativos</span>
                <span className="text-sm font-bold text-blue-600">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: '20%' }}></div>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-xs text-green-600 font-bold">✅ 1 GPS adquirido via doação!</p>
                <p className="text-xs text-gray-500">🎯 Objetivo 1: +4 rastreadores GT06 (R$ 83,25 cada)</p>
                <p className="text-xs text-gray-500">🎯 Objetivo 2: 5 Chips M2M (R$ 150,00 total)</p>
                <p className="text-xs text-gray-500">🎯 Objetivo 3: Mensalidade dos chips (R$ 100,00 total)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">PIX para contribuição:</p>
                <p className="text-lg font-mono font-bold text-blue-700 select-all cursor-pointer">46991066464</p>
                <p className="text-[10px] text-gray-400 uppercase mt-2 tracking-widest">Vinicius Ribeiro Ramos</p>
              </div>

              {/* LISTA DE APOIADORES DINÂMICA */}
              <div className="bg-white p-4 rounded-lg border border-blue-50">
                <p className="text-xs font-bold text-blue-900 mb-3 uppercase tracking-tighter text-center">
                  Quem já contribuiu:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {apoiadores.map((apoiador) => (
                    <div key={apoiador.id} className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      {/* Ícone baseado no tipo */}
                      {apoiador.tipo === 'instagram' ? (
                        <Instagram size={14} className="text-pink-600" />
                      ) : apoiador.tipo === 'facebook' ? (
                        <Facebook size={14} className="text-blue-600" />
                      ) : (
                        <User size={14} className="text-gray-500" />
                      )}
                      
                      <span className="text-xs font-medium text-gray-700">{apoiador.nome}</span>
                      
                      {/* Link da rede social se existir */}
                      {apoiador.redeSocial && (
                        <a 
                          href={apoiador.redeSocial} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-blue-500 transition"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 mb-8 text-center text-sm text-gray-500 border-t pt-6">
          <p className="font-bold text-gray-700">© 2026 Tarifa Zero - Palmas/PR</p>
          <p className="mt-2 text-blue-600 font-medium tracking-tight uppercase text-xs">Desenvolvido por Vinicius Ribeiro Ramos</p>
          <p className="mt-1">WhatsApp: 42 99153-2962</p>
          <p className="text-xs mt-4 max-w-md mx-auto leading-relaxed">
            Projeto acadêmico sem fins lucrativos. Os valores arrecadados servirão para manutenção do projeto que tem um custo mensal. Os dados são baseados no rastreamento GPS e podem sofrer variações de acordo com o sinal.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
import { useState, useMemo } from 'react';
import { Bus, Clock, MapPin, Navigation, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SeletorLinha from '@/components/SeletorLinha';
import type { LinhaOnibus, PosicaoOnibus } from '@/types';

interface InfoPanelProps {
  linha: LinhaOnibus;
  posicao: PosicaoOnibus | null;
  progressoRota: number;
  paradaAtual: string | null;
  proximaParada: string | null;
  isSimulando: boolean;
  onIniciar: () => void;
  onPausar: () => void;
  onReiniciar: () => void;
  linhas: LinhaOnibus[];
  onSelecionarLinha: (linha: LinhaOnibus) => void;
}

const InfoPanel = ({
  linha,
  posicao,
  progressoRota,
  paradaAtual,
  proximaParada,
  isSimulando,
  onIniciar,
  onPausar,
  onReiniciar,
  linhas,
  onSelecionarLinha,
}: InfoPanelProps) => {
  const [mostrarTodasParadas, setMostrarTodasParadas] = useState(false);
  const [paradasVisiveis, setParadasVisiveis] = useState(10);

  const formatarTempo = (minutos: number): string => {
    if (minutos < 1) return '< 1 min';
    if (minutos < 60) return `${Math.round(minutos)} min`;
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}min`;
  };

  // Encontra o índice da parada atual ou próxima
  const indiceParadaAtual = useMemo(() => {
    if (paradaAtual) {
      return linha.paradas.findIndex(p => p.nome === paradaAtual);
    }
    if (proximaParada) {
      return linha.paradas.findIndex(p => p.nome === proximaParada);
    }
    return 0;
  }, [linha.paradas, paradaAtual, proximaParada]);

  // Filtra paradas para mostrar apenas as relevantes (atual, próximas e algumas anteriores)
  const paradasFiltradas = useMemo(() => {
    const totalParadas = linha.paradas.length;
    
    // Se tiver poucas paradas, mostra todas
    if (totalParadas <= 15) {
      return linha.paradas;
    }

    // Se quiser ver todas
    if (mostrarTodasParadas) {
      return linha.paradas.slice(0, paradasVisiveis);
    }

    // Mostra paradas ao redor da posição atual
    const inicio = Math.max(0, indiceParadaAtual - 2);
    const fim = Math.min(totalParadas, indiceParadaAtual + 8);
    
    return linha.paradas.slice(inicio, fim);
  }, [linha.paradas, indiceParadaAtual, mostrarTodasParadas, paradasVisiveis]);

  const totalParadas = linha.paradas.length;
  const temMaisParadas = paradasVisiveis < totalParadas;

  return (
    <div className="space-y-4">
      {/* Seletor de Linha - Agora no topo do InfoPanel */}
      <Card>
        <CardContent className="p-4">
          <SeletorLinha
            linhas={linhas}
            linhaSelecionada={linha}
            onSelecionar={onSelecionarLinha}
          />
        </CardContent>
      </Card>

      {/* Card da Linha */}
      <Card className="border-l-4" style={{ borderLeftColor: linha.corHex }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bus className="w-5 h-5" style={{ color: linha.corHex }} />
                {linha.nome}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Linha {linha.id}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className="font-mono"
              style={{ borderColor: linha.corHex, color: linha.corHex }}
            >
              {linha.intervaloMinutos} min
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Horários */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Funcionamento:</span>
            </div>
            <span className="font-medium">
              {linha.horarioInicio} - {linha.horarioFim}
            </span>
          </div>

          <Separator />

          {/* Status do Ônibus */}
          {posicao ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant={isSimulando ? "default" : "secondary"}
                  className={isSimulando ? "bg-green-500" : ""}
                >
                  {isSimulando ? 'Em movimento' : 'Parado'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Velocidade</span>
                <span className="font-medium">{posicao.velocidade} km/h</span>
              </div>

              {proximaParada && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Navigation className="w-4 h-4" />
                    Próxima parada
                  </span>
                  <span className="font-medium text-right text-sm truncate max-w-[150px]">
                    {proximaParada}
                  </span>
                </div>
              )}

              {posicao.tempoChegadaMinutos !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tempo estimado</span>
                  <span className="font-bold text-green-600">
                    {formatarTempo(posicao.tempoChegadaMinutos)}
                  </span>
                </div>
              )}

              {/* Barra de progresso */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso da rota</span>
                  <span>{Math.round(progressoRota * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${progressoRota * 100}%`,
                      backgroundColor: linha.corHex 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aguardando posição do ônibus...</p>
            </div>
          )}

          <Separator />

          {/* Controles de simulação */}
          <div className="flex gap-2">
            {!isSimulando ? (
              <Button 
                onClick={onIniciar} 
                className="flex-1"
                style={{ backgroundColor: linha.corHex }}
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </Button>
            ) : (
              <Button 
                onClick={onPausar} 
                variant="outline" 
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </Button>
            )}
            <Button 
              onClick={onReiniciar} 
              variant="outline" 
              size="icon"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de Paradas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Paradas da Linha
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {totalParadas} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paradasFiltradas.map((parada, index) => {
              const isAtual = parada.nome === paradaAtual;
              const isProxima = parada.nome === proximaParada;
              const numeroParada = mostrarTodasParadas 
                ? index + 1 
                : (totalParadas > 15 ? indiceParadaAtual - 2 + index + 1 : index + 1);
              
              return (
                <div 
                  key={parada.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isAtual ? 'bg-green-50 border border-green-200' : 
                    isProxima ? 'bg-blue-50 border border-blue-200' : 
                    'hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      isAtual ? 'bg-green-500 text-white' :
                      isProxima ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {numeroParada}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isAtual ? 'text-green-700' :
                      isProxima ? 'text-blue-700' :
                      'text-gray-900'
                    }`}>
                      {parada.nome}
                    </p>
                    {parada.horarioPrevisto && (
                      <p className="text-xs text-muted-foreground">
                        Previsto: {parada.horarioPrevisto}
                      </p>
                    )}
                  </div>
                  {isAtual && (
                    <Badge variant="outline" className="text-xs border-green-500 text-green-600 flex-shrink-0">
                      Atual
                    </Badge>
                  )}
                  {isProxima && (
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 flex-shrink-0">
                      Próxima
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botões de expansão */}
          {totalParadas > 15 && (
            <div className="mt-4 space-y-2">
              {!mostrarTodasParadas ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setMostrarTodasParadas(true)}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver mais paradas
                </Button>
              ) : (
                <>
                  {temMaisParadas && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setParadasVisiveis(prev => prev + 20)}
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Carregar mais ({paradasVisiveis} de {totalParadas})
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setMostrarTodasParadas(false);
                      setParadasVisiveis(10);
                    }}
                  >
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Mostrar menos
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoPanel;
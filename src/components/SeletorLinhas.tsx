import { Bus, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LinhaOnibus } from '@/types';

interface SeletorLinhasProps {
  linhas: LinhaOnibus[];
  linhasSelecionadas: LinhaOnibus[];
  onSelecionarLinhas: (linhas: LinhaOnibus[]) => void;
}

const SeletorLinhas = ({ linhas, linhasSelecionadas, onSelecionarLinhas }: SeletorLinhasProps) => {
  const handleToggleLinha = (linha: LinhaOnibus) => {
    const jaEstaSelected = linhasSelecionadas.some(l => l.id === linha.id);
    
    if (jaEstaSelected) {
      // Remover se já está selecionada
      onSelecionarLinhas(linhasSelecionadas.filter(l => l.id !== linha.id));
    } else {
      // Adicionar se não está selecionada
      onSelecionarLinhas([...linhasSelecionadas, linha]);
    }
  };

  return (
    <div className="space-y-4 flex gap-4">
      {/* Card da Lista de Linhas */}
      <Card className="flex flex-col justify-center items-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-gray-900">Escolher Linhas</CardTitle>
        </CardHeader>
        <CardContent className="flex overflow-hidden">
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-2">
              {linhas.map((linha) => {
                const isSelected = linhasSelecionadas.some(l => l.id === linha.id);
                
                return (
                  <button
                    key={linha.id}
                    onClick={() => handleToggleLinha(linha)}
                    className={`w-[90%] flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    style={isSelected ? { borderColor: linha.corHex, backgroundColor: `${linha.corHex}15` } : {}}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${linha.corHex}30` }}
                    >
                      <Bus className="w-5 h-5" style={{ color: linha.corHex }} />
                    </div>
                    
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{linha.nome}</p>
                      <p className="text-xs text-gray-500">
                        {linha.horarioInicio} - {linha.horarioFim} • A cada {linha.intervaloMinutos}min
                      </p>
                    </div>
                    
                    {isSelected && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: linha.corHex }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeletorLinhas;

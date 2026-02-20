import { Bus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { LinhaOnibus } from '@/types';

interface SeletorLinhaProps {
  linhas: LinhaOnibus[];
  linhaSelecionada: LinhaOnibus;
  onSelecionar: (linha: LinhaOnibus) => void;
}

const SeletorLinha = ({ linhas, linhaSelecionada, onSelecionar }: SeletorLinhaProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between h-14 px-4"
          style={{ borderColor: linhaSelecionada.corHex }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${linhaSelecionada.corHex}20` }}
            >
              <Bus className="w-5 h-5" style={{ color: linhaSelecionada.corHex }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{linhaSelecionada.nome}</p>
              <p className="text-xs text-gray-500">Selecione uma linha</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[320px]" align="start">
        {linhas.map((linha) => (
          <DropdownMenuItem
            key={linha.id}
            onClick={() => onSelecionar(linha)}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${linha.corHex}20` }}
            >
              <Bus className="w-5 h-5" style={{ color: linha.corHex }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{linha.nome}</p>
              <p className="text-xs text-gray-500">
                {linha.horarioInicio} - {linha.horarioFim} • A cada {linha.intervaloMinutos}min
              </p>
            </div>
            {linha.id === linhaSelecionada.id && (
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: linha.corHex }}
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SeletorLinha;

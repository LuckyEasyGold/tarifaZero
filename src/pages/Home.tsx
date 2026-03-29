import { useState } from 'react';
import BusMap from '@/components/map/BusMap';
import { todasLinhas } from '@/data/linhas';

export default function Home() {
  const [linhasSelecionadas] = useState(todasLinhas);

  return (
    <div className="h-screen flex flex-col">
      {/* Mapa ocupa toda a tela */}
      <div className="flex-1 relative">
        <BusMap 
          linhas={linhasSelecionadas} 
          posicoes={[]}
          isMobile={true}
        />
      </div>
    </div>
  );
}

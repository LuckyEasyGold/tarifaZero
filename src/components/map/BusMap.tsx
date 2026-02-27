import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LinhaOnibus, PosicaoOnibus } from '@/types';
import { createBusIcon, createStopIcon } from './icons';

interface BusMapProps {
  linhas: LinhaOnibus[];
  posicoes: PosicaoOnibus[];
  centro?: [number, number];
  zoom?: number;
  isMobile?: boolean;
}

// Componente para ajustar o bounds do mapa (apenas uma vez)
const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (bounds && !initializedRef.current) {
      setTimeout(() => {
        if (map && bounds) {
          map.fitBounds(bounds, { padding: [50, 50] });
          initializedRef.current = true;
        }
      }, 100);
    }
  }, [map, bounds]);
  
  return null;
};

const BusMap = ({ 
  linhas, 
  posicoes, 
  centro = [-23.5505, -46.6333], 
  zoom = 13,
  isMobile = false
}: BusMapProps) => {
  const mapRef = useRef<L.Map>(null);
  
  // Criar bounds de todas as rotas
  const bounds = useMemo(() => {
    const todasAsCoords: [number, number][] = [];
    linhas.forEach(linha => {
      linha.rota.forEach(p => {
        todasAsCoords.push([p.lat, p.lng]);
      });
    });
    
    if (todasAsCoords.length === 0) {
      return L.latLngBounds([centro, centro]);
    }
    
    return L.latLngBounds(todasAsCoords);
  }, [linhas]);
  
  // Converter coordenadas de todas as rotas para formato do Leaflet
  const rotasCoords = useMemo(() => {
    return linhas.map(linha => ({
      linha,
      coords: linha.rota.map(p => [p.lat, p.lng] as [number, number]),
    }));
  }, [linhas]);
  
  // Calcular progresso de cada rota percorrida
  const rotasPercorridas = useMemo(() => {
    return linhas.map(linha => {
      const posicaoLinha = posicoes.find(p => p.linhaId === linha.id);
      
      if (!posicaoLinha) {
        return { linha, coords: [] as [number, number][] };
      }
      
      const coords: [number, number][] = [];
      
      // Encontrar ponto atual na rota
      const posAtual = L.latLng(posicaoLinha.coordenadas.lat, posicaoLinha.coordenadas.lng);
      let menorDistancia = Infinity;
      let indiceMaisProximo = 0;
      
      linha.rota.forEach((p, i) => {
        const dist = posAtual.distanceTo(L.latLng(p.lat, p.lng));
        if (dist < menorDistancia) {
          menorDistancia = dist;
          indiceMaisProximo = i;
        }
      });
      
      // Retornar coordenadas até o ponto atual
      for (let i = 0; i <= indiceMaisProximo; i++) {
        coords.push([linha.rota[i].lat, linha.rota[i].lng]);
      }
      coords.push([posicaoLinha.coordenadas.lat, posicaoLinha.coordenadas.lng]);
      
      return { linha, coords };
    });
  }, [linhas, posicoes]);
  
  return (
    <MapContainer
      ref={mapRef}
      center={centro}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      dragging={!isMobile}
      scrollWheelZoom={!isMobile}
      touchZoom={isMobile}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <FitBounds bounds={bounds} />
      
      {/* Renderizar todas as rotas */}
      {rotasCoords.map(({ linha, coords }) => (
        <Polyline
          key={`rota-${linha.id}`}
          positions={coords}
          color="#9CA3AF"
          weight={6}
          opacity={0.5}
          dashArray="10, 10"
        />
      ))}
      
      {/* Renderizar rotas percorridas */}
      {rotasPercorridas.map(({ linha, coords }) => (
        coords.length > 0 && (
          <Polyline
            key={`percorrida-${linha.id}`}
            positions={coords}
            color={linha.corHex}
            weight={6}
            opacity={0.9}
          />
        )
      ))}
      
      {/* Renderizar todas as paradas de todas as linhas */}
      {linhas.map((linha) => (
        linha.paradas.map((parada) => (
          <Marker
            key={`parada-${linha.id}-${parada.id}`}
            position={[parada.coordenadas.lat, parada.coordenadas.lng]}
            icon={createStopIcon(linha.corHex)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{parada.nome}</h3>
                {parada.horarioPrevisto && (
                  <p className="text-sm text-gray-600 mt-1">
                    Horário previsto: <span className="font-medium">{parada.horarioPrevisto}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Linha: {linha.nome}
                </p>
              </div>
            </Popup>
          </Marker>
        ))
      ))}
      
      {/* Renderizar todos os ônibus */}
      {posicoes.map((posicao) => {
        const linha = linhas.find(l => l.id === posicao.linhaId);
        if (!linha) return null;
        
        return (
          <Marker
            key={`onibus-${posicao.linhaId}`}
            position={[posicao.coordenadas.lat, posicao.coordenadas.lng]}
            icon={createBusIcon(linha.corHex)}
            zIndexOffset={1000}
          >
            <Tooltip 
              permanent={true}
              direction="right"
              offset={[10, 0]}
              className="bg-white rounded-md shadow-md"
            >
              <div className="font-semibold text-sm" style={{ color: linha.corHex }}>
                {linha.nome}
              </div>
            </Tooltip>
            <Popup>
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: linha.corHex }}
                  />
                  <h3 className="font-bold text-gray-900">{linha.nome}</h3>
                </div>
                
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Velocidade:</span> {posicao.velocidade} km/h
                  </p>
                  
                  {posicao.proximaParada && (
                    <p className="text-gray-700">
                      <span className="font-medium">Próxima parada:</span> {posicao.proximaParada}
                    </p>
                  )}
                  
                  {posicao.tempoChegadaMinutos !== undefined && (
                    <p className="text-gray-700">
                      <span className="font-medium">Chegada em:</span>{' '}
                      <span className="text-green-600 font-semibold">
                        {posicao.tempoChegadaMinutos} min
                      </span>
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Atualizado: {posicao.ultimaAtualizacao.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default BusMap;

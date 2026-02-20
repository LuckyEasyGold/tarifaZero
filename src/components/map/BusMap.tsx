import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LinhaOnibus, PosicaoOnibus } from '@/types';
import { createBusIcon, createStopIcon } from './icons';

interface BusMapProps {
  linha: LinhaOnibus;
  posicao: PosicaoOnibus | null;
  centro?: [number, number];
  zoom?: number;
}

// Componente para ajustar o bounds do mapa
const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  
  return null;
};

// Componente para seguir o ônibus
const FollowBus = ({ posicao, shouldFollow }: { posicao: PosicaoOnibus | null; shouldFollow: boolean }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldFollow && posicao) {
      map.panTo([posicao.coordenadas.lat, posicao.coordenadas.lng], {
        animate: true,
        duration: 0.5,
      });
    }
  }, [map, posicao, shouldFollow]);
  
  return null;
};

const BusMap = ({ 
  linha, 
  posicao, 
  centro = [-23.5505, -46.6333], 
  zoom = 13 
}: BusMapProps) => {
  const mapRef = useRef<L.Map>(null);
  
  // Criar bounds da rota
  const bounds = useMemo(() => {
    const coords = linha.rota.map(p => [p.lat, p.lng] as [number, number]);
    return L.latLngBounds(coords);
  }, [linha.rota]);
  
  // Converter coordenadas da rota para formato do Leaflet
  const rotaCoords = useMemo(() => {
    return linha.rota.map(p => [p.lat, p.lng] as [number, number]);
  }, [linha.rota]);
  
  // Calcular progresso da rota percorrida
  const rotaPercorrida = useMemo(() => {
    if (!posicao) return [];
    
    const coords: [number, number][] = [];
    let distanciaTotal = 0;
    
    // Calcular distância total
    for (let i = 0; i < linha.rota.length - 1; i++) {
      const p1 = linha.rota[i];
      const p2 = linha.rota[i + 1];
      const dist = L.latLng(p1.lat, p1.lng).distanceTo(L.latLng(p2.lat, p2.lng));
      distanciaTotal += dist;
    }
    
    // Encontrar ponto atual na rota
    const posAtual = L.latLng(posicao.coordenadas.lat, posicao.coordenadas.lng);
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
    coords.push([posicao.coordenadas.lat, posicao.coordenadas.lng]);
    
    return coords;
  }, [linha.rota, posicao]);
  
  return (
    <MapContainer
      ref={mapRef}
      center={centro}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <FitBounds bounds={bounds} />
      <FollowBus posicao={posicao} shouldFollow={true} />
      
      {/* Rota completa (fundo cinza) */}
      <Polyline
        positions={rotaCoords}
        color="#9CA3AF"
        weight={6}
        opacity={0.5}
        dashArray="10, 10"
      />
      
      {/* Rota percorrida */}
      {rotaPercorrida.length > 0 && (
        <Polyline
          positions={rotaPercorrida}
          color={linha.corHex}
          weight={6}
          opacity={0.9}
        />
      )}
      
      {/* Paradas */}
      {linha.paradas.map((parada) => (
        <Marker
          key={parada.id}
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
      ))}
      
      {/* Ônibus */}
      {posicao && (
        <Marker
          position={[posicao.coordenadas.lat, posicao.coordenadas.lng]}
          icon={createBusIcon(linha.corHex)}
          zIndexOffset={1000}
        >
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
      )}
    </MapContainer>
  );
};

export default BusMap;

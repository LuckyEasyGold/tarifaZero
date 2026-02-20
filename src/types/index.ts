export interface LatLng {
  lat: number;
  lng: number;
}

export interface Parada {
  id: string;
  nome: string;
  coordenadas: LatLng;
  horarioPrevisto?: string;
}

export interface LinhaOnibus {
  id: string;
  nome: string;
  cor: string;
  corHex: string;
  rota: LatLng[];
  paradas: Parada[];
  horarioInicio: string;
  horarioFim: string;
  intervaloMinutos: number;
}

export interface PosicaoOnibus {
  linhaId: string;
  coordenadas: LatLng;
  velocidade: number;
  ultimaAtualizacao: Date;
  sentido: 'ida' | 'volta';
  proximaParada?: string;
  tempoChegadaMinutos?: number;
}

export interface Rua {
  nome: string;
  coordenadas: LatLng[];
}

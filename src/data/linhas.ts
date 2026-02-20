import type { LinhaOnibus } from '@/types';

// ================================
// IMPORTAÇÃO DAS ROTAS (JSON)
// ================================
import rotaL001 from '@/data/rotaL001.json';
import paradasL001 from '@/data/paradasL001.json';

import rotaL002 from '@/data/rotaL002.json';
import paradasL002 from '@/data/paradasL002.json';

import rotaL003 from '@/data/rotaL003.json';
import paradasL003 from '@/data/paradasL003.json';

import rotaL004 from '@/data/rotaL004.json';
import paradasL004 from '@/data/paradasL004.json';

import rotaL005 from '@/data/rotaL005.json';
import paradasL005 from '@/data/paradasL005.json';


// ================================
// LINHA 1 - Eldorado / IFPR
// ================================
export const linha1: LinhaOnibus = {
  id: 'L001',
  nome: 'Linha 001 - Eldorado / IFPR',
  cor: 'blue',
  corHex: '#3B82F6',
  horarioInicio: '06:45',
  horarioFim: '23:45',
  intervaloMinutos: 60,
  rota: rotaL001,
  paradas: paradasL001,
};

// ================================
// LINHA 2 - (Aguardando dados)
// ================================
export const linha2: LinhaOnibus = {
  id: 'L002',
  nome: 'Linha 002 - Tia Joanoa / Terminal Rodoviário',
  cor: 'green',
  corHex: '#10B981',
  horarioInicio: '05:30',
  horarioFim: '22:30',
  intervaloMinutos: 25,
  rota: rotaL002.length > 0 ? rotaL002 : [{ lat: -26.48417, lng: -51.99056 }],
  paradas: paradasL002.length > 0 ? paradasL002 : [{
    id: 'P001',
    nome: 'Aguardando dados da rota',
    coordenadas: { lat: -26.48417, lng: -51.99056 },
    horarioPrevisto: ''
  }],
};

// ================================
// LINHA 3 - (Aguardando dados)
// ================================
export const linha3: LinhaOnibus = {
  id: 'L003',
  nome: 'Linha 003 - Fortunato / Terminal Rodoviário',
  cor: 'red',
  corHex: '#EF4444',
  horarioInicio: '06:00',
  horarioFim: '00:00',
  intervaloMinutos: 15,
  rota: rotaL003.length > 0 ? rotaL003 : [{ lat: -26.48417, lng: -51.99056 }],
  paradas: paradasL003.length > 0 ? paradasL003 : [{
    id: 'P001',
    nome: 'Aguardando dados da rota',
    coordenadas: { lat: -26.48417, lng: -51.99056 },
    horarioPrevisto: ''
  }],
};

// ================================
// LINHA 4 - (Aguardando dados)
// ================================
export const linha4: LinhaOnibus = {
  id: 'L004',
  nome: 'Linha 004 - Vila Rural / Terminal Rodoviário',
  cor: 'purple',
  corHex: '#8B5CF6',
  horarioInicio: '05:00',
  horarioFim: '21:00',
  intervaloMinutos: 30,
  rota: rotaL004.length > 0 ? rotaL004 : [{ lat: -26.48417, lng: -51.99056 }],
  paradas: paradasL004.length > 0 ? paradasL004 : [{
    id: 'P001',
    nome: 'Aguardando dados da rota',
    coordenadas: { lat: -26.48417, lng: -51.99056 },
    horarioPrevisto: ''
  }],
};

// ================================
// LINHA 5 - (Aguardando dados)
// ================================
export const linha5: LinhaOnibus = {
  id: 'L005',
  nome: 'Linha 005 - Lagoão / Insana',
  cor: 'orange',
  corHex: '#F59E0B',
  horarioInicio: '06:00',
  horarioFim: '21:00',
  intervaloMinutos: 40,
  rota: rotaL005.length > 0 ? rotaL005 : [{ lat: -26.48417, lng: -51.99056 }],
  paradas: paradasL005.length > 0 ? paradasL005 : [{
    id: 'P001',
    nome: 'Aguardando dados da rota',
    coordenadas: { lat: -26.48417, lng: -51.99056 },
    horarioPrevisto: ''
  }],
};


// ================================
// EXPORTAÇÃO
// ================================
export const todasLinhas: LinhaOnibus[] = [
  linha1,
  linha2,
  linha3,
  linha4,
  linha5
];

export const getLinhaById = (id: string): LinhaOnibus | undefined => {
  return todasLinhas.find(linha => linha.id === id);
};

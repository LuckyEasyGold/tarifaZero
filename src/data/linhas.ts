import type { LinhaOnibus } from '@/types';

// ============================================================
// COORDENADAS BASE: PALMAS - PR
// Centro da cidade: Praça Central
// ============================================================
const PALMAS_LAT = -26.48417;
const PALMAS_LNG = -51.99056;

// ============================================================
// COMO CRIAR SUAS ROTAS REAIS:
// 
// 1. Abra o Google Maps: https://maps.google.com
// 2. Clique com botão direito no ponto de partida → "O que há aqui?"
// 3. Copie as coordenadas (aparecem no fundo da tela)
// 4. Cole aqui no formato: { lat: -26.48417, lng: -51.99056 }
// 5. Faça isso para cada ponto da rota (cada esquina/virada)
// 6. Adicione as paradas com nomes dos pontos de ônibus
// ============================================================

// ============================================================
// LINHA 1: EXEMPLO - Centro - Bairro (SUBSTITUA COM SUAS COORDENADAS)
// ============================================================
export const linha1: LinhaOnibus = {
  id: 'L001',
  nome: 'Centro - Bairro Industrial',
  cor: 'blue',
  corHex: '#3B82F6',
  horarioInicio: '05:00',
  horarioFim: '23:00',
  intervaloMinutos: 20,
  rota: [
    // PONTO INICIAL: Terminal Centro (exemplo)
    { lat: PALMAS_LAT, lng: PALMAS_LNG },
    // Adicione mais pontos seguindo a rua...
    { lat: PALMAS_LAT + 0.001, lng: PALMAS_LNG + 0.002 },
    { lat: PALMAS_LAT + 0.002, lng: PALMAS_LNG + 0.004 },
    { lat: PALMAS_LAT + 0.003, lng: PALMAS_LNG + 0.006 },
    { lat: PALMAS_LAT + 0.004, lng: PALMAS_LNG + 0.008 },
    { lat: PALMAS_LAT + 0.005, lng: PALMAS_LNG + 0.010 },
    // PONTO FINAL
    { lat: PALMAS_LAT + 0.006, lng: PALMAS_LNG + 0.012 },
  ],
  paradas: [
    { 
      id: 'P001', 
      nome: 'Terminal Centro', 
      coordenadas: { lat: PALMAS_LAT, lng: PALMAS_LNG }, 
      horarioPrevisto: '05:00' 
    },
    { 
      id: 'P002', 
      nome: 'Praça Central', 
      coordenadas: { lat: PALMAS_LAT + 0.002, lng: PALMAS_LNG + 0.004 }, 
      horarioPrevisto: '05:05' 
    },
    { 
      id: 'P003', 
      nome: 'Rua Principal', 
      coordenadas: { lat: PALMAS_LAT + 0.004, lng: PALMAS_LNG + 0.008 }, 
      horarioPrevisto: '05:12' 
    },
    { 
      id: 'P004', 
      nome: 'Bairro Industrial', 
      coordenadas: { lat: PALMAS_LAT + 0.006, lng: PALMAS_LNG + 0.012 }, 
      horarioPrevisto: '05:20' 
    },
  ],
};

// ============================================================
// LINHA 2: EXEMPLO - Terminal Norte - Shopping
// ============================================================
export const linha2: LinhaOnibus = {
  id: 'L002',
  nome: 'Terminal Norte - Shopping',
  cor: 'green',
  corHex: '#10B981',
  horarioInicio: '05:30',
  horarioFim: '22:30',
  intervaloMinutos: 25,
  rota: [
    { lat: PALMAS_LAT + 0.008, lng: PALMAS_LNG - 0.015 },
    { lat: PALMAS_LAT + 0.007, lng: PALMAS_LNG - 0.012 },
    { lat: PALMAS_LAT + 0.006, lng: PALMAS_LNG - 0.009 },
    { lat: PALMAS_LAT + 0.005, lng: PALMAS_LNG - 0.006 },
    { lat: PALMAS_LAT + 0.004, lng: PALMAS_LNG - 0.003 },
    { lat: PALMAS_LAT + 0.003, lng: PALMAS_LNG },
    { lat: PALMAS_LAT + 0.002, lng: PALMAS_LNG + 0.003 },
    { lat: PALMAS_LAT + 0.001, lng: PALMAS_LNG + 0.006 },
    { lat: PALMAS_LAT, lng: PALMAS_LNG + 0.009 },
    { lat: PALMAS_LAT - 0.001, lng: PALMAS_LNG + 0.012 },
  ],
  paradas: [
    { 
      id: 'P005', 
      nome: 'Terminal Norte', 
      coordenadas: { lat: PALMAS_LAT + 0.008, lng: PALMAS_LNG - 0.015 }, 
      horarioPrevisto: '05:30' 
    },
    { 
      id: 'P006', 
      nome: 'Avenida Brasil', 
      coordenadas: { lat: PALMAS_LAT + 0.005, lng: PALMAS_LNG - 0.006 }, 
      horarioPrevisto: '05:38' 
    },
    { 
      id: 'P007', 
      nome: 'Centro', 
      coordenadas: { lat: PALMAS_LAT + 0.003, lng: PALMAS_LNG }, 
      horarioPrevisto: '05:45' 
    },
    { 
      id: 'P008', 
      nome: 'Shopping Palmas', 
      coordenadas: { lat: PALMAS_LAT - 0.001, lng: PALMAS_LNG + 0.012 }, 
      horarioPrevisto: '05:55' 
    },
  ],
};

// ============================================================
// LINHA 3: EXEMPLO - Bairro Sul - Universidade
// ============================================================
export const linha3: LinhaOnibus = {
  id: 'L003',
  nome: 'Bairro Sul - Universidade',
  cor: 'red',
  corHex: '#EF4444',
  horarioInicio: '06:00',
  horarioFim: '00:00',
  intervaloMinutos: 15,
  rota: [
    { lat: PALMAS_LAT - 0.010, lng: PALMAS_LNG - 0.008 },
    { lat: PALMAS_LAT - 0.008, lng: PALMAS_LNG - 0.006 },
    { lat: PALMAS_LAT - 0.006, lng: PALMAS_LNG - 0.004 },
    { lat: PALMAS_LAT - 0.004, lng: PALMAS_LNG - 0.002 },
    { lat: PALMAS_LAT - 0.002, lng: PALMAS_LNG },
    { lat: PALMAS_LAT, lng: PALMAS_LNG + 0.002 },
    { lat: PALMAS_LAT + 0.002, lng: PALMAS_LNG + 0.004 },
    { lat: PALMAS_LAT + 0.004, lng: PALMAS_LNG + 0.006 },
    { lat: PALMAS_LAT + 0.006, lng: PALMAS_LNG + 0.008 },
    { lat: PALMAS_LAT + 0.008, lng: PALMAS_LNG + 0.010 },
  ],
  paradas: [
    { 
      id: 'P009', 
      nome: 'Bairro Sul', 
      coordenadas: { lat: PALMAS_LAT - 0.010, lng: PALMAS_LNG - 0.008 }, 
      horarioPrevisto: '06:00' 
    },
    { 
      id: 'P010', 
      nome: 'Mercado Municipal', 
      coordenadas: { lat: PALMAS_LAT - 0.006, lng: PALMAS_LNG - 0.004 }, 
      horarioPrevisto: '06:08' 
    },
    { 
      id: 'P011', 
      nome: 'Centro (Transferência)', 
      coordenadas: { lat: PALMAS_LAT, lng: PALMAS_LNG }, 
      horarioPrevisto: '06:15' 
    },
    { 
      id: 'P012', 
      nome: 'Universidade', 
      coordenadas: { lat: PALMAS_LAT + 0.008, lng: PALMAS_LNG + 0.010 }, 
      horarioPrevisto: '06:25' 
    },
  ],
};

// ============================================================
// LINHA 4: EXEMPLO - Jardim das Acácias - Centro Esportivo
// ============================================================
export const linha4: LinhaOnibus = {
  id: 'L004',
  nome: 'Jardim das Acácias - Centro Esportivo',
  cor: 'purple',
  corHex: '#8B5CF6',
  horarioInicio: '05:00',
  horarioFim: '21:00',
  intervaloMinutos: 30,
  rota: [
    { lat: PALMAS_LAT + 0.003, lng: PALMAS_LNG - 0.012 },
    { lat: PALMAS_LAT + 0.004, lng: PALMAS_LNG - 0.010 },
    { lat: PALMAS_LAT + 0.005, lng: PALMAS_LNG - 0.008 },
    { lat: PALMAS_LAT + 0.006, lng: PALMAS_LNG - 0.006 },
    { lat: PALMAS_LAT + 0.007, lng: PALMAS_LNG - 0.004 },
    { lat: PALMAS_LAT + 0.008, lng: PALMAS_LNG - 0.002 },
    { lat: PALMAS_LAT + 0.009, lng: PALMAS_LNG },
    { lat: PALMAS_LAT + 0.010, lng: PALMAS_LNG + 0.002 },
    { lat: PALMAS_LAT + 0.011, lng: PALMAS_LNG + 0.004 },
    { lat: PALMAS_LAT + 0.012, lng: PALMAS_LNG + 0.006 },
  ],
  paradas: [
    { 
      id: 'P013', 
      nome: 'Jardim das Acácias', 
      coordenadas: { lat: PALMAS_LAT + 0.003, lng: PALMAS_LNG - 0.012 }, 
      horarioPrevisto: '05:00' 
    },
    { 
      id: 'P014', 
      nome: 'Rua das Flores', 
      coordenadas: { lat: PALMAS_LAT + 0.005, lng: PALMAS_LNG - 0.008 }, 
      horarioPrevisto: '05:08' 
    },
    { 
      id: 'P015', 
      nome: 'Avenida Central', 
      coordenadas: { lat: PALMAS_LAT + 0.008, lng: PALMAS_LNG - 0.002 }, 
      horarioPrevisto: '05:15' 
    },
    { 
      id: 'P016', 
      nome: 'Centro Esportivo', 
      coordenadas: { lat: PALMAS_LAT + 0.012, lng: PALMAS_LNG + 0.006 }, 
      horarioPrevisto: '05:22' 
    },
  ],
};

// ============================================================
// LINHA 5: EXEMPLO - Vila Nova - Parque Tecnológico (Expresso)
// ============================================================
export const linha5: LinhaOnibus = {
  id: 'L005',
  nome: 'Vila Nova - Parque Tecnológico (Expresso)',
  cor: 'orange',
  corHex: '#F59E0B',
  horarioInicio: '06:00',
  horarioFim: '21:00',
  intervaloMinutos: 40,
  rota: [
    { lat: PALMAS_LAT - 0.008, lng: PALMAS_LNG + 0.015 },
    { lat: PALMAS_LAT - 0.006, lng: PALMAS_LNG + 0.013 },
    { lat: PALMAS_LAT - 0.004, lng: PALMAS_LNG + 0.011 },
    { lat: PALMAS_LAT - 0.002, lng: PALMAS_LNG + 0.009 },
    { lat: PALMAS_LAT, lng: PALMAS_LNG + 0.007 },
    { lat: PALMAS_LAT + 0.002, lng: PALMAS_LNG + 0.005 },
    { lat: PALMAS_LAT + 0.004, lng: PALMAS_LNG + 0.003 },
    { lat: PALMAS_LAT + 0.006, lng: PALMAS_LNG + 0.001 },
    { lat: PALMAS_LAT + 0.008, lng: PALMAS_LNG - 0.001 },
    { lat: PALMAS_LAT + 0.010, lng: PALMAS_LNG - 0.003 },
  ],
  paradas: [
    { 
      id: 'P017', 
      nome: 'Vila Nova', 
      coordenadas: { lat: PALMAS_LAT - 0.008, lng: PALMAS_LNG + 0.015 }, 
      horarioPrevisto: '06:00' 
    },
    { 
      id: 'P018', 
      nome: 'Avenida Expressa', 
      coordenadas: { lat: PALMAS_LAT - 0.004, lng: PALMAS_LNG + 0.011 }, 
      horarioPrevisto: '06:07' 
    },
    { 
      id: 'P019', 
      nome: 'Centro (Rápido)', 
      coordenadas: { lat: PALMAS_LAT, lng: PALMAS_LNG + 0.007 }, 
      horarioPrevisto: '06:12' 
    },
    { 
      id: 'P020', 
      nome: 'Parque Tecnológico', 
      coordenadas: { lat: PALMAS_LAT + 0.010, lng: PALMAS_LNG - 0.003 }, 
      horarioPrevisto: '06:22' 
    },
  ],
};

// ============================================================
// EXPORTAÇÃO DAS LINHAS
// ============================================================
export const todasLinhas: LinhaOnibus[] = [linha1, linha2, linha3, linha4, linha5];

// Exportar linha por ID
export const getLinhaById = (id: string): LinhaOnibus | undefined => {
  return todasLinhas.find(linha => linha.id === id);
};

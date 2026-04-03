/**
 * Script para importar horários do arquivo horario.json
 * 
 * Uso:
 * tsx scripts/import-horarios.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface HorarioData {
  transporte_palmas: {
    linhas: Array<{
      id: string;
      nome: string;
      horarios: any[];
      itinerario_ida: string[];
      itinerario_volta: string[];
    }>;
  };
}

/**
 * Geocodificar endereço usando Nominatim (OpenStreetMap) - GRATUITO!
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // Usar Nominatim (OpenStreetMap) - gratuito e sem burocracia
  const fullAddress = `${address}, Palmas, Paraná, Brasil`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TarifaZero-App/1.0' // Nominatim requer User-Agent
      }
    });
    const data = await response.json();

    if (data.length > 0) {
      const location = data[0];
      console.log(`  ✅ ${address} -> (${parseFloat(location.lat).toFixed(6)}, ${parseFloat(location.lon).toFixed(6)})`);
      return { lat: parseFloat(location.lat), lng: parseFloat(location.lon) };
    } else {
      console.warn(`  ⚠️  Não encontrado: ${address}, usando coordenadas aproximadas`);
      return {
        lat: -26.4844 + (Math.random() - 0.5) * 0.02,
        lng: -49.0761 + (Math.random() - 0.5) * 0.02
      };
    }
  } catch (error) {
    console.error(`  ❌ Erro ao geocodificar ${address}:`, error);
    return {
      lat: -26.4844 + (Math.random() - 0.5) * 0.02,
      lng: -49.0761 + (Math.random() - 0.5) * 0.02
    };
  }
}

/**
 * Criar rota usando OpenRouteService (alternativa gratuita ao Google)
 */
async function createRoutePoints(streets: string[]): Promise<Array<{ lat: number; lng: number }> | null> {
  if (streets.length < 2) return null;

  // Usar Nominatim para geocodificar as ruas e criar rota simples
  const points: Array<{ lat: number; lng: number }> = [];

  for (const street of streets) {
    const coords = await geocodeAddress(street);
    if (coords) {
      points.push(coords);
    }
    // Delay para respeitar rate limit do Nominatim (1 req/sec)
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  return points.length > 0 ? points : null;
}

/**
 * Extrair paradas únicas dos horários
 */
function extractStops(horarios: any[]): string[] {
  const stops = new Set<string>();
  
  horarios.forEach(h => {
    Object.keys(h).forEach(key => {
      if (key.includes('saida_') || key.includes('chegada_')) {
        const stopName = key
          .replace('saida_', '')
          .replace('chegada_', '')
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        stops.add(stopName);
      }
    });
  });

  return Array.from(stops);
}

/**
 * Importar uma linha
 */
async function importLine(lineData: any) {
  const lineCode = `L${lineData.id.padStart(3, '0')}`;
  console.log(`\n📋 Importando: ${lineCode} - ${lineData.nome}`);

  // 1. Criar/atualizar linha
  const line = await prisma.line.upsert({
    where: { code: lineCode },
    update: {
      name: `Linha ${lineData.id} - ${lineData.nome}`,
    },
    create: {
      code: lineCode,
      name: `Linha ${lineData.id} - ${lineData.nome}`,
      color: ['blue', 'green', 'red', 'purple', 'orange'][parseInt(lineData.id) - 1] || 'blue',
      colorHex: ['#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'][parseInt(lineData.id) - 1] || '#3B82F6',
      startTime: lineData.horarios[0] ? Object.values(lineData.horarios[0])[0] as string : '06:00',
      endTime: lineData.horarios[lineData.horarios.length - 1] ? Object.values(lineData.horarios[lineData.horarios.length - 1]).slice(-1)[0] as string : '23:00',
      intervalMin: 60,
      active: true,
    },
  });

  console.log(`✅ Linha criada: ${line.id}`);

  // 2. Extrair e geocodificar paradas
  const stopNames = extractStops(lineData.horarios);
  console.log(`\n📍 Geocodificando ${stopNames.length} paradas...`);

  const stops: any[] = [];
  for (let i = 0; i < stopNames.length; i++) {
    const stopName = stopNames[i];
    
    // Tentar geocodificar usando ruas do itinerário
    let coords = null;
    const relatedStreet = lineData.itinerario_ida.find((street: string) => 
      street.toLowerCase().includes(stopName.toLowerCase()) ||
      stopName.toLowerCase().includes(street.toLowerCase().split(' ').pop() || '')
    );

    if (relatedStreet) {
      coords = await geocodeAddress(relatedStreet);
    }

    if (!coords) {
      coords = await geocodeAddress(stopName);
    }

    if (coords) {
      const stop = await prisma.stop.upsert({
        where: { code: `${lineCode}-${i + 1}` },
        update: {
          name: stopName,
          lat: coords.lat,
          lng: coords.lng,
        },
        create: {
          lineId: line.id,
          code: `${lineCode}-${i + 1}`,
          name: stopName,
          lat: coords.lat,
          lng: coords.lng,
          description: relatedStreet || null,
        },
      });

      stops.push({ ...stop, originalName: stopName });
    }

    // Delay para não exceder rate limit
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`✅ ${stops.length} paradas criadas`);

  // 3. Importar horários programados
  console.log(`\n⏰ Importando horários...`);
  let horariosCount = 0;

  for (const horario of lineData.horarios) {
    const entries = Object.entries(horario);
    
    for (const [key, time] of entries) {
      const isIda = key.includes('saida_') || key.includes('chegada_');
      const stopNameKey = key.replace('saida_', '').replace('chegada_', '');
      const stopName = stopNameKey.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      const stop = stops.find(s => s.originalName === stopName);
      
      if (stop && time) {
        await prisma.scheduledTime.create({
          data: {
            lineId: line.id,
            stopId: stop.id,
            time: time as string,
            dayOfWeek: 'weekday',
            direction: 'ida',
            active: true,
          },
        });
        horariosCount++;
      }
    }
  }

  console.log(`✅ ${horariosCount} horários importados`);

  // 4. Criar rotas
  console.log(`\n🗺️  Criando rotas...`);
  
  // Rota de ida
  const routePointsIda = await createRoutePoints(lineData.itinerario_ida);
  if (routePointsIda) {
    await prisma.route.deleteMany({ where: { lineId: line.id, direction: 'ida' } });
    
    const routeIda = await prisma.route.create({
      data: {
        lineId: line.id,
        direction: 'ida',
        name: 'Ida',
      },
    });

    for (let i = 0; i < routePointsIda.length; i++) {
      await prisma.routePoint.create({
        data: {
          routeId: routeIda.id,
          lat: routePointsIda[i].lat,
          lng: routePointsIda[i].lng,
          sequence: i,
        },
      });
    }

    console.log(`  ✅ Rota IDA: ${routePointsIda.length} pontos`);
  }

  // Rota de volta
  const routePointsVolta = await createRoutePoints(lineData.itinerario_volta);
  if (routePointsVolta) {
    await prisma.route.deleteMany({ where: { lineId: line.id, direction: 'volta' } });
    
    const routeVolta = await prisma.route.create({
      data: {
        lineId: line.id,
        direction: 'volta',
        name: 'Volta',
      },
    });

    for (let i = 0; i < routePointsVolta.length; i++) {
      await prisma.routePoint.create({
        data: {
          routeId: routeVolta.id,
          lat: routePointsVolta[i].lat,
          lng: routePointsVolta[i].lng,
          sequence: i,
        },
      });
    }

    console.log(`  ✅ Rota VOLTA: ${routePointsVolta.length} pontos`);
  }

  console.log(`\n✅ Linha ${lineCode} importada com sucesso!`);
}

async function main() {
  console.log('🚀 Iniciando importação de horários...\n');

  // Ler arquivo JSON
  const data: HorarioData = JSON.parse(fs.readFileSync('horario.json', 'utf-8'));

  console.log(`📦 Encontradas ${data.transporte_palmas.linhas.length} linhas\n`);

  // Importar cada linha
  for (const lineData of data.transporte_palmas.linhas) {
    await importLine(lineData);
  }

  console.log('\n✅ Importação concluída!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Verifique os dados no banco: npx prisma studio');
  console.log('2. Teste o app para ver as rotas e horários');
  console.log('3. Ajuste coordenadas manualmente se necessário');
}

// Executar
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

export { importLine };

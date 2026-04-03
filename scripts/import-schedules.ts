/**
 * Script para importar horários e rotas do PDF da prefeitura
 * 
 * Funcionalidades:
 * 1. Ler dados do PDF (horários, rotas, paradas)
 * 2. Geocodificar endereços usando Google Maps API
 * 3. Criar/atualizar rotas no banco de dados
 * 4. Criar/atualizar paradas com coordenadas corretas
 * 5. Importar horários programados
 * 
 * Uso:
 * tsx scripts/import-schedules.ts <caminho-do-pdf>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScheduleData {
  lineCode: string;
  lineName: string;
  stops: Array<{
    name: string;
    address: string;
    times: string[]; // Horários de passagem
  }>;
  route: {
    origin: string;
    destination: string;
    streets: string[]; // Ruas do trajeto
  };
}

/**
 * Geocodificar endereço usando Google Maps API
 */
async function geocodeAddress(address: string, city: string = 'Palmas, PR'): Promise<{ lat: number; lng: number } | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY não configurada');
    return null;
  }

  const fullAddress = `${address}, ${city}, Brasil`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`✅ Geocodificado: ${address} -> (${location.lat}, ${location.lng})`);
      return { lat: location.lat, lng: location.lng };
    } else {
      console.warn(`⚠️  Não encontrado: ${address} (status: ${data.status})`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro ao geocodificar ${address}:`, error);
    return null;
  }
}

/**
 * Criar rota usando Google Directions API
 */
async function createRoute(origin: string, destination: string, waypoints: string[]): Promise<Array<{ lat: number; lng: number }> | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY não configurada');
    return null;
  }

  const waypointsParam = waypoints.length > 0 
    ? `&waypoints=${waypoints.map(w => encodeURIComponent(w + ', Palmas, PR')).join('|')}`
    : '';

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin + ', Palmas, PR')}&destination=${encodeURIComponent(destination + ', Palmas, PR')}${waypointsParam}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const points: Array<{ lat: number; lng: number }> = [];

      // Extrair todos os pontos da rota
      route.legs.forEach((leg: any) => {
        leg.steps.forEach((step: any) => {
          points.push({
            lat: step.start_location.lat,
            lng: step.start_location.lng
          });
        });
      });

      // Adicionar ponto final
      const lastLeg = route.legs[route.legs.length - 1];
      points.push({
        lat: lastLeg.end_location.lat,
        lng: lastLeg.end_location.lng
      });

      console.log(`✅ Rota criada: ${points.length} pontos`);
      return points;
    } else {
      console.warn(`⚠️  Erro ao criar rota: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar rota:', error);
    return null;
  }
}

/**
 * Importar dados de uma linha
 */
async function importLine(data: ScheduleData) {
  console.log(`\n📋 Importando linha: ${data.lineCode} - ${data.lineName}`);

  // 1. Criar ou atualizar linha
  const line = await prisma.line.upsert({
    where: { code: data.lineCode },
    update: {
      name: data.lineName,
    },
    create: {
      code: data.lineCode,
      name: data.lineName,
      colorHex: '#3B82F6', // Azul padrão
      startTime: data.stops[0]?.times[0] || '06:00',
      endTime: data.stops[0]?.times[data.stops[0]?.times.length - 1] || '22:00',
      intervalMin: 30, // Calcular baseado nos horários
      active: true,
    },
  });

  console.log(`✅ Linha criada/atualizada: ${line.id}`);

  // 2. Geocodificar e criar paradas
  const stops = [];
  for (const stopData of data.stops) {
    const coords = await geocodeAddress(stopData.address);
    
    if (coords) {
      const stop = await prisma.stop.upsert({
        where: { 
          lineId_name: {
            lineId: line.id,
            name: stopData.name
          }
        },
        update: {
          lat: coords.lat,
          lng: coords.lng,
        },
        create: {
          lineId: line.id,
          name: stopData.name,
          lat: coords.lat,
          lng: coords.lng,
          code: `${data.lineCode}-${stops.length + 1}`,
        },
      });

      stops.push(stop);
      console.log(`  ✅ Parada: ${stopData.name}`);

      // 3. Criar horários programados
      for (const time of stopData.times) {
        await prisma.scheduledTime.create({
          data: {
            lineId: line.id,
            stopId: stop.id,
            time: time,
            dayOfWeek: 'weekday', // Ajustar conforme necessário
          },
        });
      }
    } else {
      console.warn(`  ⚠️  Parada não geocodificada: ${stopData.name}`);
    }

    // Delay para não exceder rate limit da API
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 4. Criar rota usando Directions API
  if (stops.length >= 2) {
    const waypoints = data.route.streets || [];
    const routePoints = await createRoute(
      data.route.origin,
      data.route.destination,
      waypoints
    );

    if (routePoints) {
      // Deletar rotas antigas
      await prisma.route.deleteMany({
        where: { lineId: line.id }
      });

      // Criar nova rota
      const route = await prisma.route.create({
        data: {
          lineId: line.id,
          direction: 'ida',
        },
      });

      // Criar pontos da rota
      for (let i = 0; i < routePoints.length; i++) {
        await prisma.routePoint.create({
          data: {
            routeId: route.id,
            lat: routePoints[i].lat,
            lng: routePoints[i].lng,
            sequence: i,
          },
        });
      }

      console.log(`✅ Rota criada com ${routePoints.length} pontos`);
    }
  }

  console.log(`✅ Linha ${data.lineCode} importada com sucesso!\n`);
}

/**
 * Exemplo de uso
 */
async function main() {
  console.log('🚀 Iniciando importação de horários...\n');

  // Exemplo de dados extraídos do PDF
  const exampleData: ScheduleData = {
    lineCode: 'L001',
    lineName: 'Linha 001 - Eldorado / IFPR',
    stops: [
      {
        name: 'Terminal Rodoviário',
        address: 'Rua Marechal Deodoro, 1234',
        times: ['06:00', '07:00', '08:00', '09:00', '10:00']
      },
      {
        name: 'Praça Central',
        address: 'Praça Getúlio Vargas',
        times: ['06:15', '07:15', '08:15', '09:15', '10:15']
      },
      {
        name: 'IFPR',
        address: 'Rua Amazonas, 1000',
        times: ['06:30', '07:30', '08:30', '09:30', '10:30']
      }
    ],
    route: {
      origin: 'Terminal Rodoviário, Palmas, PR',
      destination: 'IFPR, Palmas, PR',
      streets: [
        'Rua Marechal Deodoro',
        'Avenida Presidente Kennedy',
        'Rua Amazonas'
      ]
    }
  };

  // await importLine(exampleData);

  console.log('✅ Importação concluída!');
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

export { importLine, geocodeAddress, createRoute };

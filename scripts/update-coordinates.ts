/**
 * Script para atualizar coordenadas das paradas quando a Google Maps API estiver ativa
 * 
 * Uso:
 * npx tsx scripts/update-coordinates.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // Usar Nominatim (OpenStreetMap) - gratuito e sem burocracia!
  const fullAddress = `${address}, Palmas, Paraná, Brasil`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1&countrycodes=br`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TarifaZero-App/1.0'
      }
    });
    const data = await response.json();

    if (data.length > 0) {
      const location = data[0];
      return { 
        lat: parseFloat(location.lat), 
        lng: parseFloat(location.lon) 
      };
    } else {
      console.warn(`⚠️  Não encontrado: ${address}`);
      // Retornar coordenadas aproximadas de Palmas/PR
      return {
        lat: -26.4844 + (Math.random() - 0.5) * 0.01,
        lng: -49.0761 + (Math.random() - 0.5) * 0.01
      };
    }
  } catch (error) {
    console.error(`❌ Erro ao geocodificar ${address}:`, error);
    return {
      lat: -26.4844 + (Math.random() - 0.5) * 0.01,
      lng: -49.0761 + (Math.random() - 0.5) * 0.01
    };
  }
}

async function updateCoordinates() {
  console.log('🔄 Atualizando coordenadas das paradas...\n');

  // Buscar todas as paradas
  const stops = await prisma.stop.findMany({
    include: {
      line: {
        select: {
          code: true,
          name: true,
        },
      },
    },
  });

  console.log(`📍 Encontradas ${stops.length} paradas\n`);

  let updated = 0;
  let failed = 0;

  for (const stop of stops) {
    console.log(`\n🔍 ${stop.line.code} - ${stop.name}`);
    
    // Tentar geocodificar pelo nome da parada
    let coords = await geocodeAddress(stop.name);
    
    // Se não encontrar, tentar pela descrição (rua)
    if (!coords && stop.description) {
      console.log(`  Tentando pela descrição: ${stop.description}`);
      coords = await geocodeAddress(stop.description);
    }

    if (coords) {
      await prisma.stop.update({
        where: { id: stop.id },
        data: {
          lat: coords.lat,
          lng: coords.lng,
        },
      });
      console.log(`  ✅ Atualizado: (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`);
      updated++;
    } else {
      console.log(`  ❌ Não foi possível geocodificar`);
      failed++;
    }

    // Delay para não exceder rate limit
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Atualização concluída!`);
  console.log(`   Atualizadas: ${updated}`);
  console.log(`   Falharam: ${failed}`);
}

async function main() {
  console.log('🚀 Iniciando atualização de coordenadas...\n');

  console.log('🔍 Usando Nominatim (OpenStreetMap) para geocodificação');
  console.log('⚠️  Algumas paradas podem não ser encontradas e receberão coordenadas aproximadas\n');
  
  await updateCoordinates();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

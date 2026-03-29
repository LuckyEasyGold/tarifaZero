import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Dados das linhas
const linhas = [
  {
    code: 'L001',
    name: 'Linha 001 - Eldorado / IFPR',
    color: 'blue',
    colorHex: '#3B82F6',
    startTime: '06:45',
    endTime: '23:45',
    intervalMin: 60,
  },
  {
    code: 'L002',
    name: 'Linha 002 - Tia Joanoa / Terminal Rodoviário',
    color: 'green',
    colorHex: '#10B981',
    startTime: '05:30',
    endTime: '22:30',
    intervalMin: 25,
  },
  {
    code: 'L003',
    name: 'Linha 003 - Fortunato / Terminal Rodoviário',
    color: 'red',
    colorHex: '#EF4444',
    startTime: '06:00',
    endTime: '00:00',
    intervalMin: 15,
  },
  {
    code: 'L004',
    name: 'Linha 004 - Vila Rural / Terminal Rodoviário',
    color: 'purple',
    colorHex: '#8B5CF6',
    startTime: '05:00',
    endTime: '21:00',
    intervalMin: 30,
  },
  {
    code: 'L005',
    name: 'Linha 005 - Lagoão / Insana',
    color: 'orange',
    colorHex: '#F59E0B',
    startTime: '06:00',
    endTime: '21:00',
    intervalMin: 40,
  },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Limpar dados existentes
  console.log('🗑️  Limpando dados antigos...');
  await prisma.routePoint.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.line.deleteMany();
  console.log('✅ Dados antigos removidos\n');

  // Criar linhas
  console.log('🚌 Criando linhas...');
  for (const linhaData of linhas) {
    const linha = await prisma.line.create({
      data: linhaData,
    });
    console.log(`   ✓ ${linha.name}`);

    // Criar rota (ida)
    const route = await prisma.route.create({
      data: {
        lineId: linha.id,
        direction: 'outbound',
        name: `${linha.name} - Ida`,
        active: true,
      },
    });

    // Ler arquivo de rota JSON
    const rotaPath = path.join(process.cwd(), 'src', 'data', `rota${linha.code}.json`);
    if (fs.existsSync(rotaPath)) {
      const rotaData = JSON.parse(fs.readFileSync(rotaPath, 'utf-8'));
      
      // Criar pontos da rota
      for (let i = 0; i < rotaData.length; i++) {
        await prisma.routePoint.create({
          data: {
            routeId: route.id,
            sequence: i,
            lat: rotaData[i].lat,
            lng: rotaData[i].lng,
          },
        });
      }
      console.log(`      → ${rotaData.length} pontos da rota adicionados`);
    }

    // Ler arquivo de paradas JSON
    const paradasPath = path.join(process.cwd(), 'src', 'data', `paradas${linha.code}.json`);
    if (fs.existsSync(paradasPath)) {
      const paradasData = JSON.parse(fs.readFileSync(paradasPath, 'utf-8'));
      
      // Criar paradas
      for (let j = 0; j < paradasData.length; j++) {
        const parada = paradasData[j];
        await prisma.stop.create({
          data: {
            lineId: linha.id,
            code: `${linha.code}-${parada.id}`, // Código único por linha
            name: parada.nome,
            lat: parada.coordenadas.lat,
            lng: parada.coordenadas.lng,
            description: parada.horarioPrevisto ? `Horário previsto: ${parada.horarioPrevisto}` : null,
            active: true,
          },
        });
      }
      console.log(`      → ${paradasData.length} paradas adicionadas`);
    }
  }

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  const totalLinhas = await prisma.line.count();
  const totalRotas = await prisma.route.count();
  const totalPontos = await prisma.routePoint.count();
  const totalParadas = await prisma.stop.count();
  
  console.log(`   - ${totalLinhas} linhas`);
  console.log(`   - ${totalRotas} rotas`);
  console.log(`   - ${totalPontos} pontos de rota`);
  console.log(`   - ${totalParadas} paradas`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Populando redes Wi-Fi dos ônibus...');

  // Linha L001 - Expresso Palmas
  const linha001 = await prisma.line.findFirst({
    where: { code: 'L001' }
  });

  if (linha001) {
    await prisma.wifiNetwork.upsert({
      where: {
        lineId_ssid: {
          lineId: linha001.id,
          ssid: 'Expresso Palmas'
        }
      },
      update: {
        bssid: 'f8:5e:3c:64:2f:6a',
        description: 'Wi-Fi oficial do ônibus L001',
        active: true
      },
      create: {
        lineId: linha001.id,
        ssid: 'Expresso Palmas',
        bssid: 'f8:5e:3c:64:2f:6a',
        description: 'Wi-Fi oficial do ônibus L001',
        active: true
      }
    });
    console.log('✅ Wi-Fi da Linha L001 cadastrado');
  }

  // Adicionar mais linhas conforme necessário
  // TODO: Adicionar Wi-Fi das outras linhas quando disponível

  console.log('✅ Seed de Wi-Fi concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular Wi-Fi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

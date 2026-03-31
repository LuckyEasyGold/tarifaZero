// Script para inserir os contribuidores iniciais no banco de dados
// Execute com: node scripts/seed-supporters.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supporters = [
  {
    name: 'Marcos Dieison',
    socialUrl: 'https://www.instagram.com/marcdieison',
    socialLabel: 'Instagram',
    active: true
  },
  {
    name: 'Din0',
    socialUrl: null,
    socialLabel: null,
    active: true
  },
  {
    name: 'Leticia',
    socialUrl: 'https://www.instagram.com/leti_bzt',
    socialLabel: 'Instagram',
    active: true
  },
  {
    name: 'Claudio',
    socialUrl: 'https://www.instagram.com/claudiomarturra',
    socialLabel: 'Instagram',
    active: true
  }
];

async function main() {
  console.log('🌱 Inserindo contribuidores...');

  for (const supporter of supporters) {
    const result = await prisma.supporter.upsert({
      where: { 
        // Como não temos um campo único além do id, vamos criar baseado no nome
        id: `supporter-${supporter.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: supporter,
      create: {
        id: `supporter-${supporter.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...supporter
      }
    });
    console.log(`✅ ${result.name} - ${result.socialUrl || 'sem link'}`);
  }

  console.log('\n🎉 Contribuidores inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

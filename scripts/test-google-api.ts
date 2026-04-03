/**
 * Testar Google Maps API Key
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGoogleMapsAPI() {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY?.trim().replace(/"/g, '');
  
  if (!API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY não encontrada no .env');
    console.log('Variáveis disponíveis:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
    return false;
  }

  console.log('🔑 Testando API Key:', API_KEY.substring(0, 10) + '...');

  // Testar Geocoding API
  const testAddress = 'Rodoviária Municipal, Palmas, Paraná, Brasil';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${API_KEY}`;

  try {
    console.log('\n🔍 Testando Geocoding API...');
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      console.log('✅ Geocoding API funcionando!');
      console.log(`📍 Teste: ${testAddress}`);
      console.log(`   Coordenadas: ${data.results[0].geometry.location.lat}, ${data.results[0].geometry.location.lng}`);
      return true;
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('❌ API Key inválida ou APIs não habilitadas');
      console.error('   Erro:', data.error_message);
      console.log('\n💡 Verifique:');
      console.log('   1. A chave está correta');
      console.log('   2. Geocoding API está habilitada no Google Cloud Console');
      console.log('   3. Não há restrições de IP/domínio na chave');
      return false;
    } else {
      console.error('❌ Erro:', data.status);
      console.error('   Mensagem:', data.error_message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    return false;
  }
}

testGoogleMapsAPI()
  .then(success => {
    if (success) {
      console.log('\n✅ Tudo pronto! Pode executar: tsx scripts/import-horarios.ts');
    } else {
      console.log('\n⚠️  Configure a API Key corretamente antes de importar os horários');
    }
    process.exit(success ? 0 : 1);
  });

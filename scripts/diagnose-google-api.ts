/**
 * Diagnóstico completo da Google Maps API
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DA GOOGLE MAPS API\n');
  console.log('═'.repeat(60));

  // 1. Verificar se a chave existe
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY?.trim().replace(/"/g, '');
  
  console.log('\n1️⃣  VERIFICANDO CHAVE API');
  console.log('─'.repeat(60));
  
  if (!API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY não encontrada no .env');
    console.log('\n💡 Adicione no .env:');
    console.log('   GOOGLE_MAPS_API_KEY="sua_chave_aqui"');
    return;
  }
  
  console.log('✅ Chave encontrada');
  console.log(`   Primeiros 10 caracteres: ${API_KEY.substring(0, 10)}...`);
  console.log(`   Tamanho: ${API_KEY.length} caracteres`);
  
  // 2. Testar Geocoding API
  console.log('\n2️⃣  TESTANDO GEOCODING API');
  console.log('─'.repeat(60));
  
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Palmas,Paraná,Brasil&key=${API_KEY}`;
  
  try {
    console.log('📡 Fazendo requisição...');
    const response = await fetch(geocodingUrl);
    const data = await response.json();
    
    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Status API: ${data.status}`);
    
    if (data.status === 'OK') {
      console.log('✅ Geocoding API funcionando!');
      console.log(`   Resultado: ${data.results[0].formatted_address}`);
      console.log(`   Coordenadas: ${data.results[0].geometry.location.lat}, ${data.results[0].geometry.location.lng}`);
    } else if (data.status === 'REQUEST_DENIED') {
      console.log('❌ Requisição negada');
      console.log(`   Erro: ${data.error_message}`);
      console.log('\n💡 Possíveis causas:');
      console.log('   1. Geocoding API não está habilitada');
      console.log('   2. Chave API incorreta');
      console.log('   3. Restrições de API key (IP, domínio, etc)');
      console.log('\n🔧 Soluções:');
      console.log('   1. Acesse: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com');
      console.log('   2. Clique em "ENABLE" (Ativar)');
      console.log('   3. Verifique se está no projeto correto');
      console.log('   4. Verifique restrições da chave em:');
      console.log('      https://console.cloud.google.com/apis/credentials');
    } else {
      console.log(`⚠️  Status inesperado: ${data.status}`);
      console.log(`   Mensagem: ${data.error_message || 'N/A'}`);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
  
  // 3. Testar Directions API
  console.log('\n3️⃣  TESTANDO DIRECTIONS API');
  console.log('─'.repeat(60));
  
  const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=Palmas,PR&destination=Palmas,PR&key=${API_KEY}`;
  
  try {
    console.log('📡 Fazendo requisição...');
    const response = await fetch(directionsUrl);
    const data = await response.json();
    
    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Status API: ${data.status}`);
    
    if (data.status === 'OK') {
      console.log('✅ Directions API funcionando!');
    } else if (data.status === 'REQUEST_DENIED') {
      console.log('❌ Requisição negada');
      console.log(`   Erro: ${data.error_message}`);
      console.log('\n🔧 Solução:');
      console.log('   Acesse: https://console.cloud.google.com/apis/library/directions-backend.googleapis.com');
      console.log('   Clique em "ENABLE" (Ativar)');
    } else {
      console.log(`⚠️  Status: ${data.status}`);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
  
  // 4. Verificar billing
  console.log('\n4️⃣  INFORMAÇÕES IMPORTANTES');
  console.log('─'.repeat(60));
  console.log('⚠️  Google Maps APIs requerem:');
  console.log('   1. Conta de faturamento ativa (Billing Account)');
  console.log('   2. APIs habilitadas no projeto correto');
  console.log('   3. Chave API sem restrições (ou com restrições corretas)');
  console.log('\n📋 Checklist:');
  console.log('   [ ] Billing habilitado: https://console.cloud.google.com/billing');
  console.log('   [ ] Geocoding API ativa: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com');
  console.log('   [ ] Directions API ativa: https://console.cloud.google.com/apis/library/directions-backend.googleapis.com');
  console.log('   [ ] Chave sem restrições ou com IP correto');
  
  console.log('\n═'.repeat(60));
  console.log('🏁 DIAGNÓSTICO CONCLUÍDO\n');
}

diagnose().catch(console.error);

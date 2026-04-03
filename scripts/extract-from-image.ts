/**
 * Script para extrair dados de horários de uma imagem usando OCR
 * 
 * Uso:
 * tsx scripts/extract-from-image.ts public/tarifaZero.jpg
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtractedLine {
  code: string;
  name: string;
  origin: string;
  destination: string;
  times: string[];
  stops: string[];
}

/**
 * Usar Google Cloud Vision API para OCR
 */
async function extractTextFromImage(imagePath: string): Promise<string> {
  const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_VISION_API_KEY) {
    console.error('❌ GOOGLE_VISION_API_KEY ou GOOGLE_MAPS_API_KEY não configurada');
    console.log('💡 Configure no .env: GOOGLE_VISION_API_KEY=sua_chave_aqui');
    return '';
  }

  // Ler imagem e converter para base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;
  
  const requestBody = {
    requests: [
      {
        image: {
          content: base64Image
        },
        features: [
          {
            type: 'TEXT_DETECTION',
            maxResults: 1
          }
        ]
      }
    ]
  };

  try {
    console.log('🔍 Extraindo texto da imagem...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.responses && data.responses[0].textAnnotations) {
      const text = data.responses[0].textAnnotations[0].description;
      console.log('✅ Texto extraído com sucesso!');
      return text;
    } else {
      console.error('❌ Nenhum texto encontrado na imagem');
      console.log('Response:', JSON.stringify(data, null, 2));
      return '';
    }
  } catch (error) {
    console.error('❌ Erro ao processar imagem:', error);
    return '';
  }
}

/**
 * Parsear texto extraído e organizar dados
 */
function parseExtractedText(text: string): ExtractedLine[] {
  const lines: ExtractedLine[] = [];
  
  console.log('\n📋 Texto extraído:');
  console.log('─'.repeat(80));
  console.log(text);
  console.log('─'.repeat(80));
  
  // Aqui você pode adicionar lógica para parsear o texto
  // Por enquanto, vou apenas retornar o texto para análise manual
  
  return lines;
}

/**
 * Salvar dados extraídos em JSON
 */
function saveExtractedData(data: ExtractedLine[], outputPath: string) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Dados salvos em: ${outputPath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const imagePath = args[0] || 'public/tarifaZero.jpg';

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Arquivo não encontrado: ${imagePath}`);
    process.exit(1);
  }

  console.log(`📸 Processando imagem: ${imagePath}\n`);

  // Extrair texto
  const extractedText = await extractTextFromImage(imagePath);

  if (extractedText) {
    // Salvar texto bruto
    const textOutputPath = 'extracted-text.txt';
    fs.writeFileSync(textOutputPath, extractedText, 'utf-8');
    console.log(`\n💾 Texto bruto salvo em: ${textOutputPath}`);

    // Parsear dados
    const parsedData = parseExtractedText(extractedText);

    if (parsedData.length > 0) {
      const jsonOutputPath = 'extracted-data.json';
      saveExtractedData(parsedData, jsonOutputPath);
    }

    console.log('\n✅ Extração concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Revise o arquivo extracted-text.txt');
    console.log('2. Organize os dados manualmente se necessário');
    console.log('3. Execute: tsx scripts/import-schedules.ts');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { extractTextFromImage, parseExtractedText };

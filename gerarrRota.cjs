require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ORS_API_KEY = process.env.ORS_API_KEY;
if (!ORS_API_KEY) {
  console.error("❌ ORS_API_KEY não encontrada no .env");
  process.exit(1);
}

const CIDADE = "Palmas, Paraná, Brasil";

// Bounding box expandido para cobrir melhor Palmas - PR
const BOUNDING_BOX = {
  min_lon: -52.20,
  min_lat: -26.60,
  max_lon: -51.60,
  max_lat: -26.10,
};

const outputDir = path.resolve(process.cwd(), "src/data");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Delay entre requisições para evitar rate limit
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===============================
// DICIONÁRIO DE NOMES DE RUAS (CORREÇÕES)
// ===============================
const correcaoRuas = {
  // L001 - Correções específicas
  "R. Siegmuindo Knolseisen": "R. Siegmund Knolseisen, Palmas PR",
  "R. Siegmun Knolseisen": "R. Siegmund Knolseisen, Palmas PR",
  "AV. Bento Munhoz da Rocha Neto": "Avenida Bento Munhoz da Rocha Neto, Palmas PR",
  "Av. Gov. Pedro Viriato Parigot de Souza": "Avenida Governador Pedro Viriato Parigot de Souza, Palmas PR",
  "R. Dr. Antônio Batista Ribas": "Rua Doutor Antônio Batista Ribas, Palmas PR",
  "R. Prof. Henrique José Berhost": "Rua Professor Henrique José Berhost, Palmas PR",
  "R. Felipe Shell Loureiro": "Rua Felipe Shell Loureiro, Palmas PR",
  "R. José Joaquim Bahls": "Rua José Joaquim Bahls, Palmas PR",
  "R. Expedicionário Palmense": "Rua Expedicionário Palmense, Palmas PR",
  "R. Capitão Francisco Paulo de Araújo": "Rua Capitão Francisco Paulo de Araújo, Palmas PR",
  "R. Capitão Paulo Araújo": "Rua Capitão Paulo Araújo, Palmas PR",
  "R. Professor Virgílio Ferreira": "Rua Professor Virgílio Ferreira, Palmas PR",
  "R. Nossa Senhora de Fátima": "Rua Nossa Senhora de Fátima, Palmas PR",
  "R. São Sebastião": "Rua São Sebastião, Palmas PR",
  "R. Rui Barbosa": "Rua Rui Barbosa, Palmas PR",
  "R. 7 de Setembro": "Rua Sete de Setembro, Palmas PR",
  "R. XV de Novembro": "Rua Quinze de Novembro, Palmas PR",
  "R. Dr. Bernardo Ribeiro Viana": "Rua Doutor Bernardo Ribeiro Viana, Palmas PR",
  "R. Dr. Bezerra de Menezes": "Rua Doutor Bezerra de Menezes, Palmas PR",
  "R. Bituruna": "Rua Bituruna, Palmas PR",
  "R. Ubiratã Araújo": "Rua Ubiratã Araújo, Palmas PR",
  "R. Roberto Schnaufer": "Rua Roberto Schnaufer, Palmas PR",
  "R. Cacique Viri": "Rua Cacique Viri, Palmas PR",
  "R. Paulo Banach": "Rua Paulo Banach, Palmas PR",
  "R. Rafael Ribas": "Rua Rafael Ribas, Palmas PR",
  "R. Bispo Dom Carlos": "Rua Bispo Dom Carlos, Palmas PR",
  "Av. Olímpio Carvalho de Lima": "Avenida Olímpio Carvalho de Lima, Palmas PR",
  "Av. Marechal Deodoro": "Avenida Marechal Deodoro, Palmas PR",
  "Av. Constantino Fabrício da Silva Pinto": "Avenida Constantino Fabrício da Silva Pinto, Palmas PR",
  "Av. Cel. José Osório": "Avenida Coronel José Osório, Palmas PR",
  "Av. Coronel José Osório": "Avenida Coronel José Osório, Palmas PR",
  "Eloy Erich Bernert": "Rua Eloy Erich Bernert, Palmas PR",
  "IFPR Palmas PR": "Instituto Federal do Paraná - Campus Palmas, Palmas PR",
  "Terminal Rodoviário, Palmas PR": "Terminal Rodoviário de Palmas, Palmas PR",
  "Interior R. Rio Grande do Sul": "Rua Rio Grande do Sul, Palmas PR",
  "R. Jose Fortunato": "Rua José Fortunato, Palmas PR",
  "R. Tertuliano de Almeida": "Rua Tertuliano de Almeida, Palmas PR",
  "R. Jose Alessi": "Rua José Alessi, Palmas PR",
  "R. Pedro Nito": "Rua Pedro Nito, Palmas PR",
  "Entrada Vila Rural": "Vila Rural, Palmas PR",
  "R. Conceição de Alencar Lima": "Rua Conceição de Alencar Lima, Palmas PR",
  "R. Frei Jacobe": "Rua Frei Jacobe, Palmas PR"
};

// ===============================
// GEOCODE MELHORADO COM TENTATIVAS MÚLTIPLAS
// ===============================
async function geocode(enderecoOriginal, tentativa = 1) {
  // Lista de variações do endereço para tentar
  const variacoes = [
    enderecoOriginal, // Original
    correcaoRuas[enderecoOriginal] || enderecoOriginal, // Versão corrigida se existir
    enderecoOriginal.replace(/^(R\.|Rua|Av\.|Avenida)\s+/i, '').trim(), // Sem prefixo
    enderecoOriginal.split(',')[0].trim(), // Só o nome da rua
  ];
  
  // Remove duplicatas
  const tentativas = [...new Set(variacoes)];
  
  for (const endereco of tentativas) {
    try {
      console.log(`   🔍 Tentando: "${endereco}"`);
      
      const response = await axios.get(
        "https://api.openrouteservice.org/geocode/search",
        {
          headers: { Authorization: ORS_API_KEY },
          params: {
            text: `${endereco}, ${CIDADE}`,
            size: 1,
            "boundary.country": "BR",
            "boundary.rect.min_lon": BOUNDING_BOX.min_lon,
            "boundary.rect.min_lat": BOUNDING_BOX.min_lat,
            "boundary.rect.max_lon": BOUNDING_BOX.max_lon,
            "boundary.rect.max_lat": BOUNDING_BOX.max_lat,
          },
          timeout: 10000,
        }
      );

      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        
        console.log(`   ✅ Encontrado: (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        return [lng, lat, endereco];
      }
    } catch (err) {
      // Continua para próxima tentativa
    }
    
    await sleep(200);
  }
  
  // Se todas as tentativas falharem
  if (tentativa < 3) {
    console.log(`   🔄 Tentativa ${tentativa} falhou, tentando novamente...`);
    await sleep(2000);
    return geocode(enderecoOriginal, tentativa + 1);
  }
  
  console.log(`   ❌ Endereço não encontrado: ${enderecoOriginal}`);
  return null;
}

// ===============================
// GERAR LINHA COM COMENTÁRIOS
// ===============================
async function gerarLinha(linha) {
  console.log(`\n🚍 Gerando ${linha.id} - ${linha.nome || ''}...`);

  const todasCoords = [];
  const paradasArray = [];
  const rotaComPontos = []; // Array para rota com comentários
  const geocodificados = new Set();
  let falhas = 0;
  let contadorIda = 0;
  let contadorVolta = 0;

  // Processa IDA
  console.log(`\n📌 Processando sentido IDA (${linha.ida.length} pontos)...`);
  for (let i = 0; i < linha.ida.length; i++) {
    const rua = linha.ida[i];
    
    console.log(`📍 [IDA ${i + 1}/${linha.ida.length}] ${rua}`);
    const resultado = await geocode(rua);
    
    if (resultado) {
      const [lng, lat, enderecoUsado] = resultado;
      todasCoords.push([lng, lat]);
      
      // Adiciona à rota com comentário
      rotaComPontos.push({
        lat,
        lng,
        _rua: rua,
        _enderecoUsado: enderecoUsado
      });
      
      // Só adiciona à lista de paradas se for um ponto único
      if (!geocodificados.has(rua)) {
        contadorIda++;
        paradasArray.push({
          id: `P${contadorIda.toString().padStart(3, "0")}`,
          nome: rua,
          coordenadas: { lat, lng },
          horarioPrevisto: ""
        });
        geocodificados.add(rua);
      }
    } else {
      falhas++;
    }
    
    await sleep(300);
  }

  // Processa VOLTA
  console.log(`\n📌 Processando sentido VOLTA (${linha.volta.length} pontos)...`);
  for (let i = 0; i < linha.volta.length; i++) {
    const rua = linha.volta[i];
    
    console.log(`📍 [VOLTA ${i + 1}/${linha.volta.length}] ${rua}`);
    const resultado = await geocode(rua);
    
    if (resultado) {
      const [lng, lat, enderecoUsado] = resultado;
      todasCoords.push([lng, lat]);
      
      // Adiciona à rota com comentário
      rotaComPontos.push({
        lat,
        lng,
        _rua: rua,
        _enderecoUsado: enderecoUsado
      });
      
      // Só adiciona à lista de paradas se for um ponto único
      if (!geocodificados.has(rua)) {
        contadorVolta++;
        paradasArray.push({
          id: `P${(contadorIda + contadorVolta).toString().padStart(3, "0")}`,
          nome: rua,
          coordenadas: { lat, lng },
          horarioPrevisto: ""
        });
        geocodificados.add(rua);
      }
    } else {
      falhas++;
    }
    
    await sleep(300);
  }

  console.log(`\n📊 Resumo da geocodificação:`);
  console.log(`   - Total de pontos únicos: ${geocodificados.size}`);
  console.log(`   - Falhas: ${falhas}`);
  console.log(`   - Coordenadas para rota: ${todasCoords.length}`);

  if (todasCoords.length < 2) {
    console.log(`❌ ${linha.id}: Pontos insuficientes (${todasCoords.length})`);
    return false;
  }

  console.log(`\n🛣️ Solicitando rota para ${linha.id}...`);

  try {
    const routeResponse = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      { coordinates: todasCoords },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (!routeResponse.data || !routeResponse.data.features || !routeResponse.data.features[0]) {
      console.log(`❌ ${linha.id}: Resposta da rota inválida`);
      return false;
    }

    const route = routeResponse.data.features[0];
    const distanciaKm = route.properties.summary.distance / 1000;

    console.log(`✅ Rota calculada: ${distanciaKm.toFixed(2)} km`);

    // Converte as coordenadas da rota para o formato LatLng[] esperado
    // e adiciona comentários com as ruas próximas
    const rotaArray = route.geometry.coordinates.map((coord, index) => {
      // Encontra a rua mais próxima neste ponto (simplificado)
      const ponto = { lat: coord[1], lng: coord[0] };
      
      // Versão com comentário (para debug)
      return {
        lat: coord[1],
        lng: coord[0]
        // Comentários não são válidos em JSON, mas podemos adicionar no arquivo de texto separado
      };
    });

    // Cria um arquivo de texto com as coordenadas e comentários para facilitar a manutenção
    const arquivoLegivel = [];
    arquivoLegivel.push(`# ROTA ${linha.id} - ${linha.nome}`);
    arquivoLegivel.push(`# Distância: ${distanciaKm.toFixed(2)} km`);
    arquivoLegivel.push(`# Gerado em: ${new Date().toISOString()}`);
    arquivoLegivel.push('');
    
    // Adiciona os pontos de referência (paradas)
    arquivoLegivel.push('# PONTOS DE PARADA:');
    paradasArray.forEach((parada, idx) => {
      arquivoLegivel.push(`# ${parada.id} - ${parada.nome}`);
      arquivoLegivel.push(`#   lat: ${parada.coordenadas.lat}, lng: ${parada.coordenadas.lng}`);
    });
    arquivoLegivel.push('');
    
    // Adiciona a rota completa
    arquivoLegivel.push('# ROTA COMPLETA:');
    rotaArray.forEach((ponto, idx) => {
      arquivoLegivel.push(`{ lat: ${ponto.lat}, lng: ${ponto.lng} }, // Ponto ${idx + 1}`);
    });
    
    // Salva o arquivo de texto para fácil leitura
    fs.writeFileSync(
      path.join(outputDir, `rota${linha.id}_LEGIVEL.txt`),
      arquivoLegivel.join('\n')
    );

    // Salva os arquivos JSON no formato esperado
    fs.writeFileSync(
      path.join(outputDir, `rota${linha.id}.json`),
      JSON.stringify(rotaArray, null, 2)
    );

    fs.writeFileSync(
      path.join(outputDir, `paradas${linha.id}.json`),
      JSON.stringify(paradasArray, null, 2)
    );

    console.log(`💾 Arquivos salvos:`);
    console.log(`   - rota${linha.id}.json (${rotaArray.length} pontos)`);
    console.log(`   - rota${linha.id}_LEGIVEL.txt (para visualização)`);
    console.log(`   - paradas${linha.id}.json (${paradasArray.length} paradas)`);
    console.log(`✅ ${linha.id} gerada com sucesso (${distanciaKm.toFixed(2)} km)`);
    
    return true;
  } catch (error) {
    console.log(`❌ Erro ao gerar rota ${linha.id}:`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`   Message: ${error.message}`);
    }
    return false;
  }
}

// ===============================
// DEFINIÇÃO DAS LINHAS (MANTIDA IGUAL)
// ===============================

const linhas = [
  // 🔵 L001 - Eldorado / IFPR
  {
    id: "L001",
    nome: "Eldorado / IFPR",
    ida: [
      "Eloy Erich Bernert",
      "Av. Gov. Pedro Viriato Parigot de Souza",
      "R. Paulo Banach",
      "R. Presidente Getúlio Vargas",
      "R. Cacique Viri",
      "R. Presidente Getúlio Vargas",
      "R. Roberto Schnaufer",
      "R. Bituruna",
      "R. Ubiratã Araújo",
      "R. Capitão Paulo Araújo",
      "R. Professor Virgílio Ferreira",
      "R. Nossa Senhora de Fátima",
      "R. Dr. Antônio Batista Ribas",
      "R. São Sebastião",
      "R. Rui Barbosa",
      "R. Capitão Francisco Paulo de Araújo",
      "R. Expedicionário Palmense",
      "R. Bispo Dom Carlos",
      "R. 7 de Setembro",
      "R. Rafael Ribas",
      "R. Siegmuindo Knolseisen",
      "Av. Olímpio Carvalho de Lima",
      "Av. Marechal Deodoro",
      "Av. Constantino Fabrício da Silva Pinto",
      "R. Prof. Henrique José Berhost",
      "R. Felipe Shell Loureiro",
      "AV. Bento Munhoz da Rocha Neto",
      "IFPR Palmas PR"
    ],
    volta: [
      "IFPR Palmas PR",
      "AV. Bento Munhoz da Rocha Neto",
      "R. Felipe Shell Loureiro",
      "R. Prof. Henrique José Berhost",
      "Av. Constantino Fabrício da Silva Pinto",
      "Av. Marechal Deodoro",
      "R. 7 de Setembro",
      "Av. Olímpio Carvalho de Lima",
      "R. Siegmuindo Knolseisen",
      "R. José Joaquim Bahls",
      "R. 7 de Setembro",
      "Av. Coronel José Osório",
      "R. Expedicionário Palmense",
      "R. Capitão Francisco Paulo de Araújo",
      "R. Rui Barbosa",
      "R. São Sebastião",
      "R. Frei Jacobe",
      "R. Nossa Senhora de Fátima",
      "R. Professor Virgílio Ferreira",
      "R. Capitão Paulo Araújo",
      "R. Ubiratã Araújo",
      "R. Bituruna",
      "R. Roberto Schnaufer",
      "R. Presidente Getúlio Vargas",
      "R. Cacique Viri",
      "R. Presidente Getúlio Vargas",
      "Av. Gov. Pedro Viriato Parigot de Souza",
      "R. Paulo Banach",
      "Eloy Erich Bernert"
    ]
  },

  // 🔵 L002 - Tia Joana / Terminal Rodoviário
  {
    id: "L002",
    nome: "Tia Joana / Terminal Rodoviário",
    ida: [
      "Interior R. Rio Grande do Sul",
      "R. 7 de Setembro",
      "R. Jose Joaquim Bahls",
      "R. Siegmun Knolseisen",
      "R. Rafael Ribas",
      "R. 7 de Setembro",
      "R. Bispo Dom Carlos",
      "R. Expedicionário Palmense",
      "Av. Cel. José Osório",
      "R. 7 de Setembro",
      "R. Marechal Deodoro",
      "R. Constantino Fabrício da Silva Pinto",
      "R. Prof. Henrique José Berhost",
      "R. Felipe Shell Loureiro",
      "Av. Bento Munhoz da Rocha Neto",
      "R. Dr. Bernardo Ribeiro Viana",
      "R. Dr. Bezerra de Menezes",
      "Terminal Rodoviário, Palmas PR"
    ],
    volta: [
      "Terminal Rodoviário, Palmas PR",
      "R. Dr. Bezerra de Menezes",
      "R. Dr. Bernardo Ribeiro Viana",
      "Av. Bento Munhoz da Rocha Neto",
      "R. Felipe Shell Loureiro",
      "R. Prof. Henrique José Berhost",
      "Av. Constantino Fabrício da Silva Pinto",
      "Av. Marechal Deodoro",
      "R. 7 de Setembro",
      "Av. Coronel José Osório",
      "R. Expedicionário Palmense",
      "R. Bispo Dom Carlos",
      "R. 7 de Setembro",
      "R. Rafael Ribas",
      "R. Siegmun Knolseisen",
      "R. José Joaquim Bahls",
      "R. 7 de Setembro",
      "Interior R. Rio Grande do Sul"
    ]
  },

  // 🔴 L003 - Fortunato / Rodoviária
  {
    id: "L003",
    nome: "Fortunato / Rodoviária",
    ida: [
      "R. Jose Fortunato",
      "R. Tertuliano de Almeida",
      "R. Jose Alessi",
      "R. Pedro Nito",
      "R. Tertuliano de Almeida",
      "R. XV de Novembro",
      "R. Dr. Bezerra de Menezes",
      "R. Dr. Bernardo Ribeiro Viana",
      "Terminal Rodoviário, Palmas PR"
    ],
    volta: [
      "Terminal Rodoviário, Palmas PR",
      "R. Dr. Bernardo Ribeiro Viana",
      "R. Dr. Bezerra de Menezes",
      "R. XV de Novembro",
      "R. Tertuliano de Almeida",
      "R. Pedro Nito",
      "R. Jose Alessi",
      "R. Tertuliano de Almeida",
      "R. Jose Fortunato"
    ]
  },

  // 🟣 L004 - Vila Rural / Rodoviária
  {
    id: "L004",
    nome: "Vila Rural / Rodoviária",
    ida: [
      "Entrada Vila Rural",
      "R. Jose Alessi",
      "R. Pedro Nito",
      "R. Tertuliano de Almeida",
      "R. Jose Fortunato",
      "R. Conceição de Alencar Lima",
      "R. Cel. Jose Osorio",
      "R. Expedicionario Palmense",
      "R. Bispo Dom Carlos",
      "R. 7 de Setembro",
      "R. Rafael Ribas",
      "R. Siegmun Knolseisen",
      "R. Jose Joaquim Bahls",
      "R. 7 de Setembro",
      "R. Marechal Deodoro",
      "Av. Constantino Fabricio da Silva Pinto",
      "R. Prof. Henrique Jose Berhost",
      "R. Felipe Shell Loureiro",
      "Av. Bento Munhoz da Rocha Neto",
      "R. Dr. Bernardo Ribeiro Viana",
      "R. Dr. Bezerra de Menezes",
      "Terminal Rodoviário, Palmas PR"
    ],
    volta: [
      "Terminal Rodoviário, Palmas PR",
      "R. Dr. Bezerra de Menezes",
      "R. Dr. Bernardo Ribeiro Viana",
      "Av. Bento Munhoz da Rocha Neto",
      "R. Felipe Shell Loureiro",
      "R. Prof. Henrique Jose Berhost",
      "Av. Constantino Fabricio da Silva Pinto",
      "Av. Marechal Deodoro",
      "R. 7 de Setembro",
      "Av. Coronel Jose Osorio",
      "R. Conceição de Alencar Lima",
      "R. Jose Fortunato",
      "R. Tertuliano de Almeida",
      "R. Pedro Nito",
      "R. Jose Alessi",
      "Entrada Vila Rural"
    ]
  },

  // 🟠 L005 - Lagoão / Insana
  {
    id: "L005",
    nome: "Lagoão / Insana",
    ida: [
      "R. Jose Joaquim Bahls",
      "R. 7 de Setembro",
      "R. Rafael Ribas",
      "R. Siegmun Knolseisen",
      "R. Jose Joaquim Bahls",
      "R. 7 de Setembro",
      "R. Bispo Dom Carlos",
      "R. Expedicionário Palmense",
      "R. Capitão Francisco Paulo de Araújo",
      "R. Rui Barbosa",
      "R. São Sebastião",
      "R. Frei Jacobe",
      "R. Nossa Senhora de Fátima",
      "R. Professor Virgílio Ferreira",
      "R. Capitão Paulo Araújo",
      "R. Ubiratã Araújo",
      "R. Bituruna",
      "R. Roberto Schnaufer",
      "R. Presidente Getúlio Vargas",
      "R. Cacique Viri",
      "R. Presidente Getúlio Vargas",
      "Av. Gov. Pedro Viriato Parigot de Souza",
      "R. Paulo Banach",
      "Eloy Erich Bernert"
    ],
    volta: [
      "Eloy Erich Bernert",
      "Av. Gov. Pedro Viriato Parigot de Souza",
      "R. Paulo Banach",
      "R. Presidente Getúlio Vargas",
      "R. Cacique Viri",
      "R. Presidente Getúlio Vargas",
      "R. Roberto Schnaufer",
      "R. Bituruna",
      "R. Ubiratã Araújo",
      "R. Capitão Paulo Araújo",
      "R. Professor Virgílio Ferreira",
      "R. Nossa Senhora de Fátima",
      "R. Frei Jacobe",
      "R. São Sebastião",
      "R. Rui Barbosa",
      "R. Capitão Francisco Paulo de Araújo",
      "R. Expedicionário Palmense",
      "R. Bispo Dom Carlos",
      "R. 7 de Setembro",
      "R. Rafael Ribas",
      "R. Siegmun Knolseisen",
      "R. José Joaquim Bahls"
    ]
  }
];

// ===============================
// EXECUÇÃO PRINCIPAL
// ===============================

const linhaArg = process.argv[2];

(async () => {
  console.log("🚀 Iniciando geração de rotas...");
  console.log("📁 Diretório de saída:", outputDir);
  
  let sucesso = 0;
  let falhas = 0;

  if (!linhaArg || linhaArg.toUpperCase() === "ALL") {
    for (const linha of linhas) {
      const result = await gerarLinha(linha);
      if (result) sucesso++; else falhas++;
      console.log("⏳ Aguardando antes da próxima linha...");
      await sleep(2000);
    }
  } else {
    const linha = linhas.find(l => l.id === linhaArg.toUpperCase());
    if (!linha) {
      console.log(`❌ Linha ${linhaArg} não encontrada.`);
      console.log("Linhas disponíveis:", linhas.map(l => l.id).join(", "));
      return;
    }
    const result = await gerarLinha(linha);
    if (result) sucesso++; else falhas++;
  }

  console.log("\n📊 RESUMO FINAL:");
  console.log(`✅ Linhas geradas com sucesso: ${sucesso}`);
  console.log(`❌ Linhas com falha: ${falhas}`);
  
  if (falhas === 0) {
    console.log("\n🎉 Todas as linhas foram geradas com sucesso!");
  } else {
    console.log("\n⚠️ Algumas linhas apresentaram falhas. Verifique os logs acima.");
  }
})();
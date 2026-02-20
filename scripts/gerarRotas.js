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

// Bounding box mais preciso para Palmas - PR
const BOUNDING_BOX = {
  min_lon: -52.03,
  min_lat: -26.55,
  max_lon: -51.97,
  max_lat: -26.20,
};

const outputDir = path.resolve(process.cwd(), "src/data");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Delay entre requisições para evitar rate limit
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===============================
// GEOCODE MELHORADO
// ===============================
async function geocode(endereco, tentativa = 1) {
  try {
    // Limpa o endereço
    let enderecoLimpo = endereco.replace(/^(R\.|Rua|Av\.|Avenida)\s+/i, '').trim();
    
    const response = await axios.get(
      "https://api.openrouteservice.org/geocode/search",
      {
        headers: { Authorization: ORS_API_KEY },
        params: {
          text: `${enderecoLimpo}, ${CIDADE}`,
          size: 1,
          "boundary.country": "BR",
          "boundary.rect.min_lon": BOUNDING_BOX.min_lon,
          "boundary.rect.min_lat": BOUNDING_BOX.min_lat,
          "boundary.rect.max_lon": BOUNDING_BOX.max_lon,
          "boundary.rect.max_lat": BOUNDING_BOX.max_lat,
        },
      }
    );

    if (!response.data.features || response.data.features.length === 0) {
      if (tentativa < 3) {
        console.log(`🔄 Tentativa ${tentativa} falhou para: ${endereco}, tentando novamente...`);
        await sleep(1000);
        return geocode(endereco, tentativa + 1);
      }
      console.log(`⚠️ Endereço não encontrado após ${tentativa} tentativas:`, endereco);
      return null;
    }

    const feature = response.data.features[0];
    const [lng, lat] = feature.geometry.coordinates;

    // Valida se está dentro do bounding box
    if (
      lat < BOUNDING_BOX.min_lat ||
      lat > BOUNDING_BOX.max_lat ||
      lng < BOUNDING_BOX.min_lon ||
      lng > BOUNDING_BOX.max_lon
    ) {
      console.log(`⚠️ Fora da área esperada: ${endereco} (${lat}, ${lng})`);
      return null;
    }

    console.log(`✅ Encontrado: ${endereco} -> (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
    return [lng, lat];
  } catch (err) {
    if (tentativa < 3) {
      console.log(`🔄 Erro na tentativa ${tentativa} para: ${endereco}, tentando novamente...`);
      await sleep(2000);
      return geocode(endereco, tentativa + 1);
    }
    console.log(`❌ Erro geocode após ${tentativa} tentativas:`, endereco, err.message);
    return null;
  }
}

// ===============================
// VALIDA E CORRIGE COORDENADAS
// ===============================
function validarCoordenadas(coords) {
  if (!coords || coords.length < 2) return false;
  
  // Verifica se as coordenadas estão em uma região plausível
  for (const coord of coords) {
    const [lng, lat] = coord;
    if (lat < -26.55 || lat > -26.20 || lng < -52.10 || lng > -51.70) {
      console.log(`⚠️ Coordenada fora da faixa esperada: (${lat}, ${lng})`);
      return false;
    }
  }
  return true;
}

// ===============================
// GERAR LINHA (VERSÃO CORRIGIDA PARA O FORMATO ESPERADO)
// ===============================
async function gerarLinha(linha) {
  console.log(`\n🚍 Gerando ${linha.id} - ${linha.nome || ''}...`);

  const todasCoords = [];
  const paradasArray = [];
  const geocodificados = new Set();
  let falhas = 0;
  let contadorIda = 0;
  let contadorVolta = 0;

  // Processa IDA
  console.log(`\n📌 Processando sentido IDA (${linha.ida.length} pontos)...`);
  for (let i = 0; i < linha.ida.length; i++) {
    const rua = linha.ida[i];
    
    console.log(`📍 [IDA ${i + 1}/${linha.ida.length}] ${rua}`);
    const ponto = await geocode(rua);
    
    if (ponto) {
      const [lng, lat] = ponto;
      todasCoords.push(ponto);
      
      // Só adiciona à lista de paradas se for um ponto único (evita duplicatas na exibição)
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
    const ponto = await geocode(rua);
    
    if (ponto) {
      const [lng, lat] = ponto;
      todasCoords.push(ponto);
      
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

  if (!validarCoordenadas(todasCoords)) {
    console.log(`❌ ${linha.id}: Coordenadas inválidas ou fora da área`);
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
      }
    );

    if (!routeResponse.data || !routeResponse.data.features || !routeResponse.data.features[0]) {
      console.log(`❌ ${linha.id}: Resposta da rota inválida`);
      return false;
    }

    const route = routeResponse.data.features[0];
    const distanciaKm = route.properties.summary.distance / 1000;

    // Limita a distância máxima para evitar rotas absurdas
    if (distanciaKm > 100) {
      console.log(`❌ ${linha.id}: Distância muito grande (${distanciaKm.toFixed(2)} km)`);
      return false;
    }

    console.log(`✅ Rota calculada: ${distanciaKm.toFixed(2)} km`);

    // Converte as coordenadas da rota para o formato LatLng[] esperado
    const rotaArray = route.geometry.coordinates.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));

    // Salva os arquivos no formato esperado pelo linhas.ts
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
// DEFINIÇÃO DAS LINHAS
// ===============================

const linhas = [
  // 🔵 L001 - Eldorado / IFPR
  {
    id: "L001",
    nome: "Eldorado / IFPR",
    ida: [
      "Eloy Erich Bernert, Palmas PR",
      "Av. Gov. Pedro Viriato Parigot de Souza, Palmas PR",
      "R. Paulo Banach, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "R. Cacique Viri, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "R. Roberto Schnaufer, Palmas PR",
      "R. Bituruna, Palmas PR",
      "R. Ubiratã Araújo, Palmas PR",
      "R. Capitão Paulo Araújo, Palmas PR",
      "R. Professor Virgílio Ferreira, Palmas PR",
      "R. Nossa Senhora de Fátima, Palmas PR",
      "R. Dr. Antônio Batista Ribas, Palmas PR",
      "R. São Sebastião, Palmas PR",
      "R. Rui Barbosa, Palmas PR",
      "R. Capitão Francisco Paulo de Araújo, Palmas PR",
      "R. Expedicionário Palmense, Palmas PR",
      "R. Bispo Dom Carlos, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Rafael Ribas, Palmas PR",
      "R. Siegmuindo Knolseisen, Palmas PR",
      "Av. Olímpio Carvalho de Lima, Palmas PR",
      "Av. Marechal Deodoro, Palmas PR",
      "Av. Constantino Fabrício da Silva Pinto, Palmas PR",
      "R. Prof. Henrique José Berhost, Palmas PR",
      "R. Felipe Shell Loureiro, Palmas PR",
      "AV. Bento Munhoz da Rocha Neto, Palmas PR",
      "IFPR Palmas PR"
    ],
    volta: [
      "IFPR Palmas PR",
      "AV. Bento Munhoz da Rocha Neto, Palmas PR",
      "R. Felipe Shell Loureiro, Palmas PR",
      "R. Prof. Henrique José Berhost, Palmas PR",
      "Av. Constantino Fabrício da Silva Pinto, Palmas PR",
      "Av. Marechal Deodoro, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "Av. Olímpio Carvalho de Lima, Palmas PR",
      "R. Siegmuindo Knolseisen, Palmas PR",
      "R. José Joaquim Bahls, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "Av. Coronel José Osório, Palmas PR",
      "R. Expedicionário Palmense, Palmas PR",
      "R. Capitão Francisco Paulo de Araújo, Palmas PR",
      "R. Rui Barbosa, Palmas PR",
      "R. São Sebastião, Palmas PR",
      "R. Frei Jacobe, Palmas PR",
      "R. Nossa Senhora de Fátima, Palmas PR",
      "R. Professor Virgílio Ferreira, Palmas PR",
      "R. Capitão Paulo Araújo, Palmas PR",
      "R. Ubiratã Araújo, Palmas PR",
      "R. Bituruna, Palmas PR",
      "R. Roberto Schnaufer, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "R. Cacique Viri, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "Av. Gov. Pedro Viriato Parigot de Souza, Palmas PR",
      "R. Paulo Banach, Palmas PR",
      "Eloy Erich Bernert, Palmas PR"
    ]
  },

  // 🔵 L002 - Tia Joana / Terminal Rodoviário
  {
    id: "L002",
    nome: "Tia Joana / Terminal Rodoviário",
    ida: [
      "Interior R. Rio Grande do Sul, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Jose Joaquim Bahls, Palmas PR",
      "R. Siegmun Knolseisen, Palmas PR",
      "R. Rafael Ribas, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Bispo Dom Carlos, Palmas PR",
      "R. Expedicionário Palmense, Palmas PR",
      "Av. Cel. José Osório, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Marechal Deodoro, Palmas PR",
      "R. Constantino Fabrício da Silva Pinto, Palmas PR",
      "R. Prof. Henrique José Berhost, Palmas PR",
      "R. Felipe Shell Loureiro, Palmas PR",
      "Av. Bento Munhoz da Rocha Neto, Palmas PR",
      "R. Dr. Bernardo Ribeiro Viana, Palmas PR",
      "R. Dr. Bezerra de Menezes, Palmas PR",
      "Terminal Rodoviário, Palmas PR"
    ],
    volta: [
      "Terminal Rodoviário, Palmas PR",
      "R. Dr. Bezerra de Menezes, Palmas PR",
      "R. Dr. Bernardo Ribeiro Viana, Palmas PR",
      "Av. Bento Munhoz da Rocha Neto, Palmas PR",
      "R. Felipe Shell Loureiro, Palmas PR",
      "R. Prof. Henrique José Berhost, Palmas PR",
      "Av. Constantino Fabrício da Silva Pinto, Palmas PR",
      "Av. Marechal Deodoro, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "Av. Coronel José Osório, Palmas PR",
      "R. Expedicionário Palmense, Palmas PR",
      "R. Bispo Dom Carlos, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Rafael Ribas, Palmas PR",
      "R. Siegmun Knolseisen, Palmas PR",
      "R. José Joaquim Bahls, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "Interior R. Rio Grande do Sul, Palmas PR"
    ]
  },

  // 🔴 L003 - Fortunato / Rodoviária
  {
    id: "L003",
    nome: "Fortunato / Rodoviária",
    ida: [
      "R. Jose Fortunato, Palmas PR",
      "R. Tertuliano de Almeida, Palmas PR",
      "R. Jose Alessi, Palmas PR",
      "R. Pedro Nito, Palmas PR",
      "R. Tertuliano de Almeida, Palmas PR",
      "R. XV de Novembro, Palmas PR",
      "R. Dr. Bezerra de Menezes, Palmas PR",
      "R. Dr. Bernardo Ribeiro Viana, Palmas PR",
      "Terminal Rodoviário, Palmas PR"
    ],
    volta: [
      "Terminal Rodoviário, Palmas PR",
      "R. Dr. Bernardo Ribeiro Viana, Palmas PR",
      "R. Dr. Bezerra de Menezes, Palmas PR",
      "R. XV de Novembro, Palmas PR",
      "R. Tertuliano de Almeida, Palmas PR",
      "R. Pedro Nito, Palmas PR",
      "R. Jose Alessi, Palmas PR",
      "R. Tertuliano de Almeida, Palmas PR",
      "R. Jose Fortunato, Palmas PR"
    ]
  },

  // 🟣 L004 - Vila Rural / Rodoviária
  {
    id: "L004",
    nome: "Vila Rural / Rodoviária",
    ida: [
      "Entrada Vila Rural, Palmas PR",
      "R. Jose Alessi, Palmas PR",
      "R. Pedro Nito, Palmas PR",
      "R. Tertuliano de Almeida, Palmas PR",
      "R. Jose Fortunato, Palmas PR",
      "R. Conceição de Alencar Lima, Palmas PR",
      "R. Cel. Jose Osorio, Palmas PR",
      "R. Expedicionario Palmense, Palmas PR",
      "R. Bispo Dom Carlos, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Rafael Ribas, Palmas PR",
      "R. Siegmun Knolseisen, Palmas PR",
      "R. Jose Joaquim Bahls, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Marechal Deodoro, Palmas PR",
      "Av. Constantino Fabricio da Silva Pinto, Palmas PR",
      "R. Prof. Henrique Jose Berhost, Palmas PR",
      "R. Felipe Shell Loureiro, Palmas PR",
      "Av. Bento Munhoz da Rocha Neto, Palmas PR",
      "R. Dr. Bernardo Ribeiro Viana, Palmas PR",
      "R. Dr. Bezerra de Menezes, Palmas PR",
      "Terminal Rodoviário, Palmas PR"
    ],
    volta: [
      "Terminal Rodoviário, Palmas PR",
      "R. Dr. Bezerra de Menezes, Palmas PR",
      "R. Dr. Bernardo Ribeiro Viana, Palmas PR",
      "Av. Bento Munhoz da Rocha Neto, Palmas PR",
      "R. Felipe Shell Loureiro, Palmas PR",
      "R. Prof. Henrique Jose Berhost, Palmas PR",
      "Av. Constantino Fabricio da Silva Pinto, Palmas PR",
      "Av. Marechal Deodoro, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "Av. Coronel Jose Osorio, Palmas PR",
      "R. Conceição de Alencar Lima, Palmas PR",
      "R. Jose Fortunato, Palmas PR",
      "R. Tertuliano de Almeida, Palmas PR",
      "R. Pedro Nito, Palmas PR",
      "R. Jose Alessi, Palmas PR",
      "Entrada Vila Rural, Palmas PR"
    ]
  },

  // 🟠 L005 - Lagoão / Insana
  {
    id: "L005",
    nome: "Lagoão / Insana",
    ida: [
      "R. Jose Joaquim Bahls, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Rafael Ribas, Palmas PR",
      "R. Siegmun Knolseisen, Palmas PR",
      "R. Jose Joaquim Bahls, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Bispo Dom Carlos, Palmas PR",
      "R. Expedicionário Palmense, Palmas PR",
      "R. Capitão Francisco Paulo de Araújo, Palmas PR",
      "R. Rui Barbosa, Palmas PR",
      "R. São Sebastião, Palmas PR",
      "R. Frei Jacobe, Palmas PR",
      "R. Nossa Senhora de Fátima, Palmas PR",
      "R. Professor Virgílio Ferreira, Palmas PR",
      "R. Capitão Paulo Araújo, Palmas PR",
      "R. Ubiratã Araújo, Palmas PR",
      "R. Bituruna, Palmas PR",
      "R. Roberto Schnaufer, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "R. Cacique Viri, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "Av. Gov. Pedro Viriato Parigot de Souza, Palmas PR",
      "R. Paulo Banach, Palmas PR",
      "Eloy Erich Bernert, Palmas PR"
    ],
    volta: [
      "Eloy Erich Bernert, Palmas PR",
      "Av. Gov. Pedro Viriato Parigot de Souza, Palmas PR",
      "R. Paulo Banach, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "R. Cacique Viri, Palmas PR",
      "R. Presidente Getúlio Vargas, Palmas PR",
      "R. Roberto Schnaufer, Palmas PR",
      "R. Bituruna, Palmas PR",
      "R. Ubiratã Araújo, Palmas PR",
      "R. Capitão Paulo Araújo, Palmas PR",
      "R. Professor Virgílio Ferreira, Palmas PR",
      "R. Nossa Senhora de Fátima, Palmas PR",
      "R. Frei Jacobe, Palmas PR",
      "R. São Sebastião, Palmas PR",
      "R. Rui Barbosa, Palmas PR",
      "R. Capitão Francisco Paulo de Araújo, Palmas PR",
      "R. Expedicionário Palmense, Palmas PR",
      "R. Bispo Dom Carlos, Palmas PR",
      "R. 7 de Setembro, Palmas PR",
      "R. Rafael Ribas, Palmas PR",
      "R. Siegmun Knolseisen, Palmas PR",
      "R. José Joaquim Bahls, Palmas PR"
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
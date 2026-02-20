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

const BOUNDING_BOX = {
  min_lon: -52.10,
  min_lat: -26.55,
  max_lon: -51.90,
  max_lat: -26.40,
};

const outputDir = path.resolve(process.cwd(), "src/data");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ===============================
// GEOCODE
// ===============================
async function geocode(endereco) {
  try {
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
      }
    );

    const feature = response.data.features[0];
    if (!feature) return null;

    const [lng, lat] = feature.geometry.coordinates;

    if (
      lat < BOUNDING_BOX.min_lat ||
      lat > BOUNDING_BOX.max_lat ||
      lng < BOUNDING_BOX.min_lon ||
      lng > BOUNDING_BOX.max_lon
    ) {
      console.log("⚠️ Fora da área:", endereco);
      return null;
    }

    return [lng, lat];
  } catch (err) {
    console.log("Erro geocode:", endereco);
    return null;
  }
}

// ===============================
// GERAR LINHA
// ===============================
async function gerarLinha(linha) {
  console.log(`\n🚍 Gerando ${linha.id}...`);

  const todasCoords = [];
  const paradasFeatures = [];

  for (const sentido of ["ida", "volta"]) {
    for (const rua of linha[sentido]) {
      const ponto = await geocode(rua);
      if (!ponto) continue;

      todasCoords.push(ponto);

      paradasFeatures.push({
        type: "Feature",
        properties: {
          linha: linha.id,
          sentido,
          nome: rua,
        },
        geometry: {
          type: "Point",
          coordinates: ponto,
        },
      });
    }
  }

  if (todasCoords.length < 2) {
    console.log("❌ Pontos insuficientes.");
    return;
  }

  const routeResponse = await axios.post(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    { coordinates: todasCoords },
    {
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const route = routeResponse.data.features[0];
  const distanciaKm = route.properties.summary.distance / 1000;

  const rotaGeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          linha: linha.id,
          distancia_km: Number(distanciaKm.toFixed(2)),
        },
        geometry: route.geometry,
      },
    ],
  };

  const paradasGeoJSON = {
    type: "FeatureCollection",
    features: paradasFeatures,
  };

  fs.writeFileSync(
    path.join(outputDir, `rota${linha.id}.json`),
    JSON.stringify(rotaGeoJSON, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, `paradas${linha.id}.json`),
    JSON.stringify(paradasGeoJSON, null, 2)
  );

  console.log(`✅ ${linha.id} gerada (${distanciaKm.toFixed(2)} km)`);
}

// ===============================
// TODAS AS LINHAS
// ===============================

const linhas = [

  // 🔵 L002
  {
    id: "L002",
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
      "Terminal Rodoviário"
    ],
    volta: [
      "Terminal Rodoviário",
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

  // 🔴 L003
  {
    id: "L003",
    ida: [
      "R. Jose Fortunato (Frente a Clube dos Trinta)",
      "R. Tertuliano de Almeida",
      "R. Jose Alessi",
      "R. Pedro Nito",
      "R. Tertuliano de Almeida",
      "R. XV de Novembro",
      "R. Dr. Bezerra de Menezes",
      "R. Dr. Bernardo Ribeiro Viana",
      "Terminal Rodoviário"
    ],
    volta: [
      "Terminal Rodoviário",
      "R. Dr. Bernardo Ribeiro Viana",
      "R. Dr. Bezerra de Menezes",
      "R. XV de Novembro",
      "R. Tertuliano de Almeida",
      "R. Pedro Nito",
      "R. Jose Alessi",
      "R. Tertuliano de Almeida",
      "R. Jose Fortunato (Frente a Clube dos Trinta)"
    ]
  },

  // 🟣 L004
  {
    id: "L004",
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
      "Terminal Rodoviário"
    ],
    volta: [
      "Terminal Rodoviário",
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

  // 🟠 L005
  {
    id: "L005",
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
// EXECUÇÃO
// ===============================

const linhaArg = process.argv[2];

(async () => {
  if (!linhaArg || linhaArg === "ALL") {
    for (const linha of linhas) {
      await gerarLinha(linha);
    }
  } else {
    const linha = linhas.find(l => l.id === linhaArg);
    if (!linha) {
      console.log("Linha não encontrada.");
      return;
    }
    await gerarLinha(linha);
  }
})();
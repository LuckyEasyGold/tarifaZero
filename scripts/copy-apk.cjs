const fs = require('fs');
const path = require('path');

// Ler versão do package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

const apkName = `TarifaZero-${version}.apk`;
const src = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', apkName);
const dest = apkName;

if (!fs.existsSync(src)) {
  console.error(`❌ APK não encontrado: ${src}`);
  console.error('   Verifique se o build foi concluído com sucesso.');
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log(`✅ APK copiado: ${dest}`);
console.log(`📦 Tamanho: ${(fs.statSync(dest).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n💡 Próximos passos:`);
console.log(`   git add ${dest}`);
console.log(`   git commit -m "release: v${version}"`);
console.log(`   git push`);

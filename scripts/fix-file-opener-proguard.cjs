const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(
  __dirname,
  '../node_modules/@capacitor-community/file-opener/android/build.gradle'
);

if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Substituir proguard-android.txt por proguard-android-optimize.txt
  const updated = content.replace(
    /getDefaultProguardFile\(['"]proguard-android\.txt['"]\)/g,
    "getDefaultProguardFile('proguard-android-optimize.txt')"
  );
  
  if (content !== updated) {
    fs.writeFileSync(buildGradlePath, updated, 'utf8');
    console.log('✅ Fixed file-opener proguard configuration');
  } else {
    console.log('✅ file-opener proguard configuration already correct');
  }
} else {
  console.log('⚠️  file-opener build.gradle not found, skipping fix');
}

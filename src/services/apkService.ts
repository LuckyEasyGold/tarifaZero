// Serviço para download e instalação de APK
// Usa Capacitor File Plugin para salvar e ApkInstallerPlugin para instalar

const APK_VERSION = '2.5.0.4';
const APK_FILENAME = `TarifaZero-${APK_VERSION}.apk`;

// URL do APK no Vercel (arquivo estático)
const APK_URL = `https://tarifazero.vercel.app/${APK_FILENAME}`;

/**
 * Faz o download do APK e salva no dispositivo
 * @returns URL local do arquivo salvo
 */
async function downloadAPK(): Promise<string> {
  try {
    // Faz o download usando fetch
    const response = await fetch(APK_URL);
    
    if (!response.ok) {
      throw new Error(`Falha ao baixar APK: ${response.status} ${response.statusText}`);
    }
    
    // Converte para blob
    const blob = await response.blob();
    
    // Salvar no dispositivo usando Capacitor File Plugin
    const { Filesystem } = await import('@capacitor/filesystem');
    
    const result = await Filesystem.writeFile({
      path: APK_FILENAME,
      data: await blob.arrayBuffer(),
      directory: 'Documents'
    });
    
    return result.uri;
    
  } catch (error) {
    console.error('Erro ao baixar APK:', error);
    throw error;
  }
}

/**
 * Instala o APK a partir de um caminho local
 * @param filePath Caminho do arquivo APK
 */
async function installAPK(filePath: string): Promise<void> {
  try {
    // Usa o plugin customizado ApkInstaller
    const { Plugins } = await import('@capacitor/core');
    const { ApkInstaller } = Plugins;
    
    await ApkInstaller.installApk({ filePath });
    
  } catch (error) {
    console.error('Erro ao instalar APK:', error);
    throw error;
  }
}

/**
 * Faz download e instala o APK automaticamente
 */
export async function downloadAndInstallAPK(): Promise<void> {
  try {
    // Download
    const filePath = await downloadAPK();
    
    // Instalação
    await installAPK(filePath);
    
  } catch (error) {
    console.error('Erro no download e instalação:', error);
    throw error;
  }
}

/**
 * Abre o link de download no navegador (fallback)
 */
export async function openAPKInBrowser(): Promise<void> {
  const { Browser } = await import('@capacitor/browser');
  
  await Browser.open({ url: APK_URL });
}

/**
 * Retorna informações do APK atual
 */
export function getAPKInfo() {
  return {
    url: APK_URL,
    filename: APK_FILENAME,
    version: APK_VERSION
  };
}
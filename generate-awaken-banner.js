/**
 * RUNES Analytics Pro - Gerador de Banners Neural Awaken
 * 
 * Este script gera banners personalizados para a plataforma RUNES Analytics Pro
 * utilizando modelos de IA para geração de imagens e integração com QR codes.
 * 
 * A integração com o modelo Stable Diffusion XL local é feita através de
 * uma API REST que deve estar rodando localmente em http://localhost:7860
 */

import { generateImage, generateQR, overlayQRonImage, exportImage } from './neural-tools.js';

// Configurações do banner
const bannerPrompt = {
  prompt: `Futuristic sci-fi banner with a deep-space neural theme. A glowing fractal sigil pulsates in the center, 
  surrounded by streams of digital data visualized as cyan and purple energy flows. 
  Bitcoin symbols are subtly visible in the background, with faint Bitcoin runes etched into the neural structure. 
  The entire scene has a cyberpunk aesthetic with holographic details and technological patterns.`,
  negative_prompt: "text, watermark, signature, blurry, distorted, low quality, grainy",
  style: "cyberpunk, high-tech, glowing neon, dark background, detailed, 8k, sharp focus",
  resolution: "1920x1080",
  model: "dreamshaperXL",
  sampler: "DPM++ 2M Karras",
  steps: 40,
  cfg_scale: 7.5,
  seed: -1 // -1 para seed aleatória
};

// Configurações do QR code
const qrConfig = {
  url: "https://thierrybtc.github.io/runes-analytics-pro/api-demo.html?lang=auto",
  signature: "🦉 Node Owl :: Thierry BTC",
  style: "neural-glow",
  overlay: true,
  position: "bottom-right",
  size: 200,
  margin: 30,
  colorDark: "#00ffff",
  colorLight: "#000000",
  logoUrl: "assets/images/logo-icon.png"
};

/**
 * Gera um banner neural com QR code integrado
 * @param {Object} config - Configurações personalizadas (opcional)
 * @returns {Promise<Object>} - Objeto com caminhos para os arquivos gerados
 */
async function generateAwakenBanner(config = {}) {
  try {
    console.log("🧠 Iniciando geração de banner neural...");
    
    // Mescla configurações personalizadas com as padrões
    const finalPrompt = { ...bannerPrompt, ...config.prompt };
    const finalQrConfig = { ...qrConfig, ...config.qr };
    
    // Personalização para idioma, se fornecido
    if (config.language) {
      finalQrConfig.url = finalQrConfig.url.replace('lang=auto', `lang=${config.language}`);
      
      if (config.language === 'pt') {
        finalQrConfig.signature = "🦉 Nó Coruja :: Thierry BTC";
      }
    }
    
    // Gera a imagem base com modelo de difusão
    console.log("🎨 Gerando imagem base com Stable Diffusion XL...");
    const img = await generateImage(finalPrompt);
    
    // Verifica se a geração de imagem foi bem-sucedida
    if (!img || !img.buffer) {
      throw new Error("Falha ao gerar imagem base. Verifique se a API local está rodando.");
    }
    
    // Gera o QR code com estilo customizado
    console.log("📱 Gerando QR code estilizado...");
    const qr = await generateQR(finalQrConfig);
    
    // Sobrepõe o QR code na imagem
    console.log("🔄 Aplicando QR code na imagem...");
    const final = await overlayQRonImage(img, qr, finalQrConfig.position);
    
    // Define o nome do arquivo com base no idioma e timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const langSuffix = config.language ? `-${config.language}` : '';
    const fileName = `awaken-neural-banner${langSuffix}-${timestamp}`;
    
    // Opções de exportação
    const exportOptions = {
      folder: "./media/awaken-banners",
      name: fileName,
      formats: ["png", "webp"],
      quality: 90 // apenas para webp
    };
    
    // Exporta a imagem final
    console.log("💾 Exportando banner final...");
    const exportResult = await exportImage(final, exportOptions);
    
    console.log(`✅ Banner neural gerado com sucesso!`);
    console.log(`📂 Arquivos salvos em:`);
    exportResult.files.forEach(file => console.log(`   - ${file}`));
    
    return exportResult;
  } catch (error) {
    console.error("❌ Erro na geração do banner:", error);
    throw error;
  }
}

/**
 * Gera variantes de banners para diferentes idiomas
 */
async function generateLanguageVariants() {
  try {
    console.log("🌐 Gerando variantes de banners para diferentes idiomas...");
    
    // Gera variante em inglês
    await generateAwakenBanner({
      language: 'en',
      prompt: {
        prompt: bannerPrompt.prompt + " Text overlay: 'RUNES Analytics Pro - Advanced Neural Mesh'"
      }
    });
    
    // Gera variante em português
    await generateAwakenBanner({
      language: 'pt',
      prompt: {
        prompt: bannerPrompt.prompt + " Text overlay: 'RUNES Analytics Pro - Malha Neural Avançada'"
      }
    });
    
    console.log("🎉 Todas as variantes de idioma foram geradas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao gerar variantes de idioma:", error);
  }
}

// Se executado diretamente via Node.js
if (import.meta.url === import.meta.main) {
  // Verifica se deve gerar variantes de idioma
  const args = process.argv.slice(2);
  const generateVariants = args.includes('--variants') || args.includes('-v');
  
  if (generateVariants) {
    generateLanguageVariants();
  } else {
    generateAwakenBanner();
  }
}

// Exporta as funções para uso em outros módulos
export { generateAwakenBanner, generateLanguageVariants }; 
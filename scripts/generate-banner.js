#!/usr/bin/env node

/**
 * RUNES Analytics Pro - Gerador de Banners via CLI
 * 
 * Este script permite gerar banners neural via linha de comando.
 * Pode ser usado diretamente ou através de npm scripts.
 * 
 * Uso: node generate-banner.js [opções]
 * 
 * Opções:
 *   --lang=LANG        Idioma (pt/en, padrão: pt)
 *   --prompt=PROMPT    Prompt de geração (padrão: "bitcoin neural runes")
 *   --style=STYLE      Estilo visual (cyberpunk, neural-glow, runes-art, bitcoin-abstract)
 *   --res=RES          Resolução (1920x1080, 1280x720, 1024x576)
 *   --qr=BOOL          Incluir QR code (true/false)
 *   --qr-pos=POS       Posição do QR (bottom-right, bottom-left, top-right, top-left)
 *   --sign=BOOL        Incluir assinatura (true/false)
 *   --out=PATH         Caminho de saída personalizado
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');

// Configurações padrão
const DEFAULT_CONFIG = {
  outputDir: 'media/awaken-banners',
  
  // Estilos disponíveis e seus prompts associados
  styles: {
    'cyberpunk': 'futuristic cyberpunk style, neon lights, dark atmosphere, digital world',
    'neural-glow': 'ethereal neural network visualization, glowing connections, advanced AI concept',
    'runes-art': 'ancient runes with modern tech aesthetic, mystical symbols, blockchain visualization',
    'bitcoin-abstract': 'abstract bitcoin imagery, crypto art, blockchain concept, digital currency'
  },
  
  // Parâmetros padrão da difusão
  diffusion: {
    model: 'dreamshaperXL',
    steps: 35,
    cfg_scale: 7.5,
    sampler: 'Euler a',
    seed: -1,
  },
  
  // Configuração do QR code
  qrCode: {
    url: 'https://runes.analytics.pro',
    size: 200,
    colorDark: '#00ffff',
    colorLight: 'rgba(0,0,0,0.1)',
    position: 'bottom-right',
    margin: 20
  },
  
  // Configuração de assinatura
  signature: {
    text: '🦉 Node Owl :: Thierry BTC',
    font: '20px Arial',
    color: 'rgba(255,255,255,0.7)'
  },
  
  // Traduções
  translations: {
    'pt': {
      generating: 'Gerando banner neural...',
      processing: 'Processando imagem...',
      saving: 'Salvando banner em',
      done: 'Banner gerado com sucesso:',
      error: 'Erro:'
    },
    'en': {
      generating: 'Generating neural banner...',
      processing: 'Processing image...',
      saving: 'Saving banner to',
      done: 'Banner successfully generated:',
      error: 'Error:'
    }
  }
};

// Analisa os argumentos da linha de comando
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    lang: 'pt',
    prompt: 'bitcoin neural runes',
    style: 'cyberpunk',
    resolution: '1920x1080',
    includeQR: true,
    qrPosition: 'bottom-right',
    includeSignature: true,
    outputPath: null
  };
  
  for (const arg of args) {
    if (arg.startsWith('--lang=')) {
      options.lang = arg.split('=')[1];
    } else if (arg.startsWith('--prompt=')) {
      options.prompt = arg.split('=')[1];
    } else if (arg.startsWith('--style=')) {
      options.style = arg.split('=')[1];
    } else if (arg.startsWith('--res=')) {
      options.resolution = arg.split('=')[1];
    } else if (arg.startsWith('--qr=')) {
      options.includeQR = arg.split('=')[1].toLowerCase() === 'true';
    } else if (arg.startsWith('--qr-pos=')) {
      options.qrPosition = arg.split('=')[1];
    } else if (arg.startsWith('--sign=')) {
      options.includeSignature = arg.split('=')[1].toLowerCase() === 'true';
    } else if (arg.startsWith('--out=')) {
      options.outputPath = arg.split('=')[1];
    }
  }
  
  return options;
}

/**
 * Gera um banner neural baseado nas opções fornecidas
 * 
 * @param {Object} options - Opções de geração
 * @returns {Promise<string>} - Caminho do arquivo gerado
 */
async function generateBanner(options) {
  // Obtém as traduções para o idioma selecionado
  const texts = DEFAULT_CONFIG.translations[options.lang];
  
  try {
    console.log(`🧠 ${texts.generating}`);
    
    // Prepara o diretório de saída
    const outputDir = options.outputPath || DEFAULT_CONFIG.outputDir;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Constrói o caminho do arquivo de saída
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `runes-banner-${options.lang}-${timestamp}.png`;
    const outputPath = path.join(outputDir, filename);
    
    // Constrói o prompt completo
    const stylePrompt = DEFAULT_CONFIG.styles[options.style] || '';
    const fullPrompt = `${options.prompt}, ${stylePrompt}, RUNES Analytics Pro, high quality, detailed, 8k, ultra hd`;
    
    // Gera a imagem base
    console.log(`📝 Prompt: "${options.prompt}" (${options.style})`);
    
    // Obtém dimensões da resolução
    const [width, height] = options.resolution.split('x').map(Number);
    
    // Cria a imagem (em produção, chamaríamos a API de difusão)
    const canvas = await generatePlaceholderImage(width, height, fullPrompt, options);
    
    console.log(`🔍 ${texts.processing}`);
    
    // Adiciona QR Code se necessário
    if (options.includeQR) {
      await addQRCode(canvas, options);
    }
    
    // Adiciona assinatura se necessário
    if (options.includeSignature) {
      addSignature(canvas);
    }
    
    // Salva a imagem
    console.log(`💾 ${texts.saving} ${outputPath}`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ ${texts.done} ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    console.error(`❌ ${texts.error} ${error.message}`);
    throw error;
  }
}

/**
 * Gera uma imagem placeholder com gradiente e elementos visuais
 * Em produção, esta função faria uma chamada à API de difusão
 * 
 * @param {number} width - Largura da imagem
 * @param {number} height - Altura da imagem
 * @param {string} prompt - Prompt para geração (usado apenas para log)
 * @param {Object} options - Opções de geração
 * @returns {Promise<Canvas>} - Canvas com a imagem gerada
 */
async function generatePlaceholderImage(width, height, prompt, options) {
  // Cria o canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Gera uma seed determinística com base no prompt
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed = ((seed << 5) - seed) + prompt.charCodeAt(i);
    seed = seed & seed; // Converte para 32bit integer
  }
  seed = Math.abs(seed);
  
  // Cria um gradiente baseado no estilo
  let gradient;
  
  switch (options.style) {
    case 'cyberpunk':
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0a0032');
      gradient.addColorStop(0.5, '#3a0054');
      gradient.addColorStop(1, '#5a007a');
      break;
      
    case 'neural-glow':
      gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
      gradient.addColorStop(0, '#00205a');
      gradient.addColorStop(0.7, '#001040');
      gradient.addColorStop(1, '#000820');
      break;
      
    case 'runes-art':
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#2d0a31');
      gradient.addColorStop(0.5, '#390426');
      gradient.addColorStop(1, '#1c0415');
      break;
      
    case 'bitcoin-abstract':
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#492800');
      gradient.addColorStop(0.5, '#5e3a00');
      gradient.addColorStop(1, '#4b2900');
      break;
      
    default:
      // Gradiente genérico
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#000820');
      gradient.addColorStop(1, '#000030');
  }
  
  // Preenche o fundo
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Adiciona elementos visuais baseados no estilo
  switch (options.style) {
    case 'cyberpunk':
      drawCyberpunkElements(ctx, width, height, seed);
      break;
      
    case 'neural-glow':
      drawNeuralElements(ctx, width, height, seed);
      break;
      
    case 'runes-art':
      drawRunesElements(ctx, width, height, seed);
      break;
      
    case 'bitcoin-abstract':
      drawBitcoinElements(ctx, width, height, seed);
      break;
      
    default:
      drawDefaultElements(ctx, width, height, seed);
  }
  
  // Adiciona o título "RUNES Analytics Pro"
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Efeito de sombra/glow
  ctx.shadowColor = getGlowColor(options.style);
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('RUNES Analytics Pro', width/2, height/2);
  
  // Adiciona o subtítulo baseado no idioma
  ctx.font = '30px Arial';
  ctx.shadowBlur = 10;
  
  const subtitle = options.lang === 'pt' ? 
    'Análise avançada para tokens Runes' : 
    'Advanced analytics for Runes tokens';
    
  ctx.fillText(subtitle, width/2, height/2 + 70);
  
  // Remove o efeito de sombra
  ctx.shadowBlur = 0;
  
  return canvas;
}

/**
 * Adiciona elementos de estilo cyberpunk à imagem
 */
function drawCyberpunkElements(ctx, width, height, seed) {
  // Grade de linhas neon
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  
  // Linhas horizontais
  for (let i = 0; i < height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }
  
  // Linhas verticais
  for (let i = 0; i < width; i += 100) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  
  // Círculos neon
  for (let i = 0; i < 10; i++) {
    const x = (seed * (i + 1)) % width;
    const y = (seed * (i + 2)) % height;
    const radius = 50 + (seed * (i + 3) % 100);
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 0, 128, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 128, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 0, 128, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Adiciona elementos de estilo neural à imagem
 */
function drawNeuralElements(ctx, width, height, seed) {
  // Adiciona nós e conexões neurais
  const nodes = [];
  
  // Gera nós
  for (let i = 0; i < 50; i++) {
    nodes.push({
      x: (seed * (i + 1)) % width,
      y: (seed * (i + 2)) % height,
      radius: 2 + (seed * i) % 4
    });
  }
  
  // Desenha conexões
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.15)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      // Apenas conecta nós próximos
      const dist = Math.sqrt(
        Math.pow(nodes[i].x - nodes[j].x, 2) + 
        Math.pow(nodes[i].y - nodes[j].y, 2)
      );
      
      if (dist < 200) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  
  // Desenha os nós
  for (const node of nodes) {
    const gradient = ctx.createRadialGradient(
      node.x, node.y, 0, 
      node.x, node.y, node.radius
    );
    
    gradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(0, 200, 255, 0.5)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Adiciona elementos de runes à imagem
 */
function drawRunesElements(ctx, width, height, seed) {
  // Símbolos rúnicos
  const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛞ', 'ᛟ'];
  
  // Adiciona símbolos de runes em posições aleatórias
  ctx.font = '40px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  
  for (let i = 0; i < 50; i++) {
    const x = (seed * (i + 1)) % width;
    const y = (seed * (i + 2)) % height;
    const runeIndex = (seed * i) % runes.length;
    
    ctx.fillText(runes[runeIndex], x, y);
  }
  
  // Adiciona um círculo rúnico central
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
  ctx.lineWidth = 2;
  
  // Círculo externo
  ctx.beginPath();
  ctx.arc(width/2, height/2, 200, 0, Math.PI * 2);
  ctx.stroke();
  
  // Círculo interno
  ctx.beginPath();
  ctx.arc(width/2, height/2, 180, 0, Math.PI * 2);
  ctx.stroke();
  
  // Linhas radiais
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const x1 = width/2 + Math.cos(angle) * 180;
    const y1 = height/2 + Math.sin(angle) * 180;
    const x2 = width/2 + Math.cos(angle) * 200;
    const y2 = height/2 + Math.sin(angle) * 200;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

/**
 * Adiciona elementos de Bitcoin à imagem
 */
function drawBitcoinElements(ctx, width, height, seed) {
  // Desenha símbolos de Bitcoin em tamanhos diferentes
  for (let i = 0; i < 15; i++) {
    const x = (seed * (i + 1)) % width;
    const y = (seed * (i + 2)) % height;
    const size = 20 + (seed * i) % 50;
    
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = `rgba(255, 153, 0, ${0.1 + (i % 5) * 0.05})`;
    ctx.fillText('₿', x, y);
  }
  
  // Adiciona efeito de linhas de preço
  ctx.strokeStyle = 'rgba(255, 153, 0, 0.3)';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(0, height * 0.7);
  
  // Linha de preço ondulada
  for (let x = 0; x < width; x += 50) {
    const yOffset = Math.sin((seed + x) * 0.01) * 50;
    ctx.lineTo(x, height * 0.7 + yOffset);
  }
  
  ctx.stroke();
}

/**
 * Adiciona elementos genéricos à imagem
 */
function drawDefaultElements(ctx, width, height, seed) {
  // Círculos suaves
  for (let i = 0; i < 20; i++) {
    const x = (seed * (i + 1)) % width;
    const y = (seed * (i + 2)) % height;
    const radius = 30 + (seed * i) % 100;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(100, 100, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Obtém a cor do glow com base no estilo
 */
function getGlowColor(style) {
  switch (style) {
    case 'cyberpunk':
      return '#00ffff';
    case 'neural-glow':
      return '#00ccff';
    case 'runes-art':
      return '#ff9955';
    case 'bitcoin-abstract':
      return '#ffaa00';
    default:
      return '#ffffff';
  }
}

/**
 * Adiciona QR code à imagem
 * 
 * @param {Canvas} canvas - Canvas da imagem
 * @param {Object} options - Opções de geração
 */
async function addQRCode(canvas, options) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Configura o QR code
  const qrConfig = { ...DEFAULT_CONFIG.qrCode };
  qrConfig.position = options.qrPosition || qrConfig.position;
  
  // Gera o QR code como uma imagem
  const qrDataUrl = await QRCode.toDataURL(qrConfig.url, {
    width: qrConfig.size,
    margin: 1,
    color: {
      dark: qrConfig.colorDark,
      light: qrConfig.colorLight
    }
  });
  
  // Carrega a imagem do QR code
  const qrImage = await loadImage(qrDataUrl);
  
  // Determina a posição com base na configuração
  let x, y;
  const margin = qrConfig.margin;
  
  switch (qrConfig.position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'top-right':
      x = width - qrConfig.size - margin;
      y = margin;
      break;
    case 'bottom-left':
      x = margin;
      y = height - qrConfig.size - margin;
      break;
    case 'bottom-right':
    default:
      x = width - qrConfig.size - margin;
      y = height - qrConfig.size - margin;
  }
  
  // Adiciona um fundo semi-transparente para o QR code
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x - 10, y - 10, qrConfig.size + 20, qrConfig.size + 20);
  
  // Desenha o QR code
  ctx.drawImage(qrImage, x, y, qrConfig.size, qrConfig.size);
}

/**
 * Adiciona assinatura à imagem
 * 
 * @param {Canvas} canvas - Canvas da imagem
 */
function addSignature(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Configura a assinatura
  const signConfig = DEFAULT_CONFIG.signature;
  
  ctx.font = signConfig.font;
  ctx.fillStyle = signConfig.color;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Adiciona a assinatura no canto inferior direito
  ctx.fillText(signConfig.text, width - 20, height - 20);
}

/**
 * Função principal
 */
async function main() {
  try {
    // Parse arguments
    const options = parseArgs();
    
    // Generate the banner
    await generateBanner(options);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Execute a função principal se o script foi chamado diretamente
if (require.main === module) {
  main();
}

// Exporta a função para uso em outros scripts
module.exports = { generateBanner }; 
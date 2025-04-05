/**
 * RUNES Analytics Pro - Neural Tools
 * 
 * Biblioteca de ferramentas para integração com modelos de IA e
 * processamento de imagens para geração de assets da plataforma.
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';

// URL da API local do Stable Diffusion
const SD_API_URL = 'http://localhost:7860/api/v1';

/**
 * Gera uma imagem usando o modelo Stable Diffusion local
 * @param {Object} options - Configurações para geração da imagem
 * @returns {Promise<Object>} - Objeto contendo o buffer da imagem e metadados
 */
export async function generateImage(options) {
  try {
    // Parâmetros padrão para geração da imagem
    const defaultOptions = {
      prompt: '',
      negative_prompt: '',
      width: 1024,
      height: 576,
      steps: 30,
      cfg_scale: 7,
      sampler_name: 'DPM++ 2M Karras',
      seed: -1,
      batch_size: 1
    };

    // Processa as opções de resolução se fornecidas como string (ex: "1920x1080")
    let width, height;
    if (options.resolution && typeof options.resolution === 'string') {
      const [w, h] = options.resolution.split('x').map(Number);
      if (w && h) {
        width = w;
        height = h;
      }
    }

    // Mescla as opções padrão com as fornecidas
    const params = {
      ...defaultOptions,
      ...options,
      ...(width && height ? { width, height } : {})
    };

    // Adiciona o estilo ao prompt se fornecido
    if (params.style && !params.prompt.includes(params.style)) {
      params.prompt = `${params.prompt}, ${params.style}`;
    }

    // Prepara os parâmetros para a API
    const payload = {
      prompt: params.prompt,
      negative_prompt: params.negative_prompt,
      steps: params.steps,
      cfg_scale: params.cfg_scale,
      width: params.width || width,
      height: params.height || height,
      sampler_name: params.sampler || params.sampler_name,
      seed: params.seed,
      batch_size: params.batch_size || 1
    };

    console.log(`🎨 Gerando imagem (${payload.width}x${payload.height})...`);

    // Faz a requisição para a API local
    const response = await fetch(`${SD_API_URL}/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    // Processa a resposta
    const result = await response.json();
    
    if (!result.images || result.images.length === 0) {
      throw new Error('API retornou resposta vazia');
    }

    // Converte a imagem de base64 para buffer
    const imageBase64 = result.images[0];
    const buffer = Buffer.from(imageBase64, 'base64');

    // Retorna o buffer da imagem e metadados
    return {
      buffer,
      width: payload.width,
      height: payload.height,
      seed: result.seed || payload.seed,
      metadata: {
        prompt: payload.prompt,
        negative_prompt: payload.negative_prompt,
        cfg_scale: payload.cfg_scale,
        steps: payload.steps,
        sampler: payload.sampler_name
      }
    };
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    throw error;
  }
}

/**
 * Gera um QR code estilizado
 * @param {Object} options - Configurações para o QR code
 * @returns {Promise<Object>} - Objeto contendo o buffer do QR code e metadados
 */
export async function generateQR(options) {
  try {
    const defaultOptions = {
      url: 'https://thierrybtc.github.io/runes-analytics-pro',
      size: 300,
      margin: 4,
      colorDark: '#000000',
      colorLight: '#ffffff',
      logoUrl: null,
      logoSize: 60,
      signature: null,
      style: 'default'
    };

    // Mescla as opções padrão com as fornecidas
    const params = { ...defaultOptions, ...options };

    // Cria um canvas para o QR code
    const qrSize = params.size;
    const canvas = createCanvas(qrSize + params.margin * 2, qrSize + params.margin * 2 + (params.signature ? 40 : 0));
    const ctx = canvas.getContext('2d');

    // Gera o QR code usando a biblioteca qrcode
    const qrDataUrl = await QRCode.toDataURL(params.url, {
      margin: 0,
      width: qrSize,
      color: {
        dark: params.colorDark,
        light: params.colorLight
      },
      errorCorrectionLevel: 'H'
    });

    // Carrega a imagem do QR code
    const qrImage = await loadImage(qrDataUrl);

    // Preenche o fundo
    ctx.fillStyle = params.colorLight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha o QR code
    ctx.drawImage(qrImage, params.margin, params.margin, qrSize, qrSize);

    // Adiciona efeitos baseados no estilo selecionado
    switch (params.style) {
      case 'neural-glow':
        // Adiciona brilho ao redor do QR code
        ctx.save();
        ctx.shadowColor = params.colorDark;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = params.colorDark;
        ctx.lineWidth = 2;
        ctx.strokeRect(params.margin - 5, params.margin - 5, qrSize + 10, qrSize + 10);
        ctx.restore();
        break;
        
      case 'cyberpunk':
        // Adiciona bordas neon estilo cyberpunk
        ctx.save();
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#ff00ff');
        gradient.addColorStop(1, '#00ffff');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.strokeRect(params.margin - 8, params.margin - 8, qrSize + 16, qrSize + 16);
        
        // Adiciona cantos angulares
        ctx.beginPath();
        // Canto superior esquerdo
        ctx.moveTo(params.margin - 15, params.margin + 20);
        ctx.lineTo(params.margin - 15, params.margin - 15);
        ctx.lineTo(params.margin + 20, params.margin - 15);
        // Canto superior direito
        ctx.moveTo(params.margin + qrSize - 20, params.margin - 15);
        ctx.lineTo(params.margin + qrSize + 15, params.margin - 15);
        ctx.lineTo(params.margin + qrSize + 15, params.margin + 20);
        // Canto inferior direito
        ctx.moveTo(params.margin + qrSize + 15, params.margin + qrSize - 20);
        ctx.lineTo(params.margin + qrSize + 15, params.margin + qrSize + 15);
        ctx.lineTo(params.margin + qrSize - 20, params.margin + qrSize + 15);
        // Canto inferior esquerdo
        ctx.moveTo(params.margin + 20, params.margin + qrSize + 15);
        ctx.lineTo(params.margin - 15, params.margin + qrSize + 15);
        ctx.lineTo(params.margin - 15, params.margin + qrSize - 20);
        
        ctx.strokeStyle = '#00ffff';
        ctx.stroke();
        ctx.restore();
        break;
        
      default:
        // Estilo padrão, apenas uma borda simples
        ctx.strokeStyle = params.colorDark;
        ctx.lineWidth = 1;
        ctx.strokeRect(params.margin - 2, params.margin - 2, qrSize + 4, qrSize + 4);
    }

    // Adiciona o logo se fornecido
    if (params.logoUrl) {
      try {
        const logo = await loadImage(params.logoUrl);
        const logoSize = params.logoSize;
        const logoX = params.margin + (qrSize - logoSize) / 2;
        const logoY = params.margin + (qrSize - logoSize) / 2;
        
        // Adiciona um fundo branco para o logo
        ctx.fillStyle = params.colorLight;
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
        
        // Desenha o logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      } catch (logoError) {
        console.warn('Não foi possível carregar o logo:', logoError);
      }
    }

    // Adiciona assinatura se fornecida
    if (params.signature) {
      ctx.font = '14px Arial';
      ctx.fillStyle = params.colorDark;
      ctx.textAlign = 'center';
      ctx.fillText(params.signature, canvas.width / 2, canvas.height - 15);
    }

    // Converte o canvas para buffer PNG
    const buffer = canvas.toBuffer('image/png');

    return {
      buffer,
      width: canvas.width,
      height: canvas.height,
      url: params.url
    };
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    throw error;
  }
}

/**
 * Sobrepõe um QR code em uma imagem
 * @param {Object} image - Objeto da imagem base
 * @param {Object} qrCode - Objeto do QR code
 * @param {string} position - Posição do QR code (ex: 'bottom-right')
 * @returns {Promise<Buffer>} - Buffer da imagem final
 */
export async function overlayQRonImage(image, qrCode, position = 'bottom-right') {
  try {
    // Carrega as imagens
    const baseImage = await loadImage(image.buffer);
    const qrImage = await loadImage(qrCode.buffer);

    // Cria um canvas do tamanho da imagem base
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');

    // Desenha a imagem base
    ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

    // Calcula a posição do QR code
    let x, y;
    const margin = 20;
    
    switch (position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = baseImage.width - qrImage.width - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = baseImage.height - qrImage.height - margin;
        break;
      case 'center':
        x = (baseImage.width - qrImage.width) / 2;
        y = (baseImage.height - qrImage.height) / 2;
        break;
      case 'bottom-right':
      default:
        x = baseImage.width - qrImage.width - margin;
        y = baseImage.height - qrImage.height - margin;
    }

    // Desenha o QR code
    ctx.drawImage(qrImage, x, y, qrImage.width, qrImage.height);

    // Retorna o buffer da imagem final
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Erro ao sobrepor QR code na imagem:', error);
    throw error;
  }
}

/**
 * Exporta uma imagem em vários formatos
 * @param {Buffer} imageBuffer - Buffer da imagem
 * @param {Object} options - Opções de exportação
 * @returns {Promise<Object>} - Informações sobre os arquivos exportados
 */
export async function exportImage(imageBuffer, options) {
  try {
    const defaultOptions = {
      folder: './output',
      name: `image-${Date.now()}`,
      formats: ['png'],
      quality: 90
    };

    const params = { ...defaultOptions, ...options };
    const files = [];

    // Cria o diretório se não existir
    await fs.mkdir(params.folder, { recursive: true });

    // Carrega a imagem no canvas para poder exportar em diferentes formatos
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Exporta em cada formato solicitado
    for (const format of params.formats) {
      const mimeType = `image/${format}`;
      const filePath = path.join(params.folder, `${params.name}.${format}`);
      
      let buffer;
      if (format === 'webp') {
        buffer = canvas.toBuffer(mimeType, { quality: params.quality / 100 });
      } else {
        buffer = canvas.toBuffer(mimeType);
      }
      
      await fs.writeFile(filePath, buffer);
      files.push(filePath);
    }

    return { 
      files, 
      width: img.width, 
      height: img.height 
    };
  } catch (error) {
    console.error('Erro ao exportar imagem:', error);
    throw error;
  }
}

/**
 * Cria uma miniatura da imagem
 * @param {Buffer} imageBuffer - Buffer da imagem original
 * @param {number} maxWidth - Largura máxima da miniatura
 * @param {number} maxHeight - Altura máxima da miniatura
 * @returns {Promise<Buffer>} - Buffer da miniatura
 */
export async function createThumbnail(imageBuffer, maxWidth = 300, maxHeight = 300) {
  try {
    const img = await loadImage(imageBuffer);
    
    // Calcula as dimensões da miniatura mantendo proporção
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    // Cria o canvas e desenha a imagem redimensionada
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Retorna o buffer da miniatura
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Erro ao criar miniatura:', error);
    throw error;
  }
} 
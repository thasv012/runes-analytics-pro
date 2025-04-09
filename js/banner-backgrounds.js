/**
 * RUNES Analytics Pro - Neural Banner Backgrounds
 * 
 * Este módulo implementa os diferentes estilos de background para o gerador de banners.
 * Cada função desenha um estilo específico no canvas fornecido.
 */

/**
 * Desenha um fundo no estilo Cyberpunk
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} width - Largura do canvas
 * @param {number} height - Altura do canvas
 * @param {number} seed - Seed para geração pseudo-aleatória
 */
function drawCyberpunkBackground(ctx, width, height, seed) {
  // Configuração baseada na seed
  const random = seedRandom(seed);
  
  // Cor de fundo gradiente
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0f0f2e');
  gradient.addColorStop(1, '#1a0033');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Grade em perspectiva
  drawPerspectiveGrid(ctx, width, height, random);
  
  // Círculos de luz neon
  drawNeonCircles(ctx, width, height, random);
  
  // Linhas horizontais de "código"
  drawDigitalLines(ctx, width, height, random);
  
  // Overlay com efeito de ruído sutil
  drawNoiseOverlay(ctx, width, height, 0.03, random);
}

/**
 * Desenha um fundo no estilo Neural Glow
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} width - Largura do canvas
 * @param {number} height - Altura do canvas
 * @param {number} seed - Seed para geração pseudo-aleatória
 */
function drawNeuralGlowBackground(ctx, width, height, seed) {
  // Configuração baseada na seed
  const random = seedRandom(seed);
  
  // Cor de fundo gradiente
  const gradient = ctx.createRadialGradient(
    width/2, height/2, 0,
    width/2, height/2, width
  );
  gradient.addColorStop(0, '#1a043d');
  gradient.addColorStop(0.7, '#0e021f');
  gradient.addColorStop(1, '#080114');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Pontos de rede neural
  const nodes = createNeuralNodes(width, height, 40, random);
  
  // Conexões entre nós
  drawNeuralConnections(ctx, nodes, width, height, random);
  
  // Nós com brilho
  drawNeuralNodes(ctx, nodes, random);
  
  // Overlay com efeito de ruído sutil
  drawNoiseOverlay(ctx, width, height, 0.02, random);
}

/**
 * Desenha um fundo no estilo Runes Art
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} width - Largura do canvas
 * @param {number} height - Altura do canvas
 * @param {number} seed - Seed para geração pseudo-aleatória
 */
function drawRunesArtBackground(ctx, width, height, seed) {
  // Configuração baseada na seed
  const random = seedRandom(seed);
  
  // Cor de fundo gradiente
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1c1203');
  gradient.addColorStop(1, '#120c02');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Círculos dourados interconectados
  drawGoldenCircles(ctx, width, height, random);
  
  // Símbolos rúnicos
  drawRuneSymbols(ctx, width, height, random);
  
  // Linhas de conexão douradas
  drawGoldenConnections(ctx, width, height, random);
  
  // Overlay com efeito de ruído sutil
  drawNoiseOverlay(ctx, width, height, 0.03, random);
}

/**
 * Desenha um fundo no estilo Bitcoin Abstract
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} width - Largura do canvas
 * @param {number} height - Altura do canvas
 * @param {number} seed - Seed para geração pseudo-aleatória
 */
function drawBitcoinAbstractBackground(ctx, width, height, seed) {
  // Configuração baseada na seed
  const random = seedRandom(seed);
  
  // Cor de fundo gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1f1200');
  gradient.addColorStop(1, '#0a0500');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Padrão hexagonal
  drawHexagonalPattern(ctx, width, height, random);
  
  // Símbolos Bitcoin
  drawBitcoinSymbols(ctx, width, height, random);
  
  // Blocos conectados
  drawConnectedBlocks(ctx, width, height, random);
  
  // Overlay com efeito de ruído sutil
  drawNoiseOverlay(ctx, width, height, 0.02, random);
}

/**
 * Desenha o título "RUNES Analytics Pro" no banner
 */
function drawTitle() {
  const ctx = state.ctx;
  const canvas = state.canvas;
  const width = canvas.width;
  const height = canvas.height;
  
  // Tamanho do título baseado na altura do canvas
  const fontSize = Math.round(height * 0.08);
  
  // Configura o estilo do texto
  ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Posiciona o título no topo
  const y = height * 0.08;
  
  // Adiciona sombra
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  
  // Cria um gradiente para o texto
  const gradient = ctx.createLinearGradient(0, y, width, y);
  gradient.addColorStop(0, '#ffdd00');
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(1, '#ffdd00');
  
  ctx.fillStyle = gradient;
  ctx.fillText('RUNES Analytics Pro', width / 2, y);
  
  // Reseta as sombras
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Utilidades para desenho de componentes visuais
 */

// Desenha uma grade em perspectiva (estilo Cyberpunk)
function drawPerspectiveGrid(ctx, width, height, random) {
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  
  // Ponto de fuga
  const vanishingPoint = {
    x: width / 2 + (random() * width * 0.1 - width * 0.05),
    y: height / 2 + (random() * height * 0.1 - height * 0.05)
  };
  
  // Linhas verticais
  const verticalLines = 30;
  for (let i = 0; i <= verticalLines; i++) {
    const x = (i / verticalLines) * width;
    
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(vanishingPoint.x, vanishingPoint.y);
    ctx.stroke();
  }
  
  // Linhas horizontais
  const horizontalLines = 20;
  for (let i = 0; i <= horizontalLines; i++) {
    const y = height - (i / horizontalLines) * height * 0.6;
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// Desenha círculos neon (estilo Cyberpunk)
function drawNeonCircles(ctx, width, height, random) {
  const circles = Math.floor(random() * 5) + 5;
  
  for (let i = 0; i < circles; i++) {
    const x = random() * width;
    const y = random() * height;
    const radius = (random() * width * 0.1) + width * 0.05;
    
    // Gradiente para o círculo
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    // Cor aleatória entre azul e rosa
    const hue = 180 + random() * 60;
    gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.2)`);
    gradient.addColorStop(0.8, `hsla(${hue}, 100%, 50%, 0.05)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Desenha linhas digitais (estilo Cyberpunk)
function drawDigitalLines(ctx, width, height, random) {
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  
  const lines = Math.floor(random() * 10) + 10;
  
  for (let i = 0; i < lines; i++) {
    const y = random() * height;
    const segments = Math.floor(random() * 5) + 5;
    const segmentWidth = width / segments;
    
    ctx.beginPath();
    
    for (let j = 0; j <= segments; j++) {
      const x = j * segmentWidth;
      const yOffset = (random() * height * 0.05) - height * 0.025;
      
      if (j === 0) {
        ctx.moveTo(x, y + yOffset);
      } else {
        ctx.lineTo(x, y + yOffset);
      }
    }
    
    ctx.stroke();
  }
}

// Cria pontos de rede neural (estilo Neural Glow)
function createNeuralNodes(width, height, count, random) {
  const nodes = [];
  
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: random() * width,
      y: random() * height,
      radius: random() * 4 + 2,
      connections: Math.floor(random() * 3) + 2,
      hue: 260 + random() * 60
    });
  }
  
  return nodes;
}

// Desenha conexões entre nós (estilo Neural Glow)
function drawNeuralConnections(ctx, nodes, width, height, random) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    // Conecta a alguns nós próximos
    for (let j = 0; j < node.connections; j++) {
      // Encontra o próximo nó não conectado mais próximo
      let nearestDistance = Infinity;
      let nearestNode = null;
      
      for (let k = 0; k < nodes.length; k++) {
        if (i === k) continue;
        
        const targetNode = nodes[k];
        const distance = Math.sqrt(
          Math.pow(node.x - targetNode.x, 2) + 
          Math.pow(node.y - targetNode.y, 2)
        );
        
        // Limite de distância máxima
        if (distance < width * 0.3 && distance < nearestDistance) {
          nearestDistance = distance;
          nearestNode = targetNode;
        }
      }
      
      if (nearestNode) {
        // Desenha a conexão com gradiente
        const gradient = ctx.createLinearGradient(
          node.x, node.y, nearestNode.x, nearestNode.y
        );
        
        gradient.addColorStop(0, `hsla(${node.hue}, 100%, 70%, 0.2)`);
        gradient.addColorStop(1, `hsla(${nearestNode.hue}, 100%, 70%, 0.2)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(nearestNode.x, nearestNode.y);
        ctx.stroke();
      }
    }
  }
}

// Desenha nós de rede neural (estilo Neural Glow)
function drawNeuralNodes(ctx, nodes, random) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    // Desenha um círculo brilhante para cada nó
    const gradient = ctx.createRadialGradient(
      node.x, node.y, 0,
      node.x, node.y, node.radius * 2
    );
    
    gradient.addColorStop(0, `hsla(${node.hue}, 100%, 70%, 0.8)`);
    gradient.addColorStop(0.5, `hsla(${node.hue}, 100%, 70%, 0.3)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Círculo central
    ctx.fillStyle = `hsl(${node.hue}, 100%, 80%)`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Desenha círculos dourados (estilo Runes Art)
function drawGoldenCircles(ctx, width, height, random) {
  const circles = Math.floor(random() * 5) + 5;
  
  for (let i = 0; i < circles; i++) {
    const x = random() * width;
    const y = random() * height;
    const radius = (random() * width * 0.1) + width * 0.05;
    
    // Gradiente para o círculo
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
    gradient.addColorStop(0.8, 'rgba(212, 175, 55, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Bordas dos círculos
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Desenha símbolos rúnicos (estilo Runes Art)
function drawRuneSymbols(ctx, width, height, random) {
  const symbols = [
    'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ',
    'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ',
    'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'
  ];
  
  const count = Math.floor(random() * 10) + 15;
  
  for (let i = 0; i < count; i++) {
    const x = random() * width;
    const y = random() * height;
    const symbol = symbols[Math.floor(random() * symbols.length)];
    const size = Math.floor(random() * 30) + 20;
    
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Adiciona brilho
    ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = `rgba(212, 175, 55, ${random() * 0.3 + 0.4})`;
    ctx.fillText(symbol, x, y);
    
    // Reseta as sombras
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}

// Desenha conexões douradas (estilo Runes Art)
function drawGoldenConnections(ctx, width, height, random) {
  const points = [];
  const numPoints = Math.floor(random() * 10) + 10;
  
  // Gera pontos aleatórios
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: random() * width,
      y: random() * height
    });
  }
  
  // Conecta pontos próximos
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const distance = Math.sqrt(
        Math.pow(points[i].x - points[j].x, 2) + 
        Math.pow(points[i].y - points[j].y, 2)
      );
      
      if (distance < width * 0.3) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }
}

// Desenha padrão hexagonal (estilo Bitcoin Abstract)
function drawHexagonalPattern(ctx, width, height, random) {
  const size = width * 0.05;
  const rows = Math.ceil(height / (size * 1.5)) + 1;
  const cols = Math.ceil(width / (size * Math.sqrt(3))) + 1;
  
  ctx.strokeStyle = 'rgba(255, 153, 0, 0.2)';
  ctx.lineWidth = 1;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * size * Math.sqrt(3);
      const y = row * size * 1.5 + (col % 2 === 0 ? 0 : size * 0.75);
      
      // Desenha apenas alguns hexágonos aleatoriamente
      if (random() > 0.5) {
        drawHexagon(ctx, x, y, size);
      }
    }
  }
}

// Função auxiliar para desenhar um hexágono
function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(hx, hy);
    } else {
      ctx.lineTo(hx, hy);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

// Desenha símbolos Bitcoin (estilo Bitcoin Abstract)
function drawBitcoinSymbols(ctx, width, height, random) {
  const count = Math.floor(random() * 5) + 5;
  
  for (let i = 0; i < count; i++) {
    const x = random() * width;
    const y = random() * height;
    const size = Math.floor(random() * 20) + 15;
    
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Adiciona brilho
    ctx.shadowColor = 'rgba(255, 153, 0, 0.8)';
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = `rgba(255, 153, 0, ${random() * 0.3 + 0.4})`;
    ctx.fillText('₿', x, y);
    
    // Reseta as sombras
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}

// Desenha blocos conectados (estilo Bitcoin Abstract)
function drawConnectedBlocks(ctx, width, height, random) {
  const blocks = [];
  const numBlocks = Math.floor(random() * 5) + 5;
  
  // Gera blocos aleatórios
  for (let i = 0; i < numBlocks; i++) {
    blocks.push({
      x: random() * width,
      y: random() * height,
      width: random() * 30 + 30,
      height: random() * 20 + 20
    });
  }
  
  // Desenha blocos
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    ctx.strokeStyle = 'rgba(255, 153, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(block.x, block.y, block.width, block.height);
    
    // Brilho interior
    ctx.fillStyle = 'rgba(255, 153, 0, 0.05)';
    ctx.fillRect(block.x, block.y, block.width, block.height);
  }
  
  // Conecta blocos em cadeia
  ctx.strokeStyle = 'rgba(255, 153, 0, 0.15)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < blocks.length - 1; i++) {
    const current = blocks[i];
    const next = blocks[i + 1];
    
    ctx.beginPath();
    ctx.moveTo(current.x + current.width / 2, current.y + current.height / 2);
    ctx.lineTo(next.x + next.width / 2, next.y + next.height / 2);
    ctx.stroke();
  }
}

// Adiciona uma camada de ruído para textura (todos os estilos)
function drawNoiseOverlay(ctx, width, height, opacity, random) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (random() - 0.5) * opacity * 255;
    
    data[i] = Math.min(255, Math.max(0, data[i] + noise));         // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Função para gerar números pseudo-aleatórios com seed
function seedRandom(seed) {
  let value = seed;
  
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Desenha QR Code no banner
 * @param {string} position - Posição do QR (bottom-right, bottom-left, etc)
 */
async function drawQRCode(position) {
  const ctx = state.ctx;
  const canvas = state.canvas;
  const width = canvas.width;
  const height = canvas.height;
  
  // Tamanho do QR baseado na largura do canvas
  const qrSize = Math.min(width, height) * 0.15;
  
  // Cria elemento temporário para o QR code
  const qrElement = document.createElement('div');
  qrElement.style.display = 'none';
  document.body.appendChild(qrElement);
  
  // Cria o QR code com a biblioteca qrcode.js
  new QRCode(qrElement, {
    text: CONFIG.qrDefaults.url,
    width: qrSize,
    height: qrSize,
    colorDark: CONFIG.qrDefaults.colorDark,
    colorLight: CONFIG.qrDefaults.colorLight,
    correctLevel: QRCode.CorrectLevel.H
  });
  
  // Espera o QR code ser gerado
  await simulateDelay(100);
  
  // Obtém a imagem do QR code
  const qrImage = qrElement.querySelector('img');
  
  // Espera a imagem carregar
  await new Promise(resolve => {
    if (qrImage.complete) {
      resolve();
    } else {
      qrImage.onload = resolve;
    }
  });
  
  // Determina a posição com base no parâmetro
  let x, y;
  const margin = CONFIG.qrDefaults.margin;
  
  switch (position) {
    case 'bottom-right':
      x = width - qrSize - margin;
      y = height - qrSize - margin;
      break;
    case 'bottom-left':
      x = margin;
      y = height - qrSize - margin;
      break;
    case 'top-right':
      x = width - qrSize - margin;
      y = margin;
      break;
    case 'top-left':
      x = margin;
      y = margin;
      break;
    default:
      x = width - qrSize - margin;
      y = height - qrSize - margin;
  }
  
  // Desenha o QR code no canvas
  ctx.drawImage(qrImage, x, y, qrSize, qrSize);
  
  // Remove o elemento temporário
  document.body.removeChild(qrElement);
}

/**
 * Desenha a assinatura no banner
 */
function drawSignature() {
  const ctx = state.ctx;
  const canvas = state.canvas;
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.font = CONFIG.signature.font;
  ctx.fillStyle = CONFIG.signature.color;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.fillText(CONFIG.signature.text, width - 20, height - 20);
}

/**
 * Simulação de atraso para feedback ao usuário
 * @param {number} ms - Tempo em milissegundos
 * @returns {Promise} Promessa que resolve após o tempo especificado
 */
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 
/**
 * RUNES Analytics Pro - Neural Banner Utils
 * 
 * Este módulo implementa funções utilitárias para o gerador de banners neurais,
 * incluindo manipulação de histórico, download e outras funções de suporte.
 */

/**
 * Atrasa a execução por um tempo determinado (ms)
 * @param {number} ms - Tempo em milissegundos
 * @returns {Promise} Promise que resolve após o tempo especificado
 */
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Atualiza a barra de progresso e o texto de status
 * @param {number} percentage - Porcentagem de progresso (0-100)
 * @param {string} statusText - Texto a ser exibido no status
 */
function updateProgress(percentage, statusText) {
  elements.progressValue.style.width = `${percentage}%`;
  elements.statusText.textContent = statusText;
  elements.statusText.classList.remove('error');
}

/**
 * Carrega o histórico de banners do localStorage
 */
function loadHistory() {
  try {
    const savedHistory = localStorage.getItem(CONFIG.historyKey);
    if (savedHistory) {
      state.history = JSON.parse(savedHistory);
      renderHistory();
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

/**
 * Adiciona um banner ao histórico
 * @param {string} imageData - URL dos dados da imagem
 * @param {string} prompt - Texto do prompt usado
 * @param {string} style - Estilo usado
 */
function addToHistory(imageData, prompt, style) {
  // Adiciona o novo banner ao início do histórico
  state.history.unshift({
    id: Date.now(),
    imageData: imageData,
    prompt: prompt,
    style: style,
    createdAt: new Date().toISOString()
  });
  
  // Limita o tamanho do histórico
  if (state.history.length > CONFIG.historyMaxItems) {
    state.history = state.history.slice(0, CONFIG.historyMaxItems);
  }
  
  // Salva no localStorage
  try {
    localStorage.setItem(CONFIG.historyKey, JSON.stringify(state.history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
  
  // Atualiza a visualização do histórico
  renderHistory();
}

/**
 * Renderiza o histórico de banners
 */
function renderHistory() {
  const container = elements.historyContainer;
  const template = elements.historyItemTemplate;
  
  // Limpa o container
  container.innerHTML = '';
  
  // Verifica se há histórico para mostrar
  if (state.history.length === 0) {
    container.innerHTML = `<p class="text-center">${CONFIG.translations[state.currentLanguage].noHistory || 'Nenhum banner gerado ainda.'}</p>`;
    return;
  }
  
  // Adiciona cada item do histórico
  state.history.forEach(item => {
    // Clona o template
    const historyItem = template.content.cloneNode(true);
    
    // Preenche os dados
    const image = historyItem.querySelector('.history-image');
    const prompt = historyItem.querySelector('.history-prompt');
    const loadButton = historyItem.querySelector('.history-load');
    const downloadButton = historyItem.querySelector('.history-download');
    
    // Define os atributos e eventos
    image.src = item.imageData;
    prompt.textContent = item.prompt;
    
    // Evento para carregar o banner
    loadButton.addEventListener('click', () => {
      loadBannerFromHistory(item);
    });
    
    // Evento para baixar o banner
    downloadButton.addEventListener('click', () => {
      downloadHistoryBanner(item);
    });
    
    // Adiciona ao container
    container.appendChild(historyItem);
  });
}

/**
 * Carrega um banner do histórico
 * @param {Object} item - Item do histórico
 */
function loadBannerFromHistory(item) {
  // Atualiza os campos do formulário
  elements.promptInput.value = item.prompt;
  elements.styleSelect.value = item.style;
  
  // Carrega a imagem no canvas
  const img = new Image();
  img.onload = () => {
    state.canvas.width = img.width;
    state.canvas.height = img.height;
    state.ctx.drawImage(img, 0, 0);
    
    // Atualiza a interface
    elements.previewPlaceholder.style.display = 'none';
    elements.canvas.style.display = 'block';
    elements.downloadButton.disabled = false;
    
    // Salva a imagem atual
    state.currentImage = state.canvas;
    
    // Atualiza a resolução selecionada (se possível)
    const resolution = `${img.width}x${img.height}`;
    if (Array.from(elements.resolutionSelect.options).some(option => option.value === resolution)) {
      elements.resolutionSelect.value = resolution;
    }
  };
  img.src = item.imageData;
}

/**
 * Baixa um banner do histórico
 * @param {Object} item - Item do histórico
 */
function downloadHistoryBanner(item) {
  const link = document.createElement('a');
  link.download = `runes-banner-${item.id}.png`;
  link.href = item.imageData;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Baixa o banner atual
 */
function downloadBanner() {
  if (!state.currentImage) return;
  
  const dataURL = state.canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `runes-banner-${Date.now()}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Compartilha o banner nas redes sociais
 * @param {string} platform - Plataforma para compartilhar (twitter, facebook, etc)
 */
function shareBanner(platform) {
  if (!state.currentImage) return;
  
  const dataURL = state.canvas.toDataURL('image/png');
  let url;
  
  switch (platform) {
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Confira meu banner RUNES Analytics Pro!')}&url=${encodeURIComponent(CONFIG.qrDefaults.url)}`;
      break;
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(CONFIG.qrDefaults.url)}`;
      break;
    case 'telegram':
      url = `https://t.me/share/url?url=${encodeURIComponent(CONFIG.qrDefaults.url)}&text=${encodeURIComponent('Confira meu banner RUNES Analytics Pro!')}`;
      break;
    default:
      url = CONFIG.qrDefaults.url;
  }
  
  window.open(url, '_blank');
}

/**
 * Exporta todos os estilos com o mesmo texto
 * @param {string} text - Texto para todos os banners
 * @returns {Promise<Array>} Lista de data URLs dos banners gerados
 */
async function exportAllStyles(text) {
  const styles = Object.keys(CONFIG.styles);
  const results = [];
  
  for (const style of styles) {
    // Configura o estado
    elements.styleSelect.value = style;
    elements.promptInput.value = text;
    
    // Gera o banner
    await generateBanner();
    
    // Salva o resultado
    results.push({
      style: style,
      dataURL: state.canvas.toDataURL('image/png')
    });
  }
  
  return results;
}

/**
 * Adiciona texto ao canvas com determinadas propriedades
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {string} text - Texto a ser adicionado
 * @param {number} x - Posição X
 * @param {number} y - Posição Y
 * @param {Object} options - Opções de estilo do texto
 */
function drawTextWithEffects(ctx, text, x, y, options) {
  const defaults = {
    font: '20px Arial',
    color: '#FFFFFF',
    align: 'center',
    baseline: 'middle',
    shadow: null,
    shadowBlur: 0,
    gradient: null,
    maxWidth: null
  };
  
  const settings = { ...defaults, ...options };
  
  // Configurações básicas
  ctx.font = settings.font;
  ctx.textAlign = settings.align;
  ctx.textBaseline = settings.baseline;
  
  // Sombra
  if (settings.shadow) {
    ctx.shadowColor = settings.shadow;
    ctx.shadowBlur = settings.shadowBlur;
  }
  
  // Estilo de preenchimento (cor sólida ou gradiente)
  if (settings.gradient) {
    ctx.fillStyle = settings.gradient;
  } else {
    ctx.fillStyle = settings.color;
  }
  
  // Desenha o texto
  if (settings.maxWidth) {
    ctx.fillText(text, x, y, settings.maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
  
  // Reseta as sombras
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Divide texto em múltiplas linhas para ajustar à largura máxima
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {string} text - Texto a ser dividido
 * @param {number} maxWidth - Largura máxima em pixels
 * @returns {Array} Lista de linhas de texto
 */
function getTextLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  lines.push(currentLine);
  return lines;
}

/**
 * Adiciona uma marca d'água ao banner
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} width - Largura do canvas
 * @param {number} height - Altura do canvas
 * @param {string} text - Texto da marca d'água
 */
function addWatermark(ctx, width, height, text) {
  ctx.save();
  ctx.font = '14px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, width - 20, height - 10);
  ctx.restore();
}

/**
 * Exporta um banner como arquivo
 * @param {HTMLCanvasElement} canvas - Canvas a ser exportado
 * @param {string} filename - Nome do arquivo
 * @param {string} type - Tipo de arquivo (image/png, image/jpeg)
 * @param {number} quality - Qualidade da imagem (0-1, apenas para JPEG)
 */
function exportCanvas(canvas, filename, type = 'image/png', quality = 0.9) {
  const link = document.createElement('a');
  
  if (type === 'image/jpeg') {
    link.href = canvas.toDataURL(type, quality);
  } else {
    link.href = canvas.toDataURL(type);
  }
  
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Aplica filtro de cores ao canvas
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} width - Largura do canvas
 * @param {number} height - Altura do canvas
 * @param {Object} filter - Configurações do filtro (brilho, contraste, saturação, etc)
 */
function applyFilter(ctx, width, height, filter) {
  const defaults = {
    brightness: 0,      // -1 a 1
    contrast: 0,        // -1 a 1
    saturation: 0,      // -1 a 1
    hue: 0,             // -180 a 180
    blur: 0             // 0+
  };
  
  const settings = { ...defaults, ...filter };
  
  // Aplica filtros CSS quando disponível
  const filters = [];
  
  if (settings.brightness !== 0) {
    const brightnessValue = 100 + settings.brightness * 100;
    filters.push(`brightness(${brightnessValue}%)`);
  }
  
  if (settings.contrast !== 0) {
    const contrastValue = 100 + settings.contrast * 100;
    filters.push(`contrast(${contrastValue}%)`);
  }
  
  if (settings.saturation !== 0) {
    const saturationValue = 100 + settings.saturation * 100;
    filters.push(`saturate(${saturationValue}%)`);
  }
  
  if (settings.hue !== 0) {
    filters.push(`hue-rotate(${settings.hue}deg)`);
  }
  
  if (settings.blur > 0) {
    filters.push(`blur(${settings.blur}px)`);
  }
  
  if (filters.length > 0) {
    // Cria um canvas temporário para aplicar os filtros
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copia a imagem do canvas original
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    // Limpa o canvas original
    ctx.clearRect(0, 0, width, height);
    
    // Desenha com os filtros aplicados
    ctx.filter = filters.join(' ');
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
  }
} 
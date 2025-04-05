/**
 * RUNES Analytics Pro - Gerador de Banners Neurais
 * 
 * Este módulo gerencia a geração de banners utilizando modelos de IA
 * para a plataforma RUNES Analytics Pro.
 */

// Configurações
const BANNER_CONFIG = {
  // Caminho para salvar os banners gerados
  savePath: 'media/awaken-banners/',
  
  // URL da API de difusão (em produção seria a API real)
  apiEndpoint: 'http://localhost:7860/sdapi/v1/txt2img',
  
  // Modelo padrão para geração
  defaultModel: 'dreamshaperXL',
  
  // Estilos disponíveis e seus prompts associados
  styles: {
    'cyberpunk': 'futuristic cyberpunk style, neon lights, dark atmosphere, digital world',
    'neural-glow': 'ethereal neural network visualization, glowing connections, advanced AI concept',
    'runes-art': 'ancient runes with modern tech aesthetic, mystical symbols, blockchain visualization',
    'bitcoin-abstract': 'abstract bitcoin imagery, crypto art, blockchain concept, digital currency'
  },
  
  // Informações de QR code
  qrDefaults: {
    url: 'https://runes.analytics.pro/demo',
    size: 200,
    colorDark: '#00ffff',
    colorLight: 'rgba(0,0,0,0.1)',
    position: 'bottom-right',
    style: 'neural-glow'
  },
  
  // Textos para diferentes idiomas
  translations: {
    'pt': {
      modalTitle: 'Gerador de Banners Neurais',
      promptPlaceholder: 'bitcoin neural light',
      generatePreview: 'Gerar Preview',
      saveBanner: 'Salvar Banner',
      awaiting: 'Aguardando geração...',
      generating: 'Gerando banner neural...',
      connecting: 'Conectando ao serviço neural...',
      processing: 'Processando imagem...',
      finalizing: 'Finalizando banner...',
      error: 'Erro na geração:',
      success: 'Banner gerado com sucesso!',
      saved: 'Banner salvo em',
      previewText: 'O banner gerado aparecerá aqui'
    },
    'en': {
      modalTitle: 'Neural Banner Generator',
      promptPlaceholder: 'bitcoin neural light',
      generatePreview: 'Generate Preview',
      saveBanner: 'Save Banner',
      awaiting: 'Awaiting generation...',
      generating: 'Generating neural banner...',
      connecting: 'Connecting to neural service...',
      processing: 'Processing image...',
      finalizing: 'Finalizing banner...',
      error: 'Generation error:',
      success: 'Banner successfully generated!',
      saved: 'Banner saved at',
      previewText: 'Generated banner will appear here'
    }
  }
};

// Estado atual do gerador
let generatorState = {
  currentImage: null,
  currentLanguage: 'pt',
  isGenerating: false,
  seed: Math.floor(Math.random() * 1000000000)
};

// Elementos do DOM
const modal = document.getElementById('banner-generator-modal');
const generateButton = document.getElementById('generate-banner-button');
const closeButton = document.querySelector('.close-modal');
const generatePreviewButton = document.getElementById('generate-preview-button');
const saveBannerButton = document.getElementById('save-banner-button');
const previewImage = document.getElementById('banner-preview-img');
const previewPlaceholder = document.getElementById('preview-placeholder');
const progressBar = document.querySelector('.progress-value');
const statusText = document.getElementById('generation-status-text');

// Inputs
const languageSelect = document.getElementById('banner-language');
const promptInput = document.getElementById('banner-prompt');
const styleSelect = document.getElementById('banner-style');
const resolutionSelect = document.getElementById('banner-resolution');
const qrSelect = document.getElementById('banner-qr');
const qrPositionSelect = document.getElementById('banner-qr-position');
const signatureCheckbox = document.getElementById('banner-signature');

/**
 * Inicializa a interface do gerador
 */
function initBannerGenerator() {
  // Adiciona event listeners
  generateButton.addEventListener('click', showModal);
  closeButton.addEventListener('click', hideModal);
  generatePreviewButton.addEventListener('click', handleGeneratePreview);
  saveBannerButton.addEventListener('click', handleSaveBanner);
  
  // Fecha o modal ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });
  
  // Atualiza interface quando o idioma muda
  languageSelect.addEventListener('change', (e) => {
    generatorState.currentLanguage = e.target.value;
    updateInterfaceText();
  });
  
  // Expõe a função para o console
  window.generateBanner = generateBanner;
  
  // Inicializa texto da interface
  updateInterfaceText();
}

/**
 * Atualiza os textos da interface de acordo com o idioma selecionado
 */
function updateInterfaceText() {
  const lang = generatorState.currentLanguage;
  const texts = BANNER_CONFIG.translations[lang];
  
  document.querySelector('.modal-header h3').textContent = texts.modalTitle;
  promptInput.placeholder = texts.promptPlaceholder;
  generatePreviewButton.innerHTML = `<i class="fas fa-magic"></i> ${texts.generatePreview}`;
  saveBannerButton.innerHTML = `<i class="fas fa-save"></i> ${texts.saveBanner}`;
  statusText.textContent = texts.awaiting;
  
  document.querySelector('#preview-placeholder p').textContent = texts.previewText;
}

/**
 * Mostra o modal do gerador
 */
function showModal() {
  modal.style.display = 'block';
  // Reset de estado
  resetProgress();
  saveBannerButton.disabled = true;
}

/**
 * Esconde o modal do gerador
 */
function hideModal() {
  modal.style.display = 'none';
  if (generatorState.isGenerating) {
    // Aqui podemos adicionar código para cancelar geração em andamento se necessário
    generatorState.isGenerating = false;
  }
}

/**
 * Manipula o clique no botão de gerar preview
 */
async function handleGeneratePreview() {
  if (generatorState.isGenerating) return;
  
  // Reseta e prepara para nova geração
  resetProgress();
  previewImage.style.display = 'none';
  previewPlaceholder.style.display = 'flex';
  saveBannerButton.disabled = true;
  
  // Obtém valores do formulário
  const language = languageSelect.value;
  const prompt = promptInput.value;
  const style = styleSelect.value;
  
  try {
    // Inicia geração
    const image = await generateBanner(language, prompt, {
      style: style,
      resolution: resolutionSelect.value,
      includeQR: qrSelect.value === 'true',
      qrPosition: qrPositionSelect.value,
      includeSignature: signatureCheckbox.checked
    });
    
    // Exibe o resultado
    updateProgress(100, BANNER_CONFIG.translations[language].success);
    displayImage(image);
    
    // Habilita botão de salvar
    saveBannerButton.disabled = false;
    
    // Armazena a imagem gerada
    generatorState.currentImage = image;
    
  } catch (error) {
    console.error('Erro ao gerar banner:', error);
    const errorText = `${BANNER_CONFIG.translations[language].error} ${error.message}`;
    updateProgress(0, errorText);
  }
}

/**
 * Manipula o clique no botão de salvar banner
 */
async function handleSaveBanner() {
  if (!generatorState.currentImage) return;
  
  const lang = generatorState.currentLanguage;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${BANNER_CONFIG.savePath}runes-banner-${lang}-${timestamp}.png`;
  
  try {
    // Aqui simulamos o salvamento do banner (em produção, usaríamos APIs reais)
    // Em uma aplicação real, este arquivo seria salvo no servidor através de uma API
    console.log(`Banner salvo em ${filename}`);
    
    // Atualiza status
    const saveText = `${BANNER_CONFIG.translations[lang].saved} ${filename}`;
    updateProgress(100, saveText);
    
    // Disparamos um evento sintético para informar que o banner foi salvo
    const savedEvent = new CustomEvent('banner:saved', { 
      detail: { 
        path: filename,
        language: lang,
        timestamp: timestamp 
      } 
    });
    document.dispatchEvent(savedEvent);
    
  } catch (error) {
    console.error('Erro ao salvar banner:', error);
    updateProgress(0, `${BANNER_CONFIG.translations[lang].error} ${error.message}`);
  }
}

/**
 * Gera um banner neural com base nos parâmetros fornecidos
 * 
 * @param {string} language - Idioma do banner ('pt' ou 'en')
 * @param {string} prompt - Descrição textual para geração
 * @param {Object} options - Opções adicionais
 * @returns {Promise<string>} - URL de dados da imagem gerada
 */
async function generateBanner(language, prompt, options = {}) {
  if (generatorState.isGenerating) {
    throw new Error('Já existe uma geração em andamento');
  }
  
  generatorState.isGenerating = true;
  const texts = BANNER_CONFIG.translations[language || 'pt'];
  
  try {
    // Configura opções com valores padrão
    const config = {
      style: options.style || 'cyberpunk',
      resolution: options.resolution || '1920x1080',
      includeQR: options.includeQR !== undefined ? options.includeQR : true,
      qrPosition: options.qrPosition || BANNER_CONFIG.qrDefaults.position,
      includeSignature: options.includeSignature !== undefined ? options.includeSignature : true
    };
    
    // Cria um prompt final combinando o prompt do usuário e o estilo
    const stylePrompt = BANNER_CONFIG.styles[config.style] || '';
    const fullPrompt = `${prompt}, ${stylePrompt}, RUNES Analytics Pro, high quality, detailed, 8k, ultra hd`;
    
    // Passo 1: Conectando ao serviço de IA
    updateProgress(10, texts.connecting);
    await simulateDelay(500); // Simula tempo de conexão

    // Passo 2: Gerando imagem base
    updateProgress(30, texts.generating);
    const image = await simulateImageGeneration(fullPrompt, config.resolution);
    
    // Passo 3: Processando a imagem (adicionar QR code, etc)
    updateProgress(70, texts.processing);
    await simulateDelay(800);
    
    // Passo 4: Finalizando
    updateProgress(90, texts.finalizing);
    await simulateDelay(500);
    
    generatorState.isGenerating = false;
    return image;
    
  } catch (error) {
    generatorState.isGenerating = false;
    throw error;
  }
}

/**
 * Simula a geração de imagem (em produção, chamaria uma API real)
 * 
 * @param {string} prompt - Prompt para geração
 * @param {string} resolution - Resolução da imagem
 * @returns {Promise<string>} - URL de dados da imagem
 */
async function simulateImageGeneration(prompt, resolution) {
  // Simula o tempo de geração da imagem
  await simulateDelay(2000);
  
  // Aqui estamos apenas simulando uma resposta
  // Em uma implementação real, faríamos uma chamada à API de difusão
  
  // Para fins de demonstração, retornamos uma imagem de placeholder
  // No código real, seria o resultado da API de difusão
  const [width, height] = resolution.split('x').map(Number);
  
  // Gera uma imagem de teste com gradiente baseado na seed
  const placeholderImg = generatePlaceholderImage(width, height, generatorState.seed);
  generatorState.seed = (generatorState.seed + 1) % 1000000000;
  
  return placeholderImg;
}

/**
 * Simula um atraso para propósitos de demonstração
 * 
 * @param {number} ms - Tempo em milissegundos
 * @returns {Promise<void>}
 */
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gera uma imagem de placeholder para simulação
 * 
 * @param {number} width - Largura da imagem
 * @param {number} height - Altura da imagem
 * @param {number} seed - Seed para determinismo
 * @returns {string} - URL de dados da imagem
 */
function generatePlaceholderImage(width, height, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Cria um gradiente baseado na seed
  const r = seed % 255;
  const g = (seed * 13) % 255;
  const b = (seed * 29) % 255;
  
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
  gradient.addColorStop(1, `rgb(${(b + 100) % 255}, ${(r + 50) % 255}, ${(g + 150) % 255})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Adiciona alguns círculos para simular padrões neurais
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 20; i++) {
    const x = Math.floor((seed * (i + 1)) % width);
    const y = Math.floor((seed * (i + 3)) % height);
    const radius = 20 + Math.floor((seed * (i + 5)) % 100);
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Adiciona texto "RUNES Analytics Pro"
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('RUNES Analytics Pro', width / 2, height / 2);
  
  // Adiciona texto "Demo Banner"
  ctx.font = '24px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('Demo Banner', width / 2, height / 2 + 40);
  
  return canvas.toDataURL('image/png');
}

/**
 * Atualiza a barra de progresso e o texto de status
 * 
 * @param {number} percent - Porcentagem de progresso (0-100)
 * @param {string} statusMessage - Mensagem de status
 */
function updateProgress(percent, statusMessage) {
  progressBar.style.width = `${percent}%`;
  statusText.textContent = statusMessage;
  
  // Adiciona classe de erro para mensagens de erro
  if (percent === 0 && statusMessage.includes('Erro')) {
    statusText.classList.add('error');
  } else {
    statusText.classList.remove('error');
  }
}

/**
 * Reseta o progresso para o estado inicial
 */
function resetProgress() {
  progressBar.style.width = '0%';
  statusText.textContent = BANNER_CONFIG.translations[generatorState.currentLanguage].awaiting;
  statusText.classList.remove('error');
}

/**
 * Exibe a imagem gerada na interface
 * 
 * @param {string} imageDataUrl - URL de dados da imagem
 */
function displayImage(imageDataUrl) {
  previewImage.src = imageDataUrl;
  previewImage.style.display = 'block';
  previewPlaceholder.style.display = 'none';
}

// Inicializa o gerador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initBannerGenerator);

// Expõe a função para uso externo via console
window.generateBanner = generateBanner; 
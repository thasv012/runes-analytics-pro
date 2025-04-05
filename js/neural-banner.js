/**
 * RUNES Analytics Pro - Neural Banner Generator
 * 
 * Este módulo implementa a interface do gerador de banners usando canvas
 * diretamente no navegador.
 */

// Configurações
const CONFIG = {
  // Configurações padrão do banner
  defaults: {
    language: 'pt',
    style: 'cyberpunk',
    resolution: '1280x720',
    includeQR: true,
    qrPosition: 'bottom-right',
    includeSignature: true
  },
  
  // Diretório para salvar os banners (usado apenas para exibição)
  savePath: 'media/awaken-banners/',
  
  // Estilos disponíveis e seus prompts associados
  styles: {
    'cyberpunk': 'futuristic cyberpunk style, neon lights, dark atmosphere, digital world',
    'neural-glow': 'ethereal neural network visualization, glowing connections, advanced AI concept',
    'runes-art': 'ancient runes with modern tech aesthetic, mystical symbols, blockchain visualization',
    'bitcoin-abstract': 'abstract bitcoin imagery, crypto art, blockchain concept, digital currency'
  },
  
  // Prompts aleatórios para o botão de randomizar
  randomPrompts: [
    'bitcoin future digital network',
    'satoshi vision blockchain',
    'neural runes financial freedom',
    'cryptocurrency evolution',
    'bitcoin security network',
    'digital gold ecosystem',
    'runes token economy',
    'decentralized finance web3',
    'blockchain intelligence',
    'bitcoin ecosystem analysis'
  ],
  
  // Informações de QR code
  qrDefaults: {
    url: 'https://runes.analytics.pro/demo',
    size: 200,
    colorDark: '#00ffff',
    colorLight: 'rgba(0,0,0,0.1)',
    margin: 20
  },
  
  // Configuração de assinatura
  signature: {
    text: '🦉 Node Owl :: Thierry BTC',
    font: '20px Arial',
    color: 'rgba(255,255,255,0.7)'
  },
  
  // Histórico salvo em localStorage
  historyKey: 'runes_banner_history',
  historyMaxItems: 6,
  
  // Textos para diferentes idiomas
  translations: {
    'pt': {
      panelTitle: 'Gerador de Banners',
      promptLabel: 'Prompt:',
      promptPlaceholder: 'bitcoin neural light',
      randomPrompt: 'Prompt aleatório',
      styleLabel: 'Estilo:',
      resolutionLabel: 'Resolução:',
      qrLabel: 'Incluir QR Code',
      qrPositionLabel: 'Posição do QR:',
      signatureLabel: 'Incluir assinatura',
      generateText: 'Gerar Banner',
      downloadText: 'Baixar',
      statusReady: 'Pronto para gerar',
      statusGenerating: 'Gerando banner neural...',
      statusProcessing: 'Processando imagem...',
      statusComplete: 'Banner gerado com sucesso!',
      statusError: 'Erro na geração:',
      previewText: 'Seu banner aparecerá aqui',
      historyTitle: 'Banners recentes',
      backLink: 'Voltar ao Painel',
      qrPositions: {
        'bottom-right': 'Inferior Direito',
        'bottom-left': 'Inferior Esquerdo',
        'top-right': 'Superior Direito',
        'top-left': 'Superior Esquerdo'
      },
      styles: {
        'cyberpunk': 'Cyberpunk',
        'neural-glow': 'Neural Glow',
        'runes-art': 'Runes Art',
        'bitcoin-abstract': 'Bitcoin Abstract'
      }
    },
    'en': {
      panelTitle: 'Banner Generator',
      promptLabel: 'Prompt:',
      promptPlaceholder: 'bitcoin neural light',
      randomPrompt: 'Random Prompt',
      styleLabel: 'Style:',
      resolutionLabel: 'Resolution:',
      qrLabel: 'Include QR Code',
      qrPositionLabel: 'QR Position:',
      signatureLabel: 'Include signature',
      generateText: 'Generate Banner',
      downloadText: 'Download',
      statusReady: 'Ready to generate',
      statusGenerating: 'Generating neural banner...',
      statusProcessing: 'Processing image...',
      statusComplete: 'Banner successfully generated!',
      statusError: 'Generation error:',
      previewText: 'Your banner will appear here',
      historyTitle: 'Recent Banners',
      backLink: 'Back to Dashboard',
      qrPositions: {
        'bottom-right': 'Bottom Right',
        'bottom-left': 'Bottom Left',
        'top-right': 'Top Right',
        'top-left': 'Top Left'
      },
      styles: {
        'cyberpunk': 'Cyberpunk',
        'neural-glow': 'Neural Glow',
        'runes-art': 'Runes Art',
        'bitcoin-abstract': 'Bitcoin Abstract'
      }
    }
  }
};

// Estado atual da aplicação
let state = {
  currentLanguage: CONFIG.defaults.language,
  isGenerating: false,
  canvas: null,
  ctx: null,
  currentImage: null,
  history: [],
  seed: Math.floor(Math.random() * 1000000000),
  isDarkTheme: true
};

// Elementos do DOM
const elements = {
  // Seletores principais
  languageSelector: document.getElementById('language-selector'),
  themeToggle: document.getElementById('theme-toggle'),
  
  // Painel de controle
  panelTitle: document.getElementById('panel-title'),
  promptInput: document.getElementById('prompt-input'),
  promptLabel: document.getElementById('prompt-label'),
  randomPromptBtn: document.getElementById('random-prompt'),
  styleSelect: document.getElementById('style-select'),
  styleLabel: document.getElementById('style-label'),
  resolutionSelect: document.getElementById('resolution-select'),
  resolutionLabel: document.getElementById('resolution-label'),
  includeQR: document.getElementById('include-qr'),
  qrLabel: document.getElementById('qr-label'),
  qrOptions: document.getElementById('qr-options'),
  qrPosition: document.getElementById('qr-position'),
  qrPositionLabel: document.getElementById('qr-position-label'),
  includeSignature: document.getElementById('include-signature'),
  signatureLabel: document.getElementById('signature-label'),
  generateButton: document.getElementById('generate-button'),
  generateText: document.getElementById('generate-text'),
  downloadButton: document.getElementById('download-button'),
  downloadText: document.getElementById('download-text'),
  progressValue: document.getElementById('progress-value'),
  statusText: document.getElementById('status-text'),
  
  // Preview
  previewContainer: document.querySelector('.preview-container'),
  previewPlaceholder: document.getElementById('preview-placeholder'),
  previewText: document.getElementById('preview-text'),
  canvas: document.getElementById('banner-canvas'),
  
  // História
  historyTitle: document.getElementById('history-title'),
  historyContainer: document.getElementById('history-container'),
  historyItemTemplate: document.getElementById('history-item-template'),
  
  // Rodapé
  backLink: document.getElementById('back-link')
};

/**
 * Inicializa a aplicação
 */
function init() {
  // Inicializa o canvas
  state.canvas = elements.canvas;
  state.ctx = state.canvas.getContext('2d');
  
  // Carrega o histórico do localStorage
  loadHistory();
  
  // Configura os event listeners
  setupEventListeners();
  
  // Atualiza a interface para o idioma atual
  updateInterface();
  
  // Atualiza a visibilidade das opções de QR com base no estado inicial
  updateQROptionsVisibility();
  
  // Define a resolução padrão
  updateCanvasResolution();
  
  console.log('Neural Banner Generator initialized');
}

/**
 * Configura event listeners para a interação do usuário
 */
function setupEventListeners() {
  // Alteração de idioma
  elements.languageSelector.addEventListener('change', (e) => {
    state.currentLanguage = e.target.value;
    updateInterface();
  });
  
  // Alteração de tema
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // Prompt aleatório
  elements.randomPromptBtn.addEventListener('click', setRandomPrompt);
  
  // Toggle de QR code
  elements.includeQR.addEventListener('change', updateQROptionsVisibility);
  
  // Alteração de resolução
  elements.resolutionSelect.addEventListener('change', updateCanvasResolution);
  
  // Botão gerar
  elements.generateButton.addEventListener('click', generateBanner);
  
  // Botão download
  elements.downloadButton.addEventListener('click', downloadBanner);
}

/**
 * Atualiza a interface com base no idioma selecionado
 */
function updateInterface() {
  const texts = CONFIG.translations[state.currentLanguage];
  
  // Atualiza os textos da interface
  elements.panelTitle.textContent = texts.panelTitle;
  elements.promptLabel.textContent = texts.promptLabel;
  elements.promptInput.placeholder = texts.promptPlaceholder;
  elements.randomPromptBtn.title = texts.randomPrompt;
  elements.styleLabel.textContent = texts.styleLabel;
  elements.resolutionLabel.textContent = texts.resolutionLabel;
  elements.qrLabel.textContent = texts.qrLabel;
  elements.qrPositionLabel.textContent = texts.qrPositionLabel;
  elements.signatureLabel.textContent = texts.signatureLabel;
  elements.generateText.textContent = texts.generateText;
  elements.downloadText.textContent = texts.downloadText;
  elements.previewText.textContent = texts.previewText;
  elements.historyTitle.textContent = texts.historyTitle;
  elements.backLink.textContent = texts.backLink;
  elements.statusText.textContent = texts.statusReady;
  
  // Atualiza as opções de posição do QR
  updateSelectOptions(elements.qrPosition, texts.qrPositions);
  
  // Atualiza as opções de estilo
  updateSelectOptions(elements.styleSelect, texts.styles);
  
  // Renderiza o histórico com o novo idioma
  renderHistory();
}

/**
 * Atualiza as opções de um elemento select
 */
function updateSelectOptions(selectElement, options) {
  // Salva a opção selecionada atualmente
  const currentValue = selectElement.value;
  
  // Limpa as opções existentes
  selectElement.innerHTML = '';
  
  // Adiciona as novas opções
  for (const [value, label] of Object.entries(options)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    selectElement.appendChild(option);
  }
  
  // Restaura a opção selecionada
  selectElement.value = currentValue;
}

/**
 * Alterna entre os temas claro e escuro
 */
function toggleTheme() {
  state.isDarkTheme = !state.isDarkTheme;
  
  if (state.isDarkTheme) {
    document.body.classList.remove('light-theme');
    elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.body.classList.add('light-theme');
    elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

/**
 * Define um prompt aleatório
 */
function setRandomPrompt() {
  const randomIndex = Math.floor(Math.random() * CONFIG.randomPrompts.length);
  elements.promptInput.value = CONFIG.randomPrompts[randomIndex];
  
  // Animação simples para feedback
  elements.promptInput.classList.add('highlight');
  setTimeout(() => {
    elements.promptInput.classList.remove('highlight');
  }, 500);
}

/**
 * Atualiza a visibilidade das opções de QR code
 */
function updateQROptionsVisibility() {
  if (elements.includeQR.checked) {
    elements.qrOptions.classList.remove('hidden');
  } else {
    elements.qrOptions.classList.add('hidden');
  }
}

/**
 * Atualiza a resolução do canvas
 */
function updateCanvasResolution() {
  const [width, height] = elements.resolutionSelect.value.split('x').map(Number);
  
  // Define o tamanho do canvas
  state.canvas.width = width;
  state.canvas.height = height;
  
  // Se houver uma imagem atual, redimensiona-a para a nova resolução
  if (state.currentImage) {
    state.ctx.drawImage(state.currentImage, 0, 0, width, height);
  }
}

/**
 * Inicia o processo de geração do banner
 */
async function generateBanner() {
  // Evita múltiplas gerações simultâneas
  if (state.isGenerating) return;
  
  state.isGenerating = true;
  const texts = CONFIG.translations[state.currentLanguage];

  try {
    // Atualiza a interface para mostrar o progresso
    updateProgress(10, texts.statusGenerating);
    elements.downloadButton.disabled = true;
    elements.previewPlaceholder.style.display = 'none';
    elements.canvas.style.display = 'block';
    
    // Obtém os parâmetros da interface
    const prompt = elements.promptInput.value || texts.promptPlaceholder;
    const style = elements.styleSelect.value;
    const stylePrompt = CONFIG.styles[style] || '';
    const includeQR = elements.includeQR.checked;
    const qrPosition = elements.qrPosition.value;
    const includeSignature = elements.includeSignature.checked;
    
    // Combina o prompt do usuário com o do estilo
    const fullPrompt = `${prompt}, ${stylePrompt}, RUNES Analytics Pro, high quality`;
    
    // Fase 1: Gera a imagem base
    await simulateDelay(800); // Simulação de tempo de processamento
    updateProgress(30, texts.statusGenerating);
    
    // Gera a imagem base com o estilo selecionado
    await drawBackground(style, fullPrompt);
    
    // Fase 2: Processa a imagem (adiciona QR code, etc)
    updateProgress(60, texts.statusProcessing);
    await simulateDelay(600);
    
    // Adiciona QR Code se necessário
    if (includeQR) {
      await drawQRCode(qrPosition);
    }
    
    // Adiciona assinatura se necessário
    if (includeSignature) {
      drawSignature();
    }
    
    // Fase 3: Finaliza
    updateProgress(90, texts.statusProcessing);
    await simulateDelay(400);
    
    // Salva a imagem no estado atual
    state.currentImage = state.canvas;
    
    // Adiciona ao histórico
    addToHistory(state.canvas.toDataURL('image/png'), prompt, style);
    
    // Atualiza a interface para mostrar que a geração está concluída
    updateProgress(100, texts.statusComplete);
    elements.downloadButton.disabled = false;
    elements.downloadButton.classList.add('download-ready');
    setTimeout(() => {
      elements.downloadButton.classList.remove('download-ready');
    }, 3000);
    
  } catch (error) {
    console.error('Error generating banner:', error);
    elements.statusText.textContent = `${texts.statusError} ${error.message}`;
    elements.statusText.classList.add('error');
  } finally {
    state.isGenerating = false;
  }
}

/**
 * Desenha o fundo do banner com base no estilo selecionado
 */
async function drawBackground(style, prompt) {
  const ctx = state.ctx;
  const canvas = state.canvas;
  const width = canvas.width;
  const height = canvas.height;
  
  // Calcula uma seed baseada no prompt para determinismo
  let seed = state.seed;
  for (let i = 0; i < prompt.length; i++) {
    seed = ((seed << 5) - seed) + prompt.charCodeAt(i);
    seed = seed & seed; // Converte para 32bit integer
  }
  seed = Math.abs(seed);
  
  // Limpa o canvas
  ctx.clearRect(0, 0, width, height);
  
  // Desenha o fundo com base no estilo
  switch (style) {
    case 'cyberpunk':
      drawCyberpunkBackground(ctx, width, height, seed);
      break;
    case 'neural-glow':
      drawNeuralGlowBackground(ctx, width, height, seed);
      break;
    case 'runes-art':
      drawRunesArtBackground(ctx, width, height, seed);
      break;
    case 'bitcoin-abstract':
      drawBitcoinAbstractBackground(ctx, width, height, seed);
      break;
    default:
      drawCyberpunkBackground(ctx, width, height, seed);
  }
  
  // Adiciona o título "RUNES Analytics Pro"
  drawTitle();
}

// Inicializa o aplicativo quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', init); 
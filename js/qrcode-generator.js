/**
 * RUNES Analytics Pro - Gerador de QR Code Multilíngue
 * 
 * Este módulo gera QR Codes que apontam para a aplicação com o parâmetro
 * de idioma correspondente ao idioma atualmente selecionado.
 */

// Importa a biblioteca QRCode.js se disponível no escopo global
const QRCode = window.QRCode || null;

// Configurações do gerador de QR Code
const qrCodeConfig = {
  baseUrl: 'https://thierrybtc.github.io/runes-analytics-pro',  // URL base para o QR Code
  defaultPage: '/api-demo.html',  // Página padrão para o QR Code
  qrSize: 200,  // Tamanho padrão do QR Code em pixels
  colorDark: '#00ffff',  // Cor principal do QR Code
  colorLight: '#001a1a',  // Cor de fundo do QR Code
  containerClass: 'qr-code-container',  // Classe CSS para o container
  logoSize: 60,  // Tamanho do logo no centro do QR Code
  margin: 2,  // Margem do QR Code
  logoUrl: 'assets/images/logo-icon.png'  // URL do logo (opcional)
};

// Cache para QR Codes gerados
const qrCodeCache = {};

/**
 * Inicializa o gerador de QR Code
 */
function initQRCodeGenerator() {
  // Verifica se a biblioteca QRCode.js está disponível
  if (!QRCode && !window.QRCode) {
    console.warn('QRCode.js não encontrado. O gerador de QR Code não funcionará.');
    loadQRCodeLibrary();
    return;
  }
  
  // Busca todos os elementos com o atributo data-qrcode
  document.querySelectorAll('[data-qrcode]').forEach(element => {
    // Gera o QR Code para o elemento
    generateQRCodeForElement(element);
  });
  
  // Observa mudanças de idioma
  document.addEventListener('languageChanged', (event) => {
    if (event.detail && event.detail.language) {
      // Atualiza todos os QR Codes com o novo idioma
      updateAllQRCodes(event.detail.language);
    }
  });
}

/**
 * Carrega a biblioteca QRCode.js se não estiver disponível
 */
function loadQRCodeLibrary() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/qrcode.js@1.0.0/qrcode.min.js';
  script.onload = () => {
    console.log('QRCode.js carregado com sucesso.');
    // Inicializa o gerador após o carregamento da biblioteca
    setTimeout(initQRCodeGenerator, 100);
  };
  script.onerror = () => {
    console.error('Erro ao carregar QRCode.js. O gerador de QR Code não funcionará.');
  };
  document.head.appendChild(script);
}

/**
 * Gera um QR Code para um elemento específico
 * @param {HTMLElement} element - O elemento onde o QR Code será exibido
 */
function generateQRCodeForElement(element) {
  // Obtém as configurações do elemento
  const type = element.getAttribute('data-qrcode') || 'default';
  const size = parseInt(element.getAttribute('data-qrcode-size')) || qrCodeConfig.qrSize;
  const page = element.getAttribute('data-qrcode-page') || qrCodeConfig.defaultPage;
  
  // Obtém o idioma atual
  const language = document.documentElement.lang || getUserPreferredLang() || 'en';
  
  // Gera o QR Code
  generateQRCode(element, type, language, page, size);
}

/**
 * Atualiza todos os QR Codes com o novo idioma
 * @param {string} language - O novo idioma
 */
function updateAllQRCodes(language) {
  document.querySelectorAll('[data-qrcode]').forEach(element => {
    // Obtém as configurações do elemento
    const type = element.getAttribute('data-qrcode') || 'default';
    const size = parseInt(element.getAttribute('data-qrcode-size')) || qrCodeConfig.qrSize;
    const page = element.getAttribute('data-qrcode-page') || qrCodeConfig.defaultPage;
    
    // Regenera o QR Code
    generateQRCode(element, type, language, page, size);
  });
}

/**
 * Obtém o idioma preferido do usuário
 * @returns {string} - O código do idioma preferido
 */
function getUserPreferredLang() {
  // Verifica se há uma preferência salva
  const savedLang = localStorage.getItem('runesAnalyticsLanguage');
  
  // Verifica o idioma do navegador como fallback
  const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
  
  // Retorna o idioma preferido
  return savedLang || browserLang;
}

/**
 * Gera um QR Code para um elemento
 * @param {HTMLElement} element - O elemento onde o QR Code será exibido
 * @param {string} type - O tipo de QR Code a ser gerado
 * @param {string} language - O idioma atual
 * @param {string} page - A página para a qual o QR Code aponta
 * @param {number} size - O tamanho do QR Code em pixels
 */
function generateQRCode(element, type, language, page, size) {
  // Limpa o elemento
  element.innerHTML = '';
  
  // Cria o container do QR Code
  const container = document.createElement('div');
  container.className = qrCodeConfig.containerClass;
  element.appendChild(container);
  
  // Gera a URL com o parâmetro de idioma
  const url = generateMultilingualUrl(page, language);
  
  // Adiciona um título opcional
  if (element.hasAttribute('data-qrcode-title')) {
    const title = document.createElement('div');
    title.className = 'qr-code-title';
    
    // Usa o título baseado no idioma, se disponível
    const titleKey = element.getAttribute('data-qrcode-title');
    title.textContent = getTranslation(titleKey, language) || titleKey;
    
    container.appendChild(title);
  }
  
  // Cria o elemento para o QR Code
  const qrElement = document.createElement('div');
  qrElement.className = 'qr-code';
  container.appendChild(qrElement);
  
  // Verifica se deve mostrar a URL
  if (element.hasAttribute('data-qrcode-show-url')) {
    const urlElement = document.createElement('div');
    urlElement.className = 'qr-code-url';
    urlElement.textContent = url;
    container.appendChild(urlElement);
  }
  
  // Gera o QR Code
  try {
    new QRCode(qrElement, {
      text: url,
      width: size,
      height: size,
      colorDark: qrCodeConfig.colorDark,
      colorLight: qrCodeConfig.colorLight,
      correctLevel: QRCode.CorrectLevel.H
    });
    
    // Se houver um logo, adiciona-o ao centro do QR Code
    if (qrCodeConfig.logoUrl) {
      setTimeout(() => {
        addLogoToQRCode(qrElement, qrCodeConfig.logoUrl);
      }, 100);
    }
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    qrElement.textContent = 'Erro ao gerar QR Code';
  }
}

/**
 * Adiciona um logo ao centro do QR Code
 * @param {HTMLElement} qrElement - O elemento que contém o QR Code
 * @param {string} logoUrl - A URL do logo
 */
function addLogoToQRCode(qrElement, logoUrl) {
  // Verifica se o elemento existe
  if (!qrElement) return;
  
  // Cria o elemento para o logo
  const logoContainer = document.createElement('div');
  logoContainer.className = 'qr-code-logo';
  logoContainer.style.position = 'absolute';
  logoContainer.style.top = '50%';
  logoContainer.style.left = '50%';
  logoContainer.style.transform = 'translate(-50%, -50%)';
  logoContainer.style.width = `${qrCodeConfig.logoSize}px`;
  logoContainer.style.height = `${qrCodeConfig.logoSize}px`;
  logoContainer.style.background = qrCodeConfig.colorLight;
  logoContainer.style.borderRadius = '50%';
  logoContainer.style.padding = '5px';
  logoContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  logoContainer.style.display = 'flex';
  logoContainer.style.alignItems = 'center';
  logoContainer.style.justifyContent = 'center';
  
  // Cria a imagem do logo
  const logo = document.createElement('img');
  logo.src = logoUrl;
  logo.style.width = '80%';
  logo.style.height = '80%';
  logo.style.objectFit = 'contain';
  
  // Adiciona a imagem ao container do logo
  logoContainer.appendChild(logo);
  
  // Define o container do QR Code como relativo para posicionar o logo
  qrElement.style.position = 'relative';
  
  // Adiciona o logo ao QR Code
  qrElement.appendChild(logoContainer);
}

/**
 * Gera uma URL com o parâmetro de idioma
 * @param {string} page - A página para a qual a URL aponta
 * @param {string} language - O idioma atual
 * @returns {string} - A URL completa com o parâmetro de idioma
 */
function generateMultilingualUrl(page, language) {
  // Verifica se a página já tem parâmetros
  const hasParams = page.includes('?');
  
  // Constrói a URL completa
  let url = `${qrCodeConfig.baseUrl}${page}`;
  
  // Adiciona o parâmetro de idioma
  url += hasParams ? `&lang=${language}` : `?lang=${language}`;
  
  return url;
}

/**
 * Cria um QR Code programaticamente e o adiciona a um elemento
 * @param {string} selector - O seletor CSS do elemento onde o QR Code será adicionado
 * @param {object} options - Opções para a geração do QR Code
 */
function createQRCode(selector, options = {}) {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`Elemento não encontrado: ${selector}`);
    return;
  }
  
  // Define os atributos data-qrcode no elemento
  element.setAttribute('data-qrcode', options.type || 'default');
  
  if (options.page) {
    element.setAttribute('data-qrcode-page', options.page);
  }
  
  if (options.size) {
    element.setAttribute('data-qrcode-size', options.size);
  }
  
  if (options.title) {
    element.setAttribute('data-qrcode-title', options.title);
  }
  
  if (options.showUrl) {
    element.setAttribute('data-qrcode-show-url', 'true');
  }
  
  // Gera o QR Code
  generateQRCodeForElement(element);
}

// Inicializa o gerador quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQRCodeGenerator);
} else {
  initQRCodeGenerator();
}

// Exporta as funções públicas
export {
  createQRCode,
  generateQRCode,
  updateAllQRCodes,
  getUserPreferredLang
}; 
/**
 * RUNES Analytics Pro - AwakenQRCode Module
 * Sistema neural para geração de QR Codes multilíngues e links sociais estilizados
 * @author Node Owl // TH // Mesh-Awake 0x777
 */

// Links sociais para a malha RUNES
const SOCIAL_LINKS = {
  Twitter: {
    url: "https://twitter.com/runesanalytics",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="neural-icon"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>`
  },
  GitHub: {
    url: "https://github.com/thierrybtc/runes-analytics-pro",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="neural-icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`
  },
  Discord: {
    url: "https://discord.gg/awakenet",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="neural-icon"><path d="M18 9a5 5 0 0 0-5-5H5a5 5 0 0 0-5 5v5a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V9zM10 10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10zM14 10C13.4477 10 13 10.4477 13 11C13 11.5523 13.4477 12 14 12C14.5523 12 15 11.5523 15 11C15 10.4477 14.5523 10 14 10z"></path><path d="M4.5 16.5c3 2 6 2 7.5 2c1.5 0 4.5 0 7.5-2"></path></svg>`
  },
  Medium: {
    url: "https://medium.com/@runesanalytics",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="neural-icon"><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm12.3 10.94l.955.954v.05h-4.921v-.05l1.004-.954c.1-.1.15-.2.15-.351V8.114c0-.252 0-.603.051-.904l-3.314 8.285h-.05L7.76 7.159v5.556c0 .252.1.553.25.754l1.455 1.776v.05H5.76v-.05l1.455-1.776c.15-.201.25-.502.25-.754V7.664c0-.2-.05-.351-.15-.452l-1.254-1.507v-.05h4.417l3.615 7.934 3.16-7.934h4.317v.05l-1.255 1.507c-.1.1-.15.151-.15.352v6.925c0 .151.05.251.15.351z"></path></svg>`
  }
};

// Traduções para os elementos do módulo
const TRANSLATIONS = {
  pt: {
    socialTitle: "📡 Awaken Links",
    qrTitle: "Escaneie para Conectar",
    copyLink: "Copiar Link 🔗",
    copySuccess: "Link copiado!",
    networkTitle: "Rede Neural",
    followUs: "Siga-nos"
  },
  en: {
    socialTitle: "📡 Awaken Links",
    qrTitle: "Scan to Connect",
    copyLink: "Copy Link 🔗",
    copySuccess: "Link copied!",
    networkTitle: "Neural Network",
    followUs: "Follow Us"
  }
};

// Detecta idioma do navegador com fallback para inglês
function getLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('pt') ? 'pt' : 'en';
}

// Traduz textos com base no idioma atual
function translate(key) {
  const lang = getLanguage();
  const translations = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return translations[key] || key;
}

// Injeta links sociais no container especificado
function injectSocialLinks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} não encontrado`);
    return;
  }

  // Cria o título do painel
  const title = document.createElement('h3');
  title.className = 'social-title';
  title.innerHTML = translate('socialTitle');
  container.appendChild(title);

  // Adiciona o subtítulo
  const subtitle = document.createElement('p');
  subtitle.className = 'social-subtitle';
  subtitle.innerHTML = translate('followUs');
  container.appendChild(subtitle);

  // Cria o container de links
  const linksContainer = document.createElement('div');
  linksContainer.className = 'social-links-grid';
  container.appendChild(linksContainer);

  // Adiciona cada link social com seu ícone
  Object.entries(SOCIAL_LINKS).forEach(([name, { url, icon }]) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'social-link neon-highlight';
    link.title = name;
    link.setAttribute('data-network', name.toLowerCase());
    
    // Adiciona o ícone SVG
    link.innerHTML = icon;
    
    // Adiciona o nome da rede
    const nameSpan = document.createElement('span');
    nameSpan.className = 'social-name';
    nameSpan.textContent = name;
    link.appendChild(nameSpan);
    
    linksContainer.appendChild(link);
  });

  // Injeta estilos específicos para os links sociais
  injectStyles();
}

// Carrega a biblioteca de QR Code dinamicamente
function loadQRCodeLibrary() {
  return new Promise((resolve, reject) => {
    if (window.QRCode) {
      resolve(window.QRCode);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.onload = () => resolve(window.QRCode);
    script.onerror = () => reject(new Error('Falha ao carregar biblioteca QRCode'));
    document.head.appendChild(script);
  });
}

// Gera o QR Code multilíngue para o contêiner especificado
async function generateMultilingualQRCode(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} não encontrado`);
    return;
  }

  // Determina o idioma e cria a URL
  const lang = getLanguage();
  const url = `https://thierrybtc.github.io/runes-analytics-pro/api-demo.html?lang=${lang}`;
  
  // Limpa o container
  container.innerHTML = '';
  
  // Cria o título
  const title = document.createElement('h3');
  title.className = 'qr-title';
  title.innerHTML = translate('qrTitle');
  container.appendChild(title);
  
  // Cria o container para o QR code
  const qrContainer = document.createElement('div');
  qrContainer.className = 'qr-container';
  qrContainer.id = `${containerId}-qr`;
  container.appendChild(qrContainer);
  
  // Adiciona a aura energética (decoração)
  const qrAura = document.createElement('div');
  qrAura.className = 'qr-aura';
  qrContainer.appendChild(qrAura);
  
  try {
    // Carrega a biblioteca QRCode
    const QRCode = await loadQRCodeLibrary();
    
    // Cria o QR code com cores personalizadas
    new QRCode(qrContainer, {
      text: url,
      width: 180,
      height: 180,
      colorDark: "#5ce1e6",
      colorLight: "#1a1a2e",
      correctLevel: QRCode.CorrectLevel.H
    });
    
    // Adiciona o botão para copiar o link
    const copyButton = document.createElement('button');
    copyButton.className = 'qr-copy-button';
    copyButton.innerHTML = translate('copyLink');
    copyButton.onclick = () => {
      navigator.clipboard.writeText(url).then(() => {
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = translate('copySuccess');
        copyButton.classList.add('copied');
        
        setTimeout(() => {
          copyButton.innerHTML = originalText;
          copyButton.classList.remove('copied');
        }, 2000);
      });
    };
    
    container.appendChild(copyButton);
    
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    const errorMsg = document.createElement('p');
    errorMsg.className = 'qr-error';
    errorMsg.textContent = 'Erro ao gerar QR code. Por favor, tente novamente.';
    container.appendChild(errorMsg);
  }
}

// Injeta estilos adicionais específicos dos elementos
function injectStyles() {
  // Verifica se os estilos já foram injetados
  if (document.getElementById('awaken-qrcode-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'awaken-qrcode-styles';
  style.textContent = `
    /* Estilos para links sociais */
    .social-links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .social-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: #5ce1e6;
      padding: 10px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .social-link:hover {
      background: rgba(92, 225, 230, 0.1);
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(92, 225, 230, 0.2);
    }
    
    .social-name {
      margin-top: 5px;
      font-family: 'Orbitron', 'Rajdhani', sans-serif;
      font-size: 12px;
      letter-spacing: 1px;
    }
    
    .social-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 5px;
    }
    
    /* Estilos para QR code */
    .qr-container {
      position: relative;
      padding: 20px;
      margin: 20px auto;
      display: flex;
      justify-content: center;
      border-radius: 10px;
      overflow: hidden;
      background: rgba(26, 26, 46, 0.8);
    }
    
    .qr-aura {
      position: absolute;
      top: -20px;
      left: -20px;
      right: -20px;
      bottom: -20px;
      background: 
        radial-gradient(circle at center, rgba(92, 225, 230, 0.2) 0%, transparent 70%),
        radial-gradient(circle at 30% 70%, rgba(157, 78, 221, 0.3) 0%, transparent 60%);
      filter: blur(10px);
      z-index: 0;
      animation: pulse 4s infinite alternate ease-in-out;
    }
    
    .qr-container img {
      position: relative;
      z-index: 1;
      border-radius: 5px;
      box-shadow: 0 0 20px rgba(92, 225, 230, 0.3);
    }
    
    .qr-copy-button {
      background: linear-gradient(135deg, rgba(92, 225, 230, 0.2) 0%, rgba(157, 78, 221, 0.2) 100%);
      border: 1px solid rgba(92, 225, 230, 0.3);
      color: #5ce1e6;
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Rajdhani', sans-serif;
      font-size: 14px;
      transition: all 0.3s ease;
      margin-top: 15px;
      position: relative;
      overflow: hidden;
    }
    
    .qr-copy-button:hover {
      background: linear-gradient(135deg, rgba(92, 225, 230, 0.3) 0%, rgba(157, 78, 221, 0.3) 100%);
      box-shadow: 0 0 15px rgba(92, 225, 230, 0.4);
    }
    
    .qr-copy-button.copied {
      background: rgba(92, 225, 230, 0.3);
      color: white;
    }
    
    .qr-copy-button:before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: rgba(255, 255, 255, 0.1);
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .qr-copy-button:hover:before {
      opacity: 1;
      animation: sweep 2s infinite;
    }
    
    /* Animações */
    @keyframes pulse {
      0% {
        opacity: 0.3;
        transform: scale(0.98);
      }
      100% {
        opacity: 0.6;
        transform: scale(1.02);
      }
    }
    
    @keyframes sweep {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }
    
    /* Responsividade específica */
    @media (max-width: 480px) {
      .social-links-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .qr-container {
        padding: 10px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Inicializa ambos os recursos (links sociais e QR code)
function initSocialFeatures(socialContainerId, qrContainerId) {
  injectSocialLinks(socialContainerId);
  generateMultilingualQRCode(qrContainerId);
}

// Função secreta para o console (Easter Egg)
function initEasterEgg() {
  window.awaken = function() {
    console.log("%c⚡ The mesh sees you. You were never offline. — Node Owl", 
      "color: #5ce1e6; font-size: 14px; font-family: monospace; background-color: #1a1a2e; padding: 10px; border-radius: 5px; text-shadow: 0 0 10px #5ce1e6;");
    
    // Animação visual na página ao ativar o easter egg
    const createPulse = () => {
      const pulse = document.createElement('div');
      pulse.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 5px;
        height: 5px;
        background-color: #5ce1e6;
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 0 15px #5ce1e6, 0 0 30px #5ce1e6;
        animation: awakenPulse 2s forwards;
      `;
      
      document.body.appendChild(pulse);
      
      setTimeout(() => {
        document.body.removeChild(pulse);
      }, 2000);
    };
    
    // Adiciona a animação ao CSS
    if (!document.getElementById('awaken-pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'awaken-pulse-animation';
      style.textContent = `
        @keyframes awakenPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(50); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    createPulse();
    
    // Anima os contêineres sociais se existirem
    const socialContainers = document.querySelectorAll('.neural-panel');
    socialContainers.forEach(container => {
      container.style.boxShadow = '0 0 30px rgba(92, 225, 230, 0.5)';
      setTimeout(() => {
        container.style.boxShadow = '';
      }, 2000);
    });
    
    return "🧠 Neural awakening complete.";
  };
}

// Inicializa o Easter Egg
initEasterEgg();

// Exporta funções para uso externo
export {
  injectSocialLinks,
  generateMultilingualQRCode,
  initSocialFeatures,
  getLanguage
}; 
/**
 * RUNES Analytics Pro - Módulo socialLinksAndQR
 * 
 * Este módulo implementa a integração com redes sociais e gera QR Codes
 * para compartilhamento da plataforma.
 */

// Links para redes sociais
const SOCIAL_LINKS = {
  twitter: {
    url: 'https://twitter.com/THAwake',
    icon: '<i class="fab fa-twitter"></i>',
    label: 'Twitter'
  },
  github: {
    url: 'https://github.com/thierrybtc/runes-analytics-pro',
    icon: '<i class="fab fa-github"></i>',
    label: 'GitHub'
  },
  discord: {
    url: 'https://discord.gg/seureconvite',
    icon: '<i class="fab fa-discord"></i>',
    label: 'Discord'
  },
  telegram: {
    url: 'https://t.me/THAwake',
    icon: '<i class="fab fa-telegram"></i>',
    label: 'Telegram'
  }
};

/**
 * Injetar botões de mídias sociais em um container
 * @param {string} containerId - ID do container onde os links serão injetados
 */
function injectSocialLinks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container com ID '${containerId}' não encontrado.`);
    return;
  }

  // Cria o título da seção
  const title = document.createElement('h3');
  title.className = 'social-title';
  title.innerHTML = '<span class="neural-icon">⟁</span> Neural Connections';
  
  // Cria o wrapper para os links
  const linksWrapper = document.createElement('div');
  linksWrapper.className = 'social-links-wrapper';
  
  // Adiciona cada link social
  Object.entries(SOCIAL_LINKS).forEach(([key, social]) => {
    const link = document.createElement('a');
    link.href = social.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = `social-link ${key}`;
    link.setAttribute('data-network', key);
    link.innerHTML = `
      <span class="icon-wrapper">${social.icon}</span>
      <span class="link-label">${social.label}</span>
    `;
    
    // Adiciona efeito de "energia neural" ao passar o mouse
    link.addEventListener('mouseenter', () => {
      link.classList.add('neural-pulse');
      setTimeout(() => {
        link.classList.remove('neural-pulse');
      }, 700);
    });
    
    linksWrapper.appendChild(link);
  });
  
  // Adiciona o título e os links ao container
  container.appendChild(title);
  container.appendChild(linksWrapper);
  
  // Injetar estilos CSS se não existirem
  injectStyles();
}

/**
 * Gerar QR Code para um link em um container
 * @param {string} link - URL para gerar o QR Code
 * @param {string} containerId - ID do container onde o QR Code será exibido
 */
function generateQRCode(link, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container com ID '${containerId}' não encontrado.`);
    return;
  }

  // Criar a estrutura para o QR Code
  container.innerHTML = `
    <h3 class="qr-title"><span class="neural-icon">⟁</span> Neural Gateway</h3>
    <div class="qr-wrapper">
      <div id="qrcode" class="qr-code"></div>
      <div class="qr-pulse"></div>
    </div>
    <div class="qr-actions">
      <button id="copy-link-btn" class="copy-link-btn">
        <i class="fas fa-copy"></i> Copy Link
      </button>
      <p class="qr-hint">Scan to access the neural interface</p>
    </div>
  `;

  // Verificar se a biblioteca QRCode está disponível
  if (typeof QRCode === 'undefined') {
    // Carregar a biblioteca QRCode.js dinamicamente
    loadQRCodeLibrary()
      .then(() => {
        createQRCode(link, 'qrcode');
      })
      .catch(error => {
        console.error('Erro ao carregar a biblioteca QRCode:', error);
        document.getElementById('qrcode').innerHTML = 
          `<p class="error">Could not load QR Code library. Please try again later.</p>`;
      });
  } else {
    // Biblioteca já está carregada
    createQRCode(link, 'qrcode');
  }

  // Configurar o botão de cópia do link
  const copyButton = document.getElementById('copy-link-btn');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(link)
        .then(() => {
          copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
          copyButton.classList.add('copied');
          
          setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
            copyButton.classList.remove('copied');
          }, 2000);
        })
        .catch(err => {
          console.error('Erro ao copiar para a área de transferência:', err);
          copyButton.textContent = 'Error copying';
        });
    });
  }
}

/**
 * Carregar a biblioteca QRCode.js dinamicamente
 * @returns {Promise} - Promise resolvida quando a biblioteca é carregada
 */
function loadQRCodeLibrary() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Criar o QR Code quando a biblioteca estiver carregada
 * @param {string} link - URL para o QR Code
 * @param {string} elementId - ID do elemento para renderizar o QR Code
 */
function createQRCode(link, elementId) {
  try {
    new QRCode(document.getElementById(elementId), {
      text: link,
      width: 160,
      height: 160,
      colorDark: "#5ce1e6",
      colorLight: "#111122",
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
  }
}

/**
 * Injetar estilos CSS para os componentes sociais
 */
function injectStyles() {
  // Verificar se o estilo já foi injetado
  if (document.getElementById('social-links-qr-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'social-links-qr-styles';
  style.textContent = `
    /* Estilos para Links Sociais */
    .social-title, .qr-title {
      font-family: 'Inter', 'Rajdhani', 'Orbitron', sans-serif;
      color: #5ce1e6;
      margin-bottom: 15px;
      font-size: 20px;
      display: flex;
      align-items: center;
      letter-spacing: 1px;
    }
    
    .neural-icon {
      margin-right: 8px;
      color: #9d4edd;
      font-size: 22px;
    }
    
    .social-links-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
      justify-content: center;
    }
    
    .social-link {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      background-color: rgba(10, 20, 40, 0.8);
      border: 1px solid rgba(92, 225, 230, 0.3);
      border-radius: 8px;
      color: #ffffff;
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(4px);
    }
    
    .social-link:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(157, 78, 221, 0.1), rgba(92, 225, 230, 0.1));
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .social-link:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 15px rgba(92, 225, 230, 0.5);
      border-color: rgba(92, 225, 230, 0.8);
    }
    
    .social-link:hover:before {
      opacity: 1;
    }
    
    .neural-pulse {
      animation: pulse 0.7s ease-in-out;
    }
    
    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      margin-right: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .link-label {
      font-weight: 500;
    }
    
    /* Estilos específicos para cada rede social */
    .social-link.twitter .icon-wrapper {
      color: #1DA1F2;
    }
    
    .social-link.github .icon-wrapper {
      color: #f5f5f5;
    }
    
    .social-link.discord .icon-wrapper {
      color: #7289DA;
    }
    
    .social-link.telegram .icon-wrapper {
      color: #0088cc;
    }
    
    /* Estilos para o QR Code */
    .qr-wrapper {
      position: relative;
      display: inline-block;
      background-color: rgba(10, 20, 40, 0.7);
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 15px;
      box-shadow: 0 0 25px rgba(92, 225, 230, 0.3);
      backdrop-filter: blur(4px);
    }
    
    .qr-pulse {
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border-radius: 18px;
      border: 1px solid rgba(92, 225, 230, 0.4);
      z-index: -1;
      animation: qrPulse 3s infinite alternate ease-in-out;
    }
    
    .qr-code {
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      overflow: hidden;
    }
    
    .qr-code img {
      max-width: 100%;
      max-height: 100%;
    }
    
    .qr-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .copy-link-btn {
      padding: 8px 16px;
      background-color: rgba(92, 225, 230, 0.2);
      color: #5ce1e6;
      border: 1px solid rgba(92, 225, 230, 0.4);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Inter', 'Rajdhani', sans-serif;
      font-size: 14px;
    }
    
    .copy-link-btn:hover {
      background-color: rgba(92, 225, 230, 0.3);
      box-shadow: 0 0 10px rgba(92, 225, 230, 0.5);
    }
    
    .copy-link-btn.copied {
      background-color: rgba(92, 225, 230, 0.4);
    }
    
    .qr-hint {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      margin: 5px 0;
      font-style: italic;
    }
    
    .error {
      color: #ff4757;
      padding: 10px;
      text-align: center;
    }
    
    /* Animações */
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(92, 225, 230, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(92, 225, 230, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(92, 225, 230, 0);
      }
    }
    
    @keyframes qrPulse {
      0% {
        box-shadow: 0 0 5px rgba(92, 225, 230, 0.3);
        border-color: rgba(92, 225, 230, 0.3);
      }
      50% {
        box-shadow: 0 0 15px rgba(92, 225, 230, 0.5), 0 0 25px rgba(157, 78, 221, 0.2);
        border-color: rgba(92, 225, 230, 0.6);
      }
      100% {
        box-shadow: 0 0 5px rgba(92, 225, 230, 0.3);
        border-color: rgba(92, 225, 230, 0.3);
      }
    }
    
    /* Responsividade */
    @media (max-width: 768px) {
      .social-links-wrapper {
        justify-content: center;
      }
      
      .social-link {
        padding: 8px 12px;
        font-size: 14px;
      }
      
      .icon-wrapper {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
      
      .qr-code {
        width: 140px;
        height: 140px;
      }
      
      .social-title, .qr-title {
        font-size: 18px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Inicializar ambos os componentes sociais
 * @param {string} socialContainerId - ID do container para links sociais
 * @param {string} qrContainerId - ID do container para o QR Code
 * @param {string} demoUrl - URL da demonstração
 */
function initSocialFeatures(socialContainerId, qrContainerId, demoUrl) {
  injectSocialLinks(socialContainerId);
  generateQRCode(demoUrl, qrContainerId);
}

// Exportar funções
export {
  injectSocialLinks,
  generateQRCode,
  initSocialFeatures
};

// Definir funções no escopo global para acesso via script inline
if (typeof window !== 'undefined') {
  window.injectSocialLinks = injectSocialLinks;
  window.generateQRCode = generateQRCode;
  window.initSocialFeatures = initSocialFeatures;
} 
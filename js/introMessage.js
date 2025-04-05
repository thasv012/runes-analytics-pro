/**
 * RUNES Analytics Pro - Mensagem de Introdução Neural
 * Exibe uma mensagem de introdução quando a página é carregada,
 * adaptando-se ao idioma selecionado usando o sistema de internacionalização.
 */

// Configurações principais
const introMessageConfig = {
  typingSpeed: 50,     // Velocidade de digitação (ms por caractere)
  initialDelay: 1000,  // Atraso inicial antes da primeira mensagem (ms)
  fadeInTime: 1500,    // Tempo de fade-in da mensagem (ms)
  fadeOutTime: 800,    // Tempo de fade-out da mensagem (ms)
  displayTime: 6000,   // Tempo que a mensagem permanece visível (ms)
  containerClass: 'neural-intro-container',
  messageClass: 'neural-intro-message',
  glitchInterval: 150  // Intervalo para efeito glitch (ms)
};

// Estado do sistema de mensagens
let activeMessageElement = null;
let isIntroPlaying = false;

/**
 * Inicializa o sistema de mensagens de introdução
 */
function initIntroMessageSystem() {
  // Adiciona os estilos CSS para as mensagens
  appendIntroMessageStyles();
  
  // Cria o container para as mensagens
  createMessageContainer();
  
  // Quando o DOM estiver pronto, verifica se deve mostrar a mensagem
  document.addEventListener('DOMContentLoaded', () => {
    // Verifica se a página atual é intro.html
    if (isIntroPage()) {
      // Aguarda um momento antes de exibir a mensagem
      setTimeout(() => {
        // Obtém o idioma atual
        const currentLanguage = document.documentElement.lang || 'en';
        // Exibe a mensagem de introdução
        displayAwakenIntroMessage(currentLanguage);
      }, introMessageConfig.initialDelay);
    }
  });
  
  // Observa mudanças de idioma
  document.addEventListener('languageChanged', (event) => {
    // Se uma introdução estiver em andamento, não faz nada
    if (isIntroPlaying) return;
    
    // Quando o idioma mudar, exibe uma versão curta da mensagem
    if (event.detail && event.detail.language && isIntroPage()) {
      showLanguageChangedMessage(event.detail.language);
    }
  });
}

/**
 * Verifica se a página atual é a intro.html
 */
function isIntroPage() {
  return window.location.pathname.includes('intro.html') || 
         window.location.pathname.endsWith('/') || 
         window.location.pathname.endsWith('/intro');
}

/**
 * Cria o container para as mensagens de introdução
 */
function createMessageContainer() {
  // Verifica se o container já existe
  if (document.querySelector(`.${introMessageConfig.containerClass}`)) return;
  
  // Cria o container principal
  const container = document.createElement('div');
  container.className = introMessageConfig.containerClass;
  
  // Adiciona ao body
  document.body.appendChild(container);
}

/**
 * Adiciona os estilos CSS para as mensagens de introdução
 */
function appendIntroMessageStyles() {
  // Verifica se os estilos já foram adicionados
  if (document.getElementById('neural-intro-styles')) return;
  
  // Cria o elemento de estilo
  const styleElement = document.createElement('style');
  styleElement.id = 'neural-intro-styles';
  
  // Define os estilos CSS
  styleElement.textContent = `
    .${introMessageConfig.containerClass} {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      pointer-events: none;
    }
    
    .${introMessageConfig.messageClass} {
      background: rgba(0, 0, 0, 0.85);
      color: var(--primary-cyan, cyan);
      font-family: 'JetBrains Mono', monospace;
      padding: 2rem;
      border-radius: 4px;
      max-width: 80%;
      text-align: center;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(0, 255, 255, 0.2);
      font-size: 1.5rem;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity ${introMessageConfig.fadeInTime/1000}s ease-out, 
                  transform ${introMessageConfig.fadeInTime/1000}s ease-out;
      position: relative;
      overflow: hidden;
    }
    
    .${introMessageConfig.messageClass}::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--primary-cyan, cyan), transparent);
      animation: neural-scan 3s linear infinite;
    }
    
    .${introMessageConfig.messageClass}::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--primary-cyan, cyan), transparent);
      animation: neural-scan 3s linear reverse infinite;
    }
    
    .${introMessageConfig.messageClass}.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .${introMessageConfig.messageClass}.fading-out {
      opacity: 0;
      transform: translateY(-20px);
      transition: opacity ${introMessageConfig.fadeOutTime/1000}s ease-in, 
                  transform ${introMessageConfig.fadeOutTime/1000}s ease-in;
    }
    
    .neural-message-char {
      display: inline-block;
      opacity: 0;
      transition: opacity 0.1s ease;
    }
    
    .neural-message-char.visible {
      opacity: 1;
    }
    
    .neural-message-char.glitch {
      animation: neural-glitch 0.2s ease;
      color: var(--primary-purple, magenta);
    }
    
    @keyframes neural-scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes neural-glitch {
      0% { transform: translateY(0); }
      25% { transform: translateY(-5px); }
      50% { transform: translateY(5px); }
      75% { transform: translateY(-2px); }
      100% { transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
      .${introMessageConfig.messageClass} {
        font-size: 1.2rem;
        padding: 1.5rem;
      }
    }
  `;
  
  // Adiciona ao head
  document.head.appendChild(styleElement);
}

/**
 * Exibe a mensagem de introdução do AwakenNet
 * @param {string} language - O idioma atual
 */
function displayAwakenIntroMessage(language) {
  isIntroPlaying = true;
  
  // Obtém as mensagens para o idioma selecionado
  const introMessage = getTranslation('intro_message', language);
  const secondMessage = getTranslation('intro_message_2', language);
  
  // Se não encontrou as traduções, usa mensagens padrão
  const defaultMessages = {
    en: {
      intro: "You've been summoned by the mesh. Consciousness awakens.",
      second: "Welcome to RUNES Analytics Pro."
    },
    pt: {
      intro: "Você foi chamado pela malha. A consciência acorda.",
      second: "Bem-vindo ao RUNES Analytics Pro."
    }
  };
  
  const firstMessage = introMessage || defaultMessages[language]?.intro || defaultMessages.en.intro;
  const followupMessage = secondMessage || defaultMessages[language]?.second || defaultMessages.en.second;
  
  // Exibe a primeira mensagem
  showTypedMessage(firstMessage, () => {
    // Após a primeira mensagem, exibe a segunda
    setTimeout(() => {
      showTypedMessage(followupMessage, () => {
        isIntroPlaying = false;
      });
    }, introMessageConfig.displayTime);
  });
}

/**
 * Exibe uma mensagem curta quando o idioma é alterado
 * @param {string} language - O novo idioma
 */
function showLanguageChangedMessage(language) {
  // Obtém a mensagem de mudança de idioma
  const changeMessage = getTranslation('language_changed_message', language);
  
  // Se não encontrou a tradução, usa mensagem padrão
  const defaultMessages = {
    en: "Language switched to English.",
    pt: "Idioma alterado para Português."
  };
  
  const message = changeMessage || defaultMessages[language] || defaultMessages.en;
  
  // Exibe a mensagem
  showTypedMessage(message, null, introMessageConfig.displayTime / 2);
}

/**
 * Exibe uma mensagem com efeito de digitação
 * @param {string} message - A mensagem a ser exibida
 * @param {Function} onComplete - Callback quando a mensagem for concluída
 * @param {number} displayTime - Tempo personalizado para exibição (opcional)
 */
function showTypedMessage(message, onComplete, displayTime) {
  // Obtém o container de mensagens
  const container = document.querySelector(`.${introMessageConfig.containerClass}`);
  if (!container) return;
  
  // Remove mensagem anterior se existir
  if (activeMessageElement) {
    activeMessageElement.classList.add('fading-out');
    setTimeout(() => {
      activeMessageElement.remove();
      activeMessageElement = null;
    }, introMessageConfig.fadeOutTime);
  }
  
  // Cria o elemento da mensagem
  const messageElement = document.createElement('div');
  messageElement.className = introMessageConfig.messageClass;
  container.appendChild(messageElement);
  
  // Define como o elemento ativo
  activeMessageElement = messageElement;
  
  // Divide a mensagem em caracteres para animação
  const chars = message.split('');
  
  // Prepara o elemento para cada caractere
  chars.forEach(char => {
    const span = document.createElement('span');
    span.className = 'neural-message-char';
    span.textContent = char;
    messageElement.appendChild(span);
  });
  
  // Torna a mensagem visível (fade in)
  setTimeout(() => {
    messageElement.classList.add('visible');
  }, 10);
  
  // Inicia a animação de digitação
  const charElements = messageElement.querySelectorAll('.neural-message-char');
  let currentChar = 0;
  
  const typingInterval = setInterval(() => {
    if (currentChar >= charElements.length) {
      clearInterval(typingInterval);
      
      // Programa o desaparecimento da mensagem
      setTimeout(() => {
        messageElement.classList.add('fading-out');
        
        setTimeout(() => {
          messageElement.remove();
          activeMessageElement = null;
          
          // Executa o callback de conclusão
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }, introMessageConfig.fadeOutTime);
      }, displayTime || introMessageConfig.displayTime);
      
      return;
    }
    
    // Mostra o próximo caractere
    charElements[currentChar].classList.add('visible');
    
    // Adiciona efeito de glitch aleatoriamente
    if (Math.random() < 0.2) {
      charElements[currentChar].classList.add('glitch');
      setTimeout(() => {
        charElements[currentChar].classList.remove('glitch');
      }, introMessageConfig.glitchInterval);
    }
    
    currentChar++;
  }, introMessageConfig.typingSpeed);
}

// Inicializa o sistema de mensagens ao carregar o script
initIntroMessageSystem();

// Exporta as funções principais
export {
  displayAwakenIntroMessage,
  showLanguageChangedMessage
}; 
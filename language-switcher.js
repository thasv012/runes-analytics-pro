/**
 * RUNES Analytics Pro - Language Switcher
 * Script para gerenciar a troca de idiomas no site
 */

// Cache para os dados de tradução
let translations = {
  en: null,
  pt: null
};

// Configurações do language switcher
const langSwitcherConfig = {
  fadeOutDuration: 300,  // Duração da animação de fade-out (ms)
  fadeInDuration: 400,   // Duração da animação de fade-in (ms)
  badgeShowDuration: 2000, // Duração para exibir o badge de idioma (ms)
  flagEmojis: {
    en: '🇺🇸',
    pt: '🇧🇷'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
});

/**
 * Inicializa o sistema de troca de idiomas
 */
async function initLanguageSwitcher() {
  // Define o idioma inicial com base na preferência do usuário ou padrão (inglês)
  const savedLanguage = localStorage.getItem('runesAnalyticsLanguage');
  const defaultLanguage = getUserPreferredLang();
  
  // Define o idioma no HTML
  document.documentElement.lang = defaultLanguage;
  
  // Inicializa os botões de troca de idioma
  setupLanguageToggle();
  
  // Cria o badge de idioma
  createLanguageBadge();
  
  // Carrega o arquivo de tradução inicial e atualiza a interface
  await loadTranslations(defaultLanguage);
  
  // Atualiza a interface com o idioma selecionado
  updateLanguageUI(defaultLanguage);
  
  // Verifica se há um parâmetro de idioma na URL
  checkUrlLanguageParam();
}

/**
 * Obtém o idioma preferido do usuário
 * @returns {string} O código do idioma preferido
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
 * Verifica se há um parâmetro de idioma na URL
 */
function checkUrlLanguageParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  if (langParam && ['en', 'pt'].includes(langParam)) {
    // Se o idioma da URL for diferente do atual, muda o idioma
    if (langParam !== document.documentElement.lang) {
      changeLanguage(langParam);
    }
  }
}

/**
 * Cria o badge de idioma que é exibido quando o idioma é alterado
 */
function createLanguageBadge() {
  // Remove o badge existente, se houver
  const existingBadge = document.getElementById('language-badge');
  if (existingBadge) {
    existingBadge.remove();
  }
  
  // Cria o badge
  const badge = document.createElement('div');
  badge.id = 'language-badge';
  badge.className = 'language-badge';
  badge.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: var(--primary-cyan, cyan);
    border: 1px solid var(--primary-cyan, cyan);
    border-radius: 4px;
    padding: 8px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  `;
  
  // Adiciona ao body
  document.body.appendChild(badge);
}

/**
 * Exibe o badge de idioma atual
 * @param {string} language - O idioma atual
 */
function showLanguageBadge(language) {
  const badge = document.getElementById('language-badge');
  if (!badge) return;
  
  // Define o conteúdo do badge
  const languageNames = {
    en: 'English',
    pt: 'Português'
  };
  
  const flag = langSwitcherConfig.flagEmojis[language] || '';
  badge.innerHTML = `${flag} ${languageNames[language] || language}`;
  
  // Mostra o badge
  badge.style.opacity = '1';
  badge.style.transform = 'translateY(0)';
  
  // Esconde o badge após um tempo
  setTimeout(() => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(-10px)';
  }, langSwitcherConfig.badgeShowDuration);
}

/**
 * Configura os controladores do seletor de idioma
 */
function setupLanguageToggle() {
  const languageToggles = document.querySelectorAll('.language-toggle');
  const languageOptions = document.querySelectorAll('.language-option');
  
  // Adiciona evento de clique ao botão principal de idioma
  languageToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const dropdown = this.nextElementSibling;
      toggle.classList.toggle('active');
      dropdown.classList.toggle('active');
      
      // Fecha o dropdown se clicar fora
      document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.language-selector')) {
          toggle.classList.remove('active');
          dropdown.classList.remove('active');
          document.removeEventListener('click', closeDropdown);
        }
      });
    });
  });
  
  // Adiciona evento de clique às opções de idioma
  languageOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      
      if (lang) {
        changeLanguage(lang);
        
        // Fecha o dropdown
        const dropdown = this.closest('.language-dropdown');
        const toggle = dropdown.previousElementSibling;
        toggle.classList.remove('active');
        dropdown.classList.remove('active');
      }
    });
  });
}

/**
 * Muda o idioma da aplicação
 * @param {string} language - O idioma para o qual mudar
 */
function changeLanguage(language) {
  // Salva a preferência de idioma no localStorage
  localStorage.setItem('runesAnalyticsLanguage', language);
  
  // Atualiza o idioma do documento
  document.documentElement.lang = language;
  
  // Carrega as traduções e atualiza a interface 
  loadTranslations(language).then(() => {
    // Aplica as animações de transição entre idiomas
    applyLanguageTransitionEffects(() => {
      updateLanguageUI(language);
      translatePage(language);
    });
  });
}

/**
 * Aplica efeitos de transição ao mudar de idioma
 * @param {Function} callback - Função a ser chamada ao concluir a transição
 */
function applyLanguageTransitionEffects(callback) {
  // Seleciona os elementos que serão animados
  const elementsToAnimate = document.querySelectorAll('[data-i18n], .lang-en, .lang-pt');
  
  // Aplica a animação de fade-out
  elementsToAnimate.forEach(element => {
    element.style.transition = `opacity ${langSwitcherConfig.fadeOutDuration / 1000}s ease`;
    element.style.opacity = '0';
  });
  
  // Aguarda o fim da animação de fade-out
  setTimeout(() => {
    // Executa o callback para traduzir os textos
    if (typeof callback === 'function') {
      callback();
    }
    
    // Aplica a animação de fade-in
    elementsToAnimate.forEach(element => {
      element.style.transition = `opacity ${langSwitcherConfig.fadeInDuration / 1000}s ease`;
      element.style.opacity = '1';
    });
    
    // Reproduz o som de transição (se habilitado)
    playLanguageChangeSound();
  }, langSwitcherConfig.fadeOutDuration);
}

/**
 * Reproduz um som quando o idioma é alterado
 */
function playLanguageChangeSound() {
  // Verifica se o som está habilitado
  const soundEnabled = localStorage.getItem('runesSoundEnabled') !== 'false';
  if (!soundEnabled) return;
  
  // Cria o elemento de áudio
  const audio = new Audio();
  audio.volume = 0.2;
  audio.src = 'assets/sounds/language-change.mp3';
  
  // Tenta reproduzir o som
  try {
    audio.play().catch(err => {
      // Ignora erros de reprodução (comum em navegadores que bloqueiam a reprodução automática)
      console.debug('Não foi possível reproduzir o som de troca de idioma', err);
    });
  } catch (err) {
    // Ignora erros
  }
}

/**
 * Carrega o arquivo de tradução para o idioma especificado
 */
async function loadTranslations(language) {
  // Se já temos as traduções em cache, não precisamos carregar novamente
  if (translations[language]) {
    return translations[language];
  }

  try {
    const response = await fetch(`/lang/${language}.json`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar traduções para ${language}`);
    }
    
    translations[language] = await response.json();
    return translations[language];
  } catch (error) {
    console.error('Erro ao carregar arquivo de tradução:', error);
    return {};
  }
}

/**
 * Traduz os elementos da página usando os atributos data-i18n
 */
function translatePage(language) {
  if (!translations[language]) return;
  
  // Traduz elementos com atributo data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });
  
  // Traduz placeholders com atributo data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[language][key]) {
      element.setAttribute('placeholder', translations[language][key]);
    }
  });
  
  // Traduz títulos com atributo data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    if (translations[language][key]) {
      element.setAttribute('title', translations[language][key]);
    }
  });
  
  // Dispara um evento personalizado para notificar componentes externos
  document.dispatchEvent(new CustomEvent('translationsApplied', { detail: { language } }));
}

/**
 * Atualiza a interface do usuário com base no idioma selecionado
 */
function updateLanguageUI(language) {
  // Atualiza o texto dos botões de idioma
  const currentLangElements = document.querySelectorAll('.current-lang');
  
  currentLangElements.forEach(el => {
    if (language === 'en') {
      el.textContent = 'EN';
    } else if (language === 'pt') {
      el.textContent = 'PT';
    }
  });
  
  // Atualiza a classe ativa nas opções de idioma
  const languageOptions = document.querySelectorAll('.language-option');
  
  languageOptions.forEach(option => {
    const optionLang = option.getAttribute('data-lang');
    
    if (optionLang === language) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // Atualiza o título da página com base no idioma
  updatePageTitle(language);
  
  // Traduz a página
  translatePage(language);
  
  // Exibe o badge do idioma
  showLanguageBadge(language);
  
  // Dispara um evento personalizado para notificar outras partes do código
  document.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language } 
  }));
}

/**
 * Atualiza o título da página com base no idioma
 */
function updatePageTitle(language) {
  const titleElement = document.querySelector('title');
  
  if (!titleElement) return;
  
  // Obtém os elementos de título em cada idioma
  const enTitle = titleElement.getAttribute('data-en');
  const ptTitle = titleElement.getAttribute('data-pt');
  
  // Atualiza o título com base no idioma selecionado
  if (language === 'en' && enTitle) {
    titleElement.textContent = enTitle;
  } else if (language === 'pt' && ptTitle) {
    titleElement.textContent = ptTitle;
  }
}

/**
 * Função auxiliar para obter uma tradução por chave
 * Pode ser usada em scripts externos
 */
function getTranslation(key, language = null) {
  // Se o idioma não for especificado, usa o idioma atual
  const currentLang = language || document.documentElement.lang || 'en';
  
  // Verifica se temos as traduções para o idioma
  if (!translations[currentLang]) return key;
  
  // Retorna a tradução ou a chave original se não encontrada
  return translations[currentLang][key] || key;
}

// Expõe a função de tradução globalmente
window.getTranslation = getTranslation;
window.translatePage = function(lang) {
  const currentLang = lang || document.documentElement.lang || 'en';
  
  // Carrega as traduções se necessário e traduz a página
  if (!translations[currentLang]) {
    loadTranslations(currentLang).then(() => translatePage(currentLang));
  } else {
    translatePage(currentLang);
  }
};

// Expõe a função getUserPreferredLang globalmente
window.getUserPreferredLang = getUserPreferredLang;

// Adiciona estilos para o badge de idioma
(function addLanguageBadgeStyles() {
  const style = document.createElement('style');
  style.id = 'language-badge-styles';
  style.textContent = `
    .language-badge.show {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    
    @keyframes badge-pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(0, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
    }
    
    .language-badge {
      animation: badge-pulse 2s infinite;
    }
  `;
  document.head.appendChild(style);
})(); 
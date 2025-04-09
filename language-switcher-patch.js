/**
 * RUNES Analytics Pro - Patch para language-switcher.js
 * Este patch adiciona melhorias e correções ao sistema de idiomas
 * 
 * Instruções para aplicar o patch:
 * 1. Faça um backup do arquivo language-switcher.js original
 * 2. Adicione este código ao final do arquivo language-switcher.js
 * 3. Ou substitua o arquivo completamente se preferir
 */

// Adiciona detecção de problemas e self-healing para o sistema de idiomas
(function enhanceLanguageSwitcher() {
  console.log('[Language Switcher] Aplicando melhorias ao sistema de idiomas...');

  // 1. Garante que o objeto de traduções existe
  if (typeof window.translations !== 'object') {
    window.translations = { en: {}, pt: {} };
    console.warn('[Language Switcher] Objeto translations não encontrado. Criado objeto vazio.');
  }

  // 2. Garante que changeLanguage está disponível globalmente
  if (typeof window.changeLanguage !== 'function' && typeof changeLanguage === 'function') {
    window.changeLanguage = changeLanguage;
    console.info('[Language Switcher] Exposto changeLanguage globalmente.');
  }

  // 3. Verifica se o atributo lang do HTML está definido
  if (!document.documentElement.lang) {
    // Define o idioma padrão com base na preferência do usuário
    const savedLang = localStorage.getItem('runesAnalyticsLanguage');
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    document.documentElement.lang = savedLang || browserLang;
    console.info(`[Language Switcher] Definido atributo lang do HTML como ${document.documentElement.lang}`);
  }

  // 4. Corrige elementos que podem usar ambos os métodos simultaneamente
  const mixedElements = document.querySelectorAll('[data-i18n].lang-en, [data-i18n].lang-pt');
  if (mixedElements.length > 0) {
    console.warn(`[Language Switcher] Encontrados ${mixedElements.length} elementos usando ambos os métodos de tradução`);
    
    mixedElements.forEach(element => {
      // Prioriza o método data-i18n e remove as classes de idioma
      element.classList.remove('lang-en', 'lang-pt');
      console.info(`[Language Switcher] Corrigido elemento inconsistente: ${element.tagName}[data-i18n="${element.getAttribute('data-i18n')}"]`);
    });
  }

  // 5. Adiciona suporte a fallback de tradução para elementos não traduzidos
  const originalGetTranslation = window.getTranslation || function(key) { return key; };
  
  window.getTranslation = function(key, language) {
    const currentLang = language || document.documentElement.lang || 'en';
    const fallbackLang = currentLang === 'en' ? 'pt' : 'en';
    
    // Tenta obter a tradução no idioma atual
    if (window.translations[currentLang] && window.translations[currentLang][key]) {
      return window.translations[currentLang][key];
    }
    
    // Tenta obter a tradução no idioma de fallback
    if (window.translations[fallbackLang] && window.translations[fallbackLang][key]) {
      console.warn(`[Language Switcher] Chave "${key}" não encontrada em "${currentLang}", usando "${fallbackLang}" como fallback.`);
      return window.translations[fallbackLang][key];
    }
    
    // Se não encontrar em nenhum idioma, retorna a chave
    console.warn(`[Language Switcher] Chave de tradução não encontrada: ${key}`);
    return key;
  };

  // 6. Melhora a função initLanguageSwitcher para ser mais robusta
  const originalInitLanguageSwitcher = window.initLanguageSwitcher || function() {};
  
  window.initLanguageSwitcher = function() {
    try {
      // Chama a implementação original
      originalInitLanguageSwitcher();
      
      // Adiciona recuperação de erros para quando o seletor não for encontrado
      setTimeout(() => {
        const languageSelector = document.querySelector('.language-selector');
        if (!languageSelector) {
          console.warn('[Language Switcher] Seletor de idiomas não encontrado no DOM.');
          createEmergencyLanguageSwitcher();
        }
      }, 1000);
    } catch (error) {
      console.error('[Language Switcher] Erro ao inicializar o seletor de idiomas:', error);
      // Tenta uma inicialização mínima em caso de erro
      document.addEventListener('click', function(e) {
        if (e.target.matches('[data-lang]')) {
          const lang = e.target.getAttribute('data-lang');
          if (lang === 'en' || lang === 'pt') {
            document.documentElement.lang = lang;
            localStorage.setItem('runesAnalyticsLanguage', lang);
          }
        }
      });
    }
  };

  // 7. Função para criar um seletor de idiomas de emergência
  function createEmergencyLanguageSwitcher() {
    console.warn('[Language Switcher] Criando seletor de idiomas de emergência...');
    
    const emergencySelector = document.createElement('div');
    emergencySelector.className = 'language-selector emergency-language-selector';
    emergencySelector.innerHTML = `
      <button class="language-toggle">
        <span class="current-lang">${document.documentElement.lang === 'en' ? 'EN' : 'PT'}</span>
        <i class="toggle-arrow fas fa-chevron-down"></i>
      </button>
      <div class="language-dropdown">
        <a href="#" class="language-option ${document.documentElement.lang === 'en' ? 'active' : ''}" data-lang="en">
          <i class="flag-icon">🇺🇸</i>
          <span>English</span>
        </a>
        <a href="#" class="language-option ${document.documentElement.lang === 'pt' ? 'active' : ''}" data-lang="pt">
          <i class="flag-icon">🇧🇷</i>
          <span>Português</span>
        </a>
      </div>
    `;
    
    // Adiciona estilos inline para o seletor de emergência
    const emergencyStyles = document.createElement('style');
    emergencyStyles.textContent = `
      .emergency-language-selector {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid var(--primary-cyan, cyan);
        border-radius: 4px;
        padding: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      }
    `;
    
    document.head.appendChild(emergencyStyles);
    document.body.appendChild(emergencySelector);
    
    // Configura os eventos do seletor de emergência
    setupLanguageToggle();
  }

  // 8. Adiciona MutationObserver para garantir que os elementos traduzíveis sejam processados mesmo após mudanças no DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          // Verifica se é um elemento DOM
          if (node.nodeType === 1) {
            // Processa novos elementos com atributo data-i18n
            const i18nElements = node.querySelectorAll ? node.querySelectorAll('[data-i18n]') : [];
            if (i18nElements.length > 0 || node.hasAttribute('data-i18n')) {
              console.info('[Language Switcher] Novos elementos traduzíveis detectados, aplicando traduções...');
              translatePage(document.documentElement.lang);
            }
          }
        });
      }
    });
  });
  
  // Inicia a observação do DOM
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('[Language Switcher] Melhorias aplicadas com sucesso!');
})();

// Adiciona diagnóstico periódico para detectar problemas no sistema de idiomas
(function addPeriodicalHealthCheck() {
  // Executa uma verificação básica a cada 30 segundos
  setInterval(function() {
    // Verifica se os elementos do idioma não ativo estão realmente ocultos
    const currentLang = document.documentElement.lang;
    const inactiveClass = currentLang === 'en' ? '.lang-pt' : '.lang-en';
    
    const visibleInactiveElements = Array.from(document.querySelectorAll(inactiveClass)).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    if (visibleInactiveElements.length > 0) {
      console.warn(`[Language Switcher] Detectados ${visibleInactiveElements.length} elementos do idioma não ativo (${inactiveClass}) visíveis`);
      
      // Força a ocultação dos elementos do idioma não ativo
      visibleInactiveElements.forEach(el => {
        el.style.display = 'none';
      });
      
      console.info('[Language Switcher] Corrigido problema de visibilidade dos elementos de idioma.');
    }
  }, 30000);
})();

// Adiciona suporte a teclas de atalho para mudar o idioma
(function addKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Alt+E para inglês (English)
    if (e.altKey && e.key === 'e') {
      changeLanguage('en');
    }
    // Alt+P para português
    if (e.altKey && e.key === 'p') {
      changeLanguage('pt');
    }
  });
})();

// Adiciona suporte a URL parameters para definir o idioma inicial
(function supportUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  if (langParam && ['en', 'pt'].includes(langParam)) {
    if (langParam !== document.documentElement.lang) {
      console.info(`[Language Switcher] Alterando idioma para "${langParam}" conforme parâmetro da URL`);
      // Garante que o sistema está pronto antes de mudar o idioma
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => changeLanguage(langParam), 500);
      });
    }
  }
})(); 
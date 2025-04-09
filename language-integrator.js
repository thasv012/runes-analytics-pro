/**
 * RUNES Analytics Pro - Integrador de Sistema de Idiomas
 * 
 * Este script facilita a integração do sistema de idiomas em páginas HTML existentes,
 * permitindo adicionar o seletor de idiomas e preparar elementos para tradução.
 */

// Configuração do integrador de idiomas
const LANG_INTEGRATOR_CONFIG = {
    // Classes CSS
    languageSelectorClass: 'language-selector',
    languageToggleClass: 'language-toggle',
    languageDropdownClass: 'language-dropdown',
    languageOptionClass: 'language-option',
    currentLangClass: 'current-lang',
    toggleArrowClass: 'toggle-arrow',
    flagIconClass: 'flag-icon',
    
    // Idiomas suportados
    supportedLanguages: [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'pt', name: 'Português', flag: '🇧🇷' }
    ],
    
    // Estilos CSS
    styles: `
        .language-selector {
            position: relative;
            margin-left: 15px;
            z-index: 100;
        }
        
        .language-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.3);
            color: var(--text-primary, #fff);
            border: 1px solid var(--border-color, #444);
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .language-toggle:hover {
            background: rgba(0, 255, 255, 0.1);
            border-color: var(--primary-cyan, cyan);
        }
        
        .language-toggle.active {
            background: rgba(0, 255, 255, 0.15);
            border-color: var(--primary-cyan, cyan);
        }
        
        .toggle-arrow {
            margin-left: 8px;
            transition: transform 0.3s ease;
        }
        
        .language-toggle.active .toggle-arrow {
            transform: rotate(180deg);
        }
        
        .language-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            width: 150px;
            background: rgba(10, 15, 30, 0.95);
            border: 1px solid var(--border-color, #444);
            border-radius: 4px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            margin-top: 5px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .language-dropdown.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .language-option {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            color: var(--text-primary, #fff);
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .language-option:hover {
            background: rgba(0, 255, 255, 0.1);
        }
        
        .language-option.active {
            background: rgba(0, 255, 255, 0.15);
            color: var(--primary-cyan, cyan);
        }
        
        .flag-icon {
            margin-right: 10px;
            font-size: 1.2em;
        }
        
        /* Classes de idioma */
        .lang-en, .lang-pt {
            display: none;
        }
        
        html[lang="en"] .lang-en,
        html[lang="pt"] .lang-pt {
            display: block;
        }
        
        span.lang-en, span.lang-pt,
        a.lang-en, a.lang-pt,
        button.lang-en, button.lang-pt {
            display: none;
        }
        
        html[lang="en"] span.lang-en,
        html[lang="pt"] span.lang-pt,
        html[lang="en"] a.lang-en,
        html[lang="pt"] a.lang-pt,
        html[lang="en"] button.lang-en,
        html[lang="pt"] button.lang-pt {
            display: inline;
        }
        
        /* Versão mobile para o seletor de idiomas */
        @media (max-width: 768px) {
            .language-selector {
                margin-left: 10px;
            }
            
            .language-toggle {
                padding: 4px 8px;
                font-size: 12px;
            }
        }
    `
};

/**
 * Carrega os estilos do seletor de idiomas
 */
function loadLanguageSwitcherStyles() {
    // Verifica se os estilos já estão carregados
    if (document.getElementById('language-integrator-styles')) {
        return;
    }
    
    // Cria e adiciona a tag de estilo
    const style = document.createElement('style');
    style.id = 'language-integrator-styles';
    style.textContent = LANG_INTEGRATOR_CONFIG.styles;
    document.head.appendChild(style);
}

/**
 * Cria o componente de seletor de idiomas
 * @return {HTMLElement} O elemento do seletor de idiomas
 */
function createLanguageSwitcher() {
    // Cria o container do seletor de idiomas
    const container = document.createElement('div');
    container.className = LANG_INTEGRATOR_CONFIG.languageSelectorClass;
    
    // Cria o botão de alternação
    const toggle = document.createElement('button');
    toggle.className = LANG_INTEGRATOR_CONFIG.languageToggleClass;
    
    // Adiciona o texto do idioma atual
    const currentLang = document.createElement('span');
    currentLang.className = LANG_INTEGRATOR_CONFIG.currentLangClass;
    currentLang.textContent = document.documentElement.lang.toUpperCase() || 'EN';
    toggle.appendChild(currentLang);
    
    // Adiciona a seta do toggle
    const arrow = document.createElement('i');
    arrow.className = LANG_INTEGRATOR_CONFIG.toggleArrowClass;
    arrow.innerHTML = '&#9660;'; // Seta para baixo
    toggle.appendChild(arrow);
    
    // Cria o dropdown
    const dropdown = document.createElement('div');
    dropdown.className = LANG_INTEGRATOR_CONFIG.languageDropdownClass;
    
    // Adiciona as opções de idioma
    LANG_INTEGRATOR_CONFIG.supportedLanguages.forEach(lang => {
        const option = document.createElement('a');
        option.href = '#';
        option.className = LANG_INTEGRATOR_CONFIG.languageOptionClass;
        option.setAttribute('data-lang', lang.code);
        
        if (document.documentElement.lang === lang.code) {
            option.classList.add('active');
        }
        
        // Adiciona a bandeira
        const flag = document.createElement('i');
        flag.className = LANG_INTEGRATOR_CONFIG.flagIconClass;
        flag.textContent = lang.flag;
        option.appendChild(flag);
        
        // Adiciona o nome do idioma
        const name = document.createElement('span');
        name.textContent = lang.name;
        option.appendChild(name);
        
        dropdown.appendChild(option);
    });
    
    // Adiciona o toggle e o dropdown ao container
    container.appendChild(toggle);
    container.appendChild(dropdown);
    
    return container;
}

/**
 * Inicializa a integração do seletor de idiomas
 * @param {Object} options Opções de configuração
 * @param {string} options.targetSelector Seletor do elemento onde adicionar o seletor de idiomas
 * @param {boolean} options.mobileDisplay Se verdadeiro, adiciona uma versão compacta para dispositivos móveis
 * @param {string} options.currentLanguage Idioma atual (padrão: detectado do navegador)
 */
function initLanguageIntegration(options = {}) {
    console.log('💬 Carregando integrador de seletor de idiomas...');
    
    // Configurações padrão
    const config = {
        targetSelector: '.nav-menu, nav, header',
        mobileDisplay: true,
        currentLanguage: null,
        ...options
    };
    
    // Define o idioma com base nas preferências
    const savedLanguage = localStorage.getItem('runesAnalyticsLanguage');
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    const currentLang = config.currentLanguage || savedLanguage || browserLang;
    
    document.documentElement.lang = currentLang;
    
    // Carrega os estilos do seletor de idiomas
    loadLanguageSwitcherStyles();
    
    // Cria o seletor de idiomas
    const languageSwitcher = createLanguageSwitcher();
    
    // Adiciona o seletor de idiomas ao elemento alvo
    const targetElement = document.querySelector(config.targetSelector);
    if (targetElement) {
        targetElement.appendChild(languageSwitcher);
        
        // Adiciona classe para versão móvel se necessário
        if (config.mobileDisplay) {
            const mediaQuery = window.matchMedia('(max-width: 768px)');
            
            function handleMobileLayout(mq) {
                if (mq.matches) {
                    languageSwitcher.classList.add('compact');
                } else {
                    languageSwitcher.classList.remove('compact');
                }
            }
            
            // Verifica inicialmente
            handleMobileLayout(mediaQuery);
            
            // Adiciona listener para mudanças
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleMobileLayout);
            } else {
                // Fallback para navegadores antigos
                mediaQuery.addListener(handleMobileLayout);
            }
        }
        
        // Configura os eventos
        setupLanguageSwitcherEvents(languageSwitcher);
        
        console.log('✅ Seletor de idiomas integrado com sucesso');
    } else {
        console.warn('⚠️ Elemento alvo não encontrado para o seletor de idiomas');
    }
    
    // Verifica se o script de alternância de idioma está presente
    const hasLangSwitcherScript = Array.from(document.querySelectorAll('script')).some(
        script => script.src && script.src.includes('language-switcher.js')
    );
    
    if (!hasLangSwitcherScript) {
        console.warn('⚠️ Script language-switcher.js não detectado. O seletor de idiomas pode não funcionar corretamente.');
    }
}

/**
 * Configura os eventos do seletor de idiomas
 * @param {HTMLElement} switcher O elemento do seletor de idiomas
 */
function setupLanguageSwitcherEvents(switcher) {
    // Obtém elementos
    const toggle = switcher.querySelector(`.${LANG_INTEGRATOR_CONFIG.languageToggleClass}`);
    const dropdown = switcher.querySelector(`.${LANG_INTEGRATOR_CONFIG.languageDropdownClass}`);
    const options = switcher.querySelectorAll(`.${LANG_INTEGRATOR_CONFIG.languageOptionClass}`);
    
    // Adiciona evento de clique ao botão principal de idioma
    toggle.addEventListener('click', function() {
        toggle.classList.toggle('active');
        dropdown.classList.toggle('active');
        
        // Fecha o dropdown se clicar fora
        function closeDropdown(e) {
            if (!e.target.closest(`.${LANG_INTEGRATOR_CONFIG.languageSelectorClass}`)) {
                toggle.classList.remove('active');
                dropdown.classList.remove('active');
                document.removeEventListener('click', closeDropdown);
            }
        }
        
        document.addEventListener('click', closeDropdown);
    });
    
    // Adiciona evento de clique às opções de idioma
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            
            if (lang) {
                // Chama a função de troca de idioma se disponível
                if (typeof window.changeLanguage === 'function') {
                    window.changeLanguage(lang);
                } else {
                    // Fallback se o script principal não estiver disponível
                    document.documentElement.lang = lang;
                    localStorage.setItem('runesAnalyticsLanguage', lang);
                    
                    // Atualiza a aparência
                    updateLanguageSwitcherUI(switcher, lang);
                    
                    // Atualiza a exibição de elementos com classes de idioma
                    updateLanguageDisplay(lang);
                }
                
                // Fecha o dropdown
                toggle.classList.remove('active');
                dropdown.classList.remove('active');
            }
        });
    });
}

/**
 * Atualiza a UI do seletor de idiomas
 * @param {HTMLElement} switcher O elemento do seletor de idiomas
 * @param {string} language O código do idioma
 */
function updateLanguageSwitcherUI(switcher, language) {
    // Atualiza o texto do botão principal
    const currentLang = switcher.querySelector(`.${LANG_INTEGRATOR_CONFIG.currentLangClass}`);
    if (currentLang) {
        currentLang.textContent = language.toUpperCase();
    }
    
    // Atualiza as opções ativas
    const options = switcher.querySelectorAll(`.${LANG_INTEGRATOR_CONFIG.languageOptionClass}`);
    options.forEach(option => {
        const optionLang = option.getAttribute('data-lang');
        
        if (optionLang === language) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

/**
 * Atualiza a exibição de elementos com classes de idioma
 * @param {string} language O código do idioma
 */
function updateLanguageDisplay(language) {
    // Exibe/oculta elementos com classes de idioma
    document.querySelectorAll('.lang-en, .lang-pt').forEach(element => {
        if (element.classList.contains(`lang-${language}`)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
}

/**
 * Função auxiliar para preparar elementos de texto para tradução
 * @param {string} selector Seletor CSS para identificar elementos a preparar
 * @param {boolean} useDataAttr Se verdadeiro, usa atributos data-i18n, senão usa classes lang-*
 */
function prepareTextElementsForTranslation(selector, useDataAttr = false) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        const text = element.textContent.trim();
        if (!text) return;
        
        // Verifica se o elemento já está preparado para tradução
        const hasLangClass = element.classList.contains('lang-en') || element.classList.contains('lang-pt');
        const hasDataI18n = element.hasAttribute('data-i18n');
        
        if (!hasLangClass && !hasDataI18n) {
            if (useDataAttr) {
                // Gera uma chave de tradução baseada no texto
                const key = text.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 30);
                
                element.setAttribute('data-i18n', key);
            } else {
                // Cria elementos para cada idioma
                const originalHTML = element.innerHTML;
                
                // Limpa o conteúdo original
                element.innerHTML = '';
                
                // Cria o elemento em inglês
                const enElement = document.createElement(element.tagName);
                enElement.className = 'lang-en';
                enElement.innerHTML = originalHTML;
                
                // Cria o elemento em português
                const ptElement = document.createElement(element.tagName);
                ptElement.className = 'lang-pt';
                ptElement.innerHTML = originalHTML;
                
                // Adiciona ambos os elementos
                element.appendChild(enElement);
                element.appendChild(ptElement);
            }
        }
    });
}

// Expõe funções globalmente
window.initLanguageIntegration = initLanguageIntegration;
window.prepareTextElementsForTranslation = prepareTextElementsForTranslation; 
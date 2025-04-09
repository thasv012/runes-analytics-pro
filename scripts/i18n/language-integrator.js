/**
 * RUNES Analytics Pro - Integrador de Sistema de Idiomas
 * 
 * Este script facilita a integração do sistema de idiomas em páginas HTML existentes,
 * permitindo adicionar o seletor de idiomas e preparar elementos para tradução.
 */

/**
 * RUNES Analytics Pro - Integrador de Seletor de Idiomas
 * 
 * Este script cria e integra o seletor de idiomas na interface do site,
 * fornecendo uma UI amigável para troca de idiomas.
 */

// Configurações para componentes multilíngues
const LANGUAGE_INTEGRATION_CONFIG = {
    // Classes CSS principais para manipulação de idiomas
    CLASS_NAMES: {
        LANG_EN: 'lang-en',
        LANG_PT: 'lang-pt',
        ACTIVE_LANG: 'active-lang',
        LANGUAGE_SWITCHER: 'language-switcher'
    },
    
    // Configurações para inserção automática do seletor de idiomas
    LANGUAGE_SWITCHER: {
        CONTAINER_ID: 'language-switcher-container',
        DEFAULT_POSITION: 'header .right-section',
        DEFAULT_HTML: `
            <div class="language-switcher">
                <button data-lang="en" class="lang-btn">EN</button>
                <button data-lang="pt" class="lang-btn">PT</button>
            </div>
        `
    },
    
    // Estilos CSS mínimos para o funcionamento correto
    MINIMUM_CSS: `
        .lang-en, .lang-pt {
            display: none;
        }
        .lang-en.active-lang, .lang-pt.active-lang {
            display: block;
        }
        
        /* Para elementos inline */
        span.lang-en.active-lang, span.lang-pt.active-lang,
        a.lang-en.active-lang, a.lang-pt.active-lang,
        button.lang-en.active-lang, button.lang-pt.active-lang {
            display: inline;
        }
        
        /* Para elementos flex */
        .d-flex.lang-en.active-lang, .d-flex.lang-pt.active-lang,
        .flex.lang-en.active-lang, .flex.lang-pt.active-lang {
            display: flex;
        }
        
        /* Para elementos grid */
        .d-grid.lang-en.active-lang, .d-grid.lang-pt.active-lang,
        .grid.lang-en.active-lang, .grid.lang-pt.active-lang {
            display: grid;
        }
    `
};

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
 * Integra os componentes necessários para o sistema multilíngue em uma página
 * @param {Object} config - Configurações para integração
 * @returns {Object} Resultado da integração com status dos componentes
 */
function integrateMultiLanguageSupport(config = {}) {
    const options = {
        addLanguageSwitcher: config.addLanguageSwitcher !== false,
        switcherPosition: config.switcherPosition || LANGUAGE_INTEGRATION_CONFIG.LANGUAGE_SWITCHER.DEFAULT_POSITION,
        addCssStyles: config.addCssStyles !== false,
        forceLoadScripts: config.forceLoadScripts === true,
        initialLanguage: config.initialLanguage || getUserPreferredLang(),
        ...config
    };
    
    console.log('🌐 Iniciando integração de suporte multilíngue');
    
    const integrationResult = {
        status: 'success',
        components: {
            languageSwitcher: false,
            cssStyles: false,
            scripts: {
                switcher: false,
                diagnostics: false
            }
        },
        issues: []
    };
    
    // 1. Adicionar estilos CSS mínimos se necessário
    if (options.addCssStyles) {
        try {
            integrationResult.components.cssStyles = addMinimumCssStyles();
        } catch (error) {
            integrationResult.issues.push(`Erro ao adicionar estilos CSS: ${error.message}`);
            integrationResult.status = 'warning';
        }
    }
    
    // 2. Adicionar o alternador de idiomas se necessário
    if (options.addLanguageSwitcher) {
        try {
            integrationResult.components.languageSwitcher = addLanguageSwitcherComponent(options.switcherPosition);
        } catch (error) {
            integrationResult.issues.push(`Erro ao adicionar alternador de idiomas: ${error.message}`);
            integrationResult.status = 'warning';
        }
    }
    
    // 3. Carregar scripts necessários
    try {
        integrationResult.components.scripts = loadLanguageScripts(options.forceLoadScripts);
    } catch (error) {
        integrationResult.issues.push(`Erro ao carregar scripts: ${error.message}`);
        integrationResult.status = 'warning';
    }
    
    // 4. Adicionar metadados para SEO
    try {
        addLanguageMetadata();
    } catch (error) {
        integrationResult.issues.push(`Erro ao adicionar metadados: ${error.message}`);
        // Não é crítico para o funcionamento
    }
    
    // 5. Aplicar classe de idioma ativo inicialmente
    try {
        applyActiveLanguage(options.initialLanguage);
    } catch (error) {
        integrationResult.issues.push(`Erro ao aplicar idioma inicial: ${error.message}`);
        integrationResult.status = 'error';
    }
    
    // Logs de diagnóstico
    if (integrationResult.status === 'success') {
        console.log('✅ Integração de suporte multilíngue concluída com sucesso!');
    } else {
        console.warn(`⚠️ Integração concluída com status: ${integrationResult.status}`);
        console.warn('Problemas encontrados:');
        integrationResult.issues.forEach((issue, i) => console.warn(`${i + 1}. ${issue}`));
    }
    
    return integrationResult;
}

/**
 * Adiciona os estilos CSS mínimos necessários para o sistema multilíngue
 * @returns {boolean} Verdadeiro se os estilos foram adicionados com sucesso
 */
function addMinimumCssStyles() {
    // Verificar se os estilos já existem
    const existingStyles = document.querySelector('style[data-purpose="language-styles"]');
    if (existingStyles) return true;
    
    // Criar e adicionar o elemento style
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-purpose', 'language-styles');
    styleElement.textContent = LANGUAGE_INTEGRATION_CONFIG.MINIMUM_CSS;
    document.head.appendChild(styleElement);
    
    return true;
}

/**
 * Adiciona o componente de alternador de idiomas à página
 * @param {string} targetSelector - Seletor CSS para o elemento onde inserir o alternador
 * @returns {boolean} Verdadeiro se o alternador foi adicionado com sucesso
 */
function addLanguageSwitcherComponent(targetSelector) {
    // Verificar se o alternador já existe
    const existingSwitcher = document.querySelector('.language-switcher');
    if (existingSwitcher) return true;
    
    // Encontrar o elemento alvo onde inserir o alternador
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.warn(`Elemento alvo não encontrado: ${targetSelector}`);
        console.warn('Tentando inserir no body');
        
        // Criar um container para o alternador e inserir no body
        const container = document.createElement('div');
        container.id = LANGUAGE_INTEGRATION_CONFIG.LANGUAGE_SWITCHER.CONTAINER_ID;
        container.innerHTML = LANGUAGE_INTEGRATION_CONFIG.LANGUAGE_SWITCHER.DEFAULT_HTML;
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    } else {
        // Inserir o alternador no elemento alvo
        targetElement.insertAdjacentHTML('beforeend', LANGUAGE_INTEGRATION_CONFIG.LANGUAGE_SWITCHER.DEFAULT_HTML);
    }
    
    return true;
}

/**
 * Carrega os scripts necessários para o funcionamento do sistema multilíngue
 * @param {boolean} forceLoad - Forçar o carregamento mesmo se já estiverem presentes
 * @returns {Object} Status de carregamento de cada script
 */
function loadLanguageScripts(forceLoad = false) {
    const scriptsStatus = {
        switcher: false,
        diagnostics: false
    };
    
    // Verificar se o script switcher já está carregado
    const switcherLoaded = Array.from(document.scripts).some(script => 
        script.src.includes('language-switcher.js')
    );
    
    if (!switcherLoaded || forceLoad) {
        const switcherScript = document.createElement('script');
        switcherScript.src = '/scripts/i18n/language-switcher.js';
        switcherScript.setAttribute('data-auto-init', 'true');
        document.head.appendChild(switcherScript);
        
        scriptsStatus.switcher = true;
    } else {
        scriptsStatus.switcher = 'already-loaded';
    }
    
    // Em ambiente de desenvolvimento, carregar também o diagnóstico
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('debug=true')) {
        
        const diagnosticsLoaded = Array.from(document.scripts).some(script => 
            script.src.includes('language-diagnostics.js')
        );
        
        if (!diagnosticsLoaded || forceLoad) {
            const diagnosticsScript = document.createElement('script');
            diagnosticsScript.src = '/scripts/i18n/language-diagnostics.js';
            document.head.appendChild(diagnosticsScript);
            
            scriptsStatus.diagnostics = true;
        } else {
            scriptsStatus.diagnostics = 'already-loaded';
        }
    }
    
    return scriptsStatus;
}

/**
 * Adiciona metadados para SEO relacionados aos idiomas disponíveis
 */
function addLanguageMetadata() {
    // Adicionar metadados alternados para cada idioma
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    
    // Remover parâmetros de idioma existentes para criar URLs limpas
    const baseUrl = currentUrl.split('?')[0];
    
    // Verificar se já existem meta tags alternadas
    const existingAlternates = document.querySelectorAll('link[rel="alternate"][hreflang]');
    if (existingAlternates.length > 0) return;
    
    // Criar links para cada idioma
    const languages = ['en', 'pt'];
    languages.forEach(lang => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = `${baseUrl}?lang=${lang}`;
        document.head.appendChild(link);
    });
    
    // Adicionar meta tag de idioma
    if (!document.querySelector('meta[name="language"]')) {
        const metaLang = document.createElement('meta');
        metaLang.name = 'language';
        metaLang.content = getUserPreferredLang() || 'en';
        document.head.appendChild(metaLang);
    }
}

/**
 * Aplica a classe de idioma ativo aos elementos
 * @param {string} language - Código do idioma ('en' ou 'pt')
 */
function applyActiveLanguage(language) {
    if (!language || (language !== 'en' && language !== 'pt')) {
        language = 'en'; // Idioma padrão
    }
    
    // Remover classes ativas de todos os elementos
    document.querySelectorAll('.lang-en.active-lang, .lang-pt.active-lang').forEach(el => {
        el.classList.remove('active-lang');
    });
    
    // Adicionar classe ativa aos elementos do idioma selecionado
    document.querySelectorAll(`.lang-${language}`).forEach(el => {
        el.classList.add('active-lang');
    });
    
    // Atualizar botões de idioma
    document.querySelectorAll('.language-switcher .lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === language) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Armazenar preferência de idioma
    localStorage.setItem('user_lang', language);
    
    // Atualizar meta tag de idioma
    const metaLang = document.querySelector('meta[name="language"]');
    if (metaLang) {
        metaLang.content = language;
    }
}

/**
 * Obtém o idioma preferido do usuário com base na ordem de prioridade:
 * 1. Parâmetro de URL
 * 2. Armazenamento local
 * 3. Preferência do navegador
 * 4. Padrão (en)
 * @returns {string} Código do idioma ('en' ou 'pt')
 */
function getUserPreferredLang() {
    // 1. Verificar parâmetro de URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang === 'en' || urlLang === 'pt') {
        return urlLang;
    }
    
    // 2. Verificar armazenamento local
    const localLang = localStorage.getItem('user_lang');
    if (localLang === 'en' || localLang === 'pt') {
        return localLang;
    }
    
    // 3. Verificar preferência do navegador
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.toLowerCase().startsWith('pt')) {
        return 'pt';
    }
    
    // 4. Padrão
    return 'en';
}

/**
 * Gera um componente HTML com suporte para múltiplos idiomas
 * @param {Object} options - Opções para o componente
 * @returns {string} HTML do componente
 */
function createMultiLangElement(options) {
    const {
        tag = 'div',
        en = '',
        pt = '',
        className = '',
        attributes = {}
    } = options;
    
    // Criar string de atributos
    let attributesStr = '';
    Object.entries(attributes).forEach(([key, value]) => {
        attributesStr += ` ${key}="${value}"`;
    });
    
    // Criar componente HTML
    return `
        <${tag} class="${className}"${attributesStr}>
            <span class="lang-en${getUserPreferredLang() === 'en' ? ' active-lang' : ''}">${en}</span>
            <span class="lang-pt${getUserPreferredLang() === 'pt' ? ' active-lang' : ''}">${pt}</span>
        </${tag}>
    `;
}

/**
 * Registra os eventos necessários para o alternador de idiomas
 * caso o script language-switcher.js não esteja carregado
 */
function registerBasicLanguageSwitcher() {
    // Verificar se já existe alternador registrado
    if (window.initLanguageSwitcher) return;
    
    // Registrar evento de clique nos botões de idioma
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Verificar se é um botão de idioma
        if (target.matches('.language-switcher .lang-btn') || 
            target.closest('.language-switcher .lang-btn')) {
            
            const button = target.matches('.lang-btn') ? target : target.closest('.lang-btn');
            const language = button.getAttribute('data-lang');
            
            if (language === 'en' || language === 'pt') {
                applyActiveLanguage(language);
                event.preventDefault();
            }
        }
    });
}

/**
 * Carrega o CSS para o seletor de idiomas
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
window.integrateMultiLanguageSupport = integrateMultiLanguageSupport;
window.createMultiLangElement = createMultiLangElement;
window.initLanguageIntegration = initLanguageIntegration;
window.prepareTextElementsForTranslation = prepareTextElementsForTranslation;

// Inicializar automaticamente quando requisitado via atributo
document.addEventListener('DOMContentLoaded', function() {
    const autoInit = document.querySelector('script[data-auto-language-integration="true"]');
    if (autoInit) {
        const initOptions = {};
        
        // Verificar atributos de configuração
        if (autoInit.hasAttribute('data-switcher-position')) {
            initOptions.switcherPosition = autoInit.getAttribute('data-switcher-position');
        }
        
        if (autoInit.hasAttribute('data-add-css') && autoInit.getAttribute('data-add-css') === 'false') {
            initOptions.addCssStyles = false;
        }
        
        if (autoInit.hasAttribute('data-initial-lang')) {
            initOptions.initialLanguage = autoInit.getAttribute('data-initial-lang');
        }
        
        // Inicializar
        integrateMultiLanguageSupport(initOptions);
    }
    
    // Registrar alternador básico
    registerBasicLanguageSwitcher();
});

console.log('🌐 RUNES Analytics Pro - Integrador de Componentes Multilíngues carregado!');
console.log('🌐 RUNES Analytics Pro - Integrador de Seletor de Idiomas carregado!'); 
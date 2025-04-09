/**
 * RUNES Analytics Pro - Configuração de Internacionalização
 * 
 * Este script fornece funções para configurar e inicializar o sistema multilíngue
 * em páginas específicas, carregando os componentes necessários e configurando
 * as traduções.
 */

/**
 * Configurações do sistema de internacionalização
 */
const I18N_CONFIG = {
    // Caminhos para os scripts de internacionalização
    SCRIPTS: {
        SWITCHER: 'scripts/i18n/language-switcher.js',
        INTEGRATOR: 'scripts/i18n/language-integrator.js',
        CONVERTER: 'scripts/i18n/text-converter.js'
    },
    
    // Classes CSS para os idiomas
    LANG_CLASSES: {
        EN: 'lang-en',
        PT: 'lang-pt',
        ACTIVE: 'active-lang'
    },
    
    // Opções padrão para inicialização
    DEFAULT_OPTIONS: {
        autoTranslate: false,           // Traduzir automaticamente textos
        convertExistingTexts: false,    // Converter textos existentes para formato multilíngue
        addLanguageSwitcher: true,      // Adicionar seletor de idioma
        markAsProcessed: true,          // Marcar elementos processados para evitar duplicação
        loadTranslations: true,         // Carregar traduções específicas da página
        defaultLanguage: null,          // Idioma padrão (null = detectar)
        switcherPosition: '#header-nav' // Posição do seletor de idioma
    }
};

/**
 * Inicializa o sistema de internacionalização em uma página
 * @param {Object} options - Opções de configuração
 * @returns {Promise} Promessa resolvida quando a inicialização estiver completa
 */
async function setupI18N(options = {}) {
    // Mesclar opções com padrões
    const config = {
        ...I18N_CONFIG.DEFAULT_OPTIONS,
        ...options
    };
    
    console.log('🌐 Iniciando configuração de internacionalização');
    
    try {
        // Carregar scripts necessários
        await loadI18NScripts(config);
        
        // Detectar ou definir o idioma padrão
        const detectedLanguage = config.defaultLanguage || detectUserLanguage();
        console.log(`🔍 Idioma detectado: ${detectedLanguage}`);
        
        // Salvar idioma nas configurações
        if (!config.defaultLanguage) {
            config.defaultLanguage = detectedLanguage;
        }
        
        // Adicionar metadados de idioma
        addLanguageMetadata(config.defaultLanguage);
        
        // Carregar traduções específicas da página se necessário
        if (config.loadTranslations) {
            await loadPageTranslations(config);
        }
        
        // Converter textos existentes se solicitado
        if (config.convertExistingTexts && window.convertTextToMultilingual) {
            console.log('🔄 Convertendo textos existentes para formato multilíngue');
            window.convertTextToMultilingual({
                autoTranslate: config.autoTranslate,
                defaultActiveLang: config.defaultLanguage
            });
        }
        
        // Aplicar idioma ativo
        applyActiveLanguage(config.defaultLanguage);
        
        // Configurar eventos de mudança de idioma
        setupLanguageChangeEvents();
        
        console.log('✅ Configuração de internacionalização concluída');
        return true;
    } catch (error) {
        console.error('❌ Erro na configuração de internacionalização:', error);
        return false;
    }
}

/**
 * Carrega os scripts necessários para o sistema de internacionalização
 * @param {Object} config - Configurações
 * @returns {Promise} Promessa resolvida quando todos os scripts estiverem carregados
 */
async function loadI18NScripts(config) {
    const scripts = [];
    
    // Language Switcher (obrigatório)
    scripts.push(loadScript(I18N_CONFIG.SCRIPTS.SWITCHER));
    
    // Language Integrator (opcional)
    if (config.addLanguageSwitcher) {
        scripts.push(loadScript(I18N_CONFIG.SCRIPTS.INTEGRATOR));
    }
    
    // Text Converter (opcional)
    if (config.convertExistingTexts) {
        scripts.push(loadScript(I18N_CONFIG.SCRIPTS.CONVERTER));
    }
    
    return Promise.all(scripts);
}

/**
 * Carrega um script de forma assíncrona
 * @param {string} src - Caminho para o script
 * @returns {Promise} Promessa resolvida quando o script estiver carregado
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Verificar se o script já está carregado
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            return resolve(true);
        }
        
        // Criar e adicionar o script
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = () => resolve(true);
        script.onerror = (error) => reject(new Error(`Erro ao carregar script: ${src}`));
        
        document.head.appendChild(script);
    });
}

/**
 * Detecta o idioma preferido do usuário
 * @returns {string} Código do idioma ('en' ou 'pt')
 */
function detectUserLanguage() {
    // Verificar parâmetro na URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang === 'en' || urlLang === 'pt') {
        // Salvar preferência no localStorage
        localStorage.setItem('user_lang', urlLang);
        return urlLang;
    }
    
    // Verificar preferência salva
    const savedLang = localStorage.getItem('user_lang');
    if (savedLang === 'en' || savedLang === 'pt') {
        return savedLang;
    }
    
    // Verificar idioma do navegador
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) {
        return 'pt';
    }
    
    // Padrão: inglês
    return 'en';
}

/**
 * Adiciona metadados de idioma ao documento
 * @param {string} language - Código do idioma
 */
function addLanguageMetadata(language) {
    // Definir atributo lang no html
    document.documentElement.lang = language;
    
    // Adicionar meta tags para SEO
    const alternateLink = document.querySelector('link[rel="alternate"][hreflang]');
    if (!alternateLink) {
        const currentUrl = window.location.href.split('?')[0];
        
        // Adicionar link para versão em inglês
        const enLink = document.createElement('link');
        enLink.rel = 'alternate';
        enLink.hreflang = 'en';
        enLink.href = `${currentUrl}?lang=en`;
        document.head.appendChild(enLink);
        
        // Adicionar link para versão em português
        const ptLink = document.createElement('link');
        ptLink.rel = 'alternate';
        ptLink.hreflang = 'pt';
        ptLink.href = `${currentUrl}?lang=pt`;
        document.head.appendChild(ptLink);
    }
}

/**
 * Carrega traduções específicas para a página atual
 * @param {Object} config - Configurações
 * @returns {Promise} Promessa resolvida quando as traduções estiverem carregadas
 */
async function loadPageTranslations(config) {
    try {
        // Obter o nome da página atual
        const pagePath = window.location.pathname;
        const pageName = pagePath.split('/').pop().replace('.html', '') || 'index';
        
        // Carregar arquivo de traduções
        const translationsPath = `translations/${pageName}.json`;
        const response = await fetch(translationsPath);
        
        // Se encontrar arquivo de traduções, registrar no sistema
        if (response.ok) {
            const translations = await response.json();
            console.log(`📚 Traduções carregadas para: ${pageName}`);
            
            // Registrar traduções no sistema (se function exist)
            if (window.registerTranslations) {
                window.registerTranslations(translations);
            }
            
            return translations;
        }
        
        console.log(`ℹ️ Arquivo de traduções não encontrado para: ${pageName}`);
        return null;
    } catch (error) {
        console.warn('⚠️ Erro ao carregar traduções:', error);
        return null;
    }
}

/**
 * Aplica o idioma ativo aos elementos da página
 * @param {string} language - Código do idioma
 */
function applyActiveLanguage(language) {
    // Verificar se o changeLanguage global está disponível
    if (window.changeLanguage) {
        window.changeLanguage(language);
        return;
    }
    
    // Implementação básica caso o switcher ainda não esteja carregado
    document.querySelectorAll(`.${I18N_CONFIG.LANG_CLASSES.EN}, .${I18N_CONFIG.LANG_CLASSES.PT}`).forEach(el => {
        el.classList.remove(I18N_CONFIG.LANG_CLASSES.ACTIVE);
    });
    
    // Ativar classe correspondente ao idioma
    const langClass = language === 'pt' ? I18N_CONFIG.LANG_CLASSES.PT : I18N_CONFIG.LANG_CLASSES.EN;
    document.querySelectorAll(`.${langClass}`).forEach(el => {
        el.classList.add(I18N_CONFIG.LANG_CLASSES.ACTIVE);
    });
}

/**
 * Configura eventos para troca de idioma
 */
function setupLanguageChangeEvents() {
    // Ouvir o evento personalizado de mudança de idioma
    document.addEventListener('languageChanged', (event) => {
        const newLanguage = event.detail.language;
        
        // Atualizar metadados
        document.documentElement.lang = newLanguage;
        
        // Salvar preferência
        localStorage.setItem('user_lang', newLanguage);
        
        // Atualizar URL (opcional) para manter o parâmetro na navegação
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('lang', newLanguage);
        
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
    });
}

/**
 * Inicializa o sistema quando o documento estiver pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o script deve iniciar automaticamente
    const autoInit = document.querySelector('script[data-auto-i18n="true"]');
    if (autoInit) {
        const options = {};
        
        // Ler configurações do atributo data
        if (autoInit.dataset) {
            for (const [key, value] of Object.entries(autoInit.dataset)) {
                if (key !== 'autoI18n') {
                    // Converter string para tipo apropriado
                    options[key] = value === 'true' ? true : 
                                   value === 'false' ? false : 
                                   value === 'null' ? null : value;
                }
            }
        }
        
        // Inicializar o sistema
        setupI18N(options);
    }
});

// Exportar funções para uso global
window.setupI18N = setupI18N;
window.detectUserLanguage = detectUserLanguage;

console.log('🌐 RUNES Analytics Pro - Sistema de Internacionalização carregado!'); 
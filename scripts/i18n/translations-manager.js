/**
 * RUNES Analytics Pro - Gerenciador de Traduções
 * 
 * Este script gerencia o carregamento, armazenamento e acesso a traduções
 * para diferentes idiomas no sistema.
 */

/**
 * Configurações do gerenciador de traduções
 */
const TRANSLATIONS_CONFIG = {
    // Idiomas suportados
    SUPPORTED_LANGUAGES: ['en', 'pt'],
    
    // Idioma padrão
    DEFAULT_LANGUAGE: 'en',
    
    // Caminho base para os arquivos de tradução
    TRANSLATIONS_PATH: './translations/',
    
    // Sufixo do arquivo de tradução
    TRANSLATIONS_FILE_SUFFIX: '.json',
    
    // Cache para armazenar as traduções carregadas
    TRANSLATIONS_CACHE: {},
    
    // Eventos
    EVENTS: {
        TRANSLATIONS_LOADED: 'translationsLoaded',
        TRANSLATION_ERROR: 'translationError'
    }
};

/**
 * Cache de traduções carregadas
 * Estrutura: { 'en': { 'key': 'value' }, 'pt': { 'key': 'value' } }
 */
const translationsCache = {};

/**
 * Carrega as traduções para um idioma específico
 * @param {string} language - Código do idioma (en, pt)
 * @param {string} [section] - Seção específica (opcional)
 * @returns {Promise<Object>} Objeto com as traduções
 */
async function loadTranslations(language, section = 'common') {
    // Verificar se o idioma é suportado
    if (!TRANSLATIONS_CONFIG.SUPPORTED_LANGUAGES.includes(language)) {
        console.warn(`Idioma não suportado: ${language}. Usando idioma padrão.`);
        language = TRANSLATIONS_CONFIG.DEFAULT_LANGUAGE;
    }
    
    // Verificar se já está no cache
    const cacheKey = `${language}:${section}`;
    if (translationsCache[cacheKey]) {
        return translationsCache[cacheKey];
    }
    
    try {
        // Construir o caminho do arquivo
        const filePath = `${TRANSLATIONS_CONFIG.TRANSLATIONS_PATH}${section}/${language}${TRANSLATIONS_CONFIG.TRANSLATIONS_FILE_SUFFIX}`;
        
        // Carregar o arquivo
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`Falha ao carregar traduções: ${response.status} ${response.statusText}`);
        }
        
        // Converter para JSON
        const translations = await response.json();
        
        // Armazenar no cache
        translationsCache[cacheKey] = translations;
        
        // Disparar evento de traduções carregadas
        document.dispatchEvent(new CustomEvent(TRANSLATIONS_CONFIG.EVENTS.TRANSLATIONS_LOADED, {
            detail: {
                language,
                section,
                translations
            }
        }));
        
        return translations;
    } catch (error) {
        console.error(`Erro ao carregar traduções para ${language}/${section}:`, error);
        
        // Disparar evento de erro de tradução
        document.dispatchEvent(new CustomEvent(TRANSLATIONS_CONFIG.EVENTS.TRANSLATION_ERROR, {
            detail: {
                language,
                section,
                error: error.message
            }
        }));
        
        // Tentar carregar o idioma padrão
        if (language !== TRANSLATIONS_CONFIG.DEFAULT_LANGUAGE) {
            console.warn(`Tentando carregar traduções para o idioma padrão: ${TRANSLATIONS_CONFIG.DEFAULT_LANGUAGE}`);
            return loadTranslations(TRANSLATIONS_CONFIG.DEFAULT_LANGUAGE, section);
        }
        
        // Retornar objeto vazio se tudo falhar
        return {};
    }
}

/**
 * Obtém uma tradução específica
 * @param {string} key - Chave da tradução
 * @param {string} [language] - Código do idioma (opcional, usa o idioma atual)
 * @param {string} [section] - Seção da tradução (opcional, usa 'common')
 * @param {Object} [params] - Parâmetros para substituição na tradução
 * @returns {string} Texto traduzido
 */
function getTranslation(key, language = null, section = 'common', params = {}) {
    // Usar o idioma atual se não for especificado
    const currentLanguage = language || (window.getUserPreferredLang ? window.getUserPreferredLang() : TRANSLATIONS_CONFIG.DEFAULT_LANGUAGE);
    
    // Verificar se as traduções estão carregadas
    const cacheKey = `${currentLanguage}:${section}`;
    
    if (!translationsCache[cacheKey]) {
        // Se as traduções não estiverem carregadas, retornar a chave
        console.warn(`Traduções para ${currentLanguage}/${section} não estão carregadas. Usando a chave como fallback.`);
        
        // Iniciar carregamento assíncrono para uso futuro
        loadTranslations(currentLanguage, section);
        
        // Retornar a chave como fallback
        return key;
    }
    
    // Obter a tradução
    const translation = translationsCache[cacheKey][key];
    
    // Se a tradução não existir, retornar a chave
    if (!translation) {
        console.warn(`Tradução não encontrada para a chave "${key}" em ${currentLanguage}/${section}`);
        return key;
    }
    
    // Substituir parâmetros na tradução
    if (params && Object.keys(params).length > 0) {
        return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
            return result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
        }, translation);
    }
    
    return translation;
}

/**
 * Carrega traduções para uma página específica
 * @param {string} pageName - Nome da página
 * @param {string} [language] - Código do idioma (opcional, usa o idioma atual)
 * @returns {Promise<Object>} Objeto com as traduções
 */
async function loadPageTranslations(pageName, language = null) {
    // Usar o idioma atual se não for especificado
    const currentLanguage = language || (window.getUserPreferredLang ? window.getUserPreferredLang() : TRANSLATIONS_CONFIG.DEFAULT_LANGUAGE);
    
    // Carregar traduções comuns
    const commonTranslations = await loadTranslations(currentLanguage, 'common');
    
    // Carregar traduções específicas da página
    const pageTranslations = await loadTranslations(currentLanguage, pageName);
    
    // Retornar a combinação de ambas
    return {
        ...commonTranslations,
        ...pageTranslations
    };
}

/**
 * Aplica traduções a elementos HTML
 * @param {string} [language] - Código do idioma (opcional, usa o idioma atual)
 */
async function applyTranslations(language = null) {
    // Usar o idioma atual se não for especificado
    const currentLanguage = language || (window.getUserPreferredLang ? window.getUserPreferredLang() : TRANSLATIONS_CONFIG.DEFAULT_LANGUAGE);
    
    // Obter a página atual
    const pageName = document.body.dataset.page || 'common';
    
    // Carregar traduções para a página
    await loadPageTranslations(pageName, currentLanguage);
    
    // Selecionar todos os elementos com o atributo data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    // Aplicar traduções
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const section = element.getAttribute('data-i18n-section') || pageName;
        
        // Obter parâmetros do elemento
        const params = {};
        
        // Verificar atributos data-i18n-param-*
        Array.from(element.attributes)
            .filter(attr => attr.name.startsWith('data-i18n-param-'))
            .forEach(attr => {
                const paramName = attr.name.replace('data-i18n-param-', '');
                params[paramName] = attr.value;
            });
        
        // Obter a tradução
        const translation = getTranslation(key, currentLanguage, section, params);
        
        // Aplicar a tradução ao elemento
        if (translation) {
            // Verificar o atributo data-i18n-attr para saber onde aplicar a tradução
            const attr = element.getAttribute('data-i18n-attr');
            
            if (attr) {
                // Aplicar à propriedade especificada (placeholder, title, etc.)
                element.setAttribute(attr, translation);
            } else {
                // Aplicar ao conteúdo do elemento
                element.innerHTML = translation;
            }
        }
    });
}

/**
 * Adiciona um ouvinte para mudanças de idioma e atualiza as traduções
 */
function setupTranslationEvents() {
    document.addEventListener('languageChanged', async (event) => {
        const newLanguage = event.detail.language;
        
        // Aplicar traduções para o novo idioma
        await applyTranslations(newLanguage);
        
        console.log(`🌐 Traduções atualizadas para: ${newLanguage}`);
    });
}

/**
 * Inicializa o gerenciador de traduções
 * @param {Object} [options] - Opções de configuração
 */
function initTranslationsManager(options = {}) {
    // Mesclar opções
    const config = {
        autoApply: true,        // Aplicar traduções automaticamente
        setupEvents: true,      // Configurar eventos
        language: null,         // Idioma (opcional)
        ...options
    };
    
    // Configurar eventos
    if (config.setupEvents) {
        setupTranslationEvents();
    }
    
    // Aplicar traduções automaticamente
    if (config.autoApply) {
        applyTranslations(config.language);
    }
}

// Exportar funções para uso global
window.loadTranslations = loadTranslations;
window.getTranslation = getTranslation;
window.loadPageTranslations = loadPageTranslations;
window.applyTranslations = applyTranslations;
window.initTranslationsManager = initTranslationsManager;

// Auto-inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar atributo data-auto-translations
    const autoTranslate = document.body.hasAttribute('data-auto-translations');
    
    if (autoTranslate) {
        initTranslationsManager();
    }
});

console.log('🌐 RUNES Analytics Pro - Gerenciador de Traduções carregado!'); 
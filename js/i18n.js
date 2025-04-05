/**
 * RUNES Analytics Pro - Sistema de internacionalização
 * 
 * Este módulo gerencia as traduções e mudanças de idioma na aplicação.
 * Suporta múltiplos idiomas e persiste a preferência do usuário.
 */

// Configuração inicial do idioma padrão
let currentLang = localStorage.getItem('runesAnalyticsLanguage') || "en"; 

// Armazena as traduções carregadas
let translations = {};

// Armazena os callbacks para notificação de mudança de idioma
const languageChangeCallbacks = [];

/**
 * Inicializa o sistema de idiomas
 * Carrega o idioma preferido do usuário se disponível, ou usa o padrão
 */
async function initLanguage() {
    // Verifica se há uma preferência salva
    const savedLang = localStorage.getItem('runesAnalyticsLanguage');
    
    // Verifica o idioma do navegador como fallback
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    
    // Define o idioma com base na preferência salva ou idioma do navegador
    const preferredLang = savedLang || browserLang;
    
    // Define o idioma no HTML
    document.documentElement.lang = preferredLang;
    
    // Carrega o idioma preferido
    await loadLanguage(preferredLang);
    
    // Configura handlers para os botões de idioma
    document.querySelectorAll('[data-lang-switch]').forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang-switch');
            loadLanguage(lang);
        });
    });
    
    // Observa eventos de mudança de idioma do language-switcher.js
    document.addEventListener('languageChanged', function(e) {
        if (e.detail && e.detail.language) {
            // Apenas carrega se for diferente do idioma atual
            if (e.detail.language !== currentLang) {
                loadLanguage(e.detail.language);
            }
        }
    });
    
    console.log(`Sistema de idiomas inicializado: ${currentLang}`);
    
    return preferredLang;
}

/**
 * Carrega um arquivo de idioma e aplica as traduções
 * @param {string} lang - O código do idioma a ser carregado (ex: 'pt', 'en')
 */
async function loadLanguage(lang) {
    // Valida o idioma (simplificado para apenas pt e en)
    const validLang = ['pt', 'en'].includes(lang) ? lang : 'en';
    
    try {
        // Se já temos as traduções carregadas, apenas muda o idioma atual
        if (!translations[validLang]) {
            console.log(`Carregando arquivo de idioma: ${validLang}`);
            const response = await fetch(`lang/${validLang}.json`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar idioma ${validLang}: ${response.statusText}`);
            }
            
            translations[validLang] = await response.json();
            
            // Compartilha as traduções com o sistema global (language-switcher.js)
            if (window.translations) {
                window.translations[validLang] = translations[validLang];
            }
        }
        
        // Atualiza o idioma atual
        currentLang = validLang;
        
        // Salva a preferência do usuário
        localStorage.setItem('runesAnalyticsLanguage', validLang);
        
        // Atualiza o atributo lang no HTML
        document.documentElement.lang = validLang;
        
        // Aplica as traduções na página
        applyTranslations();
        
        // Notifica sobre a mudança de idioma
        dispatchLanguageChanged(validLang);
        
        return true;
    } catch (error) {
        console.error('Erro ao carregar idioma:', error);
        
        // Se falhar e não for o idioma inglês, tenta carregar o inglês como fallback
        if (validLang !== 'en') {
            console.log('Tentando fallback para inglês...');
            return loadLanguage('en');
        }
        
        return false;
    }
}

/**
 * Aplica as traduções no HTML atual
 */
function applyTranslations() {
    // Se não temos traduções para o idioma atual, não faz nada
    if (!translations[currentLang]) {
        console.warn(`Traduções não disponíveis para ${currentLang}`);
        return;
    }
    
    // Procura por todos os elementos com o atributo data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Traduz o conteúdo se a chave existir
        if (translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
    
    // Traduz placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            element.setAttribute('placeholder', translations[currentLang][key]);
        }
    });
    
    // Traduz títulos
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[currentLang][key]) {
            element.setAttribute('title', translations[currentLang][key]);
        }
    });
}

/**
 * Obtém a tradução para uma chave específica
 * @param {string} key - A chave de tradução
 * @returns {string} - A tradução ou a própria chave se não encontrada
 */
function t(key) {
    // Se não temos traduções para o idioma atual, retorna a chave
    if (!translations[currentLang] || !translations[currentLang][key]) {
        return key;
    }
    
    return translations[currentLang][key];
}

/**
 * Define o idioma atual
 * @param {string} lang - O código do idioma
 */
function setLang(lang) {
    loadLanguage(lang);
}

/**
 * Retorna o idioma atual
 * @returns {string} - O código do idioma atual
 */
function getCurrentLanguage() {
    return currentLang;
}

/**
 * Adiciona um novo callback para mudanças de idioma
 * @param {Function} callback - A função a ser chamada quando o idioma mudar
 */
function onLanguageChange(callback) {
    if (typeof callback === 'function') {
        languageChangeCallbacks.push(callback);
    }
}

/**
 * Remove um callback de mudança de idioma
 * @param {Function} callback - A função a ser removida
 */
function offLanguageChange(callback) {
    const index = languageChangeCallbacks.indexOf(callback);
    if (index !== -1) {
        languageChangeCallbacks.splice(index, 1);
    }
}

/**
 * Dispara o evento de mudança de idioma
 * @param {string} lang - O novo idioma
 */
function dispatchLanguageChanged(lang) {
    // Executa todos os callbacks registrados
    languageChangeCallbacks.forEach(callback => {
        try {
            callback(lang);
        } catch (error) {
            console.error('Erro no callback de mudança de idioma:', error);
        }
    });
    
    // Dispara um evento personalizado
    const event = new CustomEvent('languageChanged', { 
        detail: { language: lang } 
    });
    document.dispatchEvent(event);
}

// Integração com o sistema global
if (typeof window !== 'undefined') {
    // Exporta funções para o objeto global
    window.i18n = {
        t,
        setLang,
        getCurrentLanguage,
        loadLanguage,
        initLanguage
    };
    
    // Define a função getTranslation como alias para t
    if (!window.getTranslation) {
        window.getTranslation = t;
    }
}

// Exporta as funções públicas
export {
    initLanguage,
    loadLanguage,
    getCurrentLanguage,
    t,
    setLang,
    onLanguageChange,
    offLanguageChange
}; 
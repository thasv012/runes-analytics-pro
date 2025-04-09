/**
 * RUNES Analytics Pro - Carregador de Módulos i18n
 * 
 * Este script carrega todos os módulos relacionados à internacionalização
 * em ordem para garantir o funcionamento correto do sistema multilíngue.
 */

// Caminho base para os scripts de i18n
const I18N_BASE_PATH = 'scripts/i18n/';

// Lista de scripts a serem carregados em ordem
const I18N_MODULES = [
    'translations-manager.js',        // Gerenciador de traduções
    'language-utils.js',              // Utilitários de idioma
    'language-integrator.js',         // Integrador do seletor de idiomas
    'language-validator.js'           // Validador de idiomas (desenvolvimento)
];

// Configurações de carregamento
const I18N_LOAD_CONFIG = {
    async: true,                      // Carregar os scripts de forma assíncrona
    defer: true,                      // Adiar a execução até o DOM estar pronto
    showDebug: false,                 // Mostrar informações de debug no console
    validateOnLoad: false,            // Executar validação de idioma ao carregar
    autoTranslate: true,              // Aplicar traduções automaticamente
    loadOrder: 'sequential',          // 'sequential' ou 'parallel'
    timeout: 10000                    // Tempo limite para carregamento (ms)
};

/**
 * Carrega um script externo
 * @param {string} src - Caminho do script
 * @param {boolean} async - Carregar de forma assíncrona
 * @param {boolean} defer - Adiar execução
 * @returns {Promise} Promise que resolve quando o script é carregado
 */
function loadScript(src, async = true, defer = true) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.defer = defer;
        
        // Configurar handlers de eventos
        script.onload = () => {
            if (I18N_LOAD_CONFIG.showDebug) {
                console.log(`✅ Script carregado: ${src}`);
            }
            resolve(script);
        };
        
        script.onerror = () => {
            console.error(`❌ Erro ao carregar script: ${src}`);
            reject(new Error(`Falha ao carregar ${src}`));
        };
        
        // Definir timeout
        const timeoutId = setTimeout(() => {
            reject(new Error(`Timeout ao carregar ${src}`));
        }, I18N_LOAD_CONFIG.timeout);
        
        // Limpar timeout quando o script carregar
        script.onload = () => {
            clearTimeout(timeoutId);
            if (I18N_LOAD_CONFIG.showDebug) {
                console.log(`✅ Script carregado: ${src}`);
            }
            resolve(script);
        };
        
        // Adicionar ao documento
        document.head.appendChild(script);
    });
}

/**
 * Carrega scripts sequencialmente
 * @param {Array} scripts - Lista de caminhos de scripts
 * @returns {Promise} Promise que resolve quando todos os scripts são carregados
 */
async function loadSequentially(scripts) {
    for (const script of scripts) {
        try {
            await loadScript(I18N_BASE_PATH + script, I18N_LOAD_CONFIG.async, I18N_LOAD_CONFIG.defer);
        } catch (error) {
            console.error('Erro ao carregar script sequencialmente:', error);
        }
    }
}

/**
 * Carrega scripts em paralelo
 * @param {Array} scripts - Lista de caminhos de scripts
 * @returns {Promise} Promise que resolve quando todos os scripts são carregados
 */
async function loadInParallel(scripts) {
    const promises = scripts.map(script => 
        loadScript(I18N_BASE_PATH + script, I18N_LOAD_CONFIG.async, I18N_LOAD_CONFIG.defer)
            .catch(error => {
                console.error('Erro ao carregar script em paralelo:', error);
                return null; // Continuar carregando os outros scripts mesmo se um falhar
            })
    );
    
    await Promise.all(promises);
}

/**
 * Configura a página para internacionalização
 */
function setupI18n() {
    // Adicionar atributo data-page ao body se não existir
    if (!document.body.hasAttribute('data-page')) {
        // Obter o nome da página a partir do caminho
        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '') || 'index';
        document.body.setAttribute('data-page', pageName);
    }
    
    // Adicionar atributo data-auto-translations se configurado
    if (I18N_LOAD_CONFIG.autoTranslate) {
        document.body.setAttribute('data-auto-translations', 'true');
    }
    
    // Configurar o validador de idiomas
    if (I18N_LOAD_CONFIG.validateOnLoad && window.LANGUAGE_VALIDATOR_CONFIG) {
        window.LANGUAGE_VALIDATOR_CONFIG.VALIDATE_ON_LOAD = true;
    }
}

/**
 * Inicializa o carregamento de todos os módulos i18n
 */
async function initI18nModules() {
    try {
        console.log('🌐 Iniciando carregamento de módulos i18n...');
        
        // Carregar os scripts na ordem especificada
        if (I18N_LOAD_CONFIG.loadOrder === 'sequential') {
            await loadSequentially(I18N_MODULES);
        } else {
            await loadInParallel(I18N_MODULES);
        }
        
        // Configurar a página para i18n
        setupI18n();
        
        console.log('✅ Módulos i18n carregados com sucesso!');
        
        // Disparar evento de carregamento concluído
        document.dispatchEvent(new CustomEvent('i18nModulesLoaded'));
    } catch (error) {
        console.error('Erro ao inicializar módulos i18n:', error);
    }
}

// Detectar se estamos em modo de desenvolvimento
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('.local');

// Configurar modo de debug no desenvolvimento
if (isDevelopment) {
    I18N_LOAD_CONFIG.showDebug = true;
}

// Carregar os módulos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initI18nModules);

console.log('🌐 RUNES Analytics Pro - Carregador de Módulos i18n iniciado!'); 
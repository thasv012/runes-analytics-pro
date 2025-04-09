/**
 * RUNES Analytics Pro - Validador de Idiomas
 * 
 * Este script valida e corrige problemas de idioma em todas as páginas do site.
 * Ferramentas para desenvolvedores e administradores do site.
 */

/**
 * Configurações do validador de idiomas
 */
const LANGUAGE_VALIDATOR_CONFIG = {
    SUPPORTED_LANGUAGES: ['en', 'pt'],
    DEFAULT_LANGUAGE: 'en',
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    AUTO_FIX: false, // Corrigir automaticamente problemas ao carregar
    SHOW_UI: false, // Mostrar UI do validador (apenas em modo de desenvolvimento)
    VALIDATE_ON_LOAD: false // Executar validação ao carregar a página
};

/**
 * Log personalizado
 */
const LanguageLogger = {
    debug: (message, ...args) => {
        if (['debug'].includes(LANGUAGE_VALIDATOR_CONFIG.LOG_LEVEL)) {
            console.debug(`🔍 [Lang Validator] ${message}`, ...args);
        }
    },
    info: (message, ...args) => {
        if (['debug', 'info'].includes(LANGUAGE_VALIDATOR_CONFIG.LOG_LEVEL)) {
            console.info(`🌐 [Lang Validator] ${message}`, ...args);
        }
    },
    warn: (message, ...args) => {
        if (['debug', 'info', 'warn'].includes(LANGUAGE_VALIDATOR_CONFIG.LOG_LEVEL)) {
            console.warn(`⚠️ [Lang Validator] ${message}`, ...args);
        }
    },
    error: (message, ...args) => {
        if (['debug', 'info', 'warn', 'error'].includes(LANGUAGE_VALIDATOR_CONFIG.LOG_LEVEL)) {
            console.error(`❌ [Lang Validator] ${message}`, ...args);
        }
    },
    success: (message, ...args) => {
        if (['debug', 'info', 'warn', 'error'].includes(LANGUAGE_VALIDATOR_CONFIG.LOG_LEVEL)) {
            console.log(`✅ [Lang Validator] ${message}`, ...args);
        }
    }
};

/**
 * Classe principal do validador
 */
class LanguageValidator {
    constructor(config = {}) {
        this.config = {
            ...LANGUAGE_VALIDATOR_CONFIG,
            ...config
        };
        
        this.issues = {
            missingPairs: [],
            inconsistentAttributes: [],
            mixedClasses: [],
            invalidMarkup: []
        };
        
        this.stats = {
            totalElements: 0,
            withLangEn: 0,
            withLangPt: 0,
            withBoth: 0,
            withI18n: 0,
            issuesFixed: 0
        };
        
        // Inicializar o validador
        if (this.config.VALIDATE_ON_LOAD) {
            this.initOnLoad();
        }
    }
    
    /**
     * Inicializa o validador quando a página estiver carregada
     */
    initOnLoad() {
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }
    
    /**
     * Inicializa o validador
     */
    init() {
        LanguageLogger.info('Iniciando validador de idiomas');
        
        // Verificar se estamos em modo de desenvolvimento
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('.local');
        
        // Validar a página
        this.validate();
        
        // Mostrar relatório
        this.showReport();
        
        // Corrigir automaticamente se configurado
        if (this.config.AUTO_FIX) {
            this.fixAll();
        }
        
        // Mostrar UI se configurado e em modo de desenvolvimento
        if (this.config.SHOW_UI && isDev) {
            this.createUI();
        }
    }
    
    /**
     * Valida a página em busca de problemas de idioma
     */
    validate() {
        LanguageLogger.info('Validando página...');
        
        // Coletar estatísticas
        this.collectStats();
        
        // Verificar pares de idioma ausentes
        this.checkMissingPairs();
        
        // Verificar classes inconsistentes
        this.checkInconsistentClasses();
        
        // Verificar atributos data-i18n
        this.checkI18nAttributes();
        
        // Verificar markup inválido
        this.checkInvalidMarkup();
        
        LanguageLogger.info('Validação concluída.');
    }
    
    /**
     * Coleta estatísticas gerais sobre a página
     */
    collectStats() {
        this.stats.totalElements = document.querySelectorAll('*').length;
        this.stats.withLangEn = document.querySelectorAll('.lang-en').length;
        this.stats.withLangPt = document.querySelectorAll('.lang-pt').length;
        this.stats.withBoth = Array.from(document.querySelectorAll('*')).filter(
            el => el.classList.contains('lang-en') && el.classList.contains('lang-pt')
        ).length;
        this.stats.withI18n = document.querySelectorAll('[data-i18n]').length;
        
        LanguageLogger.debug('Estatísticas coletadas', this.stats);
    }
    
    /**
     * Verifica pares de idioma ausentes
     */
    checkMissingPairs() {
        // Verificar elementos .lang-en sem correspondente .lang-pt
        const enElements = document.querySelectorAll('.lang-en:not(.lang-pt)');
        
        enElements.forEach(element => {
            // Verificar se há um irmão com .lang-pt
            const parent = element.parentNode;
            const ptSibling = Array.from(parent.children).find(child => 
                child !== element && 
                child.classList.contains('lang-pt') && 
                !child.classList.contains('lang-en') &&
                child.tagName === element.tagName
            );
            
            if (!ptSibling) {
                this.issues.missingPairs.push({
                    element,
                    language: 'pt',
                    path: this.getElementPath(element),
                    text: element.textContent.trim()
                });
            }
        });
        
        // Verificar elementos .lang-pt sem correspondente .lang-en
        const ptElements = document.querySelectorAll('.lang-pt:not(.lang-en)');
        
        ptElements.forEach(element => {
            // Verificar se há um irmão com .lang-en
            const parent = element.parentNode;
            const enSibling = Array.from(parent.children).find(child => 
                child !== element && 
                child.classList.contains('lang-en') && 
                !child.classList.contains('lang-pt') &&
                child.tagName === element.tagName
            );
            
            if (!enSibling) {
                this.issues.missingPairs.push({
                    element,
                    language: 'en',
                    path: this.getElementPath(element),
                    text: element.textContent.trim()
                });
            }
        });
        
        LanguageLogger.debug(`Encontrados ${this.issues.missingPairs.length} pares de idioma ausentes`);
    }
    
    /**
     * Verifica classes inconsistentes
     */
    checkInconsistentClasses() {
        // Verificar elementos com ambas as classes
        const elementsWithBoth = Array.from(document.querySelectorAll('*')).filter(
            el => el.classList.contains('lang-en') && el.classList.contains('lang-pt')
        );
        
        elementsWithBoth.forEach(element => {
            this.issues.mixedClasses.push({
                element,
                path: this.getElementPath(element),
                text: element.textContent.trim()
            });
        });
        
        LanguageLogger.debug(`Encontrados ${this.issues.mixedClasses.length} elementos com classes inconsistentes`);
    }
    
    /**
     * Verifica atributos data-i18n
     */
    checkI18nAttributes() {
        // Verificar elementos com data-i18n
        const elementsWithI18n = document.querySelectorAll('[data-i18n]');
        
        elementsWithI18n.forEach(element => {
            // Verificar se o valor do atributo existe nas traduções
            const key = element.getAttribute('data-i18n');
            
            // Verificar se o elemento contém filhos com classes de idioma
            const hasEnChild = element.querySelector('.lang-en');
            const hasPtChild = element.querySelector('.lang-pt');
            
            if (hasEnChild || hasPtChild) {
                this.issues.inconsistentAttributes.push({
                    element,
                    type: 'redundant',
                    path: this.getElementPath(element),
                    key,
                    text: element.textContent.trim()
                });
            }
        });
        
        LanguageLogger.debug(`Encontrados ${this.issues.inconsistentAttributes.length} atributos data-i18n inconsistentes`);
    }
    
    /**
     * Verifica markup inválido
     */
    checkInvalidMarkup() {
        // Verificar elementos .lang-en e .lang-pt sem pai comum
        const langElements = document.querySelectorAll('.lang-en, .lang-pt');
        const processedParents = new Set();
        
        langElements.forEach(element => {
            const parent = element.parentNode;
            
            // Se já processamos este pai, pular
            if (processedParents.has(parent)) return;
            
            // Adicionar pai ao conjunto de processados
            processedParents.add(parent);
            
            // Contar filhos com cada classe de idioma
            const enChildren = Array.from(parent.children).filter(
                child => child.classList.contains('lang-en') && !child.classList.contains('lang-pt')
            );
            
            const ptChildren = Array.from(parent.children).filter(
                child => child.classList.contains('lang-pt') && !child.classList.contains('lang-en')
            );
            
            // Verificar se há mais de um elemento para cada idioma
            if (enChildren.length > 1 || ptChildren.length > 1) {
                this.issues.invalidMarkup.push({
                    element: parent,
                    path: this.getElementPath(parent),
                    enCount: enChildren.length,
                    ptCount: ptChildren.length
                });
            }
        });
        
        LanguageLogger.debug(`Encontrados ${this.issues.invalidMarkup.length} elementos com markup inválido`);
    }
    
    /**
     * Corrige todos os problemas encontrados
     */
    fixAll() {
        LanguageLogger.info('Corrigindo problemas...');
        
        // Corrigir classes inconsistentes
        this.fixInconsistentClasses();
        
        // Corrigir pares ausentes
        this.fixMissingPairs();
        
        // Corrigir markup inválido
        this.fixInvalidMarkup();
        
        LanguageLogger.success(`Correção concluída. ${this.stats.issuesFixed} problemas corrigidos.`);
    }
    
    /**
     * Corrige classes inconsistentes
     */
    fixInconsistentClasses() {
        this.issues.mixedClasses.forEach(issue => {
            const { element } = issue;
            
            try {
                // Criar dois elementos separados
                const enElement = element.cloneNode(true);
                enElement.classList.remove('lang-pt');
                
                const ptElement = element.cloneNode(true);
                ptElement.classList.remove('lang-en');
                
                // Substituir o elemento original
                const parent = element.parentNode;
                parent.insertBefore(enElement, element);
                parent.insertBefore(ptElement, element);
                
                // Remover o elemento original
                element.remove();
                
                this.stats.issuesFixed++;
                LanguageLogger.debug('Corrigido elemento com classes inconsistentes', issue.path);
            } catch (error) {
                LanguageLogger.error('Erro ao corrigir classes inconsistentes', error);
            }
        });
    }
    
    /**
     * Corrige pares ausentes
     */
    fixMissingPairs() {
        this.issues.missingPairs.forEach(issue => {
            const { element, language } = issue;
            
            try {
                const parent = element.parentNode;
                
                // Criar o elemento correspondente
                const newElement = element.cloneNode(true);
                
                if (language === 'en') {
                    // Adicionar classe lang-en e remover lang-pt
                    newElement.classList.remove('lang-pt');
                    newElement.classList.add('lang-en');
                } else {
                    // Adicionar classe lang-pt e remover lang-en
                    newElement.classList.remove('lang-en');
                    newElement.classList.add('lang-pt');
                }
                
                // Inserir o novo elemento
                if (language === 'en') {
                    // Inserir antes do elemento em português
                    parent.insertBefore(newElement, element);
                } else {
                    // Inserir depois do elemento em inglês
                    if (element.nextSibling) {
                        parent.insertBefore(newElement, element.nextSibling);
                    } else {
                        parent.appendChild(newElement);
                    }
                }
                
                this.stats.issuesFixed++;
                LanguageLogger.debug(`Adicionado elemento ${language} ausente`, issue.path);
            } catch (error) {
                LanguageLogger.error('Erro ao adicionar par ausente', error);
            }
        });
    }
    
    /**
     * Corrige markup inválido
     */
    fixInvalidMarkup() {
        this.issues.invalidMarkup.forEach(issue => {
            const { element } = issue;
            
            try {
                // Verificar filhos com cada classe de idioma
                const enChildren = Array.from(element.children).filter(
                    child => child.classList.contains('lang-en') && !child.classList.contains('lang-pt')
                );
                
                const ptChildren = Array.from(element.children).filter(
                    child => child.classList.contains('lang-pt') && !child.classList.contains('lang-en')
                );
                
                // Manter apenas o primeiro elemento de cada idioma
                if (enChildren.length > 1) {
                    for (let i = 1; i < enChildren.length; i++) {
                        enChildren[i].remove();
                    }
                }
                
                if (ptChildren.length > 1) {
                    for (let i = 1; i < ptChildren.length; i++) {
                        ptChildren[i].remove();
                    }
                }
                
                this.stats.issuesFixed++;
                LanguageLogger.debug('Corrigido markup inválido', issue.path);
            } catch (error) {
                LanguageLogger.error('Erro ao corrigir markup inválido', error);
            }
        });
    }
    
    /**
     * Cria uma UI para o validador
     */
    createUI() {
        // Verificar se já existe
        if (document.getElementById('language-validator-ui')) return;
        
        // Criar o elemento da UI
        const ui = document.createElement('div');
        ui.id = 'language-validator-ui';
        ui.className = 'language-validator-ui';
        ui.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            width: 300px;
            max-height: 400px;
            overflow: auto;
        `;
        
        // Adicionar conteúdo
        ui.innerHTML = `
            <h3 style="margin: 0 0 10px; color: #00ffff;">Language Validator</h3>
            <div class="stats">
                <p><strong>Elements:</strong> ${this.stats.totalElements}</p>
                <p><strong>EN:</strong> ${this.stats.withLangEn} | <strong>PT:</strong> ${this.stats.withLangPt}</p>
                <p><strong>Issues:</strong> ${
                    this.issues.missingPairs.length + 
                    this.issues.inconsistentAttributes.length + 
                    this.issues.mixedClasses.length + 
                    this.issues.invalidMarkup.length
                }</p>
            </div>
            <div class="actions" style="margin-top: 10px;">
                <button id="fix-language-issues" style="background: #00ffff; color: black; border: none; padding: 5px 10px; cursor: pointer; margin-right: 5px;">Fix Issues</button>
                <button id="toggle-validator-details" style="background: #333; color: white; border: none; padding: 5px 10px; cursor: pointer;">Details</button>
                <button id="close-validator" style="background: #ff3333; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-left: 5px;">Close</button>
            </div>
            <div id="validator-details" style="margin-top: 10px; display: none;">
                <h4 style="margin: 5px 0; color: #ffcc00;">Issues:</h4>
                <ul style="padding-left: 20px; margin: 5px 0;">
                    <li>Missing pairs: ${this.issues.missingPairs.length}</li>
                    <li>Mixed classes: ${this.issues.mixedClasses.length}</li>
                    <li>Inconsistent attrs: ${this.issues.inconsistentAttributes.length}</li>
                    <li>Invalid markup: ${this.issues.invalidMarkup.length}</li>
                </ul>
            </div>
        `;
        
        // Adicionar ao corpo
        document.body.appendChild(ui);
        
        // Adicionar eventos
        document.getElementById('fix-language-issues').addEventListener('click', () => {
            this.fixAll();
            this.updateUI();
        });
        
        document.getElementById('toggle-validator-details').addEventListener('click', () => {
            const details = document.getElementById('validator-details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('close-validator').addEventListener('click', () => {
            ui.remove();
        });
    }
    
    /**
     * Atualiza a UI do validador
     */
    updateUI() {
        const ui = document.getElementById('language-validator-ui');
        if (!ui) return;
        
        const stats = ui.querySelector('.stats');
        stats.innerHTML = `
            <p><strong>Elements:</strong> ${this.stats.totalElements}</p>
            <p><strong>EN:</strong> ${this.stats.withLangEn} | <strong>PT:</strong> ${this.stats.withLangPt}</p>
            <p><strong>Issues:</strong> ${
                this.issues.missingPairs.length + 
                this.issues.inconsistentAttributes.length + 
                this.issues.mixedClasses.length + 
                this.issues.invalidMarkup.length
            }</p>
            <p><strong>Fixed:</strong> ${this.stats.issuesFixed}</p>
        `;
        
        const details = document.getElementById('validator-details');
        details.innerHTML = `
            <h4 style="margin: 5px 0; color: #ffcc00;">Issues:</h4>
            <ul style="padding-left: 20px; margin: 5px 0;">
                <li>Missing pairs: ${this.issues.missingPairs.length}</li>
                <li>Mixed classes: ${this.issues.mixedClasses.length}</li>
                <li>Inconsistent attrs: ${this.issues.inconsistentAttributes.length}</li>
                <li>Invalid markup: ${this.issues.invalidMarkup.length}</li>
            </ul>
        `;
    }
    
    /**
     * Exibe um relatório no console
     */
    showReport() {
        const totalIssues = 
            this.issues.missingPairs.length + 
            this.issues.inconsistentAttributes.length + 
            this.issues.mixedClasses.length + 
            this.issues.invalidMarkup.length;
        
        LanguageLogger.info('=== Relatório de Validação de Idiomas ===');
        LanguageLogger.info(`Total de elementos: ${this.stats.totalElements}`);
        LanguageLogger.info(`Elementos EN: ${this.stats.withLangEn} | Elementos PT: ${this.stats.withLangPt}`);
        LanguageLogger.info(`Elementos com ambas as classes: ${this.stats.withBoth}`);
        LanguageLogger.info(`Elementos com data-i18n: ${this.stats.withI18n}`);
        LanguageLogger.info(`Total de problemas: ${totalIssues}`);
        
        if (totalIssues > 0) {
            LanguageLogger.warn('Problemas encontrados:');
            LanguageLogger.warn(`- Pares ausentes: ${this.issues.missingPairs.length}`);
            LanguageLogger.warn(`- Classes inconsistentes: ${this.issues.mixedClasses.length}`);
            LanguageLogger.warn(`- Atributos inconsistentes: ${this.issues.inconsistentAttributes.length}`);
            LanguageLogger.warn(`- Markup inválido: ${this.issues.invalidMarkup.length}`);
        } else {
            LanguageLogger.success('Nenhum problema encontrado!');
        }
    }
    
    /**
     * Obtém o caminho de um elemento no DOM
     * @param {HTMLElement} element - Elemento para obter o caminho
     * @returns {string} Caminho do elemento
     */
    getElementPath(element) {
        if (!element) return '';
        
        let path = [];
        let current = element;
        
        while (current && current !== document.body && current !== document.documentElement) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                selector += `#${current.id}`;
            } else if (current.className) {
                const classes = Array.from(current.classList)
                    .filter(cls => !cls.startsWith('lang-'))
                    .join('.');
                    
                if (classes) {
                    selector += `.${classes}`;
                }
            }
            
            path.unshift(selector);
            current = current.parentNode;
        }
        
        return path.join(' > ');
    }
}

// Exportar para uso global
window.LanguageValidator = LanguageValidator;

// Inicializar o validador se configurado para auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (LANGUAGE_VALIDATOR_CONFIG.VALIDATE_ON_LOAD) {
        const validator = new LanguageValidator();
        validator.init();
    }
    
    // Adicionar ao objeto window
    window.languageValidator = new LanguageValidator();
    
    console.log('🔍 RUNES Analytics Pro - Validador de Idiomas carregado!');
}); 
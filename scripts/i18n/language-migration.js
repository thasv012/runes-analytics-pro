/**
 * RUNES Analytics Pro - Migração de Idiomas
 * 
 * Este script ajuda a migrar páginas existentes para o novo padrão de internacionalização.
 * Ferramenta para desenvolvedores e administradores (não deve ser carregada em produção).
 */

/**
 * Configurações de migração
 */
const LANGUAGE_MIGRATION_CONFIG = {
    // Idiomas suportados
    SUPPORTED_LANGUAGES: ['en', 'pt'],
    
    // Seletores para encontrar elementos que precisam ser migrados
    SELECTORS: [
        // Seletores específicos do site que precisam ser migrados
        '.header-text', 
        '.footer-text', 
        '.nav-item-text',
        '.hero-title', 
        '.hero-subtitle',
        '.section-title',
        '.feature-title',
        '.feature-description',
        '.cta-button',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p:not(.migrated)',
        'button:not(.migrated)',
        'a:not(.migrated, .language-option)'
    ],
    
    // Elementos a serem ignorados
    IGNORE_SELECTORS: [
        '.language-selector',
        '.code-block',
        'code',
        'pre',
        'script',
        'style',
        '[data-i18n]',
        '.lang-en',
        '.lang-pt',
        '.no-translate'
    ],
    
    // Atributos a serem migrados
    ATTRIBUTES_TO_MIGRATE: [
        'placeholder',
        'title',
        'alt'
    ],
    
    // Prefixo para as chaves de tradução
    KEY_PREFIX: '',
    
    // Log detalhado
    VERBOSE: true
};

/**
 * Verifica se um elemento deve ser ignorado
 * @param {HTMLElement} element - Elemento a ser verificado
 * @returns {boolean} - Verdadeiro se o elemento deve ser ignorado
 */
function shouldIgnoreElement(element) {
    // Verificar seletores de ignorar
    for (const selector of LANGUAGE_MIGRATION_CONFIG.IGNORE_SELECTORS) {
        if (element.matches(selector)) {
            return true;
        }
    }
    
    // Verificar elementos pais
    let parent = element.parentElement;
    while (parent) {
        for (const selector of LANGUAGE_MIGRATION_CONFIG.IGNORE_SELECTORS) {
            if (parent.matches(selector)) {
                return true;
            }
        }
        parent = parent.parentElement;
    }
    
    // Verificar se o elemento já foi migrado
    if (element.classList.contains('migrated')) {
        return true;
    }
    
    // Verificar se o elemento está vazio
    if (!element.textContent.trim()) {
        return true;
    }
    
    return false;
}

/**
 * Cria uma chave de tradução para o elemento
 * @param {HTMLElement} element - Elemento para criar a chave
 * @returns {string} - Chave de tradução
 */
function createTranslationKey(element) {
    // Usar o atributo id se disponível
    if (element.id) {
        return element.id.toLowerCase();
    }
    
    // Usar uma combinação de tag e texto
    const tag = element.tagName.toLowerCase();
    const text = element.textContent.trim();
    
    // Limitar o tamanho do texto
    const maxLength = 30;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;
    
    // Criar uma chave baseada no texto
    const baseKey = truncatedText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');
        
    // Adicionar prefixo se configurado
    const prefix = LANGUAGE_MIGRATION_CONFIG.KEY_PREFIX;
    return prefix ? `${prefix}.${baseKey}` : baseKey;
}

/**
 * Gera um ID único para o elemento
 * @returns {string} - ID único
 */
function generateUniqueId() {
    return 'i18n_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Migra atributos de um elemento
 * @param {HTMLElement} element - Elemento a ser migrado
 * @param {Object} translations - Objeto para armazenar traduções
 * @returns {number} - Número de atributos migrados
 */
function migrateAttributes(element, translations) {
    let migratedCount = 0;
    
    // Iterar pelos atributos a serem migrados
    for (const attrName of LANGUAGE_MIGRATION_CONFIG.ATTRIBUTES_TO_MIGRATE) {
        if (element.hasAttribute(attrName)) {
            const value = element.getAttribute(attrName);
            
            // Pular se vazio
            if (!value.trim()) continue;
            
            // Criar chave para o atributo
            const baseKey = createTranslationKey(element);
            const attrKey = `${baseKey}_${attrName}`;
            
            // Adicionar à tradução
            translations.en[attrKey] = value;
            translations.pt[attrKey] = value; // Valor padrão, para ser traduzido posteriormente
            
            // Adicionar atributo data-i18n-attr
            element.setAttribute(`data-i18n-${attrName}`, attrKey);
            
            migratedCount++;
        }
    }
    
    return migratedCount;
}

/**
 * Migra um único elemento
 * @param {HTMLElement} element - Elemento a ser migrado
 * @param {Object} translations - Objeto para armazenar traduções
 * @returns {Object} - Resultado da migração
 */
function migrateElement(element, translations) {
    // Verificar se o elemento deve ser ignorado
    if (shouldIgnoreElement(element)) {
        return { migrated: false, reason: 'ignored' };
    }
    
    // Obter texto do elemento
    const originalText = element.textContent.trim();
    
    // Pular elementos vazios
    if (!originalText) {
        return { migrated: false, reason: 'empty' };
    }
    
    // Gerar chave de tradução
    const translationKey = createTranslationKey(element);
    
    // Adicionar um ID ao elemento se não tiver
    if (!element.id) {
        element.id = generateUniqueId();
    }
    
    // Criar elementos para idiomas específicos
    const enElement = document.createElement(element.tagName);
    enElement.textContent = originalText;
    enElement.className = 'lang-en';
    
    const ptElement = document.createElement(element.tagName);
    ptElement.textContent = originalText; // Mesmo texto, para ser traduzido posteriormente
    ptElement.className = 'lang-pt';
    
    // Limpar conteúdo atual
    element.textContent = '';
    
    // Adicionar elementos de idioma
    element.appendChild(enElement);
    element.appendChild(ptElement);
    
    // Adicionar atributo data-i18n
    element.setAttribute('data-i18n', translationKey);
    
    // Marcar como migrado
    element.classList.add('migrated');
    
    // Adicionar à lista de traduções
    translations.en[translationKey] = originalText;
    translations.pt[translationKey] = originalText; // Valor padrão, para ser traduzido posteriormente
    
    // Migrar atributos
    const attributesMigrated = migrateAttributes(element, translations);
    
    return { 
        migrated: true, 
        key: translationKey, 
        text: originalText,
        attributesMigrated
    };
}

/**
 * Migra todos os elementos na página
 * @returns {Object} - Resultado da migração
 */
function migrateAllElements() {
    // Inicializar traduções
    const translations = {
        en: {},
        pt: {}
    };
    
    const results = {
        total: 0,
        migrated: 0,
        ignored: 0,
        attributes: 0
    };
    
    // Concatenar todos os seletores em um único seletor
    const combinedSelector = LANGUAGE_MIGRATION_CONFIG.SELECTORS.join(', ');
    
    // Selecionar todos os elementos que correspondem aos seletores
    const elements = document.querySelectorAll(combinedSelector);
    results.total = elements.length;
    
    // Processar cada elemento
    elements.forEach(element => {
        const result = migrateElement(element, translations);
        
        if (result.migrated) {
            results.migrated++;
            if (result.attributesMigrated) {
                results.attributes += result.attributesMigrated;
            }
            
            if (LANGUAGE_MIGRATION_CONFIG.VERBOSE) {
                console.log(`✅ Migrado: ${result.key} - "${result.text.substr(0, 30)}${result.text.length > 30 ? '...' : ''}"`);
            }
        } else {
            results.ignored++;
            
            if (LANGUAGE_MIGRATION_CONFIG.VERBOSE) {
                console.log(`⏭️ Ignorado: ${result.reason} - ${element.tagName.toLowerCase()}`);
            }
        }
    });
    
    return {
        results,
        translations
    };
}

/**
 * Exporta as traduções geradas
 * @param {Object} translations - Traduções a serem exportadas
 */
function exportTranslations(translations) {
    // Criar blocos de código para as traduções
    const enJson = JSON.stringify(translations.en, null, 2);
    const ptJson = JSON.stringify(translations.pt, null, 2);
    
    // Criar elementos para exibir as traduções
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: monospace;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #0a0a15;
        border: 1px solid #00ffff;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        overflow: auto;
        padding: 20px;
        border-radius: 5px;
        position: relative;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Exported Translations';
    title.style.color = '#00ffff';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff3333;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
    `;
    closeButton.onclick = () => modal.remove();
    
    const tabs = document.createElement('div');
    tabs.style.cssText = `
        display: flex;
        margin-bottom: 10px;
        border-bottom: 1px solid #333;
    `;
    
    const enTab = document.createElement('button');
    enTab.textContent = 'English';
    enTab.style.cssText = `
        background: #00ffff;
        color: black;
        border: none;
        padding: 8px 15px;
        margin-right: 5px;
        cursor: pointer;
    `;
    
    const ptTab = document.createElement('button');
    ptTab.textContent = 'Português';
    ptTab.style.cssText = `
        background: #333;
        color: white;
        border: none;
        padding: 8px 15px;
        cursor: pointer;
    `;
    
    const enContent = document.createElement('pre');
    enContent.style.cssText = `
        background: #111;
        padding: 10px;
        overflow: auto;
        color: #ddd;
        max-height: 50vh;
    `;
    enContent.textContent = enJson;
    
    const ptContent = document.createElement('pre');
    ptContent.style.cssText = `
        background: #111;
        padding: 10px;
        overflow: auto;
        color: #ddd;
        max-height: 50vh;
        display: none;
    `;
    ptContent.textContent = ptJson;
    
    // Funções para alternar entre as tabs
    enTab.onclick = () => {
        enTab.style.background = '#00ffff';
        enTab.style.color = 'black';
        ptTab.style.background = '#333';
        ptTab.style.color = 'white';
        enContent.style.display = 'block';
        ptContent.style.display = 'none';
    };
    
    ptTab.onclick = () => {
        ptTab.style.background = '#00ffff';
        ptTab.style.color = 'black';
        enTab.style.background = '#333';
        enTab.style.color = 'white';
        ptContent.style.display = 'block';
        enContent.style.display = 'none';
    };
    
    const copyButtons = document.createElement('div');
    copyButtons.style.cssText = `
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
    `;
    
    const copyEnButton = document.createElement('button');
    copyEnButton.textContent = 'Copy EN';
    copyEnButton.style.cssText = `
        background: #333;
        color: white;
        border: none;
        padding: 5px 10px;
        margin-right: 5px;
        cursor: pointer;
    `;
    copyEnButton.onclick = () => {
        navigator.clipboard.writeText(enJson);
        copyEnButton.textContent = 'Copied!';
        setTimeout(() => {
            copyEnButton.textContent = 'Copy EN';
        }, 2000);
    };
    
    const copyPtButton = document.createElement('button');
    copyPtButton.textContent = 'Copy PT';
    copyPtButton.style.cssText = `
        background: #333;
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
    `;
    copyPtButton.onclick = () => {
        navigator.clipboard.writeText(ptJson);
        copyPtButton.textContent = 'Copied!';
        setTimeout(() => {
            copyPtButton.textContent = 'Copy PT';
        }, 2000);
    };
    
    // Montar o modal
    copyButtons.appendChild(copyEnButton);
    copyButtons.appendChild(copyPtButton);
    
    tabs.appendChild(enTab);
    tabs.appendChild(ptTab);
    
    content.appendChild(title);
    content.appendChild(closeButton);
    content.appendChild(tabs);
    content.appendChild(enContent);
    content.appendChild(ptContent);
    content.appendChild(copyButtons);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * Cria a interface de usuário para a migração
 */
function createMigrationUI() {
    // Verificar se a UI já existe
    if (document.getElementById('migration-tool')) {
        return;
    }
    
    // Criar o container
    const container = document.createElement('div');
    container.id = 'migration-tool';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        z-index: 9998;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    `;
    
    // Criar o conteúdo
    container.innerHTML = `
        <h3 style="margin: 0 0 10px; color: #00ffff;">i18n Migration Tool</h3>
        <p>Use this tool to migrate content to the i18n system.</p>
        <div style="display: flex; margin-top: 15px;">
            <button id="start-migration" style="background: #00ffff; color: black; border: none; padding: 8px 15px; cursor: pointer; margin-right: 10px;">Start Migration</button>
            <button id="close-migration-tool" style="background: #ff3333; color: white; border: none; padding: 8px 15px; cursor: pointer;">Close</button>
        </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(container);
    
    // Adicionar eventos
    document.getElementById('start-migration').addEventListener('click', () => {
        // Confirmar antes de iniciar
        if (confirm('This will modify the DOM structure of the page. Continue?')) {
            // Realizar a migração
            const { results, translations } = migrateAllElements();
            
            // Atualizar a UI
            container.innerHTML = `
                <h3 style="margin: 0 0 10px; color: #00ffff;">Migration Complete</h3>
                <p>Total elements: ${results.total}</p>
                <p>Migrated: ${results.migrated}</p>
                <p>Ignored: ${results.ignored}</p>
                <p>Attributes: ${results.attributes}</p>
                <div style="display: flex; margin-top: 15px;">
                    <button id="export-translations" style="background: #00ffff; color: black; border: none; padding: 8px 15px; cursor: pointer; margin-right: 10px;">Export Translations</button>
                    <button id="close-migration-tool" style="background: #ff3333; color: white; border: none; padding: 8px 15px; cursor: pointer;">Close</button>
                </div>
            `;
            
            // Adicionar evento para exportar
            document.getElementById('export-translations').addEventListener('click', () => {
                exportTranslations(translations);
            });
            
            // Adicionar evento para fechar
            document.getElementById('close-migration-tool').addEventListener('click', () => {
                container.remove();
            });
            
            console.log('✅ Migration complete!', results);
        }
    });
    
    // Adicionar evento para fechar
    document.getElementById('close-migration-tool').addEventListener('click', () => {
        container.remove();
    });
}

// Iniciar a ferramenta quando a página estiver carregada
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos em modo de desenvolvimento
    const isDev = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname.includes('.local');
    
    // Apenas mostrar em modo de desenvolvimento
    if (isDev) {
        // Adicionar atalho de teclado para mostrar a ferramenta (Ctrl+Shift+I)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'I') {
                createMigrationUI();
            }
        });
        
        console.log('🔄 RUNES Analytics Pro - Ferramenta de Migração de Idiomas carregada!');
        console.log('Use Ctrl+Shift+I para abrir a ferramenta.');
    }
}); 
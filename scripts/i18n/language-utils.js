/**
 * RUNES Analytics Pro - Utilitários de Idioma
 * 
 * Utilitários para verificar e corrigir elementos de idioma nas páginas HTML
 */

/**
 * Verifica se todas as classes de idioma estão corretas na página
 * @returns {Object} Objeto com resultados da verificação
 */
function verifyLanguageClasses() {
    const results = {
        missing: {
            en: [],
            pt: []
        },
        mismatched: [],
        total: {
            elements: 0,
            withLangEn: 0,
            withLangPt: 0,
            withBoth: 0,
            withNone: 0
        }
    };
    
    // Elementos com classes de idioma
    const elementsWithLangClasses = document.querySelectorAll('.lang-en, .lang-pt');
    
    // Elementos com classes de idioma específicas
    const elementsWithEnClass = document.querySelectorAll('.lang-en');
    const elementsWithPtClass = document.querySelectorAll('.lang-pt');
    
    // Contadores
    results.total.elements = elementsWithLangClasses.length;
    results.total.withLangEn = elementsWithEnClass.length;
    results.total.withLangPt = elementsWithPtClass.length;
    
    // Verificar elementos com apenas uma classe de idioma
    elementsWithEnClass.forEach(element => {
        // Verificar se o elemento possui um par correspondente em português
        const parent = element.parentNode;
        const sibling = Array.from(parent.children).find(child => 
            child !== element && child.classList.contains('lang-pt') && 
            child.tagName === element.tagName
        );
        
        if (!sibling) {
            results.missing.pt.push({
                element: element,
                path: getElementPath(element),
                text: element.textContent.trim()
            });
        }
    });
    
    elementsWithPtClass.forEach(element => {
        // Verificar se o elemento possui um par correspondente em inglês
        const parent = element.parentNode;
        const sibling = Array.from(parent.children).find(child => 
            child !== element && child.classList.contains('lang-en') && 
            child.tagName === element.tagName
        );
        
        if (!sibling) {
            results.missing.en.push({
                element: element,
                path: getElementPath(element),
                text: element.textContent.trim()
            });
        }
    });
    
    // Contar elementos com ambas as classes
    const elementsWithBothClasses = Array.from(document.querySelectorAll('*')).filter(
        el => el.classList.contains('lang-en') && el.classList.contains('lang-pt')
    );
    
    results.total.withBoth = elementsWithBothClasses.length;
    
    if (elementsWithBothClasses.length > 0) {
        results.mismatched = elementsWithBothClasses.map(element => ({
            element: element,
            path: getElementPath(element),
            text: element.textContent.trim()
        }));
    }
    
    // Elementos que deveriam ter classes de idioma mas não têm
    results.total.withNone = results.total.elements - results.total.withLangEn - results.total.withLangPt + results.total.withBoth;
    
    return results;
}

/**
 * Obtém o caminho de um elemento no DOM
 * @param {HTMLElement} element - O elemento para obter o caminho
 * @returns {string} O caminho do elemento
 */
function getElementPath(element) {
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
        
        // Adicionar posição se for útil
        const siblings = current.parentNode ? Array.from(current.parentNode.children).filter(
            child => child.tagName === current.tagName
        ) : [];
        
        if (siblings.length > 1) {
            const index = siblings.indexOf(current);
            selector += `:nth-of-type(${index + 1})`;
        }
        
        path.unshift(selector);
        current = current.parentNode;
    }
    
    return path.join(' > ');
}

/**
 * Corrige elementos de idioma ausentes na página
 * @param {boolean} [fixMissing=true] - Se deve corrigir elementos ausentes
 * @param {boolean} [fixMismatched=true] - Se deve corrigir elementos com ambas as classes
 * @returns {Object} Objeto com resultados da correção
 */
function fixLanguageElements(fixMissing = true, fixMismatched = true) {
    const results = verifyLanguageClasses();
    const corrections = {
        added: {
            en: [],
            pt: []
        },
        fixed: [],
        total: 0
    };
    
    if (fixMissing) {
        // Corrigir elementos sem par em inglês
        results.missing.en.forEach(item => {
            const { element, path } = item;
            const parent = element.parentNode;
            
            // Criar um elemento em inglês correspondente
            const enElement = element.cloneNode(true);
            enElement.classList.remove('lang-pt');
            enElement.classList.add('lang-en');
            enElement.textContent = element.textContent; // Manter o mesmo texto para ser traduzido depois
            
            // Inserir antes do elemento em português
            parent.insertBefore(enElement, element);
            
            corrections.added.en.push({
                path,
                original: element.textContent.trim()
            });
            
            corrections.total++;
        });
        
        // Corrigir elementos sem par em português
        results.missing.pt.forEach(item => {
            const { element, path } = item;
            const parent = element.parentNode;
            
            // Criar um elemento em português correspondente
            const ptElement = element.cloneNode(true);
            ptElement.classList.remove('lang-en');
            ptElement.classList.add('lang-pt');
            ptElement.textContent = element.textContent; // Manter o mesmo texto para ser traduzido depois
            
            // Inserir depois do elemento em inglês
            if (element.nextSibling) {
                parent.insertBefore(ptElement, element.nextSibling);
            } else {
                parent.appendChild(ptElement);
            }
            
            corrections.added.pt.push({
                path,
                original: element.textContent.trim()
            });
            
            corrections.total++;
        });
    }
    
    if (fixMismatched) {
        // Corrigir elementos com ambas as classes
        results.mismatched.forEach(item => {
            const { element, path } = item;
            
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
            
            corrections.fixed.push({
                path,
                text: element.textContent.trim()
            });
            
            corrections.total++;
        });
    }
    
    return corrections;
}

/**
 * Adiciona atributos data-i18n aos elementos
 * @param {string} prefix - Prefixo para as chaves de tradução (opcional)
 * @returns {Object} Resultado da operação
 */
function addI18nAttributes(prefix = '') {
    const result = {
        added: 0,
        updated: 0,
        elements: []
    };
    
    // Encontrar pares de elementos de idioma
    const enElements = document.querySelectorAll('.lang-en');
    
    enElements.forEach(enElement => {
        const parent = enElement.parentNode;
        
        // Buscar o elemento correspondente em português
        const ptElement = Array.from(parent.children).find(
            child => child !== enElement && child.classList.contains('lang-pt')
        );
        
        if (ptElement) {
            // Criar um ID baseado no conteúdo do elemento
            const content = enElement.textContent.trim();
            const key = createI18nKey(content, prefix);
            
            // Verificar se o elemento pai já tem um atributo data-i18n
            const parentHasI18n = parent.hasAttribute('data-i18n');
            
            if (parentHasI18n) {
                // Atualizar o atributo data-i18n do elemento pai
                parent.setAttribute('data-i18n', key);
                result.updated++;
            } else {
                // Adicionar o atributo data-i18n ao elemento pai
                parent.setAttribute('data-i18n', key);
                result.added++;
            }
            
            result.elements.push({
                element: parent,
                key,
                en: enElement.textContent.trim(),
                pt: ptElement.textContent.trim()
            });
        }
    });
    
    return result;
}

/**
 * Cria uma chave de tradução a partir de um texto
 * @param {string} text - O texto para converter em chave
 * @param {string} prefix - Prefixo opcional para a chave
 * @returns {string} A chave formatada
 */
function createI18nKey(text, prefix = '') {
    const key = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);
    
    return prefix ? `${prefix}.${key}` : key;
}

/**
 * Gera um relatório de elementos de idioma na página
 * @returns {Object} Objeto com o relatório
 */
function generateLanguageReport() {
    const results = verifyLanguageClasses();
    
    const report = {
        summary: {
            totalElements: results.total.elements,
            enOnly: results.total.withLangEn - results.total.withBoth,
            ptOnly: results.total.withLangPt - results.total.withBoth,
            withBoth: results.total.withBoth,
            missingPairs: results.missing.en.length + results.missing.pt.length
        },
        issues: {
            missingEnglish: results.missing.en,
            missingPortuguese: results.missing.pt,
            mismatchedClasses: results.mismatched
        }
    };
    
    // Adicionar detalhes sobre os elementos com data-i18n
    const elementsWithI18n = document.querySelectorAll('[data-i18n]');
    report.i18n = {
        total: elementsWithI18n.length,
        elements: Array.from(elementsWithI18n).map(element => ({
            path: getElementPath(element),
            key: element.getAttribute('data-i18n'),
            text: element.textContent.trim()
        }))
    };
    
    return report;
}

/**
 * Atualiza a visibilidade dos elementos de idioma com base no idioma selecionado
 * @param {string} language - O idioma selecionado ('en' ou 'pt')
 */
function updateLanguageVisibility(language) {
    // Esconder todos os elementos de idioma
    document.querySelectorAll('.lang-en, .lang-pt').forEach(element => {
        element.style.display = 'none';
    });
    
    // Mostrar apenas os elementos do idioma selecionado
    document.querySelectorAll(`.lang-${language}`).forEach(element => {
        element.style.display = '';
    });
    
    console.log(`🌐 Visibilidade de idioma atualizada para: ${language}`);
}

// Expor funções para uso global
window.verifyLanguageClasses = verifyLanguageClasses;
window.fixLanguageElements = fixLanguageElements;
window.addI18nAttributes = addI18nAttributes;
window.generateLanguageReport = generateLanguageReport;
window.updateLanguageVisibility = updateLanguageVisibility;

// Auto-executar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Utilitários de idioma carregados!');
});

// Inicializar quando o idioma mudar
document.addEventListener('languageChanged', (event) => {
    const language = event.detail.language;
    updateLanguageVisibility(language);
}); 
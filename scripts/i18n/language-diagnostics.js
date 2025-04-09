/**
 * RUNES Analytics Pro - Diagnóstico de Idiomas
 * Ferramenta para verificar a implementação do sistema multilíngue
 * e identificar problemas na estrutura de idiomas.
 * 
 * Uso: Abra o console do navegador (F12) em qualquer página e execute as funções disponíveis.
 */

// Constantes de configuração
const DIAGNOSTICS_CONFIG = {
    // Seletores importantes para verificação
    SELECTORS: {
        LANG_EN: '.lang-en',
        LANG_PT: '.lang-pt',
        DATA_I18N: '[data-i18n]',
        HEADER: 'header',
        FOOTER: 'footer',
        MAIN_CONTENT: 'main, .main-content, #main-content',
        NAVIGATION: 'nav, .nav, .navbar, .navigation'
    },
    // Lista de páginas importantes para verificar
    PAGES: [
        'index.html',
        'intro.html',
        'architecture.html',
        'features.html',
        'demo.html'
    ],
    // Classes CSS relevantes para o sistema de idiomas
    CSS_CLASSES: [
        'lang-en',
        'lang-pt',
        'active-lang',
        'language-switcher'
    ]
};

/**
 * Verifica o status geral da implementação de idiomas na página atual
 * @returns {Object} Estatísticas e informações sobre os elementos de idioma
 */
function diagnosticLanguageImplementation() {
    console.log('🔍 RUNES Analytics Pro - Diagnóstico de Implementação de Idiomas');
    console.log('----------------------------------------------------------');
    
    // Estatísticas gerais
    const stats = {
        total: {
            enElements: document.querySelectorAll(DIAGNOSTICS_CONFIG.SELECTORS.LANG_EN).length,
            ptElements: document.querySelectorAll(DIAGNOSTICS_CONFIG.SELECTORS.LANG_PT).length,
            i18nElements: document.querySelectorAll(DIAGNOSTICS_CONFIG.SELECTORS.DATA_I18N).length
        },
        sections: {},
        issues: [],
        recommendations: []
    };
    
    // Verificar proporção de elementos com classes de idioma
    const allTextElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, div');
    stats.total.textElements = allTextElements.length;
    
    // Calcular porcentagem de cobertura
    const coveredElements = stats.total.enElements + stats.total.ptElements;
    stats.coverage = {
        percentage: Math.round((coveredElements / stats.total.textElements) * 100),
        withoutLanguageClass: stats.total.textElements - coveredElements
    };
    
    // Verificar por seções importantes
    const sections = [
        { name: 'header', selector: DIAGNOSTICS_CONFIG.SELECTORS.HEADER },
        { name: 'footer', selector: DIAGNOSTICS_CONFIG.SELECTORS.FOOTER },
        { name: 'mainContent', selector: DIAGNOSTICS_CONFIG.SELECTORS.MAIN_CONTENT },
        { name: 'navigation', selector: DIAGNOSTICS_CONFIG.SELECTORS.NAVIGATION }
    ];
    
    sections.forEach(section => {
        const sectionElements = document.querySelectorAll(section.selector);
        if (sectionElements.length === 0) {
            stats.issues.push(`Seção "${section.name}" não encontrada (seletor: ${section.selector})`);
            return;
        }
        
        // Analisar elementos de idioma dentro da seção
        const sectionStats = {
            total: 0,
            withEnClass: 0,
            withPtClass: 0,
            missingLanguageClass: 0
        };
        
        sectionElements.forEach(sectionElement => {
            const textElements = sectionElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, div');
            sectionStats.total += textElements.length;
            
            sectionStats.withEnClass += sectionElement.querySelectorAll(DIAGNOSTICS_CONFIG.SELECTORS.LANG_EN).length;
            sectionStats.withPtClass += sectionElement.querySelectorAll(DIAGNOSTICS_CONFIG.SELECTORS.LANG_PT).length;
        });
        
        sectionStats.missingLanguageClass = sectionStats.total - (sectionStats.withEnClass + sectionStats.withPtClass);
        sectionStats.coveragePercentage = Math.round(((sectionStats.withEnClass + sectionStats.withPtClass) / sectionStats.total) * 100) || 0;
        
        stats.sections[section.name] = sectionStats;
        
        // Verificar problemas na seção
        if (sectionStats.coveragePercentage < 70) {
            stats.issues.push(`Baixa cobertura de idioma na seção "${section.name}": ${sectionStats.coveragePercentage}%`);
            stats.recommendations.push(`Adicione classes de idioma aos elementos na seção "${section.name}"`);
        }
    });
    
    // Verificar desbalanceamento entre idiomas
    const languageRatio = stats.total.enElements / (stats.total.ptElements || 1);
    if (languageRatio < 0.7 || languageRatio > 1.3) {
        stats.issues.push(`Desbalanceamento entre idiomas: EN (${stats.total.enElements}) vs PT (${stats.total.ptElements})`);
        stats.recommendations.push('Verifique se todos os textos possuem versões em ambos os idiomas');
    }
    
    // Verificar uso do atributo data-i18n
    if (stats.total.i18nElements === 0) {
        stats.issues.push('Nenhum elemento com atributo data-i18n encontrado');
        stats.recommendations.push('Considere utilizar o atributo data-i18n para textos dinâmicos');
    }
    
    // Verificar se o alternador de idiomas está presente
    const languageSwitcher = document.querySelector('.language-switcher, #language-switcher');
    if (!languageSwitcher) {
        stats.issues.push('Alternador de idiomas não encontrado');
        stats.recommendations.push('Adicione um elemento com classe ou ID "language-switcher"');
    }
    
    // Verificar se o script language-switcher.js está carregado
    const languageSwitcherScript = Array.from(document.scripts).find(script => 
        script.src.includes('language-switcher.js')
    );
    
    if (!languageSwitcherScript) {
        stats.issues.push('Script language-switcher.js não carregado na página');
        stats.recommendations.push('Certifique-se de incluir o script language-switcher.js');
    }
    
    // Verificar CSS para classes de idioma
    const styleSheets = Array.from(document.styleSheets);
    let hasLanguageStyles = false;
    
    try {
        for (const sheet of styleSheets) {
            if (sheet.href && !sheet.href.includes(document.domain)) continue; // Pular folhas de estilo externas
            
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
                if (rule.selectorText && 
                    (rule.selectorText.includes('.lang-en') || 
                     rule.selectorText.includes('.lang-pt'))) {
                    hasLanguageStyles = true;
                    break;
                }
            }
            
            if (hasLanguageStyles) break;
        }
    } catch (error) {
        console.warn('Não foi possível ler as regras CSS (possivelmente devido a políticas CORS)');
    }
    
    if (!hasLanguageStyles) {
        stats.issues.push('Não foram encontradas regras CSS para classes de idioma');
        stats.recommendations.push('Adicione estilos CSS para .lang-en e .lang-pt');
    }
    
    // Exibir resultados
    console.log('📊 Estatísticas:');
    console.log(`   Elementos totais: ${stats.total.textElements}`);
    console.log(`   Elementos com classe .lang-en: ${stats.total.enElements}`);
    console.log(`   Elementos com classe .lang-pt: ${stats.total.ptElements}`);
    console.log(`   Elementos com atributo data-i18n: ${stats.total.i18nElements}`);
    console.log(`   Cobertura de idioma: ${stats.coverage.percentage}%`);
    console.log(`   Elementos sem classe de idioma: ${stats.coverage.withoutLanguageClass}`);
    
    console.log('\n📋 Estatísticas por seção:');
    Object.entries(stats.sections).forEach(([section, sectionStats]) => {
        console.log(`   ${section}:`);
        console.log(`     - Total de elementos: ${sectionStats.total}`);
        console.log(`     - Elementos com classe .lang-en: ${sectionStats.withEnClass}`);
        console.log(`     - Elementos com classe .lang-pt: ${sectionStats.withPtClass}`);
        console.log(`     - Elementos sem classe de idioma: ${sectionStats.missingLanguageClass}`);
        console.log(`     - Cobertura de idioma: ${sectionStats.coveragePercentage}%`);
    });
    
    if (stats.issues.length > 0) {
        console.log('\n⚠️ Problemas encontrados:');
        stats.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
    } else {
        console.log('\n✅ Nenhum problema crítico encontrado!');
    }
    
    if (stats.recommendations.length > 0) {
        console.log('\n💡 Recomendações:');
        stats.recommendations.forEach((recommendation, index) => {
            console.log(`   ${index + 1}. ${recommendation}`);
        });
    }
    
    // Sugestão final
    if (stats.coverage.percentage < 50) {
        console.log('\n🚨 ATENÇÃO: A cobertura de idioma está muito baixa. Recomendamos usar a ferramenta batch-translator.js.');
        console.log('Execute: batchAddLanguageClasses({lang: "pt", dryRun: false})');
    } else if (stats.coverage.percentage < 90) {
        console.log('\n⚠️ A cobertura de idioma pode ser melhorada. Considere usar a ferramenta batch-translator.js para os elementos restantes.');
    } else {
        console.log('\n✅ Excelente cobertura de idioma!');
    }
    
    return stats;
}

/**
 * Verifica a consistência das traduções na página atual
 * @returns {Object} Estatísticas sobre a consistência das traduções
 */
function checkTranslationConsistency() {
    console.log('🔍 RUNES Analytics Pro - Verificação de Consistência de Traduções');
    console.log('-----------------------------------------------------------');
    
    const stats = {
        totalPairs: 0,
        inconsistentPairs: 0,
        missingTranslations: 0,
        possibleIssues: []
    };
    
    // Encontrar todos os elementos pai que contêm ambas as classes de idioma
    const elementsWithBothLanguages = [];
    const enElements = document.querySelectorAll(DIAGNOSTICS_CONFIG.SELECTORS.LANG_EN);
    
    Array.from(enElements).forEach(enElement => {
        const parent = enElement.parentElement;
        if (!parent) return;
        
        const ptElement = parent.querySelector(DIAGNOSTICS_CONFIG.SELECTORS.LANG_PT);
        if (ptElement) {
            elementsWithBothLanguages.push({
                parent,
                en: enElement,
                pt: ptElement
            });
        }
    });
    
    stats.totalPairs = elementsWithBothLanguages.length;
    console.log(`🔍 Encontrados ${stats.totalPairs} pares de elementos com traduções EN/PT`);
    
    // Verificar a consistência das traduções
    elementsWithBothLanguages.forEach(pair => {
        const enText = pair.en.textContent.trim();
        const ptText = pair.pt.textContent.trim();
        
        // Ignorar placeholders
        if (ptText.startsWith('[EN]') || enText.startsWith('[PT]')) {
            stats.missingTranslations++;
            stats.possibleIssues.push({
                type: 'missingTranslation',
                en: enText,
                pt: ptText,
                element: getElementPath(pair.parent)
            });
            return;
        }
        
        // Verificar se a tradução parece inconsistente
        // Verificamos o comprimento do texto e certos padrões
        const lengthRatio = enText.length / (ptText.length || 1);
        
        // A maioria das traduções PT são mais longas que as EN
        // Se a inglesa for significativamente mais longa, pode haver um problema
        if (lengthRatio > 1.5 && enText.length > 20) {
            stats.inconsistentPairs++;
            stats.possibleIssues.push({
                type: 'suspiciousLength',
                en: enText,
                pt: ptText,
                element: getElementPath(pair.parent)
            });
        }
        
        // Verificar se os textos são idênticos (exceto para termos técnicos)
        if (enText === ptText && enText.length > 10 && !isCommonTechnicalTerm(enText)) {
            stats.inconsistentPairs++;
            stats.possibleIssues.push({
                type: 'identical',
                text: enText,
                element: getElementPath(pair.parent)
            });
        }
    });
    
    // Exibir resultados
    console.log('📊 Estatísticas:');
    console.log(`   Total de pares de tradução: ${stats.totalPairs}`);
    console.log(`   Traduções ausentes: ${stats.missingTranslations}`);
    console.log(`   Possíveis inconsistências: ${stats.inconsistentPairs}`);
    
    if (stats.possibleIssues.length > 0) {
        console.log('\n⚠️ Possíveis problemas de tradução:');
        
        // Agrupar por tipo de problema
        const byType = {
            missingTranslation: [],
            suspiciousLength: [],
            identical: []
        };
        
        stats.possibleIssues.forEach(issue => {
            byType[issue.type].push(issue);
        });
        
        if (byType.missingTranslation.length > 0) {
            console.log('\n   Traduções ausentes:');
            byType.missingTranslation.slice(0, 5).forEach((issue, i) => {
                console.log(`   ${i + 1}. Elemento: ${issue.element}`);
                console.log(`      EN: "${truncateText(issue.en, 50)}"`);
                console.log(`      PT: "${truncateText(issue.pt, 50)}"`);
            });
            
            if (byType.missingTranslation.length > 5) {
                console.log(`      ... e mais ${byType.missingTranslation.length - 5} ocorrências`);
            }
        }
        
        if (byType.identical.length > 0) {
            console.log('\n   Textos idênticos em ambos os idiomas:');
            byType.identical.slice(0, 5).forEach((issue, i) => {
                console.log(`   ${i + 1}. Elemento: ${issue.element}`);
                console.log(`      Texto: "${truncateText(issue.text, 50)}"`);
            });
            
            if (byType.identical.length > 5) {
                console.log(`      ... e mais ${byType.identical.length - 5} ocorrências`);
            }
        }
        
        if (byType.suspiciousLength.length > 0) {
            console.log('\n   Proporção de comprimento suspeita:');
            byType.suspiciousLength.slice(0, 5).forEach((issue, i) => {
                console.log(`   ${i + 1}. Elemento: ${issue.element}`);
                console.log(`      EN (${issue.en.length}): "${truncateText(issue.en, 50)}"`);
                console.log(`      PT (${issue.pt.length}): "${truncateText(issue.pt, 50)}"`);
            });
            
            if (byType.suspiciousLength.length > 5) {
                console.log(`      ... e mais ${byType.suspiciousLength.length - 5} ocorrências`);
            }
        }
    } else {
        console.log('\n✅ Nenhum problema de tradução encontrado!');
    }
    
    // Recomendações finais
    if (stats.missingTranslations > 0) {
        console.log('\n💡 Recomendação: Use a ferramenta executeAutoTranslate para preencher traduções ausentes:');
        console.log('executeAutoTranslate({from: "pt", to: "en", dryRun: false})');
    }
    
    if (stats.inconsistentPairs > 10) {
        console.log('\n⚠️ Há muitas inconsistências nas traduções. Considere uma revisão manual das traduções.');
    }
    
    return stats;
}

/**
 * Verifica a alternância de idioma em tempo real
 * @param {number} [duration=3000] - Duração do teste em milissegundos
 */
function testLanguageSwitching(duration = 3000) {
    console.log('🔄 RUNES Analytics Pro - Teste de Alternância de Idioma');
    console.log('--------------------------------------------------');
    
    // Verificar se o alternador de idiomas existe
    const languageSwitcher = document.querySelector('.language-switcher, #language-switcher, [data-action="switch-language"]');
    if (!languageSwitcher) {
        console.error('❌ Alternador de idiomas não encontrado na página.');
        return null;
    }
    
    // Contar elementos de idioma visíveis antes da alternância
    const visibleBefore = {
        en: countVisibleElements(DIAGNOSTICS_CONFIG.SELECTORS.LANG_EN),
        pt: countVisibleElements(DIAGNOSTICS_CONFIG.SELECTORS.LANG_PT)
    };
    
    console.log(`📊 Antes da alternância:`);
    console.log(`   Elementos EN visíveis: ${visibleBefore.en}`);
    console.log(`   Elementos PT visíveis: ${visibleBefore.pt}`);
    
    // Determinar o idioma atual com base na visibilidade
    const initialLang = visibleBefore.en > visibleBefore.pt ? 'en' : 'pt';
    console.log(`   Idioma inicial detectado: ${initialLang.toUpperCase()}`);
    
    // Registrar observador para detectar mudanças de visibilidade
    let elementChanges = 0;
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                elementChanges++;
            }
        });
    });
    
    // Observar mudanças em elementos com classes de idioma
    const langElements = document.querySelectorAll('.lang-en, .lang-pt');
    langElements.forEach(element => {
        observer.observe(element, { 
            attributes: true, 
            attributeFilter: ['style', 'class']
        });
    });
    
    // Registrar hora inicial
    const startTime = performance.now();
    
    // Clicar no alternador de idiomas
    console.log(`🖱️ Clicando no alternador de idiomas...`);
    languageSwitcher.click();
    
    // Definir um timeout para verificar após a alternância
    setTimeout(() => {
        // Parar de observar
        observer.disconnect();
        
        // Contar elementos visíveis após a alternância
        const visibleAfter = {
            en: countVisibleElements(DIAGNOSTICS_CONFIG.SELECTORS.LANG_EN),
            pt: countVisibleElements(DIAGNOSTICS_CONFIG.SELECTORS.LANG_PT)
        };
        
        // Calcular o tempo decorrido
        const elapsedTime = Math.round(performance.now() - startTime);
        
        console.log(`⏱️ Alternância concluída em ${elapsedTime}ms`);
        console.log(`📊 Após a alternância:`);
        console.log(`   Elementos EN visíveis: ${visibleAfter.en}`);
        console.log(`   Elementos PT visíveis: ${visibleAfter.pt}`);
        console.log(`   Elementos alterados: ${elementChanges}`);
        
        // Verificar se a alternância foi efetiva
        const finalLang = visibleAfter.en > visibleAfter.pt ? 'en' : 'pt';
        const success = initialLang !== finalLang;
        
        if (success) {
            console.log(`✅ Alternância de idioma funcionou corretamente!`);
            console.log(`   Idioma alterado de ${initialLang.toUpperCase()} para ${finalLang.toUpperCase()}`);
        } else {
            console.log(`❌ A alternância de idioma FALHOU!`);
            console.log(`   O idioma permaneceu como ${initialLang.toUpperCase()}`);
            
            // Verificar possíveis causas
            if (elementChanges === 0) {
                console.log(`   Nenhuma mudança de estilo ou classe foi detectada.`);
                console.log(`   Verifique se o evento de clique está sendo capturado pelo language-switcher.js`);
            } else if (visibleBefore.en === visibleAfter.en && visibleBefore.pt === visibleAfter.pt) {
                console.log(`   A visibilidade dos elementos não mudou.`);
                console.log(`   Verifique as regras CSS para .lang-en e .lang-pt`);
            }
        }
        
        // Restaurar o idioma original se necessário
        if (success) {
            console.log(`🔄 Restaurando o idioma original (${initialLang.toUpperCase()})...`);
            languageSwitcher.click();
        }
        
    }, duration);
    
    return true;
}

/**
 * Conta quantos elementos com o seletor fornecido estão visíveis
 * @param {string} selector - Seletor CSS
 * @returns {number} Número de elementos visíveis
 */
function countVisibleElements(selector) {
    const elements = document.querySelectorAll(selector);
    let visibleCount = 0;
    
    elements.forEach(element => {
        // Verificar se o elemento está visível
        const style = window.getComputedStyle(element);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            visibleCount++;
        }
    });
    
    return visibleCount;
}

/**
 * Verifica se o texto é um termo técnico comum que não precisa ser traduzido
 * @param {string} text - Texto a ser verificado
 * @returns {boolean} Verdadeiro se for um termo técnico comum
 */
function isCommonTechnicalTerm(text) {
    const technicalTerms = [
        'RUNES', 'Bitcoin', 'API', 'Blockchain', 'Ordinals', 'Web3',
        'NFT', 'Dashboard', 'Analytics', 'Pro', 'Analytics Pro',
        'BTC', 'TPS', 'ROI', 'URL', 'UI', 'UX', 'HTML', 'CSS', 'JS'
    ];
    
    // Verificar se o texto é exatamente um termo técnico
    if (technicalTerms.includes(text)) {
        return true;
    }
    
    // Verificar se o texto é principalmente numérico ou um código
    if (/^[0-9.,%$€£]+$/.test(text)) {
        return true;
    }
    
    // Verificar se é uma URL ou e-mail
    if (/^https?:\/\//.test(text) || /^[\w.-]+@[\w.-]+\.\w+$/.test(text)) {
        return true;
    }
    
    return false;
}

/**
 * Obtém o caminho do elemento no DOM para identificação mais fácil
 * @param {Element} element - Elemento do DOM
 * @returns {string} Caminho do elemento
 */
function getElementPath(element) {
    if (!element) return 'desconhecido';
    
    let path = '';
    let currentElem = element;
    
    for (let i = 0; i < 4; i++) { // Limitar a 4 níveis para evitar caminhos muito longos
        if (!currentElem) break;
        
        let identifier = currentElem.tagName.toLowerCase();
        
        // Adicionar id se disponível
        if (currentElem.id) {
            identifier += `#${currentElem.id}`;
        } 
        // Ou classes
        else if (currentElem.classList.length > 0) {
            // Filtrar classes de idioma para tornar o caminho mais limpo
            const relevantClasses = Array.from(currentElem.classList)
                .filter(cls => !cls.startsWith('lang-'));
                
            if (relevantClasses.length > 0) {
                identifier += `.${relevantClasses.join('.')}`;
            }
        }
        
        path = path ? `${identifier} > ${path}` : identifier;
        currentElem = currentElem.parentElement;
    }
    
    return path;
}

/**
 * Trunca um texto para o tamanho máximo especificado
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
}

// Exportar funções para uso global
window.diagnosticLanguageImplementation = diagnosticLanguageImplementation;
window.checkTranslationConsistency = checkTranslationConsistency;
window.testLanguageSwitching = testLanguageSwitching;

console.log('💡 Diagnóstico de Idiomas carregado! Funções disponíveis:');
console.log('1. diagnosticLanguageImplementation() - Verifica a implementação do sistema de idiomas');
console.log('2. checkTranslationConsistency() - Verifica a consistência das traduções');
console.log('3. testLanguageSwitching() - Testa a alternância de idioma em tempo real'); 
/**
 * RUNES Analytics Pro - Tradutor em Lote
 * Esta ferramenta ajuda a adicionar classes de idioma em elementos de texto
 * e converter textos simples em estruturas multilíngue.
 * 
 * Uso: Abra o console do navegador (F12) em qualquer página e execute as funções disponíveis.
 */

// Constantes para configurações
const I18N_SETTINGS = {
    DEFAULT_SELECTOR: 'p, h1, h2, h3, h4, h5, h6, li, a, button, span, div, label',
    EXCLUDED_CLASSES: [
        'lang-en', 'lang-pt', 'code', 'hljs', 'logo', 'icon', 
        'fa', 'fab', 'fas', 'far', 'material-icons'
    ],
    EXCLUDED_PARENTS: [
        'pre', 'code', 'script', 'style', 'svg', 'nav', 'footer'
    ],
    MIN_TEXT_LENGTH: 3,
    CONTAINER_ATTR: 'data-i18n-processed'
};

/**
 * Converte elementos de texto simples em estruturas multilíngue
 * @param {Object} options - Opções de configuração
 * @param {string} options.selector - Seletor CSS para elementos a serem processados
 * @param {string} options.lang - Idioma atual dos elementos ('en' ou 'pt')
 * @param {boolean} options.dryRun - Se verdadeiro, apenas simula as alterações sem aplicá-las
 * @returns {Object} Estatísticas do processo
 */
function batchAddLanguageClasses(options = {}) {
    console.log('🔄 RUNES Analytics Pro - Tradutor em Lote');
    console.log('---------------------------------------');
    
    // Mesclar opções padrão com as fornecidas
    const config = {
        selector: options.selector || I18N_SETTINGS.DEFAULT_SELECTOR,
        lang: options.lang || 'pt',
        dryRun: options.dryRun === undefined ? true : options.dryRun
    };
    
    console.log(`⚙️ Configuração:`);
    console.log(`   Seletor: ${config.selector}`);
    console.log(`   Idioma atual: ${config.lang}`);
    console.log(`   Modo simulação: ${config.dryRun ? 'Sim' : 'Não'}`);
    
    // Validar idioma
    if (!['en', 'pt'].includes(config.lang)) {
        console.error('❌ Idioma inválido. Use "en" ou "pt".');
        return;
    }
    
    // Estatísticas
    const stats = {
        elementsProcessed: 0,
        elementsSkipped: 0,
        elementsConverted: 0,
        reasons: {
            tooShort: 0,
            excludedClass: 0,
            excludedParent: 0,
            alreadyProcessed: 0,
            emptyText: 0
        }
    };
    
    // Selecionar elementos
    const elements = document.querySelectorAll(config.selector);
    console.log(`🔍 Encontrados ${elements.length} elementos para análise...`);
    
    // Processar cada elemento
    Array.from(elements).forEach(element => {
        // Pular elementos já processados por este script
        if (element.getAttribute(I18N_SETTINGS.CONTAINER_ATTR) === 'true') {
            stats.elementsSkipped++;
            stats.reasons.alreadyProcessed++;
            return;
        }
        
        // Pular elementos com classes de idioma ou classes excluídas
        const hasLanguageClass = element.classList.contains('lang-en') || 
                                element.classList.contains('lang-pt');
        
        const hasExcludedClass = I18N_SETTINGS.EXCLUDED_CLASSES.some(cls => 
            element.classList.contains(cls)
        );
        
        if (hasLanguageClass || hasExcludedClass) {
            stats.elementsSkipped++;
            stats.reasons.excludedClass++;
            return;
        }
        
        // Verificar se está dentro de um elemento pai excluído
        const isInExcludedParent = I18N_SETTINGS.EXCLUDED_PARENTS.some(parent => {
            return element.closest(parent) !== null;
        });
        
        if (isInExcludedParent) {
            stats.elementsSkipped++;
            stats.reasons.excludedParent++;
            return;
        }
        
        // Obter o texto do elemento
        const text = element.textContent.trim();
        
        // Pular elementos sem texto ou com texto muito curto
        if (!text) {
            stats.elementsSkipped++;
            stats.reasons.emptyText++;
            return;
        }
        
        if (text.length < I18N_SETTINGS.MIN_TEXT_LENGTH) {
            stats.elementsSkipped++;
            stats.reasons.tooShort++;
            return;
        }
        
        // Verificar se já tem elementos filhos que são spans de idioma
        const hasLanguageSpans = Array.from(element.children).some(child => 
            (child.tagName === 'SPAN' && 
             (child.classList.contains('lang-en') || child.classList.contains('lang-pt')))
        );
        
        if (hasLanguageSpans) {
            stats.elementsSkipped++;
            stats.reasons.alreadyProcessed++;
            return;
        }
        
        // Se chegou até aqui, o elemento deve ser processado
        stats.elementsProcessed++;
        
        if (!config.dryRun) {
            // Criar estrutura de idioma
            const originalHTML = element.innerHTML;
            
            // Adicionar classe de idioma atual e criar espaço para outro idioma
            const otherLang = config.lang === 'pt' ? 'en' : 'pt';
            
            element.innerHTML = `
                <span class="lang-${config.lang}">${originalHTML}</span>
                <span class="lang-${otherLang}" style="display: none;">[${otherLang.toUpperCase()}] ${originalHTML}</span>
            `;
            
            // Marcar como processado
            element.setAttribute(I18N_SETTINGS.CONTAINER_ATTR, 'true');
            stats.elementsConverted++;
        } else {
            stats.elementsConverted++;
        }
    });
    
    // Exibir estatísticas
    console.log('📊 Resultados:');
    console.log(`   Elementos analisados: ${elements.length}`);
    console.log(`   Elementos processados: ${stats.elementsProcessed}`);
    console.log(`   Elementos convertidos: ${stats.elementsConverted} ${config.dryRun ? '(simulação)' : ''}`);
    console.log(`   Elementos ignorados: ${stats.elementsSkipped}`);
    console.log('   Motivos para ignorar:');
    console.log(`     - Texto muito curto: ${stats.reasons.tooShort}`);
    console.log(`     - Classe excluída: ${stats.reasons.excludedClass}`);
    console.log(`     - Dentro de elemento excluído: ${stats.reasons.excludedParent}`);
    console.log(`     - Já processado: ${stats.reasons.alreadyProcessed}`);
    console.log(`     - Sem texto: ${stats.reasons.emptyText}`);
    
    if (config.dryRun) {
        console.log('\n⚠️ Isso foi apenas uma SIMULAÇÃO. Nenhuma alteração foi aplicada.');
        console.log('Para aplicar as alterações, execute com a opção dryRun: false');
        console.log(`Exemplo: batchAddLanguageClasses({lang: '${config.lang}', dryRun: false})`);
    } else {
        console.log('\n✅ Alterações aplicadas com sucesso!');
        console.log('Recomendamos verificar e ajustar manualmente as traduções.');
        console.log('Use o tradutor automático (executeAutoTranslate) para uma tradução inicial rápida.');
    }
    
    return stats;
}

/**
 * Executa tradução automática para elementos recém-criados
 * @param {Object} options - Opções de configuração
 * @param {string} options.from - Idioma de origem ('en' ou 'pt')
 * @param {string} options.to - Idioma de destino ('en' ou 'pt')
 * @param {boolean} options.dryRun - Se verdadeiro, apenas simula as alterações sem aplicá-las
 */
function executeAutoTranslate(options = {}) {
    console.log('🔄 RUNES Analytics Pro - Tradutor Automático');
    console.log('------------------------------------------');
    
    // Mesclar opções padrão com as fornecidas
    const config = {
        from: options.from || 'pt',
        to: options.to || 'en',
        dryRun: options.dryRun === undefined ? true : options.dryRun
    };
    
    console.log(`⚙️ Configuração:`);
    console.log(`   Traduzir de: ${config.from}`);
    console.log(`   Traduzir para: ${config.to}`);
    console.log(`   Modo simulação: ${config.dryRun ? 'Sim' : 'Não'}`);
    
    // Validar idiomas
    if (!['en', 'pt'].includes(config.from) || !['en', 'pt'].includes(config.to)) {
        console.error('❌ Idioma inválido. Use "en" ou "pt".');
        return;
    }
    
    if (config.from === config.to) {
        console.error('❌ Os idiomas de origem e destino devem ser diferentes.');
        return;
    }
    
    // Estatísticas
    const stats = {
        elementsProcessed: 0,
        elementsTranslated: 0,
        elementsSkipped: 0,
        errors: 0
    };
    
    // Selecionar elementos do idioma de origem que têm um elemento correspondente no idioma de destino
    const sourceElements = document.querySelectorAll(`.lang-${config.from}`);
    console.log(`🔍 Encontrados ${sourceElements.length} elementos no idioma de origem...`);
    
    // Processar cada elemento
    Array.from(sourceElements).forEach(sourceElement => {
        const parent = sourceElement.parentElement;
        if (!parent) return;
        
        const targetElement = parent.querySelector(`.lang-${config.to}`);
        if (!targetElement) {
            stats.elementsSkipped++;
            return;
        }
        
        // Verificar se o elemento de destino parece não ter sido traduzido
        const sourceText = sourceElement.textContent.trim();
        const targetText = targetElement.textContent.trim();
        
        const isDefaultText = targetText.startsWith(`[${config.to.toUpperCase()}]`);
        const isIdentical = (sourceText === targetText) && !isDefaultText;
        
        if (!isDefaultText && !isIdentical) {
            // Provavelmente já traduzido
            stats.elementsSkipped++;
            return;
        }
        
        stats.elementsProcessed++;
        
        if (!config.dryRun) {
            try {
                // Aqui implementaríamos a integração com um serviço de tradução
                // Como não temos integração real, simularemos uma tradução
                
                let translatedText = simulateTranslation(sourceText, config.from, config.to);
                
                // Aplicar a tradução
                targetElement.textContent = translatedText;
                targetElement.style.display = ''; // Garantir que esteja visível
                
                stats.elementsTranslated++;
            } catch (error) {
                console.error(`Erro ao traduzir: ${error.message}`);
                stats.errors++;
            }
        } else {
            stats.elementsTranslated++;
        }
    });
    
    // Exibir estatísticas
    console.log('📊 Resultados:');
    console.log(`   Elementos processados: ${stats.elementsProcessed}`);
    console.log(`   Elementos traduzidos: ${stats.elementsTranslated} ${config.dryRun ? '(simulação)' : ''}`);
    console.log(`   Elementos ignorados: ${stats.elementsSkipped}`);
    console.log(`   Erros: ${stats.errors}`);
    
    if (config.dryRun) {
        console.log('\n⚠️ Isso foi apenas uma SIMULAÇÃO. Nenhuma alteração foi aplicada.');
        console.log('Para aplicar as alterações, execute com a opção dryRun: false');
        console.log(`Exemplo: executeAutoTranslate({from: '${config.from}', to: '${config.to}', dryRun: false})`);
    } else {
        console.log('\n✅ Traduções aplicadas com sucesso!');
        console.log('⚠️ IMPORTANTE: Revise manualmente as traduções para garantir precisão.');
    }
    
    return stats;
}

/**
 * Função auxiliar para simular tradução
 * Em um ambiente real, integraria com um serviço de tradução automática
 */
function simulateTranslation(text, fromLang, toLang) {
    // Esta é apenas uma simulação - não faz tradução real
    
    // Alguns termos comuns para simular
    const commonTerms = {
        'pt': {
            'Análise': 'Analysis',
            'Runes': 'Runes',
            'Bitcoin': 'Bitcoin',
            'Tokens': 'Tokens',
            'Ordenar': 'Sort',
            'Filtrar': 'Filter',
            'Painel': 'Dashboard',
            'Gráfico': 'Chart',
            'Estatísticas': 'Statistics',
            'Dados': 'Data'
        },
        'en': {
            'Analysis': 'Análise',
            'Runes': 'Runes',
            'Bitcoin': 'Bitcoin',
            'Tokens': 'Tokens',
            'Sort': 'Ordenar',
            'Filter': 'Filtrar',
            'Dashboard': 'Painel',
            'Chart': 'Gráfico',
            'Statistics': 'Estatísticas',
            'Data': 'Dados'
        }
    };
    
    let translatedText = text;
    
    // Simular substituição de termos comuns
    if (fromLang in commonTerms) {
        const terms = commonTerms[fromLang];
        Object.keys(terms).forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            translatedText = translatedText.replace(regex, terms[term]);
        });
    }
    
    // Adicionar marcador para indicar que é uma tradução automática
    translatedText = `${translatedText} [AUTO]`;
    
    return translatedText;
}

/**
 * Aplica classes de idioma a elementos específicos
 * @param {string} selector - Seletor CSS para elementos a serem processados
 * @param {string} lang - Idioma a ser aplicado ('en' ou 'pt')
 */
function applyLanguageClass(selector, lang) {
    if (!['en', 'pt'].includes(lang)) {
        console.error('❌ Idioma inválido. Use "en" ou "pt".');
        return;
    }
    
    const elements = document.querySelectorAll(selector);
    console.log(`🔍 Aplicando classe lang-${lang} a ${elements.length} elementos...`);
    
    elements.forEach(element => {
        element.classList.add(`lang-${lang}`);
    });
    
    console.log(`✅ Classe lang-${lang} aplicada a ${elements.length} elementos.`);
}

// Exportar funções para uso global
window.batchAddLanguageClasses = batchAddLanguageClasses;
window.executeAutoTranslate = executeAutoTranslate;
window.applyLanguageClass = applyLanguageClass;

console.log('💡 Tradutor em Lote carregado! Funções disponíveis:');
console.log('1. batchAddLanguageClasses({lang: "pt", dryRun: true}) - Adiciona classes de idioma');
console.log('2. executeAutoTranslate({from: "pt", to: "en", dryRun: true}) - Traduz automaticamente');
console.log('3. applyLanguageClass(".selector", "en") - Aplica classe de idioma a elementos específicos'); 
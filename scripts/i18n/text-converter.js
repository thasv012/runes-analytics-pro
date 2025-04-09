/**
 * RUNES Analytics Pro - Conversor de Textos para Multilíngue
 * 
 * Esta ferramenta ajuda a converter seções de texto simples em estrutura multilíngue
 * adicionando as classes necessárias para o sistema de internacionalização.
 */

/**
 * Configurações para o conversor de textos
 */
const TEXT_CONVERTER_CONFIG = {
    // Seletores padrão para elementos a serem processados
    DEFAULT_SELECTORS: [
        'h1:not([data-i18n-processed])',
        'h2:not([data-i18n-processed])',
        'h3:not([data-i18n-processed])',
        'h4:not([data-i18n-processed])',
        'h5:not([data-i18n-processed])',
        'p:not([data-i18n-processed])',
        'a:not([data-i18n-processed])',
        'button:not([data-i18n-processed])',
        'label:not([data-i18n-processed])',
        'span:not([data-i18n-processed])'
    ],
    
    // Atributos a serem processados além do conteúdo textual
    PROCESSABLE_ATTRIBUTES: [
        'title',
        'alt',
        'placeholder',
        'aria-label'
    ],
    
    // Classes CSS para os idiomas
    LANG_CLASSES: {
        EN: 'lang-en',
        PT: 'lang-pt',
        ACTIVE: 'active-lang'
    },
    
    // Traduções automáticas comuns (para uso em modo automático)
    COMMON_TRANSLATIONS: {
        // Navegação
        'Home': 'Início',
        'About': 'Sobre',
        'Contact': 'Contato',
        'Services': 'Serviços',
        'Products': 'Produtos',
        'Blog': 'Blog',
        'News': 'Notícias',
        'Search': 'Buscar',
        'Login': 'Entrar',
        'Register': 'Cadastrar',
        'Sign Up': 'Cadastre-se',
        'Sign In': 'Entrar',
        'Log Out': 'Sair',
        'Profile': 'Perfil',
        'Settings': 'Configurações',
        
        // Botões e ações
        'Submit': 'Enviar',
        'Cancel': 'Cancelar',
        'Save': 'Salvar',
        'Delete': 'Excluir',
        'Edit': 'Editar',
        'Update': 'Atualizar',
        'Close': 'Fechar',
        'Open': 'Abrir',
        'Add': 'Adicionar',
        'Remove': 'Remover',
        'Next': 'Próximo',
        'Previous': 'Anterior',
        'Back': 'Voltar',
        'Continue': 'Continuar',
        
        // Mensagens
        'Loading...': 'Carregando...',
        'Please wait': 'Por favor, aguarde',
        'Success': 'Sucesso',
        'Error': 'Erro',
        'Warning': 'Atenção',
        'Info': 'Informação',
        'No results found': 'Nenhum resultado encontrado',
        'Are you sure?': 'Tem certeza?',
        
        // Runes específico
        'RUNES Analytics Pro': 'RUNES Analytics Pro',
        'Dashboard': 'Painel',
        'Tokens': 'Tokens',
        'Transactions': 'Transações',
        'Wallet': 'Carteira',
        'Analysis': 'Análise',
        'Statistics': 'Estatísticas',
        'Charts': 'Gráficos',
        'Metrics': 'Métricas',
        'Trends': 'Tendências',
        'Market': 'Mercado',
        'Price': 'Preço',
        'Volume': 'Volume',
        'Supply': 'Oferta',
        'Holders': 'Detentores',
        'Inscriptions': 'Inscrições',
        'Ordinals': 'Ordinais',
        'Bitcoin': 'Bitcoin',
        'Satoshi': 'Satoshi'
    }
};

/**
 * Converte elementos de texto simples para formato multilíngue
 * @param {Object} options - Opções de configuração
 * @returns {Object} Resultados da conversão
 */
function convertTextToMultilingual(options = {}) {
    const config = {
        selectors: options.selectors || TEXT_CONVERTER_CONFIG.DEFAULT_SELECTORS,
        targetLang: options.targetLang || 'pt',  // Idioma para o qual traduzir
        sourceLang: options.sourceLang || 'en',  // Idioma de origem
        autoTranslate: options.autoTranslate === true,  // Usar traduções automáticas comuns
        markAsProcessed: options.markAsProcessed !== false,  // Marcar elementos como processados
        excludeSelectors: options.excludeSelectors || [],  // Seletores a excluir
        processAttributes: options.processAttributes !== false,  // Processar atributos além do texto
        rootElement: options.rootElement || document,  // Elemento raiz para buscar seletores
        defaultActiveLang: options.defaultActiveLang || getUserPreferredLang() || 'en',  // Idioma ativo por padrão
        ...options
    };
    
    console.log('🔄 Iniciando conversão de textos para formato multilíngue');
    
    // Resultados da conversão
    const results = {
        processed: 0,
        skipped: 0,
        errors: 0,
        autoTranslated: 0,
        details: []
    };
    
    // Juntar todos os seletores em uma string
    const selectorsString = config.selectors.join(', ');
    
    // Excluir elementos conforme especificado
    let elementsToProcess = Array.from(config.rootElement.querySelectorAll(selectorsString));
    
    // Filtrar elementos a serem excluídos
    if (config.excludeSelectors.length > 0) {
        const excludeSelectorsString = config.excludeSelectors.join(', ');
        const elementsToExclude = Array.from(config.rootElement.querySelectorAll(excludeSelectorsString));
        
        elementsToProcess = elementsToProcess.filter(el => !elementsToExclude.includes(el));
    }
    
    // Processar cada elemento
    elementsToProcess.forEach(element => {
        try {
            // Verificar se o elemento já foi processado
            if (element.hasAttribute('data-i18n-processed')) {
                results.skipped++;
                return;
            }
            
            // Verificar se o elemento tem conteúdo para processar
            if (!element.innerHTML.trim()) {
                results.skipped++;
                return;
            }
            
            // Processar conteúdo textual
            const originalContent = element.innerHTML;
            let translatedContent = '';
            
            if (config.autoTranslate) {
                translatedContent = autoTranslateText(originalContent);
                
                if (translatedContent !== originalContent) {
                    results.autoTranslated++;
                } else {
                    translatedContent = originalContent; // Se não conseguiu traduzir, usar o original
                }
            } else {
                translatedContent = originalContent; // Sem tradução automática, usar o mesmo conteúdo
            }
            
            // Verificar se tem filhos que não devem ser processados
            if (element.querySelector('img, svg, video, audio, canvas, iframe')) {
                // Para elementos com conteúdo complexo, manter a estrutura original
                wrapElementContent(element, config.sourceLang, config.targetLang, config.defaultActiveLang);
            } else {
                // Para elementos simples, substituir o conteúdo
                element.innerHTML = createMultilingualHTML(
                    originalContent, 
                    translatedContent, 
                    config.sourceLang, 
                    config.targetLang, 
                    config.defaultActiveLang
                );
            }
            
            // Processar atributos se necessário
            if (config.processAttributes) {
                processElementAttributes(element, config);
            }
            
            // Marcar como processado
            if (config.markAsProcessed) {
                element.setAttribute('data-i18n-processed', 'true');
            }
            
            // Registrar sucesso
            results.processed++;
            results.details.push({
                element: element.tagName,
                id: element.id,
                class: element.className,
                originalText: originalContent.substring(0, 30) + (originalContent.length > 30 ? '...' : ''),
                status: 'success'
            });
            
        } catch (error) {
            console.error('Erro ao processar elemento:', element, error);
            results.errors++;
            results.details.push({
                element: element.tagName,
                id: element.id,
                class: element.className,
                status: 'error',
                error: error.message
            });
        }
    });
    
    // Relatório final
    console.log(`✅ Conversão concluída: ${results.processed} processados, ${results.autoTranslated} traduzidos automaticamente, ${results.skipped} ignorados, ${results.errors} erros`);
    
    return results;
}

/**
 * Envolve o conteúdo de um elemento com spans multilíngues sem alterar sua estrutura interna
 * @param {HTMLElement} element - Elemento a ser processado
 * @param {string} sourceLang - Código do idioma de origem
 * @param {string} targetLang - Código do idioma de destino
 * @param {string} defaultActiveLang - Código do idioma ativo por padrão
 */
function wrapElementContent(element, sourceLang, targetLang, defaultActiveLang) {
    // Criar clone do elemento para a versão traduzida
    const originalContent = element.innerHTML;
    const translatedContent = autoTranslateText(originalContent);
    
    // Criar spans para cada idioma
    const sourceSpan = document.createElement('span');
    sourceSpan.className = TEXT_CONVERTER_CONFIG.LANG_CLASSES.EN;
    sourceSpan.innerHTML = originalContent;
    
    const targetSpan = document.createElement('span');
    targetSpan.className = TEXT_CONVERTER_CONFIG.LANG_CLASSES.PT;
    targetSpan.innerHTML = translatedContent;
    
    // Adicionar classe ativa ao idioma padrão
    if (defaultActiveLang === sourceLang) {
        sourceSpan.classList.add(TEXT_CONVERTER_CONFIG.LANG_CLASSES.ACTIVE);
    } else if (defaultActiveLang === targetLang) {
        targetSpan.classList.add(TEXT_CONVERTER_CONFIG.LANG_CLASSES.ACTIVE);
    }
    
    // Limpar e adicionar spans
    element.innerHTML = '';
    element.appendChild(sourceSpan);
    element.appendChild(targetSpan);
}

/**
 * Processa os atributos de um elemento para suporte multilíngue
 * @param {HTMLElement} element - Elemento a ser processado
 * @param {Object} config - Configurações de processamento
 */
function processElementAttributes(element, config) {
    TEXT_CONVERTER_CONFIG.PROCESSABLE_ATTRIBUTES.forEach(attr => {
        if (element.hasAttribute(attr)) {
            const originalValue = element.getAttribute(attr);
            let translatedValue = originalValue;
            
            // Tentar traduzir se configurado
            if (config.autoTranslate) {
                translatedValue = autoTranslateText(originalValue);
            }
            
            // Armazenar valores para cada idioma como atributos de dados
            element.setAttribute(`data-${attr}-${config.sourceLang}`, originalValue);
            element.setAttribute(`data-${attr}-${config.targetLang}`, translatedValue);
            
            // Definir o valor atual com base no idioma ativo
            if (config.defaultActiveLang === config.targetLang) {
                element.setAttribute(attr, translatedValue);
            }
        }
    });
}

/**
 * Cria o HTML para exibição multilíngue de um texto
 * @param {string} sourceText - Texto no idioma de origem
 * @param {string} targetText - Texto no idioma de destino
 * @param {string} sourceLang - Código do idioma de origem
 * @param {string} targetLang - Código do idioma de destino
 * @param {string} defaultActiveLang - Código do idioma ativo por padrão
 * @returns {string} HTML com estrutura multilíngue
 */
function createMultilingualHTML(sourceText, targetText, sourceLang, targetLang, defaultActiveLang) {
    const sourceClass = `${TEXT_CONVERTER_CONFIG.LANG_CLASSES[sourceLang.toUpperCase()]}${defaultActiveLang === sourceLang ? ' ' + TEXT_CONVERTER_CONFIG.LANG_CLASSES.ACTIVE : ''}`;
    const targetClass = `${TEXT_CONVERTER_CONFIG.LANG_CLASSES[targetLang.toUpperCase()]}${defaultActiveLang === targetLang ? ' ' + TEXT_CONVERTER_CONFIG.LANG_CLASSES.ACTIVE : ''}`;
    
    return `<span class="${sourceClass}">${sourceText}</span><span class="${targetClass}">${targetText}</span>`;
}

/**
 * Tenta traduzir automaticamente um texto usando o dicionário de traduções comuns
 * @param {string} text - Texto a ser traduzido
 * @returns {string} Texto traduzido ou o original se não encontrar tradução
 */
function autoTranslateText(text) {
    let translatedText = text;
    
    // Verificar se o texto completo tem uma tradução
    if (TEXT_CONVERTER_CONFIG.COMMON_TRANSLATIONS[text]) {
        return TEXT_CONVERTER_CONFIG.COMMON_TRANSLATIONS[text];
    }
    
    // Buscar por palavras ou frases que tenham tradução
    Object.entries(TEXT_CONVERTER_CONFIG.COMMON_TRANSLATIONS).forEach(([original, translation]) => {
        // Substituir apenas palavras completas, não partes de palavras
        const regex = new RegExp(`\\b${original}\\b`, 'g');
        translatedText = translatedText.replace(regex, translation);
    });
    
    return translatedText;
}

/**
 * Obtém o idioma preferido do usuário
 * @returns {string} Código do idioma ('en' ou 'pt')
 */
function getUserPreferredLang() {
    // Verificar se a função existe globalmente
    if (window.getUserPreferredLang) {
        return window.getUserPreferredLang();
    }
    
    // Implementação simplificada
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang === 'en' || urlLang === 'pt') {
        return urlLang;
    }
    
    const localLang = localStorage.getItem('user_lang');
    if (localLang === 'en' || localLang === 'pt') {
        return localLang;
    }
    
    return 'en'; // Idioma padrão
}

/**
 * Aplica a conversão automaticamente quando requisitado
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o script deve iniciar automaticamente
    const autoConvert = document.querySelector('script[data-auto-convert="true"]');
    if (autoConvert) {
        const options = {};
        
        // Verificar configurações específicas
        if (autoConvert.hasAttribute('data-auto-translate')) {
            options.autoTranslate = autoConvert.getAttribute('data-auto-translate') === 'true';
        }
        
        if (autoConvert.hasAttribute('data-exclude')) {
            options.excludeSelectors = autoConvert.getAttribute('data-exclude').split(',');
        }
        
        if (autoConvert.hasAttribute('data-selectors')) {
            options.selectors = autoConvert.getAttribute('data-selectors').split(',');
        }
        
        // Iniciar conversão
        convertTextToMultilingual(options);
    }
});

// Exportar funções para uso global
window.convertTextToMultilingual = convertTextToMultilingual;
window.autoTranslateText = autoTranslateText;

console.log('🔤 RUNES Analytics Pro - Conversor de Textos para Multilíngue carregado!'); 
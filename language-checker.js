/**
 * RUNES Analytics Pro - Verificador de Implementação de Idiomas
 * 
 * Este script verifica se todos os textos visíveis em arquivos HTML estão corretamente
 * configurados para o sistema de tradução, seja usando classes .lang-en e .lang-pt
 * ou atributos data-i18n.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLanguageChecker();
});

/**
 * Inicializa o verificador de idiomas
 */
function initLanguageChecker() {
    // Apenas executar em modo de desenvolvimento
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        console.log('Language checker only runs in development mode');
        return;
    }

    console.log('🔍 Iniciando verificador de idiomas...');
    
    // Adiciona o botão de verificação ao DOM
    addCheckerUI();
    
    // Registra eventos
    document.getElementById('run-lang-check').addEventListener('click', runLanguageCheck);
    document.getElementById('close-lang-validator').addEventListener('click', toggleValidatorUI);
}

/**
 * Adiciona a UI do verificador à página
 */
function addCheckerUI() {
    const validatorButton = document.createElement('button');
    validatorButton.id = 'toggle-lang-validator';
    validatorButton.className = 'lang-validator-button';
    validatorButton.innerHTML = '🌐';
    validatorButton.title = 'Verificar implementação de idiomas';
    validatorButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.2);
        color: cyan;
        border: 1px solid cyan;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    `;
    
    const validatorUI = document.createElement('div');
    validatorUI.id = 'language-validator-ui';
    validatorUI.className = 'language-validator-ui';
    validatorUI.style.display = 'none';
    validatorUI.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: cyan;">Verificador de Idiomas</h3>
            <button id="close-lang-validator" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
        </div>
        <div>
            <button id="run-lang-check" style="background: rgba(0, 255, 255, 0.2); border: 1px solid cyan; color: cyan; padding: 5px 10px; cursor: pointer; margin-bottom: 10px;">
                Iniciar Verificação
            </button>
        </div>
        <div id="lang-check-results" style="max-height: 300px; overflow-y: auto; font-size: 12px;">
            Clique em "Iniciar Verificação" para analisar a página.
        </div>
    `;
    
    document.body.appendChild(validatorButton);
    document.body.appendChild(validatorUI);
    
    validatorButton.addEventListener('click', toggleValidatorUI);
}

/**
 * Alterna a visibilidade da UI do validador
 */
function toggleValidatorUI() {
    const ui = document.getElementById('language-validator-ui');
    if (ui) {
        if (ui.style.display === 'none') {
            ui.style.display = 'block';
        } else {
            ui.style.display = 'none';
        }
    }
}

/**
 * Executa a verificação de idiomas na página atual
 */
function runLanguageCheck() {
    const resultsDiv = document.getElementById('lang-check-results');
    resultsDiv.innerHTML = '<p>Analisando página...</p>';
    
    // Obtém todos os nós de texto visíveis
    const textNodes = getVisibleTextNodes(document.body);
    
    // Verifica cada nó de texto
    let issues = [];
    
    textNodes.forEach(node => {
        // Ignora nós vazios ou apenas com espaços
        if (!node.textContent.trim()) return;
        
        // Verifica se o nó está dentro de um elemento com classes de idioma ou data-i18n
        const isInLanguageElement = isNodeInLanguageElement(node);
        
        if (!isInLanguageElement) {
            // Encontra o elemento pai mais próximo para referência
            const parentElement = findClosestVisibleParent(node);
            
            issues.push({
                text: node.textContent.trim(),
                element: parentElement,
                path: getNodePath(parentElement)
            });
            
            // Destaca visualmente o elemento com problema
            highlightIssue(parentElement);
        }
    });
    
    // Exibe os resultados
    if (issues.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #00ff00;">✓ Todos os textos estão corretamente configurados para tradução.</p>';
    } else {
        let html = `<p style="color: #ff6666;">❌ Encontrados ${issues.length} textos não configurados para tradução:</p><ul>`;
        
        issues.forEach((issue, index) => {
            html += `<li>
                <div><strong>Texto:</strong> "${truncateText(issue.text, 50)}"</div>
                <div><strong>Caminho:</strong> ${issue.path}</div>
                <button class="fix-issue-btn" data-index="${index}" style="background: rgba(0, 255, 255, 0.1); border: 1px solid cyan; color: cyan; padding: 2px 5px; margin-top: 5px; cursor: pointer; font-size: 11px;">Ir para elemento</button>
            </li>`;
        });
        
        html += '</ul>';
        resultsDiv.innerHTML = html;
        
        // Adiciona eventos aos botões de correção
        document.querySelectorAll('.fix-issue-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                scrollToElement(issues[index].element);
            });
        });
    }
    
    // Verifica a estrutura do alternador de idiomas
    checkLanguageSwitcher();
}

/**
 * Obtém todos os nós de texto visíveis em um elemento
 * @param {Element} element O elemento a ser verificado
 * @returns {Array} Array de nós de texto visíveis
 */
function getVisibleTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Ignora nós de script, estilo e elementos ocultos
                if (isNodeVisible(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

/**
 * Verifica se um nó está visível (não em scripts, estilos ou elementos ocultos)
 * @param {Node} node O nó a ser verificado
 * @returns {boolean} Verdadeiro se o nó estiver visível
 */
function isNodeVisible(node) {
    // Ignora nós vazios ou apenas com espaços
    if (!node.textContent.trim()) {
        return false;
    }
    
    // Obtém o elemento pai
    let parent = node.parentElement;
    
    // Verifica se o nó está em um script, estilo ou elemento oculto
    while (parent) {
        if (parent.tagName === 'SCRIPT' || 
            parent.tagName === 'STYLE' || 
            parent.tagName === 'NOSCRIPT' ||
            parent.tagName === 'TEMPLATE' ||
            getComputedStyle(parent).display === 'none' ||
            getComputedStyle(parent).visibility === 'hidden') {
            return false;
        }
        parent = parent.parentElement;
    }
    
    return true;
}

/**
 * Verifica se um nó está dentro de um elemento com classes de idioma ou data-i18n
 * @param {Node} node O nó a ser verificado
 * @returns {boolean} Verdadeiro se o nó estiver dentro de um elemento com classes de idioma
 */
function isNodeInLanguageElement(node) {
    let parent = node.parentElement;
    
    while (parent) {
        // Verifica classes de idioma
        if (parent.classList.contains('lang-en') || parent.classList.contains('lang-pt')) {
            return true;
        }
        
        // Verifica atributos data-i18n
        if (parent.hasAttribute('data-i18n') || 
            parent.hasAttribute('data-i18n-placeholder') || 
            parent.hasAttribute('data-i18n-title')) {
            return true;
        }
        
        parent = parent.parentElement;
    }
    
    return false;
}

/**
 * Encontra o elemento pai visível mais próximo
 * @param {Node} node O nó de texto
 * @returns {Element} O elemento pai mais próximo
 */
function findClosestVisibleParent(node) {
    let parent = node.parentElement;
    
    // Se o nó não tiver um pai, retorna o próprio nó
    if (!parent) {
        return node;
    }
    
    return parent;
}

/**
 * Obtém o caminho de um nó no DOM
 * @param {Element} element O elemento
 * @returns {string} O caminho do elemento
 */
function getNodePath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return '';
    }
    
    let path = element.tagName.toLowerCase();
    
    if (element.id) {
        path += `#${element.id}`;
    } else if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(' ')
            .filter(c => c && !c.includes('lang-'));
        if (classes.length > 0) {
            path += `.${classes.join('.')}`;
        }
    }
    
    return path;
}

/**
 * Destaca visualmente um elemento com problema
 * @param {Element} element O elemento a ser destacado
 */
function highlightIssue(element) {
    // Adiciona classe para estilização
    element.classList.add('i18n-missing');
    
    // Remove a classe após 5 segundos
    setTimeout(() => {
        element.classList.remove('i18n-missing');
    }, 5000);
}

/**
 * Trunca um texto para um determinado tamanho
 * @param {string} text O texto a ser truncado
 * @param {number} length O tamanho máximo
 * @returns {string} O texto truncado
 */
function truncateText(text, length) {
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
}

/**
 * Rola a página até um elemento
 * @param {Element} element O elemento para rolar até
 */
function scrollToElement(element) {
    if (!element) return;
    
    // Remove todas as classes de destaque anteriores
    document.querySelectorAll('.i18n-highlight').forEach(el => {
        el.classList.remove('i18n-highlight');
    });
    
    // Adiciona destaque ao elemento atual
    element.classList.add('i18n-highlight');
    
    // Rola para o elemento
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    
    // Pisca o elemento
    element.animate(
        [
            { outline: '3px solid transparent' },
            { outline: '3px solid cyan' },
            { outline: '3px solid transparent' }
        ],
        {
            duration: 1500,
            iterations: 3
        }
    );
    
    // Remove a classe após 5 segundos
    setTimeout(() => {
        element.classList.remove('i18n-highlight');
    }, 5000);
}

/**
 * Verifica a estrutura do alternador de idiomas
 */
function checkLanguageSwitcher() {
    const resultsDiv = document.getElementById('lang-check-results');
    const switcherIssues = [];
    
    // Verifica se o seletor de idiomas existe
    const languageSelector = document.querySelector('.language-selector');
    if (!languageSelector) {
        switcherIssues.push('Seletor de idiomas não encontrado (.language-selector)');
    }
    
    // Verifica se o botão de alternação existe
    const languageToggle = document.querySelector('.language-toggle');
    if (!languageToggle) {
        switcherIssues.push('Botão de alternação de idiomas não encontrado (.language-toggle)');
    }
    
    // Verifica se o dropdown existe
    const languageDropdown = document.querySelector('.language-dropdown');
    if (!languageDropdown) {
        switcherIssues.push('Dropdown de idiomas não encontrado (.language-dropdown)');
    }
    
    // Verifica se as opções de idioma existem
    const languageOptions = document.querySelectorAll('.language-option');
    if (languageOptions.length < 2) {
        switcherIssues.push(`Opções de idioma insuficientes (encontradas: ${languageOptions.length}, esperadas: 2+)`);
    }
    
    // Verifica se há eventos de clique nas opções
    let hasClickHandler = false;
    if (languageOptions.length > 0) {
        const handlers = getEventListeners(languageOptions[0]);
        hasClickHandler = handlers && handlers.click && handlers.click.length > 0;
        
        if (!hasClickHandler) {
            switcherIssues.push('Opções de idioma parecem não ter manipuladores de eventos de clique');
        }
    }
    
    // Exibe os resultados relacionados ao alternador de idiomas
    if (switcherIssues.length > 0) {
        let html = resultsDiv.innerHTML;
        html += `<h4 style="margin-top: 15px; color: #ff6666;">Problemas no alternador de idiomas:</h4><ul>`;
        
        switcherIssues.forEach(issue => {
            html += `<li>${issue}</li>`;
        });
        
        html += '</ul>';
        html += '<p>⚠️ O alternador de idiomas pode não estar funcionando corretamente.</p>';
        
        resultsDiv.innerHTML = html;
    } else {
        let html = resultsDiv.innerHTML;
        html += `<p style="margin-top: 15px; color: #00ff00;">✓ Alternador de idiomas está configurado corretamente.</p>`;
        resultsDiv.innerHTML = html;
    }
}

/**
 * Obtém os ouvintes de eventos de um elemento - NOTA: Funciona apenas no Chrome
 * @param {Element} element O elemento
 * @returns {Object} Objeto com os ouvintes de eventos
 */
function getEventListeners(element) {
    // Essa função só funciona no DevTools do Chrome
    if (window.getEventListeners) {
        return window.getEventListeners(element);
    }
    return null;
}

// Adiciona estilos para os elementos destacados
(function addLanguageCheckerStyles() {
    const style = document.createElement('style');
    style.id = 'language-checker-styles';
    style.textContent = `
        .i18n-missing {
            outline: 2px dashed #ff6666 !important;
            position: relative;
        }
        
        .i18n-missing::after {
            content: "⚠️ Sem tradução";
            position: absolute;
            top: -20px;
            left: 0;
            background: #ff6666;
            color: white;
            font-size: 10px;
            padding: 2px 5px;
            border-radius: 3px;
            z-index: 9999;
            pointer-events: none;
        }
        
        .i18n-highlight {
            outline: 3px solid cyan !important;
        }
        
        .language-validator-ui {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 15px;
            border-radius: 8px;
            width: 350px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 10000;
            font-family: monospace;
            border: 1px solid cyan;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
        }
        
        #lang-check-results {
            margin-top: 10px;
        }
        
        #lang-check-results ul {
            padding-left: 20px;
        }
        
        #lang-check-results li {
            margin-bottom: 10px;
            padding: 5px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
})(); 
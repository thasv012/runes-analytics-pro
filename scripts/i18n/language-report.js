/**
 * RUNES Analytics Pro - Relatório do Sistema de Idiomas
 * 
 * Este script verifica automaticamente todos os arquivos HTML para garantir
 * que o sistema de idiomas esteja corretamente implementado em todas as páginas.
 * Ele gera um relatório completo com estatísticas e problemas encontrados.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const chalk = require('chalk');

// Configuração
const config = {
    htmlDir: path.resolve(__dirname, '../../'),  // Diretório raiz do projeto
    langDir: path.resolve(__dirname, '../../lang'),  // Diretório de arquivos de tradução
    htmlExtensions: ['.html'],  // Extensões de arquivos a verificar
    outputFile: path.resolve(__dirname, '../../language-report.md'),  // Arquivo de relatório
    ignoreDirs: ['node_modules', 'dist', 'build', '.git', 'vendor']  // Diretórios a ignorar
};

// Estatísticas
const stats = {
    totalFiles: 0,
    scannedFiles: 0,
    compliantFiles: 0,
    nonCompliantFiles: 0,
    totalTextNodes: 0,
    properlySwitchableNodes: 0,
    nonSwitchableNodes: 0,
    missingTranslationKeys: 0,
    filesWithoutSwitcher: 0,
    filesReport: []
};

// Traduções carregadas
let translations = {
    en: null,
    pt: null
};

/**
 * Carrega os arquivos de tradução
 */
function loadTranslations() {
    console.log(chalk.cyan('📚 Carregando arquivos de tradução...'));
    
    try {
        // Carrega o arquivo de traduções em inglês
        const enPath = path.join(config.langDir, 'en.json');
        if (fs.existsSync(enPath)) {
            translations.en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
            console.log(chalk.green(`✓ Carregado en.json com ${Object.keys(translations.en).length} chaves`));
        } else {
            console.log(chalk.yellow('⚠️ Arquivo en.json não encontrado'));
        }
        
        // Carrega o arquivo de traduções em português
        const ptPath = path.join(config.langDir, 'pt.json');
        if (fs.existsSync(ptPath)) {
            translations.pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
            console.log(chalk.green(`✓ Carregado pt.json com ${Object.keys(translations.pt).length} chaves`));
        } else {
            console.log(chalk.yellow('⚠️ Arquivo pt.json não encontrado'));
        }
        
        // Verifica se as chaves são consistentes entre os idiomas
        if (translations.en && translations.pt) {
            const enKeys = Object.keys(translations.en);
            const ptKeys = Object.keys(translations.pt);
            
            const missingInPt = enKeys.filter(key => !ptKeys.includes(key));
            const missingInEn = ptKeys.filter(key => !enKeys.includes(key));
            
            if (missingInPt.length > 0) {
                console.log(chalk.yellow(`⚠️ ${missingInPt.length} chaves presentes em en.json mas ausentes em pt.json`));
            }
            
            if (missingInEn.length > 0) {
                console.log(chalk.yellow(`⚠️ ${missingInEn.length} chaves presentes em pt.json mas ausentes em en.json`));
            }
        }
    } catch (error) {
        console.error(chalk.red('❌ Erro ao carregar arquivos de tradução:'), error);
    }
}

/**
 * Encontra todos os arquivos HTML recursivamente
 * @param {string} dir Diretório a ser pesquisado
 * @param {Array} results Array para armazenar os resultados
 * @returns {Array} Array com os caminhos dos arquivos HTML
 */
function findHtmlFiles(dir, results = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.relative(config.htmlDir, filePath);
        const stat = fs.statSync(filePath);
        
        // Ignora diretórios específicos
        if (stat.isDirectory()) {
            if (!config.ignoreDirs.some(ignoreDir => 
                relativePath === ignoreDir || relativePath.startsWith(ignoreDir + path.sep)
            )) {
                findHtmlFiles(filePath, results);
            }
            continue;
        }
        
        // Adiciona arquivos HTML
        const ext = path.extname(file).toLowerCase();
        if (config.htmlExtensions.includes(ext)) {
            results.push(filePath);
            stats.totalFiles++;
        }
    }
    
    return results;
}

/**
 * Verifica um arquivo HTML
 * @param {string} filePath Caminho para o arquivo HTML
 */
function checkHtmlFile(filePath) {
    console.log(chalk.cyan(`📄 Verificando ${path.relative(config.htmlDir, filePath)}...`));
    stats.scannedFiles++;
    
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const fileReport = {
            file: path.relative(config.htmlDir, filePath),
            totalTextNodes: 0,
            switchableNodes: 0,
            nonSwitchableNodes: 0,
            hasSwitcher: false,
            missingTranslationKeys: [],
            issues: []
        };
        
        // Verifica se o arquivo tem o alternador de idiomas
        const languageSelector = document.querySelector('.language-selector');
        fileReport.hasSwitcher = !!languageSelector;
        
        if (!fileReport.hasSwitcher) {
            fileReport.issues.push('Não possui seletor de idiomas');
            stats.filesWithoutSwitcher++;
        }
        
        // Verifica se o HTML tem o atributo lang
        const htmlElement = document.querySelector('html');
        if (!htmlElement.hasAttribute('lang')) {
            fileReport.issues.push('Elemento <html> não possui atributo lang');
        }
        
        // Verifica se o script de troca de idiomas está incluído
        const hasLanguageSwitcherScript = Array.from(document.querySelectorAll('script')).some(
            script => script.src && (
                script.src.includes('language-switcher.js') ||
                script.src.includes('scripts/i18n/language-switcher.js')
            )
        );
        
        if (!hasLanguageSwitcherScript) {
            fileReport.issues.push('Script de troca de idiomas não incluído');
        }
        
        // Obtém todos os nós de texto visíveis
        const textNodes = getVisibleTextNodesInDocument(document);
        fileReport.totalTextNodes = textNodes.length;
        stats.totalTextNodes += textNodes.length;
        
        // Verifica cada nó de texto
        const nonSwitchableNodes = [];
        
        textNodes.forEach(node => {
            const text = node.textContent.trim();
            if (!text) return;  // Ignora nós vazios
            
            // Verifica se o nó está dentro de um elemento com classes de idioma ou data-i18n
            const isInLanguageElement = isNodeInLanguageElement(node);
            
            if (isInLanguageElement) {
                fileReport.switchableNodes++;
                stats.properlySwitchableNodes++;
                
                // Se estiver usando data-i18n, verifica se a chave existe nos arquivos de tradução
                const parent = node.parentElement;
                if (parent && parent.hasAttribute('data-i18n')) {
                    const key = parent.getAttribute('data-i18n');
                    
                    const missingInEn = translations.en && !translations.en[key];
                    const missingInPt = translations.pt && !translations.pt[key];
                    
                    if (missingInEn || missingInPt) {
                        const missingIn = [];
                        if (missingInEn) missingIn.push('en');
                        if (missingInPt) missingIn.push('pt');
                        
                        fileReport.missingTranslationKeys.push({
                            key,
                            missingIn,
                            text
                        });
                        
                        stats.missingTranslationKeys++;
                    }
                }
            } else {
                fileReport.nonSwitchableNodes++;
                stats.nonSwitchableNodes++;
                
                // Encontra o elemento pai mais próximo para referência
                const parentElement = findClosestVisibleParent(node);
                const elementPath = getNodePath(parentElement);
                
                nonSwitchableNodes.push({
                    text,
                    element: elementPath,
                    node
                });
            }
        });
        
        // Adiciona detalhes sobre nós não alternáveis ao relatório
        if (nonSwitchableNodes.length > 0) {
            fileReport.nonSwitchableDetails = nonSwitchableNodes
                .map(item => `"${truncateText(item.text, 50)}" em ${item.element}`)
                .slice(0, 10);  // Limita a 10 itens para evitar relatórios muito longos
            
            if (nonSwitchableNodes.length > 10) {
                fileReport.nonSwitchableDetails.push(`... e mais ${nonSwitchableNodes.length - 10} itens`);
            }
        }
        
        // Atualiza as estatísticas do arquivo
        if (fileReport.nonSwitchableNodes === 0 && fileReport.issues.length === 0) {
            stats.compliantFiles++;
        } else {
            stats.nonCompliantFiles++;
        }
        
        // Adiciona o relatório do arquivo ao relatório geral
        stats.filesReport.push(fileReport);
        
        console.log(
            fileReport.nonSwitchableNodes === 0 
                ? chalk.green(`✓ ${fileReport.switchableNodes}/${fileReport.totalTextNodes} nós OK`)
                : chalk.yellow(`⚠️ ${fileReport.nonSwitchableNodes}/${fileReport.totalTextNodes} nós não alternáveis`)
        );
    } catch (error) {
        console.error(chalk.red(`❌ Erro ao analisar ${filePath}:`), error);
        
        stats.filesReport.push({
            file: path.relative(config.htmlDir, filePath),
            error: error.message
        });
    }
}

/**
 * Obtém todos os nós de texto visíveis em um documento
 * @param {Document} document O documento a ser verificado
 * @returns {Array} Array de nós de texto visíveis
 */
function getVisibleTextNodesInDocument(document) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        document.body,
        4,  // NodeFilter.SHOW_TEXT
        {
            acceptNode: function(node) {
                // Simplificado para JSDOM, que não tem getComputedStyle
                const parent = node.parentElement;
                
                // Ignora nós vazios ou apenas com espaços
                if (!node.textContent.trim()) {
                    return 2;  // NodeFilter.FILTER_REJECT
                }
                
                // Ignora nós em elementos de script, estilo, etc.
                if (parent) {
                    const tagName = parent.tagName.toLowerCase();
                    if (['script', 'style', 'noscript', 'template'].includes(tagName)) {
                        return 2;  // NodeFilter.FILTER_REJECT
                    }
                    
                    // Ignora elementos com display:none ou visibility:hidden
                    // Nota: JSDOM não processa CSS, então isso é aproximado
                    if (parent.hasAttribute('hidden') || 
                        parent.style.display === 'none' ||
                        parent.style.visibility === 'hidden') {
                        return 2;  // NodeFilter.FILTER_REJECT
                    }
                }
                
                return 1;  // NodeFilter.FILTER_ACCEPT
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
 * Verifica se um nó está dentro de um elemento com classes de idioma ou data-i18n
 * @param {Node} node O nó a ser verificado
 * @returns {boolean} Verdadeiro se o nó estiver dentro de um elemento com classes de idioma
 */
function isNodeInLanguageElement(node) {
    let parent = node.parentNode;
    
    while (parent && parent.nodeType === 1) {  // Element node
        // Verifica classes de idioma
        if (parent.classList) {
            if (parent.classList.contains('lang-en') || parent.classList.contains('lang-pt')) {
                return true;
            }
        }
        
        // Verifica atributos data-i18n
        if (parent.hasAttribute('data-i18n') || 
            parent.hasAttribute('data-i18n-placeholder') || 
            parent.hasAttribute('data-i18n-title')) {
            return true;
        }
        
        parent = parent.parentNode;
    }
    
    return false;
}

/**
 * Encontra o elemento pai visível mais próximo
 * @param {Node} node O nó de texto
 * @returns {Element} O elemento pai mais próximo
 */
function findClosestVisibleParent(node) {
    let parent = node.parentNode;
    
    // Se o nó não tiver um pai, retorna o próprio nó
    if (!parent || parent.nodeType !== 1) {
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
    if (!element || element.nodeType !== 1) {
        return 'texto';
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
 * Gera o relatório em markdown
 */
function generateReport() {
    console.log(chalk.cyan('📊 Gerando relatório...'));
    
    // Calcula estatísticas
    const compliantPercentage = stats.totalFiles > 0
        ? Math.round((stats.compliantFiles / stats.totalFiles) * 100)
        : 0;
        
    const switchablePercentage = stats.totalTextNodes > 0
        ? Math.round((stats.properlySwitchableNodes / stats.totalTextNodes) * 100)
        : 0;
    
    // Constrói o relatório em markdown
    let report = `# Relatório do Sistema de Idiomas - RUNES Analytics Pro

Relatório gerado em ${new Date().toLocaleString()}

## Resumo

- **Arquivos HTML:** ${stats.totalFiles}
- **Arquivos verificados:** ${stats.scannedFiles}
- **Arquivos conformes:** ${stats.compliantFiles} (${compliantPercentage}%)
- **Arquivos não conformes:** ${stats.nonCompliantFiles}
- **Arquivos sem seletor de idiomas:** ${stats.filesWithoutSwitcher}
- **Total de nós de texto:** ${stats.totalTextNodes}
- **Nós alternáveis:** ${stats.properlySwitchableNodes} (${switchablePercentage}%)
- **Nós não alternáveis:** ${stats.nonSwitchableNodes}
- **Chaves de tradução ausentes:** ${stats.missingTranslationKeys}

## Arquivos com Problemas

`;
    
    // Adiciona detalhes dos arquivos não conformes
    const nonCompliantFiles = stats.filesReport.filter(file => 
        file.nonSwitchableNodes > 0 || file.issues.length > 0 || file.error
    );
    
    if (nonCompliantFiles.length > 0) {
        nonCompliantFiles.forEach(file => {
            report += `### ${file.file}\n\n`;
            
            if (file.error) {
                report += `- ❌ **Erro:** ${file.error}\n\n`;
                return;
            }
            
            // Problemas gerais
            if (file.issues.length > 0) {
                report += `- **Problemas:**\n`;
                file.issues.forEach(issue => {
                    report += `  - ${issue}\n`;
                });
                report += '\n';
            }
            
            // Estatísticas
            report += `- **Estatísticas:** ${file.switchableNodes}/${file.totalTextNodes} nós alternáveis (${Math.round((file.switchableNodes / file.totalTextNodes) * 100)}% conformidade)\n\n`;
            
            // Nós não alternáveis
            if (file.nonSwitchableNodes > 0 && file.nonSwitchableDetails) {
                report += `- **Exemplos de textos não alternáveis:**\n`;
                file.nonSwitchableDetails.forEach(detail => {
                    report += `  - ${detail}\n`;
                });
                report += '\n';
            }
            
            // Chaves de tradução ausentes
            if (file.missingTranslationKeys.length > 0) {
                report += `- **Chaves de tradução ausentes:**\n`;
                file.missingTranslationKeys.forEach(item => {
                    report += `  - \`${item.key}\` (faltando em: ${item.missingIn.join(', ')}): "${truncateText(item.text, 30)}"\n`;
                });
                report += '\n';
            }
        });
    } else {
        report += '✓ Nenhum arquivo com problemas encontrado!\n\n';
    }
    
    // Adiciona informações dos arquivos de tradução
    report += `## Arquivos de Tradução\n\n`;
    
    if (translations.en && translations.pt) {
        const enKeys = Object.keys(translations.en);
        const ptKeys = Object.keys(translations.pt);
        
        const missingInPt = enKeys.filter(key => !ptKeys.includes(key));
        const missingInEn = ptKeys.filter(key => !enKeys.includes(key));
        
        report += `- **en.json:** ${enKeys.length} chaves\n`;
        report += `- **pt.json:** ${ptKeys.length} chaves\n\n`;
        
        if (missingInPt.length > 0) {
            report += `### Chaves presentes em en.json mas ausentes em pt.json (${missingInPt.length})\n\n`;
            missingInPt.forEach(key => {
                report += `- \`${key}\`: "${truncateText(translations.en[key], 50)}"\n`;
            });
            report += '\n';
        }
        
        if (missingInEn.length > 0) {
            report += `### Chaves presentes em pt.json mas ausentes em en.json (${missingInEn.length})\n\n`;
            missingInEn.forEach(key => {
                report += `- \`${key}\`: "${truncateText(translations.pt[key], 50)}"\n`;
            });
            report += '\n';
        }
    } else {
        report += '❌ Não foi possível analisar os arquivos de tradução\n\n';
    }
    
    // Adiciona recomendações
    report += `## Recomendações\n\n`;
    
    if (stats.nonSwitchableNodes > 0) {
        report += `1. Adicione classes \`lang-en\` e \`lang-pt\` aos elementos com texto fixo ou use atributos \`data-i18n\` com chaves de tradução\n`;
    }
    
    if (stats.filesWithoutSwitcher > 0) {
        report += `2. Adicione o componente de seleção de idiomas a todas as páginas\n`;
    }
    
    if (stats.missingTranslationKeys > 0) {
        report += `3. Adicione as chaves de tradução ausentes aos arquivos de tradução\n`;
    }
    
    // Salva o relatório
    fs.writeFileSync(config.outputFile, report);
    console.log(chalk.green(`✓ Relatório salvo em ${config.outputFile}`));
}

/**
 * Função principal
 */
function main() {
    console.log(chalk.green.bold('🌐 Verificador do Sistema de Idiomas - RUNES Analytics Pro'));
    console.log(chalk.cyan('Iniciando análise...'));
    
    // Carrega as traduções
    loadTranslations();
    
    // Encontra todos os arquivos HTML
    const htmlFiles = findHtmlFiles(config.htmlDir);
    console.log(chalk.cyan(`📂 Encontrados ${htmlFiles.length} arquivos HTML`));
    
    // Verifica cada arquivo
    htmlFiles.forEach(checkHtmlFile);
    
    // Gera o relatório
    generateReport();
    
    // Exibe o resumo
    console.log(chalk.green.bold('\n📋 Resumo:'));
    console.log(chalk.cyan(`Total de arquivos: ${stats.totalFiles}`));
    console.log(chalk.cyan(`Arquivos verificados: ${stats.scannedFiles}`));
    console.log(
        stats.compliantFiles === stats.totalFiles
            ? chalk.green(`✓ Todos os ${stats.compliantFiles} arquivos estão em conformidade`)
            : chalk.yellow(`⚠️ ${stats.nonCompliantFiles}/${stats.totalFiles} arquivos não estão em conformidade`)
    );
    
    console.log(chalk.cyan(`Total de nós de texto: ${stats.totalTextNodes}`));
    console.log(
        stats.nonSwitchableNodes === 0
            ? chalk.green(`✓ Todos os ${stats.properlySwitchableNodes} nós estão alternáveis`)
            : chalk.yellow(`⚠️ ${stats.nonSwitchableNodes}/${stats.totalTextNodes} nós não são alternáveis`)
    );
    
    console.log(chalk.green.bold('\n✅ Análise concluída!'));
}

// Executa a verificação
main(); 
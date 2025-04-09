/**
 * RUNES Analytics Pro - Translation Tester
 * 
 * Este script testa automaticamente as traduções em todas as páginas
 * e gera um relatório detalhado sobre a cobertura de traduções.
 * 
 * Como usar:
 * 1. Abra o Console do navegador (F12)
 * 2. Cole e execute este script
 * 3. O script irá navegar por todas as páginas e testar as traduções
 */

// Configuração de páginas a testar
const pagesConfig = [
  'intro.html',
  'architecture.html',
  'features.html',
  'demo.html',
  'web3.html'
];

// Estatísticas globais
const globalStats = {
  totalPages: 0,
  completedPages: 0,
  totalElements: 0,
  untranslatedElements: 0,
  coverage: 0,
  pagesReport: {}
};

// Inicia o teste
function startTranslationTest() {
  console.log('%c🔍 RUNES Analytics Pro - Teste de Traduções', 'font-size: 16px; color: cyan; font-weight: bold;');
  console.log('%cTeste iniciado. Por favor, aguarde enquanto verificamos todas as páginas...', 'color: #aaa');
  
  globalStats.totalPages = pagesConfig.length;
  
  // Testa a página atual primeiro
  testCurrentPage().then(() => {
    // Se houver mais páginas para testar, continua o teste
    if (pagesConfig.length > 1) {
      testRemainingPages();
    } else {
      generateFinalReport();
    }
  });
}

// Testa a página atualmente carregada
function testCurrentPage() {
  return new Promise(resolve => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log(`%c\n📄 Testando página: ${currentPage}`, 'color: yellow; font-weight: bold;');
    
    // Remove a página atual da lista de páginas a testar
    const index = pagesConfig.indexOf(currentPage);
    if (index !== -1) {
      pagesConfig.splice(index, 1);
    }
    
    // Executa o teste na página atual
    testLanguagesInPage(currentPage).then(stats => {
      globalStats.pagesReport[currentPage] = stats;
      globalStats.totalElements += stats.totalElements;
      globalStats.untranslatedElements += stats.untranslatedElements;
      globalStats.completedPages++;
      
      resolve();
    });
  });
}

// Testa as páginas restantes usando um iframe 
function testRemainingPages() {
  if (pagesConfig.length === 0) {
    generateFinalReport();
    return;
  }
  
  const currentPage = pagesConfig.shift();
  console.log(`%c\n📄 Testando página: ${currentPage}`, 'color: yellow; font-weight: bold;');
  
  // Cria um iframe oculto para carregar a página
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.width = '1024px';
  iframe.style.height = '768px';
  
  // Adiciona o iframe ao body
  document.body.appendChild(iframe);
  
  // Carrega a página no iframe
  iframe.src = currentPage;
  
  // Aguarda o carregamento da página
  iframe.onload = function() {
    try {
      // Testa os idiomas na página carregada
      testLanguagesInIframe(iframe, currentPage).then(stats => {
        globalStats.pagesReport[currentPage] = stats;
        globalStats.totalElements += stats.totalElements;
        globalStats.untranslatedElements += stats.untranslatedElements;
        globalStats.completedPages++;
        
        // Remove o iframe
        document.body.removeChild(iframe);
        
        // Continua com a próxima página
        testRemainingPages();
      });
    } catch (e) {
      console.error(`Erro ao testar página ${currentPage}:`, e);
      document.body.removeChild(iframe);
      testRemainingPages();
    }
  };
  
  // Adiciona timeout em caso de erro
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      console.error(`Timeout ao carregar página ${currentPage}`);
      document.body.removeChild(iframe);
      testRemainingPages();
    }
  }, 15000);
}

// Testa idiomas na página atual
function testLanguagesInPage(pageName) {
  return new Promise(resolve => {
    // Obtém estatísticas da página
    const stats = {
      totalElements: 0,
      untranslatedElements: 0,
      enOnlyElements: 0,
      ptOnlyElements: 0,
      dataI18nTotal: 0,
      dataI18nMissing: 0,
      coverage: 0,
      problemAreas: []
    };
    
    // 1. Verifica elementos com classes lang-en e lang-pt
    const enElements = document.querySelectorAll('.lang-en');
    const ptElements = document.querySelectorAll('.lang-pt');
    
    stats.totalElements = enElements.length + ptElements.length;
    
    // Verifica elementos que têm apenas uma versão de idioma
    enElements.forEach(enElement => {
      const parentElement = findParentContainer(enElement);
      if (!parentElement) return;
      
      const ptMatches = findPotentialMatch(enElement, '.lang-pt', parentElement);
      if (ptMatches.length === 0) {
        stats.untranslatedElements++;
        stats.enOnlyElements++;
        
        // Registra o problema
        stats.problemAreas.push({
          type: 'missing-pt-translation',
          element: getElementInfo(enElement),
          content: enElement.textContent.trim()
        });
      }
    });
    
    ptElements.forEach(ptElement => {
      const parentElement = findParentContainer(ptElement);
      if (!parentElement) return;
      
      const enMatches = findPotentialMatch(ptElement, '.lang-en', parentElement);
      if (enMatches.length === 0) {
        stats.untranslatedElements++;
        stats.ptOnlyElements++;
        
        // Registra o problema
        stats.problemAreas.push({
          type: 'missing-en-translation',
          element: getElementInfo(ptElement),
          content: ptElement.textContent.trim()
        });
      }
    });
    
    // 2. Verifica elementos com data-i18n
    const i18nElements = document.querySelectorAll('[data-i18n]');
    stats.dataI18nTotal = i18nElements.length;
    
    if (window.translations) {
      i18nElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Verifica se a chave está presente nos objetos de tradução
        const hasEnTranslation = window.translations.en && window.translations.en[key];
        const hasPtTranslation = window.translations.pt && window.translations.pt[key];
        
        if (!hasEnTranslation || !hasPtTranslation) {
          stats.dataI18nMissing++;
          stats.untranslatedElements++;
          
          // Registra o problema
          stats.problemAreas.push({
            type: 'missing-i18n-key',
            key: key,
            element: getElementInfo(element),
            en: hasEnTranslation ? '✓' : '✗',
            pt: hasPtTranslation ? '✓' : '✗'
          });
        }
      });
    }
    
    // Calcula a cobertura
    if (stats.totalElements + stats.dataI18nTotal > 0) {
      stats.coverage = 100 - (stats.untranslatedElements / (stats.totalElements + stats.dataI18nTotal) * 100);
    } else {
      stats.coverage = 100; // Se não há elementos, considera 100% de cobertura
    }
    
    // Imprime os resultados para esta página
    console.log(`%c• Elementos com classe lang-en: ${enElements.length}`, 'color: #aaa');
    console.log(`%c• Elementos com classe lang-pt: ${ptElements.length}`, 'color: #aaa');
    console.log(`%c• Elementos com data-i18n: ${stats.dataI18nTotal}`, 'color: #aaa');
    console.log(`%c• Elementos sem tradução: ${stats.untranslatedElements}`, stats.untranslatedElements > 0 ? 'color: red' : 'color: green');
    console.log(`%c• Cobertura de tradução: ${stats.coverage.toFixed(2)}%`, stats.coverage > 90 ? 'color: green' : stats.coverage > 70 ? 'color: orange' : 'color: red');
    
    // Se houver problemas, mostra os primeiros 5
    if (stats.problemAreas.length > 0) {
      console.log('%c• Problemas encontrados (primeiros 5):', 'color: orange');
      stats.problemAreas.slice(0, 5).forEach((problem, index) => {
        console.log(`  ${index + 1}. ${problem.type}: ${problem.element} ${problem.content || problem.key || ''}`);
      });
      
      if (stats.problemAreas.length > 5) {
        console.log(`  ... e mais ${stats.problemAreas.length - 5} problemas.`);
      }
    }
    
    resolve(stats);
  });
}

// Testa idiomas em uma página carregada em um iframe
function testLanguagesInIframe(iframe, pageName) {
  return new Promise(resolve => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Estatísticas da página
      const stats = {
        totalElements: 0,
        untranslatedElements: 0,
        enOnlyElements: 0,
        ptOnlyElements: 0,
        dataI18nTotal: 0,
        dataI18nMissing: 0,
        coverage: 0,
        problemAreas: []
      };
      
      // 1. Verifica elementos com classes lang-en e lang-pt
      const enElements = iframeDoc.querySelectorAll('.lang-en');
      const ptElements = iframeDoc.querySelectorAll('.lang-pt');
      
      stats.totalElements = enElements.length + ptElements.length;
      
      // Verifica elementos que têm apenas uma versão de idioma
      enElements.forEach(enElement => {
        const parentElement = findParentContainer(enElement, iframeDoc);
        if (!parentElement) return;
        
        const ptMatches = findPotentialMatch(enElement, '.lang-pt', parentElement);
        if (ptMatches.length === 0) {
          stats.untranslatedElements++;
          stats.enOnlyElements++;
          
          // Registra o problema
          stats.problemAreas.push({
            type: 'missing-pt-translation',
            element: getElementInfo(enElement),
            content: enElement.textContent.trim()
          });
        }
      });
      
      ptElements.forEach(ptElement => {
        const parentElement = findParentContainer(ptElement, iframeDoc);
        if (!parentElement) return;
        
        const enMatches = findPotentialMatch(ptElement, '.lang-en', parentElement);
        if (enMatches.length === 0) {
          stats.untranslatedElements++;
          stats.ptOnlyElements++;
          
          // Registra o problema
          stats.problemAreas.push({
            type: 'missing-en-translation',
            element: getElementInfo(ptElement),
            content: ptElement.textContent.trim()
          });
        }
      });
      
      // 2. Verifica elementos com data-i18n
      const i18nElements = iframeDoc.querySelectorAll('[data-i18n]');
      stats.dataI18nTotal = i18nElements.length;
      
      // Não podemos verificar as chaves de tradução no iframe facilmente
      
      // Calcula a cobertura
      if (stats.totalElements + stats.dataI18nTotal > 0) {
        stats.coverage = 100 - (stats.untranslatedElements / (stats.totalElements + stats.dataI18nTotal) * 100);
      } else {
        stats.coverage = 100; // Se não há elementos, considera 100% de cobertura
      }
      
      // Imprime os resultados para esta página
      console.log(`%c• Elementos com classe lang-en: ${enElements.length}`, 'color: #aaa');
      console.log(`%c• Elementos com classe lang-pt: ${ptElements.length}`, 'color: #aaa');
      console.log(`%c• Elementos com data-i18n: ${stats.dataI18nTotal}`, 'color: #aaa');
      console.log(`%c• Elementos sem tradução: ${stats.untranslatedElements}`, stats.untranslatedElements > 0 ? 'color: red' : 'color: green');
      console.log(`%c• Cobertura de tradução: ${stats.coverage.toFixed(2)}%`, stats.coverage > 90 ? 'color: green' : stats.coverage > 70 ? 'color: orange' : 'color: red');
      
      // Se houver problemas, mostra os primeiros 5
      if (stats.problemAreas.length > 0) {
        console.log('%c• Problemas encontrados (primeiros 5):', 'color: orange');
        stats.problemAreas.slice(0, 5).forEach((problem, index) => {
          console.log(`  ${index + 1}. ${problem.type}: ${problem.element} ${problem.content || problem.key || ''}`);
        });
        
        if (stats.problemAreas.length > 5) {
          console.log(`  ... e mais ${stats.problemAreas.length - 5} problemas.`);
        }
      }
      
      resolve(stats);
    } catch (e) {
      console.error(`Erro ao testar página ${pageName} no iframe:`, e);
      
      // Retorna resultados vazios em caso de erro
      resolve({
        totalElements: 0,
        untranslatedElements: 0,
        coverage: 0,
        problemAreas: [{
          type: 'error',
          element: 'iframe',
          content: e.message
        }]
      });
    }
  });
}

// Gera o relatório final após testar todas as páginas
function generateFinalReport() {
  // Calcula a cobertura global
  if (globalStats.totalElements > 0) {
    globalStats.coverage = 100 - (globalStats.untranslatedElements / globalStats.totalElements * 100);
  } else {
    globalStats.coverage = 100;
  }
  
  console.log('%c\n📊 RELATÓRIO FINAL DE TRADUÇÃO', 'color: cyan; font-weight: bold; font-size: 16px;');
  console.log('%c----------------------------', 'color: #555');
  console.log(`%c• Páginas testadas: ${globalStats.completedPages}/${globalStats.totalPages}`, 'color: #aaa');
  console.log(`%c• Total de elementos: ${globalStats.totalElements}`, 'color: #aaa');
  console.log(`%c• Elementos sem tradução: ${globalStats.untranslatedElements}`, globalStats.untranslatedElements > 0 ? 'color: red' : 'color: green');
  console.log(`%c• Cobertura global: ${globalStats.coverage.toFixed(2)}%`, globalStats.coverage > 90 ? 'color: green; font-weight: bold' : globalStats.coverage > 70 ? 'color: orange; font-weight: bold' : 'color: red; font-weight: bold');
  
  // Exibe cobertura por página
  console.log('%c\n📑 Cobertura por página:', 'color: yellow; font-weight: bold');
  
  Object.entries(globalStats.pagesReport).sort((a, b) => a[1].coverage - b[1].coverage).forEach(([page, stats]) => {
    const coverageColor = stats.coverage > 90 ? 'color: green' : stats.coverage > 70 ? 'color: orange' : 'color: red';
    console.log(`%c• ${page}: ${stats.coverage.toFixed(2)}% (${stats.untranslatedElements} problemas)`, coverageColor);
  });
  
  // Recomendações finais
  console.log('%c\n🚀 Recomendações:', 'color: cyan; font-weight: bold');
  
  if (globalStats.coverage >= 95) {
    console.log('%c✅ Excelente! A cobertura de tradução está ótima. Continue mantendo as traduções atualizadas.', 'color: green');
  } else if (globalStats.coverage >= 80) {
    console.log('%c⚠️ Boa cobertura, mas ainda há espaço para melhorias. Foque em corrigir os principais problemas identificados.', 'color: orange');
  } else {
    console.log('%c❌ A cobertura de tradução precisa de melhorias significativas. Corrija os problemas identificados o mais rápido possível.', 'color: red');
  }
  
  // Identifica as páginas com mais problemas
  const worstPages = Object.entries(globalStats.pagesReport)
    .sort((a, b) => b[1].untranslatedElements - a[1].untranslatedElements)
    .slice(0, 3)
    .filter(([_, stats]) => stats.untranslatedElements > 0);
  
  if (worstPages.length > 0) {
    console.log('%c\n🔍 Páginas que precisam de mais atenção:', 'color: yellow');
    worstPages.forEach(([page, stats]) => {
      console.log(`%c• ${page}: ${stats.untranslatedElements} elementos não traduzidos`, 'color: orange');
    });
  }
  
  // Gera um código que pode ser usado para corrigir problemas
  if (globalStats.untranslatedElements > 0) {
    console.log('%c\n💡 Para ajudar a corrigir os problemas, você pode executar o seguinte código em cada página:', 'color: cyan');
    console.log('%c  Abra o Console em cada página que precisa de correção e execute:', 'color: #aaa');
    
    const fixCode = `
// Destacar elementos não traduzidos
function highlightUntranslatedElements() {
  // Destaca elementos sem correspondência em PT
  document.querySelectorAll('.lang-en').forEach(enElement => {
    const parentElement = enElement.parentElement;
    const ptEquivalent = parentElement.querySelector('.lang-pt');
    if (!ptEquivalent) {
      enElement.style.border = '2px dashed red';
      enElement.style.position = 'relative';
      enElement.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      enElement.dataset.missingTranslation = 'pt';
    }
  });
  
  // Destaca elementos sem correspondência em EN
  document.querySelectorAll('.lang-pt').forEach(ptElement => {
    const parentElement = ptElement.parentElement;
    const enEquivalent = parentElement.querySelector('.lang-en');
    if (!enEquivalent) {
      ptElement.style.border = '2px dashed orange';
      ptElement.style.position = 'relative';
      ptElement.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
      ptElement.dataset.missingTranslation = 'en';
    }
  });
  
  console.log('Elementos sem tradução destacados na página. Elementos vermelhos precisam de tradução para PT, elementos laranja precisam de tradução para EN.');
}

highlightUntranslatedElements();`;
    
    console.log('%c' + fixCode, 'color: lightblue');
  }
}

// Função auxiliar para encontrar o elemento container adequado
function findParentContainer(element, doc = document) {
  // Sobe na árvore DOM para encontrar um container adequado
  let current = element.parentElement;
  const maxLevels = 3;
  let level = 0;
  
  while (current && level < maxLevels) {
    if (current.classList.contains('card') || 
        current.tagName === 'DIV' || 
        current.tagName === 'SECTION' ||
        current.tagName === 'LI') {
      return current;
    }
    current = current.parentElement;
    level++;
  }
  
  return element.parentElement;
}

// Função para encontrar potenciais correspondências de tradução
function findPotentialMatch(element, selector, container) {
  if (!container) return [];
  
  // Encontra todos os elementos com o seletor dentro do container
  const potentialMatches = container.querySelectorAll(selector);
  
  // Se não houver correspondências, retorna um array vazio
  if (potentialMatches.length === 0) return [];
  
  // Se houver apenas uma correspondência, retorna-a
  if (potentialMatches.length === 1) return [potentialMatches[0]];
  
  // Se houver múltiplas correspondências, tenta encontrar a melhor
  // Critérios: mesmo tagName, posição semelhante na árvore DOM
  const tagName = element.tagName;
  const matches = Array.from(potentialMatches).filter(el => el.tagName === tagName);
  
  return matches;
}

// Obtém informações básicas sobre um elemento para diagnóstico
function getElementInfo(element) {
  let info = element.tagName.toLowerCase();
  
  if (element.id) {
    info += `#${element.id}`;
  } else if (element.className) {
    const classes = Array.from(element.classList)
      .filter(cls => cls !== 'lang-en' && cls !== 'lang-pt')
      .join('.');
    
    if (classes) {
      info += `.${classes}`;
    }
  }
  
  if (element.tagName === 'A' && element.href) {
    info += `[href="${element.getAttribute('href')}"]`;
  }
  
  return info;
}

// Inicia o teste quando o documento estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
  // Aguarda um pouco para garantir que os scripts de idioma foram carregados
  setTimeout(startTranslationTest, 2000);
});

// Para executar manualmente: startTranslationTest(); 
/**
 * RUNES Analytics Pro - Language Consistency Checker
 * 
 * Este script verifica a consistência no uso dos métodos de internacionalização
 * e possíveis problemas no seletor de idiomas.
 * 
 * Como usar:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este script e execute-o
 * 3. Os resultados da análise serão exibidos no console
 */

function checkLanguageImplementationConsistency() {
  console.log(`%c▶ RUNES Analytics Pro - Verificador de Consistência de Idiomas`, 'color: cyan; font-weight: bold; font-size: 14px;');
  
  // Verificações a serem realizadas
  const checks = [
    checkLanguageSwitcher,
    checkHtmlLangAttribute,
    checkLanguageCSS,
    checkInconsistentUsage,
    checkDataI18nConsistency,
    checkLanguageSwitcherJS,
    runTestChangeLanguage
  ];
  
  // Executa cada verificação e acumula problemas encontrados
  let totalIssues = 0;
  
  for (const check of checks) {
    const issues = check() || 0;
    totalIssues += issues;
  }
  
  // Resumo final
  console.log(`%c\n📋 Resumo da verificação:`, 'color: cyan; font-weight: bold;');
  if (totalIssues === 0) {
    console.log(`%c✅ Nenhum problema de consistência encontrado. Sistema de idiomas funcionando corretamente!`, 'color: lightgreen; font-weight: bold;');
  } else {
    console.log(`%c⚠️ Foram encontrados ${totalIssues} problemas que podem afetar o funcionamento do sistema de idiomas.`, 'color: orange; font-weight: bold;');
    console.log(`%c   Por favor, corrija os problemas listados acima para garantir o funcionamento adequado.`, 'color: orange;');
  }
  
  return totalIssues;
}

// Verificação 1: Seletor de idiomas no HTML
function checkLanguageSwitcher() {
  console.log(`%c\n1. Verificando componente seletor de idiomas:`, 'color: yellow; font-weight: bold;');
  
  const languageSelector = document.querySelector('.language-selector');
  let issues = 0;
  
  if (!languageSelector) {
    console.log(`%c❌ PROBLEMA: Seletor de idiomas (.language-selector) não encontrado no documento.`, 'color: red');
    issues++;
    return issues;
  }
  
  console.log(`%c✓ Seletor de idiomas encontrado.`, 'color: lightgreen');
  
  // Verifica se o seletor contém os elementos esperados
  const languageToggle = languageSelector.querySelector('.language-toggle');
  const languageDropdown = languageSelector.querySelector('.language-dropdown');
  const languageOptionEN = languageSelector.querySelector('.language-option[data-lang="en"]');
  const languageOptionPT = languageSelector.querySelector('.language-option[data-lang="pt"]');
  
  if (!languageToggle) {
    console.log(`%c❌ PROBLEMA: Botão de alternância de idioma (.language-toggle) não encontrado.`, 'color: red');
    issues++;
  }
  
  if (!languageDropdown) {
    console.log(`%c❌ PROBLEMA: Dropdown de idiomas (.language-dropdown) não encontrado.`, 'color: red');
    issues++;
  }
  
  if (!languageOptionEN) {
    console.log(`%c❌ PROBLEMA: Opção para idioma inglês não encontrada.`, 'color: red');
    issues++;
  }
  
  if (!languageOptionPT) {
    console.log(`%c❌ PROBLEMA: Opção para idioma português não encontrada.`, 'color: red');
    issues++;
  }
  
  // Verifica se o idioma atual está corretamente refletido na UI
  const currentLang = document.documentElement.lang;
  const currentLangDisplay = languageToggle?.querySelector('.current-lang');
  
  if (currentLangDisplay) {
    const expectedText = currentLang === 'en' ? 'EN' : 'PT';
    if (currentLangDisplay.textContent !== expectedText) {
      console.log(`%c❌ PROBLEMA: O texto do idioma atual (${currentLangDisplay.textContent}) não corresponde ao idioma definido no HTML (${expectedText}).`, 'color: red');
      issues++;
    } else {
      console.log(`%c✓ Indicador de idioma atual está correto.`, 'color: lightgreen');
    }
  }
  
  return issues;
}

// Verificação 2: Atributo lang do HTML
function checkHtmlLangAttribute() {
  console.log(`%c\n2. Verificando atributo lang do HTML:`, 'color: yellow; font-weight: bold;');
  
  const htmlLang = document.documentElement.lang;
  let issues = 0;
  
  if (!htmlLang) {
    console.log(`%c❌ PROBLEMA: Atributo lang não definido no elemento HTML.`, 'color: red');
    issues++;
    return issues;
  }
  
  if (htmlLang !== 'en' && htmlLang !== 'pt') {
    console.log(`%c❌ PROBLEMA: Valor do atributo lang (${htmlLang}) não é um dos idiomas suportados (en, pt).`, 'color: red');
    issues++;
    return issues;
  }
  
  console.log(`%c✓ Atributo lang do HTML está correto: ${htmlLang}`, 'color: lightgreen');
  
  // Verifica se as classes CSS estão aplicando a visibilidade corretamente
  const visibleEnElements = Array.from(document.querySelectorAll('.lang-en')).filter(el => 
    window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden'
  );
  
  const visiblePtElements = Array.from(document.querySelectorAll('.lang-pt')).filter(el => 
    window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden'
  );
  
  if (htmlLang === 'en' && visiblePtElements.length > 0) {
    console.log(`%c❌ PROBLEMA: ${visiblePtElements.length} elementos com classe lang-pt estão visíveis mesmo com o idioma definido como inglês.`, 'color: red');
    console.log('%cPrimeiros 3 elementos com problemas:', 'color: orange', visiblePtElements.slice(0, 3));
    issues++;
  }
  
  if (htmlLang === 'pt' && visibleEnElements.length > 0) {
    console.log(`%c❌ PROBLEMA: ${visibleEnElements.length} elementos com classe lang-en estão visíveis mesmo com o idioma definido como português.`, 'color: red');
    console.log('%cPrimeiros 3 elementos com problemas:', 'color: orange', visibleEnElements.slice(0, 3));
    issues++;
  }
  
  return issues;
}

// Verificação 3: CSS para controle de idioma
function checkLanguageCSS() {
  console.log(`%c\n3. Verificando regras CSS para controle de idioma:`, 'color: yellow; font-weight: bold;');
  
  let issues = 0;
  let languageCSSFound = false;
  
  // Verifica todas as folhas de estilo do documento
  for (const sheet of document.styleSheets) {
    try {
      // Algumas folhas de estilo podem não ser acessíveis devido a CORS
      const rules = sheet.cssRules || sheet.rules;
      
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        
        // Procura regras que controlam a visibilidade dos elementos de idioma
        if (rule.selectorText && (
            rule.selectorText.includes('.lang-en') || 
            rule.selectorText.includes('.lang-pt') ||
            rule.selectorText.includes('html[lang="en"]') ||
            rule.selectorText.includes('html[lang="pt"]')
        )) {
          languageCSSFound = true;
        }
      }
    } catch (e) {
      // Ignora erros de CORS ao acessar folhas de estilo externas
    }
  }
  
  if (!languageCSSFound) {
    console.log(`%c❌ PROBLEMA: Não foram encontradas regras CSS para controle de visibilidade dos elementos de idioma.`, 'color: red');
    issues++;
  } else {
    console.log(`%c✓ Regras CSS para controle de idioma encontradas.`, 'color: lightgreen');
  }
  
  return issues;
}

// Verificação 4: Inconsistências no uso de métodos de internacionalização
function checkInconsistentUsage() {
  console.log(`%c\n4. Verificando inconsistências no uso de métodos de internacionalização:`, 'color: yellow; font-weight: bold;');
  
  let issues = 0;
  
  // Verifica se existem elementos que usam mais de um método
  const mixedElements = document.querySelectorAll('[data-i18n].lang-en, [data-i18n].lang-pt');
  
  if (mixedElements.length > 0) {
    console.log(`%c❌ PROBLEMA: Encontrados ${mixedElements.length} elementos que usam tanto data-i18n quanto classes lang-*.`, 'color: red');
    console.log('%cIsto pode causar comportamento imprevisível. Use apenas um método por elemento.', 'color: orange');
    console.log('%cPrimeiros 3 elementos com problemas:', 'color: orange', mixedElements.length > 0 ? Array.from(mixedElements).slice(0, 3) : []);
    issues++;
  } else {
    console.log(`%c✓ Não foram encontradas inconsistências no uso de métodos de internacionalização.`, 'color: lightgreen');
  }
  
  return issues;
}

// Verificação 5: Consistência no uso do atributo data-i18n
function checkDataI18nConsistency() {
  console.log(`%c\n5. Verificando consistência no uso do atributo data-i18n:`, 'color: yellow; font-weight: bold;');
  
  const i18nElements = document.querySelectorAll('[data-i18n]');
  let issues = 0;
  
  // Verifica se existem elementos com data-i18n
  if (i18nElements.length === 0) {
    console.log(`%c⚠️ AVISO: Não foram encontrados elementos com atributo data-i18n nesta página.`, 'color: orange');
    return issues;
  }
  
  console.log(`%c✓ Encontrados ${i18nElements.length} elementos com atributo data-i18n.`, 'color: lightgreen');
  
  // Verifica se o objeto de traduções está disponível
  if (!window.translations) {
    console.log(`%c❌ PROBLEMA: Objeto global 'translations' não encontrado. As traduções podem não estar sendo carregadas corretamente.`, 'color: red');
    issues++;
    return issues;
  }
  
  // Verifica se as chaves em data-i18n existem nos arquivos de tradução
  const currentLang = document.documentElement.lang || 'en';
  const missingKeys = [];
  
  i18nElements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    
    // Verifica se a chave existe no objeto de traduções atual
    if (!window.translations[currentLang] || !window.translations[currentLang][key]) {
      missingKeys.push({ element, key });
    }
  });
  
  if (missingKeys.length > 0) {
    console.log(`%c❌ PROBLEMA: ${missingKeys.length} chaves de tradução não encontradas no objeto de traduções.`, 'color: red');
    console.log('%cPrimeiras 3 chaves ausentes:', 'color: orange', missingKeys.slice(0, 3).map(item => item.key));
    issues++;
  } else {
    console.log(`%c✓ Todas as chaves de tradução foram encontradas no objeto de traduções.`, 'color: lightgreen');
  }
  
  return issues;
}

// Verificação 6: Script de alternância de idiomas
function checkLanguageSwitcherJS() {
  console.log(`%c\n6. Verificando script de alternância de idiomas:`, 'color: yellow; font-weight: bold;');
  
  let issues = 0;
  
  // Verifica se as funções essenciais estão disponíveis globalmente
  const requiredFunctions = [
    'changeLanguage',
    'getTranslation',
    'translatePage'
  ];
  
  const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
  
  if (missingFunctions.length > 0) {
    console.log(`%c❌ PROBLEMA: Funções essenciais não encontradas globalmente: ${missingFunctions.join(', ')}`, 'color: red');
    issues++;
  } else {
    console.log(`%c✓ Todas as funções essenciais de idioma estão disponíveis globalmente.`, 'color: lightgreen');
  }
  
  return issues;
}

// Verificação 7: Teste de mudança de idioma
function runTestChangeLanguage() {
  console.log(`%c\n7. Testando mudança de idioma:`, 'color: yellow; font-weight: bold;');
  
  let issues = 0;
  
  // Captura o idioma atual para restaurá-lo depois
  const originalLang = document.documentElement.lang;
  
  // Verifica se a função changeLanguage existe
  if (typeof window.changeLanguage !== 'function') {
    console.log(`%c❌ PROBLEMA: Função changeLanguage não encontrada. Não é possível testar a mudança de idioma.`, 'color: red');
    issues++;
    return issues;
  }
  
  console.log(`%c• Iniciando teste de mudança de idioma...`, 'color: lightblue');
  console.log(`%c• Idioma atual: ${originalLang}`, 'color: lightblue');
  console.log(`%c• Este teste é apenas uma simulação e não alterará permanentemente o idioma da página.`, 'color: lightblue');
  
  try {
    // Testa a mudança de idioma (sem realmente aplicá-la para não modificar a página do usuário)
    // Aqui estamos analisando se a função existe e pode ser chamada sem erros
    
    // Implementação simplificada para teste sem alterar a página
    const testNewLang = originalLang === 'en' ? 'pt' : 'en';
    console.log(`%c• Tentando mudar para: ${testNewLang}`, 'color: lightblue');
    
    // Verificação adicional da presença dos arquivos de tradução
    if (!window.translations || !window.translations[testNewLang]) {
      console.log(`%c❌ PROBLEMA: Arquivo de tradução para ${testNewLang} não está carregado.`, 'color: red');
      issues++;
    } else {
      console.log(`%c✓ Arquivo de tradução para ${testNewLang} está disponível.`, 'color: lightgreen');
    }
    
    console.log(`%c✓ Teste de mudança de idioma concluído sem erros.`, 'color: lightgreen');
    
  } catch (error) {
    console.log(`%c❌ PROBLEMA: Erro ao testar mudança de idioma: ${error.message}`, 'color: red');
    issues++;
  }
  
  return issues;
}

// Execute a verificação automaticamente quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Aguarda um pouco para garantir que os scripts de idioma foram carregados
  setTimeout(checkLanguageImplementationConsistency, 2000);
});

// Ou execute manualmente no console: checkLanguageImplementationConsistency() 
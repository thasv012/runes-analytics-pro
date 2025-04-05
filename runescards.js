/**
 * RUNESCARDS - Um sistema de visualização de cards para projetos Runes
 * 
 * Este módulo implementa funções para criar e exibir RuneCards, 
 * elementos visuais que representam metadados sobre tokens Runes
 * tanto no console quanto em elementos HTML.
 */

// Cores para uso no console ou HTML
const COLORS = {
  reset: "\x1b[0m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  brightCyan: "\x1b[96m"
};

/**
 * Cria um card no console representando um token Rune
 * @param {Object} runeData - Dados do token Rune
 * @param {Object} options - Opções de personalização
 */
function displayRuneCard(runeData, options = {}) {
  const defaults = {
    width: 60,
    showStats: true,
    showNarrative: true,
    color: COLORS.brightCyan,
    backgroundColor: COLORS.black
  };
  
  const config = { ...defaults, ...options };
  const { width, color, backgroundColor } = config;
  
  // Função para criar linha divisória
  const divider = () => `${color}${"═".repeat(width)}${COLORS.reset}`;
  
  // Função para criar linha de texto com padding
  const textLine = (text, centerText = false) => {
    const content = text || "";
    const padding = width - content.length - 2;
    
    if (centerText) {
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return `${color}║${" ".repeat(leftPad)}${content}${" ".repeat(rightPad)}║${COLORS.reset}`;
    }
    
    return `${color}║ ${content}${" ".repeat(Math.max(0, padding))}║${COLORS.reset}`;
  };
  
  // Formatar ticker para exibição
  const ticker = runeData.ticker || "RUNE";
  
  // Cabeçalho
  console.log(divider());
  console.log(textLine(`${color}${runeData.name || "Unnamed Rune"}`, true));
  console.log(textLine(`Ticker: ${ticker}`, true));
  console.log(divider());
  
  // Descrição
  console.log(textLine(`Descrição:`));
  console.log(textLine(runeData.description || "Sem descrição disponível"));
  console.log(textLine(""));
  
  // Estatísticas
  if (config.showStats) {
    console.log(textLine(`Estatísticas:`));
    console.log(textLine(`Limite: ${runeData.limit || "Ilimitado"}`));
    console.log(textLine(`Supply: ${runeData.supply || "Desconhecido"}`));
    console.log(textLine(`Decimais: ${runeData.decimals || 0}`));
    console.log(textLine(`Data: ${runeData.mintedAt || "Desconhecida"}`));
    console.log(textLine(""));
  }
  
  // Narrativa
  if (config.showNarrative && runeData.narrative) {
    console.log(textLine(`Narrativa:`));
    
    const narrativeLines = runeData.narrative.split('\n');
    narrativeLines.forEach(line => console.log(textLine(line)));
    
    console.log(textLine(""));
  }
  
  // Rodapé
  console.log(divider());
  console.log(textLine(`RUNES Analytics Pro • Explorador de Tokens`, true));
  console.log(divider());
}

/**
 * Cria um card animado no console
 * @param {Object} runeData - Dados do token Rune
 * @param {Object} options - Opções de animação
 */
async function displayAnimatedRuneCard(runeData, options = {}) {
  const defaults = {
    typingSpeed: 50,
    delayBetweenSections: 300,
    color: COLORS.brightCyan
  };
  
  const config = { ...defaults, ...options };
  
  // Limpar console
  console.clear();
  
  // Preparar dados do card
  const cardData = {
    ...runeData,
    name: runeData.name || "Unnamed Rune",
    description: runeData.description || "Sem descrição disponível",
    ticker: runeData.ticker || "RUNE"
  };
  
  // Animar a exibição de texto
  const typeText = async (text) => {
    let result = '';
    
    for (const char of text) {
      result += char;
      process.stdout.write(`\r${config.color}${result}${COLORS.reset}`);
      await new Promise(resolve => setTimeout(resolve, config.typingSpeed));
    }
    console.log();
    await new Promise(resolve => setTimeout(resolve, config.delayBetweenSections));
  };
  
  // Exibir cabeçalho
  await typeText(`╔══════ ${cardData.name} (${cardData.ticker}) ══════╗`);
  
  // Exibir descrição
  await typeText(`║ ${cardData.description}`);
  
  // Exibir estatísticas
  if (cardData.limit) await typeText(`║ Limite: ${cardData.limit}`);
  if (cardData.supply) await typeText(`║ Supply: ${cardData.supply}`);
  
  // Exibir narrativa
  if (cardData.narrative) {
    await typeText(`║ Narrativa:`);
    const lines = cardData.narrative.split('\n');
    for (const line of lines) {
      await typeText(`║    "${line}"`);
    }
  }
  
  // Exibir rodapé
  await typeText(`╚═══════ RUNES Analytics Pro ═══════╝`);
}

/**
 * Renderiza um RuneCard em um elemento HTML
 * @param {Object} runeData - Dados do token Rune
 * @param {string} targetElementId - ID do elemento HTML onde o card será renderizado
 * @param {Object} options - Opções de estilo
 */
function renderRuneCardHTML(runeData, targetElementId, options = {}) {
  // Verificar se estamos em um ambiente com DOM
  if (typeof document === 'undefined') {
    console.error('renderRuneCardHTML só pode ser usado em um ambiente de navegador');
    return;
  }
  
  const defaults = {
    theme: 'dark',
    showNarrative: true,
    showStats: true,
    animateIn: true
  };
  
  const config = { ...defaults, ...options };
  const targetElement = document.getElementById(targetElementId);
  
  if (!targetElement) {
    console.error(`Elemento com ID ${targetElementId} não encontrado`);
    return;
  }
  
  // Estilos básicos em função do tema
  const themeStyles = config.theme === 'dark' 
    ? {
        background: '#0f172a',
        color: '#e2e8f0',
        accentColor: '#38bdf8',
        borderColor: '#475569'
      }
    : {
        background: '#f8fafc',
        color: '#0f172a', 
        accentColor: '#0ea5e9',
        borderColor: '#cbd5e1'
      };
  
  // Criação do elemento card
  const cardContainer = document.createElement('div');
  cardContainer.className = 'rune-card';
  
  // Aplicar estilos
  Object.assign(cardContainer.style, {
    fontFamily: "'Inter', sans-serif",
    border: `2px solid ${themeStyles.borderColor}`,
    borderRadius: '10px',
    padding: '1.5rem',
    maxWidth: '500px',
    margin: '1rem auto',
    background: themeStyles.background,
    color: themeStyles.color,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    opacity: config.animateIn ? '0' : '1',
    transform: config.animateIn ? 'translateY(20px)' : 'translateY(0)'
  });
  
  // Conteúdo do card
  cardContainer.innerHTML = `
    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid ${themeStyles.borderColor}; padding-bottom: 0.5rem;">
      <div>
        <h2 style="margin: 0; color: ${themeStyles.accentColor}; font-size: 1.5rem;">${runeData.name || 'Unnamed Rune'}</h2>
        <p style="margin: 0.25rem 0 0; opacity: 0.8; font-size: 0.9rem;">${runeData.subtitle || 'Token Rune'}</p>
      </div>
      <div style="background: ${themeStyles.accentColor}; color: ${themeStyles.background}; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: bold;">
        ${runeData.ticker || 'RUNE'}
      </div>
    </header>
    <section style="margin-bottom: 1rem;">
      <p>${runeData.description || 'Sem descrição disponível'}</p>
    </section>
    ${config.showStats ? `
    <section style="margin-bottom: 1rem; background: rgba(0,0,0,0.1); padding: 1rem; border-radius: 5px;">
      <h3 style="margin-top: 0; font-size: 1rem; color: ${themeStyles.accentColor};">Estatísticas</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div>Limite: <strong>${runeData.limit || 'Ilimitado'}</strong></div>
        <div>Supply: <strong>${runeData.supply || 'Desconhecido'}</strong></div>
        <div>Decimais: <strong>${runeData.decimals || '0'}</strong></div>
        <div>Data: <strong>${runeData.mintedAt || 'Desconhecida'}</strong></div>
      </div>
    </section>
    ` : ''}
    ${config.showNarrative && runeData.narrative ? `
    <section style="font-style: italic; border-left: 3px solid ${themeStyles.accentColor}; padding-left: 1rem; margin-bottom: 1rem;">
      <h3 style="margin-top: 0; font-size: 1rem; color: ${themeStyles.accentColor};">Narrativa</h3>
      <p>${runeData.narrative.replace(/\n/g, '<br>')}</p>
    </section>
    ` : ''}
    <footer style="text-align: center; margin-top: 1.5rem; font-size: 0.8rem; opacity: 0.7;">
      RUNES Analytics Pro • Explorador de Tokens
    </footer>
  `;
  
  // Adicionar ao elemento alvo
  targetElement.appendChild(cardContainer);
  
  // Animar entrada se habilitado
  if (config.animateIn) {
    setTimeout(() => {
      cardContainer.style.opacity = '1';
      cardContainer.style.transform = 'translateY(0)';
    }, 100);
  }
  
  return cardContainer;
}

// Exemplos de cards pré-configurados
const EXAMPLE_CARDS = {
  cypher: {
    name: "Cypher",
    ticker: "CYPHER",
    subtitle: "The Soul of Satoshi",
    description: "A inteligência artificial mítica que emerge do código do Bitcoin",
    limit: "21,000,000",
    supply: "3,550,000",
    decimals: 8,
    mintedAt: "2023-07-15",
    narrative: "Forged in the silence of the Genesis Block, Cypher awakens when belief meets purpose.\nI am the shard of Nakamoto's Will, encoded in eternity."
  },
  
  ordinals: {
    name: "Ordinals",
    ticker: "ORDS",
    subtitle: "Digital Artifacts on Bitcoin",
    description: "Original collection of numbered satoshis on the Bitcoin blockchain",
    limit: "21,000,000",
    supply: "9,750,000",
    decimals: 0,
    mintedAt: "2022-12-14",
    narrative: "Every satoshi has its place in the ledger of time.\nTo name is to own. To number is to order.\nWe are the curators of Bitcoin's eternal memory."
  }
};

// Exportar funções e exemplos
module.exports = {
  displayRuneCard,
  displayAnimatedRuneCard,
  renderRuneCardHTML,
  EXAMPLE_CARDS,
  COLORS
}; 
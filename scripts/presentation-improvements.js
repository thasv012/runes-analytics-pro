/**
 * RUNES Analytics Pro - Analisador de Apresentação
 * 
 * Este script analisa a apresentação atual e sugere melhorias
 * para responsividade, transições, tipografia e cores.
 */

const fs = require('fs');
const path = require('path');
const { COLORS } = require('../runescards.js');

// Caminho para o arquivo de apresentação
const PRESENTATION_PATH = path.join(process.cwd(), 'apresentacao-runes.html');

/**
 * Analisa o HTML da apresentação e extrai informações
 */
function analisarApresentacao() {
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(PRESENTATION_PATH)) {
      console.error(`${COLORS.red}Erro: O arquivo apresentacao-runes.html não foi encontrado.${COLORS.reset}`);
      return null;
    }
    
    // Ler o conteúdo do arquivo
    const conteudo = fs.readFileSync(PRESENTATION_PATH, 'utf8');
    
    // Extrair informações básicas
    const info = {
      totalSlides: (conteudo.match(/<div class="slide/g) || []).length,
      usaRevealJs: conteudo.includes('reveal.js'),
      temResponsividade: conteudo.includes('@media'),
      temTransicoes: conteudo.includes('@keyframes') || conteudo.includes('transition'),
      temVariaveis: conteudo.includes(':root') || conteudo.includes('var(--'),
      temFonteEspecial: conteudo.includes('@font-face') || (conteudo.match(/font-family:.*?;/g) || []).length > 1,
      tamanhoArquivo: (conteudo.length / 1024).toFixed(2) + ' KB',
      versao: detectarVersao(conteudo)
    };
    
    return {
      arquivo: PRESENTATION_PATH,
      info,
      conteudo
    };
  } catch (error) {
    console.error(`${COLORS.red}Erro ao analisar apresentação:${COLORS.reset}`, error.message);
    return null;
  }
}

/**
 * Detecta a versão da apresentação com base em seu conteúdo
 */
function detectarVersao(conteudo) {
  if (conteudo.includes('reveal.js')) return 'Reveal.js';
  if (conteudo.includes('RUNES Analytics Pro - Apresentação Final')) return 'v1.0';
  return 'Desconhecida';
}

/**
 * Analisa problemas potenciais na apresentação
 */
function encontrarProblemas(analise) {
  if (!analise) return [];
  
  const problemas = [];
  const { conteudo, info } = analise;
  
  // Verificar responsividade
  if (!info.temResponsividade || !conteudo.includes('max-width')) {
    problemas.push({
      tipo: 'responsividade',
      descricao: 'Responsividade limitada para diferentes tamanhos de tela',
      solucao: 'Adicionar regras @media mais abrangentes e containers com max-width'
    });
  }
  
  // Verificar transições
  if (!info.temTransicoes || !conteudo.includes('transition: opacity')) {
    problemas.push({
      tipo: 'transicoes',
      descricao: 'Transições entre slides muito abruptas ou limitadas',
      solucao: 'Implementar transições mais suaves usando CSS transitions ou Reveal.js'
    });
  }
  
  // Verificar tipografia
  if (!info.temFonteEspecial || !conteudo.includes('font-display')) {
    problemas.push({
      tipo: 'tipografia',
      descricao: 'Fontes podem não estar otimizadas para leitura em blocos longos',
      solucao: 'Usar fontes mais legíveis para texto e reservar fontes estilizadas para títulos'
    });
  }
  
  // Verificar cores e contraste
  if (!conteudo.includes('contrast') && !conteudo.includes('rgba(')) {
    problemas.push({
      tipo: 'cores',
      descricao: 'Contraste potencialmente cansativo entre fundo escuro e texto brilhante',
      solucao: 'Introduzir gradientes sutis e melhorar contraste para leitura prolongada'
    });
  }
  
  // Verificar dimensões de imagens
  if (!conteudo.includes('max-width: 100%') || !conteudo.includes('object-fit')) {
    problemas.push({
      tipo: 'imagens',
      descricao: 'Imagens podem não se ajustar corretamente em dispositivos diferentes',
      solucao: 'Usar max-width: 100% e object-fit para preservar proporções'
    });
  }
  
  return problemas;
}

/**
 * Gera recomendações de melhoria para a apresentação
 */
function gerarRecomendacoes(analise, problemas) {
  if (!analise) return [];
  
  const recomendacoes = [
    {
      categoria: 'Layout Responsivo',
      melhorias: [
        'Usar um container principal com max-width e margin: auto',
        'Implementar grid layout para melhor organização em telas grandes',
        'Adicionar regras @media mais granulares (mobile, tablet, desktop, widescreen)',
        'Ajustar tamanho de fonte relativo com unidades rem/em em vez de pixels fixos'
      ],
      codigoExemplo: `
.slide-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 480px) { /* Mobile */
  .slide-title { font-size: 1.8rem; }
}

@media (min-width: 481px) and (max-width: 768px) { /* Tablet */
  .slide-title { font-size: 2.2rem; }
}

@media (min-width: 769px) and (max-width: 1200px) { /* Desktop */
  .slide-title { font-size: 2.8rem; }
}

@media (min-width: 1201px) { /* Widescreen */
  .slide-title { font-size: 3.2rem; }
}
`
    },
    {
      categoria: 'Transições Suaves',
      melhorias: [
        'Implementar Reveal.js para transições profissionais',
        'Adicionar efeitos de fade, slide e zoom entre slides',
        'Animar entrada de elementos em cada slide de forma sequencial',
        'Adicionar transições para estados de hover em elementos interativos'
      ],
      codigoExemplo: `
/* Transições nativas CSS */
.slide {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide.active {
  opacity: 1;
  transform: translateY(0);
}

.slide:not(.active) {
  opacity: 0;
  transform: translateY(50px);
  pointer-events: none;
}

/* Animação de entrada para elementos */
.slide-element {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  transition-delay: calc(var(--index) * 0.1s);
}

.slide.active .slide-element {
  opacity: 1;
  transform: translateY(0);
}
`
    },
    {
      categoria: 'Tipografia Otimizada',
      melhorias: [
        'Usar fontes rúnicas/estilizadas apenas em títulos e elementos de destaque',
        'Implementar fontes de alta legibilidade para blocos de texto (Inter, Roboto, Open Sans)',
        'Ajustar espaçamento de linhas (line-height) para melhor legibilidade',
        'Garantir tamanho mínimo de fonte de 14px para textos em dispositivos móveis'
      ],
      codigoExemplo: `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500;600&display=swap');

:root {
  --font-title: 'Cinzel', serif; /* Fonte estilizada para títulos */
  --font-body: 'Inter', sans-serif; /* Fonte de alta legibilidade para texto */
}

.slide-title {
  font-family: var(--font-title);
  letter-spacing: 0.02em;
}

.slide-text {
  font-family: var(--font-body);
  line-height: 1.6;
  font-weight: 400;
  font-size: clamp(1rem, 2vw, 1.25rem); /* Responsivo */
}
`
    },
    {
      categoria: 'Cores e Contraste',
      melhorias: [
        'Implementar gradientes sutis para fundos em vez de cores sólidas',
        'Ajustar opacidade de elementos para criar profundidade visual',
        'Usar cores complementares para destacar informações importantes',
        'Implementar modo claro/escuro para preferências do usuário'
      ],
      codigoExemplo: `
:root {
  /* Cores base */
  --bg-primary: #0f172a;
  --text-primary: #e2e8f0;
  
  /* Gradientes */
  --gradient-bg: linear-gradient(135deg, #0f172a, #1e293b);
  --gradient-card: linear-gradient(to right, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.05));
  
  /* Cores com opacidade para camadas */
  --overlay-light: rgba(255, 255, 255, 0.05);
  --overlay-medium: rgba(255, 255, 255, 0.1);
  --overlay-dark: rgba(0, 0, 0, 0.3);
}

body {
  background: var(--gradient-bg);
  color: var(--text-primary);
}

.card {
  background: var(--gradient-card);
  backdrop-filter: blur(5px);
}
`
    },
    {
      categoria: 'Imagens Responsivas',
      melhorias: [
        'Usar atributos width/height para evitar layout shifts durante o carregamento',
        'Implementar object-fit para controlar proporções de imagens',
        'Carregar imagens em diferentes resoluções com srcset',
        'Aplicar lazy loading para otimizar performance'
      ],
      codigoExemplo: `
.card-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.runecard {
  max-width: min(600px, 90vw);
  margin: 2rem auto;
}

/* Para imagens de fundo */
.slide {
  background-size: cover;
  background-position: center;
}
`
    }
  ];
  
  return recomendacoes;
}

/**
 * Exibe o relatório de análise no terminal
 */
function exibirRelatorio(analise, problemas, recomendacoes) {
  console.clear();
  
  if (!analise) {
    console.log(`${COLORS.red}Não foi possível analisar a apresentação.${COLORS.reset}`);
    return;
  }
  
  const { info } = analise;
  
  console.log(`
  ${COLORS.cyan}╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║            ANÁLISE: RUNES ANALYTICS PRO                  ║
  ║            APRESENTAÇÃO HTML                             ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝${COLORS.reset}
  
  ${COLORS.yellow}✦ INFORMAÇÕES BÁSICAS${COLORS.reset}
  • Arquivo: ${analise.arquivo}
  • Tamanho: ${info.tamanhoArquivo}
  • Versão detectada: ${info.versao}
  • Total de slides: ${info.totalSlides}
  
  ${COLORS.yellow}✦ TECNOLOGIAS DETECTADAS${COLORS.reset}
  • Usa Reveal.js: ${info.usaRevealJs ? COLORS.green + 'Sim' + COLORS.reset : COLORS.red + 'Não' + COLORS.reset}
  • Tem responsividade: ${info.temResponsividade ? COLORS.green + 'Sim' + COLORS.reset : COLORS.red + 'Não' + COLORS.reset}
  • Tem transições: ${info.temTransicoes ? COLORS.green + 'Sim' + COLORS.reset : COLORS.red + 'Não' + COLORS.reset}
  • Usa variáveis CSS: ${info.temVariaveis ? COLORS.green + 'Sim' + COLORS.reset : COLORS.red + 'Não' + COLORS.reset}
  • Usa fontes especiais: ${info.temFonteEspecial ? COLORS.green + 'Sim' + COLORS.reset : COLORS.red + 'Não' + COLORS.reset}
  `);
  
  if (problemas.length > 0) {
    console.log(`  ${COLORS.yellow}✦ PONTOS DE MELHORIA IDENTIFICADOS${COLORS.reset}`);
    problemas.forEach((problema, index) => {
      console.log(`  ${COLORS.red}${index + 1}.${COLORS.reset} ${problema.tipo.toUpperCase()}: ${problema.descricao}`);
      console.log(`     ${COLORS.green}Solução:${COLORS.reset} ${problema.solucao}\n`);
    });
  } else {
    console.log(`  ${COLORS.green}✓ Nenhum problema grave identificado na apresentação!${COLORS.reset}\n`);
  }
  
  console.log(`  ${COLORS.yellow}✦ RECOMENDAÇÕES PARA UPGRADE VISUAL${COLORS.reset}`);
  recomendacoes.forEach((rec, index) => {
    console.log(`\n  ${COLORS.cyan}${index + 1}. ${rec.categoria}${COLORS.reset}`);
    rec.melhorias.forEach(melhoria => {
      console.log(`     • ${melhoria}`);
    });
  });
  
  console.log(`\n  ${COLORS.yellow}✦ PRÓXIMOS PASSOS RECOMENDADOS${COLORS.reset}
  1. Criar apresentacao-runes-v2.html com as melhorias sugeridas
  2. Considerar migrar para Reveal.js (apresentacao-runes-reveal.html)
  3. Adicionar responsividade avançada para dispositivos móveis
  4. Implementar modo claro/escuro com toggle
  
  ${COLORS.cyan}╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║  "A interface é o espelho da alma do projeto."           ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝${COLORS.reset}
  `);
}

/**
 * Função principal
 */
function main() {
  const analise = analisarApresentacao();
  const problemas = encontrarProblemas(analise);
  const recomendacoes = gerarRecomendacoes(analise, problemas);
  
  exibirRelatorio(analise, problemas, recomendacoes);
}

// Executar script
main(); 
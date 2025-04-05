/**
 * RUNES Analytics Pro - Gerador de Apresentação Reveal.js
 * 
 * Este script cria uma versão da apresentação usando Reveal.js,
 * com efeitos profissionais de transição, navegação avançada e
 * formatação responsiva para todas as telas.
 */

const fs = require('fs');
const path = require('path');
const { COLORS } = require('../runescards.js');

// Caminhos dos arquivos
const ORIGINAL_PATH = path.join(process.cwd(), 'apresentacao-runes.html');
const OUTPUT_PATH = path.join(process.cwd(), 'apresentacao-runes-reveal.html');

/**
 * Extrai o conteúdo dos slides da apresentação original
 */
function extrairConteudoSlides(htmlOriginal) {
  const slides = [];
  
  // Usando regex para capturar o conteúdo entre as tags de slide
  const regex = /<div class="slide.*?" id="slide-\d+">([\s\S]*?)<\/div>\s*<!-- Slide/g;
  let match;
  
  while ((match = regex.exec(htmlOriginal)) !== null) {
    slides.push(match[1].trim());
  }
  
  // Capturar o último slide (especial)
  const ultimoSlideRegex = /<div class="slide" id="slide-8">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="footer">/;
  const ultimoSlide = ultimoSlideRegex.exec(htmlOriginal);
  
  if (ultimoSlide) {
    slides.push(ultimoSlide[1].trim());
  }
  
  return slides;
}

/**
 * Adapta o conteúdo dos slides para o formato do Reveal.js
 */
function adaptarParaRevealJs(slidesOriginais) {
  return slidesOriginais.map((conteudo, index) => {
    // Substituir as classes e elementos para compatibilidade com Reveal.js
    conteudo = conteudo.replace(/<div class="slide-content">/g, '<div class="r-stack">');
    
    // Adicionando atributos de animação do Reveal.js
    conteudo = conteudo.replace(/<h1 class="slide-title/g, '<h1 class="r-fit-text" data-aos="fade-down"');
    conteudo = conteudo.replace(/<h2 class="slide-subtitle/g, '<h2 data-aos="fade-up" data-aos-delay="200"');
    conteudo = conteudo.replace(/<p class="slide-text/g, '<p data-aos="fade-up" data-aos-delay="400"');
    conteudo = conteudo.replace(/<div class="card/g, '<div class="card" data-aos="zoom-in" data-aos-delay="600"');
    conteudo = conteudo.replace(/<ul class="feature-list/g, '<ul class="feature-list" data-aos="fade-left" data-aos-delay="500"');
    
    // Adicionar fragmentos para revelação sequencial em alguns elementos
    if (conteudo.includes('feature-list')) {
      conteudo = conteudo.replace(/<li>/g, '<li class="fragment fade-in">');
    }
    
    // Tratar caso especial do último slide (RuneCard)
    if (index === 7) {
      conteudo = conteudo.replace(
        '<div class="runecard">',
        '<div class="runecard" data-aos="flip-left" data-aos-duration="1500">'
      );
    }
    
    return conteudo;
  });
}

/**
 * Gera o HTML completo da apresentação com Reveal.js
 */
function gerarApresentacaoRevealJs(slidesAdaptados) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RUNES Analytics Pro - Apresentação Premium</title>
  
  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/black.min.css">
  
  <!-- Animate On Scroll -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      /* Cores base */
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --text-primary: #e2e8f0;
      --text-secondary: #94a3b8;
      
      /* Cores de destaque */
      --accent: #38bdf8;
      --accent-secondary: #f59e0b;
      --accent-tertiary: #10b981;
      --highlight: #c026d3;
      
      /* Tipografia */
      --font-title: 'Cinzel', serif;
      --font-body: 'Inter', sans-serif;
      --font-code: 'JetBrains Mono', monospace;
    }
    
    body {
      background: var(--bg-primary);
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.03) 0%, transparent 25%),
        radial-gradient(circle at 90% 80%, rgba(192, 38, 211, 0.03) 0%, transparent 25%);
    }
    
    .reveal {
      font-family: var(--font-body);
      color: var(--text-primary);
    }
    
    .reveal h1, 
    .reveal h2, 
    .reveal h3 {
      font-family: var(--font-title);
      color: var(--accent);
      margin-bottom: 0.6em;
      line-height: 1.2;
    }
    
    .reveal h1 {
      font-size: 2.5em;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    
    .reveal h2 {
      color: var(--accent-secondary);
      font-size: 1.8em;
    }
    
    .reveal p {
      line-height: 1.5;
      margin-bottom: 1em;
    }
    
    .reveal .r-fit-text {
      max-width: 80%;
      margin: 0 auto;
    }
    
    .highlight {
      color: var(--highlight);
      font-weight: 600;
    }
    
    .accent {
      color: var(--accent);
      font-weight: 600;
    }
    
    .accent-secondary {
      color: var(--accent-secondary);
      font-weight: 600;
    }
    
    .accent-tertiary {
      color: var(--accent-tertiary);
      font-weight: 600;
    }
    
    /* Card estilizado */
    .card {
      background: rgba(30, 41, 59, 0.4);
      border-radius: 0.8rem;
      padding: 1.5rem;
      margin: 1.5rem 0;
      border-left: 4px solid var(--accent);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(5px);
    }
    
    /* Feature list */
    .feature-list {
      list-style: none;
      margin: 1rem 0;
      padding-left: 0.5rem;
    }
    
    .feature-list li {
      margin-bottom: 0.8rem;
      display: flex;
      align-items: flex-start;
    }
    
    .feature-list li::before {
      content: "✨";
      margin-right: 0.75rem;
      color: var(--accent);
    }
    
    /* Colunas */
    .columns {
      display: flex;
      gap: 2rem;
      margin: 1.5rem 0;
      width: 100%;
    }
    
    .column {
      flex: 1;
    }
    
    /* Blocos de código */
    .code-block {
      background-color: rgba(15, 23, 42, 0.8);
      padding: 1rem;
      border-radius: 0.5rem;
      font-family: var(--font-code);
      font-size: 0.8em;
      margin: 1rem 0;
      overflow-x: auto;
      text-align: left;
    }
    
    /* RuneCard */
    .runecard {
      background-color: #0d1424;
      border-radius: 1rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-width: 550px;
      margin: 1rem auto;
      border: 1px solid var(--accent);
      box-shadow: 0 0 30px rgba(56, 189, 248, 0.2);
    }
    
    .runecard-header {
      padding: 1.5rem;
      position: relative;
      min-height: 120px;
      background: linear-gradient(to bottom right, rgba(0, 255, 255, 0.2), transparent);
    }
    
    .runecard-title {
      position: relative;
      z-index: 1;
      font-size: 1.8rem;
      margin: 0 0 0.5rem;
      color: #0ff;
      font-family: var(--font-title);
    }
    
    .runecard-subtitle {
      position: relative;
      z-index: 1;
      font-size: 1rem;
      margin: 0;
      color: var(--text-secondary);
    }
    
    .runecard-ticker {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background-color: rgba(13, 20, 36, 0.8);
      color: #0ff;
      padding: 0.5rem 0.75rem;
      border-radius: 0.25rem;
      font-weight: bold;
      font-size: 1.2rem;
      letter-spacing: 1px;
      z-index: 1;
    }
    
    .runecard-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .runecard-narrative {
      padding: 1rem;
      background-color: rgba(30, 41, 59, 0.3);
      border-radius: 0.5rem;
      border-left: 3px solid #0ff;
    }
    
    .narrative-intro {
      font-style: italic;
      margin-bottom: 1rem;
      color: var(--text-secondary);
    }
    
    .narrative-quote {
      font-style: italic;
      color: #0ff;
      text-align: right;
      margin-top: 1rem;
    }
    
    .tribute {
      text-align: center;
      font-size: 1.3em;
      margin-top: 2rem;
      color: var(--text-primary);
      font-style: italic;
    }
    
    /* Estilos responsivos */
    @media (max-width: 768px) {
      .columns {
        flex-direction: column;
      }
      
      .reveal h1 {
        font-size: 2em;
      }
      
      .reveal h2 {
        font-size: 1.5em;
      }
      
      .card {
        padding: 1rem;
      }
    }
    
    /* Menu de navegação */
    .nav-footer {
      position: fixed;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      gap: 0.8rem;
      background: rgba(15, 23, 42, 0.7);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      backdrop-filter: blur(5px);
    }
    
    .nav-button {
      background: none;
      border: 1px solid var(--accent);
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;
    }
    
    .nav-button:hover {
      background-color: var(--accent);
      color: var(--bg-primary);
    }
    
    /* Progress bar customizada */
    .progress {
      height: 5px !important;
      background: linear-gradient(to right, var(--accent), var(--highlight)) !important;
    }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slidesAdaptados.map((conteudo, index) => `
      <section data-transition="slide" data-auto-animate>${conteudo}</section>
      `).join('\n')}
    </div>
  </div>
  
  <!-- Reveal.js Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/plugin/zoom/zoom.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/plugin/notes/notes.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/plugin/search/search.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/plugin/markdown/markdown.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/plugin/highlight/highlight.js"></script>
  
  <!-- AOS Animation Script -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
  
  <script>
    // Inicialização do Reveal.js
    Reveal.initialize({
      hash: true,
      controls: true,
      progress: true,
      center: true,
      slideNumber: 'c/t',
      transition: 'slide',
      backgroundTransition: 'fade',
      overview: true,
      touch: true,
      hideInactiveCursor: true,
      help: true,
      minScale: 0.2,
      maxScale: 1.5,
      plugins: [
        RevealZoom,
        RevealNotes,
        RevealSearch,
        RevealMarkdown,
        RevealHighlight
      ]
    });
    
    // Inicializar AOS para animações
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: true
    });
    
    // Adicionar navegação personalizada
    const navFooter = document.createElement('div');
    navFooter.className = 'nav-footer';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'nav-button';
    prevButton.textContent = 'Anterior';
    prevButton.addEventListener('click', () => Reveal.prev());
    
    const nextButton = document.createElement('button');
    nextButton.className = 'nav-button';
    nextButton.textContent = 'Próximo';
    nextButton.addEventListener('click', () => Reveal.next());
    
    const overviewButton = document.createElement('button');
    overviewButton.className = 'nav-button';
    overviewButton.textContent = 'Visão Geral';
    overviewButton.addEventListener('click', () => Reveal.toggleOverview());
    
    navFooter.appendChild(prevButton);
    navFooter.appendChild(nextButton);
    navFooter.appendChild(overviewButton);
    
    document.body.appendChild(navFooter);
  </script>
</body>
</html>`;

  return html;
}

/**
 * Função principal para gerar a apresentação Reveal.js
 */
function criarApresentacaoRevealJs() {
  try {
    console.log(`${COLORS.yellow}Gerando apresentação com Reveal.js...${COLORS.reset}`);
    
    // Verificar se o arquivo original existe
    if (!fs.existsSync(ORIGINAL_PATH)) {
      console.error(`${COLORS.red}Erro: Arquivo original não encontrado: ${ORIGINAL_PATH}${COLORS.reset}`);
      return false;
    }
    
    // Ler o conteúdo do arquivo original
    const htmlOriginal = fs.readFileSync(ORIGINAL_PATH, 'utf8');
    
    // Extrair conteúdo dos slides
    const slidesOriginais = extrairConteudoSlides(htmlOriginal);
    
    if (slidesOriginais.length === 0) {
      console.error(`${COLORS.red}Erro: Não foi possível extrair os slides do HTML original.${COLORS.reset}`);
      return false;
    }
    
    console.log(`${COLORS.green}✓ Extraídos ${slidesOriginais.length} slides do HTML original.${COLORS.reset}`);
    
    // Adaptar para formato Reveal.js
    const slidesAdaptados = adaptarParaRevealJs(slidesOriginais);
    
    // Gerar HTML do Reveal.js
    const htmlFinal = gerarApresentacaoRevealJs(slidesAdaptados);
    
    // Salvar o novo arquivo
    fs.writeFileSync(OUTPUT_PATH, htmlFinal);
    
    console.log(`${COLORS.green}✓ Apresentação com Reveal.js gerada com sucesso: ${OUTPUT_PATH}${COLORS.reset}`);
    console.log(`${COLORS.yellow}Recursos implementados:${COLORS.reset}`);
    console.log(`  • Framework Reveal.js para apresentações profissionais`);
    console.log(`  • Transições avançadas entre slides (slide, fade, zoom)`);
    console.log(`  • Animações de elementos com AOS (Animate On Scroll)`);
    console.log(`  • Responsividade para todos dispositivos`);
    console.log(`  • Tipografia otimizada e estilos aprimorados`);
    console.log(`  • Navegação gestual e por teclado`);
    console.log(`  • Visão geral de todos os slides (Overview)`);
    console.log(`  • Botões de navegação personalizados`);
    
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Erro ao gerar apresentação Reveal.js:${COLORS.reset}`, error.message);
    return false;
  }
}

// Executar o script
criarApresentacaoRevealJs(); 
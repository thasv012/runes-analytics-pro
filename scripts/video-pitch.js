/**
 * RUNES Analytics Pro - Gerador de Roteiro de Vídeo-Pitch
 * 
 * Este script gera um roteiro detalhado para um vídeo-pitch de 1-2 minutos,
 * incluindo timeline, instruções visuais, narração e detalhes técnicos.
 */

const fs = require('fs');
const path = require('path');
const { COLORS } = require('../runescards.js');

// Configurações do vídeo
const VIDEO_CONFIG = {
  duracao: '1:45', // Duração estimada
  resolucao: '1920x1080',
  fps: 60,
  formatoAudio: '48kHz, Stereo',
  trilhaSugerida: [
    'Hans Zimmer - Time (versão lo-fi)',
    'Vangelis - Blade Runner Blues (remix)',
    'Música original minimal tech com elementos de sintetizador analógico'
  ],
  paleta: {
    primaria: '#00FF41', // Verde matrix/terminal
    secundaria: '#0D0208', // Preto profundo
    destaque: '#FF5722', // Laranja para destaques
    background: '#080808', // Quase preto
    texto: '#E0E0E0' // Branco suave
  }
};

// Estrutura do roteiro
const ROTEIRO = [
  {
    secao: 'ABERTURA MÍSTICA',
    duracao: '0:00 - 0:15',
    visual: `Tela preta. Partículas de luz verde emergem lentamente formando símbolos rúnicos.
Texto aparece letra por letra como digitado: "Nascida do silêncio do Bloco 0... Ela escuta onde o whitepaper termina."
Fade rápido para branco, então revela-se o logo "RUNES Analytics Pro" com efeito glitch digital.`,
    audio: `Começa com silêncio, seguido de som etéreo crescente.
Tom grave de sintetizador.
Som de digitação sutil enquanto o texto aparece.
Beat lo-fi começa suavemente após o logo ser revelado.`,
    notas: `Criar tensão e mistério. A abertura deve sugerir algo antigo (runas) encontrando algo futurista (código).
Estilo visual: Minimalista com elementos de UI de terminal.`
  },
  {
    secao: 'APRESENTAÇÃO EMOCIONAL',
    duracao: '0:15 - 0:35',
    visual: `Transição suave para screenshots da interface.
Dashboard principal com gráficos em movimento, mostrando evolução de tokens Runes.
Zoom em elementos-chave: sistema de favoritos, leaderboard gamificado, alertas de baleias.
Efeito de "digital twin" com dados fluindo entre telas.`,
    audio: `Narrador com voz profunda e ressonante:
"RUNES Analytics Pro não é apenas uma ferramenta... é um oráculo para decifrar o invisível por trás dos tokens que pulsam na blockchain do Bitcoin."
Batida musical aumenta sutilmente de intensidade.`,
    notas: `Mostrar a plataforma como algo vivo, que respira dados.
A UI deve parecer tecnologicamente avançada mas utilizável - não abstrata demais.
Incluir um terminal com comandos sendo executados ao fundo.`
  },
  {
    secao: 'DIFERENCIAIS TÉCNICOS',
    duracao: '0:35 - 0:55',
    visual: `Sequência rápida de recursos técnicos com animações minimalistas.
Palavras-chave emergem e explodem em partículas:
- "Cache Inteligente" (mostrar diagrama de fluxo de cache)
- "APIs Unificadas" (ícones de várias fontes de dados convergindo)
- "Whale Tracking" (silhueta de baleia nadando através de blocos)
- "Simulação de Trades" (interface de simulação com gráfico)
Interface modular sendo reconfigurada em tempo real.`,
    audio: `Narrador continua:
"Cache inteligente. APIs unificadas. Visualização de baleias. Simulação de trades. Tudo modular. Tudo livre."
Intensidade musical atinge pico.
Sons de "whoosh" a cada palavra-chave.`,
    notas: `Ritmo acelerado nesta seção.
Mostrar brevemente código real do projeto.
O terminal ao fundo deve mostrar comandos Node.js e resultados de APIs.`
  },
  {
    secao: 'MOMENTO DE GRATIDÃO',
    duracao: '0:55 - 1:20',
    visual: `Transição para cena escura com partículas de luz formando uma rede neural/blockchain.
Rostos não identificáveis de desenvolvedores/criadores de Bitcoin e Runes aparecem sutilmente entre os nós.
RuneCard especial "Cypher" surge no centro com efeito de ondulação digital.
Card gira lentamente mostrando detalhes, estatísticas e descrição poética.`,
    audio: `Música suaviza. Tom mais emocional.
Narrador com voz mais suave:
"Este projeto nasceu da gratidão. Aos que criaram os Runes, aos que moldaram a rede, aos que ainda acreditam no impossível."
Efeito sonoro etéreo quando o card Cypher aparece.`,
    notas: `Momento mais emocional e lento do vídeo.
Easter egg: Incluir código Morse piscando "Nakamoto" em algum canto.
O card deve ter o estilo visto no RuneCards.js mas com animações extras.`
  },
  {
    secao: 'ENCERRAMENTO',
    duracao: '1:20 - 1:45',
    visual: `Interface principal do RUNES Analytics Pro mostrada em uso real por 5 segundos.
Fade para tela preta.
Texto aparece: "RUNES Analytics Pro. Construído por visionários. Para visionários."
Logo do projeto com efeito de glowing aparece abaixo.
URL do projeto aparece na parte inferior.
Easter egg em ASCII art pequeno: "O que está oculto entre os blocos?"`,
    audio: `Música chega ao clímax final e depois fade out.
Narrador com tom conclusivo:
"RUNES Analytics Pro. Construído por visionários. Para visionários."
Silêncio breve, então som único de sino/cristal quando a URL aparece.`,
    notas: `Final deve ser memorável e deixar sensação de grandiosidade.
A URL deve ser clara e legível.
Última imagem deve permanecer por 3 segundos antes do fade out completo.`
  }
];

/**
 * Formata o roteiro para exibição no terminal
 */
function exibirRoteiro() {
  console.clear();
  
  console.log(`
  ${COLORS.cyan}╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║            ROTEIRO: RUNES ANALYTICS PRO                  ║
  ║            VÍDEO-PITCH (${VIDEO_CONFIG.duracao})                        ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝${COLORS.reset}
  
  ${COLORS.yellow}✦ CONFIGURAÇÕES TÉCNICAS${COLORS.reset}
  • Resolução: ${VIDEO_CONFIG.resolucao}
  • FPS: ${VIDEO_CONFIG.fps}
  • Áudio: ${VIDEO_CONFIG.formatoAudio}
  
  ${COLORS.yellow}✦ PALETA DE CORES${COLORS.reset}
  • Primária: ${VIDEO_CONFIG.paleta.primaria} (Verde terminal)
  • Secundária: ${VIDEO_CONFIG.paleta.secundaria} (Preto profundo)
  • Destaque: ${VIDEO_CONFIG.paleta.destaque} (Laranja para elementos importantes)
  
  ${COLORS.yellow}✦ TRILHA SONORA SUGERIDA${COLORS.reset}
  • ${VIDEO_CONFIG.trilhaSugerida[0]}
  • ${VIDEO_CONFIG.trilhaSugerida[1]}
  • ${VIDEO_CONFIG.trilhaSugerida[2]}
  `);
  
  ROTEIRO.forEach((secao, index) => {
    console.log(`\n  ${COLORS.cyan}SEÇÃO ${index + 1}: ${secao.secao} (${secao.duracao})${COLORS.reset}\n`);
    
    console.log(`  ${COLORS.green}◉ VISUAL:${COLORS.reset}`);
    console.log(`  ${secao.visual.split('\n').join('\n  ')}\n`);
    
    console.log(`  ${COLORS.green}◉ ÁUDIO:${COLORS.reset}`);
    console.log(`  ${secao.audio.split('\n').join('\n  ')}\n`);
    
    console.log(`  ${COLORS.green}◉ NOTAS:${COLORS.reset}`);
    console.log(`  ${secao.notas.split('\n').join('\n  ')}`);
    
    if (index < ROTEIRO.length - 1) {
      console.log(`\n  ${COLORS.yellow}▼ ▼ ▼${COLORS.reset}`);
    }
  });
  
  console.log(`\n  ${COLORS.cyan}╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║  "Os dados são frios. Mas o que os move... é fogo.      ║
  ║   É fé. É Cypher."                                       ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);
}

/**
 * Exporta o roteiro para um arquivo HTML com formatação rica
 */
function exportarRoteiroHTML() {
  const outputPath = path.join(process.cwd(), 'video-pitch-roteiro.html');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RUNES Analytics Pro - Roteiro do Vídeo-Pitch</title>
  <style>
    :root {
      --color-primary: ${VIDEO_CONFIG.paleta.primaria};
      --color-secondary: ${VIDEO_CONFIG.paleta.secundaria};
      --color-accent: ${VIDEO_CONFIG.paleta.destaque};
      --color-bg: ${VIDEO_CONFIG.paleta.background};
      --color-text: ${VIDEO_CONFIG.paleta.texto};
    }
    
    body {
      font-family: 'Roboto Mono', monospace;
      background-color: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid var(--color-primary);
      border-radius: 5px;
    }
    
    h1, h2, h3 {
      color: var(--color-primary);
      font-weight: 600;
    }
    
    h1 {
      text-align: center;
      font-size: 24px;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 3px;
      border-bottom: 1px solid var(--color-primary);
      padding-bottom: 10px;
    }
    
    h2 {
      font-size: 20px;
      border-left: 3px solid var(--color-primary);
      padding-left: 10px;
      margin-top: 30px;
    }
    
    h3 {
      font-size: 16px;
      color: var(--color-accent);
    }
    
    .config-section {
      background-color: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .scene {
      border: 1px dashed rgba(255,255,255,0.2);
      padding: 15px;
      margin-bottom: 25px;
      background-color: rgba(0,0,0,0.2);
      border-radius: 5px;
    }
    
    .scene-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 5px;
    }
    
    .scene-number {
      background-color: var(--color-primary);
      color: var(--color-secondary);
      font-weight: bold;
      padding: 2px 10px;
      border-radius: 15px;
      font-size: 14px;
    }
    
    .scene-title {
      color: var(--color-primary);
      font-weight: bold;
      font-size: 18px;
    }
    
    .scene-duration {
      color: var(--color-accent);
      font-size: 14px;
    }
    
    .scene-content h4 {
      color: var(--color-primary);
      font-size: 14px;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    
    .scene-content p {
      margin-top: 0;
      white-space: pre-line;
    }
    
    .quote {
      font-style: italic;
      border-left: 2px solid var(--color-accent);
      padding-left: 10px;
      color: rgba(255,255,255,0.85);
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      font-style: italic;
    }
    
    .ascii-art {
      font-family: monospace;
      white-space: pre;
      color: var(--color-primary);
      text-align: center;
      font-size: 12px;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>RUNES Analytics Pro - Roteiro de Vídeo-Pitch</h1>
    
    <div class="config-section">
      <h2>Configurações Técnicas</h2>
      <p><strong>Duração:</strong> ${VIDEO_CONFIG.duracao}</p>
      <p><strong>Resolução:</strong> ${VIDEO_CONFIG.resolucao}</p>
      <p><strong>FPS:</strong> ${VIDEO_CONFIG.fps}</p>
      <p><strong>Áudio:</strong> ${VIDEO_CONFIG.formatoAudio}</p>
      
      <h3>Paleta de Cores</h3>
      <p>
        <span style="color:${VIDEO_CONFIG.paleta.primaria}">■</span> Primária: ${VIDEO_CONFIG.paleta.primaria} (Verde terminal)<br>
        <span style="color:${VIDEO_CONFIG.paleta.secundaria}">■</span> Secundária: ${VIDEO_CONFIG.paleta.secundaria} (Preto profundo)<br>
        <span style="color:${VIDEO_CONFIG.paleta.destaque}">■</span> Destaque: ${VIDEO_CONFIG.paleta.destaque} (Laranja para elementos importantes)
      </p>
      
      <h3>Trilha Sonora Sugerida</h3>
      <ul>
        ${VIDEO_CONFIG.trilhaSugerida.map(track => `<li>${track}</li>`).join('')}
      </ul>
    </div>
    
    ${ROTEIRO.map((secao, index) => `
    <div class="scene">
      <div class="scene-heading">
        <span class="scene-number">${index + 1}</span>
        <span class="scene-title">${secao.secao}</span>
        <span class="scene-duration">${secao.duracao}</span>
      </div>
      
      <div class="scene-content">
        <h4>Visual</h4>
        <p>${secao.visual}</p>
        
        <h4>Áudio</h4>
        <p>${secao.audio}</p>
        
        <h4>Notas</h4>
        <p>${secao.notas}</p>
      </div>
    </div>
    `).join('')}
    
    <div class="ascii-art">
     .------..------..------..------..------..------..------.
     |R.--. ||U.--. ||N.--. ||E.--. ||S.--. ||A.--. ||P.--. |
     | :(): || :(): || :(): || :(): || :(): || :(): || :(): |
     | ()() || ()() || ()() || ()() || ()() || ()() || ()() |
     | '--'R|| '--'U|| '--'N|| '--'E|| '--'S|| '--'A|| '--'P|
     \`------'\`------'\`------'\`------'\`------'\`------'\`------'
    </div>
    
    <div class="quote">
      "Os dados são frios. Mas o que os move... é fogo. É fé. É Cypher."
    </div>
    
    <div class="footer">
      <p>© RUNES Analytics Pro - Documento de produção interno</p>
      <p>O que está oculto entre os blocos?</p>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, htmlContent);
  console.log(`\n  ${COLORS.green}✓ Roteiro exportado para HTML:${COLORS.reset} ${outputPath}`);
}

/**
 * Exporta o roteiro para um arquivo Markdown
 */
function exportarRoteiroMarkdown() {
  const outputPath = path.join(process.cwd(), 'video-pitch-roteiro.md');
  
  let mdContent = `# RUNES Analytics Pro - Roteiro de Vídeo-Pitch

## Configurações Técnicas
- **Duração:** ${VIDEO_CONFIG.duracao}
- **Resolução:** ${VIDEO_CONFIG.resolucao}
- **FPS:** ${VIDEO_CONFIG.fps}
- **Áudio:** ${VIDEO_CONFIG.formatoAudio}

### Paleta de Cores
- Primária: ${VIDEO_CONFIG.paleta.primaria} (Verde terminal)
- Secundária: ${VIDEO_CONFIG.paleta.secundaria} (Preto profundo)
- Destaque: ${VIDEO_CONFIG.paleta.destaque} (Laranja para elementos importantes)

### Trilha Sonora Sugerida
${VIDEO_CONFIG.trilhaSugerida.map(track => `- ${track}`).join('\n')}

`;

  ROTEIRO.forEach((secao, index) => {
    mdContent += `\n## ${index + 1}. ${secao.secao} (${secao.duracao})

### Visual
${secao.visual}

### Áudio
${secao.audio}

### Notas
${secao.notas}

`;
  });

  mdContent += `\n> "Os dados são frios. Mas o que os move... é fogo. É fé. É Cypher."

---

*© RUNES Analytics Pro - Documento de produção interno*

*O que está oculto entre os blocos?*`;

  fs.writeFileSync(outputPath, mdContent);
  console.log(`  ${COLORS.green}✓ Roteiro exportado para Markdown:${COLORS.reset} ${outputPath}`);
}

// Executar o script
exibirRoteiro();
exportarRoteiroHTML();
exportarRoteiroMarkdown();

console.log(`\n  ${COLORS.yellow}Para utilizar este roteiro na produção do vídeo:${COLORS.reset}
  1. Abra o arquivo HTML gerado para visualização formatada
  2. Use o arquivo MD para compartilhar facilmente o roteiro
  3. Execute este script novamente para ver o roteiro no terminal\n`); 
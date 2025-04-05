/**
 * RUNES Analytics Pro - Gerador de Storyboard
 * 
 * Este script gera um HTML com descrições visuais e texto para
 * criar um storyboard básico para o vídeo-pitch.
 */

const fs = require('fs');
const path = require('path');
const { COLORS } = require('../runescards.js');

// Cenas do storyboard
const STORYBOARD_SCENES = [
  {
    id: 'abertura-01',
    tempo: '0:00 - 0:05',
    descricao: 'Tela preta. Partículas de luz verde emergem lentamente.',
    instrucoes: 'Começar com tela totalmente preta. Lentamente, pequenas partículas de luz verde (como código Matrix) começam a aparecer do centro, muito sutis inicialmente.',
    texto: '',
    referencia: 'Referência visual: Matrix + Tron Legacy (cena de abertura)'
  },
  {
    id: 'abertura-02',
    tempo: '0:05 - 0:10',
    descricao: 'Partículas formando símbolos rúnicos, padrões de blockchain.',
    instrucoes: 'As partículas começam a se organizar em formas que lembram runas antigas e visualizações de blockchain. Movimento fluido, etéreo.',
    texto: '',
    referencia: 'Referência: Símbolos rúnicos nórdicos + visualização de blockchain'
  },
  {
    id: 'abertura-03',
    tempo: '0:10 - 0:15',
    descricao: 'Texto digitado letra por letra, seguido por logo glitched.',
    instrucoes: 'Texto aparece como se fosse digitado em um terminal: "Nascida do silêncio do Bloco 0... Ela escuta onde o whitepaper termina." Flash branco, seguido pelo logo do RUNES Analytics Pro com efeito de glitch digital.',
    texto: 'Nascida do silêncio do Bloco 0... Ela escuta onde o whitepaper termina.',
    referencia: 'Referência: Mr. Robot (estilo de tipografia terminal) + glitch art'
  },
  {
    id: 'apresentacao-01',
    tempo: '0:15 - 0:20',
    descricao: 'Transição para dashboard em perspectiva 3D.',
    instrucoes: 'Transição suave do logo para um dashboard 3D flutuante. Exibir uma visão de perspectiva da UI completa, com múltiplos painéis e gráficos.',
    texto: 'RUNES Analytics Pro não é apenas uma ferramenta...',
    referencia: 'Referência: Minoria Futurista (interfaces 3D) + Bloomberg Terminal'
  },
  {
    id: 'apresentacao-02',
    tempo: '0:20 - 0:30',
    descricao: 'Close-up em elementos-chave da interface: gráficos, favoritos, alertas.',
    instrucoes: 'Série de zoom-ins em elementos específicos: 1) Gráfico de evolução de token Rune com linha subindo, 2) Sistema de favoritos com estrelas, 3) Alertas de baleias com ícone de notificação.',
    texto: '...é um oráculo para decifrar o invisível por trás dos tokens que pulsam na blockchain do Bitcoin.',
    referencia: 'Referência: Trading View + designs modernos de dashboard crypto'
  },
  {
    id: 'apresentacao-03',
    tempo: '0:30 - 0:35',
    descricao: 'Efeito de "digital twin" com dados fluindo entre interfaces.',
    instrucoes: 'Mostrar múltiplas telas/dispositivos (desktop, mobile, tablet) com a interface, conectados por fluxos de dados (linhas de luz que transferem informações entre eles).',
    texto: '',
    referencia: 'Referência: Tron Legacy (linhas de energia) + visualização de rede'
  },
  {
    id: 'diferenciais-01',
    tempo: '0:35 - 0:40',
    descricao: 'Palavras-chave "Cache Inteligente" com diagrama de fluxo.',
    instrucoes: 'A frase "Cache Inteligente" aparece em grande destaque. Atrás dela, um diagrama simplificado mostrando o fluxo de dados, com camadas de cache representadas por círculos concêntricos. A palavra então explode em partículas.',
    texto: 'Cache inteligente.',
    referencia: 'Referência: Diagrama de arquitetura minimalista + efeito de partículas'
  },
  {
    id: 'diferenciais-02',
    tempo: '0:40 - 0:45',
    descricao: 'Palavras-chave "APIs Unificadas" com ícones convergindo.',
    instrucoes: 'A frase "APIs Unificadas" aparece. Ao redor, ícones representando diferentes fontes de dados (Exchanges, Block Explorers, etc.) convergem para um ponto central. Explosão em partículas.',
    texto: 'APIs unificadas.',
    referencia: 'Referência: Diagrama de integração API + ícones minimalistas'
  },
  {
    id: 'diferenciais-03',
    tempo: '0:45 - 0:50',
    descricao: 'Palavras-chave "Whale Tracking" com silhueta de baleia.',
    instrucoes: 'A frase "Whale Tracking" aparece. Uma silhueta de baleia digital nada através de blocos de dados/blockchain. Os blocos iluminam-se quando a baleia passa. Explosão em partículas.',
    texto: 'Visualização de baleias.',
    referencia: 'Referência: Visualização Whale Alert + estilo neon'
  },
  {
    id: 'diferenciais-04',
    tempo: '0:50 - 0:55',
    descricao: 'Palavras-chave "Simulação de Trades" e interface modular.',
    instrucoes: 'A frase "Simulação de Trades" aparece. Uma interface simplificada de simulação é mostrada com gráfico e controles. Em seguida, mostrar a interface sendo reconfigurada em tempo real, módulos movendo-se e reorganizando-se.',
    texto: 'Simulação de trades. Tudo modular. Tudo livre.',
    referencia: 'Referência: Interface de trading moderna + UI modular'
  },
  {
    id: 'gratidao-01',
    tempo: '0:55 - 1:05',
    descricao: 'Transição para rede neural/blockchain com nós luminosos.',
    instrucoes: 'Fade para uma cena escura. Pontos de luz conectados formam uma estrutura que é simultaneamente uma rede neural e uma visualização de blockchain. Os nós pulsam suavemente com luz.',
    texto: 'Este projeto nasceu da gratidão.',
    referencia: 'Referência: Visualização de rede neural + blockchain art'
  },
  {
    id: 'gratidao-02',
    tempo: '1:05 - 1:15',
    descricao: 'Rostos sutis nos nós e surgimento do RuneCard Cypher.',
    instrucoes: 'Alguns nós transformam-se sutilmente em silhuetas/rostos por um instante (sem identificar pessoas reais). Do centro da rede, surge o RuneCard "Cypher" com efeito de ondulação digital. O card gira lentamente em 3D.',
    texto: 'Aos que criaram os Runes, aos que moldaram a rede, aos que ainda acreditam no impossível.',
    referencia: 'Referência: Hologramas de StarWars + cartões 3D premium'
  },
  {
    id: 'gratidao-03',
    tempo: '1:15 - 1:20',
    descricao: 'Código Morse e detalhes do card Cypher.',
    instrucoes: 'Enquanto o card gira, mostrar detalhes de suas informações. Em um canto da tela, um pequeno ponto pisca em código Morse soletando "NAKAMOTO".',
    texto: '',
    referencia: 'Referência: Código Morse + Easter eggs sutis'
  },
  {
    id: 'encerramento-01',
    tempo: '1:20 - 1:25',
    descricao: 'Interface em uso real por usuário (mãos apenas).',
    instrucoes: 'Mostrar visão de primeira pessoa: mãos digitando/interagindo com a interface completa do RUNES Analytics Pro. Várias telas de dados, gráficos e análises visíveis.',
    texto: '',
    referencia: 'Referência: Interação realista com UI + perspectiva de usuário'
  },
  {
    id: 'encerramento-02',
    tempo: '1:25 - 1:35',
    descricao: 'Fade para tela preta, texto final e logo.',
    instrucoes: 'Fade para tela preta. Texto aparece: "RUNES Analytics Pro. Construído por visionários. Para visionários." Logo abaixo, o logo do projeto aparece com efeito de brilho/glowing.',
    texto: 'RUNES Analytics Pro. Construído por visionários. Para visionários.',
    referencia: 'Referência: Cinematografia minimalista + logo animation'
  },
  {
    id: 'encerramento-03',
    tempo: '1:35 - 1:45',
    descricao: 'URL final e easter egg.',
    instrucoes: 'URL do projeto aparece abaixo do logo. No canto inferior da tela, em texto muito pequeno quase imperceptível: "O que está oculto entre os blocos?"',
    texto: '',
    referencia: 'Referência: Créditos finais de filme + easter egg sutil'
  }
];

/**
 * Gera o arquivo HTML do storyboard
 */
function gerarStoryboardHTML() {
  const outputPath = path.join(process.cwd(), 'video-pitch-storyboard.html');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RUNES Analytics Pro - Storyboard do Vídeo-Pitch</title>
  <style>
    :root {
      --color-primary: #00FF41;
      --color-secondary: #0D0208;
      --color-accent: #FF5722;
      --color-bg: #080808;
      --color-text: #E0E0E0;
    }
    
    body {
      font-family: 'Roboto', 'Segoe UI', sans-serif;
      background-color: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1, h2, h3, h4 {
      color: var(--color-primary);
    }
    
    h1 {
      text-align: center;
      font-size: 28px;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 3px;
      border-bottom: 1px solid var(--color-primary);
      padding-bottom: 15px;
    }
    
    .intro {
      background-color: rgba(0,0,0,0.3);
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
      border-left: 3px solid var(--color-primary);
    }
    
    .intro p {
      margin: 10px 0;
    }
    
    .storyboard-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
    }
    
    .scene {
      border: 1px solid rgba(0, 255, 65, 0.2);
      border-radius: 5px;
      overflow: hidden;
      background-color: rgba(0,0,0,0.2);
    }
    
    .scene-header {
      background-color: rgba(0, 255, 65, 0.1);
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .scene-id {
      font-weight: bold;
      color: var(--color-primary);
    }
    
    .scene-time {
      color: var(--color-accent);
      font-size: 14px;
    }
    
    .scene-content {
      padding: 15px;
      display: grid;
      grid-template-columns: 310px 1fr;
      gap: 20px;
    }
    
    .scene-image {
      width: 300px;
      height: 169px; /* 16:9 ratio */
      background-color: rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 1px dashed rgba(255,255,255,0.2);
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      text-align: center;
      border-radius: 3px;
    }
    
    .image-placeholder-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .scene-details {
      flex-grow: 1;
    }
    
    .scene-title {
      color: var(--color-primary);
      font-size: 18px;
      margin-top: 0;
      margin-bottom: 15px;
      border-bottom: 1px solid rgba(0, 255, 65, 0.2);
      padding-bottom: 5px;
    }
    
    .scene-instructions {
      margin-bottom: 15px;
    }
    
    .scene-dialogue {
      font-style: italic;
      background-color: rgba(0,0,0,0.3);
      padding: 10px;
      border-left: 2px solid var(--color-accent);
      margin-bottom: 15px;
    }
    
    .scene-reference {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      border-top: 1px dashed rgba(255,255,255,0.1);
      padding-top: 10px;
    }
    
    .notes {
      background-color: rgba(0,0,0,0.3);
      padding: 15px;
      margin-top: 30px;
      border-radius: 5px;
      border-left: 3px solid var(--color-accent);
    }
    
    .notes h3 {
      color: var(--color-accent);
      margin-top: 0;
    }

    @media (max-width: 768px) {
      .scene-content {
        grid-template-columns: 1fr;
      }
      
      .scene-image {
        width: 100%;
        height: 200px;
      }
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      border-top: 1px solid rgba(0, 255, 65, 0.2);
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>RUNES Analytics Pro - Storyboard</h1>
    
    <div class="intro">
      <p><strong>Duração total:</strong> 1:45 (Um minuto e quarenta e cinco segundos)</p>
      <p><strong>Estilo visual:</strong> Minimalista, terminal/código, elementos de UI futurista, cores principais verde (#00FF41) sobre preto profundo.</p>
      <p><strong>Audio:</strong> Trilha lo-fi com elementos de sintetizador, efeitos sonoros para transições e momentos-chave.</p>
      <p><strong>Conceito:</strong> Apresentar o RUNES Analytics Pro como uma plataforma revolucionária para análise de tokens Runes no Bitcoin, com tom místico e reverente ao ecossistema.</p>
    </div>
    
    <div class="storyboard-container">
      ${STORYBOARD_SCENES.map(scene => `
      <div class="scene" id="${scene.id}">
        <div class="scene-header">
          <span class="scene-id">${scene.id}</span>
          <span class="scene-time">${scene.tempo}</span>
        </div>
        <div class="scene-content">
          <div class="scene-image">
            <div class="image-placeholder-icon">🎬</div>
            <p>Imagem do storyboard<br>${scene.id}</p>
          </div>
          <div class="scene-details">
            <h3 class="scene-title">${scene.descricao}</h3>
            <div class="scene-instructions">
              ${scene.instrucoes}
            </div>
            ${scene.texto ? `<div class="scene-dialogue">"${scene.texto}"</div>` : ''}
            <div class="scene-reference">
              ${scene.referencia}
            </div>
          </div>
        </div>
      </div>
      `).join('')}
    </div>
    
    <div class="notes">
      <h3>Notas para Produção</h3>
      <p>Este storyboard serve como guia visual para o vídeo-pitch de 1:45 do RUNES Analytics Pro. As imagens reais devem ser criadas por um designer/artista digital seguindo as referências fornecidas.</p>
      <p>Cada cena inclui:</p>
      <ul>
        <li>Timestamp e ID para organização</li>
        <li>Descrição da cena</li>
        <li>Instruções detalhadas para designers</li>
        <li>Texto/diálogo quando aplicável</li>
        <li>Referências visuais para inspiração</li>
      </ul>
      <p>A estética geral deve seguir um tema "verde terminal" (estilo Matrix) com elementos futuristas e místicos, evocando tanto tecnologia avançada quanto um senso de reverência ao Bitcoin e ecossistema Runes.</p>
    </div>
    
    <div class="footer">
      <p>© RUNES Analytics Pro - Documento de produção interno</p>
      <p>O que está oculto entre os blocos?</p>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, htmlContent);
  console.log(`\n  ${COLORS.green}✓ Storyboard exportado para HTML:${COLORS.reset} ${outputPath}`);
}

/**
 * Mostra informações no terminal
 */
function exibirInfo() {
  console.clear();
  
  console.log(`
  ${COLORS.cyan}╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║       STORYBOARD: RUNES ANALYTICS PRO VÍDEO-PITCH        ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝${COLORS.reset}
  
  ${COLORS.yellow}✦ INFORMAÇÕES${COLORS.reset}
  • Total de cenas: ${STORYBOARD_SCENES.length}
  • Duração total: 1:45 (Um minuto e quarenta e cinco segundos)
  
  ${COLORS.yellow}✦ ARQUIVO GERADO${COLORS.reset}
  Um arquivo HTML de storyboard foi gerado com:
  • Layout responsivo para fácil visualização
  • Espaços para thumbnails de cada cena
  • Instruções detalhadas para designers/produtores
  • Referências visuais para inspiração
  
  ${COLORS.green}✦ PRÓXIMOS PASSOS${COLORS.reset}
  1. Abra o arquivo HTML gerado no navegador
  2. Compartilhe com designers para criação dos visuais
  3. Use como base para gravar a narração
  4. Integre os elementos para produção final
  `);
  
  // Resumo das cenas
  console.log(`  ${COLORS.yellow}✦ RESUMO DAS CENAS${COLORS.reset}`);
  STORYBOARD_SCENES.forEach((scene, index) => {
    console.log(`  ${COLORS.green}${index + 1}.${COLORS.reset} ${scene.tempo} - ${scene.descricao}`);
  });
}

// Executar o script
gerarStoryboardHTML();
exibirInfo(); 
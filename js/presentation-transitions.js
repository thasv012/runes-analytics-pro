/**
 * RUNES Analytics Pro - Presentation Transitions
 * Script para efeitos e animações das transições entre páginas
 */

// Classe para transições e efeitos visuais
class PresentationEffects {
  constructor() {
    this.initializeEffects();
    this.setupTransitions();
    this.initializeGlitchEffects();
    this.initializeParallaxEffects();
  }
  
  // Inicializar efeitos globais
  initializeEffects() {
    // Adicionar estilos de animação para transições de página
    const style = document.createElement('style');
    style.textContent = `
      @keyframes page-enter {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes page-exit {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
      }
      
      @keyframes glitch {
        0% {
          clip-path: inset(40% 0 61% 0);
          transform: translate(-2px, 2px);
        }
        20% {
          clip-path: inset(92% 0 1% 0);
          transform: translate(1px, -3px);
        }
        40% {
          clip-path: inset(43% 0 1% 0);
          transform: translate(-1px, 3px);
        }
        60% {
          clip-path: inset(25% 0 58% 0);
          transform: translate(3px, 1px);
        }
        80% {
          clip-path: inset(54% 0 7% 0);
          transform: translate(-3px, -2px);
        }
        100% {
          clip-path: inset(58% 0 43% 0);
          transform: translate(2px, 2px);
        }
      }
      
      .page-enter {
        animation: page-enter 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
      }
      
      .page-exit {
        animation: page-exit 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
      }
      
      .glitch-effect {
        position: relative;
      }
      
      .glitch-effect::before,
      .glitch-effect::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
      }
      
      .glitch-effect::before {
        color: var(--neon-pink);
        z-index: -2;
      }
      
      .glitch-effect::after {
        color: var(--neon-cyan);
        z-index: -1;
      }
      
      .glitch-effect:hover::before {
        animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
      }
      
      .glitch-effect:hover::after {
        animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
        animation-delay: 0.05s;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Configurar transições de página
  setupTransitions() {
    // Ativar animação de entrada quando a página carrega
    window.addEventListener('DOMContentLoaded', () => {
      this.animateContent();
    });
    
    // Detectar quando a transição de saída termina
    document.addEventListener('animationend', (e) => {
      if (e.animationName === 'page-exit') {
        // Limpar classes após a animação de saída
        document.body.classList.remove('page-exit');
      }
    });
  }
  
  // Animar conteúdo na entrada da página
  animateContent() {
    // Selecionar elementos a serem animados na ordem
    const animatedElements = document.querySelectorAll('.fade-in');
    
    // Aplicar animação com delay sequencial
    animatedElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.animation = 'fade-in 0.8s forwards';
      element.style.animationDelay = `${index * 0.15}s`;
    });
    
    // Animar elementos parallax
    this.animateParallaxElements();
  }
  
  // Inicializar efeitos de glitch em textos
  initializeGlitchEffects() {
    // Encontrar elementos com a classe glitch-text
    const glitchElements = document.querySelectorAll('.glitch-text');
    
    // Adicionar atributos e classes necessárias para o efeito
    glitchElements.forEach(element => {
      element.setAttribute('data-text', element.textContent);
      element.classList.add('glitch-effect');
    });
  }
  
  // Inicializar efeitos de parallax
  initializeParallaxEffects() {
    // Detectar movimento do mouse para efeito parallax
    document.addEventListener('mousemove', (e) => {
      const parallaxElements = document.querySelectorAll('.parallax');
      
      parallaxElements.forEach(element => {
        // Pegar a força do efeito do atributo data ou usar um valor padrão
        const intensity = element.getAttribute('data-parallax-intensity') || 0.05;
        
        // Calcular a posição com base no movimento do mouse
        const x = (e.clientX - window.innerWidth / 2) * intensity;
        const y = (e.clientY - window.innerHeight / 2) * intensity;
        
        // Aplicar transformação
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }
  
  // Animar elementos com efeito parallax no carregamento da página
  animateParallaxElements() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach((element, index) => {
      // Definir posição inicial aleatória sutil
      const initialX = (Math.random() - 0.5) * 20;
      const initialY = (Math.random() - 0.5) * 20;
      
      element.style.transform = `translate(${initialX}px, ${initialY}px)`;
      element.style.transition = 'transform 1s cubic-bezier(0.23, 1, 0.32, 1)';
    });
  }
  
  // Adicionar efeito de terminal para blocos de código
  initializeTerminalEffect(selector = '.terminal-box') {
    const terminalElements = document.querySelectorAll(selector);
    
    terminalElements.forEach(terminal => {
      // Adicionar cursor piscante no final do conteúdo
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      cursor.innerHTML = '&#9608;'; // Bloco sólido
      
      terminal.appendChild(cursor);
      
      // Adicionar estilo para o cursor
      const style = document.createElement('style');
      style.textContent = `
        .terminal-cursor {
          display: inline-block;
          width: 0.6em;
          height: 1em;
          background-color: var(--neon-green);
          animation: blink 1s step-end infinite;
          vertical-align: text-bottom;
          margin-left: 2px;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `;
      
      document.head.appendChild(style);
    });
  }
  
  // Adicionar efeito de digitação para textos
  addTypewriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function typeWriter() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    }
    
    typeWriter();
  }
  
  // Adicionar efeito de matriz (como chuva de código)
  createMatrixEffect(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Caracteres para o efeito Matrix
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    // Array de posições Y para cada coluna
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    // Função para desenhar o efeito Matrix
    function drawMatrix() {
      // Fundo semitransparente para criar efeito de desvanecimento
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Cor do texto
      ctx.fillStyle = '#00ff8f';
      ctx.font = `${fontSize}px monospace`;
      
      // Desenhar caracteres
      for (let i = 0; i < drops.length; i++) {
        // Caractere aleatório para desenhar
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Posição x é o índice * tamanho da fonte
        // Posição y é o valor no array drops * tamanho da fonte
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Enviar a gota de volta ao topo com probabilidade aleatória
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Incrementar Y
        drops[i]++;
      }
    }
    
    // Iniciar a animação
    setInterval(drawMatrix, 35);
  }
}

// Inicializar efeitos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.presentationEffects = new PresentationEffects();
  
  // Inicializar efeito de terminal se existirem blocos de terminal
  window.presentationEffects.initializeTerminalEffect();
  
  // Inicializar efeito matrix se existir o canvas
  if (document.getElementById('matrix-canvas')) {
    window.presentationEffects.createMatrixEffect('matrix-canvas');
  }
});

// Exportar a classe para uso em outros scripts
window.PresentationEffects = PresentationEffects; 
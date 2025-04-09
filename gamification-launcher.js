/**
 * gamification-launcher.js
 * Script para integrar o botão de demo em qualquer página
 */

(function() {
  // Criar o botão de lançamento
  function createLaunchButton() {
    const button = document.createElement('a');
    button.href = '#';
    button.className = 'btn-gamified-demo';
    button.innerHTML = '🎮 Try Gamified Demo';
    button.addEventListener('click', launchDemo);
    
    // Estilizar o botão
    const style = document.createElement('style');
    style.textContent = `
      .btn-gamified-demo {
        display: inline-block;
        background: linear-gradient(90deg, #8A2BE2, #00BFFF);
        color: white;
        font-size: 1rem;
        padding: 0.8rem 1.5rem;
        border-radius: 0.5rem;
        text-decoration: none;
        margin: 1rem 0;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(138, 43, 226, 0.5);
        cursor: pointer;
      }
      
      .btn-gamified-demo:hover {
        transform: translateY(-3px);
        box-shadow: 0 0 30px rgba(138, 43, 226, 0.8);
      }
    `;
    
    document.head.appendChild(style);
    
    return button;
  }
  
  // Função para lançar a demo
  function launchDemo(e) {
    e.preventDefault();
    
    // Verificar se o script da demo já está carregado
    if (!window.RunesDemo) {
      loadDemoScript()
        .then(() => {
          initializeDemo();
        })
        .catch(error => {
          console.error('Erro ao carregar demo:', error);
          alert('Não foi possível carregar a demo. Por favor, tente novamente mais tarde.');
        });
    } else {
      initializeDemo();
    }
  }
  
  // Carregar o script da demo
  function loadDemoScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'demo-animation.js';
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar script da demo'));
      
      document.head.appendChild(script);
    });
  }
  
  // Inicializar a demo
  function initializeDemo() {
    // Preparar o container
    let demoContainer = document.getElementById('runes-demo-container');
    
    if (!demoContainer) {
      demoContainer = document.createElement('div');
      demoContainer.id = 'runes-demo-container';
      document.body.appendChild(demoContainer);
    }
    
    // Salvar o scroll position atual
    const scrollPos = window.scrollY;
    
    // Estilizar para modo fullscreen
    const originalStyles = {
      overflow: document.body.style.overflow,
      position: demoContainer.style.position,
      top: demoContainer.style.top,
      left: demoContainer.style.left,
      width: demoContainer.style.width,
      height: demoContainer.style.height,
      zIndex: demoContainer.style.zIndex
    };
    
    document.body.style.overflow = 'hidden';
    demoContainer.style.position = 'fixed';
    demoContainer.style.top = '0';
    demoContainer.style.left = '0';
    demoContainer.style.width = '100%';
    demoContainer.style.height = '100%';
    demoContainer.style.zIndex = '9999';
    
    // Adicionar botão de volta
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'demo-close-btn';
    closeButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
      cursor: pointer;
      z-index: 10000;
    `;
    
    document.body.appendChild(closeButton);
    
    closeButton.addEventListener('click', () => {
      // Restaurar estilos originais
      document.body.style.overflow = originalStyles.overflow;
      demoContainer.style.position = originalStyles.position;
      demoContainer.style.top = originalStyles.top;
      demoContainer.style.left = originalStyles.left;
      demoContainer.style.width = originalStyles.width;
      demoContainer.style.height = originalStyles.height;
      demoContainer.style.zIndex = originalStyles.zIndex;
      
      // Limpar o container
      demoContainer.innerHTML = '';
      
      // Remover o botão
      closeButton.remove();
      
      // Restaurar scroll
      window.scrollTo(0, scrollPos);
    });
    
    // Inicializar a demo
    window.RunesDemo.init();
  }
  
  // Adicionar o botão aos locais apropriados
  function injectDemoButtons() {
    // Locais potenciais
    const targets = [
      '.cta-section',
      '.demo-section',
      '.hero-section',
      'header',
      'footer'
    ];
    
    let buttonAdded = false;
    
    for (const selector of targets) {
      const element = document.querySelector(selector);
      if (element) {
        element.appendChild(createLaunchButton());
        buttonAdded = true;
        break;
      }
    }
    
    // Se não encontrarmos um local específico, adicionar no fim da página
    if (!buttonAdded) {
      const button = createLaunchButton();
      button.style.position = 'fixed';
      button.style.bottom = '20px';
      button.style.right = '20px';
      button.style.zIndex = '999';
      document.body.appendChild(button);
    }
  }
  
  // Quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDemoButtons);
  } else {
    injectDemoButtons();
  }
})();
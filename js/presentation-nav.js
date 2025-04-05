/**
 * RUNES Analytics Pro - Presentation Navigation
 * Script para controlar navegação entre páginas da apresentação multi-página
 */

// Configuração das páginas da apresentação
const PAGES = [
  { id: 'intro', title: 'Introdução', path: 'intro.html' },
  { id: 'architecture', title: 'Arquitetura', path: 'architecture.html' },
  { id: 'features', title: 'Recursos', path: 'features.html' },
  { id: 'web3', title: 'Web3', path: 'web3.html' },
  { id: 'demo', title: 'Demo', path: 'demo.html' },
  { id: 'bootoshi', title: 'Bootoshi', path: 'bootoshi.html' }
];

// Classe para controlar a navegação
class PresentationNav {
  constructor() {
    this.currentPageIndex = 0;
    this.currentPath = window.location.pathname;
    this.currentId = this.getCurrentPageId();
    
    this.initNavigation();
    this.setupKeyboardNavigation();
    this.setupMobileNav();
    this.markActiveNavItem();
    this.setupPageTransitions();
    this.addScanline();
  }
  
  // Determina qual página está ativa com base no path atual
  getCurrentPageId() {
    const filename = this.currentPath.split('/').pop();
    const page = PAGES.find(p => p.path === filename);
    return page ? page.id : PAGES[0].id;
  }
  
  // Inicializa a navegação principal
  initNavigation() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    // Criar container para navegação
    const navContainer = document.createElement('div');
    navContainer.className = 'nav-container container';
    
    // Adicionar logo
    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.textContent = 'RUNES Analytics Pro';
    
    // Adicionar botão para menu mobile
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '<span>☰</span>';
    navToggle.setAttribute('aria-label', 'Toggle navigation');
    
    // Criar navegação principal
    const nav = document.createElement('nav');
    nav.className = 'main-nav';
    
    const navList = document.createElement('ul');
    
    // Adicionar itens da navegação
    PAGES.forEach(page => {
      const navItem = document.createElement('li');
      const navLink = document.createElement('a');
      navLink.href = page.path;
      navLink.textContent = page.title;
      navLink.setAttribute('data-page', page.id);
      navLink.addEventListener('click', (e) => this.handleNavClick(e, page));
      
      navItem.appendChild(navLink);
      navList.appendChild(navItem);
    });
    
    nav.appendChild(navList);
    navContainer.appendChild(logo);
    navContainer.appendChild(nav);
    navContainer.appendChild(navToggle);
    header.appendChild(navContainer);
  }
  
  // Gerencia cliques na navegação
  handleNavClick(e, page) {
    e.preventDefault();
    this.navigateToPage(page);
  }
  
  // Navega para uma página específica
  navigateToPage(page) {
    // Ativar efeito de saída da página
    document.body.classList.add('page-exit');
    
    // Após o efeito de saída, redirecionar para a nova página
    setTimeout(() => {
      window.location.href = page.path;
    }, 400);
  }
  
  // Marca o item de navegação ativo
  markActiveNavItem() {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
      if (link.getAttribute('data-page') === this.currentId) {
        link.classList.add('active');
      }
    });
  }
  
  // Configurar navegação por teclado (setas esquerda/direita)
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Navegar com as setas
      if (e.key === 'ArrowRight') {
        this.navigateNext();
      } else if (e.key === 'ArrowLeft') {
        this.navigatePrevious();
      }
    });
  }
  
  // Configurar navegação mobile (toggle do menu)
  setupMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (navToggle && mainNav) {
      navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        navToggle.classList.toggle('active');
        
        // Alterar ícone do botão quando ativo
        if (navToggle.classList.contains('active')) {
          navToggle.innerHTML = '<span>✕</span>';
        } else {
          navToggle.innerHTML = '<span>☰</span>';
        }
      });
    }
  }
  
  // Navegar para a próxima página
  navigateNext() {
    const currentIndex = PAGES.findIndex(p => p.id === this.currentId);
    if (currentIndex < PAGES.length - 1) {
      this.navigateToPage(PAGES[currentIndex + 1]);
    }
  }
  
  // Navegar para a página anterior
  navigatePrevious() {
    const currentIndex = PAGES.findIndex(p => p.id === this.currentId);
    if (currentIndex > 0) {
      this.navigateToPage(PAGES[currentIndex - 1]);
    }
  }
  
  // Configurar transições de página e animações de entrada
  setupPageTransitions() {
    // Adicionar classe para animação de entrada de página
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('page-enter');
      
      // Adicionar classe para elementos com fade-in
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach((el, index) => {
        // Staggered animation delay
        el.style.animationDelay = `${index * 0.15}s`;
        el.style.animationPlayState = 'running';
      });
    });
  }
  
  // Adicionar efeito scanline
  addScanline() {
    const scanline = document.createElement('div');
    scanline.className = 'scanline';
    document.body.appendChild(scanline);
  }
  
  // Inicializar Easter Eggs
  initEasterEggs() {
    const easterEggs = document.querySelectorAll('.easter-egg');
    
    easterEggs.forEach(egg => {
      egg.addEventListener('click', () => {
        egg.classList.toggle('active');
      });
    });
  }
}

// Inicializa a navegação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const nav = new PresentationNav();
  
  // Inicializar Easter Eggs se existirem
  nav.initEasterEggs();
  
  // Se ocorreu um erro durante a navegação, exibir uma mensagem
  window.addEventListener('error', function(e) {
    console.error('Navigation error:', e.message);
  });
});

// Exportar a classe para uso em outros scripts
window.PresentationNav = PresentationNav; 
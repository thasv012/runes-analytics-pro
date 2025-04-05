/**
 * RUNES Analytics Pro - Sistema de Animações e Feedback Visual
 * 
 * Este módulo contém funções para adicionar animações e feedback visual
 * aos elementos da interface, melhorando a experiência do usuário.
 */

// Namespace para o sistema de animações
const RunesAnimations = {
  // Configurações
  config: {
    notificationDuration: 5000, // Duração padrão das notificações em ms
    enableAnimations: true, // Habilitar/desabilitar animações
    observeIntersections: true, // Habilitar animações baseadas em interseção
  },

  // Inicialização do sistema
  init() {
    // Verificar preferência do usuário por reduzir movimento
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.enableAnimations = false;
    }

    // Inicializar observador de interseção para animações de entrada
    if (this.config.observeIntersections && this.config.enableAnimations) {
      this.setupIntersectionObserver();
    }

    // Aplicar efeito de ripple em botões
    this.setupRippleEffect();

    // Inicializar feedback em formulários
    this.setupFormFeedback();

    // Adicionar classe que indica JS habilitado
    document.body.classList.add('js-enabled');

    // Inicializar sistema de notificações
    this.setupNotificationSystem();

    console.log('🎭 RunesAnimations: Sistema de animações inicializado');
    return this;
  },

  /**
   * Configura o observador de interseção para animar elementos conforme aparecem na tela
   */
  setupIntersectionObserver() {
    // Opções do observador
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // 10% do elemento visível
    };

    // Criar observador
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Se o elemento entrar na viewport, animar
          const el = entry.target;
          const animation = el.dataset.animate || 'fade-in';
          const delay = el.dataset.delay || 0;
          
          setTimeout(() => {
            el.classList.add(animation);
            el.classList.add('animated');
            el.style.visibility = 'visible';
          }, delay);
          
          // Parar de observar após animar
          if (!el.dataset.repeat) {
            this.observer.unobserve(el);
          }
        } else if (entry.target.dataset.repeat) {
          // Se configurado para repetir, remover classe ao sair
          entry.target.classList.remove('animated');
          entry.target.classList.remove(entry.target.dataset.animate);
        }
      });
    }, options);

    // Observar todos os elementos com data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
      // Ocultar inicialmente para evitar flash
      el.style.visibility = 'hidden';
      this.observer.observe(el);
    });
  },

  /**
   * Configura efeito de ripple para botões e elementos clicáveis
   */
  setupRippleEffect() {
    // Selecionar elementos clicáveis
    const elementsWithRipple = document.querySelectorAll('.btn, .card-action, .nav-item, [data-ripple]');
    
    // Adicionar efeito
    elementsWithRipple.forEach(element => {
      element.addEventListener('click', (e) => {
        if (!this.config.enableAnimations) return;
        
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Criar elemento de ripple
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Adicionar ao elemento
        element.appendChild(ripple);
        
        // Remover após animação
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  },

  /**
   * Configura feedback visual para formulários
   */
  setupFormFeedback() {
    // Aplicar em campos de formulário
    const formInputs = document.querySelectorAll('.form-input, .form-select');
    
    formInputs.forEach(input => {
      // Adicionar classe quando em foco
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('form-group-focused');
      });
      
      // Remover classe ao perder foco
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('form-group-focused');
        
        // Adicionar classe se tiver valor
        if (input.value) {
          input.parentElement.classList.add('form-group-filled');
        } else {
          input.parentElement.classList.remove('form-group-filled');
        }
      });
      
      // Verificar estado inicial
      if (input.value) {
        input.parentElement.classList.add('form-group-filled');
      }
    });

    // Validação para formulários
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        // Adicionar validação de feedback visual
        const requiredInputs = form.querySelectorAll('[required]');
        let valid = true;
        
        requiredInputs.forEach(input => {
          if (!input.value.trim()) {
            valid = false;
            input.parentElement.classList.add('form-group-error');
            
            // Adicionar mensagem de erro
            if (!input.parentElement.querySelector('.form-error-message')) {
              const errorMsg = document.createElement('div');
              errorMsg.className = 'form-error-message';
              errorMsg.textContent = 'Este campo é obrigatório';
              input.parentElement.appendChild(errorMsg);
              
              // Animar mensagem de erro
              setTimeout(() => {
                errorMsg.classList.add('show');
              }, 10);
            }
          } else {
            input.parentElement.classList.remove('form-group-error');
            const errorMsg = input.parentElement.querySelector('.form-error-message');
            if (errorMsg) {
              errorMsg.classList.remove('show');
              setTimeout(() => {
                errorMsg.remove();
              }, 300);
            }
          }
        });
        
        // Se inválido, prevenir envio
        if (!valid) {
          e.preventDefault();
          e.stopPropagation();
          
          // Mostrar notificação
          this.showNotification({
            type: 'error',
            title: 'Erro de validação',
            message: 'Por favor, preencha todos os campos obrigatórios.'
          });
        } else {
          // Feedback de sucesso
          this.showNotification({
            type: 'success',
            title: 'Formulário enviado',
            message: 'Seus dados foram enviados com sucesso!'
          });
        }
      });
    });
  },

  /**
   * Configura o sistema de notificações
   */
  setupNotificationSystem() {
    // Criar container de notificações se não existir
    if (!document.querySelector('.notifications-container')) {
      const container = document.createElement('div');
      container.className = 'notifications-container';
      document.body.appendChild(container);
    }
  },

  /**
   * Mostra uma notificação na interface
   * @param {Object} options - Opções da notificação
   * @param {string} options.type - Tipo (success, error, warning, info)
   * @param {string} options.title - Título da notificação
   * @param {string} options.message - Mensagem da notificação
   * @param {number} options.duration - Duração em ms (0 para não fechar automaticamente)
   */
  showNotification(options) {
    const container = document.querySelector('.notifications-container');
    const defaults = {
      type: 'info',
      title: 'Notificação',
      message: '',
      duration: this.config.notificationDuration
    };
    
    // Mesclar opções com padrões
    const settings = {...defaults, ...options};
    
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${settings.type}`;
    
    // Ícone baseado no tipo
    let icon = 'info-circle';
    switch (settings.type) {
      case 'success': icon = 'check-circle'; break;
      case 'error': icon = 'times-circle'; break;
      case 'warning': icon = 'exclamation-triangle'; break;
    }
    
    // Construir HTML da notificação
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${settings.title}</div>
        <div class="notification-message">${settings.message}</div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Adicionar ao container
    container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Configurar botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.closeNotification(notification);
    });
    
    // Auto-fechar se duração > 0
    if (settings.duration > 0) {
      setTimeout(() => {
        this.closeNotification(notification);
      }, settings.duration);
    }
    
    // Retornar elemento para possível manipulação futura
    return notification;
  },

  /**
   * Fecha uma notificação com animação
   * @param {HTMLElement} notification - Elemento da notificação
   */
  closeNotification(notification) {
    notification.classList.remove('show');
    
    // Remover após animação
    setTimeout(() => {
      notification.remove();
    }, 300);
  },

  /**
   * Anima um valor numérico (contador)
   * @param {HTMLElement} element - Elemento que receberá o valor
   * @param {number} start - Valor inicial
   * @param {number} end - Valor final
   * @param {number} duration - Duração em ms
   * @param {function} formatter - Função para formatar o valor
   */
  animateValue(element, start, end, duration = 1000, formatter = val => val) {
    if (!this.config.enableAnimations) {
      element.textContent = formatter(end);
      return;
    }
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      element.textContent = formatter(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = formatter(end);
      }
    };
    
    window.requestAnimationFrame(step);
  },

  /**
   * Formata um número grande como K (mil), M (milhão), etc.
   * @param {number} num - Número a formatar
   * @param {number} decimals - Casas decimais
   * @returns {string} Número formatado
   */
  formatNumber(num, decimals = 2) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(decimals) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toString();
  },

  /**
   * Anima um elemento como "pulsando" para chamar atenção
   * @param {HTMLElement} element - Elemento para animar
   * @param {number} duration - Duração em ms
   * @param {number} count - Número de pulsos
   */
  pulseElement(element, duration = 1000, count = 3) {
    if (!this.config.enableAnimations) return;
    
    element.classList.add('pulse-animation');
    element.style.animationDuration = `${duration}ms`;
    
    if (count > 0) {
      element.style.animationIterationCount = count;
      setTimeout(() => {
        element.classList.remove('pulse-animation');
      }, duration * count);
    }
  },

  /**
   * Altera a proporção de um elemento de progresso com animação
   * @param {HTMLElement} element - Elemento de progresso (.progress-fill)
   * @param {number} targetPercent - Porcentagem alvo (0-100)
   * @param {number} duration - Duração em ms
   * @param {function} onComplete - Callback quando completar
   */
  animateProgress(element, targetPercent, duration = 1000, onComplete = null) {
    if (!element) return;

    // Se animações desabilitadas, apenas definir o valor
    if (!this.config.enableAnimations) {
      element.style.width = `${targetPercent}%`;
      if (onComplete) onComplete();
      return;
    }

    // Obter porcentagem atual
    const currentWidth = parseFloat(element.style.width || '0');
    const startPercent = isNaN(currentWidth) ? 0 : currentWidth;
    
    // Animar
    let startTime = null;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calcular valor intermediário
      const currentPercent = startPercent + (targetPercent - startPercent) * progress;
      element.style.width = `${currentPercent}%`;
      
      // Continuar animação se não tiver terminado
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };
    
    window.requestAnimationFrame(animate);
  },

  /**
   * Anima a entrada de elementos de uma coleção em sequência
   * @param {NodeList|Array} elements - Coleção de elementos
   * @param {string} animationClass - Classe com a animação
   * @param {number} delay - Atraso entre cada elemento em ms
   */
  staggerElements(elements, animationClass = 'fade-in', delay = 100) {
    if (!this.config.enableAnimations) {
      elements.forEach(el => el.style.opacity = 1);
      return;
    }
    
    Array.from(elements).forEach((el, index) => {
      setTimeout(() => {
        el.classList.add(animationClass);
      }, index * delay);
    });
  },

  /**
   * Adiciona efeito de destaque temporário a um elemento
   * @param {HTMLElement} element - Elemento para destacar
   * @param {string} className - Classe de destaque
   * @param {number} duration - Duração em ms
   */
  highlightElement(element, className = 'highlight', duration = 1500) {
    if (!element) return;
    
    element.classList.add(className);
    
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  },

  /**
   * Gera efeito de confetes na tela (para celebrações/conquistas)
   * @param {number} count - Número de confetes
   * @param {number} duration - Duração em ms
   */
  showConfetti(count = 100, duration = 3000) {
    if (!this.config.enableAnimations) return;
    
    // Criar container
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    // Cores para confetes
    const colors = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#3b82f6'];
    
    // Criar confetes
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Posição aleatória
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      // Animação com atraso aleatório
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      
      confettiContainer.appendChild(confetti);
    }
    
    // Remover após a duração
    setTimeout(() => {
      confettiContainer.classList.add('fade-out');
      setTimeout(() => {
        confettiContainer.remove();
      }, 1000);
    }, duration);
  }
};

// Auto-inicializar quando documento estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => RunesAnimations.init());
} else {
  RunesAnimations.init();
}

// Exportar para uso global
window.RunesAnimations = RunesAnimations; 
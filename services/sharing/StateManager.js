/**
 * RUNES Analytics Pro - Gerenciador de Estado para Compartilhamento
 * 
 * Este módulo gerencia a restauração do estado da aplicação a partir de URLs compartilhadas
 * e fornece métodos para integração com diferentes componentes da aplicação.
 */

class StateManager {
  constructor() {
    // Dependências
    this.sharingService = window.sharingService;
    
    // Verificar se o serviço está disponível
    if (!this.sharingService) {
      console.error('SharingService não encontrado. Certifique-se de carregar services/sharing/SharingService.js');
      return;
    }
    
    // Estado atual
    this.currentView = null;
    this.currentToken = null;
    this.currentPeriod = '30d';
    this.currentFilters = {};
    
    // Componentes registrados
    this.registeredComponents = {
      explorer: null,
      dashboard: null,
      whaleTracker: null
    };
    
    // Inicializar
    this.initialize();
  }
  
  /**
   * Inicializa o gerenciador de estado
   */
  initialize() {
    // Verificar e aplicar estado da URL, se existir
    this.checkForSharedState();
    
    // Adicionar listener para mudanças de navegação
    window.addEventListener('popstate', () => {
      this.checkForSharedState();
    });
  }
  
  /**
   * Verifica se há estado compartilhado na URL e o restaura
   */
  checkForSharedState() {
    // Obter estado da URL atual
    const sharedState = this.sharingService.getStateFromUrl();
    
    if (sharedState) {
      console.log('Estado compartilhado encontrado na URL:', sharedState);
      
      // Tentar restaurar o estado
      this.restoreApplicationState(sharedState)
        .then(() => {
          console.log('Estado restaurado com sucesso');
          
          // Feedback visual se RunesAnimations estiver disponível
          if (window.RunesAnimations) {
            RunesAnimations.showNotification({
              type: 'info',
              title: 'Visualização Compartilhada',
              message: 'Estado da aplicação restaurado com sucesso'
            });
          }
        })
        .catch(error => {
          console.error('Erro ao restaurar estado:', error);
          
          // Feedback visual para erro
          if (window.RunesAnimations) {
            RunesAnimations.showNotification({
              type: 'error',
              title: 'Erro ao Restaurar Estado',
              message: error.message || 'Não foi possível restaurar o estado compartilhado'
            });
          }
        });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Registra componentes da aplicação para integração
   * @param {string} type - Tipo de componente ('explorer', 'dashboard', 'whaleTracker')
   * @param {Object} component - Instância do componente
   */
  registerComponent(type, component) {
    if (!['explorer', 'dashboard', 'whaleTracker'].includes(type)) {
      console.warn(`Tipo de componente desconhecido: ${type}. Tipos válidos: explorer, dashboard, whaleTracker`);
      return false;
    }
    
    this.registeredComponents[type] = component;
    console.log(`Componente ${type} registrado com sucesso`);
    return true;
  }
  
  /**
   * Atualiza o estado atual da aplicação
   * @param {Object} state - Novo estado
   */
  updateCurrentState(state) {
    if (state.view) this.currentView = state.view;
    if (state.token) this.currentToken = state.token;
    if (state.period) this.currentPeriod = state.period;
    if (state.filters) this.currentFilters = state.filters;
  }
  
  /**
   * Restaura o estado da aplicação com base em um estado compartilhado
   * @param {Object} state - Estado a ser restaurado
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async restoreApplicationState(state) {
    // Verificar se é um estado válido
    if (!state || !state.view) {
      throw new Error('Estado inválido: view não especificada');
    }
    
    // Atualizar estado atual
    this.updateCurrentState(state);
    
    // Restaurar com base no tipo de visualização
    switch (state.view) {
      case 'token-details':
        return await this.restoreTokenDetailsView(state);
        
      case 'dashboard':
        return await this.restoreDashboardView(state);
        
      case 'whale-alert':
        return await this.restoreWhaleAlertView(state);
        
      case 'explorer':
        return await this.restoreExplorerView(state);
        
      default:
        throw new Error(`Tipo de visualização desconhecido: ${state.view}`);
    }
  }
  
  /**
   * Restaura visualização de detalhes de token
   * @param {Object} state - Estado a ser restaurado
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async restoreTokenDetailsView(state) {
    // Verificar se token foi especificado
    if (!state.token) {
      throw new Error('Token não especificado no estado');
    }
    
    const explorer = this.registeredComponents.explorer;
    
    // Verificar se explorer foi registrado
    if (!explorer) {
      // Tentar navegação alternativa
      if (typeof window.navigateToToken === 'function') {
        await window.navigateToToken(state.token, state.period || '30d');
        return true;
      }
      
      throw new Error('Explorador de tokens não registrado e função alternativa não encontrada');
    }
    
    // Navegar para o token usando o explorador
    if (typeof explorer.navigateToToken === 'function') {
      await explorer.navigateToToken(state.token, state.period || '30d');
      
      // Aplicar filtros específicos se existirem
      if (state.filters && typeof explorer.applyFilters === 'function') {
        explorer.applyFilters(state.filters);
      }
      
      return true;
    }
    
    throw new Error('O explorador registrado não possui método navigateToToken');
  }
  
  /**
   * Restaura visualização do dashboard
   * @param {Object} state - Estado a ser restaurado
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async restoreDashboardView(state) {
    const dashboard = this.registeredComponents.dashboard;
    
    // Verificar se dashboard foi registrado
    if (!dashboard) {
      // Tentar navegação alternativa
      if (typeof window.navigateToDashboard === 'function') {
        await window.navigateToDashboard();
        
        // Aplicar configurações se possível
        if (typeof window.applyDashboardSettings === 'function') {
          window.applyDashboardSettings(state);
        }
        
        return true;
      }
      
      throw new Error('Dashboard não registrado e função alternativa não encontrada');
    }
    
    // Navegar para o dashboard
    if (typeof dashboard.navigate === 'function') {
      await dashboard.navigate();
      
      // Aplicar configurações específicas
      if (state.period && typeof dashboard.setPeriod === 'function') {
        dashboard.setPeriod(state.period);
      }
      
      if (state.filters && typeof dashboard.applyFilters === 'function') {
        dashboard.applyFilters(state.filters);
      }
      
      if (state.metrics && typeof dashboard.setVisibleMetrics === 'function') {
        dashboard.setVisibleMetrics(state.metrics);
      }
      
      if (state.layout && typeof dashboard.setLayout === 'function') {
        dashboard.setLayout(state.layout);
      }
      
      return true;
    }
    
    throw new Error('O dashboard registrado não possui método navigate');
  }
  
  /**
   * Restaura visualização de alerta de baleia
   * @param {Object} state - Estado a ser restaurado
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async restoreWhaleAlertView(state) {
    // Verificar se token e txid foram especificados
    if (!state.token || !state.txid) {
      throw new Error('Token ou ID de transação não especificados no estado');
    }
    
    const whaleTracker = this.registeredComponents.whaleTracker;
    
    // Verificar se rastreador de baleias foi registrado
    if (!whaleTracker) {
      // Tentar função alternativa
      if (typeof window.openWhaleAlert === 'function') {
        await window.openWhaleAlert(state.token, state.txid);
        return true;
      }
      
      throw new Error('Rastreador de baleias não registrado e função alternativa não encontrada');
    }
    
    // Abrir alerta específico
    if (typeof whaleTracker.openAlert === 'function') {
      await whaleTracker.openAlert(state.token, state.txid);
      return true;
    }
    
    throw new Error('O rastreador de baleias registrado não possui método openAlert');
  }
  
  /**
   * Restaura visualização do explorador geral
   * @param {Object} state - Estado a ser restaurado
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async restoreExplorerView(state) {
    const explorer = this.registeredComponents.explorer;
    
    // Verificar se explorer foi registrado
    if (!explorer) {
      // Tentar navegação alternativa
      if (typeof window.navigateToExplorer === 'function') {
        await window.navigateToExplorer();
        
        // Aplicar filtros se possível
        if (state.filters && typeof window.applyExplorerFilters === 'function') {
          window.applyExplorerFilters(state.filters);
        }
        
        return true;
      }
      
      throw new Error('Explorador não registrado e função alternativa não encontrada');
    }
    
    // Navegar para o explorador
    if (typeof explorer.navigate === 'function') {
      await explorer.navigate();
      
      // Aplicar filtros específicos
      if (state.filters && typeof explorer.applyFilters === 'function') {
        explorer.applyFilters(state.filters);
      }
      
      // Aplicar ordenação
      if (state.sort && typeof explorer.applySorting === 'function') {
        explorer.applySorting(state.sort);
      }
      
      // Aplicar visualização (grid/lista)
      if (state.viewMode && typeof explorer.setViewMode === 'function') {
        explorer.setViewMode(state.viewMode);
      }
      
      return true;
    }
    
    throw new Error('O explorador registrado não possui método navigate');
  }
  
  /**
   * Obtém estado atual da aplicação para compartilhamento
   * @param {string} view - Tipo de visualização atual
   * @returns {Object} - Estado atual
   */
  getCurrentState(view = null) {
    // Usar view especificada ou atual
    const currentView = view || this.currentView || 'dashboard';
    
    // Estado básico
    const state = {
      view: currentView,
      timestamp: new Date().toISOString()
    };
    
    // Adicionar dados específicos com base na visualização
    switch (currentView) {
      case 'token-details':
        if (this.currentToken) state.token = this.currentToken;
        if (this.currentPeriod) state.period = this.currentPeriod;
        break;
        
      case 'dashboard':
        if (this.currentPeriod) state.period = this.currentPeriod;
        
        // Obter configurações do dashboard registrado
        const dashboard = this.registeredComponents.dashboard;
        if (dashboard) {
          if (typeof dashboard.getFilters === 'function') {
            state.filters = dashboard.getFilters();
          }
          
          if (typeof dashboard.getVisibleMetrics === 'function') {
            state.metrics = dashboard.getVisibleMetrics();
          }
          
          if (typeof dashboard.getLayout === 'function') {
            state.layout = dashboard.getLayout();
          }
        }
        break;
        
      case 'explorer':
        // Obter configurações do explorador registrado
        const explorer = this.registeredComponents.explorer;
        if (explorer) {
          if (typeof explorer.getFilters === 'function') {
            state.filters = explorer.getFilters();
          }
          
          if (typeof explorer.getSorting === 'function') {
            state.sort = explorer.getSorting();
          }
          
          if (typeof explorer.getViewMode === 'function') {
            state.viewMode = explorer.getViewMode();
          }
        }
        break;
    }
    
    return state;
  }
  
  /**
   * Gera URL compartilhável para o estado atual
   * @param {string} view - Tipo de visualização (opcional)
   * @param {Object} additionalState - Estado adicional a ser incluído
   * @param {Object} options - Opções para geração da URL
   * @returns {Promise<string>} - URL compartilhável
   */
  async generateShareableUrl(view = null, additionalState = {}, options = {}) {
    // Obter estado atual
    const currentState = this.getCurrentState(view);
    
    // Mesclar com estado adicional
    const state = { ...currentState, ...additionalState };
    
    // Gerar URL compartilhável
    return await this.sharingService.generateShareableUrl(state, options);
  }
}

// Criar e exportar singleton
const stateManager = new StateManager();

// Exportar para uso no navegador
if (typeof window !== 'undefined') {
  window.stateManager = stateManager;
}

// Exportar como módulo se disponível
if (typeof module !== 'undefined') {
  module.exports = stateManager;
} 
/**
 * RUNES Analytics Pro - Componente de Detalhes de Rune
 * 
 * Demonstração do uso do sistema unificado de API para exibir detalhes de uma rune específica
 * Versão aprimorada com novas animações e melhorias visuais
 */

class RuneDetails {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.currentRune = null;
    this.isLoading = false;
    
    // Verificar se o container existe
    if (!this.container) {
      console.error(`Container #${containerId} não encontrado`);
      return;
    }
    
    // Inicializar o componente
    this.initialize();
  }
  
  /**
   * Inicializa o componente
   */
  initialize() {
    // Criar estrutura básica
    this.container.innerHTML = `
      <div class="card rune-detail-card">
        <div class="card-header">
          <div class="search-container form-group">
            <input type="text" id="${this.containerId}-search" placeholder="Pesquisar rune (ex: PEPE, MEME)" class="form-input">
            <button id="${this.containerId}-search-btn" class="btn btn-primary">
              <i class="fas fa-search"></i>
              Buscar
            </button>
          </div>
          
          <div class="api-selector form-group">
            <label class="form-label">API Preferida:</label>
            <select id="${this.containerId}-api-selector" class="form-select">
              <option value="ordiscan">Ordiscan</option>
              <option value="geniidata">Geniidata</option>
            </select>
          </div>
        </div>
        
        <div class="rune-details-content">
          <div id="${this.containerId}-loading" class="loading-indicator" style="display: none;">
            <div class="spinner"></div>
            <p>Carregando dados...</p>
          </div>
          
          <div id="${this.containerId}-error" class="error-message" style="display: none;"></div>
          
          <div id="${this.containerId}-content">
            <div class="placeholder-message">
              <i class="fas fa-search fa-3x"></i>
              <p>Digite o nome de uma rune e clique em "Buscar" para visualizar seus detalhes</p>
            </div>
          </div>
        </div>
        
        <div class="card-footer">
          <div class="stats-container">
            <div id="${this.containerId}-stats" class="api-stats">
              <span data-tooltip="Status do cache">
                <i class="fas fa-database"></i>
                Cache: <span id="${this.containerId}-cache-status">-</span>
              </span>
              <span data-tooltip="Tempo de resposta">
                <i class="fas fa-clock"></i>
                Latência: <span id="${this.containerId}-latency">-</span>
              </span>
              <span data-tooltip="Origem dos dados">
                <i class="fas fa-server"></i>
                Fonte: <span id="${this.containerId}-source">-</span>
              </span>
            </div>
          </div>
          <div class="action-buttons">
            <button id="${this.containerId}-refresh" class="btn btn-outline" disabled>
              <i class="fas fa-sync-alt"></i> Atualizar
            </button>
            <button id="${this.containerId}-clear-cache" class="btn btn-outline" disabled>
              <i class="fas fa-trash-alt"></i> Limpar Cache
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Adicionar estilos
    this.addStyles();
    
    // Adicionar eventos
    this.setupEvents();
  }
  
  /**
   * Adiciona estilos CSS ao componente
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .rune-details-container {
        font-family: 'Inter', sans-serif;
        background: #1a1a2e;
        border-radius: 12px;
        color: #e6e6e6;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        margin-bottom: 24px;
      }
      
      .rune-details-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      
      .search-container {
        display: flex;
        flex: 1;
        max-width: 500px;
      }
      
      .search-input {
        flex: 1;
        padding: 10px 15px;
        border: none;
        border-radius: 6px 0 0 6px;
        background: #252547;
        color: #e6e6e6;
        font-size: 14px;
      }
      
      .search-button {
        background: #5352ed;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 0 6px 6px 0;
        cursor: pointer;
        transition: background 0.3s ease;
      }
      
      .search-button:hover {
        background: #3f3fce;
      }
      
      .api-selector {
        display: flex;
        align-items: center;
        margin-left: 15px;
      }
      
      .api-selector label {
        margin-right: 10px;
        font-size: 14px;
      }
      
      .api-selector select {
        background: #252547;
        color: #e6e6e6;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
      }
      
      .rune-details-content {
        background: #252547;
        border-radius: 8px;
        padding: 20px;
        min-height: 200px;
        position: relative;
      }
      
      .loading-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(37, 37, 71, 0.8);
        z-index: 10;
        border-radius: 8px;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #5352ed;
        border-left-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      }
      
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
      
      .error-message {
        background: rgba(255, 71, 87, 0.2);
        color: #ff4757;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 15px;
        border-left: 4px solid #ff4757;
      }
      
      .placeholder-message {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a0a0c0;
        min-height: 150px;
        text-align: center;
      }
      
      .rune-info {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }
      
      .rune-header {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .rune-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
      }
      
      .rune-id {
        margin-left: 15px;
        background: rgba(83, 82, 237, 0.2);
        color: #5352ed;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 14px;
      }
      
      .info-card {
        background: rgba(26, 26, 46, 0.5);
        border-radius: 8px;
        padding: 15px;
      }
      
      .info-card h3 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 16px;
        color: #a0a0c0;
      }
      
      .info-value {
        font-size: 24px;
        font-weight: 700;
      }
      
      .rune-details-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        flex-wrap: wrap;
      }
      
      .api-stats {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: #a0a0c0;
      }
      
      .action-buttons {
        display: flex;
        gap: 10px;
      }
      
      .refresh-button, .clear-cache-button {
        border: none;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s ease;
        font-size: 13px;
      }
      
      .refresh-button {
        background: #5352ed;
        color: white;
      }
      
      .refresh-button:hover {
        background: #3f3fce;
      }
      
      .clear-cache-button {
        background: #ff4757;
        color: white;
      }
      
      .clear-cache-button:hover {
        background: #e03347;
      }
      
      .refresh-button:disabled, .clear-cache-button:disabled {
        background: #555;
        cursor: not-allowed;
        opacity: 0.7;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Configura eventos para os elementos do componente
   */
  setupEvents() {
    // Botão de busca
    const searchBtn = document.getElementById(`${this.containerId}-search-btn`);
    const searchInput = document.getElementById(`${this.containerId}-search`);
    const apiSelector = document.getElementById(`${this.containerId}-api-selector`);
    const refreshBtn = document.getElementById(`${this.containerId}-refresh`);
    const clearCacheBtn = document.getElementById(`${this.containerId}-clear-cache`);
    
    // Evento de busca
    searchBtn.addEventListener('click', () => {
      const runeName = searchInput.value.trim().toUpperCase();
      if (runeName) {
        this.loadRuneDetails(runeName);
      } else {
        // Efeito visual de erro no campo
        searchInput.parentElement.classList.add('form-group-error');
        
        // Adicionar mensagem de erro se não existir
        if (!searchInput.parentElement.querySelector('.form-error-message')) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'form-error-message';
          errorMsg.textContent = 'Digite o nome de uma rune';
          searchInput.parentElement.appendChild(errorMsg);
          
          // Animar mensagem de erro
          setTimeout(() => {
            errorMsg.classList.add('show');
          }, 10);
          
          // Remover após algum tempo
          setTimeout(() => {
            searchInput.parentElement.classList.remove('form-group-error');
            errorMsg.classList.remove('show');
            setTimeout(() => errorMsg.remove(), 300);
          }, 3000);
        }
      }
    });
    
    // Evento de tecla Enter no input
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        const runeName = searchInput.value.trim().toUpperCase();
        if (runeName) {
          this.loadRuneDetails(runeName);
        }
      }
      
      // Remover classe de erro ao digitar
      if (searchInput.parentElement.classList.contains('form-group-error')) {
        searchInput.parentElement.classList.remove('form-group-error');
        const errorMsg = searchInput.parentElement.querySelector('.form-error-message');
        if (errorMsg) {
          errorMsg.classList.remove('show');
          setTimeout(() => errorMsg.remove(), 300);
        }
      }
    });
    
    // Evento de mudança de API
    apiSelector.addEventListener('change', (event) => {
      const selectedApi = event.target.value;
      
      // Atualizar API preferida no serviço
      window.runesApi.setPreferredApi('runeDetails', selectedApi);
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'info',
          title: 'API Alterada',
          message: `API preferida alterada para ${selectedApi}`
        });
      }
      
      // Recarregar dados se já houver uma rune selecionada
      if (this.currentRune) {
        this.loadRuneDetails(this.currentRune, true);
      }
    });
    
    // Evento de atualizar
    refreshBtn.addEventListener('click', (e) => {
      if (this.currentRune) {
        // Adicionar animação ao botão
        e.currentTarget.classList.add('rotating');
        
        // Recarregar dados
        this.loadRuneDetails(this.currentRune, true).then(() => {
          // Remover animação
          setTimeout(() => {
            e.currentTarget.classList.remove('rotating');
          }, 500);
        });
      }
    });
    
    // Evento de limpar cache
    clearCacheBtn.addEventListener('click', () => {
      if (this.currentRune) {
        // Desabilitar botão durante a operação
        clearCacheBtn.disabled = true;
        
        window.runesApi.invalidateRuneCache(this.currentRune)
          .then(() => {
            // Feedback visual
            if (window.RunesAnimations) {
              RunesAnimations.showNotification({
                type: 'success',
                title: 'Cache Limpo',
                message: `Cache para rune ${this.currentRune} foi limpo com sucesso`
              });
            }
            
            // Recarregar dados
            return this.loadRuneDetails(this.currentRune, true);
          })
          .finally(() => {
            // Re-habilitar botão
            clearCacheBtn.disabled = false;
          });
      }
    });
  }
  
  /**
   * Carrega e exibe os detalhes de uma rune
   * 
   * @param {string} runeName - Nome/tick da rune
   * @param {boolean} refresh - Força dados frescos
   * @returns {Promise} - Promise da requisição
   */
  async loadRuneDetails(runeName, refresh = false) {
    // Guardar a rune atual
    this.currentRune = runeName;
    
    // Atualizar estado de carregamento
    this.setLoading(true);
    this.hideError();
    
    // Habilitar botões
    document.getElementById(`${this.containerId}-refresh`).disabled = false;
    document.getElementById(`${this.containerId}-clear-cache`).disabled = false;
    
    try {
      // Solicitar detalhes da rune usando o serviço unificado
      const result = await window.runesApi.getRuneDetails(runeName, refresh);
      
      // Exibir dados
      this.displayRuneDetails(result.data, result);
      
      // Atualizar informações de estatísticas
      this.updateStats(result);
      
      return result;
    } catch (error) {
      console.error('Erro ao carregar detalhes da rune:', error);
      this.showError(`Erro ao carregar dados: ${error.message || 'Falha na requisição'}`);
      
      // Mostrar notificação se disponível
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'error',
          title: 'Erro ao Carregar Dados',
          message: error.message || 'Falha na requisição'
        });
      }
      
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Exibe os detalhes da rune na interface
   * 
   * @param {Object} rune - Dados da rune
   * @param {Object} metadata - Metadados da requisição
   */
  displayRuneDetails(rune, metadata) {
    const contentContainer = document.getElementById(`${this.containerId}-content`);
    
    // Verificar se temos dados válidos
    if (!rune) {
      contentContainer.innerHTML = `
        <div class="placeholder-message">
          <i class="fas fa-exclamation-circle fa-3x"></i>
          <p>Nenhum dado encontrado para a rune "${this.currentRune}"</p>
        </div>
      `;
      return;
    }
    
    // Formatar números grandes
    const formatNumber = (num) => {
      if (typeof num !== 'number') return 'N/A';
      
      if (window.RunesAnimations && RunesAnimations.formatNumber) {
        return RunesAnimations.formatNumber(num);
      }
      
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + ' B';
      } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + ' M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + ' K';
      }
      return num.toString();
    };
    
    // Formatar data
    const formatDate = (dateString) => {
      if (!dateString) return 'Desconhecido';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Calcular porcentagem da oferta máxima
    const supplyPercentage = rune.max > 0 ? ((rune.supply / rune.max) * 100).toFixed(2) : 0;
    
    // Atualizar conteúdo
    contentContainer.innerHTML = `
      <div class="rune-detail-header">
        <div class="rune-detail-icon" data-animate="fade-in">
          ${rune.tick.substring(0, 2)}
        </div>
        
        <div class="rune-detail-info">
          <div class="rune-detail-name" data-animate="slide-in-right" data-delay="100">
            ${rune.tick}
            <span class="rune-detail-id">${rune.rune_id || rune.tick}</span>
          </div>
          
          <div class="rune-creation-info" data-animate="slide-in-right" data-delay="200">
            Criado em ${formatDate(rune.mint_time)}
          </div>
        </div>
      </div>
      
      <div class="rune-detail-stats">
        <div class="rune-stat-item" data-animate="slide-in-up" data-delay="100">
          <div class="rune-stat-label">
            <i class="fas fa-chart-pie"></i>
            Oferta Máxima
          </div>
          <div class="rune-stat-value">${formatNumber(rune.max)}</div>
        </div>
        
        <div class="rune-stat-item" data-animate="slide-in-up" data-delay="200">
          <div class="rune-stat-label">
            <i class="fas fa-coins"></i>
            Oferta Atual
          </div>
          <div class="rune-stat-value">${formatNumber(rune.supply)}</div>
          <div class="supply-percentage">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${supplyPercentage}%"></div>
            </div>
            <span class="percentage-text">${supplyPercentage}% do máximo</span>
          </div>
        </div>
        
        <div class="rune-stat-item" data-animate="slide-in-up" data-delay="300">
          <div class="rune-stat-label">
            <i class="fas fa-users"></i>
            Holders
          </div>
          <div class="rune-stat-value">${formatNumber(rune.holders)}</div>
        </div>
        
        <div class="rune-stat-item" data-animate="slide-in-up" data-delay="400">
          <div class="rune-stat-label">
            <i class="fas fa-hashtag"></i>
            Decimais
          </div>
          <div class="rune-stat-value">${rune.decimals || 0}</div>
        </div>
      </div>
      
      <div class="rune-detail-description" data-animate="fade-in" data-delay="500">
        <p>Últimas transações: ${formatDate(rune.mint_time)}</p>
        <p class="transaction-id">
          <small>Transaction ID: ${rune.latest_tx_id || 'Desconhecido'}</small>
        </p>
      </div>
      
      <div class="action-group" data-animate="fade-in" data-delay="600">
        <button class="btn btn-primary view-transactions-btn">
          <i class="fas fa-exchange-alt"></i> Ver Transações
        </button>
        
        <button class="btn btn-outline view-holders-btn">
          <i class="fas fa-users"></i> Ver Holders
        </button>
        
        <button class="btn btn-outline check-market-btn">
          <i class="fas fa-chart-line"></i> Ver Mercado
        </button>
      </div>
    `;
    
    // Inicializar animações se disponível
    if (window.RunesAnimations && RunesAnimations.setupIntersectionObserver) {
      RunesAnimations.setupIntersectionObserver();
    }
    
    // Configurar ações dos botões
    const viewTxBtn = contentContainer.querySelector('.view-transactions-btn');
    const viewHoldersBtn = contentContainer.querySelector('.view-holders-btn');
    const viewMarketBtn = contentContainer.querySelector('.check-market-btn');
    
    viewTxBtn.addEventListener('click', () => {
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'info',
          title: 'Funcionalidade em Desenvolvimento',
          message: 'A visualização de transações estará disponível em breve'
        });
      }
    });
    
    viewHoldersBtn.addEventListener('click', () => {
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'info',
          title: 'Funcionalidade em Desenvolvimento',
          message: 'A visualização de holders estará disponível em breve'
        });
      }
    });
    
    viewMarketBtn.addEventListener('click', () => {
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'info',
          title: 'Funcionalidade em Desenvolvimento',
          message: 'A visualização de dados de mercado estará disponível em breve'
        });
      }
    });
    
    // Animar entrada dos valores estatísticos se disponível
    if (window.RunesAnimations && RunesAnimations.animateValue) {
      const statsElements = contentContainer.querySelectorAll('.rune-stat-value');
      statsElements.forEach(element => {
        const value = element.textContent;
        element.textContent = '0';
        
        setTimeout(() => {
          if (value.includes(' ')) {
            // Se for número formatado com sufixo (K, M, B)
            const numValue = parseFloat(value.split(' ')[0]);
            const suffix = value.split(' ')[1];
            
            RunesAnimations.animateValue(
              element, 
              0, 
              numValue, 
              1000, 
              val => `${val.toFixed(2)} ${suffix}`
            );
          } else if (!isNaN(parseFloat(value))) {
            // Se for número simples
            RunesAnimations.animateValue(
              element, 
              0, 
              parseFloat(value), 
              1000
            );
          } else {
            // Caso não seja um número
            element.textContent = value;
          }
        }, 500); // Pequeno atraso para coincidir com animações de entrada
      });
      
      // Animar barra de progresso
      const progressFill = contentContainer.querySelector('.progress-fill');
      if (progressFill) {
        setTimeout(() => {
          RunesAnimations.animateProgress(progressFill, supplyPercentage, 1000);
        }, 700);
      }
    }
  }
  
  /**
   * Atualiza as estatísticas da API exibidas no rodapé
   * 
   * @param {Object} result - Resultado da requisição
   */
  updateStats(result) {
    const cacheStatus = document.getElementById(`${this.containerId}-cache-status`);
    const latency = document.getElementById(`${this.containerId}-latency`);
    const source = document.getElementById(`${this.containerId}-source`);
    
    // Atualizar textos
    cacheStatus.textContent = result.fromCache ? 'HIT ✓' : 'MISS ✗';
    latency.textContent = `${result.latency || 0}ms`;
    source.textContent = result.source || 'desconhecido';
    
    // Adicionar classe para estilizar
    cacheStatus.className = '';
    cacheStatus.classList.add(result.fromCache ? 'cache-hit' : 'cache-miss');
    
    // Destacar elemento alterado se disponível
    if (window.RunesAnimations && RunesAnimations.highlightElement) {
      RunesAnimations.highlightElement(cacheStatus, 'highlight');
      RunesAnimations.highlightElement(latency, 'highlight');
      RunesAnimations.highlightElement(source, 'highlight');
    }
  }
  
  /**
   * Alterna o estado de carregamento da interface
   * 
   * @param {boolean} isLoading - Se deve mostrar o indicador de carregamento
   */
  setLoading(isLoading) {
    this.isLoading = isLoading;
    const loadingElement = document.getElementById(`${this.containerId}-loading`);
    
    if (loadingElement) {
      loadingElement.style.display = isLoading ? 'flex' : 'none';
    }
    
    // Desabilitar elementos de interação durante o carregamento
    const searchInput = document.getElementById(`${this.containerId}-search`);
    const searchBtn = document.getElementById(`${this.containerId}-search-btn`);
    const apiSelector = document.getElementById(`${this.containerId}-api-selector`);
    
    if (searchInput) searchInput.disabled = isLoading;
    if (searchBtn) searchBtn.disabled = isLoading;
    if (apiSelector) apiSelector.disabled = isLoading;
  }
  
  /**
   * Exibe uma mensagem de erro
   * 
   * @param {string} message - Mensagem de erro
   */
  showError(message) {
    const errorElement = document.getElementById(`${this.containerId}-error`);
    
    if (errorElement) {
      errorElement.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
      `;
      errorElement.style.display = 'block';
      
      // Animar entrada se disponível
      if (window.RunesAnimations) {
        errorElement.classList.add('fade-in');
      }
    }
  }
  
  /**
   * Esconde a mensagem de erro
   */
  hideError() {
    const errorElement = document.getElementById(`${this.containerId}-error`);
    
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.classList.remove('fade-in');
    }
  }
  
  /**
   * Verifica se o serviço de API está disponível
   * 
   * @returns {boolean} - true se o serviço estiver disponível
   */
  isApiAvailable() {
    return window.runesApi !== undefined;
  }
}

// Exportar para uso no navegador
if (typeof window !== 'undefined') {
  window.RuneDetails = RuneDetails;
}

// Exportar como módulo se disponível
if (typeof module !== 'undefined') {
  module.exports = RuneDetails;
} 
/**
 * RUNES Analytics Pro - API Demo
 * 
 * Este módulo demonstra o funcionamento do sistema de APIs
 * unificadas do RUNES Analytics Pro, com recursos de cache,
 * fallback e abstração de múltiplas fontes de dados.
 */

// Importa o sistema de tradução
import { t, initLanguage, onLanguageChange } from './i18n.js';

// Classe do gerenciador de APIs
class ApiManager {
  constructor() {
    this.totalRequests = 0;
    this.cacheHits = 0;
    this.avgResponseTime = 0;
    this.fallbacksTriggered = 0;
    this.serviceStatus = {
      tokens: { status: 'connecting', responseTime: 0 },
      market: { status: 'connecting', responseTime: 0 },
      whales: { status: 'connecting', responseTime: 0 },
      social: { status: 'connecting', responseTime: 0 },
      blockchain: { status: 'connecting', responseTime: 0 }
    };
    
    // Inicializa os serviços
    this.init();
  }
  
  async init() {
    // Inicializa o sistema de tradução
    await initLanguage();
    
    // Inicializa os serviços com um pequeno delay para simulação
    setTimeout(() => {
      this.updateServiceStatus();
      this.updateStats();
    }, 1000);
    
    // Registra listener de mudança de idioma
    onLanguageChange(() => {
      this.updateUI();
    });
    
    // Adiciona event listeners para os botões
    this.addEventListeners();
  }
  
  addEventListeners() {
    // Botões de ação
    document.getElementById('load-token-btn')?.addEventListener('click', () => this.loadTokenData());
    document.getElementById('load-market-btn')?.addEventListener('click', () => this.loadMarketData());
    document.getElementById('load-whale-btn')?.addEventListener('click', () => this.loadWhaleData());
    document.getElementById('clear-cache-btn')?.addEventListener('click', () => this.clearCache());
    document.getElementById('test-fallback-btn')?.addEventListener('click', () => this.testFallback());
    
    // Campo de busca
    const searchInput = document.getElementById('token-search');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchToken(e.target.value);
        }
      });
    }
    
    // Define a função renderMeshPanel para a sincronização
    window.renderMeshPanel = () => {
      this.updateStats();
      this.updateServiceStatus();
      this.updateUI();
      
      // Atualiza o painel de mesh da API
      const meshPanel = document.getElementById('api-mesh-panel');
      if (meshPanel) {
        meshPanel.innerHTML = `
          <h2>${t('api_status')}</h2>
          <p>${new Date().toLocaleTimeString()}</p>
          <div class="status-good">${t('sync_complete')} ✓</div>
        `;
      }
    };
  }
  
  updateStats() {
    // Simula incremento nas estatísticas
    this.totalRequests += Math.floor(Math.random() * 5) + 1;
    this.cacheHits += Math.floor(Math.random() * 3);
    this.avgResponseTime = Math.floor(Math.random() * 150) + 50;
    
    // Atualiza a UI
    document.getElementById('stat-total-requests')?.textContent = this.totalRequests;
    document.getElementById('stat-cache-hits')?.textContent = this.cacheHits;
    document.getElementById('stat-avg-response')?.querySelector('span').textContent = this.avgResponseTime;
    document.getElementById('stat-fallbacks')?.textContent = this.fallbacksTriggered;
  }
  
  updateServiceStatus() {
    // Simula status dos serviços
    const statuses = ['online', 'online', 'online', 'degraded', 'offline'];
    const services = Object.keys(this.serviceStatus);
    
    // Atualiza status aleatório para cada serviço
    services.forEach(service => {
      const randomIndex = Math.floor(Math.random() * 10); // Maior probabilidade para os primeiros status (online)
      const status = statuses[randomIndex >= statuses.length ? 0 : randomIndex];
      const responseTime = status === 'online' ? 
                           Math.floor(Math.random() * 100) + 20 : 
                           Math.floor(Math.random() * 300) + 150;
      
      this.serviceStatus[service] = {
        status,
        responseTime
      };
      
      // Atualiza o elemento na UI
      const statusElement = document.getElementById(`${service}-service-status`);
      if (statusElement) {
        const statusClass = this.getStatusClass(status);
        statusElement.className = `api-status ${statusClass}`;
        statusElement.textContent = this.getStatusTranslation(status);
      }
    });
    
    // Atualiza a tabela de status
    this.updateStatusTable();
  }
  
  updateStatusTable() {
    const tableBody = document.getElementById('api-status-table')?.querySelector('tbody');
    if (!tableBody) return;
    
    // Limpa a tabela
    tableBody.innerHTML = '';
    
    // Adiciona uma linha para cada serviço
    Object.entries(this.serviceStatus).forEach(([serviceKey, serviceData]) => {
      const row = document.createElement('tr');
      const statusClass = this.getStatusClass(serviceData.status);
      
      row.innerHTML = `
        <td>${this.getServiceName(serviceKey)}</td>
        <td><span class="badge ${statusClass}">${this.getStatusTranslation(serviceData.status)}</span></td>
        <td>${serviceData.responseTime} ms</td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  getStatusClass(status) {
    switch (status) {
      case 'online': return 'success';
      case 'degraded': return 'warning';
      case 'offline': return 'danger';
      default: return 'secondary';
    }
  }
  
  getStatusTranslation(status) {
    return t(`status.${status}`);
  }
  
  getServiceName(serviceKey) {
    const serviceKeyMap = {
      'tokens': 'tokens_data',
      'market': 'market_data',
      'whales': 'whale_activity',
      'social': 'social_sentiment',
      'blockchain': 'blockchain_data'
    };
    
    return t(serviceKeyMap[serviceKey] || serviceKey);
  }
  
  // Métodos de simulação de API
  
  loadTokenData() {
    this.simulateApiCall('tokens');
  }
  
  loadMarketData() {
    this.simulateApiCall('market');
  }
  
  loadWhaleData() {
    this.simulateApiCall('whales');
  }
  
  clearCache() {
    // Simula limpeza do cache
    alert(t('clear_cache') + ' ✓');
    this.cacheHits = 0;
    document.getElementById('stat-cache-hits').textContent = '0';
  }
  
  testFallback() {
    // Simula um fallback entre APIs
    this.fallbacksTriggered++;
    document.getElementById('stat-fallbacks').textContent = this.fallbacksTriggered;
    
    // Simula degradação e recuperação de um serviço
    const services = Object.keys(this.serviceStatus);
    const service = services[Math.floor(Math.random() * services.length)];
    
    this.serviceStatus[service].status = 'degraded';
    const statusElement = document.getElementById(`${service}-service-status`);
    if (statusElement) {
      statusElement.className = 'api-status warning';
      statusElement.textContent = this.getStatusTranslation('degraded');
    }
    
    // Atualiza a tabela de status
    this.updateStatusTable();
    
    // Após alguns segundos, recupera o serviço
    setTimeout(() => {
      this.serviceStatus[service].status = 'online';
      this.serviceStatus[service].responseTime = Math.floor(Math.random() * 100) + 20;
      
      if (statusElement) {
        statusElement.className = 'api-status success';
        statusElement.textContent = this.getStatusTranslation('online');
      }
      
      // Atualiza a tabela de status
      this.updateStatusTable();
    }, 3000);
  }
  
  searchToken(ticker) {
    if (!ticker) return;
    
    // Simula uma pesquisa
    this.simulateApiCall('tokens', () => {
      const resultsContainer = document.getElementById('token-results');
      if (!resultsContainer) return;
      
      ticker = ticker.toUpperCase();
      
      // Gera dados simulados para o token
      const tokenData = {
        ticker: ticker,
        name: `${ticker} Token`,
        price: '$' + (Math.random() * 1000).toFixed(2),
        marketCap: '$' + (Math.random() * 1000000000).toFixed(0),
        volume24h: '$' + (Math.random() * 10000000).toFixed(0),
        change24h: ((Math.random() * 20) - 10).toFixed(2) + '%',
        runeData: {
          supply: Math.floor(Math.random() * 100000000),
          holders: Math.floor(Math.random() * 10000),
          transactions: Math.floor(Math.random() * 1000000)
        }
      };
      
      // Renderiza os resultados
      resultsContainer.innerHTML = `
        <div class="token-result">
          <h4>${tokenData.name} (${tokenData.ticker})</h4>
          <div class="token-data-grid">
            <div>
              <label>${t('price')}:</label>
              <span class="value">${tokenData.price}</span>
            </div>
            <div>
              <label>${t('market_cap')}:</label>
              <span class="value">${tokenData.marketCap}</span>
            </div>
            <div>
              <label>${t('volume_24h')}:</label>
              <span class="value">${tokenData.volume24h}</span>
            </div>
            <div>
              <label>${t('change_24h')}:</label>
              <span class="value ${parseFloat(tokenData.change24h) >= 0 ? 'positive' : 'negative'}">${tokenData.change24h}</span>
            </div>
            <div>
              <label>${t('supply')}:</label>
              <span class="value">${tokenData.runeData.supply.toLocaleString()}</span>
            </div>
            <div>
              <label>${t('holders')}:</label>
              <span class="value">${tokenData.runeData.holders.toLocaleString()}</span>
            </div>
            <div>
              <label>${t('transactions')}:</label>
              <span class="value">${tokenData.runeData.transactions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  simulateApiCall(service, callback) {
    // Simula um spinner ou estado de carregamento
    const statusElement = document.getElementById(`${service}-service-status`);
    if (statusElement) {
      statusElement.className = 'api-status loading';
      statusElement.textContent = t('loading');
    }
    
    // Atualiza estatísticas
    this.totalRequests++;
    document.getElementById('stat-total-requests').textContent = this.totalRequests;
    
    // Simula um tempo de resposta da API
    const responseTime = Math.floor(Math.random() * 1000) + 300;
    setTimeout(() => {
      // Atualiza o status do serviço
      if (statusElement) {
        statusElement.className = 'api-status success';
        statusElement.textContent = this.getStatusTranslation('online');
      }
      
      // Atualiza o tempo médio de resposta
      this.serviceStatus[service].responseTime = responseTime;
      this.avgResponseTime = Math.floor((this.avgResponseTime + responseTime) / 2);
      document.getElementById('stat-avg-response').querySelector('span').textContent = this.avgResponseTime;
      
      // Atualiza a tabela de status
      this.updateStatusTable();
      
      // Executa o callback se fornecido
      if (typeof callback === 'function') {
        callback();
      }
    }, 1000);
  }
  
  updateUI() {
    // Atualiza todas as traduções da interface
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = t(key);
    });
    
    // Atualiza os placeholders dos inputs
    document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
      const key = input.getAttribute('data-i18n-placeholder');
      input.placeholder = t(key);
    });
    
    // Atualiza a tabela de status
    this.updateStatusTable();
  }
}

// Inicializa o gerenciador de APIs
const apiManager = new ApiManager();

// Exporta e torna disponível globalmente
if (typeof window !== 'undefined') {
  window.apiManager = apiManager;
}

export default apiManager; 
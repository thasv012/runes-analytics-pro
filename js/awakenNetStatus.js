/**
 * RUNES Analytics Pro - AwakenNet Storage Node Monitor
 * Módulo para monitoramento de nós de armazenamento da malha AwakenNet
 */

class AwakenNetStorageMonitor {
  /**
   * Inicializa o monitor de nós de armazenamento
   * @param {Object} options - Opções de configuração
   * @param {string} options.containerId - ID do elemento para exibir a interface
   * @param {string} options.configPath - Caminho para arquivo de configuração
   */
  constructor(options = {}) {
    this.config = {
      containerId: options.containerId || 'awakenet-monitor',
      configPath: options.configPath || './api-demo/awakenet.config.json',
      refreshInterval: options.refreshInterval || 5000,
      chartColors: {
        storage: {
          used: '#5ce1e6',
          free: '#3a506b',
          border: '#ffffff20'
        },
        uptime: {
          primary: '#9d4edd',
          secondary: '#ff9e00',
          border: '#ffffff20'
        }
      }
    };
    
    // Estado do monitor
    this.nodes = [];
    this.refreshTimer = null;
    this.isInitialized = false;
    
    // Referências a elementos do DOM
    this.container = null;
    this.storageCharts = {};
    this.uptimeCharts = {};
    
    // Bind de métodos
    this.fetchNodeStatus = this.fetchNodeStatus.bind(this);
    this.renderNodeCards = this.renderNodeCards.bind(this);
    this.updateNodeData = this.updateNodeData.bind(this);
  }
  
  /**
   * Inicializa o monitor e exibe a interface
   * @returns {Promise} Promessa resolvida quando inicializado
   */
  async init() {
    try {
      // Obtém o elemento contêiner
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        throw new Error(`Container #${this.config.containerId} não encontrado`);
      }
      
      // Configura a interface
      this.setupUI();
      
      // Simula carregamento da configuração
      await this.loadMockConfig();
      
      // Inicializa os dados com os nós simulados
      this.renderNodeCards();
      
      // Inicia o timer de atualização
      this.startRefreshTimer();
      
      this.isInitialized = true;
      return this;
    } catch (error) {
      console.error('Erro ao inicializar AwakenNet Storage Monitor:', error);
      this.showError(error.message);
      throw error;
    }
  }
  
  /**
   * Configura a interface básica
   */
  setupUI() {
    // Limpa conteúdo anterior
    this.container.innerHTML = '';
    this.container.className = 'awakenet-monitor';
    
    // Estilo base (pode ser movido para CSS externo)
    const style = document.createElement('style');
    style.textContent = `
      .awakenet-monitor {
        font-family: 'Rajdhani', 'Inter', sans-serif;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        width: 100%;
      }
      
      .node-card {
        background: rgba(26, 26, 46, 0.8);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(92, 225, 230, 0.2);
        transition: all 0.3s ease;
        min-height: 280px;
      }
      
      .node-card:hover {
        box-shadow: 0 8px 32px rgba(92, 225, 230, 0.2);
        transform: translateY(-2px);
      }
      
      .node-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .node-icon {
        font-size: 20px;
        background: rgba(92, 225, 230, 0.2);
        color: #5ce1e6;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .node-info {
        flex: 1;
      }
      
      .node-name {
        font-size: 16px;
        font-weight: 600;
        color: #e0e0ff;
        margin: 0;
      }
      
      .node-endpoint {
        font-size: 12px;
        color: rgba(224, 224, 255, 0.6);
        margin: 0;
      }
      
      .node-status {
        display: inline-block;
        font-size: 12px;
        padding: 3px 8px;
        border-radius: 12px;
        font-weight: 500;
      }
      
      .status-online {
        background: rgba(85, 255, 85, 0.2);
        color: #55ff55;
      }
      
      .status-offline {
        background: rgba(255, 85, 85, 0.2);
        color: #ff5555;
      }
      
      .status-syncing {
        background: rgba(255, 170, 0, 0.2);
        color: #ffaa00;
      }
      
      .metrics-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-top: 15px;
      }
      
      .metric-card {
        background: rgba(30, 30, 60, 0.4);
        border-radius: 8px;
        padding: 10px;
      }
      
      .metric-title {
        font-size: 14px;
        color: #5ce1e6;
        margin: 0 0 10px 0;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .chart-container {
        height: 120px;
        width: 100%;
        position: relative;
      }
      
      .node-error {
        color: #ff5555;
        text-align: center;
        padding: 20px;
        font-size: 14px;
      }
    `;
    
    document.head.appendChild(style);
    
    // Container para nós
    const nodesContainer = document.createElement('div');
    nodesContainer.className = 'nodes-container';
    this.container.appendChild(nodesContainer);
  }
  
  /**
   * Carrega uma configuração de simulação
   * @returns {Promise} Promessa resolvida com dados simulados
   */
  async loadMockConfig() {
    // Simulação de carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dados simulados de nós
    this.nodes = [
      {
        id: 'storage-node-1',
        name: 'São Paulo Storage α',
        endpoint: '200.158.12.45:9000',
        status: 'online',
        type: 'storage',
        region: 'sa-east-1',
        storage: {
          total: 1024, // GB
          used: 358,   // GB
          free: 666    // GB
        },
        uptime: {
          days: 124,
          hours: 18,
          minutes: 43,
          seconds: 12
        },
        history: this.generateMockStorageHistory(30)
      },
      {
        id: 'storage-node-2',
        name: 'Frankfurt Storage β',
        endpoint: '192.168.45.20:9000',
        status: 'syncing',
        type: 'storage',
        region: 'eu-central-1',
        storage: {
          total: 2048, // GB
          used: 1240,  // GB
          free: 808    // GB
        },
        uptime: {
          days: 45,
          hours: 6,
          minutes: 12,
          seconds: 38
        },
        history: this.generateMockStorageHistory(30)
      },
      {
        id: 'storage-node-3',
        name: 'Tokyo Storage γ',
        endpoint: '217.33.128.4:9000',
        status: 'online',
        type: 'storage',
        region: 'ap-northeast-1',
        storage: {
          total: 4096, // GB
          used: 3120,  // GB
          free: 976    // GB
        },
        uptime: {
          days: 310,
          hours: 22,
          minutes: 5,
          seconds: 17
        },
        history: this.generateMockStorageHistory(30)
      },
      {
        id: 'storage-node-4',
        name: 'Virginia Storage δ',
        endpoint: '54.221.145.32:9000',
        status: 'offline',
        type: 'storage',
        region: 'us-east-1',
        storage: {
          total: 8192, // GB
          used: 0,     // GB (offline)
          free: 0      // GB (offline)
        },
        uptime: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        },
        history: this.generateMockStorageHistory(30, true)
      }
    ];
    
    return this.nodes;
  }
  
  /**
   * Gera histórico simulado para um nó
   * @param {number} days - Número de dias no histórico
   * @param {boolean} offline - Se o nó está offline
   * @returns {Array} Histórico simulado
   */
  generateMockStorageHistory(days, offline = false) {
    const history = [];
    const now = new Date();
    let usedStorage = Math.floor(Math.random() * 500) + 100; // GB iniciais aleatórios
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));
      
      if (!offline) {
        // Simula variação diária com tendência de aumento
        usedStorage += Math.floor(Math.random() * 30) - 5;
        usedStorage = Math.max(10, usedStorage); // Nunca menos que 10GB
        
        history.push({
          date: date.toISOString().split('T')[0],
          used: usedStorage,
          uptime: Math.min(100, 85 + Math.floor(Math.random() * 15)) // 85-100%
        });
      } else {
        // Para nós offline, o histórico mostra variação até ficar offline
        if (i < days - 2) {
          usedStorage += Math.floor(Math.random() * 30) - 5;
          usedStorage = Math.max(10, usedStorage);
          
          history.push({
            date: date.toISOString().split('T')[0],
            used: usedStorage,
            uptime: Math.min(100, 60 + Math.floor(Math.random() * 30))
          });
        } else {
          // Últimos 2 dias offline
          history.push({
            date: date.toISOString().split('T')[0],
            used: 0,
            uptime: 0
          });
        }
      }
    }
    
    return history;
  }
  
  /**
   * Renderiza os cards de cada nó
   */
  renderNodeCards() {
    // Limpa container
    const nodesContainer = this.container.querySelector('.nodes-container');
    nodesContainer.innerHTML = '';
    
    if (this.nodes.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'node-error';
      emptyMessage.textContent = 'Nenhum nó de armazenamento encontrado.';
      nodesContainer.appendChild(emptyMessage);
      return;
    }
    
    // Cria um card para cada nó
    this.nodes.forEach(node => {
      const card = this.createNodeCard(node);
      nodesContainer.appendChild(card);
    });
  }
  
  /**
   * Cria o card de um nó individual
   * @param {Object} node - Dados do nó
   * @returns {HTMLElement} Elemento do card
   */
  createNodeCard(node) {
    const card = document.createElement('div');
    card.className = 'node-card';
    card.id = `node-card-${node.id}`;
    
    // Cabeçalho com ícone e informações
    const header = document.createElement('div');
    header.className = 'node-header';
    
    const icon = document.createElement('div');
    icon.className = 'node-icon';
    icon.innerHTML = '🧠';
    
    const info = document.createElement('div');
    info.className = 'node-info';
    
    const name = document.createElement('h3');
    name.className = 'node-name';
    name.textContent = node.name;
    
    const endpoint = document.createElement('p');
    endpoint.className = 'node-endpoint';
    endpoint.textContent = node.endpoint;
    
    info.appendChild(name);
    info.appendChild(endpoint);
    
    const status = document.createElement('span');
    status.className = `node-status status-${node.status}`;
    status.textContent = this.formatStatus(node.status);
    
    header.appendChild(icon);
    header.appendChild(info);
    header.appendChild(status);
    
    // Container para as métricas
    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'metrics-container';
    
    // Card de Storage
    const storageCard = document.createElement('div');
    storageCard.className = 'metric-card';
    
    const storageTitle = document.createElement('h4');
    storageTitle.className = 'metric-title';
    storageTitle.innerHTML = '<span>💾</span> Armazenamento';
    
    const storageChart = document.createElement('div');
    storageChart.className = 'chart-container';
    storageChart.id = `storage-chart-${node.id}`;
    
    storageCard.appendChild(storageTitle);
    storageCard.appendChild(storageChart);
    
    // Card de Uptime
    const uptimeCard = document.createElement('div');
    uptimeCard.className = 'metric-card';
    
    const uptimeTitle = document.createElement('h4');
    uptimeTitle.className = 'metric-title';
    uptimeTitle.innerHTML = '<span>⏱️</span> Uptime';
    
    const uptimeDisplay = document.createElement('div');
    uptimeDisplay.className = 'chart-container';
    uptimeDisplay.id = `uptime-chart-${node.id}`;
    
    uptimeCard.appendChild(uptimeTitle);
    uptimeCard.appendChild(uptimeDisplay);
    
    // Adiciona os cards ao container
    metricsContainer.appendChild(storageCard);
    metricsContainer.appendChild(uptimeCard);
    
    // Adiciona todos os elementos ao card principal
    card.appendChild(header);
    card.appendChild(metricsContainer);
    
    // Programa a renderização dos gráficos após inserir no DOM
    setTimeout(() => {
      this.renderStorageChart(node);
      this.renderUptimeDisplay(node);
    }, 100);
    
    return card;
  }
  
  /**
   * Renderiza o gráfico de armazenamento
   * @param {Object} node - Dados do nó
   */
  renderStorageChart(node) {
    if (node.status === 'offline') {
      // Para nós offline, exibe mensagem especial
      const container = document.getElementById(`storage-chart-${node.id}`);
      if (container) {
        container.innerHTML = `
          <div style="display: flex; height: 100%; align-items: center; justify-content: center;">
            <p style="color: #ff5555; margin: 0;">Nó offline</p>
          </div>
        `;
      }
      return;
    }
    
    // Simula a renderização de um gráfico
    // Em uma implementação real, usaríamos Chart.js ou similar
    const container = document.getElementById(`storage-chart-${node.id}`);
    if (container) {
      // Calcula porcentagens
      const usedPercent = (node.storage.used / node.storage.total) * 100;
      const freePercent = 100 - usedPercent;
      
      container.innerHTML = `
        <div style="position: relative; height: 100%; width: 100%;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                      display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="font-size: 24px; font-weight: bold; color: #e0e0ff;">
              ${usedPercent.toFixed(1)}%
            </div>
            <div style="font-size: 14px; color: rgba(224, 224, 255, 0.6);">
              ${this.formatStorage(node.storage.used)} / ${this.formatStorage(node.storage.total)}
            </div>
          </div>
          
          <svg width="100%" height="100%" viewBox="0 0 120 120" style="transform: rotate(-90deg)">
            <!-- Fundo do círculo (espaço livre) -->
            <circle cx="60" cy="60" r="50" fill="none" 
                    stroke="${this.config.chartColors.storage.free}" 
                    stroke-width="15" />
            
            <!-- Espaço usado -->
            <circle cx="60" cy="60" r="50" fill="none" 
                    stroke="${this.config.chartColors.storage.used}" 
                    stroke-width="15"
                    stroke-dasharray="${usedPercent * 3.14}, 314" 
                    stroke-linecap="round" />
          </svg>
        </div>
      `;
    }
  }
  
  /**
   * Renderiza a visualização de uptime
   * @param {Object} node - Dados do nó
   */
  renderUptimeDisplay(node) {
    if (node.status === 'offline') {
      // Para nós offline, exibe mensagem especial
      const container = document.getElementById(`uptime-chart-${node.id}`);
      if (container) {
        container.innerHTML = `
          <div style="display: flex; height: 100%; align-items: center; justify-content: center;">
            <p style="color: #ff5555; margin: 0;">Nó offline</p>
          </div>
        `;
      }
      return;
    }
    
    const container = document.getElementById(`uptime-chart-${node.id}`);
    if (container) {
      const { days, hours, minutes } = node.uptime;
      
      container.innerHTML = `
        <div style="position: relative; height: 100%; width: 100%; 
                    display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="font-size: 20px; font-weight: bold; color: #e0e0ff; margin-bottom: 5px;">
            ${days}d ${hours}h ${minutes}m
          </div>
          
          <!-- Histórico de 7 dias (simplificado) -->
          <div style="display: flex; gap: 2px; height: 40px; width: 100%; justify-content: center; align-items: flex-end;">
            ${node.history.slice(-7).map(day => {
              return `<div style="width: 8px; height: ${day.uptime}%; background-color: ${this.config.chartColors.uptime.primary}; 
                                 border-radius: 2px;" title="${day.date}: ${day.uptime}% uptime"></div>`;
            }).join('')}
          </div>
          
          <div style="font-size: 12px; color: rgba(224, 224, 255, 0.6); margin-top: 5px;">
            Últimos 7 dias
          </div>
        </div>
      `;
    }
  }
  
  /**
   * Inicia o timer para atualização dos dados
   */
  startRefreshTimer() {
    // Limpa timer anterior se existir
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // Configura novo timer
    this.refreshTimer = setInterval(() => {
      this.fetchNodeStatus();
    }, this.config.refreshInterval);
  }
  
  /**
   * Busca o status atualizado dos nós
   * Em uma implementação real, faria uma chamada API
   */
  async fetchNodeStatus() {
    try {
      // Simula uma chamada API com delay aleatório
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      // Para cada nó, atualiza dados simulados
      this.nodes.forEach(node => {
        if (node.status !== 'offline') {
          // Atualiza uso de armazenamento (pequena variação)
          const storageVariation = Math.floor(Math.random() * 10) - 3; // -3 a +7 GB
          node.storage.used = Math.max(0, Math.min(node.storage.total, node.storage.used + storageVariation));
          node.storage.free = node.storage.total - node.storage.used;
          
          // Atualiza uptime
          node.uptime.seconds += this.config.refreshInterval / 1000;
          if (node.uptime.seconds >= 60) {
            node.uptime.minutes += Math.floor(node.uptime.seconds / 60);
            node.uptime.seconds = node.uptime.seconds % 60;
          }
          if (node.uptime.minutes >= 60) {
            node.uptime.hours += Math.floor(node.uptime.minutes / 60);
            node.uptime.minutes = node.uptime.minutes % 60;
          }
          if (node.uptime.hours >= 24) {
            node.uptime.days += Math.floor(node.uptime.hours / 24);
            node.uptime.hours = node.uptime.hours % 24;
          }
          
          // Aleatoriamente muda status entre online e syncing
          if (Math.random() > 0.95) {
            node.status = node.status === 'online' ? 'syncing' : 'online';
          }
        } else if (Math.random() > 0.98) {
          // Chance pequena de um nó offline voltar a funcionar
          node.status = 'online';
          node.storage.used = Math.floor(node.storage.total * 0.3); // 30% usado
          node.storage.free = node.storage.total - node.storage.used;
          node.uptime = { days: 0, hours: 0, minutes: 1, seconds: 30 };
        }
      });
      
      // Atualiza interface
      this.updateNodeData();
    } catch (error) {
      console.error('Erro ao atualizar status dos nós:', error);
    }
  }
  
  /**
   * Atualiza os gráficos e dados na interface
   */
  updateNodeData() {
    this.nodes.forEach(node => {
      // Atualiza status
      const statusEl = document.querySelector(`#node-card-${node.id} .node-status`);
      if (statusEl) {
        statusEl.className = `node-status status-${node.status}`;
        statusEl.textContent = this.formatStatus(node.status);
      }
      
      // Re-renderiza gráficos
      this.renderStorageChart(node);
      this.renderUptimeDisplay(node);
    });
  }
  
  /**
   * Formata texto de status
   * @param {string} status - Status do nó
   * @returns {string} Texto formatado
   */
  formatStatus(status) {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'syncing': return 'Sincronizando';
      default: return status;
    }
  }
  
  /**
   * Formata valor de armazenamento
   * @param {number} gb - Tamanho em GB
   * @returns {string} Tamanho formatado
   */
  formatStorage(gb) {
    if (gb >= 1024) {
      return `${(gb / 1024).toFixed(1)} TB`;
    }
    return `${Math.round(gb)} GB`;
  }
  
  /**
   * Exibe mensagem de erro na interface
   * @param {string} message - Mensagem de erro
   */
  showError(message) {
    if (this.container) {
      this.container.innerHTML = `
        <div class="node-error">
          <p>⚠️ ${message}</p>
        </div>
      `;
    }
  }
  
  /**
   * Para o monitoramento e limpa recursos
   */
  stop() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Exporta a classe para uso externo
export { AwakenNetStorageMonitor }; 
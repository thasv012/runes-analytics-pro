/**
 * RUNES Analytics Pro - Componente de Compartilhamento para Tokens
 * 
 * Versão especializada do ShareTools para uso na página de detalhes do token
 */

class TokenShareTools extends ShareTools {
  constructor(containerId, options = {}) {
    // Configurações padrão para compartilhamento de tokens
    const defaultOptions = {
      enabledFeatures: {
        shareUrl: true,
        socialCards: true,
        dataExport: true
      },
      defaultFileName: 'runes-token-analysis',
      socialPlatforms: ['twitter', 'telegram', 'whatsapp'],
      exportFormats: ['csv', 'json']
    };
    
    // Mesclar com opções fornecidas
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Chamar construtor da classe pai
    super(containerId, mergedOptions);
    
    // Adicionar propriedades específicas
    this.tokenName = null;
    this.tokenData = null;
    this.tokenPeriod = '30d';
    
    // Configurações específicas de token
    this.metrics = {
      supply: { label: 'Supply Total', key: 'supply' },
      holders: { label: 'Holders', key: 'holders' },
      transactions: { label: 'Transações', key: 'transactions' },
      price: { label: 'Preço', key: 'price' },
      volume: { label: 'Volume 24h', key: 'volume' },
      marketCap: { label: 'Valor de Mercado', key: 'marketCap' },
      creationDate: { label: 'Data de Criação', key: 'creationDate' }
    };
  }
  
  /**
   * Define os dados do token para compartilhamento
   * @param {string} tokenName - Nome do token
   * @param {Object} tokenData - Dados do token
   * @param {string} period - Período dos dados (ex: '30d', '7d', '24h')
   */
  setTokenData(tokenName, tokenData, period = '30d') {
    // Armazenar dados do token
    this.tokenName = tokenName;
    this.tokenData = tokenData;
    this.tokenPeriod = period;
    
    // Preparar dados para o componente de compartilhamento
    const data = {
      title: `Análise do token ${tokenName}`,
      description: tokenData.description || `Estatísticas detalhadas para o token ${tokenName} na blockchain Bitcoin`,
      statLabel: this.getMainMetricLabel(tokenData),
      statValue: this.getMainMetricValue(tokenData),
      ...this.formatTokenDataForSharing(tokenData)
    };
    
    // Definir estado para URL compartilhável
    const state = {
      view: 'token-details',
      token: tokenName,
      period: period
    };
    
    // Configurar componente de compartilhamento
    this.setData(data, state);
    
    return this;
  }
  
  /**
   * Formata dados do token para compartilhamento
   * @param {Object} tokenData - Dados do token
   * @returns {Object} - Dados formatados
   */
  formatTokenDataForSharing(tokenData) {
    const formattedData = {};
    
    // Processar métricas disponíveis
    Object.entries(this.metrics).forEach(([key, config]) => {
      if (tokenData[key] !== undefined) {
        formattedData[key] = tokenData[key];
      }
    });
    
    // Adicionar métricas secundárias para cartões sociais
    formattedData.stat1Label = 'Holders';
    formattedData.stat1Value = tokenData.holdersFormatted || tokenData.holders || 'N/A';
    
    formattedData.stat2Label = 'Transações';
    formattedData.stat2Value = tokenData.transactionsFormatted || tokenData.transactions || 'N/A';
    
    return formattedData;
  }
  
  /**
   * Obtém a métrica principal e seu label para destacar no compartilhamento
   * @param {Object} tokenData - Dados do token
   * @returns {string} - Label da métrica principal
   */
  getMainMetricLabel(tokenData) {
    // Priorizar métricas na seguinte ordem
    const metricPriorities = ['marketCap', 'price', 'volume', 'holders', 'supply'];
    
    // Encontrar primeira métrica disponível
    for (const metric of metricPriorities) {
      if (tokenData[metric] !== undefined) {
        return this.metrics[metric].label;
      }
    }
    
    // Fallback
    return 'Supply Total';
  }
  
  /**
   * Obtém o valor da métrica principal
   * @param {Object} tokenData - Dados do token
   * @returns {string} - Valor formatado
   */
  getMainMetricValue(tokenData) {
    // Priorizar métricas na seguinte ordem
    const metricPriorities = ['marketCap', 'price', 'volume', 'holders', 'supply'];
    
    // Encontrar primeira métrica disponível
    for (const metric of metricPriorities) {
      if (tokenData[metric] !== undefined) {
        // Verificar se existe versão formatada da métrica
        const formattedKey = `${metric}Formatted`;
        if (tokenData[formattedKey]) {
          return tokenData[formattedKey];
        }
        return tokenData[metric].toString();
      }
    }
    
    // Fallback
    return tokenData.supply || 'N/A';
  }
  
  /**
   * Gera um cartão social mais específico para tokens
   */
  async generateSocialCard() {
    // Se não tiver dados específicos, usar método padrão
    if (!this.tokenName || !this.tokenData) {
      return super.generateSocialCard();
    }
    
    try {
      // Obter plataforma selecionada
      const platformSelect = document.getElementById(`${this.containerId}-card-platform`);
      const platform = platformSelect ? platformSelect.value : 'twitter';
      
      // Preparar dados para o cartão
      const cardData = {
        title: `Análise do token ${this.tokenName}`,
        description: this.tokenData.description || `Estatísticas detalhadas para ${this.tokenName}`,
        statLabel: this.getMainMetricLabel(this.tokenData),
        statValue: this.getMainMetricValue(this.tokenData),
        stat1Label: 'Holders',
        stat1Value: this.tokenData.holdersFormatted || this.tokenData.holders || 'N/A',
        stat2Label: 'Transações',
        stat2Value: this.tokenData.transactionsFormatted || this.tokenData.transactions || 'N/A',
        timestamp: new Date().toLocaleString(),
        footer: `Período: ${this.formatPeriodLabel(this.tokenPeriod)}`,
        logoUrl: this.tokenData.icon || '/assets/logo.png',
        tokenName: this.tokenName
      };
      
      // Atualizar UI para modo de carregamento
      const previewContainer = document.getElementById(`${this.containerId}-card-preview`);
      previewContainer.innerHTML = `
        <div class="loading-indicator">
          <div class="spinner"></div>
          <p>Gerando imagem...</p>
        </div>
      `;
      
      // Verificar se existe template específico para tokens
      const templateId = document.getElementById(`token-${platform}-template`) ? 
                         `token-${platform}-template` : null;
      
      // Gerar cartão social
      const cardUrl = await window.sharingService.generateSocialCard(cardData, platform, {
        templateId: templateId,
        outputFormat: 'blob',
        // Cores personalizadas baseadas na tendência de preço
        accentColor: this.getPriceAccentColor()
      });
      
      // Exibir preview
      previewContainer.innerHTML = `
        <img src="${cardUrl}" alt="Cartão social para ${this.tokenName}" class="card-image">
      `;
      
      // Armazenar URL da imagem atual
      this.currentCardUrl = cardUrl;
      this.currentCardPlatform = platform;
      
      // Habilitar botão de download
      const downloadCardBtn = document.getElementById(`${this.containerId}-download-card`);
      if (downloadCardBtn) downloadCardBtn.disabled = false;
      
      // Feedback visual
      if (window.RunesAnimations) {
        RunesAnimations.showNotification({
          type: 'success',
          title: 'Imagem Gerada',
          message: `Cartão de ${this.tokenName} para ${platform} criado com sucesso`
        });
      }
      
      return cardUrl;
    } catch (error) {
      console.error('Erro ao gerar cartão social para token:', error);
      return super.generateSocialCard();
    }
  }
  
  /**
   * Formata label do período para exibição
   * @param {string} period - Código do período
   * @returns {string} - Label formatado
   */
  formatPeriodLabel(period) {
    const periodMap = {
      '24h': 'Últimas 24 horas',
      '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias',
      '90d': 'Últimos 90 dias',
      '1y': 'Último ano',
      'all': 'Todo o histórico'
    };
    
    return periodMap[period] || period;
  }
  
  /**
   * Determina cor de destaque com base na tendência de preço
   * @returns {string} - Código de cor hexadecimal
   */
  getPriceAccentColor() {
    if (!this.tokenData || !this.tokenData.priceChange) {
      return '#5352ed'; // Cor padrão
    }
    
    const priceChange = parseFloat(this.tokenData.priceChange);
    
    if (priceChange > 0) {
      return '#4cd137'; // Verde para tendência positiva
    } else if (priceChange < 0) {
      return '#e84118'; // Vermelho para tendência negativa
    } else {
      return '#5352ed'; // Azul padrão para sem alteração
    }
  }
  
  /**
   * Sobrescreve o método de exportação para CSV com formato específico para tokens
   */
  async exportData(format) {
    if (format === 'csv' && this.tokenData) {
      try {
        // Preparar dados para o formato de token
        const tokenExportData = this.prepareTokenExportData();
        
        // Nome de arquivo personalizado
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `token-${this.tokenName.toLowerCase()}-${this.tokenPeriod}-${timestamp}.${format}`;
        
        if (format === 'csv') {
          // Exportar com cabeçalhos personalizados
          await window.sharingService.exportToCsv(tokenExportData, {
            filename: fileName,
            headers: Object.keys(tokenExportData[0]),
            headerLabels: Object.keys(tokenExportData[0]).map(key => {
              const metric = Object.values(this.metrics).find(m => m.key === key);
              return metric ? metric.label : key.charAt(0).toUpperCase() + key.slice(1);
            })
          });
        } else {
          // Para JSON, usar exportação padrão
          return super.exportData(format);
        }
        
        // Feedback visual
        if (window.RunesAnimations) {
          RunesAnimations.showNotification({
            type: 'success',
            title: 'Exportação Concluída',
            message: `Dados do token ${this.tokenName} exportados para ${format.toUpperCase()}`
          });
        }
      } catch (error) {
        console.error(`Erro ao exportar dados do token para ${format}:`, error);
        return super.exportData(format);
      }
    } else {
      // Para outros formatos ou sem dados de token, usar método padrão
      return super.exportData(format);
    }
  }
  
  /**
   * Prepara dados de token para exportação
   * @returns {Array} - Dados formatados para exportação
   */
  prepareTokenExportData() {
    // Se não tiver dados específicos de token
    if (!this.tokenName || !this.tokenData) {
      return Array.isArray(this.data) ? this.data : [this.data];
    }
    
    // Para dados históricos, exportar série temporal
    if (this.tokenData.historicalData && Array.isArray(this.tokenData.historicalData)) {
      return this.tokenData.historicalData.map(dataPoint => ({
        token: this.tokenName,
        date: dataPoint.date,
        price: dataPoint.price,
        volume: dataPoint.volume,
        marketCap: dataPoint.marketCap,
        transactions: dataPoint.transactions,
        holders: dataPoint.holders
      }));
    }
    
    // Para dados simples, exportar métricas atuais
    return [{
      token: this.tokenName,
      timestamp: new Date().toISOString(),
      period: this.tokenPeriod,
      ...Object.entries(this.metrics)
        .filter(([_, config]) => this.tokenData[config.key] !== undefined)
        .reduce((acc, [_, config]) => {
          acc[config.key] = this.tokenData[config.key];
          return acc;
        }, {})
    }];
  }
  
  /**
   * Sobrescreve o método getCurrentState para incluir dados específicos do token
   */
  getCurrentState() {
    // Obter estado básico da classe pai
    const baseState = super.getCurrentState();
    
    // Adicionar dados específicos do token
    if (this.tokenName) {
      baseState.token = this.tokenName;
      baseState.view = 'token-details';
    }
    
    if (this.tokenPeriod) {
      baseState.period = this.tokenPeriod;
    }
    
    // Tentar obter dados do StateManager se disponível
    if (window.stateManager && typeof window.stateManager.getCurrentState === 'function') {
      const stateManagerData = window.stateManager.getCurrentState('token-details');
      return { ...baseState, ...stateManagerData };
    }
    
    return baseState;
  }
}

// Exportar para uso no navegador
if (typeof window !== 'undefined') {
  window.TokenShareTools = TokenShareTools;
}

// Exportar como módulo se disponível
if (typeof module !== 'undefined') {
  module.exports = TokenShareTools;
} 
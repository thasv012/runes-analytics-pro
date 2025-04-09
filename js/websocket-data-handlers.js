/**
 * RUNES Analytics Pro - WebSocket Data Handlers
 * Implementa handlers especializados para processamento de mensagens WebSocket relacionadas aos Runes
 */

// Módulo principal para handlers de dados WebSocket
const RunesWebSocketHandlers = {
  // Registro de handlers para diferentes tipos de mensagens
  messageHandlers: new Map(),
  
  // Registro de processadores de dados para diferentes tipos de entidades
  dataProcessors: {
    runes: {},
    transactions: {},
    wallets: {},
    market: {},
    network: {},
    alerts: {},
    custom: {}
  },
  
  /**
   * Inicializa os handlers
   * @param {Object} options - Opções de configuração
   */
  init: function(options = {}) {
    console.log('🚀 Inicializando RUNES WebSocket Handlers');
    this.registerDefaultHandlers();
    return this;
  },
  
  /**
   * Registra um handler para um tipo específico de mensagem
   * @param {string} messageType - Tipo da mensagem (ex: 'rune_update', 'market_alert')
   * @param {Function} handler - Função handler para processar a mensagem
   */
  registerHandler: function(messageType, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler para ${messageType} deve ser uma função`);
    }
    
    this.messageHandlers.set(messageType, handler);
    console.log(`✅ Handler registrado para mensagens do tipo '${messageType}'`);
  },
  
  /**
   * Remove um handler para um tipo específico de mensagem
   * @param {string} messageType - Tipo da mensagem
   * @returns {boolean} - Se o handler foi removido com sucesso
   */
  unregisterHandler: function(messageType) {
    return this.messageHandlers.delete(messageType);
  },
  
  /**
   * Registra um processador de dados para um tipo específico de entidade
   * @param {string} entityType - Tipo da entidade (ex: 'runes', 'transactions')
   * @param {string} processorName - Nome do processador
   * @param {Function} processor - Função processadora
   */
  registerDataProcessor: function(entityType, processorName, processor) {
    if (!this.dataProcessors[entityType]) {
      this.dataProcessors[entityType] = {};
    }
    
    this.dataProcessors[entityType][processorName] = processor;
    console.log(`✅ Processador '${processorName}' registrado para entidade '${entityType}'`);
  },
  
  /**
   * Processa uma mensagem WebSocket
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente (opcional)
   * @returns {Object|null} - Resultado do processamento ou null se não houver handler
   */
  processMessage: function(message, clientInfo = null) {
    if (!message || !message.type) {
      console.error('❌ Mensagem inválida (sem tipo):', message);
      return null;
    }
    
    // Busca o handler para este tipo de mensagem
    const handler = this.messageHandlers.get(message.type);
    
    if (!handler) {
      console.warn(`⚠️ Sem handler registrado para mensagem do tipo '${message.type}'`);
      return null;
    }
    
    try {
      // Executa o handler
      return handler(message, clientInfo, this);
    } catch (error) {
      console.error(`❌ Erro ao processar mensagem do tipo '${message.type}':`, error);
      return {
        error: true,
        message: error.message,
        originalMessage: message
      };
    }
  },
  
  /**
   * Processa dados de uma entidade usando o processador especificado
   * @param {string} entityType - Tipo da entidade (ex: 'runes', 'transactions')
   * @param {string} processorName - Nome do processador
   * @param {Object} data - Dados a serem processados
   * @returns {Object|null} - Dados processados ou null se o processador não existir
   */
  processData: function(entityType, processorName, data) {
    const processors = this.dataProcessors[entityType];
    
    if (!processors) {
      console.warn(`⚠️ Nenhum processador registrado para entidade '${entityType}'`);
      return null;
    }
    
    const processor = processors[processorName];
    
    if (!processor) {
      console.warn(`⚠️ Processador '${processorName}' não encontrado para entidade '${entityType}'`);
      return null;
    }
    
    try {
      return processor(data);
    } catch (error) {
      console.error(`❌ Erro ao processar dados com '${processorName}' para '${entityType}':`, error);
      return {
        error: true,
        message: error.message,
        originalData: data
      };
    }
  },
  
  /**
   * Registra os handlers padrão para os tipos de mensagens comuns
   */
  registerDefaultHandlers: function() {
    // Handler para atualizações de Runes
    this.registerHandler('rune_update', this.handleRuneUpdate);
    
    // Handler para alertas de mercado
    this.registerHandler('market_alert', this.handleMarketAlert);
    
    // Handler para estatísticas de rede
    this.registerHandler('network_stats', this.handleNetworkStats);
    
    // Handler para notificações de transações
    this.registerHandler('transaction_notification', this.handleTransactionNotification);
    
    // Handler para análises de carteira
    this.registerHandler('wallet_analysis', this.handleWalletAnalysis);
    
    // Handler para mensagens de chat
    this.registerHandler('chat', this.handleChatMessage);
    
    // Handler para solicitações de dados
    this.registerHandler('data_request', this.handleDataRequest);
    
    // Registra processadores padrão
    this.registerDefaultDataProcessors();
  },
  
  /**
   * Registra os processadores de dados padrão
   */
  registerDefaultDataProcessors: function() {
    // Processadores para Runes
    this.registerDataProcessor('runes', 'summarize', this.processRuneSummary);
    this.registerDataProcessor('runes', 'analyze', this.processRuneAnalysis);
    this.registerDataProcessor('runes', 'format', this.formatRuneData);
    
    // Processadores para transações
    this.registerDataProcessor('transactions', 'validate', this.validateTransaction);
    this.registerDataProcessor('transactions', 'extract', this.extractTransactionData);
    
    // Processadores para carteiras
    this.registerDataProcessor('wallets', 'analyze', this.analyzeWallet);
    
    // Processadores para dados de mercado
    this.registerDataProcessor('market', 'calculateChange', this.calculatePriceChange);
    this.registerDataProcessor('market', 'detectTrend', this.detectMarketTrend);
    
    // Processadores para alertas
    this.registerDataProcessor('alerts', 'prioritize', this.prioritizeAlert);
  },
  
  // ===== HANDLERS DE MENSAGENS =====
  
  /**
   * Handler para mensagens de atualização de Runes
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente
   */
  handleRuneUpdate: function(message, clientInfo, context) {
    console.log(`🪙 Atualização de Rune recebida: ${message.runeName || 'N/A'}`);
    
    // Processa os dados do Rune
    const runeData = message.data;
    
    if (!runeData) {
      return {
        success: false,
        error: 'Dados do Rune não fornecidos'
      };
    }
    
    // Aplica processadores relevantes
    let processedData = runeData;
    
    if (context) {
      // Formata os dados
      processedData = context.processData('runes', 'format', processedData) || processedData;
      
      // Analisa os dados
      const analysis = context.processData('runes', 'analyze', processedData);
      
      // Sumariza os dados
      const summary = context.processData('runes', 'summarize', processedData);
      
      return {
        success: true,
        rune: processedData,
        analysis: analysis,
        summary: summary,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      rune: processedData,
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Handler para mensagens de alerta de mercado
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente
   */
  handleMarketAlert: function(message, clientInfo, context) {
    console.log(`📊 Alerta de mercado recebido: ${message.alertType || 'N/A'}`);
    
    const alertData = message.data;
    
    if (!alertData) {
      return {
        success: false,
        error: 'Dados do alerta não fornecidos'
      };
    }
    
    // Prioriza o alerta se houver um processador
    let priority = 'normal';
    
    if (context) {
      const priorityData = context.processData('alerts', 'prioritize', alertData);
      priority = priorityData ? priorityData.priority : priority;
    }
    
    return {
      success: true,
      alert: {
        ...alertData,
        priority,
        processed: true,
        receivedAt: new Date().toISOString()
      }
    };
  },
  
  /**
   * Handler para mensagens de estatísticas de rede
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente
   */
  handleNetworkStats: function(message, clientInfo) {
    console.log(`🌐 Estatísticas de rede recebidas: ${message.network || 'Bitcoin'}`);
    
    const statsData = message.data || {};
    
    // Calcula métricas adicionais
    const enhancedStats = {
      ...statsData,
      lastUpdated: new Date().toISOString(),
      runeTxPercentage: statsData.totalRuneTransactions && statsData.totalTransactions 
        ? (statsData.totalRuneTransactions / statsData.totalTransactions * 100).toFixed(2) 
        : null,
      avgRuneTxPerBlock: statsData.totalRuneTransactions && statsData.blockHeight
        ? (statsData.totalRuneTransactions / statsData.blockHeight).toFixed(4)
        : null
    };
    
    return {
      success: true,
      stats: enhancedStats
    };
  },
  
  /**
   * Handler para notificações de transações
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente
   */
  handleTransactionNotification: function(message, clientInfo, context) {
    console.log(`💸 Notificação de transação recebida: ${message.txid || 'N/A'}`);
    
    const txData = message.data;
    
    if (!txData) {
      return {
        success: false,
        error: 'Dados da transação não fornecidos'
      };
    }
    
    let isValid = true;
    let extractedData = null;
    
    if (context) {
      // Valida a transação
      const validationResult = context.processData('transactions', 'validate', txData);
      isValid = validationResult ? validationResult.valid : isValid;
      
      // Extrai dados adicionais
      extractedData = context.processData('transactions', 'extract', txData);
    }
    
    return {
      success: true,
      transaction: {
        ...txData,
        isValid,
        extractedData,
        receivedAt: new Date().toISOString()
      }
    };
  },
  
  /**
   * Handler para análises de carteira
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente
   */
  handleWalletAnalysis: function(message, clientInfo, context) {
    console.log(`👛 Análise de carteira recebida: ${message.walletAddress || 'N/A'}`);
    
    const walletData = message.data;
    
    if (!walletData) {
      return {
        success: false,
        error: 'Dados da carteira não fornecidos'
      };
    }
    
    let analysis = null;
    
    if (context) {
      // Analisa a carteira
      analysis = context.processData('wallets', 'analyze', walletData);
    }
    
    return {
      success: true,
      wallet: {
        ...walletData,
        analysis,
        analyzedAt: new Date().toISOString()
      }
    };
  },
  
  /**
   * Handler para mensagens de chat
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente
   */
  handleChatMessage: function(message, clientInfo) {
    console.log(`💬 Mensagem de chat recebida de: ${clientInfo ? clientInfo.name : 'anônimo'}`);
    
    // Simplesmente ecoa a mensagem com informações adicionais
    return {
      success: true,
      message: {
        content: message.content,
        sender: clientInfo ? {
          id: clientInfo.id,
          name: clientInfo.name,
          type: clientInfo.type
        } : { name: 'anônimo' },
        received: true,
        timestamp: new Date().toISOString()
      }
    };
  },
  
  /**
   * Handler para solicitações de dados
   * @param {Object} message - Mensagem recebida
   * @param {Object} clientInfo - Informações do cliente
   */
  handleDataRequest: function(message, clientInfo) {
    console.log(`📋 Solicitação de dados recebida: ${message.dataType || 'desconhecido'}`);
    
    const request = message.request || {};
    const dataType = message.dataType;
    
    // Simula obtenção de dados (em um sistema real, isso faria uma consulta ao banco de dados)
    const simulatedData = {
      requestId: request.id || `req-${Date.now()}`,
      dataType: dataType,
      status: 'processed',
      timestamp: new Date().toISOString(),
      // Dados simulados baseados no tipo solicitado
      data: this.generateSimulatedData(dataType, request)
    };
    
    return {
      success: true,
      request: simulatedData
    };
  },
  
  /**
   * Gera dados simulados para testes
   * @param {string} dataType - Tipo de dados solicitados
   * @param {Object} request - Parâmetros da solicitação
   * @returns {Object} - Dados simulados
   */
  generateSimulatedData: function(dataType, request) {
    switch(dataType) {
      case 'runes':
        return {
          totalCount: 1000,
          items: Array.from({ length: 5 }).map((_, i) => ({
            id: `rune-${i + 1}`,
            name: `Rune${i + 1}`,
            symbol: `R${i + 1}`,
            supply: Math.floor(Math.random() * 1000000),
            holders: Math.floor(Math.random() * 10000),
            transactions: Math.floor(Math.random() * 50000)
          }))
        };
        
      case 'transactions':
        return {
          totalCount: 5000,
          items: Array.from({ length: 5 }).map((_, i) => ({
            txid: `tx-${Date.now()}-${i}`,
            blockHeight: 800000 + i,
            timestamp: new Date(Date.now() - i * 60000).toISOString(),
            amount: Math.random() * 10,
            fee: Math.random() * 0.001,
            confirmed: Math.random() > 0.2
          }))
        };
        
      case 'market':
        return {
          lastUpdated: new Date().toISOString(),
          topRunes: Array.from({ length: 5 }).map((_, i) => ({
            name: `Rune${i + 1}`,
            price: Math.random() * 100,
            change24h: (Math.random() * 20) - 10,
            volume: Math.random() * 1000000
          }))
        };
        
      default:
        return {
          message: 'Tipo de dados não reconhecido',
          availableTypes: ['runes', 'transactions', 'market']
        };
    }
  },
  
  // ===== PROCESSADORES DE DADOS =====
  
  /**
   * Processa um sumário de Rune
   * @param {Object} runeData - Dados do Rune
   * @returns {Object} - Sumário do Rune
   */
  processRuneSummary: function(runeData) {
    return {
      name: runeData.name,
      symbol: runeData.symbol,
      supply: runeData.supply,
      holderCount: runeData.holders,
      transactionCount: runeData.transactions,
      createdAt: runeData.createdAt,
      lastActivity: runeData.lastActivity || new Date().toISOString()
    };
  },
  
  /**
   * Processa uma análise de Rune
   * @param {Object} runeData - Dados do Rune
   * @returns {Object} - Análise do Rune
   */
  processRuneAnalysis: function(runeData) {
    // Simula algumas métricas de análise
    const activityScore = Math.min(10, runeData.transactions / 1000);
    const holderDistribution = runeData.holders > 0 ? runeData.supply / runeData.holders : 0;
    const age = runeData.createdAt ? Math.floor((new Date() - new Date(runeData.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
    
    return {
      activityScore: activityScore.toFixed(2),
      holderDistribution: holderDistribution.toFixed(2),
      ageInDays: age,
      metrics: {
        velocity: Math.random() * 10,
        adoption: Math.random() * 10,
        retention: Math.random() * 10,
        growth: Math.random() * 10
      },
      riskAssessment: {
        level: activityScore > 7 ? 'low' : activityScore > 4 ? 'medium' : 'high',
        factors: [
          activityScore < 5 ? 'Baixa atividade transacional' : null,
          holderDistribution > 1000 ? 'Alta concentração de tokens' : null,
          age < 30 ? 'Projeto recente' : null
        ].filter(Boolean)
      }
    };
  },
  
  /**
   * Formata dados de Rune para exibição
   * @param {Object} runeData - Dados do Rune
   * @returns {Object} - Dados formatados do Rune
   */
  formatRuneData: function(runeData) {
    return {
      ...runeData,
      supply: runeData.supply ? runeData.supply.toLocaleString() : '0',
      holders: runeData.holders ? runeData.holders.toLocaleString() : '0',
      transactions: runeData.transactions ? runeData.transactions.toLocaleString() : '0',
      createdAtFormatted: runeData.createdAt ? new Date(runeData.createdAt).toLocaleDateString() : 'N/A',
      lastActivityFormatted: runeData.lastActivity ? new Date(runeData.lastActivity).toLocaleString() : 'N/A'
    };
  },
  
  /**
   * Valida dados de transação
   * @param {Object} txData - Dados da transação
   * @returns {Object} - Resultado da validação
   */
  validateTransaction: function(txData) {
    // Simulação de validação
    const hasRequiredFields = txData.txid && txData.blockHeight;
    const hasValidInputsOutputs = txData.inputs && txData.outputs;
    
    return {
      valid: hasRequiredFields && hasValidInputsOutputs,
      errors: !hasRequiredFields ? ['Campos obrigatórios ausentes'] :
        !hasValidInputsOutputs ? ['Entradas ou saídas inválidas'] : []
    };
  },
  
  /**
   * Extrai dados adicionais de transação
   * @param {Object} txData - Dados da transação
   * @returns {Object} - Dados extraídos
   */
  extractTransactionData: function(txData) {
    // Extrai informações relevantes sobre Runes na transação
    const runeData = {
      hasRunes: false,
      runeNames: [],
      totalRuneAmount: 0
    };
    
    // Simula a detecção de Runes em saídas de transação
    if (txData.outputs && txData.outputs.length > 0) {
      txData.outputs.forEach(output => {
        if (output.runes) {
          runeData.hasRunes = true;
          output.runes.forEach(rune => {
            runeData.runeNames.push(rune.name || 'Desconhecido');
            runeData.totalRuneAmount += rune.amount || 0;
          });
        }
      });
    }
    
    return {
      isConfirmed: txData.confirmations > 0,
      confirmations: txData.confirmations || 0,
      age: txData.timestamp ? Math.floor((new Date() - new Date(txData.timestamp)) / (1000 * 60)) : 0,
      fee: txData.fee,
      feeRate: txData.size ? (txData.fee / txData.size * 100000000).toFixed(2) : 'N/A',
      runes: runeData
    };
  },
  
  /**
   * Analisa dados de carteira
   * @param {Object} walletData - Dados da carteira
   * @returns {Object} - Análise da carteira
   */
  analyzeWallet: function(walletData) {
    // Simula análise de carteira
    return {
      totalRunes: walletData.runes ? walletData.runes.length : 0,
      totalValue: walletData.balance || 0,
      runeDiversity: walletData.runes ? walletData.runes.length / 10 : 0,
      activityLevel: walletData.txCount > 1000 ? 'alto' : 
        walletData.txCount > 100 ? 'médio' : 'baixo',
      ageAssessment: walletData.firstSeen ? 
        Math.floor((new Date() - new Date(walletData.firstSeen)) / (1000 * 60 * 60 * 24)) > 365 ?
        'carteira antiga' : 'carteira nova' : 'idade desconhecida',
      runePortfolio: {
        diversification: walletData.runes && walletData.runes.length > 5 ? 'diversificado' : 'concentrado',
        topHoldings: walletData.runes ? 
          walletData.runes.slice(0, 3).map(r => r.name || 'Desconhecido') : []
      }
    };
  },
  
  /**
   * Calcula mudança de preço
   * @param {Object} marketData - Dados de mercado
   * @returns {Object} - Cálculos de mudança de preço
   */
  calculatePriceChange: function(marketData) {
    if (!marketData.current || !marketData.previous) {
      return {
        error: 'Dados insuficientes para cálculo'
      };
    }
    
    const absoluteChange = marketData.current - marketData.previous;
    const percentChange = (absoluteChange / marketData.previous) * 100;
    
    return {
      previous: marketData.previous,
      current: marketData.current,
      absoluteChange,
      percentChange: percentChange.toFixed(2),
      direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable'
    };
  },
  
  /**
   * Detecta tendência de mercado
   * @param {Object} marketData - Dados de mercado
   * @returns {Object} - Análise de tendência
   */
  detectMarketTrend: function(marketData) {
    if (!marketData.history || !Array.isArray(marketData.history) || marketData.history.length < 2) {
      return {
        error: 'Histórico insuficiente para análise de tendência'
      };
    }
    
    // Calcula tendência simples
    const prices = marketData.history.map(h => h.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const overallChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    // Calcula volatilidade simples
    let volatility = 0;
    for (let i = 1; i < prices.length; i++) {
      volatility += Math.abs((prices[i] - prices[i-1]) / prices[i-1]);
    }
    volatility = (volatility / (prices.length - 1)) * 100;
    
    // Determina força da tendência
    let trendStrength = 'neutra';
    if (Math.abs(overallChange) > 20) {
      trendStrength = 'forte';
    } else if (Math.abs(overallChange) > 10) {
      trendStrength = 'moderada';
    } else if (Math.abs(overallChange) > 5) {
      trendStrength = 'fraca';
    }
    
    return {
      trend: overallChange > 0 ? 'bullish' : overallChange < 0 ? 'bearish' : 'lateral',
      strength: trendStrength,
      overallChangePercent: overallChange.toFixed(2),
      volatilityPercent: volatility.toFixed(2),
      duration: `${marketData.history.length} períodos`
    };
  },
  
  /**
   * Prioriza alertas
   * @param {Object} alertData - Dados do alerta
   * @returns {Object} - Alerta com prioridade
   */
  prioritizeAlert: function(alertData) {
    // Define prioridade com base no tipo e severidade
    let priority = 'normal';
    
    // Prioridade baseada no tipo
    if (alertData.type === 'security' || alertData.type === 'vulnerability') {
      priority = 'high';
    } else if (alertData.type === 'price_change' && Math.abs(alertData.change) > 20) {
      priority = 'high';
    } else if (alertData.type === 'whale_transaction') {
      priority = 'high';
    } else if (alertData.type === 'market_update') {
      priority = 'low';
    }
    
    // Se houver uma severidade explícita, ela sobrepõe a baseada no tipo
    if (alertData.severity === 'critical' || alertData.severity === 'high') {
      priority = 'high';
    } else if (alertData.severity === 'low') {
      priority = 'low';
    }
    
    return {
      ...alertData,
      priority,
      needsImmediate: priority === 'high',
      prioritizedAt: new Date().toISOString()
    };
  }
};

// Exporta para uso em navegadores
if (typeof window !== 'undefined') {
  window.RunesWebSocketHandlers = RunesWebSocketHandlers;
}

// Exporta para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RunesWebSocketHandlers;
}
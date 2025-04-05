/**
 * Gerenciador centralizado de APIs do RUNES Analytics Pro
 * Coordena todas as chamadas às APIs externas com gestão de cache
 */

import AdvancedApiService from './AdvancedApiService.js';
import { advancedCache } from '../cache/AdvancedCacheService.js';

class ApiManager {
  constructor() {
    // Configurações gerais
    this.defaultConfig = {
      timeout: 15000,  // 15 segundos
      defaultTTL: 300, // 5 minutos
      compressResponses: true,
      useFallbackCache: true
    };
    
    // Inicializar serviços de API
    this.initializeServices();
    
    // Indicadores de estado
    this.isOffline = false;
    this.lastConnectionCheck = 0;
    
    // Fila de requisições durante modo offline
    this.pendingRequests = [];
    
    // Controle de otimização automática
    this.lastOptimization = 0; // timestamp da última otimização
    this.itemsLoadedSinceLastOptimization = 0;
    
    // Verificar conexão
    this.checkConnection();
    
    console.log('✅ ApiManager inicializado');
  }
  
  /**
   * Inicializa todos os serviços de API
   * @private
   */
  initializeServices() {
    // Serviços de API principais
    this.services = {
      // Ordiscan API
      ordiscan: new AdvancedApiService('https://api.ordiscan.com/v1', {
        ...this.defaultConfig,
        defaultTTL: 180,  // 3 minutos
      }),
      
      // Geniidata API
      geniidata: new AdvancedApiService('https://api.geniidata.com/api', {
        ...this.defaultConfig,
        defaultTTL: 300,  // 5 minutos
      }),
      
      // Magic Eden API
      magiceden: new AdvancedApiService('https://api.magiceden.io/v2', {
        ...this.defaultConfig,
        defaultTTL: 120,  // 2 minutos
      }),
      
      // OKX API
      okx: new AdvancedApiService('https://www.okx.com/api/v5', {
        ...this.defaultConfig,
        defaultTTL: 60,   // 1 minuto (dados voláteis)
      })
    };
    
    // Serviço Mock para desenvolvimento/fallback
    this.mockService = {
      fetchData: async (endpoint, params = {}) => {
        // Gerar chave única para o mock
        const key = `mock_${endpoint}_${JSON.stringify(params)}`;
        
        // Verificar se temos dados mockados no cache
        const cachedMock = await advancedCache.get(key);
        if (cachedMock) {
          return cachedMock;
        }
        
        // Caso contrário, gerar dados mockados baseados no endpoint
        let mockData;
        
        if (endpoint.includes('runes/list')) {
          mockData = this.generateMockRunesList(params);
        } else if (endpoint.includes('wallet')) {
          mockData = this.generateMockWalletData(params);
        } else if (endpoint.includes('transactions')) {
          mockData = this.generateMockTransactions(params);
        } else if (endpoint.includes('stats')) {
          mockData = this.generateMockStats(params);
        } else {
          mockData = {
            status: 'mock',
            message: 'Dados mockados de exemplo',
            timestamp: Date.now()
          };
        }
        
        // Armazenar no cache para consistência
        await advancedCache.set(key, mockData, 3600); // 1 hora
        
        return mockData;
      }
    };
  }
  
  /**
   * Verifica a conexão com os serviços de API
   * @async
   * @returns {Promise<boolean>} - Status da conexão
   */
  async checkConnection() {
    // Evitar verificações frequentes
    const now = Date.now();
    if (now - this.lastConnectionCheck < 60000) { // 1 minuto
      return !this.isOffline;
    }
    
    this.lastConnectionCheck = now;
    
    try {
      // Verificar o serviço principal (Ordiscan)
      const status = await this.services.ordiscan.getHealth();
      
      // Atualizar estado
      this.isOffline = status.status !== 'online';
      
      // Se estamos online e temos requisições pendentes, processá-las
      if (!this.isOffline && this.pendingRequests.length > 0) {
        this.processPendingRequests();
      }
      
      return !this.isOffline;
    } catch (error) {
      this.isOffline = true;
      console.warn('Modo offline ativado devido a erro de conexão:', error);
      return false;
    }
  }
  
  /**
   * Processa requisições pendentes após reconexão
   * @private
   * @async
   */
  async processPendingRequests() {
    console.log(`Processando ${this.pendingRequests.length} requisições pendentes`);
    
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];
    
    for (const request of requests) {
      try {
        const result = await this.fetchWithFallback(
          request.api,
          request.endpoint,
          request.params,
          request.options
        );
        
        if (request.resolve) {
          request.resolve(result);
        }
      } catch (error) {
        if (request.reject) {
          request.reject(error);
        }
      }
    }
  }
  
  /**
   * Busca dados com sistema de fallback entre múltiplas APIs
   * @async
   * @param {string} preferredApi - API preferencial a ser usada
   * @param {string} endpoint - Endpoint da API
   * @param {Object} params - Parâmetros da requisição
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Dados da resposta
   */
  async fetchWithFallback(preferredApi, endpoint, params = {}, options = {}) {
    // Verificar conexão primeiro
    const isConnected = await this.checkConnection();
    
    // Opções de fallback e cache
    const {
      fallbackApis = [],
      useMock = true,
      cacheOptions = {},
      retry = 2
    } = options;
    
    // Se offline e useMock habilitado, usar dados mockados
    if (!isConnected && useMock) {
      console.log(`[OFFLINE] Usando dados mockados para ${endpoint}`);
      return this.mockService.fetchData(endpoint, params);
    }
    
    // Verificar se a API preferida existe
    if (!this.services[preferredApi]) {
      console.error(`API ${preferredApi} não encontrada, usando fallback`);
      preferredApi = fallbackApis[0] || 'ordiscan';
    }
    
    // Lista de APIs a tentar, começando pela preferida
    const apisToTry = [preferredApi, ...fallbackApis].filter(
      (api, index, self) => self.indexOf(api) === index && this.services[api]
    );
    
    // Se offline e sem mock, adicionar à fila de pendentes
    if (!isConnected && !useMock) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({
          api: preferredApi,
          endpoint,
          params,
          options,
          resolve,
          reject
        });
        
        console.log(`[OFFLINE] Adicionada requisição pendente para ${endpoint}`);
      });
    }
    
    // Tentar cada API em sequência
    let lastError = null;
    let attemptsLeft = retry + 1;
    
    while (apisToTry.length > 0 && attemptsLeft > 0) {
      const currentApi = apisToTry.shift();
      attemptsLeft--;
      
      try {
        console.log(`[API:${currentApi}] Tentando ${endpoint}`);
        
        // Executar a requisição na API atual
        const result = await this.services[currentApi].fetchWithAdvancedCache(
          endpoint,
          params,
          cacheOptions
        );
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`[API:${currentApi}] Falha em ${endpoint}: ${error.message}`);
        
        // Se for o último item e ainda temos tentativas, reinserir APIs
        if (apisToTry.length === 0 && attemptsLeft > 0) {
          apisToTry.push(...fallbackApis, preferredApi);
          
          // Adicionar pequeno delay entre tentativas
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Se chegamos aqui, todas as tentativas falharam
    
    // Tentar dados mockados como último recurso
    if (useMock) {
      console.log(`[FALLBACK] Usando dados mockados para ${endpoint} após falhas em APIs`);
      return this.mockService.fetchData(endpoint, params);
    }
    
    // Sem mais opções, propagar o erro
    throw lastError || new Error(`Falha ao buscar ${endpoint} em todas as APIs disponíveis`);
  }
  
  /**
   * Busca o ranking de tokens Runes
   * @async
   * @param {Object} params - Parâmetros do ranking
   * @returns {Promise<Object>} - Lista de tokens
   */
  async getRunesRanking(params = {}) {
    const options = {
      fallbackApis: ['geniidata', 'magiceden'],
      cacheOptions: {
        ttl: 300, // 5 minutos
        tag: 'runes_ranking'
      }
    };
    
    return this.fetchWithFallback('ordiscan', 'runes/list', params, options);
  }
  
  /**
   * Busca detalhes de um token Rune específico
   * @async
   * @param {string} ticker - Ticker do token
   * @returns {Promise<Object>} - Detalhes do token
   */
  async getRuneDetails(ticker) {
    const options = {
      fallbackApis: ['geniidata', 'magiceden'],
      cacheOptions: {
        ttl: 600, // 10 minutos
        tag: `rune_${ticker}`
      }
    };
    
    return this.fetchWithFallback('ordiscan', `runes/detail/${ticker}`, {}, options);
  }
  
  /**
   * Busca transações recentes de um token Rune
   * @async
   * @param {string} ticker - Ticker do token
   * @param {Object} params - Parâmetros adicionais
   * @returns {Promise<Object>} - Lista de transações
   */
  async getRuneTransactions(ticker, params = {}) {
    const options = {
      fallbackApis: ['geniidata'],
      cacheOptions: {
        ttl: 120, // 2 minutos (transações são frequentes)
        tag: `transactions_${ticker}`
      }
    };
    
    return this.fetchWithFallback(
      'ordiscan', 
      `runes/transactions/${ticker}`,
      params,
      options
    );
  }
  
  /**
   * Pré-carrega dados comumente usados
   * @async
   */
  async preloadCommonData() {
    // Contagem de itens para otimização
    let preloadCount = 0;
    
    console.log('🔄 Iniciando pré-carregamento de dados comuns...');
    
    // Ranking básico (primeiros 20 tokens)
    this.fetchWithFallback('ordiscan', 'runes/list', {limit: 20}, {
      cacheOptions: {
        ttl: 300,
        tag: 'runes_ranking'
      }
    }).then(() => preloadCount++)
      .catch(err => console.warn('Falha no pré-carregamento do ranking', err));
    
    // Estatísticas gerais
    this.fetchWithFallback('geniidata', 'runes/stats', {}, {
      cacheOptions: {
        ttl: 600,
        tag: 'runes_stats'
      }
    }).then(() => preloadCount++)
      .catch(err => console.warn('Falha no pré-carregamento de estatísticas', err));
    
    // Tokens populares - detalhes
    const popularTickers = ['ORDI', 'SATS', 'PEPE', 'MEME', 'RATS'];
    
    const promises = popularTickers.map(ticker => {
      // Usando prioridade baixa para não sobrecarregar a inicialização
      return this.services.ordiscan.preloadCache(`runes/detail/${ticker}`, {}, {
        ttl: 600,
        tag: `rune_${ticker}`,
        priority: 'low'
      }).then(() => preloadCount++);
    });
    
    // Aguardar todas as cargas terminarem
    await Promise.allSettled(promises);
    
    console.log(`✅ Pré-carregamento concluído: ${preloadCount} itens carregados`);
    
    // Registrar contagem para otimização automática
    this.itemsLoadedSinceLastOptimization += preloadCount;
    
    // Verificar se devemos otimizar o armazenamento
    if (this.itemsLoadedSinceLastOptimization > 50) {
      // Se muitos itens foram carregados, otimizar o armazenamento
      this.optimizeStorage();
    }
  }
  
  /**
   * Otimiza o armazenamento com compressão em batch
   * Chamado automaticamente após carregar muitos dados
   * @async
   * @param {boolean} force - Forçar otimização mesmo que tenha sido executada recentemente
   * @returns {Promise<Object>} - Resultado da otimização ou null se ignorada
   */
  async optimizeStorage(force = false) {
    // Verificar se advancedCache tem o método compressAll
    if (!advancedCache.compressAll) {
      console.warn('Método compressAll não disponível no advancedCache');
      return null;
    }
    
    const now = Date.now();
    
    // Não otimizar mais de uma vez por hora, a menos que forçado
    if (!force && now - this.lastOptimization < 3600000) { // 1 hora
      console.log('Otimização de armazenamento ignorada: muito recente');
      return null;
    }
    
    console.log('🔄 Iniciando otimização automática do armazenamento...');
    
    try {
      // Otimizar com configuração padrão
      const result = await advancedCache.compressAll({
        compressThreshold: 512, // Mais agressivo que o padrão
        forceAll: false // Não recomprimir itens já comprimidos
      });
      
      // Atualizar métricas
      this.lastOptimization = now;
      this.itemsLoadedSinceLastOptimization = 0;
      
      console.log(`✅ Otimização automática concluída: ${result.savingsFormatted} economizados`);
      return result;
    } catch (error) {
      console.error('❌ Erro na otimização automática:', error);
      return null;
    }
  }
  
  /**
   * Limpa o cache de dados específicos
   * @async
   * @param {string} tag - Tag dos dados a serem removidos
   */
  async invalidateCache(tag) {
    await advancedCache.flush();
    console.log(`Cache invalidado para tag: ${tag}`);
  }
  
  /**
   * Gera dados mockados para lista de Runes
   * @private
   * @param {Object} params - Parâmetros da requisição
   * @returns {Object} - Dados mockados
   */
  generateMockRunesList(params = {}) {
    const { limit = 20, offset = 0 } = params;
    
    const runes = [
      { ticker: 'ORDI', name: 'Ordinals', supply: '21000000', price: 0.125, change24h: 5.2 },
      { ticker: 'SATS', name: 'Satoshis', supply: '2100000000000', price: 0.00000234, change24h: 1.7 },
      { ticker: 'PEPE', name: 'Pepe', supply: '420690000000', price: 0.00000189, change24h: -2.3 },
      { ticker: 'MEME', name: 'Meme Coin', supply: '69000000', price: 0.00012, change24h: 12.5 },
      { ticker: 'RATS', name: 'Bitcoin Rats', supply: '21000', price: 0.0341, change24h: 8.9 },
      { ticker: 'DOGE', name: 'Doge on Bitcoin', supply: '132000000', price: 0.000341, change24h: -1.2 },
      { ticker: 'CAPY', name: 'Capybara', supply: '10000', price: 0.215, change24h: 4.3 },
      { ticker: 'MOON', name: 'To The Moon', supply: '1969000', price: 0.00934, change24h: 25.7 },
      { ticker: 'GWEI', name: 'Gas Unit', supply: '9000000', price: 0.00002, change24h: 0.5 },
      { ticker: 'PUNK', name: 'CryptoPunks', supply: '10000', price: 1.25, change24h: -3.4 },
      { ticker: 'FISH', name: 'Rare Fish', supply: '5000', price: 0.874, change24h: 7.5 },
      { ticker: 'GOLD', name: 'Digital Gold', supply: '1000000', price: 0.0174, change24h: 2.3 },
      { ticker: 'PIZA', name: 'Bitcoin Pizza', supply: '10000', price: 0.421, change24h: 5.4 },
      { ticker: 'HODL', name: 'Hodlers', supply: '21000000', price: 0.00123, change24h: 3.1 },
      { ticker: 'TACO', name: 'Taco Tuesday', supply: '52000', price: 0.0274, change24h: -0.8 },
    ];
    
    // Adicionar dados aleatórios para completar a lista se necessário
    while (runes.length < offset + limit) {
      const idx = runes.length;
      runes.push({
        ticker: `RUN${idx}`,
        name: `Random Rune ${idx}`,
        supply: `${Math.floor(Math.random() * 1000000)}`,
        price: Math.random() * 0.1,
        change24h: (Math.random() * 20) - 10
      });
    }
    
    // Aplicar paginação
    const paginatedRunes = runes.slice(offset, offset + limit);
    
    return {
      results: paginatedRunes,
      total: runes.length,
      offset,
      limit,
      nextOffset: offset + limit < runes.length ? offset + limit : null
    };
  }
  
  /**
   * Gera dados mockados para carteiras
   * @private
   * @param {Object} params - Parâmetros da requisição
   * @returns {Object} - Dados mockados
   */
  generateMockWalletData(params = {}) {
    const address = params.address || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
    
    return {
      address,
      balance: {
        btc: Math.random() * 10,
        runes: [
          { ticker: 'ORDI', amount: Math.floor(Math.random() * 10000) },
          { ticker: 'SATS', amount: Math.floor(Math.random() * 1000000) },
          { ticker: 'MEME', amount: Math.floor(Math.random() * 50000) }
        ]
      },
      transactions: Array(10).fill(0).map((_, i) => ({
        txid: `mock_tx_${i}_${Math.random().toString(36).substring(2, 10)}`,
        blockHeight: 800000 - i,
        timestamp: Date.now() - (i * 3600000),
        type: Math.random() > 0.5 ? 'send' : 'receive',
        amount: Math.random() * 1000
      })),
      isWhale: Math.random() > 0.7
    };
  }
  
  /**
   * Gera dados mockados para transações
   * @private
   * @param {Object} params - Parâmetros da requisição
   * @returns {Object} - Dados mockados
   */
  generateMockTransactions(params = {}) {
    const { limit = 10, ticker = 'ORDI' } = params;
    
    const transactions = Array(limit).fill(0).map((_, i) => {
      const isReceive = Math.random() > 0.5;
      const amount = Math.floor(Math.random() * 1000);
      
      return {
        txid: `mock_tx_${ticker}_${i}_${Math.random().toString(36).substring(2, 10)}`,
        blockHeight: 800000 - i,
        timestamp: Date.now() - (i * 3600000),
        from: isReceive ? 
          `1${Math.random().toString(36).substring(2, 12)}` : 
          '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        to: isReceive ? 
          '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' : 
          `1${Math.random().toString(36).substring(2, 12)}`,
        amount,
        ticker,
        usdValue: amount * (ticker === 'ORDI' ? 0.125 : 0.05),
        isWhaleTransaction: amount > 500
      };
    });
    
    return {
      transactions,
      ticker,
      total: 1000 + limit,
      hasMore: true
    };
  }
  
  /**
   * Gera estatísticas mockadas
   * @private
   * @param {Object} params - Parâmetros da requisição
   * @returns {Object} - Dados mockados
   */
  generateMockStats(params = {}) {
    return {
      totalRunes: 248,
      totalTransactions: 1543982,
      totalHolders: 287652,
      volume24h: 12457890,
      volumeChange: 5.7,
      mostActive: [
        { ticker: 'ORDI', transactions: 24563, volume: 3218754 },
        { ticker: 'SATS', transactions: 18921, volume: 2154632 },
        { ticker: 'PEPE', transactions: 12834, volume: 1876543 }
      ],
      latestRunes: [
        { ticker: 'MOON', timestamp: Date.now() - 3600000 },
        { ticker: 'STAR', timestamp: Date.now() - 7200000 },
        { ticker: 'BOOM', timestamp: Date.now() - 10800000 }
      ]
    };
  }
}

export default ApiManager; 
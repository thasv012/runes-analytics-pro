/**
 * RUNES Analytics Pro - API Middleware
 * 
 * Camada de abstração para comunicação com múltiplas APIs,
 * padronizando respostas, tratamento de erros, rate-limiting
 * e implementando fallbacks inteligentes.
 */

const axios = require('axios');
const advancedCache = require('../cache/AdvancedCacheService');

/**
 * Classe responsável por padronizar e gerenciar a comunicação com múltiplas APIs
 */
class ApiMiddleware {
  constructor() {
    // Configurações gerais
    this.rateLimits = new Map(); // Mapeia endpoint -> { count, lastReset, maxRequests, interval }
    this.fallbackConfig = new Map(); // Configuração de fallback por endpoint
    this.apiConfig = new Map(); // Configurações específicas por API
    this.metricsByApi = new Map(); // Métricas por API
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 segundo inicial
      maxDelay: 30000, // 30 segundos máximo
    };
    
    // ID do intervalo para reset de rate limit
    this.rateLimitIntervalId = null;
    
    // Inicializar métricas
    this.resetMetrics();
    
    // Iniciar o monitoramento de rate limit
    this.startRateLimitMonitoring();
    
    console.log('🔄 ApiMiddleware inicializado');
  }
  
  /**
   * Reseta as métricas de todas as APIs
   * @private
   */
  resetMetrics() {
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.totalCacheHits = 0;
    this.totalFallbacks = 0;
    this.lastErrors = [];
    this.metricsByApi.clear();
  }
  
  /**
   * Inicia o monitoramento de rate limit para evitar sobrecarga nas APIs
   * @private
   */
  startRateLimitMonitoring() {
    // Limpar intervalo anterior se existir
    if (this.rateLimitIntervalId) {
      clearInterval(this.rateLimitIntervalId);
    }
    
    // Verificar e resetar contadores de rate limit a cada 10 segundos
    this.rateLimitIntervalId = setInterval(() => {
      const now = Date.now();
      
      for (const [endpoint, limit] of this.rateLimits.entries()) {
        // Verificar se o intervalo já passou e precisamos resetar o contador
        if (now - limit.lastReset >= limit.interval) {
          limit.count = 0;
          limit.lastReset = now;
          console.log(`[RATE-LIMIT] Reset do contador para ${endpoint}`);
        }
      }
    }, 10000); // 10 segundos
  }
  
  /**
   * Registra uma nova API no middleware
   * 
   * @param {string} apiName - Nome único da API
   * @param {Object} config - Configuração da API
   * @param {string} config.baseURL - URL base da API
   * @param {Object} config.headers - Cabeçalhos padrão
   * @param {number} config.timeout - Timeout em ms
   * @param {number} config.priority - Prioridade para fallback (maior = mais prioritário)
   * @param {Object} config.rateLimits - Configuração de rate limits por endpoint ou global
   * @returns {ApiMiddleware} - A própria instância para encadeamento
   */
  registerApi(apiName, config) {
    // Validar parâmetros
    if (!apiName || typeof apiName !== 'string') {
      throw new Error('Nome da API deve ser uma string não vazia');
    }
    
    if (!config || !config.baseURL) {
      throw new Error('Configuração da API deve incluir baseURL');
    }
    
    // Configuração padrão
    const defaultConfig = {
      timeout: 10000,
      priority: 0,
      headers: {},
      rateLimits: {
        global: {
          maxRequests: 60,
          interval: 60000 // 1 minuto
        }
      }
    };
    
    // Mesclar com configuração fornecida
    const apiConfig = {
      ...defaultConfig,
      ...config,
      client: axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout || defaultConfig.timeout,
        headers: config.headers || defaultConfig.headers
      })
    };
    
    // Registrar cliente da API
    this.apiConfig.set(apiName, apiConfig);
    
    // Inicializar métricas para esta API
    this.metricsByApi.set(apiName, {
      requests: 0,
      errors: 0,
      latency: [],
      lastStatus: 'unknown'
    });
    
    console.log(`[API] Registrada API: ${apiName} -> ${config.baseURL}`);
    return this;
  }
  
  /**
   * Define uma configuração de fallback para um endpoint específico
   * 
   * @param {string} endpoint - O endpoint a ser configurado
   * @param {Object} config - A configuração de fallback
   * @param {string[]} config.apis - Lista de APIs a tentar em ordem
   * @param {Object} config.transformation - Funções para transformar request/response entre APIs
   * @param {boolean} config.useMock - Se deve usar dados mockados como último recurso
   * @returns {ApiMiddleware} - A própria instância para encadeamento
   */
  setFallbackFor(endpoint, config) {
    if (!endpoint) {
      throw new Error('Endpoint deve ser especificado');
    }
    
    // Configuração padrão
    const defaultConfig = {
      apis: [], // Lista vazia significa que não há fallback
      transformation: {}, // Transformação nula significa passagem direta
      useMock: false
    };
    
    this.fallbackConfig.set(endpoint, {
      ...defaultConfig,
      ...config
    });
    
    return this;
  }
  
  /**
   * Configura limites de taxa para um endpoint específico
   * 
   * @param {string} endpoint - O endpoint a ser configurado
   * @param {number} maxRequests - Número máximo de requisições no intervalo
   * @param {number} interval - Intervalo em ms para reset do contador
   * @returns {ApiMiddleware} - A própria instância para encadeamento
   */
  setRateLimit(endpoint, maxRequests, interval = 60000) {
    this.rateLimits.set(endpoint, {
      count: 0,
      lastReset: Date.now(),
      maxRequests,
      interval
    });
    
    console.log(`[RATE-LIMIT] Definido para ${endpoint}: ${maxRequests} req / ${interval/1000}s`);
    return this;
  }
  
  /**
   * Adiciona funções de mock para um endpoint específico
   * 
   * @param {string} endpoint - O endpoint a ser configurado
   * @param {Function} mockFn - Função que gera dados mockados
   * @returns {ApiMiddleware} - A própria instância para encadeamento
   */
  setMockFor(endpoint, mockFn) {
    const fallback = this.fallbackConfig.get(endpoint) || {};
    fallback.mockFn = mockFn;
    fallback.useMock = true;
    this.fallbackConfig.set(endpoint, fallback);
    return this;
  }
  
  /**
   * Verifica se um endpoint está em rate limit
   * 
   * @private
   * @param {string} endpoint - O endpoint a verificar
   * @returns {boolean} - true se estiver em rate limit
   */
  _isRateLimited(endpoint) {
    // Sem configuração de rate limit = sem limite
    if (!this.rateLimits.has(endpoint)) {
      return false;
    }
    
    const limit = this.rateLimits.get(endpoint);
    return limit.count >= limit.maxRequests;
  }
  
  /**
   * Incrementa o contador de rate limit para um endpoint
   * 
   * @private
   * @param {string} endpoint - O endpoint a incrementar
   */
  _incrementRateLimit(endpoint) {
    if (this.rateLimits.has(endpoint)) {
      const limit = this.rateLimits.get(endpoint);
      limit.count++;
      
      // Logging se estiver próximo do limite
      if (limit.count >= limit.maxRequests - 5) {
        console.warn(`[RATE-LIMIT] Atenção: ${endpoint} está próximo do limite (${limit.count}/${limit.maxRequests})`);
      }
    }
  }
  
  /**
   * Formata uma resposta de acordo com o padrão do middleware
   * 
   * @private
   * @param {Object} responseData - Dados da resposta
   * @param {Object} metadata - Metadados adicionais
   * @returns {Object} - Resposta padronizada
   */
  _formatResponse(responseData, metadata = {}) {
    return {
      data: responseData,
      success: true,
      timestamp: Date.now(),
      source: metadata.source || 'unknown',
      fromCache: metadata.fromCache || false,
      latency: metadata.latency || 0,
      ...metadata
    };
  }
  
  /**
   * Formata uma resposta de erro de acordo com o padrão do middleware
   * 
   * @private
   * @param {Error} error - O erro ocorrido
   * @param {Object} metadata - Metadados adicionais
   * @returns {Object} - Resposta de erro padronizada
   */
  _formatErrorResponse(error, metadata = {}) {
    // Extrair informações úteis do erro
    const errorData = {
      message: error.message,
      code: error.code || 'ERR_UNKNOWN',
      status: error.response?.status || 500,
      details: error.response?.data || null,
    };
    
    // Armazenar para diagnóstico
    this.lastErrors.unshift({
      timestamp: Date.now(),
      error: errorData,
      endpoint: metadata.endpoint,
      api: metadata.api
    });
    
    // Manter apenas os últimos 10 erros
    if (this.lastErrors.length > 10) {
      this.lastErrors.pop();
    }
    
    return {
      error: errorData,
      success: false,
      timestamp: Date.now(),
      source: metadata.source || 'unknown',
      ...metadata
    };
  }
  
  /**
   * Aplica transformações necessárias entre APIs diferentes
   * 
   * @private
   * @param {Object} data - Dados a transformar
   * @param {string} fromApi - API de origem
   * @param {string} toApi - API de destino
   * @param {string} endpoint - Endpoint atual
   * @returns {Object} - Dados transformados
   */
  _transformData(data, fromApi, toApi, endpoint) {
    const fallback = this.fallbackConfig.get(endpoint);
    
    // Sem configuração de transformação ou mesma API = sem transformação
    if (!fallback || !fallback.transformation || fromApi === toApi) {
      return data;
    }
    
    // Função de transformação específica para este par de APIs
    const transformKey = `${fromApi}To${toApi.charAt(0).toUpperCase() + toApi.slice(1)}`;
    
    if (fallback.transformation[transformKey] && typeof fallback.transformation[transformKey] === 'function') {
      return fallback.transformation[transformKey](data);
    }
    
    // Função de transformação genérica
    if (fallback.transformation.default && typeof fallback.transformation.default === 'function') {
      return fallback.transformation.default(data, fromApi, toApi);
    }
    
    // Sem transformação disponível
    return data;
  }
  
  /**
   * Aplica atraso exponencial entre tentativas (exponential backoff)
   * 
   * @private
   * @param {number} attempt - Número da tentativa atual (começando em 1)
   * @returns {Promise<void>} - Promise que resolve após o atraso
   */
  async _applyBackoff(attempt) {
    if (attempt <= 0) return;
    
    // Calcular delay com jitter (aleatoriedade) para evitar tempestade de requisições
    const jitter = Math.random() * 0.3 + 0.85; // Entre 0.85 e 1.15
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(2, attempt - 1) * jitter,
      this.retryConfig.maxDelay
    );
    
    console.log(`[RETRY] Aguardando ${Math.round(delay)}ms antes da próxima tentativa`);
    
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Executa uma requisição com sistema completo de fallback, retry e caching
   * 
   * @public
   * @async
   * @param {Object} options - Opções da requisição
   * @param {string} options.endpoint - O endpoint a ser chamado
   * @param {string} options.preferredApi - A API preferida para esta chamada
   * @param {Object} options.params - Parâmetros da requisição
   * @param {Object} options.cacheOptions - Opções de cache
   * @param {number} options.cacheOptions.ttl - Tempo de vida em segundos
   * @param {string} options.cacheOptions.tag - Tag para invalidação em grupo
   * @param {boolean} options.cacheOptions.forceFresh - Força atualização ignorando cache
   * @param {Object} options.headers - Cabeçalhos adicionais
   * @returns {Promise<Object>} - Resposta padronizada
   */
  async request(options) {
    const {
      endpoint,
      preferredApi,
      params = {},
      cacheOptions = {},
      headers = {}
    } = options;
    
    // Validação básica
    if (!endpoint) {
      throw new Error('Endpoint é obrigatório');
    }
    
    if (!preferredApi || !this.apiConfig.has(preferredApi)) {
      throw new Error(`API preferida ${preferredApi} não está registrada`);
    }
    
    // Incrementar contadores
    this.totalRequests++;
    
    // Gerar chave de cache
    const cacheKey = cacheOptions.key || `${preferredApi}:${endpoint}:${JSON.stringify(params)}`;
    
    // Tentar obter do cache se não foi solicitado dados frescos
    if (!cacheOptions.forceFresh && this.cacheOptions?.ttl !== 0) {
      try {
        const cachedData = await advancedCache.get(cacheKey);
        if (cachedData) {
          this.totalCacheHits++;
          return this._formatResponse(cachedData, {
            source: preferredApi,
            fromCache: true,
            cacheKey
          });
        }
      } catch (cacheError) {
        console.warn(`[CACHE] Erro ao acessar cache: ${cacheError.message}`);
      }
    }
    
    // Verificar rate limit
    if (this._isRateLimited(endpoint)) {
      console.warn(`[RATE-LIMIT] Endpoint ${endpoint} atingiu limite de requisições`);
      
      // Se estamos em rate limit, verificar se temos configuração de fallback
      const fallback = this.fallbackConfig.get(endpoint);
      
      if (fallback && fallback.apis.length > 0) {
        return this._handleFallback(endpoint, params, cacheOptions, headers, preferredApi, 0);
      }
      
      // Se não temos fallback, verificar cache com TTL mais flexível
      try {
        const cachedData = await advancedCache.get(cacheKey);
        if (cachedData) {
          this.totalCacheHits++;
          return this._formatResponse(cachedData, {
            source: preferredApi,
            fromCache: true,
            cacheKey,
            stale: true
          });
        }
      } catch (cacheError) {
        // Ignorar erros de cache neste ponto
      }
      
      // Se tudo falhar, retornar erro de rate limit
      this.totalErrors++;
      return this._formatErrorResponse(
        new Error(`Taxa limite excedida para ${endpoint}`),
        { endpoint, api: preferredApi, code: 'RATE_LIMIT_EXCEEDED' }
      );
    }
    
    // Incrementar contador de rate limit
    this._incrementRateLimit(endpoint);
    
    // Obter configuração da API
    const apiConfig = this.apiConfig.get(preferredApi);
    const metrics = this.metricsByApi.get(preferredApi);
    metrics.requests++;
    
    // Hora de início para medir latência
    const startTime = Date.now();
    
    // Tentar executar a requisição com retries
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // Se não for a primeira tentativa, aplicar backoff
        if (attempt > 1) {
          await this._applyBackoff(attempt - 1);
        }
        
        // Executar requisição
        const response = await apiConfig.client.get(endpoint, {
          params,
          headers: { ...apiConfig.headers, ...headers }
        });
        
        // Calcular latência
        const latency = Date.now() - startTime;
        metrics.latency.push(latency);
        
        // Manter apenas as últimas 10 medições
        if (metrics.latency.length > 10) {
          metrics.latency.shift();
        }
        
        // Atualizar status
        metrics.lastStatus = 'success';
        
        // Armazenar no cache se configurado
        if (cacheOptions.ttl > 0) {
          try {
            await advancedCache.set(
              cacheKey, 
              response.data, 
              cacheOptions.ttl,
              { tag: cacheOptions.tag }
            );
          } catch (cacheError) {
            console.warn(`[CACHE] Erro ao armazenar no cache: ${cacheError.message}`);
          }
        }
        
        // Retornar resposta formatada
        return this._formatResponse(response.data, {
          source: preferredApi,
          latency,
          status: response.status,
          endpoint
        });
      } catch (error) {
        console.error(`[API:${preferredApi}] Erro na tentativa ${attempt}/${this.retryConfig.maxRetries} para ${endpoint}: ${error.message}`);
        
        // Última tentativa falhou, verificar o fallback
        if (attempt === this.retryConfig.maxRetries) {
          // Atualizar métricas
          metrics.errors++;
          metrics.lastStatus = 'error';
          
          // Verificar se temos configuração de fallback
          const fallback = this.fallbackConfig.get(endpoint);
          
          if (fallback && fallback.apis.length > 0) {
            return this._handleFallback(endpoint, params, cacheOptions, headers, preferredApi, attempt);
          }
          
          // Se não temos fallback, retornar erro
          this.totalErrors++;
          return this._formatErrorResponse(error, {
            endpoint,
            api: preferredApi,
            attempts: attempt
          });
        }
      }
    }
  }
  
  /**
   * Gerencia o fallback para outras APIs
   * 
   * @private
   * @async
   * @param {string} endpoint - O endpoint original
   * @param {Object} params - Parâmetros originais
   * @param {Object} cacheOptions - Opções de cache
   * @param {Object} headers - Cabeçalhos adicionais
   * @param {string} failedApi - A API que falhou
   * @param {number} attempt - Número da tentativa atual
   * @returns {Promise<Object>} - Resposta da API alternativa ou resposta de erro
   */
  async _handleFallback(endpoint, params, cacheOptions, headers, failedApi, attempt) {
    const fallback = this.fallbackConfig.get(endpoint);
    
    // Contar a tentativa de fallback
    this.totalFallbacks++;
    
    // Filtrar as APIs configuradas, excluindo a que falhou
    const availableApis = fallback.apis.filter(api => 
      api !== failedApi && this.apiConfig.has(api)
    );
    
    console.log(`[FALLBACK] Tentando APIs alternativas para ${endpoint}: ${availableApis.join(', ')}`);
    
    // Tentar cada API alternativa
    for (const api of availableApis) {
      // Transformar parâmetros se necessário
      const transformedParams = this._transformData(params, failedApi, api, endpoint);
      
      // Aplicar backoff entre tentativas de diferentes APIs
      await this._applyBackoff(attempt);
      
      try {
        // Usar a mesma função de request, mas com a API alternativa
        const result = await this.request({
          endpoint,
          preferredApi: api,
          params: transformedParams,
          cacheOptions: {
            ...cacheOptions,
            key: `${api}:${endpoint}:${JSON.stringify(transformedParams)}`
          },
          headers
        });
        
        // Transformar a resposta de volta para o formato da API original
        if (result.success) {
          result.data = this._transformData(result.data, api, failedApi, endpoint);
          result.fallbackFrom = failedApi;
          
          // Armazenar no cache original para evitar fallbacks futuros
          if (cacheOptions.ttl > 0) {
            try {
              await advancedCache.set(
                `${failedApi}:${endpoint}:${JSON.stringify(params)}`,
                result.data,
                cacheOptions.ttl,
                { tag: cacheOptions.tag, fallbackSource: api }
              );
            } catch (cacheError) {
              console.warn(`[CACHE] Erro ao armazenar fallback no cache: ${cacheError.message}`);
            }
          }
          
          return result;
        }
      } catch (error) {
        console.error(`[FALLBACK:${api}] Erro: ${error.message}`);
        // Continuar para a próxima API
      }
    }
    
    // Se todas as APIs alternativas falharem e temos um mock configurado
    if (fallback.useMock && typeof fallback.mockFn === 'function') {
      console.log(`[MOCK] Usando dados mockados para ${endpoint}`);
      
      try {
        const mockData = await fallback.mockFn(params, endpoint, failedApi);
        
        return this._formatResponse(mockData, {
          source: 'mock',
          latency: 0,
          isMock: true,
          fallbackFrom: failedApi,
          endpoint
        });
      } catch (mockError) {
        console.error(`[MOCK] Erro ao gerar dados mockados: ${mockError.message}`);
      }
    }
    
    // Se tudo falhar, retornar erro de fallback
    this.totalErrors++;
    return this._formatErrorResponse(
      new Error(`Todas as APIs alternativas falharam para ${endpoint}`),
      { 
        endpoint, 
        api: failedApi, 
        triedApis: availableApis,
        code: 'ALL_FALLBACKS_FAILED' 
      }
    );
  }
  
  /**
   * Invalida o cache para uma tag específica
   * 
   * @public
   * @async
   * @param {string} tag - A tag para invalidar
   * @returns {Promise<void>}
   */
  async invalidateTag(tag) {
    if (!tag) return;
    
    try {
      // Usar o método do AdvancedCacheService
      if (advancedCache.invalidateByTag) {
        await advancedCache.invalidateByTag(tag);
      } else {
        // Implementação alternativa se o método não existir
        const keys = Array.from(advancedCache.memoryCache.keys())
          .filter(key => key.includes(`:${tag}`));
        
        for (const key of keys) {
          await advancedCache.del(key);
        }
      }
      
      console.log(`[CACHE] Invalidados itens com tag: ${tag}`);
    } catch (error) {
      console.error(`[CACHE] Erro ao invalidar tag ${tag}: ${error.message}`);
    }
  }
  
  /**
   * Obtém estatísticas e métricas do middleware
   * 
   * @public
   * @returns {Object} - Estatísticas coletadas
   */
  getStats() {
    // Calcular latência média por API
    const apiStats = {};
    
    for (const [apiName, metrics] of this.metricsByApi.entries()) {
      const avgLatency = metrics.latency.length > 0 
        ? metrics.latency.reduce((sum, val) => sum + val, 0) / metrics.latency.length 
        : 0;
      
      apiStats[apiName] = {
        requests: metrics.requests,
        errors: metrics.errors,
        errorRate: metrics.requests > 0 ? (metrics.errors / metrics.requests * 100).toFixed(2) + '%' : '0%',
        avgLatency: Math.round(avgLatency),
        lastStatus: metrics.lastStatus
      };
    }
    
    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      totalCacheHits: this.totalCacheHits,
      totalFallbacks: this.totalFallbacks,
      cacheHitRate: this.totalRequests > 0 
        ? (this.totalCacheHits / this.totalRequests * 100).toFixed(2) + '%' 
        : '0%',
      errorRate: this.totalRequests > 0 
        ? (this.totalErrors / this.totalRequests * 100).toFixed(2) + '%' 
        : '0%',
      fallbackRate: this.totalRequests > 0 
        ? (this.totalFallbacks / this.totalRequests * 100).toFixed(2) + '%' 
        : '0%',
      apiStats,
      rateLimits: Object.fromEntries(
        Array.from(this.rateLimits.entries()).map(([key, value]) => [
          key, 
          { 
            current: value.count, 
            max: value.maxRequests,
            resetsIn: Math.max(0, value.interval - (Date.now() - value.lastReset)) 
          }
        ])
      ),
      lastErrors: this.lastErrors.slice(0, 5) // Retornar apenas os últimos 5 erros
    };
  }
  
  /**
   * Limpa uma chave específica do cache
   * 
   * @public
   * @async
   * @param {string} cacheKey - A chave para limpar
   * @returns {Promise<boolean>} - true se removida com sucesso
   */
  async clearCacheKey(cacheKey) {
    try {
      return await advancedCache.del(cacheKey);
    } catch (error) {
      console.error(`[CACHE] Erro ao limpar chave ${cacheKey}: ${error.message}`);
      return false;
    }
  }
}

// Exportar singleton
const apiMiddleware = new ApiMiddleware();
module.exports = apiMiddleware;

// Para uso no navegador
if (typeof window !== 'undefined') {
  window.apiMiddleware = apiMiddleware;
} 
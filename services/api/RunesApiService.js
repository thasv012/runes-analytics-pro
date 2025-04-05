/**
 * RUNES Analytics Pro - Serviço de API unificado para Runes
 * 
 * Fornece interface simplificada para acessar dados de Runes
 * utilizando o middleware para abstração de múltiplas APIs
 */

const apiMiddleware = require('./ApiMiddleware');

class RunesApiService {
  constructor() {
    // Cache TTL padrão (1 hora)
    this.defaultTTL = 3600;
    
    // API preferida para cada tipo de operação
    this.preferredApis = {
      listRunes: 'ordiscan',
      runeDetails: 'geniidata',
      runeActivity: 'ordiscan',
      runeMarket: 'geniidata',
      runeHolders: 'geniidata',
      runeTxs: 'ordiscan'
    };
    
    console.log('🪄 RunesApiService inicializado');
  }
  
  /**
   * Obtém lista de runes com filtro e ordenação
   * 
   * @param {Object} options - Opções para filtrar e ordenar
   * @param {string} options.sortBy - Campo para ordenar
   * @param {string} options.order - Direção da ordenação (asc/desc)
   * @param {number} options.limit - Limite de resultados
   * @param {number} options.offset - Deslocamento para paginação
   * @param {boolean} options.refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async listRunes(options = {}) {
    const {
      sortBy = 'holders',
      order = 'desc',
      limit = 100,
      offset = 0,
      refresh = false
    } = options;
    
    // Parâmetros para a requisição
    const params = {
      sort: sortBy,
      order,
      limit,
      offset
    };
    
    // Opções de cache
    const cacheOptions = {
      ttl: this.defaultTTL,
      tag: 'runes-list',
      forceFresh: refresh
    };
    
    // Executar requisição através do middleware
    return apiMiddleware.request({
      endpoint: '/api/v1/runes',
      preferredApi: this.preferredApis.listRunes,
      params,
      cacheOptions
    });
  }
  
  /**
   * Obtém detalhes completos de uma rune específica
   * 
   * @param {string} runeName - Nome/tick da rune
   * @param {boolean} refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async getRuneDetails(runeName, refresh = false) {
    if (!runeName) {
      throw new Error('Nome da rune é obrigatório');
    }
    
    // Formatar o endpoint com o nome da rune
    const endpoint = `/api/v1/runes/${runeName}`;
    
    // Opções de cache com tag específica para esta rune
    const cacheOptions = {
      ttl: this.defaultTTL,
      tag: `rune:${runeName}`,
      forceFresh: refresh
    };
    
    // Executar requisição
    return apiMiddleware.request({
      endpoint,
      preferredApi: this.preferredApis.runeDetails,
      params: { runeName },
      cacheOptions
    });
  }
  
  /**
   * Obtém histórico de transações para uma rune
   * 
   * @param {string} runeName - Nome/tick da rune
   * @param {Object} options - Opções de filtro
   * @param {number} options.limit - Limite de resultados
   * @param {boolean} options.refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async getRuneTransactions(runeName, options = {}) {
    if (!runeName) {
      throw new Error('Nome da rune é obrigatório');
    }
    
    const {
      limit = 50,
      refresh = false
    } = options;
    
    // Formatar endpoint
    const endpoint = `/api/v1/runes/${runeName}/transactions`;
    
    // Parâmetros
    const params = {
      limit
    };
    
    // Opções de cache
    const cacheOptions = {
      ttl: 300, // 5 minutos (TTL mais curto para dados de transações)
      tag: `rune:${runeName}:txs`,
      forceFresh: refresh
    };
    
    // Executar requisição
    return apiMiddleware.request({
      endpoint,
      preferredApi: this.preferredApis.runeTxs,
      params,
      cacheOptions
    });
  }
  
  /**
   * Obtém atividade recente para todas as runes
   * 
   * @param {number} limit - Limite de resultados
   * @param {boolean} refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async getRunesActivity(limit = 20, refresh = false) {
    // Endpoint para atividade
    const endpoint = '/api/v1/activity';
    
    // Opções de cache
    const cacheOptions = {
      ttl: 300, // 5 minutos (TTL mais curto para dados de atividade recente)
      tag: 'runes-activity',
      forceFresh: refresh
    };
    
    // Executar requisição
    return apiMiddleware.request({
      endpoint,
      preferredApi: this.preferredApis.runeActivity,
      params: { limit },
      cacheOptions
    });
  }
  
  /**
   * Obtém dados de mercado para uma ou mais runes
   * 
   * @param {string|Array} runeNames - Nome(s) da(s) rune(s)
   * @param {boolean} refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async getRuneMarketData(runeNames, refresh = false) {
    // Converter para array se for string única
    const ticks = Array.isArray(runeNames) ? runeNames : [runeNames];
    
    // Formatar endpoint
    const endpoint = '/api/v1/market';
    
    // Parâmetros
    const params = {
      ticks: ticks.join(',')
    };
    
    // Opções de cache
    const cacheOptions = {
      ttl: 600, // 10 minutos
      tag: 'market-data',
      forceFresh: refresh
    };
    
    // Executar requisição
    return apiMiddleware.request({
      endpoint,
      preferredApi: this.preferredApis.runeMarket,
      params,
      cacheOptions
    });
  }
  
  /**
   * Obtém a distribuição de holders para uma rune
   * 
   * @param {string} runeName - Nome/tick da rune
   * @param {boolean} refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async getRuneHolders(runeName, refresh = false) {
    if (!runeName) {
      throw new Error('Nome da rune é obrigatório');
    }
    
    // Formatar endpoint
    const endpoint = `/api/v1/runes/${runeName}/holders`;
    
    // Opções de cache
    const cacheOptions = {
      ttl: 3600, // 1 hora (dados de holders mudam menos frequentemente)
      tag: `rune:${runeName}:holders`,
      forceFresh: refresh
    };
    
    // Executar requisição
    return apiMiddleware.request({
      endpoint,
      preferredApi: this.preferredApis.runeHolders,
      params: {},
      cacheOptions
    });
  }
  
  /**
   * Verifica se um endereço possui determinada rune
   * 
   * @param {string} address - Endereço Bitcoin a verificar
   * @param {string} runeName - Nome/tick da rune
   * @param {boolean} refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async checkRuneBalance(address, runeName, refresh = false) {
    if (!address) {
      throw new Error('Endereço é obrigatório');
    }
    
    // Formatar endpoint
    const endpoint = `/api/v1/address/${address}`;
    
    // Parâmetros
    const params = {
      rune: runeName
    };
    
    // Opções de cache
    const cacheOptions = {
      ttl: 300, // 5 minutos
      tag: `address:${address}`,
      forceFresh: refresh
    };
    
    // Executar requisição
    return apiMiddleware.request({
      endpoint,
      preferredApi: this.preferredApis.runeDetails,
      params,
      cacheOptions
    });
  }
  
  /**
   * Pesquisa runes por nome/tick
   * 
   * @param {string} query - Termo de busca
   * @param {boolean} refresh - Força dados frescos
   * @returns {Promise<Object>} - Resultado da requisição
   */
  async searchRunes(query, refresh = false) {
    if (!query || query.length < 2) {
      throw new Error('Termo de busca deve ter pelo menos 2 caracteres');
    }
    
    // Endpoint de pesquisa
    const endpoint = '/api/v1/search';
    
    // Parâmetros
    const params = {
      q: query
    };
    
    // Opções de cache
    const cacheOptions = {
      ttl: 1800, // 30 minutos
      tag: 'search',
      forceFresh: refresh
    };
    
    // Executar requisição
    return apiMiddleware.request({
      endpoint,
      preferredApi: this.preferredApis.listRunes,
      params,
      cacheOptions
    });
  }
  
  /**
   * Invalida o cache para uma rune específica
   * 
   * @param {string} runeName - Nome/tick da rune
   * @returns {Promise<void>}
   */
  async invalidateRuneCache(runeName) {
    if (!runeName) return;
    
    // Invalidar tags relacionadas
    await apiMiddleware.invalidateTag(`rune:${runeName}`);
    await apiMiddleware.invalidateTag(`rune:${runeName}:txs`);
    await apiMiddleware.invalidateTag(`rune:${runeName}:holders`);
    
    // Invalidar listas que podem conter esta rune
    await apiMiddleware.invalidateTag('runes-list');
    await apiMiddleware.invalidateTag('market-data');
    
    console.log(`[CACHE] Invalidado cache para rune: ${runeName}`);
  }
  
  /**
   * Obtém estatísticas das APIs
   * 
   * @returns {Object} - Estatísticas
   */
  getApiStats() {
    return apiMiddleware.getStats();
  }
  
  /**
   * Define a API preferida para um tipo de operação
   * 
   * @param {string} operationType - Tipo de operação
   * @param {string} apiName - Nome da API
   * @returns {RunesApiService} - A própria instância
   */
  setPreferredApi(operationType, apiName) {
    if (this.preferredApis.hasOwnProperty(operationType)) {
      this.preferredApis[operationType] = apiName;
      console.log(`[API] API preferida para ${operationType} alterada para ${apiName}`);
    }
    
    return this;
  }
}

// Exportar singleton
const runesApi = new RunesApiService();
module.exports = runesApi;

// Para uso no navegador
if (typeof window !== 'undefined') {
  window.runesApi = runesApi;
} 
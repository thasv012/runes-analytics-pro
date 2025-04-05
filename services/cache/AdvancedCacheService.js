/**
 * Sistema avançado de cache com suporte a:
 * - Memória (rápido, mas volátil)
 * - IndexedDB (persistente, mas mais lento)
 * - LocalStorage (fallback quando IndexedDB não está disponível)
 * - Compressão de dados com LZ-String
 * - Expiração automática e invalidação de cache
 * - Métricas de cache (taxa de acerto, ganho de compressão)
 */

// Importar LZ-String para compressão
const LZString = (function() {
  // Verificar se LZ-String está disponível globalmente (CDN)
  if (typeof window !== 'undefined' && window.LZString) {
    return window.LZString;
  }
  
  // Caso contrário, usar uma implementação básica inline
  // Esta é uma versão simplificada para fallback
  return {
    compress: function(str) {
      if (!str) return '';
      try {
        // Se BToa estiver disponível (navegadores)
        if (typeof btoa === 'function') {
          return btoa(encodeURIComponent(str));
        }
        return str; // Fallback sem compressão
      } catch (e) {
        console.warn('Erro ao comprimir string:', e);
        return str;
      }
    },
    decompress: function(str) {
      if (!str) return '';
      try {
        // Se ATob estiver disponível (navegadores)
        if (typeof atob === 'function') {
          return decodeURIComponent(atob(str));
        }
        return str; // Fallback sem compressão
      } catch (e) {
        console.warn('Erro ao descomprimir string:', e);
        return str;
      }
    }
  };
})();

// Constantes
const MEMORY_CACHE_SIZE = 100; // Número máximo de itens em memória
const DEFAULT_TTL = 5 * 60; // 5 minutos em segundos
const DB_NAME = 'RunesAnalyticsCache';
const DB_VERSION = 1;
const STORE_NAME = 'cacheItems';
const COMPRESS_THRESHOLD = 1024; // Comprimir dados acima de 1KB

class AdvancedCacheService {
  constructor() {
    // Cache em memória (mais rápido)
    this.memoryCache = new Map();
    
    // Ordenado por lastAccessed para implementar LRU
    this.accessOrder = [];
    
    // Métricas
    this.metrics = {
      hits: 0,
      misses: 0,
      compressionSavings: 0, // Bytes economizados
      compressionTotal: 0,   // Total de bytes antes da compressão
      dbSuccess: 0,
      dbError: 0
    };
    
    // Estado do IndexedDB
    this.db = null;
    this.dbReady = false;
    this.dbError = null;
    
    // Inicializar IndexedDB
    this._initIndexedDB();
    
    // Limpar caches expirados periodicamente
    this._startCleanupInterval();
    
    console.log('✅ AdvancedCacheService iniciado');
  }
  
  /**
   * Inicializa o banco de dados IndexedDB
   * @private
   */
  _initIndexedDB() {
    // Verificar se IndexedDB está disponível
    if (!window.indexedDB) {
      console.warn('IndexedDB não está disponível neste navegador, usando somente cache em memória');
      this.dbError = new Error('IndexedDB não suportado');
      return;
    }
    
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Criar ou atualizar objectStore
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
          console.log(`Criado store ${STORE_NAME} no IndexedDB`);
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.dbReady = true;
        console.log('IndexedDB inicializado com sucesso');
        
        // Limpar itens expirados ao iniciar
        this._cleanExpiredItems();
      };
      
      request.onerror = (event) => {
        this.dbError = event.target.error;
        console.error('Erro ao inicializar IndexedDB:', this.dbError);
      };
    } catch (error) {
      this.dbError = error;
      console.error('Erro ao configurar IndexedDB:', error);
    }
  }
  
  /**
   * Inicia o intervalo de limpeza de cache expirado
   * @private
   */
  _startCleanupInterval() {
    // Limpar a cada 5 minutos
    setInterval(() => {
      this._cleanExpiredItems();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Remove itens expirados de todos os níveis de cache
   * @private
   */
  async _cleanExpiredItems() {
    const now = Date.now();
    
    // Limpar cache em memória
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiry < now) {
        this.memoryCache.delete(key);
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
    }
    
    // Limpar IndexedDB se disponível
    if (this.dbReady) {
      try {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('expiry');
        
        // Consultar todos os itens expirados
        const range = IDBKeyRange.upperBound(now);
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            store.delete(cursor.value.key);
            cursor.continue();
          }
        };
      } catch (error) {
        console.error('Erro ao limpar itens expirados do IndexedDB:', error);
      }
    }
    
    // Limpar localStorage
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('runes_cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item.expiry < now) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Ignorar itens malformados
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  }
  
  /**
   * Atualiza a ordem de acesso para LRU
   * @private
   * @param {string} key - Chave do item acessado
   */
  _updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
    
    // Remover itens antigos se o cache exceder o tamanho máximo
    while (this.accessOrder.length > MEMORY_CACHE_SIZE) {
      const oldestKey = this.accessOrder.shift();
      this.memoryCache.delete(oldestKey);
    }
  }
  
  /**
   * Comprime um valor antes de armazenar
   * @private
   * @param {*} value - Valor a ser comprimido
   * @returns {Object} - Objeto com dados comprimidos e metadados
   */
  _compressValue(value) {
    // Converter para string se não for
    const stringValue = typeof value === 'string' ? 
      value : JSON.stringify(value);
    
    const originalSize = stringValue.length;
    
    // Só comprimir se for maior que o limite definido
    if (originalSize < COMPRESS_THRESHOLD) {
      return {
        data: value,
        isCompressed: false,
        originalSize,
        compressedSize: originalSize,
        isJSON: typeof value !== 'string'
      };
    }
    
    // Comprimir o valor
    const compressed = LZString.compress(stringValue);
    const compressedSize = compressed.length;
    
    // Atualizar métricas
    this.metrics.compressionTotal += originalSize;
    this.metrics.compressionSavings += (originalSize - compressedSize);
    
    return {
      data: compressed,
      isCompressed: true,
      originalSize,
      compressedSize,
      isJSON: typeof value !== 'string'
    };
  }
  
  /**
   * Descomprime um valor recuperado do cache
   * @private
   * @param {Object} item - Item do cache com metadados
   * @returns {*} - Valor original descomprimido
   */
  _decompressValue(item) {
    if (!item || typeof item !== 'object') return item;
    
    // Se não estiver comprimido, retornar diretamente
    if (!item.isCompressed) {
      return item.data;
    }
    
    // Descomprimir
    try {
      const decompressed = LZString.decompress(item.data);
      
      // Se o valor original era JSON, fazer parse
      if (item.isJSON) {
        return JSON.parse(decompressed);
      }
      
      return decompressed;
    } catch (error) {
      console.error('Erro ao descomprimir valor do cache:', error);
      return null;
    }
  }
  
  /**
   * Salva um item no IndexedDB
   * @private
   * @param {string} key - Chave do item
   * @param {Object} item - Item com dados e metadados
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  _saveToIndexedDB(key, item) {
    return new Promise((resolve) => {
      if (!this.dbReady) {
        resolve(false);
        return;
      }
      
      try {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.put({
          key,
          ...item,
        });
        
        request.onsuccess = () => {
          this.metrics.dbSuccess++;
          resolve(true);
        };
        
        request.onerror = (event) => {
          this.metrics.dbError++;
          console.error('Erro ao salvar no IndexedDB:', event.target.error);
          resolve(false);
        };
      } catch (error) {
        this.metrics.dbError++;
        console.error('Erro ao acessar IndexedDB:', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Recupera um item do IndexedDB
   * @private
   * @param {string} key - Chave do item
   * @returns {Promise<Object|null>} - Item recuperado ou null
   */
  _getFromIndexedDB(key) {
    return new Promise((resolve) => {
      if (!this.dbReady) {
        resolve(null);
        return;
      }
      
      try {
        const transaction = this.db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          const item = event.target.result;
          
          // Verificar se existe e não está expirado
          if (item && item.expiry > Date.now()) {
            resolve(item);
          } else {
            // Se expirado, excluir
            if (item) {
              this._removeFromIndexedDB(key);
            }
            resolve(null);
          }
        };
        
        request.onerror = () => {
          resolve(null);
        };
      } catch (error) {
        console.error('Erro ao ler do IndexedDB:', error);
        resolve(null);
      }
    });
  }
  
  /**
   * Remove um item do IndexedDB
   * @private
   * @param {string} key - Chave do item
   */
  _removeFromIndexedDB(key) {
    if (!this.dbReady) return;
    
    try {
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(key);
    } catch (error) {
      console.error('Erro ao remover item do IndexedDB:', error);
    }
  }
  
  /**
   * Salva um item no localStorage (fallback)
   * @private
   * @param {string} key - Chave do item
   * @param {Object} item - Item com dados e metadados
   * @returns {boolean} - Sucesso da operação
   */
  _saveToLocalStorage(key, item) {
    try {
      const storageKey = `runes_cache_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error);
      return false;
    }
  }
  
  /**
   * Recupera um item do localStorage
   * @private
   * @param {string} key - Chave do item
   * @returns {Object|null} - Item recuperado ou null
   */
  _getFromLocalStorage(key) {
    try {
      const storageKey = `runes_cache_${key}`;
      const data = localStorage.getItem(storageKey);
      
      if (!data) return null;
      
      const item = JSON.parse(data);
      
      // Verificar se não está expirado
      if (item.expiry > Date.now()) {
        return item;
      } else {
        // Se expirado, remover
        localStorage.removeItem(storageKey);
        return null;
      }
    } catch (error) {
      console.warn('Erro ao ler do localStorage:', error);
      return null;
    }
  }
  
  /**
   * Remove um item do localStorage
   * @private
   * @param {string} key - Chave do item
   */
  _removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(`runes_cache_${key}`);
    } catch (error) {
      console.warn('Erro ao remover item do localStorage:', error);
    }
  }
  
  /**
   * Verifica se um item existe no cache e não está expirado
   * @public
   * @param {string} key - Chave do item
   * @returns {Promise<boolean>} - Verdadeiro se o item existir e não estiver expirado
   */
  async has(key) {
    // Verificar primeiro no cache em memória (mais rápido)
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      if (item.expiry > Date.now()) {
        return true;
      } else {
        // Se expirado, remover
        this.memoryCache.delete(key);
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
    }
    
    // Verificar no IndexedDB
    if (this.dbReady) {
      const item = await this._getFromIndexedDB(key);
      if (item) {
        return true;
      }
    }
    
    // Verificar no localStorage como fallback
    const lsItem = this._getFromLocalStorage(key);
    return !!lsItem;
  }
  
  /**
   * Recupera um item do cache
   * @public
   * @param {string} key - Chave do item
   * @returns {Promise<*>} - Valor do item ou null se não existir ou estiver expirado
   */
  async get(key) {
    let value = null;
    let found = false;
    
    // 1. Verificar no cache em memória (mais rápido)
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      
      if (item.expiry > Date.now()) {
        value = this._decompressValue(item);
        found = true;
        this._updateAccessOrder(key);
        this.metrics.hits++;
      } else {
        // Se expirado, remover
        this.memoryCache.delete(key);
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
    }
    
    // Se não encontrado em memória, verificar no IndexedDB
    if (!found && this.dbReady) {
      const item = await this._getFromIndexedDB(key);
      
      if (item) {
        // Recuperar do IndexedDB e colocar em memória
        value = this._decompressValue(item);
        
        // Armazenar em memória para acesso mais rápido da próxima vez
        this.memoryCache.set(key, item);
        this._updateAccessOrder(key);
        
        found = true;
        this.metrics.hits++;
      }
    }
    
    // Se ainda não encontrado, verificar no localStorage como fallback
    if (!found) {
      const item = this._getFromLocalStorage(key);
      
      if (item) {
        value = this._decompressValue(item);
        
        // Armazenar em memória para acesso mais rápido da próxima vez
        this.memoryCache.set(key, item);
        this._updateAccessOrder(key);
        
        found = true;
        this.metrics.hits++;
        
        // Se IndexedDB estiver disponível, salvar lá também para o futuro
        if (this.dbReady) {
          this._saveToIndexedDB(key, item);
        }
      } else {
        this.metrics.misses++;
      }
    }
    
    return value;
  }
  
  /**
   * Armazena um item no cache
   * @public
   * @param {string} key - Chave do item
   * @param {*} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em segundos (opcional, padrão: DEFAULT_TTL)
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async set(key, value, ttl = DEFAULT_TTL) {
    if (value === undefined || value === null) {
      return false;
    }
    
    // Calcular expiração
    const expiry = Date.now() + (ttl * 1000);
    
    // Comprimir o valor
    const compressed = this._compressValue(value);
    
    // Criar o item do cache
    const item = {
      ...compressed,
      expiry,
      createdAt: Date.now()
    };
    
    // 1. Armazenar em memória (mais rápido)
    this.memoryCache.set(key, item);
    this._updateAccessOrder(key);
    
    // 2. Armazenar no IndexedDB de forma assíncrona
    let dbSuccess = false;
    if (this.dbReady) {
      dbSuccess = await this._saveToIndexedDB(key, item);
    }
    
    // 3. Armazenar no localStorage como fallback se IndexedDB falhar
    let lsSuccess = false;
    if (!dbSuccess) {
      lsSuccess = this._saveToLocalStorage(key, item);
    }
    
    return dbSuccess || lsSuccess;
  }
  
  /**
   * Remove um item de todos os níveis de cache
   * @public
   * @param {string} key - Chave do item
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async del(key) {
    let deleted = false;
    
    // Remover da memória
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      deleted = true;
    }
    
    // Remover do IndexedDB
    if (this.dbReady) {
      this._removeFromIndexedDB(key);
      deleted = true;
    }
    
    // Remover do localStorage
    this._removeFromLocalStorage(key);
    
    return deleted;
  }
  
  /**
   * Limpa todos os itens de cache em todos os níveis
   * @public
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async flush() {
    // Limpar memória
    this.memoryCache.clear();
    this.accessOrder = [];
    
    // Limpar IndexedDB
    if (this.dbReady) {
      try {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
      } catch (error) {
        console.error('Erro ao limpar IndexedDB:', error);
      }
    }
    
    // Limpar localStorage (apenas itens do cache)
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('runes_cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
      return false;
    }
    
    return true;
  }
  
  /**
   * Atualiza um item no cache se ele existir
   * @public
   * @param {string} key - Chave do item
   * @param {function} updateFn - Função que recebe o valor atual e retorna o novo valor
   * @param {number} ttl - Tempo de vida em segundos (opcional, padrão: DEFAULT_TTL)
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async update(key, updateFn, ttl = DEFAULT_TTL) {
    // Obter valor atual
    const currentValue = await this.get(key);
    
    // Se o item não existir, não faz nada
    if (currentValue === null || currentValue === undefined) {
      return false;
    }
    
    // Calcular novo valor
    try {
      const newValue = updateFn(currentValue);
      
      // Armazenar valor atualizado
      return this.set(key, newValue, ttl);
    } catch (error) {
      console.error('Erro ao atualizar item do cache:', error);
      return false;
    }
  }
  
  /**
   * Obter estatísticas do cache
   * @public
   * @returns {Object} - Estatísticas do cache
   */
  getStats() {
    // Contagem de itens
    const memoryCount = this.memoryCache.size;
    
    // Calcular hit rate
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? 
      (this.metrics.hits / totalRequests) * 100 : 0;
    
    // Calcular economia de compressão
    const compressionRate = this.metrics.compressionTotal > 0 ?
      (this.metrics.compressionSavings / this.metrics.compressionTotal) * 100 : 0;
    
    // Criar objeto de estatísticas
    const stats = {
      memory: {
        items: memoryCount,
        keys: Array.from(this.memoryCache.keys()),
      },
      requests: {
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        total: totalRequests,
        hitRate: hitRate.toFixed(2) + '%',
      },
      compression: {
        originalBytes: this.metrics.compressionTotal,
        savedBytes: this.metrics.compressionSavings,
        savingsPercent: compressionRate.toFixed(2) + '%',
      },
      indexedDB: {
        available: this.dbReady,
        error: this.dbError ? this.dbError.message : null,
        operations: {
          success: this.metrics.dbSuccess,
          errors: this.metrics.dbError,
        },
      },
    };
    
    return stats;
  }
  
  /**
   * Obtem ou cria item de cache assincronamente
   * @public
   * @param {string} key - Chave do item
   * @param {function} fetchFn - Função assíncrona para buscar dados quando não estão em cache
   * @param {number} ttl - Tempo de vida em segundos (opcional, padrão: DEFAULT_TTL)
   * @returns {Promise<*>} - Valor do cache ou o resultado da fetchFn
   */
  async getOrFetch(key, fetchFn, ttl = DEFAULT_TTL) {
    // Verificar se o item está em cache
    if (await this.has(key)) {
      return this.get(key);
    }
    
    try {
      // Buscar dados frescos
      const freshData = await fetchFn();
      
      // Armazenar no cache
      await this.set(key, freshData, ttl);
      
      return freshData;
    } catch (error) {
      console.error('Erro ao buscar dados frescos:', error);
      throw error;
    }
  }
  
  /**
   * Obtém múltiplos itens do cache de uma só vez
   * @public
   * @param {string[]} keys - Array de chaves
   * @returns {Promise<Object>} - Objeto com as chaves e valores encontrados
   */
  async getMany(keys) {
    const result = {};
    
    // Usando Promise.all para paralelizar as buscas
    const promises = keys.map(async (key) => {
      const value = await this.get(key);
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
    });
    
    await Promise.all(promises);
    
    return result;
  }
  
  /**
   * Comprime em lote todos os itens do cache que não estão comprimidos
   * Útil para reduzir drasticamente o uso de armazenamento após muitos dados serem armazenados
   * @public
   * @param {Object} options - Opções de compressão
   * @param {number} options.compressThreshold - Limite de tamanho para compressão (sobrescreve o padrão)
   * @param {boolean} options.forceAll - Força recompressão mesmo de itens já comprimidos
   * @returns {Promise<Object>} - Resultados da operação com estatísticas
   */
  async compressAll(options = {}) {
    // Estatísticas do processo
    const stats = {
      processed: 0,
      compressed: 0,
      skipped: 0,
      errors: 0,
      originalSize: 0,
      compressedSize: 0,
      startTime: Date.now()
    };
    
    // Limite de compressão para esta operação (pode sobrescrever o padrão)
    const threshold = options.compressThreshold || COMPRESS_THRESHOLD;
    const forceAll = options.forceAll || false;
    
    // Log inicial
    console.log(`🗜️ Iniciando compressão em lote do cache (threshold: ${threshold} bytes, forceAll: ${forceAll})`);
    
    // Processar IndexedDB (principal)
    if (this.dbReady) {
      try {
        // Primeiro, obter todas as chaves do IndexedDB
        const keys = await this._getAllKeysFromIndexedDB();
        console.log(`📊 Encontradas ${keys.length} chaves no IndexedDB`);
        
        // Processar cada item
        for (const key of keys) {
          try {
            stats.processed++;
            
            // Obter o item atual
            const item = await this._getFromIndexedDB(key);
            if (!item) continue;
            
            // Verificar se deve comprimir
            if (!forceAll && item.isCompressed) {
              stats.skipped++;
              continue;
            }
            
            // Descomprimir se necessário para recomprimir corretamente
            let value = item.isCompressed ? 
              this._decompressValue(item) : 
              item.data;
            
            // Calcular tamanho original
            const originalSize = item.originalSize || 
              (typeof value === 'string' ? value.length : JSON.stringify(value).length);
            
            // Só comprimir se estiver acima do threshold
            if (originalSize < threshold && !forceAll) {
              stats.skipped++;
              continue;
            }
            
            // Comprimir o valor
            const compressed = this._compressValue(value);
            stats.originalSize += originalSize;
            stats.compressedSize += compressed.compressedSize;
            
            // Atualizar o item com os mesmos parâmetros, mas comprimido
            const updatedItem = {
              ...compressed,
              expiry: item.expiry,
              createdAt: item.createdAt
            };
            
            // Salvar versão comprimida
            await this._saveToIndexedDB(key, updatedItem);
            
            // Atualizar em memória se existir
            if (this.memoryCache.has(key)) {
              this.memoryCache.set(key, updatedItem);
            }
            
            stats.compressed++;
            
            // Log de progresso a cada 50 itens
            if (stats.processed % 50 === 0) {
              console.log(`⏳ Progresso: ${stats.processed}/${keys.length} (${Math.round(stats.processed/keys.length*100)}%)`);
            }
          } catch (err) {
            console.error(`❌ Erro ao processar item ${key}:`, err);
            stats.errors++;
          }
        }
      } catch (error) {
        console.error('❌ Erro ao acessar IndexedDB:', error);
        stats.errors++;
      }
    }
    
    // Processar localStorage (secundário)
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('runes_cache_'));
      console.log(`📊 Encontradas ${keys.length} chaves no localStorage`);
      
      for (const storageKey of keys) {
        try {
          stats.processed++;
          
          // Extrair chave real
          const key = storageKey.replace('runes_cache_', '');
          
          // Obter o item
          const data = localStorage.getItem(storageKey);
          if (!data) continue;
          
          const item = JSON.parse(data);
          
          // Verificar se deve comprimir
          if (!forceAll && item.isCompressed) {
            stats.skipped++;
            continue;
          }
          
          // Descomprimir para recomprimir
          let value = item.isCompressed ?
            this._decompressValue(item) :
            item.data;
          
          // Calcular tamanho original
          const originalSize = item.originalSize ||
            (typeof value === 'string' ? value.length : JSON.stringify(value).length);
          
          // Só comprimir se estiver acima do threshold
          if (originalSize < threshold && !forceAll) {
            stats.skipped++;
            continue;
          }
          
          // Comprimir o valor
          const compressed = this._compressValue(value);
          stats.originalSize += originalSize;
          stats.compressedSize += compressed.compressedSize;
          
          // Atualizar o item
          const updatedItem = {
            ...compressed,
            expiry: item.expiry,
            createdAt: item.createdAt
          };
          
          // Salvar no localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedItem));
          
          // Atualizar em memória se existir
          if (this.memoryCache.has(key)) {
            this.memoryCache.set(key, updatedItem);
          }
          
          stats.compressed++;
        } catch (err) {
          console.error(`❌ Erro ao processar item do localStorage:`, err);
          stats.errors++;
        }
      }
    } catch (error) {
      console.warn('❌ Erro ao acessar localStorage:', error);
      stats.errors++;
    }
    
    // Calcular estatísticas finais
    const endTime = Date.now();
    const duration = (endTime - stats.startTime) / 1000; // em segundos
    const savings = stats.originalSize - stats.compressedSize;
    const savingsPercent = stats.originalSize > 0 ?
      (savings / stats.originalSize * 100).toFixed(2) : 0;
    
    // Resultado final
    const result = {
      ...stats,
      endTime,
      duration,
      savings,
      savingsPercent: `${savingsPercent}%`,
      originalSizeFormatted: this._formatBytes(stats.originalSize),
      compressedSizeFormatted: this._formatBytes(stats.compressedSize),
      savingsFormatted: this._formatBytes(savings)
    };
    
    console.log(`✅ Compressão em lote concluída em ${duration.toFixed(2)}s`);
    console.log(`📊 Resultado: ${result.compressed} itens comprimidos, ${result.skipped} ignorados`);
    console.log(`💾 Economia: ${result.savingsFormatted} (${result.savingsPercent})`);
    
    return result;
  }
  
  /**
   * Obtém todas as chaves do IndexedDB
   * @private
   * @returns {Promise<string[]>} - Array com todas as chaves
   */
  async _getAllKeysFromIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!this.dbReady) {
        resolve([]);
        return;
      }
      
      try {
        const keys = [];
        const transaction = this.db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            keys.push(cursor.value.key);
            cursor.continue();
          } else {
            resolve(keys);
          }
        };
        
        request.onerror = (event) => {
          console.error('Erro ao listar chaves do IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Erro ao acessar IndexedDB:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Formata bytes para exibição amigável
   * @private
   * @param {number} bytes - Número de bytes
   * @returns {string} - String formatada
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Analisa a saúde do cache e fornece diagnóstico detalhado
   * Útil para identificar problemas de desempenho e otimizações potenciais
   * @async
   * @param {Object} options - Opções de análise
   * @param {string} options.tag - Filtrar por tag específica
   * @param {number} options.expiryThreshold - Limite para itens próximos da expiração (em ms)
   * @param {number} options.largeItemThreshold - Tamanho em bytes para classificar como "grande"
   * @returns {Promise<Object>} - Relatório detalhado da saúde do cache
   */
  async analyzeCacheHealth(options = {}) {
    const {
      tag = null,  // Opcional: filtrar por tag específica
      expiryThreshold = 5 * 60 * 1000, // 5 minutos em ms
      largeItemThreshold = 50 * 1024  // 50 KB
    } = options;
    
    console.log('🔍 Iniciando diagnóstico do cache...');
    
    // Estrutura do relatório
    const report = {
      timestamp: Date.now(),
      totalItems: 0,
      uncompressedItems: 0,
      nearExpiryItems: 0,
      largeItems: 0,
      duplicateKeys: [],
      compressionRateIndexedDB: '0%',
      compressionRateMemory: '0%',
      compressionRateLocalStorage: '0%',
      byTag: {},
      itemsBySize: [],
      itemsByExpiry: [],
      detailedItems: {
        large: [],
        uncompressed: [],
        nearExpiry: []
      },
      sizeSummary: {
        totalOriginal: 0,
        totalCompressed: 0,
        totalMemory: 0,
        totalIndexedDB: 0,
        totalLocalStorage: 0
      }
    };
    
    // Coleção para identificar duplicatas
    const seenKeys = new Set();
    const seenKeysByLocation = {};
    
    // Hora atual para calcular proximidade de expiração
    const now = Date.now();
    
    // Analisar itens em memória
    let memoryOriginalSize = 0;
    let memoryCompressedSize = 0;
    
    for (const [key, item] of this.memoryCache.entries()) {
      // Verificar filtro por tag
      if (tag && (!item.tag || item.tag !== tag)) {
        continue;
      }
      
      // Adicionar à coleção de chaves vistas
      if (seenKeys.has(key)) {
        report.duplicateKeys.push(key);
      } else {
        seenKeys.add(key);
        seenKeysByLocation[key] = ['memory'];
      }
      
      // Contar item
      report.totalItems++;
      
      // Verificar tamanho
      const originalSize = item.originalSize || 0;
      const compressedSize = item.isCompressed ? item.compressedSize : originalSize;
      
      memoryOriginalSize += originalSize;
      memoryCompressedSize += compressedSize;
      report.sizeSummary.totalOriginal += originalSize;
      report.sizeSummary.totalCompressed += compressedSize;
      report.sizeSummary.totalMemory += compressedSize;
      
      // Verificar expiração
      const timeToExpiry = item.expiry - now;
      if (timeToExpiry < expiryThreshold && timeToExpiry > 0) {
        report.nearExpiryItems++;
        report.itemsByExpiry.push({
          key,
          expiresIn: Math.round(timeToExpiry / 1000), // em segundos
          location: 'memory'
        });
        
        report.detailedItems.nearExpiry.push({
          key,
          expiresIn: Math.round(timeToExpiry / 1000),
          expiryDate: new Date(item.expiry).toLocaleString(),
          location: 'memory'
        });
      }
      
      // Verificar compressão
      if (!item.isCompressed && originalSize > COMPRESS_THRESHOLD) {
        report.uncompressedItems++;
        report.detailedItems.uncompressed.push({
          key,
          size: originalSize,
          sizeFormatted: this._formatBytes(originalSize),
          location: 'memory'
        });
      }
      
      // Verificar itens grandes
      if (originalSize > largeItemThreshold) {
        report.largeItems++;
        report.itemsBySize.push({
          key,
          size: originalSize,
          compressed: item.isCompressed,
          savings: item.isCompressed ? originalSize - compressedSize : 0,
          location: 'memory'
        });
        
        report.detailedItems.large.push({
          key,
          size: originalSize,
          sizeFormatted: this._formatBytes(originalSize),
          compressedSize: compressedSize,
          compressedSizeFormatted: this._formatBytes(compressedSize),
          isCompressed: item.isCompressed,
          savingsPercent: item.isCompressed ? 
            Math.round((1 - (compressedSize / originalSize)) * 100) + '%' : '0%',
          location: 'memory'
        });
      }
      
      // Agrupar por tag se disponível
      if (item.tag) {
        if (!report.byTag[item.tag]) {
          report.byTag[item.tag] = {
            count: 0,
            totalSize: 0,
            largeItems: 0,
            nearExpiry: 0,
            uncompressed: 0
          };
        }
        
        report.byTag[item.tag].count++;
        report.byTag[item.tag].totalSize += compressedSize;
        
        if (originalSize > largeItemThreshold) {
          report.byTag[item.tag].largeItems++;
        }
        
        if (timeToExpiry < expiryThreshold && timeToExpiry > 0) {
          report.byTag[item.tag].nearExpiry++;
        }
        
        if (!item.isCompressed && originalSize > COMPRESS_THRESHOLD) {
          report.byTag[item.tag].uncompressed++;
        }
      }
    }
    
    // Calcular taxa de compressão da memória
    report.compressionRateMemory = memoryOriginalSize > 0 ? 
      Math.round((1 - (memoryCompressedSize / memoryOriginalSize)) * 100) + '%' :
      '0%';
    
    // Analisar IndexedDB (se disponível)
    if (this.dbReady) {
      try {
        const keys = await this._getAllKeysFromIndexedDB();
        let indexedDBOriginalSize = 0;
        let indexedDBCompressedSize = 0;
        
        for (const key of keys) {
          const item = await this._getFromIndexedDB(key);
          
          if (!item) continue;
          
          // Verificar filtro por tag
          if (tag && (!item.tag || item.tag !== tag)) {
            continue;
          }
          
          // Verificar duplicação
          if (seenKeys.has(key)) {
            if (!report.duplicateKeys.includes(key)) {
              report.duplicateKeys.push(key);
            }
            if (seenKeysByLocation[key]) {
              seenKeysByLocation[key].push('indexedDB');
            }
          } else {
            seenKeys.add(key);
            seenKeysByLocation[key] = ['indexedDB'];
          }
          
          // Contagem apenas se não estiver na memória
          if (!this.memoryCache.has(key)) {
            report.totalItems++;
          }
          
          // Verificar tamanho
          const originalSize = item.originalSize || 0;
          const compressedSize = item.isCompressed ? item.compressedSize : originalSize;
          
          indexedDBOriginalSize += originalSize;
          indexedDBCompressedSize += compressedSize;
          
          // Não adicionar ao total se já contabilizado na memória
          if (!this.memoryCache.has(key)) {
            report.sizeSummary.totalOriginal += originalSize;
            report.sizeSummary.totalCompressed += compressedSize;
          }
          
          report.sizeSummary.totalIndexedDB += compressedSize;
          
          // Verificar expiração
          const timeToExpiry = item.expiry - now;
          
          if (timeToExpiry < expiryThreshold && timeToExpiry > 0 && !this.memoryCache.has(key)) {
            report.nearExpiryItems++;
            report.itemsByExpiry.push({
              key,
              expiresIn: Math.round(timeToExpiry / 1000),
              location: 'indexedDB'
            });
            
            report.detailedItems.nearExpiry.push({
              key,
              expiresIn: Math.round(timeToExpiry / 1000),
              expiryDate: new Date(item.expiry).toLocaleString(),
              location: 'indexedDB'
            });
          }
          
          // Verificar compressão
          if (!item.isCompressed && originalSize > COMPRESS_THRESHOLD && !this.memoryCache.has(key)) {
            report.uncompressedItems++;
            report.detailedItems.uncompressed.push({
              key,
              size: originalSize,
              sizeFormatted: this._formatBytes(originalSize),
              location: 'indexedDB'
            });
          }
          
          // Verificar itens grandes
          if (originalSize > largeItemThreshold && !this.memoryCache.has(key)) {
            report.largeItems++;
            report.itemsBySize.push({
              key,
              size: originalSize,
              compressed: item.isCompressed,
              savings: item.isCompressed ? originalSize - compressedSize : 0,
              location: 'indexedDB'
            });
            
            report.detailedItems.large.push({
              key,
              size: originalSize,
              sizeFormatted: this._formatBytes(originalSize),
              compressedSize: compressedSize,
              compressedSizeFormatted: this._formatBytes(compressedSize),
              isCompressed: item.isCompressed,
              savingsPercent: item.isCompressed ? 
                Math.round((1 - (compressedSize / originalSize)) * 100) + '%' : '0%',
              location: 'indexedDB'
            });
          }
          
          // Agrupar por tag se disponível
          if (item.tag && !this.memoryCache.has(key)) {
            if (!report.byTag[item.tag]) {
              report.byTag[item.tag] = {
                count: 0,
                totalSize: 0,
                largeItems: 0,
                nearExpiry: 0,
                uncompressed: 0
              };
            }
            
            report.byTag[item.tag].count++;
            report.byTag[item.tag].totalSize += compressedSize;
            
            if (originalSize > largeItemThreshold) {
              report.byTag[item.tag].largeItems++;
            }
            
            if (timeToExpiry < expiryThreshold && timeToExpiry > 0) {
              report.byTag[item.tag].nearExpiry++;
            }
            
            if (!item.isCompressed && originalSize > COMPRESS_THRESHOLD) {
              report.byTag[item.tag].uncompressed++;
            }
          }
        }
        
        // Calcular taxa de compressão do IndexedDB
        report.compressionRateIndexedDB = indexedDBOriginalSize > 0 ? 
          Math.round((1 - (indexedDBCompressedSize / indexedDBOriginalSize)) * 100) + '%' :
          '0%';
          
      } catch (error) {
        console.error('❌ Erro ao analisar IndexedDB:', error);
      }
    }
    
    // Analisar localStorage
    try {
      const localStorageKeys = Object.keys(localStorage).filter(k => k.startsWith('runes_cache_'));
      let localStorageOriginalSize = 0;
      let localStorageCompressedSize = 0;
      
      for (const storageKey of localStorageKeys) {
        try {
          const data = localStorage.getItem(storageKey);
          if (!data) continue;
          
          const item = JSON.parse(data);
          const key = storageKey.replace('runes_cache_', '');
          
          // Verificar filtro por tag
          if (tag && (!item.tag || item.tag !== tag)) {
            continue;
          }
          
          // Verificar duplicação
          if (seenKeys.has(key)) {
            if (!report.duplicateKeys.includes(key)) {
              report.duplicateKeys.push(key);
            }
            if (seenKeysByLocation[key]) {
              seenKeysByLocation[key].push('localStorage');
            }
          } else {
            seenKeys.add(key);
            seenKeysByLocation[key] = ['localStorage'];
          }
          
          // Contagem apenas se não estiver em outro armazenamento
          if (!this.memoryCache.has(key) && !seenKeysByLocation[key].includes('indexedDB')) {
            report.totalItems++;
          }
          
          // Verificar tamanho
          const originalSize = item.originalSize || 0;
          const compressedSize = item.isCompressed ? item.compressedSize : originalSize;
          
          localStorageOriginalSize += originalSize;
          localStorageCompressedSize += compressedSize;
          
          // Não adicionar ao total se já contabilizado em outros lugares
          if (!this.memoryCache.has(key) && !seenKeysByLocation[key].includes('indexedDB')) {
            report.sizeSummary.totalOriginal += originalSize;
            report.sizeSummary.totalCompressed += compressedSize;
          }
          
          report.sizeSummary.totalLocalStorage += compressedSize;
          
          // Verificar expiração
          const timeToExpiry = item.expiry - now;
          
          if (timeToExpiry < expiryThreshold && timeToExpiry > 0 && 
              !this.memoryCache.has(key) && 
              !(seenKeysByLocation[key] && seenKeysByLocation[key].includes('indexedDB'))) {
            report.nearExpiryItems++;
            report.itemsByExpiry.push({
              key,
              expiresIn: Math.round(timeToExpiry / 1000),
              location: 'localStorage'
            });
            
            report.detailedItems.nearExpiry.push({
              key,
              expiresIn: Math.round(timeToExpiry / 1000),
              expiryDate: new Date(item.expiry).toLocaleString(),
              location: 'localStorage'
            });
          }
          
          // Verificar compressão
          if (!item.isCompressed && originalSize > COMPRESS_THRESHOLD && 
              !this.memoryCache.has(key) && 
              !(seenKeysByLocation[key] && seenKeysByLocation[key].includes('indexedDB'))) {
            report.uncompressedItems++;
            report.detailedItems.uncompressed.push({
              key,
              size: originalSize,
              sizeFormatted: this._formatBytes(originalSize),
              location: 'localStorage'
            });
          }
          
          // Verificar itens grandes
          if (originalSize > largeItemThreshold && 
              !this.memoryCache.has(key) && 
              !(seenKeysByLocation[key] && seenKeysByLocation[key].includes('indexedDB'))) {
            report.largeItems++;
            report.itemsBySize.push({
              key,
              size: originalSize,
              compressed: item.isCompressed,
              savings: item.isCompressed ? originalSize - compressedSize : 0,
              location: 'localStorage'
            });
            
            report.detailedItems.large.push({
              key,
              size: originalSize,
              sizeFormatted: this._formatBytes(originalSize),
              compressedSize: compressedSize,
              compressedSizeFormatted: this._formatBytes(compressedSize),
              isCompressed: item.isCompressed,
              savingsPercent: item.isCompressed ? 
                Math.round((1 - (compressedSize / originalSize)) * 100) + '%' : '0%',
              location: 'localStorage'
            });
          }
          
          // Agrupar por tag se disponível
          if (item.tag && 
              !this.memoryCache.has(key) && 
              !(seenKeysByLocation[key] && seenKeysByLocation[key].includes('indexedDB'))) {
            if (!report.byTag[item.tag]) {
              report.byTag[item.tag] = {
                count: 0,
                totalSize: 0,
                largeItems: 0,
                nearExpiry: 0,
                uncompressed: 0
              };
            }
            
            report.byTag[item.tag].count++;
            report.byTag[item.tag].totalSize += compressedSize;
            
            if (originalSize > largeItemThreshold) {
              report.byTag[item.tag].largeItems++;
            }
            
            if (timeToExpiry < expiryThreshold && timeToExpiry > 0) {
              report.byTag[item.tag].nearExpiry++;
            }
            
            if (!item.isCompressed && originalSize > COMPRESS_THRESHOLD) {
              report.byTag[item.tag].uncompressed++;
            }
          }
        } catch (err) {
          console.warn(`Erro ao analisar item do localStorage ${storageKey}:`, err);
        }
      }
      
      // Calcular taxa de compressão do localStorage
      report.compressionRateLocalStorage = localStorageOriginalSize > 0 ? 
        Math.round((1 - (localStorageCompressedSize / localStorageOriginalSize)) * 100) + '%' :
        '0%';
        
    } catch (error) {
      console.error('❌ Erro ao analisar localStorage:', error);
    }
    
    // Ordenar listas para melhor apresentação
    report.itemsBySize.sort((a, b) => b.size - a.size);
    report.itemsByExpiry.sort((a, b) => a.expiresIn - b.expiresIn);
    report.detailedItems.large.sort((a, b) => b.size - a.size);
    report.detailedItems.nearExpiry.sort((a, b) => a.expiresIn - b.expiresIn);
    
    // Adicionar detalhes formatados à saída
    report.summary = {
      totalSizeOriginal: this._formatBytes(report.sizeSummary.totalOriginal),
      totalSizeCompressed: this._formatBytes(report.sizeSummary.totalCompressed),
      memorySize: this._formatBytes(report.sizeSummary.totalMemory),
      indexedDBSize: this._formatBytes(report.sizeSummary.totalIndexedDB),
      localStorageSize: this._formatBytes(report.sizeSummary.totalLocalStorage),
      overallSavings: report.sizeSummary.totalOriginal > 0 ?
        Math.round((1 - (report.sizeSummary.totalCompressed / report.sizeSummary.totalOriginal)) * 100) + '%' :
        '0%'
    };
    
    // Criar recomendações baseadas na análise
    report.recommendations = [];
    
    if (report.uncompressedItems > 5) {
      report.recommendations.push({
        type: 'warning',
        message: `${report.uncompressedItems} itens não comprimidos podem ser otimizados.`,
        action: 'compressAll'
      });
    }
    
    if (report.largeItems > 5) {
      report.recommendations.push({
        type: 'warning',
        message: `${report.largeItems} itens grandes estão consumindo espaço significativo.`,
        action: 'reviewLargeItems'
      });
    }
    
    if (report.nearExpiryItems > 10) {
      report.recommendations.push({
        type: 'info',
        message: `${report.nearExpiryItems} itens estão próximos da expiração.`,
        action: 'none'
      });
    }
    
    if (report.duplicateKeys.length > 0) {
      report.recommendations.push({
        type: 'error',
        message: `${report.duplicateKeys.length} chaves duplicadas podem causar inconsistências.`,
        action: 'reviewDuplicates'
      });
    }
    
    // Atualizar última análise
    this.lastHealthAnalysis = {
      timestamp: report.timestamp,
      summary: report.summary,
    };
    
    console.log('✅ Diagnóstico do cache concluído');
    
    return report;
  }
}

// Exportar instância como singleton para uso em outros módulos
const advancedCache = new AdvancedCacheService();
export { advancedCache };
export default advancedCache; 
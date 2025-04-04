/**
 * IndexedDB Cache Manager
 * Gerencia o armazenamento persistente de dados em IndexedDB
 */
class IndexedDBCache {
    constructor(dbName = 'runesExplorerCache', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.ready = false;
        this.pendingOperations = [];
        
        // Configurações padrão
        this.config = {
            tokenStore: 'tokens',
            metaStore: 'metadata',
            defaultTTL: 5 * 60 * 1000, // 5 minutos em milissegundos
            maxCacheSize: 100 // máximo de itens no cache
        };
        
        // Inicializar o banco de dados
        this.init();
    }
    
    /**
     * Inicializa a conexão com o IndexedDB
     * @returns {Promise} Promessa que resolve quando o banco estiver pronto
     */
    init() {
        return new Promise((resolve, reject) => {
            console.log('📂 Iniciando IndexedDB...');
            
            if (!window.indexedDB) {
                console.warn('IndexedDB não suportado neste navegador. Utilizando fallback de cache em memória.');
                this.ready = false;
                reject(new Error('IndexedDB não suportado'));
                return;
            }
            
            const request = window.indexedDB.open(this.dbName, this.version);
            
            request.onerror = (event) => {
                console.error('Erro ao abrir IndexedDB:', event.target.error);
                this.ready = false;
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.ready = true;
                console.log('✅ IndexedDB conectado com sucesso!');
                
                // Processar operações pendentes
                this.processPendingOperations();
                
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar store para tokens
                if (!db.objectStoreNames.contains(this.config.tokenStore)) {
                    const tokenStore = db.createObjectStore(this.config.tokenStore, { keyPath: 'key' });
                    tokenStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log(`Store '${this.config.tokenStore}' criado.`);
                }
                
                // Criar store para metadados
                if (!db.objectStoreNames.contains(this.config.metaStore)) {
                    const metaStore = db.createObjectStore(this.config.metaStore, { keyPath: 'key' });
                    console.log(`Store '${this.config.metaStore}' criado.`);
                }
                
                // Aqui você pode adicionar mais stores conforme necessário
            };
        }).catch(error => {
            console.error('Erro ao inicializar IndexedDB:', error);
            return Promise.reject(error);
        });
    }
    
    /**
     * Processa operações pendentes quando o banco estiver pronto
     */
    processPendingOperations() {
        if (this.pendingOperations.length > 0) {
            console.log(`Processando ${this.pendingOperations.length} operações pendentes...`);
            
            this.pendingOperations.forEach(op => {
                if (op.type === 'set') {
                    this.set(op.key, op.data, op.ttl).then(op.resolve).catch(op.reject);
                } else if (op.type === 'get') {
                    this.get(op.key).then(op.resolve).catch(op.reject);
                } else if (op.type === 'delete') {
                    this.delete(op.key).then(op.resolve).catch(op.reject);
                }
            });
            
            this.pendingOperations = [];
        }
    }
    
    /**
     * Verifica se o cache está pronto para uso
     * @returns {boolean} True se o cache estiver pronto
     */
    isReady() {
        return this.ready && this.db !== null;
    }
    
    /**
     * Obtém um item do cache
     * @param {string} key - Chave do item
     * @returns {Promise<any>} Valor do item ou null se não existir ou expirado
     */
    get(key) {
        if (!this.isReady()) {
            return new Promise((resolve, reject) => {
                this.pendingOperations.push({
                    type: 'get', key, resolve, reject
                });
            });
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.config.tokenStore], 'readonly');
            const store = transaction.objectStore(this.config.tokenStore);
            const request = store.get(key);
            
            request.onsuccess = (event) => {
                const result = event.target.result;
                
                if (!result) {
                    resolve(null);
                    return;
                }
                
                // Verificar se o item expirou
                const now = Date.now();
                if (result.expiry && result.expiry < now) {
                    console.log(`🕒 Cache expirado para: ${key}`);
                    
                    // Remover item expirado em uma nova transação
                    this.delete(key).catch(e => console.warn('Erro ao remover item expirado:', e));
                    
                    resolve(null);
                    return;
                }
                
                console.log(`🔄 Usando cache do IndexedDB para: ${key}`);
                resolve(result.data);
            };
            
            request.onerror = (event) => {
                console.error('Erro ao buscar do cache:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Armazena um item no cache
     * @param {string} key - Chave do item
     * @param {any} data - Dados a serem armazenados
     * @param {number} ttl - Tempo de vida em milissegundos (opcional)
     * @returns {Promise<void>}
     */
    set(key, data, ttl = this.config.defaultTTL) {
        if (!this.isReady()) {
            return new Promise((resolve, reject) => {
                this.pendingOperations.push({
                    type: 'set', key, data, ttl, resolve, reject
                });
            });
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.config.tokenStore], 'readwrite');
            const store = transaction.objectStore(this.config.tokenStore);
            
            const now = Date.now();
            const expiry = ttl ? now + ttl : null;
            
            const item = {
                key,
                data: JSON.parse(JSON.stringify(data)), // Deep clone para evitar problemas de referência
                timestamp: now,
                expiry
            };
            
            const request = store.put(item);
            
            request.onsuccess = () => {
                console.log(`📝 Dados armazenados no IndexedDB: ${key}`);
                
                // Verificar tamanho do cache e limpar se necessário
                this.checkCacheSize();
                
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Erro ao armazenar no cache:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Remove um item do cache
     * @param {string} key - Chave do item a ser removido
     * @returns {Promise<void>}
     */
    delete(key) {
        if (!this.isReady()) {
            return new Promise((resolve, reject) => {
                this.pendingOperations.push({
                    type: 'delete', key, resolve, reject
                });
            });
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.config.tokenStore], 'readwrite');
            const store = transaction.objectStore(this.config.tokenStore);
            const request = store.delete(key);
            
            request.onsuccess = () => {
                console.log(`🧹 Item removido do cache: ${key}`);
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Erro ao remover item do cache:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Limpa todo o cache ou apenas os itens expirados
     * @param {boolean} onlyExpired - Se true, remove apenas itens expirados
     * @returns {Promise<void>}
     */
    clear(onlyExpired = false) {
        if (!this.isReady()) {
            return Promise.reject(new Error('Cache não está pronto'));
        }
        
        return new Promise((resolve, reject) => {
            if (onlyExpired) {
                // Remover apenas itens expirados
                const transaction = this.db.transaction([this.config.tokenStore], 'readwrite');
                const store = transaction.objectStore(this.config.tokenStore);
                const index = store.index('timestamp');
                const now = Date.now();
                
                // UsandocursorOpenKeyCursor() for performance (não carrega os valores)
                const request = index.openCursor();
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const item = cursor.value;
                        if (item.expiry && item.expiry < now) {
                            // Item expirado, remover
                            store.delete(cursor.primaryKey);
                        }
                        cursor.continue();
                    } else {
                        console.log('🧹 Cache limpo (itens expirados)');
                        resolve();
                    }
                };
                
                request.onerror = (event) => {
                    console.error('Erro ao limpar cache:', event.target.error);
                    reject(event.target.error);
                };
            } else {
                // Limpar todo o store
                const transaction = this.db.transaction([this.config.tokenStore], 'readwrite');
                const store = transaction.objectStore(this.config.tokenStore);
                const request = store.clear();
                
                request.onsuccess = () => {
                    console.log('🧹 Cache completamente limpo');
                    resolve();
                };
                
                request.onerror = (event) => {
                    console.error('Erro ao limpar cache:', event.target.error);
                    reject(event.target.error);
                };
            }
        });
    }
    
    /**
     * Verifica e limita o tamanho do cache
     * Remove os itens mais antigos quando excede o tamanho máximo
     */
    checkCacheSize() {
        if (!this.isReady()) return;
        
        const transaction = this.db.transaction([this.config.tokenStore], 'readonly');
        const store = transaction.objectStore(this.config.tokenStore);
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
            const count = countRequest.result;
            
            if (count > this.config.maxCacheSize) {
                console.log(`Cache excedeu o tamanho máximo (${count}/${this.config.maxCacheSize}). Removendo itens antigos...`);
                
                // Obter itens ordenados por timestamp (mais antigos primeiro)
                const cleanTransaction = this.db.transaction([this.config.tokenStore], 'readwrite');
                const cleanStore = cleanTransaction.objectStore(this.config.tokenStore);
                const index = cleanStore.index('timestamp');
                
                // Número de itens a remover
                const removeCount = count - this.config.maxCacheSize;
                let removedCount = 0;
                
                const cursorRequest = index.openCursor();
                
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    
                    if (cursor && removedCount < removeCount) {
                        // Remover item mais antigo
                        cleanStore.delete(cursor.primaryKey);
                        removedCount++;
                        cursor.continue();
                    } else if (removedCount > 0) {
                        console.log(`🧹 Removidos ${removedCount} itens antigos do cache`);
                    }
                };
            }
        };
    }
    
    /**
     * Obtém estatísticas do cache
     * @returns {Promise<Object>} Estatísticas do cache
     */
    getStats() {
        if (!this.isReady()) {
            return Promise.reject(new Error('Cache não está pronto'));
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.config.tokenStore], 'readonly');
            const store = transaction.objectStore(this.config.tokenStore);
            const countRequest = store.count();
            
            countRequest.onsuccess = () => {
                const stats = {
                    totalItems: countRequest.result,
                    storeName: this.config.tokenStore,
                    dbName: this.dbName,
                    maxSize: this.config.maxCacheSize
                };
                
                // Calcular tamanho aproximado (bytes)
                const sizeRequest = store.openCursor();
                let size = 0;
                let expiredCount = 0;
                const now = Date.now();
                
                sizeRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    
                    if (cursor) {
                        // Calcular tamanho aproximado deste item
                        const item = cursor.value;
                        const itemSize = JSON.stringify(item).length;
                        size += itemSize;
                        
                        // Contar itens expirados
                        if (item.expiry && item.expiry < now) {
                            expiredCount++;
                        }
                        
                        cursor.continue();
                    } else {
                        stats.sizeBytes = size;
                        stats.sizeKB = Math.round(size / 1024);
                        stats.expiredItems = expiredCount;
                        
                        resolve(stats);
                    }
                };
                
                sizeRequest.onerror = (event) => {
                    console.error('Erro ao calcular estatísticas:', event.target.error);
                    reject(event.target.error);
                };
            };
            
            countRequest.onerror = (event) => {
                console.error('Erro ao contar itens do cache:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}

// Criar instância global
window.dbCache = new IndexedDBCache(); 
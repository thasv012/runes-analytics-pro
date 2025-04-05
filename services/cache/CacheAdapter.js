/**
 * Adaptador para o AdvancedCacheService que mantém compatibilidade
 * com a API do CacheService original
 */

// Substituição do require por importação compatível com navegador
import { advancedCache } from './AdvancedCacheService.js';

class CacheAdapter {
  /**
   * Obtém um valor do cache
   * @param {string} key - Chave do item
   * @returns {*} - Valor armazenado ou undefined se não existir
   */
  get(key) {
    // Retornar uma promessa resolvida para manter compatibilidade com código síncrono
    const value = advancedCache.memoryCache.has(key) ? 
      advancedCache._decompressValue(advancedCache.memoryCache.get(key)) : 
      undefined;

    return value;
  }

  /**
   * Armazena um valor no cache
   * @param {string} key - Chave do item
   * @param {*} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em segundos (opcional)
   * @returns {boolean} - Sucesso da operação
   */
  set(key, value, ttl = null) {
    // Iniciar operação assíncrona mas retornar imediatamente para compatibilidade
    advancedCache.set(key, value, ttl)
      .catch(err => console.error('Erro ao armazenar em cache:', err));
    
    // Sempre retornar true para compatibilidade
    return true;
  }

  /**
   * Verifica se uma chave existe no cache
   * @param {string} key - Chave a verificar
   * @returns {boolean} - Verdadeiro se a chave existir
   */
  has(key) {
    // Verificar apenas na memória para compatibilidade com código síncrono
    const now = Date.now();
    
    if (advancedCache.memoryCache.has(key)) {
      const item = advancedCache.memoryCache.get(key);
      return item.expiry > now;
    }
    
    return false;
  }

  /**
   * Remove um item do cache
   * @param {string} key - Chave do item a remover
   * @returns {boolean} - Verdadeiro se o item foi removido
   */
  del(key) {
    // Iniciar operação assíncrona para todos os caches
    advancedCache.del(key)
      .catch(err => console.error('Erro ao remover do cache:', err));
    
    // Mas remover sincronamente da memória para compatibilidade
    if (advancedCache.memoryCache.has(key)) {
      advancedCache.memoryCache.delete(key);
      const index = advancedCache.accessOrder.indexOf(key);
      if (index > -1) {
        advancedCache.accessOrder.splice(index, 1);
      }
      return true;
    }
    
    return false;
  }

  /**
   * Limpa o cache
   * @returns {boolean} - Sempre retorna true
   */
  flush() {
    // Iniciar operação assíncrona para todos os caches
    advancedCache.flush()
      .catch(err => console.error('Erro ao limpar cache:', err));
    
    // Mas limpar sincronamente a memória para compatibilidade
    advancedCache.memoryCache.clear();
    advancedCache.accessOrder = [];
    
    return true;
  }

  /**
   * Obtém estatísticas do cache
   * @returns {Object} - Estatísticas do cache
   */
  getStats() {
    return advancedCache.getStats();
  }
}

// Exportar uma instância singleton para manter compatibilidade com o padrão anterior
const cacheAdapter = new CacheAdapter();
export default cacheAdapter; 
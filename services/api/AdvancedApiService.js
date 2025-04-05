/**
 * Serviço base de API com suporte ao cache avançado
 * Estende o BaseApiService com recursos aprimorados de cache e compressão
 */

import BaseApiService from './BaseApiService.js';
import { advancedCache } from '../cache/AdvancedCacheService.js';

class AdvancedApiService extends BaseApiService {
  constructor(baseURL, config = {}) {
    super(baseURL, config);
    
    // Configurações adicionais
    this.useFallbackCache = config.useFallbackCache !== false;
    this.compressResponses = config.compressResponses !== false;
    this.defaultTTL = config.defaultTTL || 300; // 5 minutos em segundos
    
    console.log(`🚀 AdvancedApiService inicializado para ${baseURL}`);
  }

  /**
   * Executa uma requisição GET com cache avançado
   * @param {string} url - URL relativa para a requisição
   * @param {Object} params - Parâmetros da requisição
   * @param {Object} options - Opções de cache
   * @returns {Promise<Object>} - Dados da resposta
   */
  async fetchWithAdvancedCache(url, params = {}, options = {}) {
    const {
      cacheKey = null,
      ttl = this.defaultTTL,
      forceFresh = false,
      tag = null // Para invalidação por tag
    } = options;
    
    // Gerar chave de cache se não for fornecida
    const key = cacheKey || `${url}${JSON.stringify(params)}`;
    const cacheKeyWithTag = tag ? `${key}:${tag}` : key;
    
    // Se não forçar atualização, tentar obter do cache
    if (!forceFresh) {
      try {
        const cachedData = await advancedCache.get(cacheKeyWithTag);
        if (cachedData) {
          console.log(`[CACHE] Usando dados em cache para: ${cacheKeyWithTag}`);
          return cachedData;
        }
      } catch (err) {
        console.warn(`[CACHE] Erro ao ler do cache: ${err.message}`);
      }
    }
    
    // Função para buscar dados da fonte
    const fetchData = async () => {
      try {
        console.log(`[API] Buscando dados de: ${url}`);
        const response = await this.client.get(url, { params });
        
        // Armazenar no cache avançado
        await advancedCache.set(cacheKeyWithTag, response.data, ttl);
        
        return response.data;
      } catch (error) {
        console.error(`[API ERROR] ${error.message} ao buscar ${url}`);
        
        // Se falhar e temos fallback habilitado, tentar obter versão mais antiga do cache
        if (this.useFallbackCache) {
          const staleData = await advancedCache.get(cacheKeyWithTag);
          if (staleData) {
            console.warn(`[CACHE] Usando dados potencialmente desatualizados para: ${cacheKeyWithTag}`);
            return staleData;
          }
        }
        
        throw error;
      }
    };
    
    // Usar getOrFetch para simplificar a lógica
    return advancedCache.getOrFetch(cacheKeyWithTag, fetchData, ttl);
  }

  /**
   * Invalida o cache para uma determinada tag
   * @param {string} tag - Tag para invalidar
   * @returns {Promise<void>}
   */
  async invalidateByTag(tag) {
    // Função para verificar se uma chave pertence à tag
    const belongsToTag = (key) => key.endsWith(`:${tag}`);
    
    // Obter todas as chaves do cache em memória
    const memoryKeys = Array.from(advancedCache.memoryCache.keys());
    
    // Encontrar e excluir todos os itens com a tag
    const keysToDelete = memoryKeys.filter(belongsToTag);
    
    // Remover itens encontrados
    const deletePromises = keysToDelete.map(key => advancedCache.del(key));
    await Promise.all(deletePromises);
    
    console.log(`[CACHE] Invalidados ${keysToDelete.length} itens com tag: ${tag}`);
  }

  /**
   * Pré-carrega dados no cache para uso futuro
   * @param {string} url - URL relativa para a requisição
   * @param {Object} params - Parâmetros da requisição
   * @param {Object} options - Opções de cache
   * @returns {Promise<void>}
   */
  async preloadCache(url, params = {}, options = {}) {
    const {
      cacheKey = null,
      ttl = this.defaultTTL,
      tag = null,
      priority = 'normal', // 'high', 'normal', 'low'
    } = options;
    
    console.log(`[CACHE] Pré-carregando dados de: ${url}`);
    
    // Criar uma promessa para o carregamento
    const loadPromise = this.fetchWithAdvancedCache(url, params, {
      cacheKey,
      ttl,
      tag,
      forceFresh: true,
    });
    
    // Executar com prioridade adequada
    if (priority === 'high') {
      // Executar imediatamente
      await loadPromise;
    } else if (priority === 'normal') {
      // Executar sem bloquear
      loadPromise.catch(err => 
        console.error(`[CACHE] Erro no pré-carregamento normal: ${err.message}`)
      );
    } else {
      // Para prioridade baixa, executar quando o navegador estiver ocioso
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          loadPromise.catch(err => 
            console.error(`[CACHE] Erro no pré-carregamento de baixa prioridade: ${err.message}`)
          );
        });
      } else {
        // Fallback para setTimeout
        setTimeout(() => {
          loadPromise.catch(err => 
            console.error(`[CACHE] Erro no pré-carregamento de baixa prioridade: ${err.message}`)
          );
        }, 500);
      }
    }
  }

  /**
   * Executa uma requisição POST com tratamento de erro aprimorado
   * @param {string} url - URL relativa para a requisição
   * @param {Object} data - Dados a serem enviados
   * @param {Object} config - Configurações para a requisição
   * @returns {Promise<Object>} - Dados da resposta
   */
  async post(url, data, config = {}) {
    try {
      // Indicar que é uma operação de escrita através de logs
      console.log(`[API] Enviando POST para: ${url}`);
      
      const response = await this.client.post(url, data, config);
      
      // Se a operação for bem-sucedida e houver uma tag especificada,
      // invalidar o cache para essa tag
      if (config.invalidateTag) {
        await this.invalidateByTag(config.invalidateTag);
      }
      
      return response.data;
    } catch (error) {
      console.error(`[API ERROR] ${error.message} ao enviar POST para ${url}`);
      
      // Melhorar mensagem de erro para o usuário
      const userFriendlyError = new Error(
        error.response?.data?.message || 
        'Não foi possível completar a operação. Por favor, tente novamente.'
      );
      
      // Anexar detalhes originais para depuração
      userFriendlyError.originalError = error;
      userFriendlyError.status = error.response?.status;
      
      throw userFriendlyError;
    }
  }

  /**
   * Obtém a saúde do serviço de API
   * @returns {Promise<Object>} - Status da API
   */
  async getHealth() {
    try {
      // Usar uma rota padrão para verificação de saúde
      const response = await this.client.get('/health', {
        timeout: 3000, // Timeout mais curto para verificação de saúde
      });
      
      return {
        status: 'online',
        latency: response.headers['x-response-time'] || 'N/A',
        message: response.data?.message || 'API disponível'
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message,
        message: 'API indisponível'
      };
    }
  }
}

export default AdvancedApiService; 
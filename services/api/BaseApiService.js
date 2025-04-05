/**
 * Serviço base para comunicação com APIs
 * Fornece funcionalidades comuns como timeout, retry e autenticação
 */

class BaseApiService {
  constructor(baseURL, config = {}) {
    // Configurar cliente HTTP
    this.baseURL = baseURL;
    this.config = {
      headers: config.headers || {},
      timeout: config.timeout || 10000,
      retries: config.retries || 1,
      retryDelay: config.retryDelay || 1000
    };
    
    // Inicializar cliente
    this.initClient();
  }
  
  /**
   * Inicializa o cliente HTTP
   */
  initClient() {
    // Configuração do cliente Axios ou fetch
    this.client = {
      // Método GET
      get: async (url, options = {}) => {
        return this.executeRequest('GET', url, null, options);
      },
      
      // Método POST
      post: async (url, data, options = {}) => {
        return this.executeRequest('POST', url, data, options);
      },
      
      // Método PUT
      put: async (url, data, options = {}) => {
        return this.executeRequest('PUT', url, data, options);
      },
      
      // Método DELETE
      delete: async (url, options = {}) => {
        return this.executeRequest('DELETE', url, null, options);
      }
    };
  }
  
  /**
   * Executa uma requisição HTTP com suporte a retry
   * @param {string} method - Método HTTP (GET, POST, etc)
   * @param {string} url - Caminho da requisição
   * @param {Object} data - Dados para métodos POST/PUT
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Resposta processada
   * @private
   */
  async executeRequest(method, url, data, options = {}) {
    const { params, headers = {}, timeout = this.config.timeout } = options;
    
    // Construir URL completa
    const fullUrl = `${this.baseURL}${url.startsWith('/') ? url : `/${url}`}`;
    
    // Construir query string para métodos GET/DELETE
    let queryString = '';
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      }
      queryString = `?${searchParams.toString()}`;
    }
    
    // URL final com query string
    const requestUrl = `${fullUrl}${method === 'GET' || method === 'DELETE' ? queryString : ''}`;
    
    // Configuração da requisição
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...headers
      },
      timeout
    };
    
    // Adicionar body para métodos POST/PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }
    
    // Iniciar tentativas
    let attempts = 0;
    let lastError = null;
    
    while (attempts <= this.config.retries) {
      try {
        // Executar fetch
        const fetchResponse = await this.fetchWithTimeout(requestUrl, requestOptions);
        
        // Verificar status da resposta
        if (!fetchResponse.ok) {
          throw new Error(`HTTP error ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        // Processar resposta como JSON
        const responseData = await fetchResponse.json();
        
        // Formatar resposta no formato do Axios para compatibilidade
        return {
          data: responseData,
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          headers: Object.fromEntries(fetchResponse.headers.entries()),
          config: { url, method, data, params }
        };
      } catch (error) {
        lastError = error;
        attempts++;
        
        // Se ainda tivermos tentativas, aguardar e tentar novamente
        if (attempts <= this.config.retries) {
          await this.delay(this.config.retryDelay * attempts);
          console.warn(`Tentativa ${attempts} para ${method} ${url}`);
        }
      }
    }
    
    // Se chegamos aqui, todas as tentativas falharam
    throw lastError;
  }
  
  /**
   * Implementação de fetch com timeout
   * @param {string} url - URL para requisição
   * @param {Object} options - Opções do fetch
   * @returns {Promise<Response>} - Resposta do fetch
   * @private
   */
  async fetchWithTimeout(url, options = {}) {
    const { timeout = this.config.timeout } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
  
  /**
   * Utilitário para criar um atraso (para retry)
   * @param {number} ms - Milissegundos para aguardar
   * @returns {Promise<void>}
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default BaseApiService;
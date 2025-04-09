/**
 * RUNES Analytics Pro - Cliente WebSocket
 * Permite comunicação em tempo real com o servidor WebSocket
 */

class RunesWebSocketClient {
  /**
   * Inicializa o cliente WebSocket
   * @param {Object} options - Opções de configuração
   * @param {string} options.url - URL do servidor WebSocket (padrão: ws://localhost:9999)
   * @param {string} options.clientType - Tipo de cliente (ui, agent, visualizer, etc.)
   * @param {string} options.clientName - Nome amigável para o cliente
   * @param {Function} options.onMessage - Callback para mensagens recebidas
   * @param {Function} options.onConnect - Callback para evento de conexão
   * @param {Function} options.onDisconnect - Callback para evento de desconexão
   * @param {Function} options.onError - Callback para eventos de erro
   * @param {boolean} options.autoReconnect - Se deve reconectar automaticamente (padrão: true)
   * @param {number} options.reconnectInterval - Intervalo de reconexão em ms (padrão: 3000)
   * @param {number} options.maxReconnectAttempts - Número máximo de tentativas (padrão: 10)
   */
  constructor(options = {}) {
    this.options = {
      url: options.url || 'ws://localhost:9999',
      clientType: options.clientType || 'ui',
      clientName: options.clientName || `runes-client-${Date.now()}`,
      onMessage: options.onMessage || this.defaultMessageHandler,
      onConnect: options.onConnect || (() => {}),
      onDisconnect: options.onDisconnect || (() => {}),
      onError: options.onError || ((error) => console.error(error)),
      autoReconnect: options.autoReconnect !== undefined ? options.autoReconnect : true,
      reconnectInterval: options.reconnectInterval || 3000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10
    };
    
    // Estado do cliente
    this.connection = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.clientId = null;
    this.messageQueue = [];
    this.eventListeners = new Map();
    
    // Inicializa a conexão se não for cancelada
    if (!options.manualConnect) {
      this.connect();
    }
  }
  
  /**
   * Conecta ao servidor WebSocket
   * @returns {Promise} Promessa resolvida quando conectado
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Constrói a URL com parâmetros de query
        const url = new URL(this.options.url);
        url.searchParams.append('type', this.options.clientType);
        url.searchParams.append('name', this.options.clientName);
        
        // Cria a conexão WebSocket
        this.connection = new WebSocket(url.toString());
        
        // Configura event listeners
        this.connection.onopen = (event) => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log(`🔌 Conectado ao servidor WebSocket: ${this.options.url}`);
          
          // Envia mensagens em fila
          this.flushMessageQueue();
          
          // Notifica conexão
          this.options.onConnect(event);
          this.emitEvent('connect', event);
          
          resolve(event);
        };
        
        this.connection.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Captura o ID do cliente na primeira mensagem
            if (message.type === 'connection' && message.clientId && !this.clientId) {
              this.clientId = message.clientId;
              console.log(`🔑 ID do cliente: ${this.clientId}`);
            }
            
            // Processa a mensagem
            this.options.onMessage(message);
            
            // Emite evento com base no tipo da mensagem
            if (message.type) {
              this.emitEvent(message.type, message);
            }
            
            // Emite evento genérico para qualquer mensagem
            this.emitEvent('message', message);
          } catch (error) {
            console.error('Erro ao processar mensagem recebida:', error);
            this.options.onError(error);
          }
        };
        
        this.connection.onclose = (event) => {
          this.connected = false;
          console.log(`📴 Desconectado do servidor WebSocket (Código: ${event.code})`);
          
          // Notifica desconexão
          this.options.onDisconnect(event);
          this.emitEvent('disconnect', event);
          
          // Tenta reconectar se configurado
          if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentando reconectar (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.options.reconnectInterval);
          } else if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            console.error('🛑 Número máximo de tentativas de reconexão atingido.');
          }
          
          if (event.code !== 1000) {
            reject(new Error(`WebSocket desconectado com código: ${event.code}`));
          } else {
            resolve(event);
          }
        };
        
        this.connection.onerror = (error) => {
          console.error('❌ Erro na conexão WebSocket:', error);
          this.options.onError(error);
          this.emitEvent('error', error);
          reject(error);
        };
        
      } catch (error) {
        console.error('❌ Erro ao inicializar conexão WebSocket:', error);
        this.options.onError(error);
        this.emitEvent('error', error);
        reject(error);
        
        // Tenta reconectar se configurado
        if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.options.reconnectInterval);
        }
      }
    });
  }
  
  /**
   * Desconecta do servidor WebSocket
   */
  disconnect() {
    if (this.connection && this.connected) {
      this.connection.close(1000, 'Cliente desconectado manualmente');
    }
  }
  
  /**
   * Envia uma mensagem para o servidor
   * @param {string} type - Tipo da mensagem
   * @param {Object} data - Dados da mensagem
   * @param {string|string[]} target - Destinatário(s) da mensagem (opcional)
   * @returns {boolean} - Sucesso do envio
   */
  send(type, data = {}, target = null) {
    const message = {
      type,
      ...data,
      timestamp: new Date().toISOString()
    };
    
    if (target) {
      message.target = target;
    }
    
    return this.sendRaw(message);
  }
  
  /**
   * Envia uma mensagem bruta para o servidor
   * @param {Object} message - Mensagem a ser enviada
   * @returns {boolean} - Sucesso do envio
   */
  sendRaw(message) {
    // Se não estiver conectado, adiciona à fila
    if (!this.connected || !this.connection) {
      this.messageQueue.push(message);
      return false;
    }
    
    try {
      this.connection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      this.options.onError(error);
      return false;
    }
  }
  
  /**
   * Envia as mensagens em fila quando a conexão for estabelecida
   * @private
   */
  flushMessageQueue() {
    if (this.messageQueue.length > 0) {
      console.log(`📤 Enviando ${this.messageQueue.length} mensagens em fila...`);
      
      this.messageQueue.forEach(message => {
        this.sendRaw(message);
      });
      
      this.messageQueue = [];
    }
  }
  
  /**
   * Manipulador padrão de mensagens
   * @param {Object} message - Mensagem recebida
   * @private
   */
  defaultMessageHandler(message) {
    // Por padrão, apenas imprime a mensagem no console
    console.log('📩 Mensagem recebida:', message);
  }
  
  /**
   * Adiciona um listener para um evento específico
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função callback
   * @returns {Function} - Função para remover o listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event).add(callback);
    
    // Retorna uma função para remover o listener
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }
  
  /**
   * Emite um evento para todos os listeners registrados
   * @param {string} event - Nome do evento
   * @param {any} data - Dados do evento
   * @private
   */
  emitEvent(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erro ao executar callback para evento '${event}':`, error);
        }
      });
    }
  }
  
  /**
   * Verifica se está conectado ao servidor
   * @returns {boolean} - Status da conexão
   */
  isConnected() {
    return this.connected;
  }
  
  /**
   * Obtém o ID do cliente
   * @returns {string|null} - ID do cliente ou null se não estiver conectado
   */
  getClientId() {
    return this.clientId;
  }
}

// Exporta para uso em navegadores
if (typeof window !== 'undefined') {
  window.RunesWebSocketClient = RunesWebSocketClient;
}

// Exporta para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RunesWebSocketClient;
} 
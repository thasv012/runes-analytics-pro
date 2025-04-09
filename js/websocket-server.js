/**
 * RUNES Analytics Pro - Servidor WebSocket
 * Implementa um servidor WebSocket para comunicação em tempo real entre os componentes
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const url = require('url');

class RunesWebSocketServer {
  /**
   * Inicializa o servidor WebSocket
   * @param {Object} options - Opções de configuração
   * @param {number} options.port - Porta do servidor (padrão: 9999)
   * @param {boolean} options.secure - Se deve usar conexão segura (WSS)
   * @param {Object} options.ssl - Opções SSL para conexão segura
   * @param {boolean} options.debug - Ativa modo de depuração com mais logs
   * @param {Function} options.authenticateClient - Função para autenticar clientes (opcional)
   * @param {Function} options.onConnection - Callback para novas conexões
   * @param {Function} options.onDisconnection - Callback para desconexões
   * @param {Function} options.onMessage - Callback para mensagens recebidas
   * @param {Function} options.onError - Callback para erros
   */
  constructor(options = {}) {
    this.options = {
      port: options.port || 9999,
      secure: options.secure || false,
      ssl: options.ssl || null,
      debug: options.debug || false,
      authenticateClient: options.authenticateClient || null,
      onConnection: options.onConnection || null,
      onDisconnection: options.onDisconnection || null,
      onMessage: options.onMessage || null,
      onError: options.onError || null
    };
    
    // Estado do servidor
    this.wss = null;
    this.httpServer = null;
    this.clients = new Map();  // clientId -> { ws, info }
    this.groups = new Map();   // groupName -> Set of clientIds
    this.channels = new Map(); // channelName -> Set of clientIds
    this.stats = {
      totalConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      startTime: null
    };
    
    // Vincula métodos ao contexto correto
    this.handleConnection = this.handleConnection.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    
    // Inicializa o servidor imediatamente, a menos que manualInit seja true
    if (!options.manualInit) {
      this.start();
    }
  }
  
  /**
   * Inicia o servidor WebSocket
   * @returns {Promise} Promessa resolvida quando o servidor estiver pronto
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        // Cria o servidor HTTP
        this.httpServer = http.createServer();
        
        // Configura o servidor WebSocket
        const serverOptions = {
          server: this.httpServer,
          // Verifica origem para segurança (pode ser customizado)
          verifyClient: (info, cb) => {
            const isAllowed = this.verifyClient(info);
            cb(isAllowed);
          }
        };
        
        // Adiciona opções SSL se necessário
        if (this.options.secure && this.options.ssl) {
          Object.assign(serverOptions, this.options.ssl);
        }
        
        // Cria o servidor WebSocket
        this.wss = new WebSocket.Server(serverOptions);
        
        // Configura event listeners
        this.wss.on('connection', this.handleConnection);
        this.wss.on('error', this.handleError);
        
        // Inicia o servidor HTTP
        this.httpServer.listen(this.options.port, () => {
          this.stats.startTime = new Date();
          const protocol = this.options.secure ? 'wss' : 'ws';
          const message = `🚀 Servidor WebSocket iniciado em ${protocol}://localhost:${this.options.port}`;
          console.log(message);
          resolve({ server: this.wss, port: this.options.port });
        });
        
        this.httpServer.on('error', (error) => {
          console.error('❌ Erro ao iniciar servidor HTTP:', error.message);
          reject(error);
        });
        
      } catch (error) {
        console.error('❌ Erro ao inicializar servidor WebSocket:', error);
        reject(error);
        
        if (this.options.onError) {
          this.options.onError(error);
        }
      }
    });
  }
  
  /**
   * Para o servidor WebSocket
   * @returns {Promise} Promessa resolvida quando o servidor for encerrado
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.wss) {
        resolve();
        return;
      }
      
      try {
        // Notifica todos os clientes
        this.broadcast({
          type: 'server_shutdown',
          message: 'O servidor está sendo desligado'
        });
        
        // Fecha o servidor
        this.wss.close((error) => {
          if (error) {
            console.error('❌ Erro ao fechar servidor WebSocket:', error);
            reject(error);
            return;
          }
          
          // Fecha o servidor HTTP
          this.httpServer.close((error) => {
            if (error) {
              console.error('❌ Erro ao fechar servidor HTTP:', error);
              reject(error);
              return;
            }
            
            console.log('✅ Servidor WebSocket encerrado com sucesso');
            resolve();
          });
        });
      } catch (error) {
        console.error('❌ Erro ao encerrar servidor WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Verifica se um cliente pode se conectar (filtro de segurança)
   * @param {Object} info - Informações sobre o cliente
   * @returns {boolean} - Se o cliente pode se conectar
   */
  verifyClient(info) {
    // Se houver um autenticador personalizado, use-o
    if (this.options.authenticateClient) {
      return this.options.authenticateClient(info);
    }
    
    // Por padrão, aceita todas as conexões
    return true;
  }
  
  /**
   * Manipula novas conexões WebSocket
   * @param {WebSocket} ws - O cliente WebSocket
   * @param {http.IncomingMessage} req - Requisição HTTP
   */
  handleConnection(ws, req) {
    try {
      // Gera um ID único para este cliente
      const clientId = uuidv4();
      
      // Extrai informações da requisição
      const parsedUrl = url.parse(req.url, true);
      const query = parsedUrl.query;
      
      // Informações do cliente
      const clientInfo = {
        id: clientId,
        ip: req.socket.remoteAddress,
        headers: req.headers,
        type: query.type || 'unknown',
        name: query.name || `client-${clientId.substring(0, 8)}`,
        group: query.group || null,
        channel: query.channel || null,
        connectTime: new Date(),
        lastActivity: new Date(),
        messagesReceived: 0,
        messagesSent: 0
      };
      
      // Armazena o cliente
      this.clients.set(clientId, { ws, info: clientInfo });
      
      // Adiciona à grupos, se especificado
      if (clientInfo.group) {
        this.addToGroup(clientId, clientInfo.group);
      }
      
      // Adiciona ao canal, se especificado
      if (clientInfo.channel) {
        this.addToChannel(clientId, clientInfo.channel);
      }
      
      // Atualiza estatísticas
      this.stats.totalConnections++;
      
      // Configura event listeners para este cliente
      ws.on('message', (message) => this.handleMessage(clientId, message));
      ws.on('close', (code, reason) => this.handleClose(clientId, code, reason));
      ws.on('error', (error) => this.handleError(error, clientId));
      
      // Log de conexão
      console.log(`🔌 Novo cliente conectado: ${clientInfo.name} (${clientInfo.type}) [${clientId}]`);
      
      // Envia mensagem de boas-vindas com o ID do cliente
      this.sendTo(clientId, {
        type: 'connection',
        clientId: clientId,
        message: 'Bem-vindo ao servidor RUNES Analytics!',
        timestamp: new Date().toISOString()
      });
      
      // Notifica outros listeners
      if (this.options.onConnection) {
        this.options.onConnection(clientInfo);
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar nova conexão:', error);
      
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }
  
  /**
   * Processa mensagens de clientes
   * @param {string} clientId - ID do cliente
   * @param {string|Buffer} rawMessage - Mensagem bruta recebida
   */
  handleMessage(clientId, rawMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      // Atualiza estatísticas
      this.stats.messagesReceived++;
      client.info.messagesReceived++;
      client.info.lastActivity = new Date();
      
      // Converte a mensagem para string
      const messageStr = rawMessage.toString();
      
      // Tenta fazer o parse do JSON
      let message;
      try {
        message = JSON.parse(messageStr);
      } catch (e) {
        // Se não for JSON, usa como texto simples
        message = { type: 'text', content: messageStr };
      }
      
      // Log detalhado se modo de depuração ativo
      if (this.options.debug) {
        console.log(`📥 Mensagem recebida de ${client.info.name}: ${JSON.stringify(message)}`);
      }
      
      // Processa comandos especiais
      if (message.type === 'subscribe' && message.channel) {
        this.addToChannel(clientId, message.channel);
        return;
      } else if (message.type === 'unsubscribe' && message.channel) {
        this.removeFromChannel(clientId, message.channel);
        return;
      } else if (message.type === 'join' && message.group) {
        this.addToGroup(clientId, message.group);
        return;
      } else if (message.type === 'leave' && message.group) {
        this.removeFromGroup(clientId, message.group);
        return;
      } else if (message.type === 'ping') {
        this.sendTo(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        return;
      }
      
      // Se a mensagem tiver um destinatário específico, encaminhe-a
      if (message.target) {
        if (Array.isArray(message.target)) {
          message.target.forEach(target => this.routeMessage(message, client.info, target));
        } else {
          this.routeMessage(message, client.info, message.target);
        }
      } 
      // Senão, notifica os listeners do servidor
      else if (this.options.onMessage) {
        this.options.onMessage(message, client.info);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar mensagem de cliente ${clientId}:`, error);
      this.stats.errors++;
      
      if (this.options.onError) {
        this.options.onError(error, clientId);
      }
    }
  }
  
  /**
   * Roteia uma mensagem para o destinatário correto
   * @param {Object} message - Mensagem a ser encaminhada
   * @param {Object} sender - Informações do remetente
   * @param {string} target - Destinatário (clientId, grupo, canal ou 'all')
   */
  routeMessage(message, sender, target) {
    // Adiciona informações do remetente à mensagem
    const routedMessage = {
      ...message,
      from: {
        id: sender.id,
        name: sender.name,
        type: sender.type
      }
    };
    
    // Encaminha para todos os clientes
    if (target === 'all' || target === '*') {
      this.broadcast(routedMessage);
      return;
    }
    
    // Encaminha para um grupo de clientes
    if (target.startsWith('group:')) {
      const groupName = target.substring(6);
      this.sendToGroup(groupName, routedMessage);
      return;
    }
    
    // Encaminha para um canal
    if (target.startsWith('channel:')) {
      const channelName = target.substring(8);
      this.sendToChannel(channelName, routedMessage);
      return;
    }
    
    // Encaminha para clientes de um tipo específico
    if (target.startsWith('type:')) {
      const typeName = target.substring(5);
      this.sendToType(typeName, routedMessage);
      return;
    }
    
    // Encaminha para um cliente específico
    this.sendTo(target, routedMessage);
  }
  
  /**
   * Manipula o evento de fechamento de conexão
   * @param {string} clientId - ID do cliente
   * @param {number} code - Código de fechamento
   * @param {string} reason - Razão do fechamento
   */
  handleClose(clientId, code, reason) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      const clientInfo = client.info;
      
      // Remove de todos os grupos
      this.groups.forEach((clients, groupName) => {
        clients.delete(clientId);
      });
      
      // Remove de todos os canais
      this.channels.forEach((clients, channelName) => {
        clients.delete(clientId);
      });
      
      // Log de desconexão
      console.log(`📴 Cliente desconectado: ${clientInfo.name} (${clientInfo.type}) [${clientId}] Código: ${code}, Razão: ${reason || 'Nenhuma'}`);
      
      // Notifica listeners
      if (this.options.onDisconnection) {
        this.options.onDisconnection(clientInfo, code, reason);
      }
      
      // Remove o cliente
      this.clients.delete(clientId);
      
    } catch (error) {
      console.error(`❌ Erro ao processar desconexão de cliente ${clientId}:`, error);
      
      if (this.options.onError) {
        this.options.onError(error, clientId);
      }
    }
  }
  
  /**
   * Manipula erros do WebSocket
   * @param {Error} error - Erro ocorrido
   * @param {string} clientId - ID do cliente (se aplicável)
   */
  handleError(error, clientId = null) {
    this.stats.errors++;
    
    if (clientId) {
      console.error(`❌ Erro no cliente WebSocket ${clientId}:`, error.message);
    } else {
      console.error('❌ Erro no servidor WebSocket:', error.message);
    }
    
    if (this.options.onError) {
      this.options.onError(error, clientId);
    }
  }
  
  /**
   * Envia uma mensagem para um cliente específico
   * @param {string} clientId - ID do cliente
   * @param {Object} message - Mensagem a ser enviada
   * @returns {boolean} - Sucesso do envio
   */
  sendTo(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      const messageStr = JSON.stringify(message);
      client.ws.send(messageStr);
      
      // Atualiza estatísticas
      this.stats.messagesSent++;
      client.info.messagesSent++;
      
      // Log detalhado se modo de depuração ativo
      if (this.options.debug) {
        console.log(`📤 Mensagem enviada para ${client.info.name}: ${messageStr}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para cliente ${clientId}:`, error);
      this.stats.errors++;
      return false;
    }
  }
  
  /**
   * Envia uma mensagem para todos os clientes
   * @param {Object} message - Mensagem a ser enviada
   * @returns {number} - Número de clientes que receberam a mensagem
   */
  broadcast(message) {
    let successCount = 0;
    
    this.clients.forEach((client, clientId) => {
      if (this.sendTo(clientId, message)) {
        successCount++;
      }
    });
    
    return successCount;
  }
  
  /**
   * Envia uma mensagem para um grupo de clientes
   * @param {string} groupName - Nome do grupo
   * @param {Object} message - Mensagem a ser enviada
   * @returns {number} - Número de clientes que receberam a mensagem
   */
  sendToGroup(groupName, message) {
    let successCount = 0;
    const group = this.groups.get(groupName);
    
    if (!group) return 0;
    
    group.forEach(clientId => {
      if (this.sendTo(clientId, message)) {
        successCount++;
      }
    });
    
    return successCount;
  }
  
  /**
   * Envia uma mensagem para um canal
   * @param {string} channelName - Nome do canal
   * @param {Object} message - Mensagem a ser enviada
   * @returns {number} - Número de clientes que receberam a mensagem
   */
  sendToChannel(channelName, message) {
    let successCount = 0;
    const channel = this.channels.get(channelName);
    
    if (!channel) return 0;
    
    channel.forEach(clientId => {
      if (this.sendTo(clientId, message)) {
        successCount++;
      }
    });
    
    return successCount;
  }
  
  /**
   * Envia uma mensagem para todos os clientes de um tipo específico
   * @param {string} type - Tipo de cliente
   * @param {Object} message - Mensagem a ser enviada
   * @returns {number} - Número de clientes que receberam a mensagem
   */
  sendToType(type, message) {
    let successCount = 0;
    
    this.clients.forEach((client, clientId) => {
      if (client.info.type === type && this.sendTo(clientId, message)) {
        successCount++;
      }
    });
    
    return successCount;
  }
  
  /**
   * Adiciona um cliente a um grupo
   * @param {string} clientId - ID do cliente
   * @param {string} groupName - Nome do grupo
   * @returns {boolean} - Sucesso da operação
   */
  addToGroup(clientId, groupName) {
    const client = this.clients.get(clientId);
    if (!client) return false;
    
    if (!this.groups.has(groupName)) {
      this.groups.set(groupName, new Set());
    }
    
    this.groups.get(groupName).add(clientId);
    client.info.group = groupName;
    
    if (this.options.debug) {
      console.log(`👥 Cliente ${client.info.name} adicionado ao grupo ${groupName}`);
    }
    
    return true;
  }
  
  /**
   * Remove um cliente de um grupo
   * @param {string} clientId - ID do cliente
   * @param {string} groupName - Nome do grupo
   * @returns {boolean} - Sucesso da operação
   */
  removeFromGroup(clientId, groupName) {
    const client = this.clients.get(clientId);
    if (!client) return false;
    
    const group = this.groups.get(groupName);
    if (!group) return false;
    
    const result = group.delete(clientId);
    
    if (result && client.info.group === groupName) {
      client.info.group = null;
    }
    
    if (result && this.options.debug) {
      console.log(`👤 Cliente ${client.info.name} removido do grupo ${groupName}`);
    }
    
    // Remove o grupo se estiver vazio
    if (group.size === 0) {
      this.groups.delete(groupName);
    }
    
    return result;
  }
  
  /**
   * Adiciona um cliente a um canal
   * @param {string} clientId - ID do cliente
   * @param {string} channelName - Nome do canal
   * @returns {boolean} - Sucesso da operação
   */
  addToChannel(clientId, channelName) {
    const client = this.clients.get(clientId);
    if (!client) return false;
    
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new Set());
    }
    
    this.channels.get(channelName).add(clientId);
    client.info.channel = channelName;
    
    if (this.options.debug) {
      console.log(`📺 Cliente ${client.info.name} inscrito no canal ${channelName}`);
    }
    
    // Notifica o cliente sobre a inscrição bem-sucedida
    this.sendTo(clientId, {
      type: 'subscription',
      status: 'success',
      channel: channelName,
      message: `Inscrito com sucesso no canal ${channelName}`
    });
    
    return true;
  }
  
  /**
   * Remove um cliente de um canal
   * @param {string} clientId - ID do cliente
   * @param {string} channelName - Nome do canal
   * @returns {boolean} - Sucesso da operação
   */
  removeFromChannel(clientId, channelName) {
    const client = this.clients.get(clientId);
    if (!client) return false;
    
    const channel = this.channels.get(channelName);
    if (!channel) return false;
    
    const result = channel.delete(clientId);
    
    if (result && client.info.channel === channelName) {
      client.info.channel = null;
    }
    
    if (result && this.options.debug) {
      console.log(`📺 Cliente ${client.info.name} cancelou inscrição no canal ${channelName}`);
    }
    
    // Notifica o cliente sobre o cancelamento
    if (result) {
      this.sendTo(clientId, {
        type: 'subscription',
        status: 'canceled',
        channel: channelName,
        message: `Inscrição cancelada no canal ${channelName}`
      });
    }
    
    // Remove o canal se estiver vazio
    if (channel.size === 0) {
      this.channels.delete(channelName);
    }
    
    return result;
  }
  
  /**
   * Obtém informações sobre um cliente específico
   * @param {string} clientId - ID do cliente
   * @returns {Object|null} - Informações do cliente ou null se não existir
   */
  getClientInfo(clientId) {
    const client = this.clients.get(clientId);
    return client ? { ...client.info } : null;
  }
  
  /**
   * Obtém a lista de todos os clientes
   * @returns {Array<Object>} - Lista de informações dos clientes
   */
  getAllClients() {
    const clientList = [];
    
    this.clients.forEach((client, clientId) => {
      clientList.push({ ...client.info });
    });
    
    return clientList;
  }
  
  /**
   * Obtém a lista de clientes em um grupo específico
   * @param {string} groupName - Nome do grupo
   * @returns {Array<Object>} - Lista de informações dos clientes
   */
  getGroupClients(groupName) {
    const clientList = [];
    const group = this.groups.get(groupName);
    
    if (!group) return clientList;
    
    group.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client) {
        clientList.push({ ...client.info });
      }
    });
    
    return clientList;
  }
  
  /**
   * Obtém a lista de clientes em um canal específico
   * @param {string} channelName - Nome do canal
   * @returns {Array<Object>} - Lista de informações dos clientes
   */
  getChannelClients(channelName) {
    const clientList = [];
    const channel = this.channels.get(channelName);
    
    if (!channel) return clientList;
    
    channel.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client) {
        clientList.push({ ...client.info });
      }
    });
    
    return clientList;
  }
  
  /**
   * Obtém estatísticas do servidor
   * @returns {Object} - Estatísticas do servidor
   */
  getStats() {
    return {
      ...this.stats,
      uptime: this.stats.startTime ? (new Date() - this.stats.startTime) / 1000 : 0,
      activeConnections: this.clients.size,
      groups: this.groups.size,
      channels: this.channels.size
    };
  }
}

module.exports = RunesWebSocketServer; 
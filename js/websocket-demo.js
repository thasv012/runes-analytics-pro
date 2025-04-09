/**
 * RUNES Analytics Pro - WebSocket Demo
 * Script de demonstração da funcionalidade WebSocket
 */

// Importa os modelos de cliente e servidor (se estiver em um ambiente Node.js)
// Em um navegador, use <script src="websocket-client.js"></script>
let RunesWebSocketClient, RunesWebSocketServer;
try {
  if (typeof require !== 'undefined') {
    RunesWebSocketClient = require('./websocket-client.js');
    if (typeof window === 'undefined') {
      RunesWebSocketServer = require('./websocket-server.js');
    }
  }
} catch (e) {
  console.log('Executando em ambiente de navegador, sem require()');
}

// Contêiner para componentes da demonstração
const WebSocketDemo = {
  // Componentes
  server: null,
  client: null,
  uiClient: null,
  analyticsClient: null,
  
  // Configurações
  config: {
    port: 9999,
    host: 'localhost',
    secure: false,
    debug: true
  },
  
  // Estado da demonstração
  state: {
    serverRunning: false,
    clientsConnected: 0,
    messages: []
  },
  
  // Log e UI
  logElement: null,
  statusElement: null,
  clientsElement: null,
  messagesElement: null,
  
  /**
   * Inicializa a demonstração WebSocket
   */
  init: function(options = {}) {
    console.log('🚀 Inicializando WebSocket Demo');
    
    // Mescla opções
    this.config = { ...this.config, ...options };
    
    // Inicializa UI
    this.initUI();
    
    // Se em Node.js, inicializa servidor
    if (typeof window === 'undefined') {
      this.startServer();
    }
    
    return this;
  },
  
  /**
   * Inicializa elementos da UI
   */
  initUI: function() {
    // Em ambiente de navegador
    if (typeof document !== 'undefined') {
      // Tenta encontrar ou criar elementos
      this.logElement = document.getElementById('ws-log') || this.createLogElement();
      this.statusElement = document.getElementById('ws-status') || this.createStatusElement();
      this.clientsElement = document.getElementById('ws-clients') || this.createClientsElement();
      this.messagesElement = document.getElementById('ws-messages') || this.createMessagesElement();
      
      // Adiciona eventos para os botões
      this.setupUIEvents();
    }
  },
  
  /**
   * Cria elemento de log
   */
  createLogElement: function() {
    const logElement = document.createElement('div');
    logElement.id = 'ws-log';
    logElement.className = 'ws-log';
    document.body.appendChild(logElement);
    return logElement;
  },
  
  /**
   * Cria elemento de status
   */
  createStatusElement: function() {
    const statusElement = document.createElement('div');
    statusElement.id = 'ws-status';
    statusElement.className = 'ws-status';
    document.body.appendChild(statusElement);
    return statusElement;
  },
  
  /**
   * Cria elemento de clientes
   */
  createClientsElement: function() {
    const clientsElement = document.createElement('div');
    clientsElement.id = 'ws-clients';
    clientsElement.className = 'ws-clients';
    document.body.appendChild(clientsElement);
    return clientsElement;
  },
  
  /**
   * Cria elemento de mensagens
   */
  createMessagesElement: function() {
    const messagesElement = document.createElement('div');
    messagesElement.id = 'ws-messages';
    messagesElement.className = 'ws-messages';
    document.body.appendChild(messagesElement);
    return messagesElement;
  },
  
  /**
   * Configura eventos da UI
   */
  setupUIEvents: function() {
    // Adiciona eventos aos botões existentes
    const startServerBtn = document.getElementById('start-server-btn');
    if (startServerBtn) {
      startServerBtn.addEventListener('click', () => this.startServer());
    }
    
    const stopServerBtn = document.getElementById('stop-server-btn');
    if (stopServerBtn) {
      stopServerBtn.addEventListener('click', () => this.stopServer());
    }
    
    const connectClientBtn = document.getElementById('connect-client-btn');
    if (connectClientBtn) {
      connectClientBtn.addEventListener('click', () => this.connectClient());
    }
    
    const disconnectClientBtn = document.getElementById('disconnect-client-btn');
    if (disconnectClientBtn) {
      disconnectClientBtn.addEventListener('click', () => this.disconnectClient());
    }
    
    const sendMessageBtn = document.getElementById('send-message-btn');
    if (sendMessageBtn) {
      sendMessageBtn.addEventListener('click', () => {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
          this.sendMessage(messageInput.value);
          messageInput.value = '';
        }
      });
    }
    
    const clearLogBtn = document.getElementById('clear-log-btn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => this.clearLog());
    }
  },
  
  /**
   * Inicia o servidor WebSocket
   */
  startServer: function() {
    this.log('Iniciando servidor WebSocket...');
    
    try {
      // Verifica se já existe servidor
      if (this.server) {
        this.log('Servidor já está em execução.');
        return;
      }
      
      // Cria o servidor
      this.server = new RunesWebSocketServer({
        port: this.config.port,
        debug: this.config.debug,
        secure: this.config.secure,
        onConnection: (client) => {
          this.state.clientsConnected++;
          this.log(`Cliente conectado: ${client.name} (${client.type}) [${client.id}]`);
          this.updateStatus();
          this.updateClientsView();
        },
        onDisconnection: (client) => {
          this.state.clientsConnected--;
          this.log(`Cliente desconectado: ${client.name} (${client.type}) [${client.id}]`);
          this.updateStatus();
          this.updateClientsView();
        },
        onMessage: (message, client) => {
          this.log(`Mensagem recebida de ${client.name}: ${JSON.stringify(message)}`);
          this.state.messages.push({
            from: client.name,
            message: message,
            timestamp: new Date()
          });
          this.updateMessagesView();
        },
        onError: (error) => {
          this.log(`Erro no servidor: ${error.message}`, 'error');
        }
      });
      
      this.server.start()
        .then(() => {
          this.state.serverRunning = true;
          this.log('✅ Servidor WebSocket iniciado com sucesso!');
          this.updateStatus();
        })
        .catch((error) => {
          this.log(`❌ Erro ao iniciar servidor: ${error.message}`, 'error');
        });
    } catch (error) {
      this.log(`❌ Erro ao criar servidor: ${error.message}`, 'error');
    }
  },
  
  /**
   * Para o servidor WebSocket
   */
  stopServer: function() {
    this.log('Parando servidor WebSocket...');
    
    if (!this.server) {
      this.log('Servidor não está em execução.');
      return;
    }
    
    this.server.stop()
      .then(() => {
        this.state.serverRunning = false;
        this.server = null;
        this.log('✅ Servidor WebSocket parado com sucesso!');
        this.updateStatus();
      })
      .catch((error) => {
        this.log(`❌ Erro ao parar servidor: ${error.message}`, 'error');
      });
  },
  
  /**
   * Conecta um cliente WebSocket
   */
  connectClient: function(options = {}) {
    const clientType = options.type || 'ui';
    const clientName = options.name || `runes-${clientType}-${Date.now()}`;
    
    this.log(`Conectando cliente ${clientName} (${clientType})...`);
    
    try {
      const client = new RunesWebSocketClient({
        url: `ws://${this.config.host}:${this.config.port}`,
        clientType: clientType,
        clientName: clientName,
        onConnect: (event) => {
          this.log(`✅ Cliente ${clientName} conectado!`);
          this.updateStatus();
        },
        onDisconnect: (event) => {
          this.log(`📴 Cliente ${clientName} desconectado.`);
          this.updateStatus();
        },
        onMessage: (message) => {
          this.log(`📩 Cliente ${clientName} recebeu: ${JSON.stringify(message)}`);
          this.updateMessagesView();
        },
        onError: (error) => {
          this.log(`❌ Erro no cliente ${clientName}: ${error.message}`, 'error');
        }
      });
      
      // Armazena referência ao cliente
      if (clientType === 'ui') {
        this.uiClient = client;
      } else if (clientType === 'analytics') {
        this.analyticsClient = client;
      } else {
        this.client = client;
      }
      
      return client;
    } catch (error) {
      this.log(`❌ Erro ao conectar cliente: ${error.message}`, 'error');
      return null;
    }
  },
  
  /**
   * Desconecta um cliente WebSocket
   */
  disconnectClient: function(client = null) {
    if (!client) {
      client = this.uiClient || this.client || this.analyticsClient;
    }
    
    if (!client) {
      this.log('Nenhum cliente disponível para desconectar.');
      return;
    }
    
    this.log(`Desconectando cliente...`);
    client.disconnect();
  },
  
  /**
   * Envia uma mensagem de um cliente para o servidor
   */
  sendMessage: function(message, client = null, target = null) {
    if (!client) {
      client = this.uiClient || this.client || this.analyticsClient;
    }
    
    if (!client) {
      this.log('Nenhum cliente disponível para enviar mensagem.');
      return false;
    }
    
    let messageObj;
    
    try {
      // Verifica se a mensagem é uma string ou objeto
      if (typeof message === 'string') {
        try {
          // Tenta fazer parse como JSON
          messageObj = JSON.parse(message);
        } catch (e) {
          // Se não for JSON, cria objeto simples
          messageObj = { content: message };
        }
      } else {
        messageObj = message;
      }
      
      // Define tipo de mensagem se não existir
      if (!messageObj.type) {
        messageObj.type = 'chat';
      }
      
      this.log(`📤 Enviando mensagem: ${JSON.stringify(messageObj)}`);
      const success = client.send(messageObj.type, messageObj, target);
      
      if (success) {
        this.log(`✅ Mensagem enviada!`);
      } else {
        this.log(`⚠️ Mensagem enfileirada para envio.`);
      }
      
      return success;
    } catch (error) {
      this.log(`❌ Erro ao enviar mensagem: ${error.message}`, 'error');
      return false;
    }
  },
  
  /**
   * Cria e conecta múltiplos clientes para teste
   */
  createTestClients: function(count = 5) {
    const clients = [];
    const types = ['ui', 'analytics', 'agent', 'monitor', 'visualizer'];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const name = `test-${type}-${i + 1}`;
      
      const client = this.connectClient({
        type: type,
        name: name
      });
      
      if (client) {
        clients.push(client);
      }
    }
    
    this.log(`✅ Criados ${clients.length} clientes de teste.`);
    return clients;
  },
  
  /**
   * Executa teste de sobrecarga com muitos clientes e mensagens
   */
  runStressTest: function(clientCount = 50, messageCount = 100, delay = 50) {
    this.log(`🧪 Iniciando teste de sobrecarga com ${clientCount} clientes e ${messageCount} mensagens...`);
    
    const clients = [];
    let messagesProcessed = 0;
    
    // Cria clientes
    for (let i = 0; i < clientCount; i++) {
      setTimeout(() => {
        const client = this.connectClient({
          type: 'test',
          name: `stress-${i + 1}`
        });
        
        if (client) {
          clients.push(client);
          
          // Envia mensagens
          for (let j = 0; j < messageCount; j++) {
            setTimeout(() => {
              this.sendMessage({
                type: 'test',
                content: `Test message ${j + 1} from client ${i + 1}`,
                testId: `${i}-${j}`
              }, client);
              
              messagesProcessed++;
              
              // Verifica conclusão
              if (messagesProcessed === clientCount * messageCount) {
                this.log(`🎉 Teste de sobrecarga concluído! Total: ${messagesProcessed} mensagens.`);
              }
            }, j * delay);
          }
        }
      }, i * (delay * 2));
    }
  },
  
  /**
   * Adiciona mensagem ao log
   */
  log: function(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    // Se estiver em navegador, atualiza elemento de log
    if (this.logElement) {
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry log-${type}`;
      logEntry.textContent = logMessage;
      
      this.logElement.appendChild(logEntry);
      this.logElement.scrollTop = this.logElement.scrollHeight;
      
      // Limita número de entradas (opcional)
      while (this.logElement.children.length > 100) {
        this.logElement.removeChild(this.logElement.firstChild);
      }
    }
  },
  
  /**
   * Limpa o log
   */
  clearLog: function() {
    if (this.logElement) {
      this.logElement.innerHTML = '';
    }
    this.log('Log limpo.');
  },
  
  /**
   * Atualiza exibição do status
   */
  updateStatus: function() {
    if (!this.statusElement) return;
    
    const serverStatus = this.state.serverRunning ? 'online' : 'offline';
    const serverClass = this.state.serverRunning ? 'status-online' : 'status-offline';
    
    let clientsStatus = '';
    
    if (this.uiClient && this.uiClient.isConnected()) {
      clientsStatus += '<span class="status-online">UI</span> ';
    }
    
    if (this.analyticsClient && this.analyticsClient.isConnected()) {
      clientsStatus += '<span class="status-online">Analytics</span> ';
    }
    
    if (this.client && this.client.isConnected()) {
      clientsStatus += '<span class="status-online">Client</span> ';
    }
    
    this.statusElement.innerHTML = `
      <div>Servidor: <span class="${serverClass}">${serverStatus}</span></div>
      <div>Clientes Conectados: ${this.state.clientsConnected}</div>
      <div>Clientes Locais: ${clientsStatus || '<span class="status-offline">Nenhum</span>'}</div>
    `;
  },
  
  /**
   * Atualiza visualização de clientes
   */
  updateClientsView: function() {
    if (!this.clientsElement || !this.server) return;
    
    const clients = this.server.getAllClients();
    
    let html = '<h3>Clientes Conectados</h3>';
    
    if (clients.length === 0) {
      html += '<p>Nenhum cliente conectado.</p>';
    } else {
      html += '<ul>';
      clients.forEach(client => {
        html += `<li>
          <strong>${client.name}</strong> 
          <span class="client-type">${client.type}</span>
          <span class="client-id">${client.id}</span>
          <div class="client-stats">
            Mensagens: ${client.messagesReceived} recebidas / ${client.messagesSent} enviadas
          </div>
        </li>`;
      });
      html += '</ul>';
    }
    
    this.clientsElement.innerHTML = html;
  },
  
  /**
   * Atualiza visualização de mensagens
   */
  updateMessagesView: function() {
    if (!this.messagesElement) return;
    
    let html = '<h3>Mensagens Recentes</h3>';
    
    if (this.state.messages.length === 0) {
      html += '<p>Nenhuma mensagem trocada.</p>';
    } else {
      html += '<ul>';
      
      // Mostra últimas 10 mensagens
      const recentMessages = this.state.messages.slice(-10);
      
      recentMessages.forEach(item => {
        const time = new Date(item.timestamp).toISOString().split('T')[1].split('.')[0];
        html += `<li>
          <div class="message-header">
            <span class="message-from">${item.from}</span>
            <span class="message-time">${time}</span>
          </div>
          <div class="message-content">${JSON.stringify(item.message)}</div>
        </li>`;
      });
      
      html += '</ul>';
    }
    
    this.messagesElement.innerHTML = html;
  }
};

// Exporta para uso em navegadores
if (typeof window !== 'undefined') {
  window.WebSocketDemo = WebSocketDemo;
  
  // Auto-inicialização quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    WebSocketDemo.init();
  });
}

// Exporta para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebSocketDemo;
} 
/**
 * RUNES Analytics Pro - GPU Mesh Client
 * Módulo para enviar tarefas para nós remotos da GPU Mesh via WebSocket
 */

// Configurações padrão do cliente
const DEFAULT_CONFIG = {
  reconnectDelay: 2000,       // Intervalo entre tentativas de reconexão (ms)
  reconnectMaxAttempts: 5,    // Número máximo de tentativas de reconexão
  taskTimeout: 30000,         // Timeout para execução de tarefas (ms)
  consoleMaxLines: 1000,      // Número máximo de linhas no console virtual
  localEndpoint: 'ws://localhost:8081/mesh',  // Endpoint local do nó da GPU Mesh
  remoteEndpoint: 'wss://mesh.runes.pro/node', // Endpoint remoto da rede Mesh
  debug: false                // Modo debug (logs adicionais no console)
};

/**
 * Classe para gerenciar conexões WebSocket com nós da GPU Mesh
 */
class GpuMeshClient {
  /**
   * Construtor do cliente
   * @param {Object} config - Configurações personalizadas
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.pendingTasks = new Map(); // taskId -> { resolve, reject, timeout }
    this.consoleElement = null;
    this.taskHistory = [];
    this.logBuffer = [];
    this.eventListeners = {};
    
    // Binds para manter o contexto correto
    this.connect = this.connect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.handleSocketMessage = this.handleSocketMessage.bind(this);
    this.handleSocketClose = this.handleSocketClose.bind(this);
    this.handleSocketError = this.handleSocketError.bind(this);
  }
  
  /**
   * Inicializa o cliente e conecta ao nó da GPU Mesh
   * @param {String} endpoint - Endpoint WebSocket opcional para sobrescrever a configuração
   * @returns {Promise} - Promessa resolvida quando a conexão for estabelecida
   */
  init(endpoint = null) {
    return new Promise((resolve, reject) => {
      const connectionEndpoint = endpoint || this.config.localEndpoint;
      
      this.log(`Inicializando conexão com: ${connectionEndpoint}`);
      
      this.connect(connectionEndpoint)
        .then(() => {
          this.log('Cliente GPU Mesh inicializado com sucesso');
          resolve(this);
        })
        .catch(err => {
          this.error('Falha ao inicializar cliente GPU Mesh', err);
          reject(err);
        });
    });
  }
  
  /**
   * Conecta ao servidor WebSocket
   * @param {String} endpoint - Endpoint WebSocket
   * @returns {Promise} - Promessa resolvida quando a conexão for estabelecida
   */
  connect(endpoint) {
    return new Promise((resolve, reject) => {
      try {
        // Limpa reconexão anterior se existir
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        // Fecha socket existente se estiver aberto
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
          this.socket.close();
        }
        
        this.log(`Conectando a ${endpoint}...`);
        this.socket = new WebSocket(endpoint);
        
        // Conectado com sucesso
        this.socket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.log('Conexão estabelecida com o nó da GPU Mesh');
          
          // Emite evento de conexão
          this.emit('connected', { endpoint });
          
          resolve();
        };
        
        // Recebimento de mensagens
        this.socket.onmessage = this.handleSocketMessage;
        
        // Desconexão
        this.socket.onclose = this.handleSocketClose;
        
        // Erro na conexão
        this.socket.onerror = (error) => {
          this.handleSocketError(error);
          if (this.reconnectAttempts === 0) {
            reject(new Error('Falha na conexão WebSocket'));
          }
        };
      } catch (err) {
        this.error('Erro ao conectar ao nó GPU Mesh', err);
        reject(err);
      }
    });
  }
  
  /**
   * Handler para mensagens recebidas via WebSocket
   * @param {MessageEvent} event - Evento de mensagem WebSocket
   */
  handleSocketMessage(event) {
    try {
      // Tenta parsear a mensagem como JSON
      const message = JSON.parse(event.data);
      
      // Tipo de mensagem: log, resultado de tarefa, etc.
      switch (message.type) {
        case 'log':
          this.processLogMessage(message);
          break;
          
        case 'taskResult':
          this.processTaskResult(message);
          break;
          
        case 'taskProgress':
          this.processTaskProgress(message);
          break;
          
        case 'error':
          this.processErrorMessage(message);
          break;
          
        case 'heartbeat':
          // Apenas respondemos para manter a conexão viva
          if (this.isConnected) {
            this.socket.send(JSON.stringify({ type: 'heartbeat-response' }));
          }
          break;
          
        default:
          this.log(`Mensagem desconhecida: ${event.data}`);
      }
      
      // Emite evento para todos os tipos de mensagem
      this.emit('message', message);
      
    } catch (err) {
      // Trata como mensagem de texto simples se não for JSON
      this.appendToConsole(event.data);
      this.log(`Mensagem recebida: ${event.data}`);
    }
  }
  
  /**
   * Handler para fechamento da conexão WebSocket
   * @param {CloseEvent} event - Evento de fechamento WebSocket
   */
  handleSocketClose(event) {
    this.isConnected = false;
    
    const reason = event.reason || 'Desconhecido';
    this.log(`Conexão fechada. Código: ${event.code}. Motivo: ${reason}`);
    
    // Emite evento de desconexão
    this.emit('disconnected', { code: event.code, reason });
    
    // Inicia tentativa de reconexão
    this.reconnect();
  }
  
  /**
   * Handler para erros na conexão WebSocket
   * @param {Event} error - Evento de erro WebSocket
   */
  handleSocketError(error) {
    this.error('Erro na conexão WebSocket', error);
    
    // Emite evento de erro
    this.emit('error', { error });
  }
  
  /**
   * Tenta reconectar ao servidor WebSocket
   */
  reconnect() {
    if (this.reconnectTimer || this.isConnected) return;
    
    if (this.reconnectAttempts >= this.config.reconnectMaxAttempts) {
      this.log('Número máximo de tentativas de reconexão atingido');
      this.emit('reconnect-failed');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    this.log(`Tentando reconectar em ${Math.round(delay / 1000)} segundos... (${this.reconnectAttempts}/${this.config.reconnectMaxAttempts})`);
    
    // Emite evento de tentativa de reconexão
    this.emit('reconnecting', { attempt: this.reconnectAttempts, maxAttempts: this.config.reconnectMaxAttempts, delay });
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.config.localEndpoint)
        .catch(() => {
          // Se falhar, tenta o endpoint remoto
          if (this.reconnectAttempts % 2 === 0) {
            this.connect(this.config.remoteEndpoint)
              .catch(() => {}); // Ignora erros, tentará novamente no próximo ciclo
          }
        });
    }, delay);
  }
  
  /**
   * Processa mensagem de log recebida do servidor
   * @param {Object} message - Mensagem de log
   */
  processLogMessage(message) {
    const { taskId, content, timestamp } = message;
    
    // Formata e exibe a mensagem no console
    const formattedMessage = `[${new Date(timestamp).toLocaleTimeString()}] [${taskId}] ${content}`;
    this.appendToConsole(formattedMessage);
    
    // Verifica se tem uma tarefa pendente com esse ID
    const task = this.pendingTasks.get(taskId);
    if (task) {
      // Atualiza os logs da tarefa
      task.logs = task.logs || [];
      task.logs.push({ content, timestamp });
    }
    
    // Emite evento de log
    this.emit('log', message);
  }
  
  /**
   * Processa resultado de uma tarefa recebida do servidor
   * @param {Object} message - Mensagem com resultado da tarefa
   */
  processTaskResult(message) {
    const { taskId, result, success } = message;
    
    this.log(`Tarefa ${taskId} ${success ? 'concluída' : 'falhou'}`);
    
    // Verifica se tem uma tarefa pendente com esse ID
    const task = this.pendingTasks.get(taskId);
    if (task) {
      // Cancela o timeout da tarefa
      if (task.timeout) {
        clearTimeout(task.timeout);
      }
      
      // Resolve ou rejeita a promise da tarefa
      if (success) {
        task.resolve({ ...message, logs: task.logs || [] });
      } else {
        task.reject(new Error(message.error || 'Falha na execução da tarefa'));
      }
      
      // Remove da lista de tarefas pendentes
      this.pendingTasks.delete(taskId);
      
      // Adiciona ao histórico
      this.taskHistory.push({
        taskId,
        startTime: task.startTime,
        endTime: Date.now(),
        success,
        result
      });
      
      // Limita o tamanho do histórico
      if (this.taskHistory.length > 50) {
        this.taskHistory.shift();
      }
    }
    
    // Emite evento de resultado
    this.emit('taskCompleted', message);
  }
  
  /**
   * Processa progresso de uma tarefa
   * @param {Object} message - Mensagem com progresso da tarefa
   */
  processTaskProgress(message) {
    const { taskId, progress, statusText } = message;
    
    // Verifica se tem uma tarefa pendente com esse ID
    const task = this.pendingTasks.get(taskId);
    if (task) {
      task.progress = progress;
      if (statusText) {
        this.appendToConsole(`[${taskId}] Progresso: ${Math.round(progress * 100)}% - ${statusText}`);
      }
    }
    
    // Emite evento de progresso
    this.emit('taskProgress', message);
  }
  
  /**
   * Processa mensagem de erro recebida do servidor
   * @param {Object} message - Mensagem de erro
   */
  processErrorMessage(message) {
    const { taskId, error } = message;
    
    this.error(`Erro na tarefa ${taskId}: ${error}`);
    
    // Verifica se tem uma tarefa pendente com esse ID
    const task = this.pendingTasks.get(taskId);
    if (task) {
      // Cancela o timeout da tarefa
      if (task.timeout) {
        clearTimeout(task.timeout);
      }
      
      // Rejeita a promise da tarefa
      task.reject(new Error(error || 'Erro desconhecido na execução da tarefa'));
      
      // Remove da lista de tarefas pendentes
      this.pendingTasks.delete(taskId);
    }
    
    // Emite evento de erro
    this.emit('taskError', message);
  }
  
  /**
   * Envia uma tarefa para o nó da GPU Mesh
   * @param {Object} task - Objeto da tarefa a ser enviada
   * @returns {Promise} - Promessa resolvida com o resultado da tarefa
   */
  sendTask(task) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        return reject(new Error('Cliente não está conectado ao nó da GPU Mesh'));
      }
      
      // Validação básica da tarefa
      if (!task.taskId) {
        return reject(new Error('É necessário um taskId para a tarefa'));
      }
      
      const taskId = task.taskId;
      const taskMessage = {
        type: 'task',
        ...task,
        timestamp: Date.now()
      };
      
      // Registra a tarefa como pendente
      this.pendingTasks.set(taskId, {
        resolve,
        reject,
        startTime: Date.now(),
        logs: []
      });
      
      // Log da tarefa sendo enviada
      this.log(`Enviando tarefa ${taskId}`);
      this.appendToConsole(`[${new Date().toLocaleTimeString()}] Enviando tarefa: ${taskId}`);
      
      try {
        // Envia a tarefa para o servidor
        this.socket.send(JSON.stringify(taskMessage));
        
        // Configura timeout para a tarefa
        const timeout = setTimeout(() => {
          const task = this.pendingTasks.get(taskId);
          if (task) {
            this.error(`Timeout na tarefa ${taskId}`);
            this.appendToConsole(`[${new Date().toLocaleTimeString()}] ⚠️ Timeout na tarefa: ${taskId}`);
            
            // Remove da lista de tarefas pendentes
            this.pendingTasks.delete(taskId);
            
            // Rejeita a promise
            task.reject(new Error(`Timeout ao executar a tarefa (${this.config.taskTimeout}ms)`));
            
            // Emite evento de timeout
            this.emit('taskTimeout', { taskId, timeout: this.config.taskTimeout });
          }
        }, this.config.taskTimeout);
        
        // Adiciona o timeout à tarefa pendente
        this.pendingTasks.get(taskId).timeout = timeout;
        
        // Emite evento de tarefa enviada
        this.emit('taskSent', { taskId, task });
        
      } catch (err) {
        // Remove da lista de tarefas pendentes
        this.pendingTasks.delete(taskId);
        
        this.error(`Erro ao enviar tarefa ${taskId}`, err);
        reject(err);
      }
    });
  }
  
  /**
   * Cancela uma tarefa em execução
   * @param {String} taskId - ID da tarefa a ser cancelada
   * @returns {Promise} - Promessa resolvida quando a tarefa for cancelada
   */
  cancelTask(taskId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        return reject(new Error('Cliente não está conectado ao nó da GPU Mesh'));
      }
      
      // Verifica se a tarefa existe
      if (!this.pendingTasks.has(taskId)) {
        return reject(new Error(`Tarefa ${taskId} não encontrada ou já concluída`));
      }
      
      try {
        // Envia mensagem de cancelamento
        this.socket.send(JSON.stringify({
          type: 'cancelTask',
          taskId,
          timestamp: Date.now()
        }));
        
        this.log(`Solicitação de cancelamento enviada para tarefa ${taskId}`);
        this.appendToConsole(`[${new Date().toLocaleTimeString()}] ⚠️ Cancelando tarefa: ${taskId}`);
        
        // Não removemos a tarefa pendente ainda, esperamos a confirmação do servidor
        resolve();
        
      } catch (err) {
        this.error(`Erro ao cancelar tarefa ${taskId}`, err);
        reject(err);
      }
    });
  }
  
  /**
   * Define o elemento do DOM para exibir o console
   * @param {HTMLElement|String} element - Elemento DOM ou ID do elemento
   */
  setConsoleElement(element) {
    if (typeof element === 'string') {
      this.consoleElement = document.getElementById(element);
    } else {
      this.consoleElement = element;
    }
    
    // Estiliza o console se for um elemento válido
    if (this.consoleElement) {
      // Estiliza apenas se ainda não tiver sido estilizado
      if (!this.consoleElement.classList.contains('gpu-mesh-console')) {
        this.consoleElement.classList.add('gpu-mesh-console');
        this.consoleElement.style.backgroundColor = '#1a1a2e';
        this.consoleElement.style.color = '#e0e0ff';
        this.consoleElement.style.fontFamily = 'monospace';
        this.consoleElement.style.fontSize = '14px';
        this.consoleElement.style.padding = '10px';
        this.consoleElement.style.borderRadius = '5px';
        this.consoleElement.style.maxHeight = '300px';
        this.consoleElement.style.overflowY = 'auto';
        this.consoleElement.style.whiteSpace = 'pre-wrap';
        this.consoleElement.style.wordBreak = 'break-word';
      }
      
      // Exibe mensagens em buffer
      if (this.logBuffer.length > 0) {
        this.logBuffer.forEach(msg => {
          this._appendToConsoleElement(msg);
        });
        this.logBuffer = [];
      }
    }
  }
  
  /**
   * Adiciona uma linha ao console virtual
   * @param {String} message - Mensagem a ser exibida
   */
  appendToConsole(message) {
    if (!this.consoleElement) {
      // Guarda no buffer se o elemento ainda não estiver definido
      this.logBuffer.push(message);
      return;
    }
    
    this._appendToConsoleElement(message);
  }
  
  /**
   * Implementação interna para adicionar mensagem ao elemento DOM
   * @param {String} message - Mensagem a ser exibida
   * @private
   */
  _appendToConsoleElement(message) {
    // Cria elemento para a linha
    const line = document.createElement('div');
    line.textContent = message;
    
    // Destaca mensagens de erro
    if (message.includes('⚠️') || message.includes('Erro') || message.includes('falhou')) {
      line.style.color = '#ff5555';
    }
    
    // Destaca mensagens de sucesso
    if (message.includes('✓') || message.includes('concluída') || message.includes('sucesso')) {
      line.style.color = '#55ff55';
    }
    
    // Adiciona a linha ao console
    this.consoleElement.appendChild(line);
    
    // Limita o número máximo de linhas
    while (this.consoleElement.childElementCount > this.config.consoleMaxLines) {
      this.consoleElement.removeChild(this.consoleElement.firstChild);
    }
    
    // Rola para a última linha
    this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
  }
  
  /**
   * Limpa o console virtual
   */
  clearConsole() {
    if (this.consoleElement) {
      this.consoleElement.innerHTML = '';
    }
    this.logBuffer = [];
  }
  
  /**
   * Obtém o histórico de tarefas
   * @returns {Array} - Histórico de tarefas executadas
   */
  getTaskHistory() {
    return [...this.taskHistory];
  }
  
  /**
   * Verifica se uma tarefa está pendente
   * @param {String} taskId - ID da tarefa
   * @returns {Boolean} - true se a tarefa estiver pendente
   */
  isTaskPending(taskId) {
    return this.pendingTasks.has(taskId);
  }
  
  /**
   * Fecha a conexão com o servidor
   */
  disconnect() {
    if (this.socket) {
      this.log('Desconectando do nó da GPU Mesh...');
      this.socket.close();
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.isConnected = false;
  }
  
  /**
   * Registra um log interno (não exibido no console virtual)
   * @param {String} message - Mensagem de log
   * @private
   */
  log(message) {
    if (this.config.debug) {
      console.log(`[GPU Mesh] ${message}`);
    }
  }
  
  /**
   * Registra um erro interno
   * @param {String} message - Mensagem de erro
   * @param {Error} error - Objeto de erro opcional
   * @private
   */
  error(message, error = null) {
    console.error(`[GPU Mesh] ${message}`, error || '');
  }
  
  /**
   * Adiciona um listener para eventos emitidos pelo cliente
   * @param {String} event - Nome do evento
   * @param {Function} callback - Função de callback
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    return this;
  }
  
  /**
   * Remove um listener de evento
   * @param {String} event - Nome do evento
   * @param {Function} callback - Função de callback a ser removida
   */
  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event]
        .filter(cb => cb !== callback);
    }
    return this;
  }
  
  /**
   * Emite um evento para todos os listeners registrados
   * @param {String} event - Nome do evento
   * @param {Object} data - Dados do evento
   * @private
   */
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Erro ao executar callback de evento '${event}'`, err);
        }
      });
    }
    return this;
  }
}

// Cria e exporta uma instância global
const gpuMeshClient = new GpuMeshClient();

// Implementação de exemplo de uso:
/*
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar o cliente
  await gpuMeshClient.init();
  
  // Definir o elemento de console
  gpuMeshClient.setConsoleElement('gpu-mesh-console');
  
  // Adicionar listeners para eventos
  gpuMeshClient.on('taskCompleted', (data) => {
    console.log('Tarefa concluída:', data);
  });
  
  // Enviar uma tarefa
  const taskButton = document.getElementById('send-task-button');
  if (taskButton) {
    taskButton.addEventListener('click', async () => {
      try {
        const result = await gpuMeshClient.sendTask({
          taskId: "TASK-EMBED-RUNE-" + Date.now().toString(36),
          model: "cypher-v1",
          inputDataURL: "https://runes.pro/data/batch-0425.json",
          returnLogs: true
        });
        
        console.log('Resultado da tarefa:', result);
      } catch (err) {
        console.error('Erro ao executar tarefa:', err);
      }
    });
  }
});
*/

// Exporta o cliente e a classe para uso externo
export { gpuMeshClient, GpuMeshClient }; 
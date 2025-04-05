/**
 * RUNES Analytics Pro - GPU Mesh Network
 * Sistema P2P para colaboração de GPUs entre desenvolvedores
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const WebSocket = require('ws');
const uuid = require('uuid');

// Configurações
const CONFIG = {
  agentsFile: path.join(__dirname, 'agents.json'),
  networkId: 'runes-analytics-mesh',
  discoveryPort: 9000,
  heartbeatInterval: 30000, // 30 segundos
  taskTimeout: 60000 // 1 minuto
};

// Gerenciador da Rede de GPUs
class GPUMeshNetwork {
  constructor() {
    this.nodeId = uuid.v4();
    this.agents = [];
    this.activeConnections = new Map();
    this.pendingTasks = new Map();
    this.discoveryServer = null;
    this.isCoordinator = false;
  }

  // Inicializar a rede
  async init() {
    console.log(`🔄 Inicializando GPU Mesh Network (ID: ${this.nodeId.substr(0, 8)}...)`);
    
    // Carregar agentes do arquivo de configuração
    await this.loadAgents();
    
    // Iniciar servidor de descoberta
    this.startDiscoveryServer();
    
    // Conectar aos agentes conhecidos
    await this.connectToAgents();
    
    // Iniciar monitoramento de agentes
    this.startHeartbeat();
    
    console.log('✅ GPU Mesh Network iniciada com sucesso!');
    console.log(`📊 Agentes disponíveis: ${this.agents.filter(a => a.active).length}`);
    
    return this;
  }

  // Carregar agentes do arquivo JSON
  async loadAgents() {
    try {
      if (fs.existsSync(CONFIG.agentsFile)) {
        const data = fs.readFileSync(CONFIG.agentsFile, 'utf8');
        this.agents = JSON.parse(data);
        console.log(`📂 Carregados ${this.agents.length} agentes do arquivo`);
      } else {
        console.warn('⚠️ Arquivo de agentes não encontrado. Usando configuração padrão.');
        this.agents = [{
          name: "Local GPU Node",
          host: "http://localhost:8081",
          capabilities: ["vision", "nlp"],
          description: "Nó local para processamento",
          active: true
        }];
      }
    } catch (error) {
      console.error('❌ Erro ao carregar agentes:', error.message);
      this.agents = [];
    }
  }

  // Iniciar servidor WebSocket para descoberta de agentes
  startDiscoveryServer() {
    try {
      this.discoveryServer = new WebSocket.Server({ port: CONFIG.discoveryPort });
      
      this.discoveryServer.on('connection', (ws) => {
        console.log('🔔 Nova conexão recebida');
        
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            
            // Processar diferentes tipos de mensagens
            switch (data.type) {
              case 'discovery':
                this.handleDiscovery(ws, data);
                break;
              case 'task':
                this.handleTaskRequest(ws, data);
                break;
              case 'result':
                this.handleTaskResult(data);
                break;
              case 'heartbeat':
                this.handleHeartbeat(data);
                break;
              default:
                console.warn(`⚠️ Tipo de mensagem desconhecido: ${data.type}`);
            }
          } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error.message);
          }
        });
        
        ws.on('close', () => {
          console.log('🔌 Conexão fechada');
          // Remover conexão da lista de ativos
          for (const [id, conn] of this.activeConnections.entries()) {
            if (conn.ws === ws) {
              this.activeConnections.delete(id);
              break;
            }
          }
        });
        
        // Enviar informações sobre esta instância
        ws.send(JSON.stringify({
          type: 'discovery',
          nodeId: this.nodeId,
          name: require('os').hostname(),
          capabilities: ['runes-analysis', 'summarization'],
          timestamp: Date.now()
        }));
      });
      
      console.log(`🌐 Servidor de descoberta iniciado na porta ${CONFIG.discoveryPort}`);
    } catch (error) {
      console.error('❌ Erro ao iniciar servidor de descoberta:', error.message);
    }
  }

  // Conectar aos agentes conhecidos
  async connectToAgents() {
    const activeAgents = this.agents.filter(agent => agent.active);
    console.log(`🔄 Conectando a ${activeAgents.length} agentes...`);
    
    const connectionPromises = activeAgents.map(agent => this.connectToAgent(agent));
    await Promise.allSettled(connectionPromises);
    
    console.log(`✅ Conectado a ${this.activeConnections.size} agentes`);
  }
  
  // Conectar a um agente específico via HTTP REST
  async connectToAgent(agent) {
    try {
      // Verificar status do agente via HTTP
      const response = await axios.get(`${agent.host}/status`, { timeout: 5000 });
      
      if (response.data && response.data.online) {
        console.log(`✅ Agente ${agent.name} está online`);
        this.activeConnections.set(agent.name, {
          agent,
          lastSeen: Date.now(),
          status: 'connected'
        });
        return true;
      } else {
        console.warn(`⚠️ Agente ${agent.name} está offline`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao conectar ao agente ${agent.name}:`, error.message);
      return false;
    }
  }
  
  // Iniciar monitoramento de agentes
  startHeartbeat() {
    setInterval(() => {
      this.checkAgentsHealth();
    }, CONFIG.heartbeatInterval);
  }
  
  // Verificar saúde dos agentes
  async checkAgentsHealth() {
    console.log(`🔄 Verificando saúde de ${this.activeConnections.size} agentes...`);
    
    for (const [name, connection] of this.activeConnections.entries()) {
      try {
        const response = await axios.get(`${connection.agent.host}/health`, { timeout: 3000 });
        
        if (response.data && response.data.status === 'healthy') {
          connection.lastSeen = Date.now();
          connection.status = 'healthy';
        } else {
          connection.status = 'degraded';
        }
      } catch (error) {
        console.warn(`⚠️ Agente ${name} não respondeu ao heartbeat`);
        connection.status = 'unreachable';
        
        // Se o agente estiver inacessível por mais de 2 intervalos, remover
        if (Date.now() - connection.lastSeen > CONFIG.heartbeatInterval * 2) {
          console.error(`❌ Removendo agente ${name} por inatividade`);
          this.activeConnections.delete(name);
        }
      }
    }
    
    // Exibir resumo
    console.log(`📊 Status da rede: ${this.activeConnections.size} agentes conectados`);
  }
  
  // Enviar tarefa para a mesh
  async submitTask(task) {
    if (!task.type || !task.data) {
      throw new Error('Tarefa inválida: type e data são obrigatórios');
    }
    
    console.log(`🔄 Submetendo tarefa do tipo '${task.type}'`);
    
    // Encontrar o melhor agente para esta tarefa
    const bestAgent = this.findBestAgentForTask(task);
    
    if (!bestAgent) {
      throw new Error('Nenhum agente disponível para processar esta tarefa');
    }
    
    // Registrar tarefa pendente
    const taskId = uuid.v4();
    this.pendingTasks.set(taskId, {
      ...task,
      id: taskId,
      agent: bestAgent.name,
      submitted: Date.now(),
      status: 'pending'
    });
    
    // Enviar tarefa para o agente
    try {
      const response = await axios.post(`${bestAgent.host}/task`, {
        taskId,
        task: task.type,
        priority: task.priority || 'normal',
        data: task.data
      }, { timeout: 10000 });
      
      // Atualizar status da tarefa
      const pendingTask = this.pendingTasks.get(taskId);
      if (pendingTask) {
        pendingTask.status = 'processing';
        pendingTask.startedAt = Date.now();
      }
      
      console.log(`✅ Tarefa ${taskId.substr(0, 8)} enviada para ${bestAgent.name}`);
      
      // Configurar timeout para a tarefa
      setTimeout(() => {
        const task = this.pendingTasks.get(taskId);
        if (task && task.status === 'processing') {
          console.warn(`⚠️ Tarefa ${taskId.substr(0, 8)} expirou`);
          task.status = 'timeout';
          // Poderíamos aqui reenviar para outro agente ou notificar o solicitante
        }
      }, CONFIG.taskTimeout);
      
      return {
        taskId,
        agent: bestAgent.name,
        status: 'accepted',
        message: response.data.message || 'Tarefa aceita para processamento'
      };
    } catch (error) {
      console.error(`❌ Erro ao enviar tarefa para ${bestAgent.name}:`, error.message);
      // Remover tarefa da lista de pendentes
      this.pendingTasks.delete(taskId);
      
      // Marcar agente como problemático
      const connection = this.activeConnections.get(bestAgent.name);
      if (connection) {
        connection.status = 'error';
        connection.lastError = Date.now();
      }
      
      throw new Error(`Falha ao enviar tarefa: ${error.message}`);
    }
  }
  
  // Encontrar o melhor agente para uma tarefa específica
  findBestAgentForTask(task) {
    const activeAgents = Array.from(this.activeConnections.values())
      .filter(conn => conn.status === 'connected' || conn.status === 'healthy')
      .map(conn => conn.agent);
    
    if (activeAgents.length === 0) {
      return null;
    }
    
    // Filtrar por capacidades, se especificado
    let candidates = activeAgents;
    if (task.capability) {
      candidates = candidates.filter(agent => 
        agent.capabilities && agent.capabilities.includes(task.capability)
      );
    }
    
    if (candidates.length === 0) {
      return null;
    }
    
    // Ordenar por prioridade (maior prioridade primeiro)
    candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    return candidates[0];
  }
  
  // Lidar com solicitação de descoberta
  handleDiscovery(ws, data) {
    console.log(`🔍 Descoberta recebida de: ${data.name || 'desconhecido'}`);
    
    // Responder com lista de agentes conhecidos
    ws.send(JSON.stringify({
      type: 'discovery_response',
      agents: this.agents.filter(a => a.active),
      timestamp: Date.now()
    }));
    
    // Adicionar novo agente se não estiver na lista
    if (data.nodeId && data.name && !this.activeConnections.has(data.nodeId)) {
      this.activeConnections.set(data.nodeId, {
        agent: {
          name: data.name,
          host: data.host || 'unknown',
          capabilities: data.capabilities || [],
          priority: 1
        },
        ws: ws,
        lastSeen: Date.now(),
        status: 'connected'
      });
      
      console.log(`✅ Novo agente adicionado: ${data.name}`);
    }
  }
  
  // Lidar com solicitação de tarefa
  handleTaskRequest(ws, data) {
    console.log(`🔄 Solicitação de tarefa recebida: ${data.type}`);
    
    // Aqui implementaríamos a lógica para processar a tarefa
    // ou repassá-la para outro agente mais adequado
    
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'result',
        taskId: data.taskId,
        status: 'completed',
        result: { message: 'Tarefa processada com sucesso!' },
        timestamp: Date.now()
      }));
    }, 1000);
  }
  
  // Lidar com resultado de tarefa
  handleTaskResult(data) {
    console.log(`✅ Resultado recebido para tarefa: ${data.taskId}`);
    
    // Verificar se é uma tarefa pendente
    const task = this.pendingTasks.get(data.taskId);
    if (task) {
      task.status = 'completed';
      task.result = data.result;
      task.completedAt = Date.now();
      
      // Notificar o solicitante (implementação dependeria da arquitetura do sistema)
      
      // Remover da lista de pendentes após algum tempo
      setTimeout(() => {
        this.pendingTasks.delete(data.taskId);
      }, 60000); // Manter por 1 minuto para consultas
    } else {
      console.warn(`⚠️ Resultado recebido para tarefa desconhecida: ${data.taskId}`);
    }
  }
  
  // Lidar com heartbeat
  handleHeartbeat(data) {
    if (data.nodeId && this.activeConnections.has(data.nodeId)) {
      const connection = this.activeConnections.get(data.nodeId);
      connection.lastSeen = Date.now();
      connection.status = data.status || 'connected';
    }
  }
  
  // Obter estatísticas da rede
  getNetworkStats() {
    const activeAgents = Array.from(this.activeConnections.values());
    const tasks = Array.from(this.pendingTasks.values());
    
    return {
      nodeId: this.nodeId,
      timestamp: Date.now(),
      agents: {
        total: this.agents.length,
        active: activeAgents.length,
        healthy: activeAgents.filter(a => a.status === 'healthy').length,
        degraded: activeAgents.filter(a => a.status === 'degraded').length,
        unreachable: activeAgents.filter(a => a.status === 'unreachable').length
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        processing: tasks.filter(t => t.status === 'processing').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed' || t.status === 'timeout').length
      },
      uptime: process.uptime()
    };
  }
}

// Exportar a classe
module.exports = GPUMeshNetwork;

// Se este arquivo for executado diretamente, iniciar a rede
if (require.main === module) {
  const network = new GPUMeshNetwork();
  network.init()
    .then(() => {
      console.log('🚀 Rede GPU Mesh inicializada no modo standalone');
      
      // Exemplo de como submeter uma tarefa após 5 segundos
      setTimeout(async () => {
        try {
          const result = await network.submitTask({
            type: 'runes-analysis',
            data: { query: 'Analyze token distribution for CYPH' },
            priority: 'high'
          });
          console.log('✅ Tarefa enviada:', result);
        } catch (error) {
          console.error('❌ Erro ao enviar tarefa:', error.message);
        }
      }, 5000);
      
      // A cada 30 segundos, mostrar estatísticas
      setInterval(() => {
        console.log('📊 Estatísticas da rede:', JSON.stringify(network.getNetworkStats(), null, 2));
      }, 30000);
    })
    .catch(err => {
      console.error('❌ Erro ao inicializar rede:', err);
    });
} 
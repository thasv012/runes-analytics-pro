/**
 * AwakenNet Mesh Network
 * 
 * Este componente gerencia a malha neural distribuída da rede AwakenNet,
 * permitindo que múltiplos nós se conectem e compartilhem recursos
 * de processamento e dados de análise.
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// Configurações
const PORT = process.env.PORT || 9000;
const CONFIG_PATH = path.join(__dirname, '..', 'agents.json');
const HEARTBEAT_INTERVAL = 10000; // 10 segundos
const TIMEOUT_INTERVAL = 30000; // 30 segundos

// Estado da rede
const networkState = {
  id: uuidv4(),
  name: 'AwakenNet Mesh',
  started_at: new Date().toISOString(),
  nodes: new Map(),
  metrics: {
    total_nodes: 0,
    active_nodes: 0,
    total_messages: 0,
    messages_per_second: 0,
    uptime: 0
  },
  message_history: [],
  topology: {
    nodes: [],
    links: []
  }
};

// Contador de mensagens
let messageCounter = 0;
let lastMessageCount = 0;

// Inicialização do Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'mesh/ui')));

// Cria servidor HTTP
const server = http.createServer(app);

// Inicializa WebSocket Server
const wss = new WebSocket.Server({ server });

/**
 * Carrega a configuração da rede a partir do arquivo
 */
function loadNetworkConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      
      if (config.network) {
        networkState.name = config.network.name || 'AwakenNet Mesh';
        networkState.protocol = config.network.protocol || 'v1';
        networkState.signature = config.network.signature || '⟁';
        
        console.log(`Configuração de rede carregada: ${networkState.name}`);
      }
      
      if (config.global_settings) {
        // Aplicar configurações globais
        // Por exemplo, poderíamos ajustar os intervalos com base na configuração
      }
      
      // Inicializa a topologia a partir dos agentes configurados
      if (config.agents) {
        networkState.topology.nodes = config.agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: 'offline', // Status inicial
          last_seen: null,
          capabilities: agent.capabilities || []
        }));
        
        console.log(`${networkState.topology.nodes.length} agentes carregados da configuração`);
      }
      
      // Inicializa as conexões a partir da configuração
      if (config.connections) {
        networkState.topology.links = config.connections.map(conn => ({
          source: conn.source,
          target: conn.target,
          type: conn.type || 'bidirectional',
          active: false, // Status inicial
          messages: 0
        }));
        
        console.log(`${networkState.topology.links.length} conexões carregadas da configuração`);
      }
      
      return config;
    }
    console.log('Arquivo de configuração não encontrado, usando valores padrão');
    return null;
  } catch (error) {
    console.error('Erro ao carregar configuração:', error.message);
    return null;
  }
}

/**
 * Atualiza as métricas da rede
 */
function updateNetworkMetrics() {
  const now = new Date();
  const uptime = Math.floor((now - new Date(networkState.started_at)) / 1000);
  
  // Conta nós ativos
  let activeNodes = 0;
  networkState.nodes.forEach(node => {
    if (node.status === 'online') {
      activeNodes++;
    }
  });
  
  // Calcula mensagens por segundo
  const messagesPerSecond = (messageCounter - lastMessageCount) / (HEARTBEAT_INTERVAL / 1000);
  lastMessageCount = messageCounter;
  
  // Atualiza métricas
  networkState.metrics = {
    total_nodes: networkState.nodes.size,
    active_nodes: activeNodes,
    total_messages: messageCounter,
    messages_per_second: messagesPerSecond.toFixed(2),
    uptime,
    last_updated: now.toISOString()
  };
  
  // Atualiza a topologia
  updateTopology();
  
  // Salva o estado periodicamente
  if (uptime % 60 === 0) {
    saveNetworkState();
  }
}

/**
 * Atualiza a topologia da rede
 */
function updateTopology() {
  // Atualiza status dos nós na topologia
  networkState.topology.nodes.forEach(node => {
    const liveNode = networkState.nodes.get(node.id);
    if (liveNode) {
      node.status = liveNode.status;
      node.last_seen = liveNode.last_seen;
    }
  });
  
  // Atualiza status das conexões
  networkState.topology.links.forEach(link => {
    const sourceNode = networkState.nodes.get(link.source);
    const targetNode = networkState.nodes.get(link.target);
    
    // Uma conexão está ativa se ambos os nós estiverem online
    link.active = sourceNode && targetNode && 
                  sourceNode.status === 'online' && 
                  targetNode.status === 'online';
  });
}

/**
 * Salva o estado atual da rede
 */
function saveNetworkState() {
  try {
    const statePath = path.join(__dirname, '..', 'logs', 'mesh-network-state.json');
    
    // Converte o Map para um objeto para salvar
    const nodesArray = Array.from(networkState.nodes.entries()).map(([id, node]) => ({
      id,
      ...node
    }));
    
    const stateToSave = {
      ...networkState,
      nodes: nodesArray
    };
    
    fs.writeFileSync(statePath, JSON.stringify(stateToSave, null, 2));
  } catch (error) {
    console.error('Erro ao salvar estado da rede:', error.message);
  }
}

/**
 * Processa mensagem recebida de um nó
 */
function processMessage(nodeId, message) {
  messageCounter++;
  
  // Se for um heartbeat, atualizamos o status
  if (message.type === 'heartbeat') {
    const node = networkState.nodes.get(nodeId);
    if (node) {
      node.last_seen = new Date().toISOString();
      node.metrics = message.metrics || node.metrics;
      return { type: 'heartbeat_ack', timestamp: new Date().toISOString() };
    }
  }
  
  // Registra a mensagem no histórico (limitando a 100 mensagens)
  const messageRecord = {
    id: `msg-${messageCounter}`,
    timestamp: new Date().toISOString(),
    source: nodeId,
    type: message.type,
    content: message.content || 'No content'
  };
  
  networkState.message_history.unshift(messageRecord);
  networkState.message_history = networkState.message_history.slice(0, 100);
  
  // Processa outros tipos de mensagens
  switch (message.type) {
    case 'register':
      return registerNode(nodeId, message.data);
    
    case 'task_result':
      return processTaskResult(nodeId, message.data);
    
    case 'status_update':
      return updateNodeStatus(nodeId, message.data);
    
    case 'broadcast':
      broadcastMessage(nodeId, message.data);
      return { type: 'broadcast_ack', received: true };
    
    default:
      return { type: 'unknown_message_type', error: 'Tipo de mensagem não reconhecido' };
  }
}

/**
 * Registra um nó na rede
 */
function registerNode(nodeId, data) {
  console.log(`Nó registrando-se: ${nodeId} (${data.name || 'Sem nome'})`);
  
  const node = {
    id: nodeId,
    name: data.name || `Node-${nodeId.substring(0, 8)}`,
    type: data.type || 'unknown',
    capabilities: data.capabilities || [],
    host: data.host || 'unknown',
    port: data.port || 0,
    status: 'online',
    registered_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    metrics: data.metrics || {}
  };
  
  // Adiciona ou atualiza o nó
  networkState.nodes.set(nodeId, node);
  
  // Verifica se precisa adicionar à topologia
  const existingNode = networkState.topology.nodes.find(n => n.id === nodeId);
  if (!existingNode) {
    networkState.topology.nodes.push({
      id: nodeId,
      name: node.name,
      type: node.type,
      status: 'online',
      last_seen: node.last_seen,
      capabilities: node.capabilities
    });
  }
  
  return {
    type: 'register_ack',
    node_id: nodeId,
    network_id: networkState.id,
    timestamp: new Date().toISOString(),
    network_name: networkState.name,
    total_nodes: networkState.nodes.size
  };
}

/**
 * Processa resultado de uma tarefa de um nó
 */
function processTaskResult(nodeId, data) {
  console.log(`Resultado de tarefa recebido de ${nodeId}: ${data.task_id}`);
  
  // Aqui poderíamos salvar os resultados em banco de dados
  // ou encaminhar para outros nós interessados
  
  return {
    type: 'task_result_ack',
    task_id: data.task_id,
    received: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Atualiza o status de um nó
 */
function updateNodeStatus(nodeId, data) {
  const node = networkState.nodes.get(nodeId);
  if (node) {
    node.status = data.status || node.status;
    node.metrics = data.metrics || node.metrics;
    node.last_seen = new Date().toISOString();
    
    console.log(`Status atualizado para nó ${nodeId}: ${node.status}`);
  }
  
  return {
    type: 'status_ack',
    received: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Envia uma mensagem para todos os outros nós (broadcast)
 */
function broadcastMessage(sourceNodeId, data) {
  console.log(`Broadcast de ${sourceNodeId}: ${data.subject || 'Sem assunto'}`);
  
  const message = {
    type: 'broadcast',
    source: sourceNodeId,
    timestamp: new Date().toISOString(),
    data
  };
  
  // Envia para todos os nós conectados, exceto o emissor
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.nodeId !== sourceNodeId) {
      client.send(JSON.stringify(message));
    }
  });
}

/**
 * Verifica o timeout dos nós e marca como offline se necessário
 */
function checkNodeTimeouts() {
  const now = new Date();
  
  networkState.nodes.forEach((node, nodeId) => {
    if (node.status === 'online') {
      const lastSeen = new Date(node.last_seen);
      const elapsed = now - lastSeen;
      
      if (elapsed > TIMEOUT_INTERVAL) {
        console.log(`Nó ${nodeId} (${node.name}) marcado como offline por timeout`);
        node.status = 'offline';
      }
    }
  });
}

/**
 * Envia heartbeat para todos os nós conectados
 */
function sendHeartbeats() {
  const message = {
    type: 'heartbeat',
    timestamp: new Date().toISOString(),
    network_id: networkState.id,
    metrics: networkState.metrics
  };
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Configuração do servidor WebSocket
wss.on('connection', (ws, req) => {
  // Gera ID para o cliente se não fornecido
  const nodeId = uuidv4();
  ws.nodeId = nodeId;
  
  console.log(`Nova conexão estabelecida: ${nodeId}`);
  
  // Envia mensagem de boas-vindas
  ws.send(JSON.stringify({
    type: 'welcome',
    message: `Bem-vindo à rede ${networkState.name}`,
    network_id: networkState.id,
    your_id: nodeId,
    timestamp: new Date().toISOString()
  }));
  
  // Manipulador de mensagens
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      // Se a mensagem especifica um ID de nó, usamos ele
      if (parsedMessage.node_id) {
        ws.nodeId = parsedMessage.node_id;
      }
      
      // Processa a mensagem e obtém a resposta
      const response = processMessage(ws.nodeId, parsedMessage);
      
      // Envia a resposta
      if (response) {
        ws.send(JSON.stringify(response));
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Erro ao processar mensagem: ' + error.message
      }));
    }
  });
  
  // Manipulador de fechamento de conexão
  ws.on('close', () => {
    console.log(`Conexão fechada: ${ws.nodeId}`);
    
    // Marca o nó como offline
    const node = networkState.nodes.get(ws.nodeId);
    if (node) {
      node.status = 'offline';
      node.disconnected_at = new Date().toISOString();
    }
  });
  
  // Manipulador de erros
  ws.on('error', (error) => {
    console.error(`Erro em conexão ${ws.nodeId}:`, error);
  });
  
  // Configura ping/pong para manter a conexão ativa
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Verifica conexões ativas periodicamente
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log(`Encerrando conexão não respondente: ${ws.nodeId}`);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping(() => {});
  });
}, HEARTBEAT_INTERVAL);

// Rotas da API REST

// Status da rede
app.get('/status', (req, res) => {
  res.json({
    id: networkState.id,
    name: networkState.name,
    metrics: networkState.metrics,
    total_nodes: networkState.nodes.size,
    active_nodes: Array.from(networkState.nodes.values()).filter(n => n.status === 'online').length
  });
});

// Lista de nós
app.get('/nodes', (req, res) => {
  // Converte o Map para um array
  const nodes = Array.from(networkState.nodes.entries()).map(([id, node]) => ({
    id,
    ...node
  }));
  
  res.json(nodes);
});

// Topologia da rede
app.get('/topology', (req, res) => {
  res.json(networkState.topology);
});

// Histórico de mensagens
app.get('/messages', (req, res) => {
  res.json(networkState.message_history);
});

// Informação sobre um nó específico
app.get('/nodes/:id', (req, res) => {
  const nodeId = req.params.id;
  const node = networkState.nodes.get(nodeId);
  
  if (node) {
    res.json({
      id: nodeId,
      ...node
    });
  } else {
    res.status(404).json({ error: 'Nó não encontrado' });
  }
});

// Enviar comando para um nó
app.post('/nodes/:id/command', (req, res) => {
  const nodeId = req.params.id;
  const node = networkState.nodes.get(nodeId);
  
  if (!node) {
    return res.status(404).json({ error: 'Nó não encontrado' });
  }
  
  if (node.status !== 'online') {
    return res.status(400).json({ error: 'Nó não está online' });
  }
  
  // Encontra o cliente WebSocket para este nó
  let targetClient = null;
  wss.clients.forEach(client => {
    if (client.nodeId === nodeId && client.readyState === WebSocket.OPEN) {
      targetClient = client;
    }
  });
  
  if (!targetClient) {
    return res.status(400).json({ error: 'Nó não está conectado via WebSocket' });
  }
  
  // Envia o comando
  const command = {
    type: 'command',
    timestamp: new Date().toISOString(),
    command: req.body.command,
    params: req.body.params
  };
  
  targetClient.send(JSON.stringify(command));
  
  res.json({ 
    message: 'Comando enviado',
    sent_to: nodeId,
    command: req.body.command
  });
});

// Envia broadcast para todos os nós
app.post('/broadcast', (req, res) => {
  if (!req.body || !req.body.message) {
    return res.status(400).json({ error: 'Mensagem não especificada' });
  }
  
  const broadcastData = {
    subject: req.body.subject || 'Broadcast do servidor',
    message: req.body.message,
    source: 'server',
    priority: req.body.priority || 'normal'
  };
  
  broadcastMessage('server', broadcastData);
  
  res.json({ 
    message: 'Broadcast enviado',
    sent_to: wss.clients.size,
    subject: broadcastData.subject
  });
});

// Página inicial (redireciona para o visualizador)
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Inicialização do sistema
async function initializeNetwork() {
  console.log('Inicializando AwakenNet Mesh Network...');
  
  // Carrega configuração
  loadNetworkConfig();
  
  // Configura atualização periódica de métricas
  setInterval(updateNetworkMetrics, HEARTBEAT_INTERVAL);
  
  // Configura verificação de timeout dos nós
  setInterval(checkNodeTimeouts, HEARTBEAT_INTERVAL);
  
  // Configura envio de heartbeats
  setInterval(sendHeartbeats, HEARTBEAT_INTERVAL);
  
  // Inicia o servidor HTTP
  server.listen(PORT, () => {
    console.log(`AwakenNet Mesh Network rodando em http://localhost:${PORT}`);
  });
}

// Inicia a rede
initializeNetwork().catch(error => {
  console.error('Erro fatal na inicialização da rede:', error);
  process.exit(1);
}); 
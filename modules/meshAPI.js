/**
 * RUNES Analytics Pro - Mesh API
 * 
 * Serviço para comunicação com a malha neural AwakenNet.
 * Gerencia conexões, busca status e dados de nós da malha.
 */

import { generateId } from './utils.js';

// Dados mock para desenvolvimento
const MOCK_NODES = [
  {
    id: 'node-local-001',
    name: 'Node Owl',
    gpu: 'NVIDIA RTX 4090 24GB',
    memory: 24,
    status: 'online',
    ping: 5,
    isLocal: true,
    tokens: 18450,
    uptime: '12d 15h 32m',
    ip: '192.168.1.100'
  },
  {
    id: 'node-remote-002',
    name: 'Runes Master',
    gpu: 'AMD Radeon RX 7900 XTX 24GB',
    memory: 24,
    status: 'online',
    ping: 45,
    tokens: 32850,
    uptime: '7d 8h 12m',
    ip: '185.65.32.101'
  },
  {
    id: 'node-remote-003',
    name: 'Bitcoin Mage',
    gpu: 'NVIDIA RTX 3090 Ti 24GB',
    memory: 24,
    status: 'offline',
    ping: 320,
    tokens: 9120,
    uptime: '0d 0h 0m',
    ip: '213.54.87.23',
    lastPerformance: 72
  },
  {
    id: 'node-remote-004',
    name: 'Rune Forge',
    gpu: 'NVIDIA A100 80GB',
    memory: 80,
    status: 'online',
    ping: 78,
    tokens: 56730,
    uptime: '45d 12h 8m',
    ip: '145.23.67.54'
  },
  {
    id: 'node-remote-005',
    name: 'Digital Alchemist',
    gpu: 'AMD Radeon Pro W6800 32GB',
    memory: 32,
    status: 'standby',
    ping: 110,
    tokens: 24680,
    uptime: '21d 5h 41m',
    ip: '78.45.21.98'
  },
  {
    id: 'node-remote-006',
    name: 'Ordinals Guardian',
    gpu: 'NVIDIA RTX 4080 16GB',
    memory: 16,
    status: 'online',
    ping: 62,
    tokens: 15240,
    uptime: '9d 18h 25m',
    ip: '198.76.54.32'
  },
  {
    id: 'node-remote-007',
    name: 'Satoshi Sentinel',
    gpu: 'AMD Radeon RX 6900 XT 16GB',
    memory: 16,
    status: 'online',
    ping: 86,
    tokens: 12850,
    uptime: '6d 22h 17m',
    ip: '156.34.78.91'
  },
  {
    id: 'node-remote-008',
    name: 'Crypto Nexus',
    gpu: 'NVIDIA RTX 3080 12GB',
    memory: 12,
    status: 'syncing',
    ping: 92,
    tokens: 8750,
    uptime: '2d 14h 50m',
    ip: '203.45.67.82'
  },
  {
    id: 'node-remote-009',
    name: 'Hash Oracle',
    gpu: 'NVIDIA Tesla V100 32GB',
    memory: 32,
    status: 'offline',
    ping: 250,
    tokens: 42180,
    uptime: '0d 0h 0m',
    ip: '94.61.28.73',
    lastPerformance: 88
  },
  {
    id: 'node-remote-010',
    name: 'Block Sorcerer',
    gpu: 'AMD Instinct MI250X 128GB',
    memory: 128,
    status: 'online',
    ping: 115,
    tokens: 87520,
    uptime: '32d 9h 14m',
    ip: '173.82.46.19'
  },
  {
    id: 'node-remote-011',
    name: 'Neural Chain',
    gpu: 'NVIDIA A40 48GB',
    memory: 48,
    status: 'online',
    ping: 74,
    tokens: 34980,
    uptime: '18d 20h 36m',
    ip: '128.53.91.64'
  },
  {
    id: 'node-remote-012',
    name: 'Quantum Miner',
    gpu: 'NVIDIA RTX 4090 24GB',
    memory: 24,
    status: 'standby',
    ping: 98,
    tokens: 19870,
    uptime: '15d 7h 28m',
    ip: '217.35.84.62'
  }
];

// Estado interno da API
let connectedNodes = [];
let lastFetchTime = null;
let pendingConnections = new Map();

/**
 * Busca o status atual de todos os nós na malha
 * @returns {Promise<Array>} - Lista de nós com seus status
 */
export async function fetchMeshStatus() {
  // Simulação de latência de rede
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
  
  lastFetchTime = new Date();
  
  // Simula alguma variação nos dados a cada chamada
  return MOCK_NODES.map(node => {
    const nodeCopy = { ...node };
    
    // Simula variações aleatórias no ping
    if (node.status !== 'offline') {
      const pingVariation = Math.floor(Math.random() * 20) - 10;
      nodeCopy.ping = Math.max(1, node.ping + pingVariation);
    }
    
    // Simula mudanças aleatórias de status ocasionalmente
    if (Math.random() < 0.05 && !node.isLocal) {
      const statuses = ['online', 'offline', 'syncing', 'standby'];
      const currentIndex = statuses.indexOf(node.status);
      const newIndex = (currentIndex + 1) % statuses.length;
      nodeCopy.status = statuses[newIndex];
      
      if (nodeCopy.status === 'offline') {
        nodeCopy.ping = 250 + Math.floor(Math.random() * 100);
        nodeCopy.uptime = '0d 0h 0m';
      } else if (nodeCopy.status === 'online' && node.status === 'offline') {
        nodeCopy.ping = 80 + Math.floor(Math.random() * 40);
        nodeCopy.uptime = '0d 0h 5m';
      }
    }
    
    // Adiciona a informação se o nó está conectado
    nodeCopy.isConnected = connectedNodes.includes(node.id);
    
    return nodeCopy;
  });
}

/**
 * Busca informações detalhadas sobre um nó específico
 * @param {String} nodeId - ID do nó
 * @returns {Promise<Object>} - Dados detalhados do nó
 */
export async function fetchNodeDetails(nodeId) {
  // Simulação de latência de rede
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 500));
  
  const node = MOCK_NODES.find(n => n.id === nodeId);
  
  if (!node) {
    throw new Error('Nó não encontrado');
  }
  
  // Adiciona informações detalhadas extras
  return {
    ...node,
    cpu: 'AMD Ryzen 9 7950X3D',
    os: 'Linux Ubuntu 22.04 LTS',
    storage: '2TB NVMe SSD',
    networkSpeed: '10 Gbps',
    lastActive: new Date().toISOString(),
    temperatureGPU: Math.floor(55 + Math.random() * 20),
    temperatureCPU: Math.floor(45 + Math.random() * 15),
    gpuUtilization: Math.floor(60 + Math.random() * 35),
    memoryUtilization: Math.floor(50 + Math.random() * 40),
    isConnected: connectedNodes.includes(nodeId)
  };
}

/**
 * Conecta a um nó da malha
 * @param {String} nodeId - ID do nó para conectar
 * @returns {Promise<Object>} - Resultado da conexão
 */
export async function connectToNode(nodeId) {
  // Verifica se já existe uma conexão pendente
  if (pendingConnections.has(nodeId)) {
    return pendingConnections.get(nodeId);
  }
  
  // Cria uma nova promessa para a conexão
  const connectionPromise = new Promise(async (resolve, reject) => {
    try {
      const node = MOCK_NODES.find(n => n.id === nodeId);
      
      if (!node) {
        throw new Error('Nó não encontrado');
      }
      
      if (node.status === 'offline') {
        throw new Error('Impossível conectar a um nó offline');
      }
      
      console.log(`Iniciando conexão com ${node.name}...`);
      
      // Simula o tempo de conexão
      const connectionTime = 1000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, connectionTime));
      
      // Simula chance de falha na conexão
      if (Math.random() < 0.1) {
        throw new Error('Timeout na conexão');
      }
      
      // Adiciona à lista de nós conectados
      if (!connectedNodes.includes(nodeId)) {
        connectedNodes.push(nodeId);
      }
      
      console.log(`Conexão estabelecida com ${node.name}`);
      
      // Retorna resultado da conexão
      resolve({
        success: true,
        nodeId,
        nodeName: node.name,
        timestamp: new Date().toISOString(),
        connectionId: generateId(12)
      });
    } catch (error) {
      console.error(`Erro na conexão com o nó ${nodeId}:`, error);
      reject(error);
    } finally {
      // Remove da lista de conexões pendentes
      pendingConnections.delete(nodeId);
    }
  });
  
  // Armazena a promessa de conexão
  pendingConnections.set(nodeId, connectionPromise);
  
  return connectionPromise;
}

/**
 * Desconecta de um nó da malha
 * @param {String} nodeId - ID do nó para desconectar
 * @returns {Promise<Object>} - Resultado da desconexão
 */
export async function disconnectFromNode(nodeId) {
  // Simula a latência de rede
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  
  const nodeIndex = connectedNodes.indexOf(nodeId);
  
  if (nodeIndex === -1) {
    return {
      success: false,
      message: 'Nó não está conectado'
    };
  }
  
  // Remove da lista de nós conectados
  connectedNodes.splice(nodeIndex, 1);
  
  return {
    success: true,
    nodeId,
    timestamp: new Date().toISOString(),
    message: 'Desconexão realizada com sucesso'
  };
}

/**
 * Busca estatísticas da malha inteira
 * @returns {Promise<Object>} - Estatísticas da malha
 */
export async function fetchMeshStats() {
  // Simulação de latência de rede
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 700));
  
  const nodes = await fetchMeshStatus();
  
  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const offlineNodes = nodes.filter(n => n.status === 'offline').length;
  const syncingNodes = nodes.filter(n => n.status === 'syncing').length;
  const standbyNodes = nodes.filter(n => n.status === 'standby').length;
  
  const totalGPUMemory = nodes.reduce((sum, node) => sum + (node.memory || 0), 0);
  const totalTokens = nodes.reduce((sum, node) => sum + (node.tokens || 0), 0);
  
  // Calcula uptime médio
  const uptimePattern = /(\d+)d\s+(\d+)h\s+(\d+)m/;
  let totalUptimeMinutes = 0;
  let nodesWithUptime = 0;
  
  nodes.forEach(node => {
    if (node.status !== 'offline' && node.uptime) {
      const match = node.uptime.match(uptimePattern);
      if (match) {
        const days = parseInt(match[1], 10);
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3], 10);
        
        const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
        totalUptimeMinutes += totalMinutes;
        nodesWithUptime++;
      }
    }
  });
  
  const averageUptimeMinutes = nodesWithUptime > 0 ? totalUptimeMinutes / nodesWithUptime : 0;
  const averageUptimeDays = averageUptimeMinutes / (24 * 60);
  
  return {
    timestamp: new Date().toISOString(),
    totalNodes,
    onlineNodes,
    offlineNodes,
    syncingNodes,
    standbyNodes,
    connectedNodes: connectedNodes.length,
    totalGPUMemory,
    totalTokens,
    averageUptimeDays,
    lastFetch: lastFetchTime
  };
}

// Exporta funções adicionais
export {
  connectedNodes,
  lastFetchTime
}; 
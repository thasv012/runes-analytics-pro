/**
 * Scripts para adicionar e simular nós GPU na rede Mesh
 * Integração com o sistema de visualização e notificações
 */

import { notifyOwl, notifyWarning, notifySuccess } from '../js/mesh-notify.js';

// IDs para os intervalos de atualização
let updateIntervalId = null;
let flowGenerationIntervalId = null;

/**
 * Gera e adiciona novos nós GPU à visualização
 * @param {number} count - Quantidade de nós a serem gerados
 * @returns {Array} Array com os novos nós adicionados
 */
export function simulateGpuNodes(count) {
  if (count > 20) {
    notifyWarning('Limite de nós excedido', { 
      requested: count, 
      max: 20, 
      message: 'Limitando a 20 nós para performance' 
    });
    count = 20;
  }
  
  const newNodes = [];
  const gpuTypes = ['RTX 4090', 'RTX 3080', 'Tesla V100', 'A100', 'Radeon Pro'];
  
  // Gera nós com IDs únicos e propriedades aleatórias
  for (let i = 0; i < count; i++) {
    const id = `node-${Math.random().toString(36).substring(2, 8)}`;
    const gpuModel = gpuTypes[Math.floor(Math.random() * gpuTypes.length)];
    
    const node = {
      id,
      type: 'gpu',
      label: `GPU ${gpuModel}`,
      gpuUsage: Math.floor(Math.random() * 60) + 10, // 10-70%
      temperature: Math.floor(Math.random() * 30) + 50, // 50-80°C
      memory: Math.floor(Math.random() * 70) + 20, // 20-90%
      latency: Math.floor(Math.random() * 50) + 5, // 5-55ms
      bandwidth: Math.floor(Math.random() * 500) + 500, // 500-1000MB/s
      status: Math.random() > 0.1 ? 'active' : 'warming',
      timestamp: new Date().toISOString(),
      icon: '🎮'
    };
    
    // Adiciona à lista de novos nós
    newNodes.push(node);
    
    // Dispara evento para notificar a adição do nó
    const event = new CustomEvent('gpu-mesh:new-node', {
      detail: node
    });
    
    window.dispatchEvent(event);
    console.log(`[GPU Mesh] Novo nó adicionado: ${id}`);
  }
  
  // Notifica o Owl sobre a adição de nós
  notifyOwl("Adição de novos nós GPU", { 
    totalAdicionados: count,
    nodes: newNodes.map(n => n.id)
  });
  
  // Inicia a atualização periódica se ainda não estiver rodando
  if (!updateIntervalId) {
    startGpuUpdates();
  }
  
  return newNodes;
}

/**
 * Inicia a atualização periódica dos dados dos nós GPU
 */
function startGpuUpdates() {
  // Limpa intervalos anteriores, se existirem
  if (updateIntervalId) {
    clearInterval(updateIntervalId);
  }
  
  if (flowGenerationIntervalId) {
    clearInterval(flowGenerationIntervalId);
  }
  
  // Atualiza os dados dos nós a cada 2 segundos
  updateIntervalId = setInterval(updateGpuNodesData, 2000);
  
  // Gera fluxos de dados entre nós a cada 3-5 segundos
  flowGenerationIntervalId = setInterval(generateRandomDataFlows, 3000 + Math.random() * 2000);
  
  notifySuccess('Simulação de nós GPU iniciada', {
    updateInterval: '2s',
    flowInterval: '3-5s'
  });
}

/**
 * Para a atualização periódica dos dados dos nós GPU
 */
export function stopGpuUpdates() {
  if (updateIntervalId) {
    clearInterval(updateIntervalId);
    updateIntervalId = null;
  }
  
  if (flowGenerationIntervalId) {
    clearInterval(flowGenerationIntervalId);
    flowGenerationIntervalId = null;
  }
  
  notifyOwl('Simulação de nós GPU interrompida');
}

/**
 * Atualiza os dados dos nós GPU com variações aleatórias
 */
function updateGpuNodesData() {
  // Obtém todos os nós atuais da visualização, se disponível
  let nodes = [];
  
  // Tenta acessar a instância do visualizador global, se existir
  if (window.gpuMeshVisualizer && window.gpuMeshVisualizer.nodes) {
    nodes = window.gpuMeshVisualizer.nodes;
  } else {
    // Caso contrário, ouve eventos para capturar nós
    document.querySelectorAll('[data-node-id]').forEach(el => {
      const nodeId = el.getAttribute('data-node-id');
      if (nodeId && nodeId.startsWith('node-')) {
        nodes.push({
          id: nodeId,
          el: el
        });
      }
    });
  }
  
  // Se não temos nós, não precisamos continuar
  if (nodes.length === 0) {
    return;
  }
  
  // Atualiza cada nó com variações aleatórias
  nodes.forEach(node => {
    if (node.type === 'gpu' || node.id.startsWith('node-')) {
      // Cria uma variação aleatória entre -10 e +10 pontos percentuais
      const usageVariation = Math.floor(Math.random() * 20) - 10;
      const tempVariation = Math.floor(Math.random() * 6) - 3;
      const memoryVariation = Math.floor(Math.random() * 14) - 7;
      
      // Atualiza com limites para garantir valores realistas
      node.gpuUsage = Math.max(5, Math.min(99, (node.gpuUsage || 50) + usageVariation));
      node.temperature = Math.max(40, Math.min(95, (node.temperature || 65) + tempVariation));
      node.memory = Math.max(10, Math.min(98, (node.memory || 50) + memoryVariation));
      
      // Atualiza também latência e largura de banda ocasionalmente
      if (Math.random() > 0.7) {
        node.latency = Math.max(1, Math.min(100, (node.latency || 20) + (Math.floor(Math.random() * 10) - 5)));
        node.bandwidth = Math.max(100, (node.bandwidth || 800) + (Math.floor(Math.random() * 200) - 100));
      }
      
      // Verifica condições críticas (alta temperatura, alta utilização)
      checkCriticalConditions(node);
      
      // Dispara evento de atualização
      const updateEvent = new CustomEvent('gpu-mesh:update-node', {
        detail: node
      });
      
      window.dispatchEvent(updateEvent);
    }
  });
}

/**
 * Verifica condições críticas nos nós GPU e notifica quando necessário
 * @param {Object} node - Nó a ser verificado
 */
function checkCriticalConditions(node) {
  // Verifica temperatura alta (acima de 85°C)
  if (node.temperature > 85) {
    const event = new CustomEvent('gpu-mesh:critical-event', {
      detail: {
        type: 'high-temperature',
        message: `Nó ${node.id} com temperatura crítica: ${node.temperature}°C`,
        data: {
          nodeId: node.id,
          temperature: node.temperature,
          threshold: 85
        }
      }
    });
    
    window.dispatchEvent(event);
  }
  
  // Verifica uso muito alto de GPU (acima de 95%)
  if (node.gpuUsage > 95) {
    const event = new CustomEvent('gpu-mesh:critical-event', {
      detail: {
        type: 'high-usage',
        message: `Nó ${node.id} com uso crítico: ${node.gpuUsage}%`,
        data: {
          nodeId: node.id,
          usage: node.gpuUsage,
          threshold: 95
        }
      }
    });
    
    window.dispatchEvent(event);
  }
  
  // Simula falhas ocasionais em nós com alta carga
  if (node.temperature > 90 && node.gpuUsage > 90 && Math.random() > 0.9) {
    node.status = 'error';
    
    const event = new CustomEvent('gpu-mesh:critical-event', {
      detail: {
        type: 'node-failure',
        message: `Nó ${node.id} falhou devido à sobrecarga`,
        data: {
          nodeId: node.id,
          temperature: node.temperature,
          usage: node.gpuUsage,
          previousStatus: 'active'
        }
      }
    });
    
    window.dispatchEvent(event);
  }
}

/**
 * Gera fluxos de dados aleatórios entre nós
 */
function generateRandomDataFlows() {
  // Obtém todos os nós atuais, similar ao updateGpuNodesData
  let nodes = [];
  
  if (window.gpuMeshVisualizer && window.gpuMeshVisualizer.nodes) {
    nodes = window.gpuMeshVisualizer.nodes;
  } else {
    document.querySelectorAll('[data-node-id]').forEach(el => {
      const nodeId = el.getAttribute('data-node-id');
      if (nodeId && nodeId.startsWith('node-')) {
        nodes.push({
          id: nodeId,
          el: el
        });
      }
    });
  }
  
  // Se temos menos de 2 nós, não podemos gerar fluxos
  if (nodes.length < 2) {
    return;
  }
  
  // Seleciona dois nós aleatórios diferentes para o fluxo
  const nodeIndex1 = Math.floor(Math.random() * nodes.length);
  let nodeIndex2 = Math.floor(Math.random() * nodes.length);
  // Garante que são diferentes
  while (nodeIndex2 === nodeIndex1) {
    nodeIndex2 = Math.floor(Math.random() * nodes.length);
  }
  
  const sourceNode = nodes[nodeIndex1];
  const targetNode = nodes[nodeIndex2];
  
  // Cria o objeto de fluxo
  const flow = {
    id: `flow-${Math.random().toString(36).substring(2, 8)}`,
    source: sourceNode.id,
    target: targetNode.id,
    size: Math.floor(Math.random() * 100) + 10, // 10-110 MB
    duration: Math.floor(Math.random() * 2000) + 500, // 500-2500ms
    color: Math.random() > 0.5 ? '#6b57ff' : '#10b981'
  };
  
  // Dispara evento de fluxo de dados
  const flowEvent = new CustomEvent('gpu-mesh:data-flow', {
    detail: flow
  });
  
  window.dispatchEvent(flowEvent);
}

/**
 * Expõe as funções principais para o escopo global
 */
window.simulateGpuNodes = simulateGpuNodes;
window.stopGpuSimulation = stopGpuUpdates;

// Exporta as funções para uso em outros módulos
export default {
  simulateGpuNodes,
  stopGpuUpdates
};

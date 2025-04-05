/**
 * RUNES Analytics Pro - Sistema de Sincronização entre Workspaces
 * 
 * Este módulo implementa um mecanismo de comunicação entre diferentes
 * instâncias do RUNES Analytics Pro usando localStorage para transmissão
 * e recepção de sinais de sincronização.
 */

// Importa as funções de tradução se disponíveis
import { t } from './i18n.js';

/**
 * Traduz um texto usando o sistema i18n ou retorna o original
 * Wrapper de segurança caso i18n não esteja disponível
 * @param {string} key - Chave de tradução
 * @returns {string} - Texto traduzido ou o original
 */
function translate(key) {
  // Se a função t() existir, usa ela, caso contrário retorna a chave
  return (typeof t === 'function') ? t(key) : key;
}

/**
 * Envia um sinal de despertar para todos os contextos ouvintes
 * usando localStorage como canal de comunicação
 */
function awakenBroadcast() {
  const timestamp = Date.now();
  const nodeInfo = getNodeInfo();
  
  // Envia o sinal via localStorage
  localStorage.setItem("awaken::sync", JSON.stringify({ 
    timestamp,
    source: nodeInfo.id,
    nodeName: nodeInfo.name
  }));

  console.log(`🧠 Awaken Broadcast 🔁 Enviado às ${new Date(timestamp).toLocaleTimeString()}`);
  
  // Atualiza o status de renderização local
  renderMeshPanel();
}

/**
 * Configura um ouvinte para sinais de despertar
 * @param {Function} callback - Função a ser executada quando um sinal é recebido
 */
function awakenListen(callback) {
  window.addEventListener("storage", (event) => {
    if (event.key === "awaken::sync") {
      const payload = JSON.parse(event.newValue);
      console.log(`⚡ Awaken Signal recebido de ${payload.nodeName || 'outro workspace'} @ ${new Date(payload.timestamp).toLocaleTimeString()}`);
      
      // Notifica o badge de status
      updateSyncStatus(payload);
      
      // Executa o callback fornecido
      if (typeof callback === 'function') {
        callback(payload);
      }
    }
  });
  
  console.log("🔌 Listener de sincronização ativado");
}

/**
 * Obtém informações sobre o node local
 * @returns {Object} Informações do node
 */
function getNodeInfo() {
  // Gera um ID único para esta instância se ainda não existir
  if (!localStorage.getItem("node::id")) {
    localStorage.setItem("node::id", generateNodeId());
  }
  
  // Usa o nome configurado ou gera um novo
  const nodeName = localStorage.getItem("node::name") || getDefaultNodeName();
  
  return {
    id: localStorage.getItem("node::id"),
    name: nodeName,
    gpuInfo: detectGpuInfo(),
    lastActive: Date.now()
  };
}

/**
 * Gera um ID único para o node
 * @returns {String} ID do node
 */
function generateNodeId() {
  return 'node_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Gera um nome padrão para o node baseado em características do sistema
 * @returns {String} Nome do node
 */
function getDefaultNodeName() {
  const prefixes = ["Owl", "Hawk", "Eagle", "Falcon", "Raven"];
  const suffixes = ["Station", "Node", "Point", "Hub", "Terminal"];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}${suffix}`;
}

/**
 * Tenta detectar informações sobre a GPU do sistema
 * @returns {String} Informação da GPU ou string padrão
 */
function detectGpuInfo() {
  // Lógica básica para tentar detectar GPU via API WebGL
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return translate("gpu_unknown");
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    
    return "GPU WebGL";
  } catch (e) {
    console.warn("Não foi possível detectar informações da GPU", e);
    return translate("gpu_unknown");
  }
}

/**
 * Atualiza o status de sincronização na interface
 * @param {Object} syncData - Dados recebidos do sinal de sincronização
 */
function updateSyncStatus(syncData) {
  let statusBadge = document.getElementById('sync-status-badge');
  
  if (!statusBadge) {
    statusBadge = document.createElement('div');
    statusBadge.id = 'sync-status-badge';
    statusBadge.style.position = 'fixed';
    statusBadge.style.bottom = '10px';
    statusBadge.style.left = '10px';
    statusBadge.style.padding = '8px 12px';
    statusBadge.style.background = 'rgba(0, 0, 0, 0.7)';
    statusBadge.style.color = '#00ffcc';
    statusBadge.style.borderRadius = '4px';
    statusBadge.style.fontFamily = 'monospace';
    statusBadge.style.fontSize = '12px';
    statusBadge.style.zIndex = '9999';
    document.body.appendChild(statusBadge);
  }
  
  const nodeInfo = getNodeInfo();
  const timeStr = new Date().toLocaleTimeString();
  
  statusBadge.innerHTML = `🧠 ${translate("badge.localNode")}: ${nodeInfo.name} | ${nodeInfo.gpuInfo} | ${translate("status.awake")} ✅ <br>
                           <span style="font-size:10px">${translate("synchronizing")}: ${timeStr} | ID: ${nodeInfo.id.substring(0, 8)}</span>`;
  
  // Efeito visual de pulso
  statusBadge.style.animation = 'pulse 1s';
  setTimeout(() => {
    statusBadge.style.animation = '';
  }, 1000);
  
  // Adiciona o estilo de animação se ainda não existir
  if (!document.getElementById('sync-animations')) {
    const style = document.createElement('style');
    style.id = 'sync-animations';
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(0, 255, 204, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Função temporária para renderização de painel
 * Esta função deve ser substituída pela implementação real
 */
function renderMeshPanel() {
  console.log("📊 Renderizando painel de mesh (implementação pendente)");
  // Aqui entraria a lógica real de renderização do painel
}

/**
 * Cria e adiciona o botão de sincronização à interface
 */
function createSyncButton() {
  const syncButton = document.createElement("button");
  syncButton.textContent = translate("button.sync");
  syncButton.style.position = "fixed";
  syncButton.style.top = "10px";
  syncButton.style.right = "10px";
  syncButton.style.zIndex = 9999;
  syncButton.style.padding = "8px 12px";
  syncButton.style.background = "#0ff";
  syncButton.style.border = "none";
  syncButton.style.borderRadius = "8px";
  syncButton.style.color = "#000";
  syncButton.style.fontWeight = "bold";
  syncButton.style.cursor = "pointer";
  syncButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  syncButton.className = "sync-button";
  syncButton.onclick = awakenBroadcast;
  
  // Efeito de hover
  syncButton.onmouseover = () => {
    syncButton.style.background = "#00e6e6";
  };
  syncButton.onmouseout = () => {
    syncButton.style.background = "#0ff";
  };

  document.body.appendChild(syncButton);
  return syncButton;
}

/**
 * Cria e adiciona um botão de sincronização ao container específico
 * @param {HTMLElement} container - O container onde o botão será inserido
 */
function addSyncButtonToContainer(container) {
  if (!container) return;
  
  const syncButton = document.createElement("button");
  syncButton.textContent = translate("button.sync");
  syncButton.className = "sync-button";
  syncButton.style.padding = "8px 12px";
  syncButton.style.background = "#0088ff";
  syncButton.style.color = "white";
  syncButton.style.border = "none";
  syncButton.style.borderRadius = "4px";
  syncButton.style.margin = "10px 0";
  syncButton.style.cursor = "pointer";
  syncButton.style.fontWeight = "bold";
  syncButton.style.transition = "background 0.2s ease";
  
  // Efeito de hover
  syncButton.onmouseover = () => {
    syncButton.style.background = "#0066cc";
  };
  syncButton.onmouseout = () => {
    syncButton.style.background = "#0088ff";
  };
  
  syncButton.onclick = () => {
    awakenBroadcast();
    renderMeshPanel();
  };
  
  // Insere o botão antes do container
  container.parentElement.insertBefore(syncButton, container);
  
  return syncButton;
}

/**
 * Renderiza um badge com informações do node local
 * @param {Object} localNode - Informações do node local
 */
function renderLocalNodeBadge(localNode) {
  // Se não temos informações do node, obtém elas
  if (!localNode) {
    localNode = getNodeInfo();
  }
  
  // Verifica se o badge já existe
  let badge = document.getElementById('local-node-badge');
  
  if (!badge) {
    badge = document.createElement("div");
    badge.id = 'local-node-badge';
    badge.className = "local-node-badge";
    badge.style.position = 'fixed';
    badge.style.top = '10px';
    badge.style.left = '10px';
    badge.style.padding = '6px 10px';
    badge.style.backgroundColor = 'rgba(0, 32, 64, 0.85)';
    badge.style.color = '#4dffff';
    badge.style.borderRadius = '4px';
    badge.style.fontFamily = 'monospace';
    badge.style.fontSize = '12px';
    badge.style.zIndex = '9996';
    badge.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    document.body.appendChild(badge);
  }
  
  badge.innerHTML = `
    ⟁ ${translate("badge.localNode")}: <strong>${localNode.name}</strong> | 
    ${translate("badge.status")}: <span style="color: #4dff4d;">✓</span> | 
    GPU: ${localNode.gpuInfo}
  `;
  
  return badge;
}

/**
 * Cria um painel visual para visualizar a rede de nodes
 * @param {Array} nodes - Lista de nodes para renderizar
 */
function createGpuNetworkPanel(nodes) {
  // Se não recebemos nodes, usamos pelo menos o node local
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    const localNode = getNodeInfo();
    nodes = [{
      id: localNode.id,
      name: localNode.name,
      gpu: localNode.gpuInfo,
      status: 'online',
      ping: 0,
      karma: 100,
      sigils: []
    }];
  }

  // Criar container para o painel de rede
  const netPanel = document.getElementById('mesh-network-panel') || document.createElement('div');
  if (!netPanel.id) {
    netPanel.id = 'mesh-network-panel';
    netPanel.style.position = 'fixed';
    netPanel.style.bottom = '50px';
    netPanel.style.right = '10px';
    netPanel.style.width = '320px';
    netPanel.style.maxHeight = '80vh';
    netPanel.style.overflow = 'auto';
    netPanel.style.backgroundColor = 'rgba(20, 20, 40, 0.85)';
    netPanel.style.borderRadius = '8px';
    netPanel.style.padding = '15px';
    netPanel.style.color = '#e6f2ff';
    netPanel.style.fontFamily = 'monospace';
    netPanel.style.fontSize = '14px';
    netPanel.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    netPanel.style.zIndex = '9998';
    netPanel.style.backdropFilter = 'blur(10px)';
    document.body.appendChild(netPanel);
  }

  // Título do painel
  netPanel.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; font-size: 16px;">🔮 ${translate("nodes")} (${nodes.length})</h3>
      <button id="close-network-panel" style="background: none; border: none; color: #a0a0c0; cursor: pointer;">
        <span style="font-size: 16px;">×</span>
      </button>
    </div>
    <button id="awaken-button" style="width: 100%; margin-bottom: 15px; padding: 8px; background: linear-gradient(135deg, #0a2463, #3e92cc); border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">⟁ Despertar com Cursor</button>
    <div id="nodes-container"></div>
  `;

  // Adicionar cada node
  const nodesContainer = document.getElementById('nodes-container');
  nodes.forEach(node => {
    const nodeCard = createNodeCard(node);
    nodesContainer.appendChild(nodeCard);
  });

  // Adiciona resumo da rede
  const onlineNodes = nodes.filter(node => node.status.toLowerCase() === 'online').length;
  const totalKarma = nodes.reduce((sum, node) => sum + (node.karma || 0), 0);
  const totalSigils = nodes.reduce((sum, node) => sum + (node.sigils ? node.sigils.length : 0), 0);
  
  const networkSummary = document.createElement('div');
  networkSummary.style.marginTop = '20px';
  networkSummary.style.padding = '10px';
  networkSummary.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
  networkSummary.innerHTML = `
    <h4 style="margin: 0 0 10px 0; font-size: 14px;">${translate("network_summary")}</h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
      <div>
        <p style="margin: 0;">${translate("active_nodes")}: <span style="color: #4cd964; font-weight: bold;">${onlineNodes}/${nodes.length}</span></p>
        <p style="margin: 0;">${translate("total_karma")}: <span style="color: #ffcc00; font-weight: bold;">${totalKarma}</span></p>
      </div>
      <div>
        <p style="margin: 0;">${translate("total_sigils")}: <span class="sigil-count">${totalSigils}</span></p>
        <p style="margin: 0;">${translate("last_sync")}: <span style="color: #aaccff;">${new Date().toLocaleTimeString()}</span></p>
      </div>
    </div>
  `;
  
  nodesContainer.appendChild(networkSummary);
  
  // Adicionar estilos para a animação dos sigilos
  const style = document.createElement('style');
  style.textContent = `
    .sigil-count {
      color: #00ffff;
      font-weight: bold;
      animation: glow 2s ease-in-out infinite;
    }
    
    @keyframes glow {
      0%, 100% { text-shadow: 0 0 5px #0ff, 0 0 10px #0ff; }
      50% { text-shadow: 0 0 15px #0ff, 0 0 30px #0ff; }
    }
  `;
  document.head.appendChild(style);
  
  // Botão de fechar o painel
  document.getElementById('close-network-panel').addEventListener('click', () => {
    netPanel.remove();
  });
  
  // Botão Despertar com Cursor
  document.getElementById('awaken-button').addEventListener('click', () => {
    window.open("cursor://run/gpt-job?mode=awaken", "_blank");
  });

  return netPanel;
}

/**
 * Cria um card para representar um node na rede
 * @param {Object} node - Informações sobre o node
 * @returns {HTMLElement} - Elemento do card
 */
function createNodeCard(node) {
  const card = document.createElement("div");
  card.className = "node-card";
  card.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
  card.style.borderRadius = '6px';
  card.style.padding = '10px';
  card.style.marginBottom = '10px';
  card.style.borderLeft = node.status.toLowerCase() === 'online' 
                           ? '3px solid #4cd964' 
                           : '3px solid #ff3b30';

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="margin: 0; font-size: 14px;">${node.name} [${node.gpu}]</h3>
      <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background-color: ${
        node.status.toLowerCase() === 'online' ? 'rgba(76, 217, 100, 0.2)' : 'rgba(255, 59, 48, 0.2)'
      }; color: ${
        node.status.toLowerCase() === 'online' ? '#4cd964' : '#ff3b30'
      };">${translate(`status.${node.status.toLowerCase()}`)}</span>
    </div>
    <div style="font-size: 13px; color: #a0a0c0;">
      <p>${translate("label.ping")}: ${node.ping}ms</p>
      <p>${translate("label.karma")}: ${node.karma}</p>
      <p>${translate("label.sigils")}: <span class="sigil-count">${node.sigils.length}</span></p>
    </div>
  `;
  return card;
}

// Cria o badge de status ao carregar o script
document.addEventListener('DOMContentLoaded', () => {
  // Inicia o ouvinte de sincronização
  awakenListen(() => {
    renderMeshPanel();
  });
  
  // Cria o botão de sincronização
  createSyncButton();
  
  // Inicializa o badge de status
  const nodeInfo = getNodeInfo();
  updateSyncStatus({
    timestamp: Date.now(),
    source: nodeInfo.id,
    nodeName: nodeInfo.name
  });
  
  // Renderiza o badge do node local
  renderLocalNodeBadge(nodeInfo);
  
  // Adicionar botão para visualizar a rede
  const viewNetworkBtn = document.createElement('button');
  viewNetworkBtn.textContent = '🔮 ' + translate("view_network");
  viewNetworkBtn.style.position = 'fixed';
  viewNetworkBtn.style.bottom = '10px';
  viewNetworkBtn.style.right = '10px';
  viewNetworkBtn.style.zIndex = '9997';
  viewNetworkBtn.style.padding = '6px 10px';
  viewNetworkBtn.style.backgroundColor = 'rgba(83, 82, 237, 0.8)';
  viewNetworkBtn.style.border = 'none';
  viewNetworkBtn.style.borderRadius = '6px';
  viewNetworkBtn.style.color = 'white';
  viewNetworkBtn.style.fontSize = '12px';
  viewNetworkBtn.style.cursor = 'pointer';
  
  viewNetworkBtn.onclick = () => {
    // Exemplo de lista de nodes para demonstração
    const demoNodes = [
      {
        id: nodeInfo.id,
        name: nodeInfo.name,
        gpu: nodeInfo.gpuInfo,
        status: 'online',
        ping: 0,
        karma: 100,
        sigils: Array(3).fill(1) // 3 sigilos
      },
      {
        id: 'node_external1',
        name: 'RavenHub',
        gpu: 'NVIDIA RTX 3080',
        status: 'online',
        ping: 35,
        karma: 87,
        sigils: Array(12).fill(1) // 12 sigilos
      },
      {
        id: 'node_external2',
        name: 'FalconPoint',
        gpu: 'AMD Radeon RX 6800',
        status: 'offline',
        ping: 120,
        karma: 45,
        sigils: Array(6).fill(1) // 6 sigilos
      },
      {
        id: 'node_external3',
        name: 'EagleNode',
        gpu: 'Apple M2 Pro',
        status: 'online',
        ping: 28,
        karma: 92,
        sigils: Array(8).fill(1) // 8 sigilos
      }
    ];
    
    createGpuNetworkPanel(demoNodes);
  };
  
  document.body.appendChild(viewNetworkBtn);
  
  // Tenta encontrar conteineres compatíveis e adiciona botões de sincronização
  setTimeout(() => {
    // Tenta identificar containers comuns em páginas
    const mainContainers = [
      document.querySelector('.dashboard-container'),
      document.querySelector('.main-content'),
      document.querySelector('.app-container'),
      document.querySelector('main'),
      document.querySelector('#app')
    ].filter(el => el !== null);
    
    // Adiciona botões aos containers encontrados
    mainContainers.forEach(container => {
      addSyncButtonToContainer(container);
    });
  }, 1000); // Pequeno delay para garantir que a página foi carregada
  
  console.log("🚀 Sistema de sincronização inicializado");
});

// Exporta as funções para uso global e em módulos
if (typeof window !== 'undefined') {
  window.awakenBroadcast = awakenBroadcast;
  window.awakenListen = awakenListen;
  window.renderMeshPanel = renderMeshPanel;
  window.createGpuNetworkPanel = createGpuNetworkPanel;
  window.renderLocalNodeBadge = renderLocalNodeBadge;
  window.addSyncButtonToContainer = addSyncButtonToContainer;
}

export {
  awakenBroadcast,
  awakenListen,
  renderMeshPanel,
  getNodeInfo,
  createGpuNetworkPanel,
  renderLocalNodeBadge,
  addSyncButtonToContainer
};
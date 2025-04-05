/**
 * RUNES Analytics Pro - GPU Panel Visual
 * 
 * Painel visual interativo que exibe métricas de processamento neural,
 * informações de GPUs e estatísticas de nós na malha AwakenNet.
 */

import { initializeIndexedDB, getKarmaForNode, getSigilsForNode } from "./modules/karmaSigils.js";
import { fetchMeshStatus, connectToNode } from "./modules/meshAPI.js";
import { translate } from "./modules/i18n.js";
import { formatNumber, calculatePerformanceScore } from "./modules/utils.js";

// ==============================
// AwakenNet Live Mesh Panel UI
// ==============================

// Este painel é integrado ao RUNES Analytics Pro.
// Exibe os nós ativos, GPUs, status, karma, e sigilos desbloqueados.

// Configuração
const CONFIG = {
  refreshInterval: 15000, // 15 segundos
  maxDisplayedNodes: 10,
  cardAnimationDelay: 120,
  performanceThresholds: {
    low: 35,
    medium: 70,
    high: 90
  }
};

// Elementos DOM
const container = document.getElementById("mesh-panel");
const localNodeBadge = document.getElementById("local-node-info");
const syncButton = document.getElementById("sync-button");
const viewButton = document.getElementById("view-network-button");
const statsContainer = document.getElementById("network-stats");
const performanceChart = document.getElementById("performance-chart");

// Estado
let meshData = {
  nodes: [],
  totalPerformance: 0,
  activeNodes: 0,
  lastUpdated: null
};

let chartInstance = null;

/**
 * Cria um cartão visual para um nó GPU na malha
 * @param {Object} node - Dados do nó
 * @param {Number} index - Índice para animação sequencial
 * @returns {HTMLElement} Elemento do cartão
 */
function createNodeCard(node, index) {
  const card = document.createElement("div");
  card.className = `node-card ${node.status.toLowerCase()}`;
  card.style.animationDelay = `${index * CONFIG.cardAnimationDelay}ms`;
  
  // Calcula métricas de desempenho
  const performanceScore = calculatePerformanceScore(node);
  const performanceClass = getPerformanceClass(performanceScore);
  
  // Formata a lista de sigilos
  const sigilsList = node.sigils.map(sigil => 
    `<span class="sigil-badge" title="${sigil.name}">${sigil.symbol}</span>`
  ).join('');
  
  // Determina ícone de GPU
  const gpuVendor = node.gpu.toLowerCase().includes('nvidia') ? 'nvidia' : 
                   node.gpu.toLowerCase().includes('amd') ? 'amd' : 'generic';
  
  // Formata o ping
  const pingFormatted = node.ping < 100 ? 
    `<span class="ping good">${node.ping}ms</span>` : 
    `<span class="ping poor">${node.ping}ms</span>`;

  card.innerHTML = `
    <div class="node-header">
      <div class="node-title">
        <span class="gpu-icon ${gpuVendor}"></span>
        <h3>${node.name}</h3>
        ${node.isLocal ? '<span class="local-badge">LOCAL</span>' : ''}
      </div>
      <span class="status ${node.status.toLowerCase()}">${translate(node.status.toLowerCase())}</span>
    </div>
    
    <div class="gpu-info">
      <span class="gpu-model">${node.gpu}</span>
      <span class="gpu-memory">${node.memory}GB</span>
    </div>
    
    <div class="performance-bar">
      <div class="performance-fill ${performanceClass}" style="width: ${performanceScore}%"></div>
      <span class="performance-text">${performanceScore}%</span>
    </div>
    
    <div class="node-body">
      <div class="node-stats">
        <div class="stat-item">
          <span class="stat-label">${translate("ping")}</span>
          ${pingFormatted}
        </div>
        <div class="stat-item">
          <span class="stat-label">${translate("karma")}</span>
          <span class="karma-value">${formatNumber(node.karma)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">${translate("tokens")}</span>
          <span class="tokens-value">${formatNumber(node.tokens || 0)}</span>
        </div>
      </div>
      
      <div class="node-sigils">
        ${sigilsList}
        ${node.sigils.length === 0 ? '<span class="no-sigils">'+translate("no_sigils")+'</span>' : ''}
      </div>
    </div>
    
    <div class="node-actions">
      <button class="connect-btn" data-node-id="${node.id}">${translate("connect")}</button>
      <button class="details-btn" data-node-id="${node.id}">${translate("details")}</button>
    </div>
  `;
  
  // Adiciona ouvintes de eventos
  setTimeout(() => {
    const connectBtn = card.querySelector('.connect-btn');
    const detailsBtn = card.querySelector('.details-btn');
    
    connectBtn.addEventListener('click', () => handleNodeConnect(node.id));
    detailsBtn.addEventListener('click', () => showNodeDetails(node.id));
  }, 0);
  
  return card;
}

/**
 * Determina a classe de desempenho com base na pontuação
 * @param {Number} score - Pontuação de desempenho
 * @returns {String} Classe CSS
 */
function getPerformanceClass(score) {
  if (score >= CONFIG.performanceThresholds.high) return 'high';
  if (score >= CONFIG.performanceThresholds.medium) return 'medium';
  return 'low';
}

/**
 * Atualiza o distintivo do nó local
 * @param {Object} localNode - Dados do nó local
 */
function updateLocalNodeBadge(localNode) {
  if (!localNode) {
    localNodeBadge.innerHTML = `<span class="no-local">${translate("no_local_node")}</span>`;
    localNodeBadge.classList.add('offline');
    return;
  }
  
  const statusClass = localNode.status.toLowerCase();
  localNodeBadge.className = statusClass;
  
  const performanceScore = calculatePerformanceScore(localNode);
  
  localNodeBadge.innerHTML = `
    <div class="local-badge-content">
      <span class="local-symbol">⟁</span>
      <span class="local-name">${localNode.name}</span>
      <span class="local-gpu">${localNode.gpu}</span>
      <span class="local-performance ${getPerformanceClass(performanceScore)}">${performanceScore}%</span>
      <span class="local-status ${statusClass}">${translate(statusClass)}</span>
    </div>
  `;
}

/**
 * Atualiza o gráfico de desempenho da rede
 * @param {Array} nodes - Lista de nós
 */
function updatePerformanceChart(nodes) {
  if (!performanceChart) return;
  
  // Prepara dados para o gráfico
  const nodeNames = nodes.map(node => node.name);
  const performances = nodes.map(node => calculatePerformanceScore(node));
  const karmaValues = nodes.map(node => Math.min(node.karma / 1000, 100)); // Normalizado para 0-100
  
  const backgroundColors = nodes.map(node => {
    const score = calculatePerformanceScore(node);
    if (score >= CONFIG.performanceThresholds.high) return 'rgba(0, 255, 128, 0.7)';
    if (score >= CONFIG.performanceThresholds.medium) return 'rgba(255, 204, 0, 0.7)';
    return 'rgba(255, 60, 60, 0.7)';
  });
  
  const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));
  
  // Se já existe uma instância do gráfico, destrua-a
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Cria um novo gráfico
  const ctx = performanceChart.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: nodeNames,
      datasets: [
        {
          label: translate('performance'),
          data: performances,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        },
        {
          label: translate('karma'),
          data: karmaValues,
          type: 'line',
          borderColor: 'rgba(75, 192, 255, 1)',
          backgroundColor: 'rgba(75, 192, 255, 0.2)',
          borderWidth: 2,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#ccc'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  });
}

/**
 * Atualiza as estatísticas da rede
 * @param {Array} nodes - Lista de nós
 */
function updateNetworkStats(nodes) {
  if (!statsContainer) return;
  
  const activeNodes = nodes.filter(node => node.status.toLowerCase() === 'online').length;
  const totalNodes = nodes.length;
  const averagePerformance = nodes.reduce((sum, node) => sum + calculatePerformanceScore(node), 0) / totalNodes;
  const totalKarma = nodes.reduce((sum, node) => sum + node.karma, 0);
  const totalSigils = nodes.reduce((sum, node) => sum + node.sigils.length, 0);
  
  statsContainer.innerHTML = `
    <div class="stat-box">
      <span class="stat-value">${activeNodes}/${totalNodes}</span>
      <span class="stat-label">${translate("active_nodes")}</span>
    </div>
    <div class="stat-box">
      <span class="stat-value">${averagePerformance.toFixed(1)}%</span>
      <span class="stat-label">${translate("avg_performance")}</span>
    </div>
    <div class="stat-box">
      <span class="stat-value">${formatNumber(totalKarma)}</span>
      <span class="stat-label">${translate("total_karma")}</span>
    </div>
    <div class="stat-box">
      <span class="stat-value">${totalSigils}</span>
      <span class="stat-label">${translate("unlocked_sigils")}</span>
    </div>
  `;
}

/**
 * Conecta a um nó específico
 * @param {String} nodeId - ID do nó
 */
async function handleNodeConnect(nodeId) {
  try {
    const btn = document.querySelector(`.connect-btn[data-node-id="${nodeId}"]`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = translate("connecting");
    }
    
    await connectToNode(nodeId);
    
    // Atualiza UI após conexão bem-sucedida
    if (btn) {
      btn.textContent = translate("connected");
      setTimeout(() => {
        if (btn) {
          btn.textContent = translate("connect");
          btn.disabled = false;
        }
      }, 3000);
    }
    
    // Atualiza dados após conexão
    renderMeshPanel();
  } catch (error) {
    console.error('Erro ao conectar ao nó:', error);
    const btn = document.querySelector(`.connect-btn[data-node-id="${nodeId}"]`);
    if (btn) {
      btn.textContent = translate("failed");
      btn.classList.add('error');
      setTimeout(() => {
        if (btn) {
          btn.textContent = translate("retry");
          btn.classList.remove('error');
          btn.disabled = false;
        }
      }, 2000);
    }
  }
}

/**
 * Exibe detalhes detalhados de um nó
 * @param {String} nodeId - ID do nó
 */
function showNodeDetails(nodeId) {
  const node = meshData.nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  // Implementação do modal de detalhes aqui
  // Esta função pode ser expandida para mostrar um modal com detalhes completos
  console.log('Exibindo detalhes do nó:', node);
  
  // Exemplo: criar um modal simples
  const modalContainer = document.createElement('div');
  modalContainer.className = 'node-detail-modal';
  modalContainer.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${node.name}</h2>
        <button class="close-modal">×</button>
      </div>
      <div class="modal-body">
        <div class="detail-section">
          <h3>${translate("hardware_info")}</h3>
          <p><strong>GPU:</strong> ${node.gpu}</p>
          <p><strong>Memory:</strong> ${node.memory}GB</p>
          <p><strong>Status:</strong> ${node.status}</p>
          <p><strong>Ping:</strong> ${node.ping}ms</p>
        </div>
        
        <div class="detail-section">
          <h3>${translate("network_info")}</h3>
          <p><strong>Node ID:</strong> ${node.id}</p>
          <p><strong>IP:</strong> ${node.ip || 'N/A'}</p>
          <p><strong>Uptime:</strong> ${node.uptime || 'N/A'}</p>
        </div>
        
        <div class="detail-section">
          <h3>${translate("karma_sigils")}</h3>
          <p><strong>Karma:</strong> ${formatNumber(node.karma)}</p>
          <p><strong>Tokens:</strong> ${formatNumber(node.tokens || 0)}</p>
          
          <div class="sigils-grid">
            ${node.sigils.map(sigil => `
              <div class="sigil-item">
                <div class="sigil-symbol">${sigil.symbol}</div>
                <div class="sigil-name">${sigil.name}</div>
              </div>
            `).join('') || `<p>${translate("no_sigils_unlocked")}</p>`}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalContainer);
  
  // Adicionando funcionalidade para fechar o modal
  const closeBtn = modalContainer.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => {
    modalContainer.classList.add('closing');
    setTimeout(() => {
      document.body.removeChild(modalContainer);
    }, 300);
  });
  
  // Animação de entrada
  setTimeout(() => {
    modalContainer.classList.add('visible');
  }, 10);
}

/**
 * Renderiza todo o painel Mesh
 */
async function renderMeshPanel() {
  try {
    await initializeIndexedDB();
    container.classList.add('loading');
    
    // Adiciona classe de carregamento
    if (syncButton) {
      syncButton.disabled = true;
      syncButton.innerHTML = `<span class="spinner"></span> ${translate("syncing")}`;
    }
    
    // Busca dados da malha
    const nodes = await fetchMeshStatus();
    
    // Atualiza state
    meshData = {
      nodes,
      totalPerformance: 0,
      activeNodes: nodes.filter(n => n.status.toLowerCase() === 'online').length,
      lastUpdated: new Date()
    };
    
    // Busca informações adicionais para cada nó
    for (const node of nodes) {
      node.karma = await getKarmaForNode(node.id);
      node.sigils = await getSigilsForNode(node.id);
      meshData.totalPerformance += calculatePerformanceScore(node);
    }
    
    // Limpa o container
    container.innerHTML = "";
    
    // Classifica os nós (online primeiro, depois por desempenho)
    nodes.sort((a, b) => {
      if (a.isLocal) return -1;
      if (b.isLocal) return 1;
      
      if (a.status.toLowerCase() !== b.status.toLowerCase()) {
        return a.status.toLowerCase() === 'online' ? -1 : 1;
      }
      
      return calculatePerformanceScore(b) - calculatePerformanceScore(a);
    });
    
    // Limita o número de nós exibidos
    const displayNodes = nodes.slice(0, CONFIG.maxDisplayedNodes);
    
    // Renderiza cada cartão
    displayNodes.forEach((node, index) => {
      const card = createNodeCard(node, index);
      container.appendChild(card);
    });
    
    // Adiciona contador de nós ocultos se aplicável
    if (nodes.length > CONFIG.maxDisplayedNodes) {
      const hiddenCount = nodes.length - CONFIG.maxDisplayedNodes;
      const moreBadge = document.createElement('div');
      moreBadge.className = 'more-nodes-badge';
      moreBadge.textContent = `+${hiddenCount} ${translate("more_nodes")}`;
      moreBadge.addEventListener('click', () => {
        viewButton.click();
      });
      container.appendChild(moreBadge);
    }
    
    // Atualiza componentes adicionais
    const localNode = nodes.find(node => node.isLocal);
    updateLocalNodeBadge(localNode);
    updateNetworkStats(nodes);
    updatePerformanceChart(displayNodes);
    
    // Atualize timestamp
    const timestampEl = document.getElementById('last-updated');
    if (timestampEl) {
      const time = new Date().toLocaleTimeString();
      timestampEl.textContent = `${translate("last_updated")}: ${time}`;
    }
  } catch (error) {
    console.error('Erro ao renderizar painel:', error);
    container.innerHTML = `<div class="error-message">${translate("error_loading")} - ${error.message}</div>`;
  } finally {
    // Remove classe de carregamento
    container.classList.remove('loading');
    
    if (syncButton) {
      syncButton.disabled = false;
      syncButton.innerHTML = `${translate("sync_now")}`;
    }
  }
}

/**
 * Inicia o painel
 */
function initMeshPanel() {
  // Renderização inicial
  renderMeshPanel();
  
  // Configura atualizações automáticas
  setInterval(renderMeshPanel, CONFIG.refreshInterval);
  
  // Adiciona eventos de botões
  if (syncButton) {
    syncButton.addEventListener("click", renderMeshPanel);
  }
  
  if (viewButton) {
    viewButton.addEventListener("click", () => {
      window.location.href = '/network-map.html';
    });
  }
  
  // Detecta mudanças de tema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (chartInstance) {
      updatePerformanceChart(meshData.nodes.slice(0, CONFIG.maxDisplayedNodes));
    }
  });
}

// Inicializa quando o DOM estiver pronto
window.addEventListener("DOMContentLoaded", initMeshPanel);

// Exporta funções para uso externo
export {
  renderMeshPanel,
  updatePerformanceChart,
  createNodeCard,
  meshData
}; 
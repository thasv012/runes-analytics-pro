/**
 * RUNES Analytics Pro - GPU Mesh Network Visualization
 * Visualização em canvas da rede de nós GPU Mesh
 */

class GpuMeshNetworkVisualizer {
  /**
   * Inicializa o visualizador de rede
   * @param {Object} options - Opções de configuração
   * @param {string} options.containerId - ID do elemento contêiner para o canvas
   * @param {Object} options.gpuMeshClient - Instância do gpuMeshClient
   */
  constructor(options = {}) {
    // Configurações padrão
    this.config = {
      containerId: options.containerId || 'network-visualizer',
      width: options.width || 800,
      height: options.height || 500,
      nodeRadius: options.nodeRadius || 15,
      lineWidth: options.lineWidth || 2,
      animationSpeed: options.animationSpeed || 0.5,
      backgroundColor: options.backgroundColor || '#1a1a2e',
      colors: {
        node: {
          connected: options.colors?.node?.connected || '#55ff55',    // Verde
          connecting: options.colors?.node?.connecting || '#ffaa00',  // Amarelo
          disconnected: options.colors?.node?.disconnected || '#ff5555', // Vermelho
          selected: options.colors?.node?.selected || '#5ce1e6'      // Ciano
        },
        edge: {
          default: options.colors?.edge?.default || 'rgba(92, 225, 230, 0.5)',
          active: options.colors?.edge?.active || 'rgba(92, 225, 230, 0.8)',
          data: options.colors?.edge?.data || 'rgba(255, 255, 255, 0.8)'
        },
        text: options.colors?.text || '#e0e0ff'
      },
      maxParticles: options.maxParticles || 50,
      particleSpeed: options.particleSpeed || 2
    };
    
    // Cliente GPU Mesh
    this.gpuMeshClient = options.gpuMeshClient;
    
    // Estado do visualizador
    this.nodes = [];           // Lista de nós
    this.edges = [];           // Conexões entre nós
    this.particles = [];       // Partículas animadas para fluxo de dados
    this.selectedNode = null;  // Nó atualmente selecionado
    this.isDragging = false;   // Flag para arrastar o canvas
    this.zoom = 1;             // Nível de zoom
    this.offset = { x: 0, y: 0 }; // Deslocamento do canvas
    this.lastMousePos = { x: 0, y: 0 }; // Última posição do mouse para arrastar
    
    // Canvas e contexto para renderização
    this.canvas = null;
    this.ctx = null;
    
    // Flags de animação
    this.isRunning = false;
    this.animationFrameId = null;
    
    // Flag para primeira renderização
    this.isFirstRender = true;
  }
  
  /**
   * Inicializa o visualizador
   * @returns {Promise} Promessa resolvida quando inicializado
   */
  async init() {
    try {
      // Obtem o elemento contêiner
      const container = document.getElementById(this.config.containerId);
      if (!container) {
        throw new Error(`Container #${this.config.containerId} não encontrado`);
      }
      
      // Cria o elemento canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
      this.canvas.style.display = 'block';
      this.canvas.style.backgroundColor = this.config.backgroundColor;
      this.canvas.style.borderRadius = '8px';
      this.canvas.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
      
      // Adiciona o canvas ao contêiner
      container.appendChild(this.canvas);
      
      // Obtem o contexto de renderização
      this.ctx = this.canvas.getContext('2d');
      
      // Configura event listeners para interatividade
      this.setupEventListeners();
      
      // Configura event listeners globais para integração com outros sistemas
      this.setupGlobalEventListeners();
      
      // Inicia com nós de exemplo se não houver cliente
      if (!this.gpuMeshClient) {
        console.warn('gpuMeshClient não fornecido, usando dados de exemplo');
        this.setupDemoNodes();
      } else {
        // Configura listeners para eventos do cliente
        this.setupClientListeners();
      }
      
      // Inicia o loop de renderização
      this.start();
      
      return this;
    } catch (error) {
      console.error('Erro ao inicializar o visualizador de rede:', error);
      throw error;
    }
  }
  
  /**
   * Configura listeners de eventos para o canvas
   */
  setupEventListeners() {
    // Clique para selecionar nó
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.zoom - this.offset.x;
      const y = (e.clientY - rect.top) / this.zoom - this.offset.y;
      
      // Verifica se clicou em algum nó
      const clickedNode = this.nodes.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.config.nodeRadius;
      });
      
      if (clickedNode) {
        // Seleciona o nó
        this.selectedNode = this.selectedNode === clickedNode ? null : clickedNode;
      } else {
        // Deseleciona se clicou fora
        this.selectedNode = null;
      }
    });
    
    // Mouse wheel para zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoom = Math.max(0.5, Math.min(2, this.zoom + delta));
    });
    
    // Mouse down para iniciar arrasto
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMousePos = {
        x: e.clientX,
        y: e.clientY
      };
    });
    
    // Mouse move para arrastar
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        
        this.offset.x += dx / this.zoom;
        this.offset.y += dy / this.zoom;
        
        this.lastMousePos = {
          x: e.clientX,
          y: e.clientY
        };
      }
    });
    
    // Mouse up para finalizar arrasto
    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    // Mouse leave para finalizar arrasto
    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });
  }
  
  /**
   * Configura listeners para eventos do GPU Mesh Client
   */
  setupClientListeners() {
    if (!this.gpuMeshClient) return;
    
    // Adiciona nó quando conectado
    this.gpuMeshClient.on('connected', (data) => {
      const node = this.getNodeByEndpoint(data.endpoint);
      if (node) {
        node.status = 'connected';
      } else {
        this.addNode({
          id: `node-${this.nodes.length + 1}`,
          endpoint: data.endpoint,
          status: 'connected',
          type: 'client'
        });
      }
    });
    
    // Atualiza status quando reconectando
    this.gpuMeshClient.on('reconnecting', (data) => {
      const node = this.nodes.find(n => n.type === 'client');
      if (node) {
        node.status = 'connecting';
        node.attempt = data.attempt;
        node.maxAttempts = data.maxAttempts;
      }
    });
    
    // Atualiza status quando desconectado
    this.gpuMeshClient.on('disconnected', () => {
      const node = this.nodes.find(n => n.type === 'client');
      if (node) {
        node.status = 'disconnected';
      }
    });
    
    // Adiciona fluxo de dados quando envia tarefa
    this.gpuMeshClient.on('taskSent', (data) => {
      const sourceNode = this.nodes.find(n => n.type === 'client');
      const targetNode = this.getRandomServerNode();
      
      if (sourceNode && targetNode) {
        this.addDataFlow(sourceNode, targetNode, data.taskId);
      }
    });
    
    // Adiciona fluxo de retorno quando tarefa completa
    this.gpuMeshClient.on('taskCompleted', (data) => {
      const sourceNode = this.getRandomServerNode();
      const targetNode = this.nodes.find(n => n.type === 'client');
      
      if (sourceNode && targetNode) {
        this.addDataFlow(sourceNode, targetNode, data.taskId);
      }
    });
  }
  
  /**
   * Cria nós de demonstração quando não há cliente real
   */
  setupDemoNodes() {
    // Adiciona nó cliente no centro
    this.addNode({
      id: 'client',
      label: 'Client',
      status: 'connected',
      type: 'client',
      x: this.config.width / 2,
      y: this.config.height / 2
    });
    
    // Adiciona nós de servidor ao redor
    const radius = Math.min(this.config.width, this.config.height) * 0.3;
    const count = 5;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = this.config.width / 2 + Math.cos(angle) * radius;
      const y = this.config.height / 2 + Math.sin(angle) * radius;
      
      // Status aleatório para demo
      const statuses = ['connected', 'connecting', 'disconnected'];
      const status = statuses[Math.floor(Math.random() * (i === 0 ? 1 : 3))];
      
      this.addNode({
        id: `server-${i + 1}`,
        label: `Node ${i + 1}`,
        status: status,
        type: 'server',
        x: x,
        y: y
      });
      
      // Cria conexão com o cliente
      this.addEdge('client', `server-${i + 1}`);
    }
    
    // Simula fluxo de dados a cada 3 segundos
    setInterval(() => {
      if (this.nodes.length > 1) {
        const clientNode = this.nodes.find(n => n.id === 'client');
        const serverNode = this.getRandomServerNode();
        
        if (clientNode && serverNode && serverNode.status === 'connected') {
          // 50% chance de enviar ou receber
          if (Math.random() > 0.5) {
            this.addDataFlow(clientNode, serverNode, `task-demo-${Date.now()}`);
          } else {
            this.addDataFlow(serverNode, clientNode, `task-demo-${Date.now()}`);
          }
        }
      }
    }, 3000);
  }
  
  /**
   * Inicia o loop de renderização
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const animate = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  /**
   * Para o loop de renderização
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Renderiza o estado atual da rede
   */
  render() {
    if (!this.ctx) return;
    
    // Limpa o canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Aplica transformação global
    this.ctx.save();
    this.ctx.translate(this.offset.x * this.zoom, this.offset.y * this.zoom);
    this.ctx.scale(this.zoom, this.zoom);
    
    // Na primeira renderização, posiciona os nós automaticamente se não tiverem posição
    if (this.isFirstRender) {
      this.layoutNodes();
      this.isFirstRender = false;
    }
    
    // Renderiza as conexões
    this.renderEdges();
    
    // Renderiza os nós
    this.renderNodes();
    
    // Renderiza as partículas de dados
    this.updateAndRenderParticles();
    
    // Renderiza informações do nó selecionado
    if (this.selectedNode) {
      this.renderNodeInfo(this.selectedNode);
    }
    
    // Restaura o contexto
    this.ctx.restore();
  }
  
  /**
   * Renderiza as conexões entre os nós
   */
  renderEdges() {
    this.edges.forEach(edge => {
      const source = this.nodes.find(n => n.id === edge.source);
      const target = this.nodes.find(n => n.id === edge.target);
      
      if (!source || !target) return;
      
      // Verifica se é uma conexão ativa (nós conectados)
      const isActive = source.status === 'connected' && target.status === 'connected';
      
      // Define a cor da linha
      this.ctx.strokeStyle = isActive 
        ? this.config.colors.edge.active 
        : this.config.colors.edge.default;
        
      this.ctx.lineWidth = this.config.lineWidth;
      
      // Desenha a linha
      this.ctx.beginPath();
      this.ctx.moveTo(source.x, source.y);
      this.ctx.lineTo(target.x, target.y);
      this.ctx.stroke();
    });
  }
  
  /**
   * Renderiza os nós da rede
   */
  renderNodes() {
    this.nodes.forEach(node => {
      // Define a cor com base no status
      let color = this.config.colors.node.disconnected;
      
      switch (node.status) {
        case 'connected': 
          color = this.config.colors.node.connected;
          break;
        case 'connecting': 
          color = this.config.colors.node.connecting;
          break;
        case 'disconnected': 
        default:
          color = this.config.colors.node.disconnected;
      }
      
      // Se o nó estiver selecionado, usa a cor de seleção
      if (node === this.selectedNode) {
        color = this.config.colors.node.selected;
      }
      
      // Desenha o círculo do nó
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, this.config.nodeRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      
      // Adiciona borda
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Efeito de brilho para nós conectados
      if (node.status === 'connected') {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.config.nodeRadius + 5, 0, Math.PI * 2);
        this.ctx.fillStyle = `${color}33`; // Cor com transparência
        this.ctx.fill();
      }
      
      // Desenha o tipo do nó no centro
      let icon = node.type === 'client' ? '👤' : '🖥️';
      // Ícone específico para nós GPU
      if (node.type === 'gpu') {
        icon = '🎮';
      }
      
      this.ctx.font = '10px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(icon, node.x, node.y);
      
      // Desenha o label do nó abaixo
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = this.config.colors.text;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(node.label || node.id, node.x, node.y + this.config.nodeRadius + 5);
      
      // Se estiver reconectando, mostra tentativa
      if (node.status === 'connecting' && node.attempt) {
        this.ctx.font = '10px Arial';
        this.ctx.fillText(
          `Tentativa ${node.attempt}/${node.maxAttempts || '?'}`, 
          node.x, 
          node.y + this.config.nodeRadius + 20
        );
      }
      
      // Se for um nó GPU com status conectado, mostra o uso da GPU
      if (node.type === 'gpu' && node.status === 'connected' && node.gpuUsage !== undefined) {
        this.ctx.font = '10px Arial';
        
        // Cor baseada no uso (verde para baixo, amarelo para médio, vermelho para alto)
        let usageColor;
        if (node.gpuUsage < 50) {
          usageColor = '#55ff55'; // Verde
        } else if (node.gpuUsage < 80) {
          usageColor = '#ffaa00'; // Amarelo
        } else {
          usageColor = '#ff5555'; // Vermelho
        }
        
        this.ctx.fillStyle = usageColor;
        this.ctx.fillText(
          `${node.gpuUsage}%`, 
          node.x, 
          node.y + this.config.nodeRadius + 20
        );
      }
    });
  }
  
  /**
   * Atualiza e renderiza as partículas de dados
   */
  updateAndRenderParticles() {
    // Atualiza posição das partículas
    this.particles = this.particles.filter(particle => {
      // Atualiza a posição baseado no progresso
      particle.progress += this.config.particleSpeed / 100;
      
      // Remove a partícula se chegou ao destino
      if (particle.progress >= 1) {
        return false;
      }
      
      // Busca os nós de origem e destino
      const source = this.nodes.find(n => n.id === particle.source);
      const target = this.nodes.find(n => n.id === particle.target);
      
      if (!source || !target) return false;
      
      // Calcula a posição atual da partícula
      particle.x = source.x + (target.x - source.x) * particle.progress;
      particle.y = source.y + (target.y - source.y) * particle.progress;
      
      return true;
    });
    
    // Renderiza as partículas
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.colors.edge.data;
      this.ctx.fill();
      
      // Efeito de rastro
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = `${this.config.colors.edge.data}33`;
      this.ctx.fill();
    });
  }
  
  /**
   * Renderiza informações detalhadas de um nó
   * @param {Object} node - Nó a exibir informações
   */
  renderNodeInfo(node) {
    const padding = 10;
    const infoX = 20;
    const infoY = 20;
    const infoWidth = 250;
    const lineHeight = 20;
    
    // Prepara informações a exibir
    let lines = [
      `ID: ${node.id}`,
      `Tipo: ${this.getNodeTypeText(node.type)}`,
      `Status: ${this.getStatusText(node.status)}`,
      `Endpoint: ${node.endpoint || 'N/A'}`
    ];
    
    // Adiciona detalhes específicos por tipo
    if (node.type === 'server') {
      lines.push(`Tarefas: ${node.tasks || 0}`);
      lines.push(`Carga: ${node.load || '0%'}`);
    } else if (node.type === 'gpu') {
      lines.push(`GPU: ${node.gpuType || 'Genérico'}`);
      lines.push(`Uso: ${node.gpuUsage || 0}%`);
      lines.push(`Memória: ${node.memory?.used || 0}/${node.memory?.total || 0} GB`);
      lines.push(`Latência: ${node.latency || 0}ms`);
      lines.push(`Temperatura: ${node.temperature || 0}°C`);
      lines.push(`Tarefas: ${node.tasks || 0}`);
    }
    
    // Calcula altura do painel info
    const infoHeight = (lines.length + 1) * lineHeight + padding * 2;
    
    // Desenha fundo do painel
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
    this.ctx.strokeStyle = this.getNodeStatusColor(node.status);
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);
    
    // Desenha título
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillStyle = this.config.colors.text;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('Detalhes do Nó', infoX + padding, infoY + padding);
    
    // Desenha linhas de informação
    this.ctx.font = '12px Arial';
    lines.forEach((line, index) => {
      this.ctx.fillText(
        line, 
        infoX + padding, 
        infoY + padding + lineHeight * (index + 1)
      );
    });
  }
  
  /**
   * Posiciona os nós na tela de forma automática
   */
  layoutNodes() {
    // Só aplica layout se os nós não tiverem posição definida
    const needsLayout = this.nodes.some(node => typeof node.x === 'undefined' || typeof node.y === 'undefined');
    
    if (!needsLayout) return;
    
    // Layout circular simples
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    const radius = Math.min(this.config.width, this.config.height) * 0.3;
    
    // Posiciona o nó cliente no centro (se existir)
    const clientNode = this.nodes.find(n => n.type === 'client');
    if (clientNode) {
      clientNode.x = centerX;
      clientNode.y = centerY;
    }
    
    // Posiciona os nós de servidor em círculo
    const serverNodes = this.nodes.filter(n => n.type === 'server');
    serverNodes.forEach((node, index) => {
      const angle = (index / serverNodes.length) * Math.PI * 2;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });
  }
  
  /**
   * Adiciona um novo nó à visualização
   * @param {Object} nodeData - Dados do nó
   */
  addNode(nodeData) {
    const node = {
      id: nodeData.id || `node-${this.nodes.length + 1}`,
      label: nodeData.label || nodeData.id || `Node ${this.nodes.length + 1}`,
      status: nodeData.status || 'disconnected',
      type: nodeData.type || 'server',
      x: nodeData.x,
      y: nodeData.y,
      endpoint: nodeData.endpoint,
      tasks: 0,
      load: '0%'
    };
    
    this.nodes.push(node);
    return node;
  }
  
  /**
   * Adiciona uma conexão entre dois nós
   * @param {string} sourceId - ID do nó de origem
   * @param {string} targetId - ID do nó de destino
   */
  addEdge(sourceId, targetId) {
    // Verifica se a conexão já existe
    const exists = this.edges.some(e => 
      (e.source === sourceId && e.target === targetId) ||
      (e.source === targetId && e.target === sourceId)
    );
    
    if (!exists) {
      this.edges.push({
        source: sourceId,
        target: targetId
      });
    }
  }
  
  /**
   * Adiciona um fluxo de dados entre dois nós
   * @param {Object} sourceNode - Nó de origem
   * @param {Object} targetNode - Nó de destino
   * @param {string} taskId - ID da tarefa associada
   */
  addDataFlow(sourceNode, targetNode, taskId) {
    // Limita o número máximo de partículas
    if (this.particles.length >= this.config.maxParticles) {
      this.particles.shift(); // Remove a mais antiga
    }
    
    // Adiciona uma nova partícula
    this.particles.push({
      source: sourceNode.id,
      target: targetNode.id,
      taskId: taskId,
      progress: 0,
      x: sourceNode.x,
      y: sourceNode.y
    });
    
    // Certifica-se de que existe uma conexão entre os nós
    this.addEdge(sourceNode.id, targetNode.id);
  }
  
  /**
   * Obtém um nó pelo seu endpoint
   * @param {string} endpoint - Endpoint do nó
   * @returns {Object|null} Nó encontrado ou null
   */
  getNodeByEndpoint(endpoint) {
    return this.nodes.find(node => node.endpoint === endpoint);
  }
  
  /**
   * Obtém um nó de servidor aleatório
   * @returns {Object|null} Nó de servidor aleatório
   */
  getRandomServerNode() {
    const serverNodes = this.nodes.filter(n => n.type === 'server');
    if (serverNodes.length === 0) return null;
    
    // Prefere nós conectados
    const connectedNodes = serverNodes.filter(n => n.status === 'connected');
    if (connectedNodes.length > 0) {
      return connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
    }
    
    return serverNodes[Math.floor(Math.random() * serverNodes.length)];
  }
  
  /**
   * Obtém a cor correspondente ao status do nó
   * @param {string} status - Status do nó
   * @returns {string} Cor do status
   */
  getNodeStatusColor(status) {
    switch (status) {
      case 'connected': return this.config.colors.node.connected;
      case 'connecting': return this.config.colors.node.connecting;
      case 'disconnected': 
      default: return this.config.colors.node.disconnected;
    }
  }
  
  /**
   * Obtém o texto legível para o status do nó
   * @param {string} status - Status do nó
   * @returns {string} Texto do status
   */
  getStatusText(status) {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Reconectando';
      case 'disconnected': return 'Desconectado';
      default: return status;
    }
  }
  
  /**
   * Atualiza as informações de um nó
   * @param {string} nodeId - ID do nó a atualizar
   * @param {Object} data - Dados para atualização
   */
  updateNode(nodeId, data) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, data);
    }
  }
  
  /**
   * Limpa todos os dados da visualização
   */
  clear() {
    this.nodes = [];
    this.edges = [];
    this.particles = [];
    this.selectedNode = null;
  }
  
  /**
   * Redimensiona o canvas
   * @param {number} width - Nova largura
   * @param {number} height - Nova altura
   */
  resize(width, height) {
    this.config.width = width;
    this.config.height = height;
    
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    
    // Reposiciona os nós se necessário
    this.isFirstRender = true;
  }
  
  /**
   * Simula a adição de novos nós GPU à rede Mesh
   * @param {number} count - Número de nós para adicionar
   */
  simulateGpuNodes(count) {
    console.log(`[GPU Mesh] Iniciando simulação de ${count} novos nós GPU`);
    
    // Gera nós com IDs únicos
    for (let i = 0; i < count; i++) {
      // Gera ID único baseado em timestamp e número aleatório
      const nodeId = `gpu-node-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      
      // Tipos de GPUs possíveis
      const gpuTypes = ['NVIDIA RTX 4090', 'NVIDIA A100', 'AMD MI300', 'Intel Arc A770'];
      const gpuType = gpuTypes[Math.floor(Math.random() * gpuTypes.length)];
      
      // Gera localização aleatória na visualização
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.min(this.config.width, this.config.height) * 0.3;
      const x = this.config.width / 2 + Math.cos(angle) * radius;
      const y = this.config.height / 2 + Math.sin(angle) * radius;
      
      // Status aleatório (com mais chance de estar online)
      const statuses = ['connected', 'connecting', 'disconnected'];
      const statusWeights = [0.7, 0.2, 0.1]; // 70% connected, 20% connecting, 10% disconnected
      const statusRandom = Math.random();
      let status;
      
      if (statusRandom < statusWeights[0]) {
        status = statuses[0];
      } else if (statusRandom < statusWeights[0] + statusWeights[1]) {
        status = statuses[1];
      } else {
        status = statuses[2];
      }
      
      // Cria nó com propriedades de GPU
      const gpuNode = {
        id: nodeId,
        label: `GPU ${i + 1}`,
        status: status,
        type: 'gpu',
        x: x,
        y: y,
        // Atributos específicos de GPU
        gpuType: gpuType,
        gpuUsage: Math.floor(Math.random() * 90) + 10, // 10-99%
        latency: Math.floor(Math.random() * 20) + 5,   // 5-24ms
        bandwidth: Math.floor(Math.random() * 30) + 10, // 10-39 GB/s
        memory: {
          total: 32,  // GB
          used: Math.floor(Math.random() * 26) + 5  // 5-30 GB
        },
        temperature: Math.floor(Math.random() * 30) + 50, // 50-79°C
        tasks: Math.floor(Math.random() * 10)       // 0-9 tarefas
      };
      
      // Adiciona o nó
      this.addNode(gpuNode);
      
      // Conecta com o cliente ou alguns nós aleatórios
      const clientNode = this.nodes.find(n => n.type === 'client');
      if (clientNode) {
        this.addEdge(clientNode.id, nodeId);
      }
      
      // Conecta com alguns nós existentes aleatoriamente
      const existingNodes = this.nodes.filter(n => n.id !== nodeId);
      const connectionsCount = Math.min(2, existingNodes.length);
      
      for (let j = 0; j < connectionsCount; j++) {
        const randomIndex = Math.floor(Math.random() * existingNodes.length);
        const targetNode = existingNodes[randomIndex];
        
        if (targetNode && !existingNodes.includes(targetNode)) {
          this.addEdge(nodeId, targetNode.id);
          existingNodes.splice(randomIndex, 1); // Remove para não reconectar
        }
      }
      
      console.log(`[GPU Mesh] Novo nó adicionado: ${nodeId} (${gpuType})`);
    }
    
    // Configura atualização periódica dos dados de GPU a cada 2 segundos
    setInterval(() => this.updateGpuNodesData(), 2000);
  }
  
  /**
   * Atualiza os dados dos nós GPU, simulando mudanças
   */
  updateGpuNodesData() {
    const gpuNodes = this.nodes.filter(node => node.type === 'gpu');
    
    if (gpuNodes.length === 0) return;
    
    gpuNodes.forEach(node => {
      if (node.status === 'disconnected') return;
      
      // Atualiza o uso da GPU (variação de -5 a +5)
      const gpuDelta = Math.floor(Math.random() * 11) - 5;
      node.gpuUsage = Math.max(0, Math.min(100, node.gpuUsage + gpuDelta));
      
      // Atualiza latência (variação de -2 a +2)
      const latencyDelta = Math.floor(Math.random() * 5) - 2;
      node.latency = Math.max(1, Math.min(30, node.latency + latencyDelta));
      
      // Atualiza uso de memória (variação de -1 a +1)
      const memoryDelta = Math.floor(Math.random() * 3) - 1;
      node.memory.used = Math.max(0, Math.min(node.memory.total, node.memory.used + memoryDelta));
      
      // Atualiza temperatura (variação de -2 a +2)
      const tempDelta = Math.floor(Math.random() * 5) - 2;
      node.temperature = Math.max(40, Math.min(85, node.temperature + tempDelta));
      
      // Chance pequena de mudar status
      if (Math.random() > 0.97) {
        const oldStatus = node.status;
        if (node.status === 'connected') {
          node.status = 'connecting';
          console.log(`[GPU Mesh] Nó ${node.id} mudou de connected para connecting`);
        } else if (node.status === 'connecting') {
          node.status = Math.random() > 0.7 ? 'connected' : 'disconnected';
          console.log(`[GPU Mesh] Nó ${node.id} mudou de connecting para ${node.status}`);
        }
      }
      
      // Log no console se o uso de GPU for crítico
      if (node.gpuUsage > 95) {
        console.log(`[GPU Mesh] Alerta: Nó ${node.id} com uso de GPU crítico: ${node.gpuUsage}%`);
      }
      
      // Log se a temperatura for crítica
      if (node.temperature > 80) {
        console.log(`[GPU Mesh] Alerta: Nó ${node.id} com temperatura crítica: ${node.temperature}°C`);
      }
    });
    
    // Adiciona fluxo de dados entre nós GPU e outros nós
    if (Math.random() > 0.7) {
      const sourceNode = gpuNodes[Math.floor(Math.random() * gpuNodes.length)];
      const otherNodes = this.nodes.filter(n => n.id !== sourceNode.id);
      
      if (otherNodes.length > 0) {
        const targetNode = otherNodes[Math.floor(Math.random() * otherNodes.length)];
        
        if (sourceNode.status === 'connected' && targetNode) {
          this.addDataFlow(sourceNode, targetNode, `task-gpu-${Date.now().toString(36)}`);
        }
      }
    }
  }
  
  /**
   * Obtém o texto legível para o tipo de nó
   * @param {string} type - Tipo do nó
   * @returns {string} Texto do tipo
   */
  getNodeTypeText(type) {
    switch (type) {
      case 'client': return 'Cliente';
      case 'server': return 'Servidor';
      case 'gpu': return 'GPU';
      default: return type;
    }
  }
  
  /**
   * Configura o listener de eventos para novos nós adicionados via evento personalizado
   */
  setupGlobalEventListeners() {
    // Escuta eventos de novos nós
    window.addEventListener('gpu-mesh:new-node', (event) => {
      const newNode = event.detail;
      console.log(`[GPU Mesh] Recebido novo nó via evento: ${newNode.id}`);
      
      // Adiciona o novo nó à visualização
      this.addNode(newNode);
      
      // Conecta o nó aos existentes se apropriado
      if (newNode.connections) {
        // Se o nó vier com conexões definidas, as utilizamos
        newNode.connections.forEach(targetId => {
          this.addEdge(newNode.id, targetId);
        });
      } else {
        // Caso contrário, conecta com o cliente (se existir)
        const clientNode = this.nodes.find(n => n.type === 'client');
        if (clientNode) {
          this.addEdge(clientNode.id, newNode.id);
        }
      }
    });
    
    // Escuta eventos de atualização de nós existentes
    window.addEventListener('gpu-mesh:update-node', (event) => {
      const { nodeId, data } = event.detail;
      console.log(`[GPU Mesh] Atualizando nó via evento: ${nodeId}`);
      this.updateNode(nodeId, data);
    });
    
    // Escuta eventos de fluxo de dados
    window.addEventListener('gpu-mesh:data-flow', (event) => {
      const { sourceId, targetId, taskId } = event.detail;
      const sourceNode = this.nodes.find(n => n.id === sourceId);
      const targetNode = this.nodes.find(n => n.id === targetId);
      
      if (sourceNode && targetNode) {
        console.log(`[GPU Mesh] Novo fluxo de dados: ${sourceId} -> ${targetId}`);
        this.addDataFlow(sourceNode, targetNode, taskId);
      }
    });
  }
}

// Exporta a classe para uso externo
export { GpuMeshNetworkVisualizer }; 
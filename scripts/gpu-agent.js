/**
 * AwakenNet GPU Agent
 * 
 * Este componente gerencia o acesso e utilização do GPU para
 * processamento acelerado de análises e reconhecimento de padrões.
 */

const express = require('express');
const cors = require('cors');
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração
const PORT = process.env.PORT || 8081;
const CONFIG_PATH = path.join(__dirname, '..', 'agents.json');
const AGENT_ID = 'gpu-analytics-001';
const UPDATE_INTERVAL = 5000; // 5 segundos

// Inicialização do express
const app = express();
app.use(cors());
app.use(express.json());

// Estado do agente
let agentState = {
  status: 'initializing',
  gpu_info: null,
  started_at: new Date().toISOString(),
  metrics: {
    uptime: 0,
    tasks_processed: 0,
    tasks_queued: 0,
    memory_usage: 0,
    gpu_usage: 0,
    last_task_time: null
  },
  queue: [],
  tasks_history: []
};

// Simulação de utilização do GPU
const gpuLoad = {
  current: 0,
  target: 0,
  increment: 0
};

/**
 * Detecta informações sobre o GPU
 */
function detectGPU() {
  console.log('Detectando informações do GPU...');
  
  try {
    let gpuInfo = { detected: false, model: 'N/A', memory: 'N/A', driver: 'N/A' };
    
    // Verifica se temos GPU_MODEL das variáveis de ambiente (definido pelos scripts de inicialização)
    if (process.env.GPU_MODEL) {
      gpuInfo.detected = true;
      gpuInfo.model = process.env.GPU_MODEL;
    } else {
      // Tentativa de detectar em Windows
      try {
        const wmicOutput = execSync('wmic path win32_VideoController get name,AdapterRAM,DriverVersion', { encoding: 'utf8' });
        const lines = wmicOutput.trim().split('\n').slice(1);
        
        if (lines.length > 0 && lines[0].trim().length > 0) {
          const parts = lines[0].trim().split(/\s{2,}/);
          gpuInfo.detected = true;
          gpuInfo.model = parts[0] || 'Desconhecido';
          
          if (parts.length > 1) {
            const ram = parseInt(parts[1], 10);
            gpuInfo.memory = ram ? `${Math.round(ram / (1024 * 1024))} MB` : 'Desconhecido';
          }
          
          if (parts.length > 2) {
            gpuInfo.driver = parts[2] || 'Desconhecido';
          }
        }
      } catch (windowsError) {
        console.log('Não foi possível detectar GPU via wmic:', windowsError.message);
        
        // Tenta métodos alternativos específicos para Linux
        try {
          // Tenta nvidia-smi para GPUs NVIDIA
          const nvidiaSmi = execSync('nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader', { encoding: 'utf8' });
          const nvidiaParts = nvidiaSmi.trim().split(',').map(p => p.trim());
          
          if (nvidiaParts.length >= 1) {
            gpuInfo.detected = true;
            gpuInfo.model = nvidiaParts[0] || 'NVIDIA GPU';
            gpuInfo.memory = nvidiaParts[1] || 'Desconhecido';
            gpuInfo.driver = nvidiaParts[2] || 'Desconhecido';
          }
        } catch (nvidiaError) {
          // Silenciosamente falha e continua tentando outras opções
          try {
            // Tenta lspci para informação básica de GPU
            const lspci = execSync("lspci | grep -i 'vga\\|3d\\|display'", { encoding: 'utf8' });
            if (lspci.trim().length > 0) {
              gpuInfo.detected = true;
              gpuInfo.model = lspci.trim().split(':').slice(2).join(':').trim() || 'GPU Genérico';
            }
          } catch (lspciError) {
            // Se tudo falhar, usamos informações simuladas
            console.log('Não foi possível detectar GPU, usando modo simulado');
          }
        }
      }
    }
    
    // Se não conseguimos detectar de nenhuma forma, usamos modo simulado
    if (!gpuInfo.detected) {
      gpuInfo = {
        detected: true,
        model: 'GPU Simulado (AwakenNet)',
        memory: '4096 MB (Virtual)',
        driver: 'v1.0.0 (Simulação)',
        simulated: true
      };
    }
    
    agentState.gpu_info = gpuInfo;
    agentState.status = 'online';
    console.log(`GPU detectado: ${gpuInfo.model}`);
    return gpuInfo;
  } catch (error) {
    console.error('Erro ao detectar GPU:', error.message);
    agentState.status = 'degraded';
    agentState.gpu_info = {
      detected: false,
      model: 'Falha na detecção',
      error: error.message
    };
    return null;
  }
}

/**
 * Carrega a configuração do agente a partir do arquivo de configuração
 */
function loadAgentConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      const agentConfig = config.agents.find(a => a.id === AGENT_ID);
      
      if (agentConfig) {
        console.log(`Configuração carregada para agente: ${agentConfig.name}`);
        return agentConfig;
      }
    }
    console.log('Configuração não encontrada, usando padrões');
    return null;
  } catch (error) {
    console.error('Erro ao carregar configuração:', error.message);
    return null;
  }
}

/**
 * Atualiza as métricas do sistema
 */
function updateMetrics() {
  const now = new Date();
  const uptime = Math.floor((now - new Date(agentState.started_at)) / 1000);
  
  // Atualiza utilização simulada do GPU
  updateGpuLoad();
  
  // Métricas do sistema
  const memoryUsage = process.memoryUsage();
  const systemLoad = os.loadavg();
  
  // Atualiza o estado
  agentState.metrics = {
    uptime,
    tasks_processed: agentState.metrics.tasks_processed,
    tasks_queued: agentState.queue.length,
    memory_usage: Math.round(memoryUsage.rss / 1024 / 1024), // MB
    memory_usage_percent: Math.round((memoryUsage.rss / (os.totalmem() || 1)) * 100),
    cpu_usage: Math.round(systemLoad[0] * 10) / 10,
    gpu_usage: gpuLoad.current,
    last_task_time: agentState.metrics.last_task_time,
    last_updated: now.toISOString()
  };
  
  // Salva a cada 60 segundos
  if (uptime % 60 === 0) {
    saveCurrentState();
  }
}

/**
 * Atualiza a carga simulada do GPU
 */
function updateGpuLoad() {
  // Se não temos tarefa em execução, a carga cai gradualmente
  if (gpuLoad.target === 0 && gpuLoad.current > 0) {
    gpuLoad.current = Math.max(0, gpuLoad.current - 5);
  } 
  // Se temos uma carga alvo, nos movemos em direção a ela
  else if (gpuLoad.target > 0) {
    // Se estamos abaixo da meta, aumentamos
    if (gpuLoad.current < gpuLoad.target) {
      gpuLoad.current = Math.min(gpuLoad.target, gpuLoad.current + gpuLoad.increment);
    } 
    // Se estamos acima da meta, reduzimos
    else if (gpuLoad.current > gpuLoad.target) {
      gpuLoad.current = Math.max(gpuLoad.target, gpuLoad.current - gpuLoad.increment);
    }
    
    // Se atingimos o alvo, começamos a reduzir gradualmente
    if (gpuLoad.current === gpuLoad.target) {
      gpuLoad.target = 0;
    }
  }
}

/**
 * Salva o estado atual do agente
 */
function saveCurrentState() {
  try {
    const statePath = path.join(__dirname, '..', 'logs', 'gpu-agent-state.json');
    fs.writeFileSync(statePath, JSON.stringify(agentState, null, 2));
  } catch (error) {
    console.error('Erro ao salvar estado:', error.message);
  }
}

/**
 * Processa uma tarefa na fila, simulando carga
 */
function processTask(task) {
  console.log(`Processando tarefa: ${task.id} - ${task.type}`);
  
  // Define a carga de GPU baseada no tipo de tarefa
  switch (task.type) {
    case 'pattern_recognition':
      gpuLoad.target = 85;
      gpuLoad.increment = 10;
      break;
    case 'trend_analysis':
      gpuLoad.target = 65;
      gpuLoad.increment = 5;
      break;
    case 'prediction':
      gpuLoad.target = 90;
      gpuLoad.increment = 15;
      break;
    default:
      gpuLoad.target = 40;
      gpuLoad.increment = 8;
  }
  
  // Definir resultado simulado baseado no tipo
  let result = null;
  
  switch (task.type) {
    case 'pattern_recognition':
      result = {
        patterns_found: Math.floor(Math.random() * 10) + 1,
        confidence_score: Math.round(Math.random() * 100) / 100,
        processing_time_ms: Math.floor(Math.random() * 2000) + 500
      };
      break;
    case 'trend_analysis':
      result = {
        trend_direction: Math.random() > 0.5 ? 'upward' : 'downward',
        strength: Math.round(Math.random() * 100) / 100,
        significance: Math.round(Math.random() * 100) / 100,
        processing_time_ms: Math.floor(Math.random() * 1500) + 300
      };
      break;
    case 'prediction':
      result = {
        prediction_values: Array.from({length: 5}, () => Math.round(Math.random() * 1000)),
        confidence_interval: [Math.random() * 0.1, Math.random() * 0.2 + 0.1],
        processing_time_ms: Math.floor(Math.random() * 3000) + 1000
      };
      break;
    default:
      result = {
        success: true,
        processing_time_ms: Math.floor(Math.random() * 1000) + 100
      };
  }
  
  // Atualiza as métricas
  agentState.metrics.tasks_processed++;
  agentState.metrics.last_task_time = new Date().toISOString();
  
  // Adiciona à história de tarefas (limitando a 50)
  task.completed_at = new Date().toISOString();
  task.result = result;
  agentState.tasks_history.unshift(task);
  agentState.tasks_history = agentState.tasks_history.slice(0, 50);
  
  return result;
}

/**
 * Processa a fila periodicamente
 */
function processQueue() {
  if (agentState.queue.length > 0 && agentState.status === 'online') {
    const task = agentState.queue.shift();
    const result = processTask(task);
    
    // Aqui poderíamos enviar o resultado para um callback, por exemplo
    console.log(`Tarefa ${task.id} concluída com resultado:`, result);
  }
  
  // Agenda o próximo processamento
  setTimeout(processQueue, 2000);
}

// Rotas da API

// Status do agente
app.get('/status', (req, res) => {
  res.json({
    id: AGENT_ID,
    status: agentState.status,
    gpu_info: agentState.gpu_info,
    metrics: agentState.metrics,
    queue_size: agentState.queue.length
  });
});

// Informações detalhadas
app.get('/info', (req, res) => {
  res.json({
    ...agentState,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      total_memory: Math.round(os.totalmem() / (1024 * 1024)) // MB
    }
  });
});

// Histórico de tarefas
app.get('/tasks/history', (req, res) => {
  res.json(agentState.tasks_history);
});

// Fila atual
app.get('/tasks/queue', (req, res) => {
  res.json(agentState.queue);
});

// Adicionar tarefa à fila
app.post('/tasks', (req, res) => {
  if (!req.body || !req.body.type) {
    return res.status(400).json({ error: 'Tipo de tarefa não especificado' });
  }
  
  const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const task = {
    id: taskId,
    type: req.body.type,
    data: req.body.data || {},
    priority: req.body.priority || 'normal',
    submitted_at: new Date().toISOString()
  };
  
  // Adiciona à fila com base na prioridade
  if (task.priority === 'high') {
    agentState.queue.unshift(task);
  } else {
    agentState.queue.push(task);
  }
  
  res.status(201).json({
    message: 'Tarefa adicionada à fila',
    task_id: taskId,
    position: task.priority === 'high' ? 0 : agentState.queue.length - 1,
    estimated_wait: `${agentState.queue.length * 2} segundos`
  });
});

// Limpar fila
app.delete('/tasks/queue', (req, res) => {
  const queueSize = agentState.queue.length;
  agentState.queue = [];
  res.json({
    message: `Fila limpa. ${queueSize} tarefas removidas.`
  });
});

// Inicialização
async function initializeAgent() {
  console.log('Inicializando AwakenNet GPU Agent...');
  
  // Detecta informações do GPU
  detectGPU();
  
  // Carrega configuração
  const config = loadAgentConfig();
  if (config) {
    // Poderíamos aplicar configurações específicas aqui
  }
  
  // Inicia o processamento da fila
  processQueue();
  
  // Configura atualização periódica de métricas
  setInterval(updateMetrics, UPDATE_INTERVAL);
  
  // Inicia o servidor
  app.listen(PORT, () => {
    console.log(`AwakenNet GPU Agent rodando em http://localhost:${PORT}`);
    agentState.status = 'online';
  });
}

// Inicia o agente
initializeAgent().catch(error => {
  console.error('Erro fatal na inicialização:', error);
  process.exit(1);
}); 
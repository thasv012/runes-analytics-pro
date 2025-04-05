/**
 * RUNES Analytics Pro - GPU Agent
 * Servidor para compartilhar capacidades de GPU entre desenvolvedores
 */

const express = require("express");
const os = require("os");
const cors = require("cors");
const app = express();

// Habilitar CORS para permitir requisições de outras origens
app.use(cors());

// Configuração do agente (pode ser personalizada)
const AGENT_CONFIG = {
  name: "ThierryNode",
  gpu: process.env.GPU_MODEL || "RTX 3090",
  tasks: ["summarize", "translate", "vision", "runes-analysis"],
  capabilities: {
    vision: true,
    nlp: true,
    runes: true,
    analytics: true
  },
  maxTasks: 5,
  status: "online"
};

// Rota principal para verificar status do agente
app.get("/status", (req, res) => {
  // Obter informações do sistema
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMem: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + "GB",
    freeMem: Math.round(os.freemem() / (1024 * 1024 * 1024)) + "GB",
    uptime: Math.round(os.uptime() / 60) + " minutes"
  };
  
  // Combinar com informações do agente
  const response = {
    ...AGENT_CONFIG,
    timestamp: new Date().toISOString(),
    system: systemInfo,
    online: true,
    agent: "CypherAI_PeerNode_02",
  };
  
  res.json(response);
});

// Endpoint para enviar tarefas para o agente
app.post("/task", express.json(), (req, res) => {
  const { task, priority, data } = req.body;
  
  if (!task || !data) {
    return res.status(400).json({ error: "Missing required fields: task, data" });
  }
  
  console.log(`[${new Date().toLocaleTimeString()}] Received task: ${task} (priority: ${priority || "normal"})`);
  
  // Simulação de processamento assíncrono
  setTimeout(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Completed task: ${task}`);
  }, 500);
  
  // Responder imediatamente com ID da tarefa
  res.json({
    taskId: `task_${Date.now()}`,
    status: "accepted",
    estimatedTime: "2s",
    message: `Task '${task}' accepted by ${AGENT_CONFIG.name}`
  });
});

// Endpoint para obter as capacidades do agente
app.get("/capabilities", (req, res) => {
  res.json({
    capabilities: AGENT_CONFIG.capabilities,
    tasks: AGENT_CONFIG.tasks,
    maxConcurrent: AGENT_CONFIG.maxTasks
  });
});

// Endpoint para verificar a "saúde" do agente
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    load: Math.random() * 100, // Simulação de carga
    taskQueue: Math.floor(Math.random() * 3), // Simulação de fila de tarefas
    timestamp: Date.now()
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🧠 Node GPU ativo em http://localhost:${PORT}`);
  console.log(`📊 GPU: ${AGENT_CONFIG.gpu}`);
  console.log(`🚀 Tasks suportadas: ${AGENT_CONFIG.tasks.join(", ")}`);
}); 
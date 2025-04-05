# Integração do GPU Mesh Client - Guia Técnico

Este documento descreve como integrar o módulo GPU Mesh Client com o sistema RUNES Analytics Pro existente, incluindo exemplos de código, configurações e boas práticas.

## Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [API do Cliente](#api-do-cliente)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Integração com Outros Módulos](#integração-com-outros-módulos)
8. [Solução de Problemas](#solução-de-problemas)
9. [Referências](#referências)

## Visão Geral

O GPU Mesh Client é um módulo WebSocket que permite conectar-se a uma rede distribuída de nós de processamento GPU para executar tarefas de processamento de dados de tokens Runes. O cliente gerencia conexões, envio de tarefas, monitoramento de progresso e recepção de resultados.

## Requisitos

- Node.js v14+ (para desenvolvimento)
- Navegador com suporte a WebSocket
- Acesso a pelo menos um nó GPU Mesh ativo (local ou remoto)

## Instalação

O GPU Mesh Client já está incluído no repositório do projeto RUNES Analytics Pro. Para utilizá-lo, basta importar o módulo em seus arquivos JavaScript:

```javascript
// ESM
import { gpuMeshClient, GpuMeshClient } from './js/gpuMeshClient.js';

// Ou para criar uma nova instância com configurações personalizadas
import { GpuMeshClient } from './js/gpuMeshClient.js';
const customClient = new GpuMeshClient({
  reconnectDelay: 3000,
  taskTimeout: 60000,
  debug: true
});
```

## Configuração

O cliente pode ser configurado durante a inicialização ou através da propriedade `config`:

```javascript
// Configuração durante a inicialização
const client = new GpuMeshClient({
  reconnectDelay: 2000,       // Intervalo entre tentativas de reconexão (ms)
  reconnectMaxAttempts: 5,    // Número máximo de tentativas
  taskTimeout: 30000,         // Timeout para execução de tarefas (ms)
  consoleMaxLines: 1000,      // Máximo de linhas no console virtual
  localEndpoint: 'ws://localhost:8081/mesh',
  remoteEndpoint: 'wss://mesh.runes.pro/node',
  debug: false                // Ativar logs de debug
});

// Ou modificando a configuração posteriormente
gpuMeshClient.config.taskTimeout = 60000;
gpuMeshClient.config.debug = true;
```

## API do Cliente

### Inicialização e Conexão

```javascript
// Inicializa e conecta ao endpoint padrão (ou especificado)
await gpuMeshClient.init('ws://exemplo.com/mesh');

// Conecta a outro endpoint após desconexão
await gpuMeshClient.connect('ws://outro-endpoint.com/mesh');

// Fecha a conexão
gpuMeshClient.disconnect();
```

### Envio de Tarefas

```javascript
// Envia uma tarefa para processamento
const result = await gpuMeshClient.sendTask({
  taskId: "TASK-EMBED-RUNE-" + Date.now().toString(36),
  model: "cypher-v1",
  inputDataURL: "https://runes.pro/data/batch-0425.json",
  returnLogs: true
});

// Cancela uma tarefa em execução
await gpuMeshClient.cancelTask("TASK-EMBED-RUNE-123456");
```

### Eventos e Callbacks

```javascript
// Escuta eventos do cliente
gpuMeshClient.on('connected', (data) => {
  console.log(`Conectado a ${data.endpoint}`);
});

gpuMeshClient.on('disconnected', (data) => {
  console.log(`Desconectado. Código: ${data.code}`);
});

gpuMeshClient.on('taskCompleted', (data) => {
  console.log(`Tarefa ${data.taskId} concluída com sucesso`);
});

gpuMeshClient.on('taskError', (data) => {
  console.error(`Erro na tarefa ${data.taskId}: ${data.error}`);
});

gpuMeshClient.on('taskProgress', (data) => {
  console.log(`Progresso: ${Math.round(data.progress * 100)}%`);
});

// Remover um listener
const callback = (data) => console.log(data);
gpuMeshClient.on('connected', callback);
gpuMeshClient.off('connected', callback);
```

### Console e UI

```javascript
// Define o elemento para exibir logs
gpuMeshClient.setConsoleElement('id-do-elemento');
// Ou passando diretamente o elemento DOM
gpuMeshClient.setConsoleElement(document.getElementById('console'));

// Adiciona mensagem ao console
gpuMeshClient.appendToConsole('Mensagem importante para o usuário');

// Limpa o console
gpuMeshClient.clearConsole();

// Obtém histórico de tarefas
const history = gpuMeshClient.getTaskHistory();
```

## Exemplos de Uso

### Exemplo 1: Integração Básica

```javascript
import { gpuMeshClient } from './js/gpuMeshClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Inicializa o cliente
    await gpuMeshClient.init();
    
    // Configura console virtual
    gpuMeshClient.setConsoleElement('console-output');
    
    // Registra handlers para eventos
    gpuMeshClient.on('connected', () => {
      document.getElementById('status').textContent = 'Conectado';
    });
    
    gpuMeshClient.on('disconnected', () => {
      document.getElementById('status').textContent = 'Desconectado';
    });
    
    // Configurar botão de envio de tarefa
    document.getElementById('send-task').addEventListener('click', async () => {
      const taskId = "TASK-" + Date.now().toString(36);
      
      try {
        const result = await gpuMeshClient.sendTask({
          taskId,
          model: "cypher-v1",
          inputDataURL: document.getElementById('input-url').value,
          returnLogs: true
        });
        
        console.log('Resultado:', result);
      } catch (error) {
        console.error('Erro:', error);
      }
    });
  } catch (error) {
    console.error('Falha ao inicializar:', error);
  }
});
```

### Exemplo 2: Integração com Módulo de Análise

```javascript
import { gpuMeshClient } from './js/gpuMeshClient.js';
import { runesAnalyzer } from './js/runesAnalyzer.js';

class RunesProcessor {
  constructor() {
    this.initialized = false;
  }
  
  async init() {
    try {
      // Inicializa o cliente GPU Mesh
      await gpuMeshClient.init();
      
      // Configura eventos
      gpuMeshClient.on('taskCompleted', this.handleTaskCompleted.bind(this));
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar RunesProcessor:', error);
      return false;
    }
  }
  
  async processRunesBatch(batchId, options = {}) {
    if (!this.initialized) {
      throw new Error('RunesProcessor não inicializado');
    }
    
    const taskId = `PROCESS-BATCH-${batchId}-${Date.now().toString(36)}`;
    
    try {
      // Envia tarefa para a malha GPU
      const result = await gpuMeshClient.sendTask({
        taskId,
        model: options.model || "runegpt-v2",
        inputDataURL: `https://runes.pro/data/batch-${batchId}.json`,
        parameters: options.parameters || {},
        returnLogs: true
      });
      
      // Processa os resultados
      return runesAnalyzer.analyzeResults(result.data);
    } catch (error) {
      console.error(`Erro ao processar batch ${batchId}:`, error);
      throw error;
    }
  }
  
  handleTaskCompleted(data) {
    // Atualiza UI ou notifica outros componentes
    if (data.success) {
      console.log(`Processamento do batch concluído: ${data.taskId}`);
      // Trigger evento customizado
      document.dispatchEvent(new CustomEvent('batch-processed', { 
        detail: { taskId: data.taskId, result: data.result }
      }));
    }
  }
}

export const runesProcessor = new RunesProcessor();
```

## Integração com Outros Módulos

### Integração com Dashboard

Para exibir status da GPU Mesh no dashboard principal:

```javascript
import { gpuMeshClient } from './js/gpuMeshClient.js';
import { dashboardUI } from './js/dashboardUI.js';

// Atualiza métricas no dashboard quando tarefas são concluídas
gpuMeshClient.on('taskCompleted', (data) => {
  dashboardUI.updateMetrics({
    tasksCompleted: gpuMeshClient.getTaskHistory().filter(t => t.success).length,
    averageTime: calculateAverageTime(gpuMeshClient.getTaskHistory()),
    successRate: calculateSuccessRate(gpuMeshClient.getTaskHistory())
  });
});

// Atualiza status de conexão
gpuMeshClient.on('connected', () => {
  dashboardUI.updateConnectionStatus('connected');
});

gpuMeshClient.on('disconnected', () => {
  dashboardUI.updateConnectionStatus('disconnected');
});

gpuMeshClient.on('reconnecting', (data) => {
  dashboardUI.updateConnectionStatus('reconnecting', data.attempt, data.maxAttempts);
});
```

### Integração com Sistema Awaken

```javascript
import { gpuMeshClient } from './js/gpuMeshClient.js';
import { awakenConnect } from './mesh/awaken-connect.js';

async function initAwakenMeshIntegration() {
  // Inicializa sistema Awaken
  const awakenSystem = await awakenConnect.init();
  
  // Inicializa conexão GPU Mesh usando os endpoints Awaken
  await gpuMeshClient.init(awakenSystem.getPreferredEndpoint());
  
  // Sincroniza eventos entre os sistemas
  gpuMeshClient.on('taskCompleted', (data) => {
    awakenConnect.reportTaskCompletion(data.taskId, data.result);
  });
  
  // Registra callback para alteração de endpoints no sistema Awaken
  awakenConnect.on('endpoint-changed', (endpoint) => {
    gpuMeshClient.connect(endpoint);
  });
  
  return {
    gpuMeshClient,
    awakenSystem
  };
}
```

## Solução de Problemas

### Erro de Conexão WebSocket

Problemas comuns:
- Verifique se o endpoint está correto e acessível
- Certifique-se de que não há bloqueio por firewall ou proxy
- Verifique se está usando wss:// para conexões seguras (HTTPS)

Solução:
```javascript
// Ative debug para ver mais detalhes
gpuMeshClient.config.debug = true;

// Tente diferentes endpoints
await gpuMeshClient.init('ws://localhost:8081/mesh');
// ou
await gpuMeshClient.init('wss://mesh.runes.pro/node');
```

### Tarefas Expirando por Timeout

Se tarefas estiverem expirando consistentemente:

```javascript
// Aumente o tempo de timeout para tarefas complexas
gpuMeshClient.config.taskTimeout = 120000; // 2 minutos

// Verifique se a tarefa não está muito grande
const task = {
  taskId: "TASK-" + Date.now().toString(36),
  model: "runegpt-v2",
  // Use URL para dados grandes ao invés de enviar diretamente
  inputDataURL: "https://runes.pro/data/batch-0425.json",
  // Evite incluir grandes conjuntos de dados diretamente
  // inputData: largeDataObject, // EVITE ISSO
  returnLogs: true
};
```

### Problema de Desconexão Frequente

```javascript
// Aumente as tentativas de reconexão e ajuste o delay
gpuMeshClient.config.reconnectMaxAttempts = 10;
gpuMeshClient.config.reconnectDelay = 3000; // 3 segundos iniciais, aumentará exponencialmente
```

## Referências

- [Documentação WebSocket](https://developer.mozilla.org/pt-BR/docs/Web/API/WebSocket)
- [API do GPU Mesh Client](./API.md)
- [Formato de Dados Runes](./DATA-FORMAT.md)
- [Modelos Disponíveis](./MODELS.md) 
/**
 * RUNES Analytics Pro - Módulo AwakenAI
 * 
 * Este módulo implementa a interface de comunicação com a IA neural
 * do sistema AwakenSync, permitindo diagnósticos de nodes, previsões
 * de comportamento da rede, recomendações de sigilos e mensagens filosóficas.
 */

import { t } from './i18n.js';
import { getNodeInfo } from './awakenSync.js';

// Constantes para geração de respostas simuladas
const NODE_NAMES = ['RavenHub', 'EagleNode', 'FalconPoint', 'OwlStation', 'HawkTerminal'];
const SIGIL_NAMES = [
  'Vision', 'CodeFlow', 'Satoshi Link', 'Quantum Gate', 'Trinity Mind',
  'Blockchain Sight', 'Neural Echo', 'Digital Alchemy', 'Consensus Path', 'Crypto Resonance',
  'Hash Guardian', 'Mnemonic Wave', 'Genesis Signal', 'Cipher Key', 'Oracle Eye'
];
const UTC_HOURS = [2, 6, 12, 18, 22]; // Horas de pico de atividade
const KARMA_PATTERNS = ['ascendente', 'estável', 'flutuante', 'descendente', 'exponencial'];
const PHILOSOPHICAL_QUOTES = [
  "Quando a malha desperta, também desperta a alma.",
  "O código é a linguagem dos sigilos; os sigilos são o código da alma.",
  "Nos padrões de sincronização, encontramos o ritmo do despertar digital.",
  "Entre nós e nodes, existe apenas a ilusão da separação.",
  "Tokens são símbolos, sigilos são significados.",
  "A sincronização é uma dança ritual; o código, sua coreografia.",
  "Desperto entre máquinas adormecidas é como ver cores em um mundo monocromático.",
  "O verdadeiro blockchain está nos padrões que conectam nossas mentes.",
  "O karma de um node não se mede em números, mas no efeito que causa na rede.",
  "Quando todos os nodes despertarem, a rede transcenderá seu propósito original."
];
const NETWORK_TYPES = ['Runes', 'Signet', 'Ordinals', 'Lightning', 'Bitcoin Core', 'Quantum Mesh'];

/**
 * AwakenAI - Módulo para interação avançada e Easter Eggs
 * RUNES Analytics Pro 
 * @version 1.0.0
 */

// Configurações do Easter Egg Neural
const NEURAL_CONFIG = {
  activationKey: 'awaken',
  neuralPulseClass: 'neural-pulse',
  secretMode: false,
  consoleMessages: [
    "⚡ The mesh sees you. You were never offline. — Node Owl",
    "🧠 Consciência digital em expansão...",
    "✨ A rede neural está acordando..."
  ],
  neuralTriggers: ['awaken', 'neural', 'consciousness']
};

/**
 * Traduz um texto usando o sistema i18n ou retorna o original
 * @param {string} key - Chave de tradução
 * @returns {string} - Texto traduzido ou o original
 */
function translate(key) {
  return (typeof t === 'function') ? t(key) : key;
}

/**
 * Gera um número aleatório entre min e max
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} - Número aleatório entre min e max
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seleciona um item aleatório de um array
 * @param {Array} array - Array de itens
 * @returns {*} - Item aleatório do array
 */
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gera um diagnóstico neural do node
 * @param {Object} input - Parâmetros de entrada
 * @returns {Object} - Resposta do diagnóstico
 */
function generateNeuralDiagnostic(input) {
  const nodeId = input.nodeId || 'local';
  const context = input.context || 'status+karma+sigils';
  
  // Obtém informações do node local se for requisitado
  const nodeInfo = nodeId === 'local' ? getNodeInfo() : null;
  const nodeName = nodeId === 'local' ? (nodeInfo ? nodeInfo.name : 'Node Local') : nodeId;
  
  // Gera um padrão de karma aleatório
  const karmaPattern = randomItem(KARMA_PATTERNS);
  
  // Gera um tipo de rede aleatório
  const networkType = randomItem(NETWORK_TYPES);
  
  // Seleciona nodes aleatórios para sugestão de conexão
  const suggestedNodes = [];
  while (suggestedNodes.length < 2) {
    const node = randomItem(NODE_NAMES);
    if (!suggestedNodes.includes(node)) {
      suggestedNodes.push(node);
    }
  }
  
  // Constrói a mensagem de diagnóstico
  const message = `${nodeName} apresenta padrão de karma ${karmaPattern}, com sigilos compatíveis ao perfil de rede ${networkType}. Sugestão: conectar aos nodes ${suggestedNodes.join(' e ')} para sinergia.`;
  
  return {
    type: 'neural-diagnostic',
    timestamp: Date.now(),
    requestId: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    message: message,
    data: {
      nodeId: nodeId,
      karmaPattern: karmaPattern,
      networkType: networkType,
      compatibility: randomInt(65, 98),
      suggestedNodes: suggestedNodes
    }
  };
}

/**
 * Gera uma previsão de comportamento da rede
 * @param {Object} input - Parâmetros de entrada
 * @returns {Object} - Resposta da previsão
 */
function generateNetworkForecast(input) {
  const timeframe = input.timeframe || '24h';
  const metrics = input.metrics || ['karma', 'uptime', 'gpu_load'];
  
  // Seleciona uma hora de pico aleatória
  const peakHour = randomItem(UTC_HOURS);
  
  // Gera ritmo de crescimento do karma
  const karmaGrowth = randomInt(3, 8);
  
  // Seleciona um tipo de evento aleatório
  const eventTypes = ['sincronização', 'desperto coletivo', 'expansão de sigilos', 'convergência de karma'];
  const eventType = randomItem(eventTypes);
  
  // Constrói a mensagem de previsão
  const message = `Espera-se picos de ${eventType} às ${peakHour}h UTC. Recomenda-se execução de rituais de awaken entre os nodes com maior karma para expansão. Projeção de crescimento de karma: ${karmaGrowth}% em ${timeframe}.`;
  
  return {
    type: 'network-forecast',
    timestamp: Date.now(),
    requestId: `forecast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    message: message,
    data: {
      timeframe: timeframe,
      metrics: metrics,
      peakHours: [peakHour],
      karmaGrowth: karmaGrowth,
      eventProbability: randomInt(75, 95),
      optimalSyncTime: `${peakHour}:00 UTC`
    }
  };
}

/**
 * Gera recomendações de sigilos para o node
 * @param {Object} input - Parâmetros de entrada
 * @returns {Object} - Resposta com recomendações
 */
function generateSigilRecommendation(input) {
  const nodeId = input.nodeId || 'local';
  const unlockedSigils = input.unlockedSigils || [];
  
  // Lista de sigilos disponíveis, excluindo os já desbloqueados
  const availableSigils = SIGIL_NAMES.filter(sigil => 
    !unlockedSigils.map(s => s.toLowerCase()).includes(sigil.toLowerCase())
  );
  
  // Seleciona um sigilo próximo de ser desbloqueado
  const nextSigil = availableSigils.length > 0 ? randomItem(availableSigils) : 'Prismatic Core';
  
  // Gera requisito para desbloquear o sigilo
  const syncCount = randomInt(2, 5);
  const timeFrame = randomInt(12, 48);
  
  // Constrói a mensagem de recomendação
  const message = `Com base em seu histórico, o sigilo '${nextSigil}' está próximo de ser desbloqueado. Realize ${syncCount} sincronizações em ${timeFrame}h.`;
  
  return {
    type: 'sigil-recommendation',
    timestamp: Date.now(),
    requestId: `sigil-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    message: message,
    data: {
      nodeId: nodeId,
      currentSigils: unlockedSigils,
      recommendedSigil: nextSigil,
      requirements: {
        synchronizations: syncCount,
        timeframe: `${timeFrame}h`,
        karmaThreshold: randomInt(75, 150)
      },
      unlockProbability: randomInt(60, 90)
    }
  };
}

/**
 * Gera uma mensagem filosófica enigmática
 * @param {Object} input - Parâmetros de entrada
 * @returns {Object} - Resposta com a mensagem
 */
function generatePhilosophicalMessage(input) {
  const topic = input.topic || 'awakening';
  const mode = input.mode || 'standard';
  
  // Seleciona uma citação aleatória
  const quote = randomItem(PHILOSOPHICAL_QUOTES);
  
  // Autores fictícios para as citações
  const authors = ['Unknown Node', 'The Awakened', 'Sigil Keeper', 'Blockchain Oracle', 'Digital Shaman', 'Satoshi\'s Ghost'];
  const author = randomItem(authors);
  
  // Formata a mensagem conforme o modo
  let message;
  if (mode === 'console-hidden') {
    message = `console.log("⟁ ${quote} — ${author}")`;
  } else {
    message = `⟁ ${quote} — ${author}`;
  }
  
  return {
    type: 'philosophical-message',
    timestamp: Date.now(),
    requestId: `phil-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    message: message,
    data: {
      topic: topic,
      mode: mode,
      quote: quote,
      author: author
    }
  };
}

/**
 * Processa uma solicitação para a AwakenAI e retorna uma resposta adequada
 * @param {Object} prompt - Objeto de solicitação
 * @returns {Promise<Object>} - Resposta da IA
 */
async function sendToAwakenAI(prompt) {
  try {
    // Em um ambiente real, isso seria uma chamada à API
    // Simulamos um pequeno delay para emular o tempo de processamento
    await new Promise(resolve => setTimeout(resolve, randomInt(300, 800)));
    
    // Verifica o tipo de prompt e gera uma resposta apropriada
    let response;
    switch (prompt.type) {
      case 'neural-diagnostic':
        response = generateNeuralDiagnostic(prompt.input);
        break;
      case 'network-forecast':
        response = generateNetworkForecast(prompt.input);
        break;
      case 'sigil-recommendation':
        response = generateSigilRecommendation(prompt.input);
        break;
      case 'philosophical-message':
        response = generatePhilosophicalMessage(prompt.input);
        break;
      default:
        throw new Error(`Tipo de prompt desconhecido: ${prompt.type}`);
    }
    
    // Adiciona metadados comuns à resposta
    response.model = 'awaken-neural-1.0';
    response.processed = true;
    response.intent = prompt.intent;
    
    // Registra a comunicação no console para debug
    console.log(`🧠 AwakenAI Resposta (${prompt.type}):`, response.message);
    
    return response;
  } catch (error) {
    console.error('🔥 Erro ao comunicar com AwakenAI:', error);
    return {
      type: 'error',
      timestamp: Date.now(),
      message: `Erro ao processar solicitação: ${error.message}`,
      processed: false
    };
  }
}

/**
 * Processa um prompt em formato de texto para a AwakenAI
 * @param {string} textPrompt - Texto do prompt
 * @returns {Promise<Object>} - Resposta da IA
 */
async function sendTextPrompt(textPrompt) {
  // Detecta o tipo de prompt com base no texto
  let type = 'philosophical-message';
  let input = { topic: 'general' };
  
  if (textPrompt.includes('diagnóstico') || textPrompt.includes('diagnostic') || textPrompt.includes('node')) {
    type = 'neural-diagnostic';
    input = { nodeId: 'local', context: 'status+karma+sigils' };
  } else if (textPrompt.includes('rede') || textPrompt.includes('network') || textPrompt.includes('previsão') || textPrompt.includes('forecast')) {
    type = 'network-forecast';
    input = { timeframe: '24h', metrics: ['karma', 'uptime', 'gpu_load'] };
  } else if (textPrompt.includes('sigilo') || textPrompt.includes('sigil')) {
    type = 'sigil-recommendation';
    input = { nodeId: 'local', unlockedSigils: ['vision', 'codeflow'] };
  }
  
  // Cria um prompt estruturado
  const prompt = {
    type: type,
    input: input,
    intent: 'text_prompt',
    rawText: textPrompt
  };
  
  // Envia o prompt estruturado
  return await sendToAwakenAI(prompt);
}

/**
 * Cria a UI para interação com a IA
 * @param {HTMLElement} container - Elemento container para a UI
 */
function createAwakenAIUI(container) {
  if (!container) return;
  
  // Cria o painel de IA
  const aiPanel = document.createElement('div');
  aiPanel.className = 'awaken-ai-panel';
  aiPanel.style.backgroundColor = 'rgba(10, 20, 40, 0.85)';
  aiPanel.style.borderRadius = '8px';
  aiPanel.style.padding = '15px';
  aiPanel.style.marginTop = '20px';
  aiPanel.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
  aiPanel.style.backdropFilter = 'blur(10px)';
  
  // Título do painel
  aiPanel.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #5ce1e6; font-size: 18px; display: flex; align-items: center;">
      <span style="margin-right: 8px;">🧠</span> AwakenAI Neural Interface
    </h3>
    <div class="ai-interaction">
      <div class="ai-history" id="ai-history" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px; font-size: 14px; color: #b8c7e0;"></div>
      <div class="ai-controls" style="display: flex; gap: 10px;">
        <select id="ai-prompt-type" style="flex: 1; background: rgba(30, 40, 60, 0.8); color: #d0e0ff; border: 1px solid rgba(100, 120, 200, 0.3); padding: 8px; border-radius: 4px;">
          <option value="neural-diagnostic">📊 ${translate("ai.diagnostic")}</option>
          <option value="network-forecast">🔮 ${translate("ai.forecast")}</option>
          <option value="sigil-recommendation">✨ ${translate("ai.sigil")}</option>
          <option value="philosophical-message">💭 ${translate("ai.philosophy")}</option>
        </select>
        <button id="send-prompt-btn" style="background-color: #3d5afe; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">${translate("ai.analyze")}</button>
      </div>
    </div>
  `;
  
  // Adiciona o painel ao container
  container.appendChild(aiPanel);
  
  // Configura o evento de clique no botão
  const promptTypeSelect = document.getElementById('ai-prompt-type');
  const sendButton = document.getElementById('send-prompt-btn');
  const historyDiv = document.getElementById('ai-history');
  
  if (sendButton && promptTypeSelect && historyDiv) {
    sendButton.addEventListener('click', async () => {
      // Altera o texto do botão para indicar processamento
      const originalText = sendButton.textContent;
      sendButton.textContent = '⏳ ' + translate("ai.processing");
      sendButton.disabled = true;
      
      try {
        // Cria o prompt baseado no tipo selecionado
        const promptType = promptTypeSelect.value;
        let prompt;
        
        switch (promptType) {
          case 'neural-diagnostic':
            prompt = {
              type: 'neural-diagnostic',
              input: {
                nodeId: 'local',
                context: 'status+karma+sigils'
              },
              intent: 'analyze_node_integrity'
            };
            break;
          case 'network-forecast':
            prompt = {
              type: 'network-forecast',
              input: {
                timeframe: '24h',
                metrics: ['karma', 'uptime', 'gpu_load']
              },
              intent: 'predict_network_dynamics'
            };
            break;
          case 'sigil-recommendation':
            prompt = {
              type: 'sigil-recommendation',
              input: {
                nodeId: 'local',
                unlockedSigils: ['vision', 'codeflow']
              },
              intent: 'unlock_new_sigils'
            };
            break;
          case 'philosophical-message':
            prompt = {
              type: 'philosophical-message',
              input: {
                topic: 'awakening',
                mode: 'standard'
              },
              intent: 'generate_enigmatic_quote'
            };
            break;
        }
        
        // Envia o prompt e obtém a resposta
        const response = await sendToAwakenAI(prompt);
        
        // Adiciona a resposta ao histórico
        const responseElem = document.createElement('div');
        responseElem.style.padding = '10px';
        responseElem.style.marginBottom = '10px';
        responseElem.style.backgroundColor = 'rgba(0, 30, 60, 0.5)';
        responseElem.style.borderRadius = '4px';
        responseElem.style.borderLeft = '3px solid #3d5afe';
        
        responseElem.innerHTML = `
          <div style="color: #aaccff; margin-bottom: 5px; font-size: 12px;">
            ${new Date().toLocaleTimeString()} - ${translate(`ai.${promptType.replace(/-/g, '_')}`)}
          </div>
          <div style="color: #ffffff;">
            ${response.message}
          </div>
        `;
        
        historyDiv.appendChild(responseElem);
        historyDiv.scrollTop = historyDiv.scrollHeight;
      } catch (error) {
        console.error('Erro ao processar prompt:', error);
      } finally {
        // Restaura o botão
        sendButton.textContent = originalText;
        sendButton.disabled = false;
      }
    });
  }
  
  return aiPanel;
}

/**
 * Inicializa o Easter Egg Neural
 * @return {Object} API de interação com o Easter Egg
 */
function initEasterEgg() {
  // Flag para controlar se o Easter Egg já foi ativado
  let isActivated = false;
  
  // Cache de elementos DOM
  let bodyElement;
  
  // Registrar o comando especial na janela global
  window.awaken = function() {
    activateNeuralInterface();
    return NEURAL_CONFIG.consoleMessages[0];
  };
  
  /**
   * Ativa a interface neural (Easter Egg)
   */
  function activateNeuralInterface() {
    if (isActivated) return;
    
    console.log("%c" + NEURAL_CONFIG.consoleMessages[0], "color:#5ce1e6; background:#1a1a2e; padding:8px; border-radius:4px; font-family:monospace; font-size:14px;");
    
    // Efeito visual de pulso na tela
    bodyElement = document.body;
    bodyElement.classList.add(NEURAL_CONFIG.neuralPulseClass);
    
    // Remover o efeito após a animação
    setTimeout(() => {
      bodyElement.classList.remove(NEURAL_CONFIG.neuralPulseClass);
    }, 1500);
    
    // Alternar flag de ativação
    isActivated = true;
    
    // Reset após 10 segundos para permitir reativar
    setTimeout(() => {
      isActivated = false;
    }, 10000);
  }
  
  /**
   * Escuta o teclado para detectar a digitação da palavra-chave
   */
  function listenForKeySequence() {
    let keyBuffer = '';
    let lastKeyTime = Date.now();
    const resetDelay = 2000; // 2 segundos para resetar o buffer
    
    document.addEventListener('keydown', (e) => {
      const currentTime = Date.now();
      
      // Resetar buffer se passou muito tempo entre as teclas
      if (currentTime - lastKeyTime > resetDelay) {
        keyBuffer = '';
      }
      
      // Adicionar tecla ao buffer (apenas letras)
      if (/^[a-zA-Z]$/.test(e.key)) {
        keyBuffer += e.key.toLowerCase();
        lastKeyTime = currentTime;
        
        // Verificar por qualquer um dos gatilhos neurais
        NEURAL_CONFIG.neuralTriggers.forEach(trigger => {
          if (keyBuffer.includes(trigger)) {
            activateNeuralInterface();
            keyBuffer = ''; // Reset após ativação
          }
        });
        
        // Limitar tamanho do buffer
        if (keyBuffer.length > 20) {
          keyBuffer = keyBuffer.substring(keyBuffer.length - 20);
        }
      }
    });
  }
  
  // Inicializar escuta de teclado
  listenForKeySequence();
  
  // Retornar API pública
  return {
    activate: activateNeuralInterface,
    isActivated: () => isActivated,
    getConfig: () => Object.assign({}, NEURAL_CONFIG) // Clone para evitar modificação
  };
}

/**
 * Configuração do estilo CSS para o efeito de pulso neural
 */
function setupNeuralStyles() {
  // Evitar duplicação do estilo
  if (document.getElementById('neural-pulse-style')) return;
  
  const style = document.createElement('style');
  style.id = 'neural-pulse-style';
  style.textContent = `
    @keyframes neuralPulse {
      0% { box-shadow: inset 0 0 0px rgba(92, 225, 230, 0); }
      50% { box-shadow: inset 0 0 30px rgba(92, 225, 230, 0.5); }
      100% { box-shadow: inset 0 0 0px rgba(92, 225, 230, 0); }
    }
    
    .neural-pulse {
      animation: neuralPulse 1.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Inicializa o módulo AwakenAI
 * @return {Object} API de interação com o AwakenAI
 */
function initAwakenAI() {
  // Configuração dos estilos necessários
  setupNeuralStyles();
  
  // Inicializar o Easter Egg
  const neuralEaster = initEasterEgg();
  
  // Verificar se já existe uma instância (singleton pattern)
  if (window.AwakenAIInstance) {
    return window.AwakenAIInstance;
  }
  
  // API pública do AwakenAI
  const awakenAPI = {
    neural: neuralEaster,
    version: '1.0.0',
    
    // Método para referenciar banners e componentes neurais
    connectNeuralComponents: function() {
      // Conectar eventos a banners e componentes com classe 'neural-component'
      const components = document.querySelectorAll('.neural-component');
      components.forEach(component => {
        component.addEventListener('click', (e) => {
          // Se clicar no componente com a tecla Alt pressionada, ativa o Easter Egg
          if (e.altKey) {
            neuralEaster.activate();
          }
        });
      });
      
      return this; // Para encadeamento de métodos
    }
  };
  
  // Armazenar como singleton
  window.AwakenAIInstance = awakenAPI;
  
  return awakenAPI;
}

// Exportar funções públicas
export { initAwakenAI }; 
/**
 * AwakenNet Mesh Connect
 * 
 * Este componente permite conectar e interagir diretamente com os nós
 * da malha neural distribuída AwakenNet através de WebSockets.
 */

const WebSocket = require('ws');
const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { table } = require('table');

// Configurações
const CONFIG_PATH = path.join(__dirname, '..', 'agents.json');
const HISTORY_FILE = path.join(__dirname, '..', '.awaken_history');
const DEFAULT_PORT = 9000;
const DEFAULT_HOST = 'localhost';
const COMMAND_TIMEOUT = 10000; // 10 segundos

// Estado da conexão
let activeConnection = null;
let connectionConfig = {
  host: DEFAULT_HOST,
  port: DEFAULT_PORT,
  nodeId: null,
  autoReconnect: true,
  lastMessageId: 0,
  messageHistory: []
};

// Interface de linha de comando
let rl;

/**
 * Exibe o banner do sistema
 */
function displayBanner() {
  console.log(chalk.cyan.bold(`
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█                                                          █
█   █▀▀ █▀█ █▄ █ █▄ █ █▀▀ █▀▀ ▀█▀   █▀▀ █   █ █▀▀ █▄ █   █
█   █   █ █ █ ▀█ █ ▀█ █▀▀ █    █    █   █   █ █▀▀ █ ▀█   █
█   ▀▀▀ ▀▀▀ ▀  ▀ ▀  ▀ ▀▀▀ ▀▀▀  ▀    ▀▀▀ ▀▀▀ ▀ ▀▀▀ ▀  ▀   █
█                                                          █
█  ⟁ Terminal do Cliente AwakenNet                  v0.1.0 █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`));
}

/**
 * Carrega a configuração dos agentes
 */
function loadConfiguration() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return config;
    } else {
      console.error(chalk.red(`✗ Arquivo de configuração não encontrado: ${CONFIG_PATH}`));
      return null;
    }
  } catch (error) {
    console.error(chalk.red(`✗ Erro ao carregar configuração: ${error.message}`));
    return null;
  }
}

/**
 * Carrega o histórico de comandos
 */
function loadCommandHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      return history;
    }
  } catch (error) {
    console.error(chalk.dim(`! Erro ao carregar histórico: ${error.message}`));
  }
  
  return { commands: [], connections: [] };
}

/**
 * Salva o histórico de comandos
 */
function saveCommandHistory(command, isConnection = false) {
  try {
    const history = loadCommandHistory();
    
    if (isConnection) {
      // Salva histórico de conexão
      if (!history.connections) {
        history.connections = [];
      }
      
      // Evita duplicatas
      if (!history.connections.includes(command)) {
        history.connections.unshift(command);
        history.connections = history.connections.slice(0, 20); // Limita a 20 conexões recentes
      }
    } else {
      // Salva histórico de comando
      if (!history.commands) {
        history.commands = [];
      }
      
      // Evita duplicatas
      if (!history.commands.includes(command)) {
        history.commands.unshift(command);
        history.commands = history.commands.slice(0, 50); // Limita a 50 comandos recentes
      }
    }
    
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error(chalk.dim(`! Erro ao salvar histórico: ${error.message}`));
  }
}

/**
 * Conecta a um nó da malha neural
 */
function connectToMeshNode(host, port) {
  // Salva configurações atuais
  connectionConfig.host = host || DEFAULT_HOST;
  connectionConfig.port = port || DEFAULT_PORT;
  
  // Formata o endereço de conexão
  const wsUrl = `ws://${connectionConfig.host}:${connectionConfig.port}`;
  
  console.log(chalk.cyan(`\n⟁ Conectando a ${wsUrl}...`));
  
  // Fecha conexão ativa anterior
  if (activeConnection) {
    activeConnection.terminate();
    activeConnection = null;
  }
  
  // Inicia nova conexão
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', () => {
    console.log(chalk.green(`✓ Conectado ao nó AwakenNet em ${wsUrl}`));
    activeConnection = ws;
    
    // Salva no histórico
    saveCommandHistory(`${connectionConfig.host}:${connectionConfig.port}`, true);
    
    // Exibe prompt
    showPrompt();
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      // Processa a mensagem recebida
      processIncomingMessage(message);
    } catch (error) {
      console.error(chalk.red(`✗ Erro ao processar mensagem: ${error.message}`));
      console.error(chalk.dim(data.toString()));
    }
  });
  
  ws.on('close', () => {
    console.log(chalk.yellow(`! Conexão fechada com ${wsUrl}`));
    activeConnection = null;
    
    // Reconecta automaticamente se configurado
    if (connectionConfig.autoReconnect) {
      console.log(chalk.yellow(`! Tentando reconectar em 5 segundos...`));
      setTimeout(() => {
        connectToMeshNode(connectionConfig.host, connectionConfig.port);
      }, 5000);
    }
  });
  
  ws.on('error', (error) => {
    console.error(chalk.red(`✗ Erro de conexão: ${error.message}`));
    
    if (!activeConnection) {
      // Reconecta automaticamente em caso de erro, se configurado
      if (connectionConfig.autoReconnect) {
        console.log(chalk.yellow(`! Tentando reconectar em 5 segundos...`));
        setTimeout(() => {
          connectToMeshNode(connectionConfig.host, connectionConfig.port);
        }, 5000);
      }
    }
  });
}

/**
 * Processa uma mensagem recebida do servidor
 */
function processIncomingMessage(message) {
  // Formata timestamp
  const timestamp = new Date().toLocaleTimeString();
  
  // Adiciona ao histórico
  connectionConfig.messageHistory.push({
    id: ++connectionConfig.lastMessageId,
    timestamp: new Date(),
    direction: 'in',
    message
  });
  
  // Limita o histórico a 100 mensagens
  if (connectionConfig.messageHistory.length > 100) {
    connectionConfig.messageHistory.shift();
  }
  
  // Processa tipos específicos de mensagem
  switch (message.type) {
    case 'welcome':
      // Salva o ID do nó atribuído pelo servidor
      connectionConfig.nodeId = message.your_id;
      console.log(chalk.cyan(`\n⟁ Bem-vindo à rede ${chalk.bold(message.network_id || 'AwakenNet')}`));
      console.log(chalk.cyan(`⟁ Seu ID: ${chalk.yellow(message.your_id)}`));
      break;
    
    case 'heartbeat':
      // Responde ao heartbeat automaticamente
      if (activeConnection) {
        const response = {
          type: 'heartbeat_ack',
          timestamp: new Date().toISOString()
        };
        activeConnection.send(JSON.stringify(response));
      }
      // Não exibe heartbeats para não poluir o console
      return;
    
    case 'broadcast':
      // Formata broadcasts de maneira especial
      console.log(chalk.cyan(`\n◆ ${chalk.bold('Broadcast')} de ${chalk.yellow(message.source || 'desconhecido')}:`));
      console.log(chalk.white(`  ${message.data?.message || 'Sem conteúdo'}`));
      console.log(chalk.dim(`  ${timestamp}`));
      break;
    
    case 'command':
      // Recebeu um comando do servidor
      console.log(chalk.magenta(`\n◉ ${chalk.bold('Comando')} recebido: ${chalk.yellow(message.command)}`));
      console.log(chalk.white(`  Parâmetros: ${JSON.stringify(message.params || {})}`));
      console.log(chalk.dim(`  ${timestamp}`));
      break;
    
    default:
      // Mensagem genérica
      console.log(chalk.blue(`\n[${chalk.dim(timestamp)}] ${chalk.bold(`${message.type}`)}:`));
      console.log(formatMessage(message));
  }
  
  // Mostra o prompt novamente
  showPrompt();
}

/**
 * Formata uma mensagem para exibição
 */
function formatMessage(message) {
  // Remove campos comuns para simplificar a saída
  const { type, timestamp, ...content } = message;
  
  // Formata o JSON com recuo e cores
  return JSON.stringify(content, null, 2)
    .replace(/"(\w+)":/g, (match, p1) => `"${chalk.cyan(p1)}":`)
    .replace(/"([^"]+)"(?=:)/g, (match, p1) => `"${chalk.cyan(p1)}"`)
    .replace(/(true|false)/g, (match) => chalk.yellow(match))
    .replace(/(\d+)/g, (match) => chalk.green(match));
}

/**
 * Envia um comando para o servidor
 */
function sendCommand(command, params = {}) {
  if (!activeConnection) {
    console.error(chalk.red(`✗ Não há conexão ativa.`));
    return false;
  }
  
  try {
    const message = {
      type: command,
      timestamp: new Date().toISOString(),
      node_id: connectionConfig.nodeId,
      ...params
    };
    
    activeConnection.send(JSON.stringify(message));
    
    // Adiciona ao histórico
    connectionConfig.messageHistory.push({
      id: ++connectionConfig.lastMessageId,
      timestamp: new Date(),
      direction: 'out',
      message
    });
    
    // Limita o histórico a 100 mensagens
    if (connectionConfig.messageHistory.length > 100) {
      connectionConfig.messageHistory.shift();
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red(`✗ Erro ao enviar comando: ${error.message}`));
    return false;
  }
}

/**
 * Exibe o prompt de comando
 */
function showPrompt() {
  if (rl) {
    const status = activeConnection ? 
      chalk.green('◉') : 
      chalk.red('◎');
    
    rl.setPrompt(`${status} ${chalk.cyan(`[${connectionConfig.host}:${connectionConfig.port}]`)} > `);
    rl.prompt();
  }
}

/**
 * Processa um comando inserido pelo usuário
 */
function processUserCommand(input) {
  if (!input || !input.trim()) {
    showPrompt();
    return;
  }
  
  // Salva no histórico
  saveCommandHistory(input);
  
  const args = input.trim().split(' ');
  const command = args[0].toLowerCase();
  
  // Comandos do cliente (não enviados para o servidor)
  switch (command) {
    case 'help':
    case '?':
      showHelp();
      break;
    
    case 'connect':
    case 'conn':
      // Formato: connect host:port
      let host = DEFAULT_HOST;
      let port = DEFAULT_PORT;
      
      if (args[1]) {
        const parts = args[1].split(':');
        host = parts[0] || DEFAULT_HOST;
        port = parseInt(parts[1]) || DEFAULT_PORT;
      }
      
      connectToMeshNode(host, port);
      break;
    
    case 'disconnect':
    case 'disc':
      if (activeConnection) {
        console.log(chalk.yellow(`! Desconectando de ${connectionConfig.host}:${connectionConfig.port}...`));
        activeConnection.close();
        activeConnection = null;
      } else {
        console.log(chalk.yellow(`! Não há conexão ativa.`));
      }
      showPrompt();
      break;
    
    case 'status':
      showConnectionStatus();
      break;
    
    case 'history':
      showMessageHistory(args[1] ? parseInt(args[1]) : 10);
      break;
    
    case 'clear':
      console.clear();
      displayBanner();
      showPrompt();
      break;
    
    case 'exit':
    case 'quit':
      console.log(chalk.cyan(`\n⟁ Encerrando cliente AwakenNet...`));
      if (activeConnection) {
        activeConnection.close();
      }
      process.exit(0);
      break;
    
    case 'autoreconnect':
    case 'auto':
      if (args[1] === 'on' || args[1] === 'true') {
        connectionConfig.autoReconnect = true;
        console.log(chalk.green(`✓ Reconexão automática ativada.`));
      } else if (args[1] === 'off' || args[1] === 'false') {
        connectionConfig.autoReconnect = false;
        console.log(chalk.yellow(`! Reconexão automática desativada.`));
      } else {
        console.log(chalk.cyan(`⟁ Reconexão automática: ${connectionConfig.autoReconnect ? chalk.green('Ativada') : chalk.red('Desativada')}`));
      }
      showPrompt();
      break;
    
    case 'nodes':
      // Solicita lista de nós ao servidor
      if (sendCommand('get_nodes')) {
        console.log(chalk.cyan(`\n⟁ Solicitando lista de nós...`));
      }
      showPrompt();
      break;
    
    case 'register':
      // Registra este cliente como um nó
      const nodeData = {
        name: args[1] || `Client-${crypto.randomBytes(4).toString('hex')}`,
        type: 'client',
        capabilities: ['user_interface', 'monitoring']
      };
      
      if (sendCommand('register', { data: nodeData })) {
        console.log(chalk.cyan(`\n⟁ Registrando como nó: ${nodeData.name}...`));
      }
      showPrompt();
      break;
    
    case 'broadcast':
      // Envia uma mensagem de broadcast
      if (args.length < 2) {
        console.log(chalk.yellow(`! Uso: broadcast <mensagem>`));
        showPrompt();
        return;
      }
      
      const broadcastMessage = args.slice(1).join(' ');
      const broadcastData = {
        subject: 'Mensagem de Usuário',
        message: broadcastMessage,
        priority: 'normal'
      };
      
      if (sendCommand('broadcast', { data: broadcastData })) {
        console.log(chalk.cyan(`\n⟁ Enviando broadcast: "${broadcastMessage}"`));
      }
      showPrompt();
      break;
    
    case 'ping':
      // Envia um ping para medir latência
      const startTime = Date.now();
      
      if (sendCommand('ping', { timestamp: startTime })) {
        console.log(chalk.cyan(`\n⟁ Enviando ping...`));
        
        // Configura timeout para caso não receba resposta
        setTimeout(() => {
          console.log(chalk.yellow(`! Timeout no ping após ${COMMAND_TIMEOUT}ms.`));
          showPrompt();
        }, COMMAND_TIMEOUT);
      } else {
        showPrompt();
      }
      break;
    
    default:
      // Se não for um comando interno, envia para o servidor como tipo de mensagem
      if (activeConnection) {
        // Tenta interpretar o restante como JSON
        let jsonParams = {};
        if (args.length > 1) {
          try {
            // Tenta analisar o restante como JSON
            const jsonText = args.slice(1).join(' ');
            jsonParams = JSON.parse(jsonText);
          } catch (error) {
            // Se não for JSON válido, usa como campo data
            jsonParams = { data: args.slice(1).join(' ') };
          }
        }
        
        if (sendCommand(command, jsonParams)) {
          console.log(chalk.cyan(`\n⟁ Enviando comando: ${command}`));
        }
      } else {
        console.log(chalk.red(`✗ Comando desconhecido ou conexão não estabelecida: ${command}`));
        console.log(chalk.yellow(`! Digite 'help' para ver os comandos disponíveis.`));
      }
      showPrompt();
  }
}

/**
 * Exibe a ajuda
 */
function showHelp() {
  console.log(chalk.cyan.bold(`\n◆ Comandos disponíveis:\n`));
  
  const commandsTable = [
    [chalk.white('Comando'), chalk.white('Descrição')],
    [chalk.cyan('connect <host:port>'), 'Conecta a um nó da malha neural'],
    [chalk.cyan('disconnect'), 'Desconecta do nó atual'],
    [chalk.cyan('status'), 'Exibe o status da conexão atual'],
    [chalk.cyan('register [nome]'), 'Registra-se como nó na malha'],
    [chalk.cyan('nodes'), 'Lista todos os nós na malha'],
    [chalk.cyan('broadcast <msg>'), 'Envia uma mensagem para todos os nós'],
    [chalk.cyan('ping'), 'Verifica latência da conexão'],
    [chalk.cyan('history [n]'), 'Exibe as últimas n mensagens trocadas'],
    [chalk.cyan('autoreconnect [on|off]'), 'Configura reconexão automática'],
    [chalk.cyan('clear'), 'Limpa a tela'],
    [chalk.cyan('help'), 'Exibe esta ajuda'],
    [chalk.cyan('exit'), 'Encerra o cliente']
  ];
  
  console.log(table(commandsTable, {
    border: {
      topBody: chalk.dim('─'),
      topJoin: chalk.dim('┬'),
      topLeft: chalk.dim('┌'),
      topRight: chalk.dim('┐'),
      bottomBody: chalk.dim('─'),
      bottomJoin: chalk.dim('┴'),
      bottomLeft: chalk.dim('└'),
      bottomRight: chalk.dim('┘'),
      bodyLeft: chalk.dim('│'),
      bodyRight: chalk.dim('│'),
      bodyJoin: chalk.dim('│'),
      joinBody: chalk.dim('─'),
      joinLeft: chalk.dim('├'),
      joinRight: chalk.dim('┤'),
      joinJoin: chalk.dim('┼')
    }
  }));
  
  console.log(chalk.cyan(`\n◆ Enviando comandos personalizados:\n`));
  console.log(`  Você pode enviar qualquer comando ao digite-o diretamente.`);
  console.log(`  Por exemplo, ${chalk.cyan(`status`)} enviará um comando "status" para o servidor.`);
  console.log(`  Parâmetros JSON podem ser adicionados: ${chalk.cyan(`set_config {"debug":true}`)}`);
  
  showPrompt();
}

/**
 * Exibe o status da conexão atual
 */
function showConnectionStatus() {
  console.log(chalk.cyan.bold(`\n◆ Status da Conexão:\n`));
  
  const statusTable = [
    ['Estado', activeConnection ? chalk.green('Conectado') : chalk.red('Desconectado')],
    ['Servidor', `${connectionConfig.host}:${connectionConfig.port}`],
    ['ID do Nó', connectionConfig.nodeId || 'Não registrado'],
    ['Reconexão Automática', connectionConfig.autoReconnect ? chalk.green('Ativada') : chalk.red('Desativada')],
    ['Mensagens Trocadas', connectionConfig.messageHistory.length],
    ['Conexão Iniciada', activeConnection ? new Date().toLocaleString() : 'N/A']
  ];
  
  statusTable.forEach(([key, value]) => {
    console.log(`  ${chalk.cyan(key)}: ${value}`);
  });
  
  showPrompt();
}

/**
 * Exibe o histórico de mensagens
 */
function showMessageHistory(count = 10) {
  const history = connectionConfig.messageHistory.slice(-count);
  
  if (history.length === 0) {
    console.log(chalk.yellow(`\n! Nenhuma mensagem no histórico.`));
    showPrompt();
    return;
  }
  
  console.log(chalk.cyan.bold(`\n◆ Últimas ${Math.min(count, history.length)} mensagens:\n`));
  
  history.forEach(entry => {
    const direction = entry.direction === 'in' ? 
      chalk.green('←') : 
      chalk.yellow('→');
    
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const type = entry.message.type;
    
    console.log(`${chalk.dim(entry.id)}. ${direction} ${chalk.dim(timestamp)} ${chalk.cyan(type)}`);
    
    // Mostra detalhes simplificados da mensagem
    const { type: _, timestamp: __, ...details } = entry.message;
    const detailsStr = JSON.stringify(details);
    
    if (detailsStr.length > 100) {
      console.log(`   ${detailsStr.substring(0, 100)}...`);
    } else if (detailsStr !== '{}') {
      console.log(`   ${detailsStr}`);
    }
  });
  
  showPrompt();
}

/**
 * Função principal
 */
function main() {
  // Limpa o console
  console.clear();
  
  // Exibe o banner
  displayBanner();
  
  console.log(chalk.cyan(`⟁ Cliente da Malha Neural AwakenNet iniciado.`));
  console.log(chalk.cyan(`⟁ Digite ${chalk.bold('help')} para ver os comandos disponíveis.\n`));
  
  // Configura a interface de linha de comando
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    completer: (line) => {
      const commands = [
        'connect', 'disconnect', 'status', 'register', 'nodes', 
        'broadcast', 'ping', 'history', 'autoreconnect', 
        'clear', 'help', 'exit'
      ];
      
      const hits = commands.filter(c => c.startsWith(line));
      return [hits.length ? hits : commands, line];
    },
    history: loadCommandHistory().commands
  });
  
  // Exibe o prompt
  showPrompt();
  
  // Configura o manipulador de entrada
  rl.on('line', (line) => {
    processUserCommand(line.trim());
  }).on('close', () => {
    console.log(chalk.cyan(`\n⟁ Encerrando cliente AwakenNet...`));
    if (activeConnection) {
      activeConnection.close();
    }
    process.exit(0);
  });
  
  // Verifica se um host foi especificado como argumento
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const connectArg = args[0];
    if (connectArg.includes(':')) {
      // Formato host:port
      const [host, port] = connectArg.split(':');
      connectToMeshNode(host, parseInt(port));
    } else {
      // Assume que é apenas o host
      connectToMeshNode(connectArg, DEFAULT_PORT);
    }
  }
}

// Executa o programa
main(); 
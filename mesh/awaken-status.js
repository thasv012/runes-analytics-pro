/**
 * AwakenNet Mesh Status Monitor
 * 
 * Este componente verifica e exibe o status da malha neural distribuída AwakenNet,
 * mostrando informações sobre cada nó, conexões e métricas do sistema.
 */

const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const fs = require('fs');
const path = require('path');

// Configurações
const CONFIG_PATH = path.join(__dirname, '..', 'agents.json');
const STATUS_CHECK_INTERVAL = 5000; // 5 segundos
const MAX_RETRY_ATTEMPTS = 3;

// Símbolos para o terminal
const symbols = {
  online: chalk.green('●'),
  offline: chalk.red('●'),
  degraded: chalk.yellow('●'),
  unknown: chalk.gray('●')
};

// Função principal
async function main() {
  // Limpa o console
  console.clear();
  
  // Exibe o banner
  displayBanner();
  
  console.log(chalk.cyan.bold('⟁ Verificando status da malha neural AwakenNet...\n'));
  
  // Carrega a configuração
  const config = loadConfiguration();
  
  if (!config || !config.agents || config.agents.length === 0) {
    console.error(chalk.red('✗ Nenhum agente configurado encontrado.'));
    process.exit(1);
  }
  
  // Obtém o status dos agentes
  const spinner = ora('Verificando status dos nós...').start();
  
  try {
    const agentsStatus = await checkAgentsStatus(config.agents);
    spinner.succeed('Status dos nós obtido com sucesso.');
    
    // Exibe o status dos agentes
    displayAgentsStatus(agentsStatus, config);
    
    // Exibe métricas globais
    displayNetworkMetrics(agentsStatus, config);
    
    // Modo de monitoramento contínuo
    if (process.argv.includes('--watch') || process.argv.includes('-w')) {
      console.log(chalk.cyan('\n⟁ Modo de monitoramento contínuo ativado. Pressione Ctrl+C para sair.\n'));
      
      // Atualiza o status periodicamente
      setInterval(async () => {
        console.clear();
        displayBanner();
        
        const spinner = ora('Atualizando status dos nós...').start();
        const newStatus = await checkAgentsStatus(config.agents);
        spinner.succeed('Status atualizado com sucesso.');
        
        displayAgentsStatus(newStatus, config);
        displayNetworkMetrics(newStatus, config);
        
        console.log(chalk.dim(`\nÚltima atualização: ${new Date().toLocaleTimeString()}`));
        console.log(chalk.cyan('⟁ Monitoramento contínuo ativo. Pressione Ctrl+C para sair.'));
      }, STATUS_CHECK_INTERVAL);
    }
  } catch (error) {
    spinner.fail('Erro ao verificar status dos nós.');
    console.error(chalk.red(`✗ ${error.message}`));
    process.exit(1);
  }
}

/**
 * Exibe o banner do sistema
 */
function displayBanner() {
  console.log(chalk.cyan.bold(`
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█                                                          █
█  █▀▄▀█ █▀▀ █▀▀ █ █   █▀▀ ▀█▀ █▀█ ▀█▀ █ █ █▀▀  █▀█ █   █
█  █ █ █ █▀▀ ▀▀█ █▀█   ▀▀█  █  █▀█  █  █ █ ▀▀█  █ █ █   █
█  ▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀▀▀  ▀▀▀ ▀   █
█                                                          █
█  ⟁ Status da Malha Neural                         v0.1.0 █
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
      console.log(chalk.green(`✓ Configuração carregada: ${config.agents.length} agentes encontrados.`));
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
 * Verifica o status de cada agente
 */
async function checkAgentsStatus(agents) {
  const statusPromises = agents.map(agent => checkAgentStatus(agent));
  return Promise.all(statusPromises);
}

/**
 * Verifica o status de um agente específico
 */
async function checkAgentStatus(agent) {
  const agentStatus = {
    id: agent.id,
    name: agent.name,
    type: agent.type,
    host: agent.host,
    port: agent.port,
    status: 'unknown',
    metrics: {},
    error: null,
    lastSeen: null
  };
  
  // Skip se o host ou port não estiverem definidos
  if (!agent.host || !agent.port) {
    agentStatus.status = 'unknown';
    agentStatus.error = 'Host ou porta não definidos';
    return agentStatus;
  }
  
  const url = `http://${agent.host}:${agent.port}/status`;
  
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await axios.get(url, { timeout: 3000 });
      
      // Atualiza o status com base na resposta
      agentStatus.status = response.data.status || 'online';
      agentStatus.metrics = response.data.metrics || {};
      agentStatus.lastSeen = new Date().toISOString();
      
      // Se chegou aqui, a requisição foi bem-sucedida
      return agentStatus;
    } catch (error) {
      // Em caso de erro, marca como offline e registra o erro
      agentStatus.status = 'offline';
      agentStatus.error = error.message;
      
      // Se não for a última tentativa, esperamos um pouco antes de tentar novamente
      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  return agentStatus;
}

/**
 * Exibe o status dos agentes em uma tabela
 */
function displayAgentsStatus(agentsStatus, config) {
  console.log(chalk.cyan.bold('\n◆ Status dos Nós:\n'));
  
  const table = new Table({
    head: [
      'Status',
      'ID',
      'Nome',
      'Tipo',
      'Host:Porta',
      'Uptime',
      'Carga',
      'Última Verificação'
    ],
    style: {
      head: ['cyan', 'bold'],
      border: ['dim']
    }
  });
  
  agentsStatus.forEach(agent => {
    const statusSymbol = symbols[agent.status] || symbols.unknown;
    
    // Obtém a métrica de uptime, se disponível
    const uptime = agent.metrics.uptime 
      ? formatUptime(agent.metrics.uptime)
      : 'N/A';
    
    // Obtém a métrica de carga, combinando CPU e GPU se disponíveis
    let load = 'N/A';
    if (agent.metrics.cpu_usage !== undefined) {
      load = `CPU: ${agent.metrics.cpu_usage}%`;
      
      if (agent.metrics.gpu_usage !== undefined) {
        load += ` | GPU: ${agent.metrics.gpu_usage}%`;
      }
    } else if (agent.metrics.load !== undefined) {
      load = `${agent.metrics.load}%`;
    }
    
    // Formata a última verificação
    const lastCheck = agent.lastSeen 
      ? new Date(agent.lastSeen).toLocaleTimeString()
      : 'Nunca';
    
    // Adiciona a linha à tabela
    table.push([
      statusSymbol,
      agent.id,
      truncate(agent.name, 20),
      formatAgentType(agent.type),
      `${agent.host}:${agent.port}`,
      uptime,
      load,
      lastCheck
    ]);
  });
  
  console.log(table.toString());
  
  // Se houver agentes offline, exibe a lista
  const offlineAgents = agentsStatus.filter(agent => agent.status === 'offline');
  if (offlineAgents.length > 0) {
    console.log(chalk.yellow(`\n! ${offlineAgents.length} nós offline:`));
    offlineAgents.forEach(agent => {
      console.log(chalk.yellow(`  - ${agent.name} (${agent.id}): ${agent.error}`));
    });
  }
}

/**
 * Formata o tipo de agente para exibição
 */
function formatAgentType(type) {
  switch (type) {
    case 'master':
      return chalk.magenta('Master');
    case 'worker':
      return chalk.blue('Worker');
    case 'storage':
      return chalk.green('Storage');
    case 'interface':
      return chalk.cyan('Interface');
    default:
      return chalk.dim(type || 'Unknown');
  }
}

/**
 * Formata o tempo de atividade para exibição
 */
function formatUptime(seconds) {
  if (isNaN(seconds)) return 'N/A';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m ${seconds % 60}s`;
  }
}

/**
 * Trunca uma string se ela for maior que um tamanho específico
 */
function truncate(str, length) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length - 3) + '...';
}

/**
 * Exibe métricas globais da rede
 */
function displayNetworkMetrics(agentsStatus, config) {
  console.log(chalk.cyan.bold('\n◆ Métricas da Rede:\n'));
  
  // Calcula métricas básicas
  const totalAgents = agentsStatus.length;
  const onlineAgents = agentsStatus.filter(a => a.status === 'online').length;
  const offlineAgents = agentsStatus.filter(a => a.status === 'offline').length;
  const degradedAgents = agentsStatus.filter(a => a.status === 'degraded').length;
  
  // Cria uma tabela de métricas
  const table = new Table();
  
  // Adiciona estatísticas de nós
  table.push(
    { 'Status da Rede': getNetworkStatus(onlineAgents, totalAgents) },
    { 'Nós Total/Online/Offline': `${totalAgents} / ${onlineAgents} / ${offlineAgents}` },
    { 'Disponibilidade': `${Math.round((onlineAgents / totalAgents) * 100)}%` }
  );
  
  // Verifica o status do nó central (se existir)
  const centralNode = agentsStatus.find(a => a.type === 'master');
  if (centralNode) {
    const centralStatus = centralNode.status === 'online' 
      ? chalk.green('Online') 
      : chalk.red('Offline');
    
    table.push({ 'Nó Central': `${centralStatus} (${centralNode.name})` });
  }
  
  // Calcula uso médio de recursos (se disponível)
  const cpuMetrics = agentsStatus
    .filter(a => a.status === 'online' && a.metrics.cpu_usage !== undefined)
    .map(a => a.metrics.cpu_usage);
  
  if (cpuMetrics.length > 0) {
    const avgCpu = cpuMetrics.reduce((sum, val) => sum + val, 0) / cpuMetrics.length;
    table.push({ 'CPU Médio': `${Math.round(avgCpu)}%` });
  }
  
  // Exibe a tabela
  console.log(table.toString());
  
  // Exibe mensagem de status global
  console.log('\n' + getNetworkStatusMessage(onlineAgents, totalAgents));
}

/**
 * Determina o status global da rede
 */
function getNetworkStatus(online, total) {
  const percentage = (online / total) * 100;
  
  if (percentage >= 90) {
    return chalk.green('● Saudável');
  } else if (percentage >= 60) {
    return chalk.yellow('● Parcial');
  } else if (percentage > 0) {
    return chalk.red('● Degradado');
  } else {
    return chalk.red('● Offline');
  }
}

/**
 * Gera uma mensagem de status da rede
 */
function getNetworkStatusMessage(online, total) {
  const percentage = (online / total) * 100;
  
  if (percentage >= 90) {
    return chalk.green('✓ A malha neural está operando normalmente.');
  } else if (percentage >= 60) {
    return chalk.yellow('! A malha neural está operando com capacidade reduzida.');
  } else if (percentage > 0) {
    return chalk.red('! A malha neural está em estado crítico. Verificação necessária!');
  } else {
    return chalk.red('✗ A malha neural está completamente offline!');
  }
}

// Executa o programa
main().catch(error => {
  console.error(chalk.red(`✗ Erro fatal: ${error.message}`));
  process.exit(1);
}); 
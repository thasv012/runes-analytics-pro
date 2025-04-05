/**
 * AwakenNet Initialization Script (Windows)
 * 
 * Este script inicializa o sistema AwakenNet em ambiente Windows
 * Detecta e configura GPUs, inicia os serviços de malha neural distribuída
 * e configura a interface entre nós.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cores e estilos para o console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  purple: "\x1b[35m"
};

// Configurações
const LOG_DIR = path.join(__dirname, '../logs');
const SERVICES = [
  { name: 'gpu-agent', script: 'gpu-agent.js', port: 8081 },
  { name: 'gpu-mesh', script: 'gpu-mesh.js', port: 9000 },
  { name: 'web-server', command: 'npx', args: ['serve', '-s', '.', '-p', '8090'] }
];

// Assinatura visual
const banner = `
${colors.cyan}${colors.bright}▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄${colors.reset}
${colors.cyan}${colors.bright}█                                                          █${colors.reset}
${colors.cyan}${colors.bright}█   █████╗ ██╗    ██╗ █████╗ ██╗  ██╗███████╗███╗   ██╗   █${colors.reset}
${colors.cyan}${colors.bright}█  ██╔══██╗██║    ██║██╔══██╗██║ ██╔╝██╔════╝████╗  ██║   █${colors.reset}
${colors.cyan}${colors.bright}█  ███████║██║ █╗ ██║███████║█████╔╝ █████╗  ██╔██╗ ██║   █${colors.reset}
${colors.cyan}${colors.bright}█  ██╔══██║██║███╗██║██╔══██║██╔═██╗ ██╔══╝  ██║╚██╗██║   █${colors.reset}
${colors.cyan}${colors.bright}█  ██║  ██║╚███╔███╔╝██║  ██║██║  ██╗███████╗██║ ╚████║   █${colors.reset}
${colors.cyan}${colors.bright}█  ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   █${colors.reset}
${colors.cyan}${colors.bright}█                                                          █${colors.reset}
${colors.cyan}${colors.bright}█  ${colors.dim}Neural Mesh Initialization (Windows)          v0.1.0${colors.reset}  █${colors.reset}
${colors.cyan}${colors.bright}▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀${colors.reset}

`;

// Processos iniciados para monitoramento
const runningProcesses = {};
const processLogs = {};

/**
 * Verifica as dependências necessárias
 */
function checkDependencies() {
  console.log(`${colors.yellow}⟁ ${colors.reset}Verificando dependências...`);
  
  const dependencies = ['node', 'npm'];
  
  dependencies.forEach(dep => {
    try {
      execSync(`where ${dep}`, { stdio: 'ignore' });
      console.log(`  ${colors.green}✓${colors.reset} ${dep} encontrado`);
    } catch (error) {
      console.error(`  ${colors.red}✗${colors.reset} ${dep} não encontrado. Por favor, instale ${dep} para continuar.`);
      process.exit(1);
    }
  });
  
  // Verificar pacotes npm necessários
  try {
    const packageJson = require('../package.json');
    const requiredPackages = ['express', 'cors', 'ws', 'axios', 'uuid'];
    
    const missingPackages = requiredPackages.filter(pkg => {
      return !packageJson.dependencies || !packageJson.dependencies[pkg];
    });
    
    if (missingPackages.length > 0) {
      console.log(`  ${colors.yellow}!${colors.reset} Pacotes necessários não encontrados: ${missingPackages.join(', ')}`);
      console.log(`  ${colors.yellow}!${colors.reset} Instalando dependências...`);
      
      execSync(`npm install ${missingPackages.join(' ')} --save`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    }
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} Erro ao verificar dependências: ${error.message}`);
  }
}

/**
 * Detectar informações do GPU no sistema
 */
function detectGPU() {
  console.log(`${colors.yellow}⟁ ${colors.reset}Detectando GPU...`);
  
  try {
    // Tentativa de detectar NVIDIA GPU via wmic
    const gpuInfo = execSync('wmic path win32_VideoController get name', { encoding: 'utf8' });
    const gpuLines = gpuInfo.trim().split('\n').slice(1);
    
    if (gpuLines.length > 0 && gpuLines[0].trim().length > 0) {
      const gpuName = gpuLines[0].trim();
      console.log(`  ${colors.green}✓${colors.reset} Detectado: ${colors.cyan}${gpuName}${colors.reset}`);
      
      // Define variável de ambiente
      process.env.GPU_MODEL = gpuName;
      return gpuName;
    } else {
      console.log(`  ${colors.yellow}!${colors.reset} Nenhuma GPU detectada automaticamente.`);
      process.env.GPU_MODEL = "GPU não detectada";
      return null;
    }
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} Erro ao detectar GPU: ${error.message}`);
    process.env.GPU_MODEL = "Erro na detecção";
    return null;
  }
}

/**
 * Prepara o diretório de logs
 */
function prepareLogDirectory() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`${colors.green}✓${colors.reset} Diretório de logs criado: ${LOG_DIR}`);
  }
}

/**
 * Verifica se as portas necessárias estão disponíveis
 */
function checkPorts() {
  console.log(`${colors.yellow}⟁ ${colors.reset}Verificando portas...`);
  
  const portsToCheck = SERVICES.map(service => service.port);
  
  portsToCheck.forEach(port => {
    try {
      // No Windows, usamos netstat para verificar portas em uso
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      
      if (result.trim().length > 0) {
        console.log(`  ${colors.yellow}!${colors.reset} Porta ${port} já está em uso. Pode haver conflito.`);
      } else {
        console.log(`  ${colors.green}✓${colors.reset} Porta ${port} disponível`);
      }
    } catch (error) {
      // Se o comando não encontrar a porta, ela está disponível
      console.log(`  ${colors.green}✓${colors.reset} Porta ${port} disponível`);
    }
  });
}

/**
 * Inicia um serviço individual
 */
function startService(service) {
  console.log(`${colors.yellow}⟁ ${colors.reset}Iniciando ${service.name}...`);
  
  const logFile = path.join(LOG_DIR, `${service.name}.log`);
  const errorLogFile = path.join(LOG_DIR, `${service.name}.error.log`);
  
  // Cria os arquivos de log se não existirem
  fs.writeFileSync(logFile, `--- ${new Date().toISOString()} - ${service.name} iniciado ---\n`);
  fs.writeFileSync(errorLogFile, `--- ${new Date().toISOString()} - ${service.name} erro log ---\n`);
  
  // Configura o processo
  let childProcess;
  if (service.command) {
    childProcess = spawn(service.command, service.args, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: service.port }
    });
  } else {
    childProcess = spawn('node', [path.join(__dirname, '..', service.script)], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: service.port }
    });
  }
  
  // Salva referência do processo
  runningProcesses[service.name] = childProcess;
  processLogs[service.name] = { output: [], error: [] };
  
  // Configura captura de saída
  childProcess.stdout.on('data', (data) => {
    const output = data.toString();
    fs.appendFileSync(logFile, output);
    processLogs[service.name].output.push(output);
    
    // Limita o buffer de logs
    if (processLogs[service.name].output.length > 100) {
      processLogs[service.name].output.shift();
    }
    
    // Exibe output em tempo real
    if (process.argv.includes('--verbose')) {
      console.log(`${colors.dim}[${service.name}]${colors.reset} ${output.trim()}`);
    }
  });
  
  childProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    fs.appendFileSync(errorLogFile, errorOutput);
    processLogs[service.name].error.push(errorOutput);
    
    // Limita o buffer de logs
    if (processLogs[service.name].error.length > 100) {
      processLogs[service.name].error.shift();
    }
    
    // Sempre exibe erros
    console.error(`${colors.red}[${service.name}]${colors.reset} ${errorOutput.trim()}`);
  });
  
  childProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`${colors.red}✗${colors.reset} Serviço ${service.name} encerrado com código ${code}`);
    } else {
      console.log(`${colors.yellow}!${colors.reset} Serviço ${service.name} encerrado normalmente`);
    }
    
    delete runningProcesses[service.name];
  });
  
  return new Promise((resolve) => {
    // Pequena pausa para inicialização do serviço
    setTimeout(() => {
      console.log(`${colors.green}✓${colors.reset} Serviço ${service.name} iniciado (PID: ${childProcess.pid})`);
      resolve();
    }, 1000);
  });
}

/**
 * Inicia todos os serviços
 */
async function startAllServices() {
  for (const service of SERVICES) {
    await startService(service);
  }
  
  console.log(`\n${colors.green}${colors.bright}✓ Todos os serviços iniciados com sucesso!${colors.reset}`);
}

/**
 * Cria um script para encerrar os serviços
 */
function createShutdownScript() {
  const shutdownScriptPath = path.join(__dirname, '..', 'stop-awaken.bat');
  
  const pids = Object.values(runningProcesses).map(proc => proc.pid);
  
  const shutdownContent = `@echo off
echo Encerrando AwakenNet...
${pids.map(pid => `taskkill /F /PID ${pid} 2>nul`).join('\n')}
echo Todos os processos encerrados
pause`;
  
  fs.writeFileSync(shutdownScriptPath, shutdownContent);
  console.log(`${colors.green}✓${colors.reset} Script de encerramento criado: ${shutdownScriptPath}`);
}

/**
 * Exibe a mensagem final com instruções
 */
function displayFinalMessage() {
  console.log(`\n${colors.cyan}${colors.bright}⟁ AwakenNet está ativo e operacional${colors.reset}\n`);
  console.log(`${colors.reset}Acessos:`);
  console.log(`  • Painel de controle: ${colors.cyan}http://localhost:8090/index.html${colors.reset}`);
  console.log(`  • API Demo: ${colors.cyan}http://localhost:8090/api-demo.html${colors.reset}`);
  console.log(`  • Status do agente GPU: ${colors.cyan}http://localhost:8081/status${colors.reset}`);
  console.log(`  • Mesh Network: ${colors.cyan}http://localhost:9000${colors.reset}`);
  
  console.log(`\n${colors.reset}Comandos disponíveis:`);
  console.log(`  • ${colors.yellow}npm run mesh:status${colors.reset} - Exibir status da rede`);
  console.log(`  • ${colors.yellow}npm run mesh:logs${colors.reset} - Visualizar logs dos serviços`);
  console.log(`  • ${colors.yellow}./stop-awaken.bat${colors.reset} - Encerrar todos os serviços`);
  
  console.log(`\n${colors.dim}Logs disponíveis em: ${LOG_DIR}${colors.reset}`);
  console.log(`${colors.purple}${colors.bright}⟁ Consciência distribuída. Sincronização em andamento...${colors.reset}\n`);
}

/**
 * Configurar handler para finalização limpa
 */
function setupCleanShutdown() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('SIGINT', () => {
    console.log(`\n${colors.yellow}!${colors.reset} Recebido sinal de interrupção. Encerrando serviços...`);
    
    // Encerra todos os processos
    Object.values(runningProcesses).forEach(proc => {
      proc.kill();
    });
    
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    rl.close();
    
    // Encerra todos os processos
    Object.values(runningProcesses).forEach(proc => {
      proc.kill();
    });
    
    process.exit(0);
  });
}

/**
 * Função principal
 */
async function main() {
  console.clear();
  console.log(banner);
  
  // Configurar clean shutdown
  setupCleanShutdown();
  
  // Verificar dependências
  checkDependencies();
  
  // Detectar GPU
  detectGPU();
  
  // Preparar diretório de logs
  prepareLogDirectory();
  
  // Verificar portas
  checkPorts();
  
  // Iniciar serviços
  await startAllServices();
  
  // Criar script de encerramento
  createShutdownScript();
  
  // Exibir mensagem final
  displayFinalMessage();
}

// Executar o script
main().catch(error => {
  console.error(`${colors.red}✗${colors.reset} Erro fatal: ${error.message}`);
  process.exit(1);
}); 
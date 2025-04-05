/**
 * Script de sequência de lançamento do RUNES Analytics Pro
 * Executa animações em sequência e inicia o sistema
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executa um comando e retorna a promessa de conclusão
 */
function executeCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Verifica se o ambiente está pronto para execução
 */
async function checkEnvironment() {
  console.log(`${colors.cyan}${colors.bright}Verificando ambiente...${colors.reset}`);
  
  // Verificar se o diretório node_modules existe
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    console.log(`${colors.yellow}Instalando dependências...${colors.reset}`);
    await executeCommand('npm', ['install']);
  }
  
  // Verificar se o arquivo .env existe, se não, copiar do .env.example
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log(`${colors.yellow}Criando arquivo .env a partir do exemplo...${colors.reset}`);
    fs.copyFileSync(envExamplePath, envPath);
    console.log(`${colors.yellow}⚠️ Por favor, edite o arquivo .env com suas configurações!${colors.reset}`);
  }
  
  return true;
}

/**
 * Executa a sequência completa de inicialização
 */
async function runLaunchSequence() {
  try {
    // Verificar ambiente
    await checkEnvironment();
    await sleep(500);
    
    // Executar animação de boas-vindas
    await executeCommand('npm', ['run', 'welcome:pro']);
    
    // Aguardar interação do usuário
    console.log(`${colors.cyan}Pressione Enter para continuar...${colors.reset}`);
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
    
    // Executar animação de carregamento
    await executeCommand('npm', ['run', 'loading']);
    
    // Atualizar documentação
    console.log(`${colors.cyan}Atualizando documentação...${colors.reset}`);
    await executeCommand('npm', ['run', 'update:readme']);
    
    // Iniciar o servidor
    console.log(`${colors.green}${colors.bright}Iniciando servidor RUNES Analytics Pro...${colors.reset}`);
    await executeCommand('npm', ['start']);
    
  } catch (error) {
    console.error(`${colors.red}Erro na sequência de inicialização: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Iniciar sequência
runLaunchSequence(); 
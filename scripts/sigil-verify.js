/**
 * AwakenNet Sigil Verification System
 * 
 * Este componente verifica os sigilos de segurança da rede AwakenNet,
 * garantindo que apenas nós autorizados possam se conectar à malha neural.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

// Cores para o terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m"
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
};

// Constantes
const SIGIL_FILE = path.join(__dirname, '..', '.sigil');
const SIGIL_BACKUP = path.join(__dirname, '..', '.sigil.bak');
const CONFIG_PATH = path.join(__dirname, '..', 'agents.json');
const SIGNATURE = '⟁';

// Estado do sistema
let sigilState = {
  verified: false,
  level: 0,
  created: null,
  last_verified: null,
  signature: null,
  node_id: null
};

/**
 * Exibe o banner do sistema
 */
function displayBanner() {
  console.log(`
${colors.fg.cyan}${colors.bright}▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄${colors.reset}
${colors.fg.cyan}${colors.bright}█                                                          █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white} ▄▄▄       █     █    ▄▄▄      █  ▄    ▄▄▄▄▄▄▄   █  █    █   █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌      █     █   ▐▓▓▓▌     █ ▐▌   █     █   █  ██   █   █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌      █     █   ▐▓▓▓▓▌    █▐▌    █         █  █▐▌  █   █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌      █▀▀▀▀▀█   ▐▓▓▓▓▌    ▐█     █▀▀▀▀▀▀   █  █ ▐▌ █   █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌      █     █   ▐▓▓▓▓▌    ▐█     █         █  █  ▐▌█   █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white} ▀▀▀▀▀     █     █    ▀▀▀▀     ▐▀      ▀▀▀▀▀▀   ▀  ▀   ▀▀   ▀${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█                                                          █${colors.reset}
${colors.fg.cyan}${colors.bright}█  ${colors.dim}${SIGNATURE} Sigil Verification System                    v0.1.0${colors.reset}  █${colors.reset}
${colors.fg.cyan}${colors.bright}▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀${colors.reset}
`);
}

/**
 * Cria uma assinatura única baseada no hardware
 */
function createHardwareFingerprint() {
  try {
    // Coleta informações do hardware
    const cpus = os.cpus();
    const network = os.networkInterfaces();
    const totalMem = os.totalmem();
    
    // Cria um hash baseado em informações do sistema
    const fingerprint = [
      os.hostname(),
      os.platform(),
      os.arch(),
      totalMem.toString(),
      cpus.length.toString(),
      cpus[0] ? cpus[0].model : '',
      Object.keys(network).join(',')
    ].join('|');
    
    // Gera hash SHA-256
    return crypto.createHash('sha256').update(fingerprint).digest('hex');
  } catch (error) {
    console.error('Erro ao criar identificação de hardware:', error.message);
    return crypto.randomBytes(32).toString('hex'); // Fallback para aleatório
  }
}

/**
 * Carrega ou cria o arquivo de sigilo
 */
function loadOrCreateSigil() {
  try {
    if (fs.existsSync(SIGIL_FILE)) {
      const sigilData = JSON.parse(fs.readFileSync(SIGIL_FILE, 'utf8'));
      console.log(`${colors.fg.green}✓${colors.reset} Arquivo de sigilo encontrado.`);
      
      sigilState = {
        ...sigilState,
        ...sigilData
      };
      
      return true;
    } else {
      console.log(`${colors.fg.yellow}!${colors.reset} Arquivo de sigilo não encontrado. Criando um novo...`);
      
      // Cria um novo sigilo
      const nodeId = crypto.randomBytes(16).toString('hex');
      const fingerprint = createHardwareFingerprint();
      const sigilData = {
        verified: false,
        level: 0,
        created: new Date().toISOString(),
        last_verified: null,
        signature: fingerprint,
        node_id: nodeId
      };
      
      fs.writeFileSync(SIGIL_FILE, JSON.stringify(sigilData, null, 2));
      console.log(`${colors.fg.green}✓${colors.reset} Novo sigilo criado para o nó: ${nodeId.substring(0, 8)}...`);
      
      sigilState = sigilData;
      return false;
    }
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao carregar/criar sigilo:`, error.message);
    return false;
  }
}

/**
 * Verifica o sigilo atual
 */
function verifySigil() {
  try {
    if (!sigilState.signature) {
      console.log(`${colors.fg.red}✗${colors.reset} Sigilo inválido: Sem assinatura`);
      return false;
    }
    
    // Verifica se a assinatura de hardware corresponde
    const currentFingerprint = createHardwareFingerprint();
    
    if (currentFingerprint !== sigilState.signature) {
      console.log(`${colors.fg.red}✗${colors.reset} Verificação de sigilo: FALHA
${colors.fg.yellow}!${colors.reset} Hardware mudou ou sigilo corrompido.`);
      
      // Cria backup do sigilo atual
      if (fs.existsSync(SIGIL_FILE)) {
        fs.copyFileSync(SIGIL_FILE, SIGIL_BACKUP);
        console.log(`${colors.fg.yellow}!${colors.reset} Backup do sigilo anterior criado: ${SIGIL_BACKUP}`);
      }
      
      return false;
    }
    
    // Atualiza a última verificação
    sigilState.last_verified = new Date().toISOString();
    sigilState.verified = true;
    
    // Salva o estado atualizado
    fs.writeFileSync(SIGIL_FILE, JSON.stringify(sigilState, null, 2));
    
    console.log(`${colors.fg.green}✓${colors.reset} Verificação de sigilo: SUCESSO
${colors.fg.cyan}ℹ${colors.reset} Nível de acesso: ${sigilState.level} | Nó: ${sigilState.node_id.substring(0, 8)}...`);
    
    return true;
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro durante verificação:`, error.message);
    return false;
  }
}

/**
 * Exibe o status do sigilo
 */
function displaySigilStatus() {
  // Mostra a data de criação e última verificação em formato legível
  const createdDate = sigilState.created ? new Date(sigilState.created) : null;
  const lastVerifiedDate = sigilState.last_verified ? new Date(sigilState.last_verified) : null;
  
  const createdStr = createdDate ? createdDate.toLocaleString() : 'N/A';
  const lastVerifiedStr = lastVerifiedDate ? lastVerifiedDate.toLocaleString() : 'Nunca';
  
  console.log(`
${colors.fg.cyan}${colors.bright}╔════════════════════════════════════════════════════╗${colors.reset}
${colors.fg.cyan}${colors.bright}║  ${colors.fg.white}${colors.bright}Status do Sigilo AwakenNet${colors.reset}                      ${colors.fg.cyan}${colors.bright}║${colors.reset}
${colors.fg.cyan}${colors.bright}╠════════════════════════════════════════════════════╣${colors.reset}
${colors.fg.cyan}${colors.bright}║${colors.reset}  ID do Nó:         ${colors.fg.yellow}${sigilState.node_id || 'N/A'}${colors.reset}  ${colors.fg.cyan}${colors.bright}║${colors.reset}
${colors.fg.cyan}${colors.bright}║${colors.reset}  Status:           ${sigilState.verified ? colors.fg.green + 'Verificado' : colors.fg.red + 'Não Verificado'}${colors.reset}                ${colors.fg.cyan}${colors.bright}║${colors.reset}
${colors.fg.cyan}${colors.bright}║${colors.reset}  Nível de Acesso:  ${colors.fg.white}${sigilState.level}${colors.reset}                               ${colors.fg.cyan}${colors.bright}║${colors.reset}
${colors.fg.cyan}${colors.bright}║${colors.reset}  Criado em:        ${colors.fg.white}${createdStr}${colors.reset}      ${colors.fg.cyan}${colors.bright}║${colors.reset}
${colors.fg.cyan}${colors.bright}║${colors.reset}  Última Verif.:    ${colors.fg.white}${lastVerifiedStr}${colors.reset}      ${colors.fg.cyan}${colors.bright}║${colors.reset}
${colors.fg.cyan}${colors.bright}╚════════════════════════════════════════════════════╝${colors.reset}
`);
}

/**
 * Verifica permissões do arquivo de sigilo
 */
function checkSigilFilePermissions() {
  try {
    if (fs.existsSync(SIGIL_FILE)) {
      const stats = fs.statSync(SIGIL_FILE);
      
      // Em sistemas unix, verificamos permissões mais restritas
      if (process.platform !== 'win32') {
        const mode = stats.mode;
        const ownerReadWrite = (mode & 0o600) === 0o600; // Somente leitura/escrita para dono
        
        if (!ownerReadWrite) {
          console.log(`${colors.fg.yellow}!${colors.reset} Aviso: Permissões de arquivo de sigilo não são seguras.`);
          // Ajusta permissões (somente em unix)
          fs.chmodSync(SIGIL_FILE, 0o600);
          console.log(`${colors.fg.green}✓${colors.reset} Permissões ajustadas para somente dono (0600).`);
        }
      }
    }
  } catch (error) {
    console.error(`${colors.fg.yellow}!${colors.reset} Não foi possível verificar permissões:`, error.message);
  }
}

/**
 * Verifica se o nó atual está registrado na configuração
 */
function checkNodeRegistration() {
  try {
    if (!sigilState.node_id) {
      return false;
    }
    
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      
      // Verifica se algum dos agentes tem o mesmo ID de nó
      if (config.agents && Array.isArray(config.agents)) {
        const registeredNode = config.agents.find(agent => agent.id === sigilState.node_id);
        
        if (registeredNode) {
          console.log(`${colors.fg.green}✓${colors.reset} Nó encontrado na configuração: ${registeredNode.name}`);
          
          // Atualiza o nível de acesso baseado na configuração
          if (registeredNode.type === 'master') {
            sigilState.level = 3; // Nível máximo para nós master
          } else if (registeredNode.type === 'worker') {
            sigilState.level = 2; // Nível intermediário para workers
          } else {
            sigilState.level = 1; // Nível básico para outros
          }
          
          // Salva as mudanças
          fs.writeFileSync(SIGIL_FILE, JSON.stringify(sigilState, null, 2));
          
          return true;
        } else {
          console.log(`${colors.fg.yellow}!${colors.reset} ID do nó não encontrado na configuração. Acesso limitado.`);
          sigilState.level = 0; // Nível mais baixo, não registrado
          
          // Salva as mudanças
          fs.writeFileSync(SIGIL_FILE, JSON.stringify(sigilState, null, 2));
          
          return false;
        }
      }
    }
    
    console.log(`${colors.fg.yellow}!${colors.reset} Arquivo de configuração não encontrado ou inválido.`);
    return false;
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao verificar registro:`, error.message);
    return false;
  }
}

/**
 * Realiza o desafio de verificação para o usuário
 */
async function performVerificationChallenge() {
  // Somente se o sigilo não está verificado mas existe
  if (sigilState.verified || !sigilState.signature) {
    return sigilState.verified;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Gera um código hexadecimal baseado na assinatura existente
  const challenge = sigilState.signature.substring(0, 6);
  
  console.log(`\n${colors.fg.yellow}${colors.bright}! VERIFICAÇÃO DE SIGILO NECESSÁRIA !${colors.reset}\n`);
  console.log(`Por favor, insira o código de verificação: ${colors.fg.cyan}${challenge}${colors.reset}`);
  
  return new Promise((resolve) => {
    rl.question('> ', (answer) => {
      rl.close();
      
      if (answer.trim() === challenge) {
        console.log(`${colors.fg.green}✓${colors.reset} Código verificado com sucesso!`);
        
        // Atualiza o sigilo
        sigilState.verified = true;
        sigilState.last_verified = new Date().toISOString();
        fs.writeFileSync(SIGIL_FILE, JSON.stringify(sigilState, null, 2));
        
        resolve(true);
      } else {
        console.log(`${colors.fg.red}✗${colors.reset} Código incorreto. Verificação falhou.`);
        resolve(false);
      }
    });
  });
}

/**
 * Função principal para verificação completa
 */
async function main() {
  // Limpa o console
  console.clear();
  
  // Exibe o banner
  displayBanner();
  
  console.log(`${colors.fg.cyan}${colors.bright}${SIGNATURE} Iniciando verificação de sigilo AwakenNet...${colors.reset}\n`);
  
  // Carrega ou cria o sigilo
  const sigilExists = loadOrCreateSigil();
  
  // Verifica permissões do arquivo
  checkSigilFilePermissions();
  
  // Verifica o sigilo, se existir
  if (sigilExists) {
    const isValid = verifySigil();
    
    // Se o sigilo não for válido, mas existir
    if (!isValid) {
      console.log(`${colors.fg.yellow}!${colors.reset} O sigilo precisa ser revalidado.`);
      
      // Realiza o desafio de verificação
      const challengePassed = await performVerificationChallenge();
      
      if (challengePassed) {
        // Recria a assinatura
        sigilState.signature = createHardwareFingerprint();
        sigilState.verified = true;
        sigilState.last_verified = new Date().toISOString();
        fs.writeFileSync(SIGIL_FILE, JSON.stringify(sigilState, null, 2));
      }
    }
  }
  
  // Verifica registro na configuração
  checkNodeRegistration();
  
  // Exibe o status final
  displaySigilStatus();
  
  console.log(`\n${colors.fg.cyan}${colors.bright}${SIGNATURE} Verificação de sigilo concluída.${colors.reset}`);
  
  // Retorna o código de saída
  process.exit(sigilState.verified ? 0 : 1);
}

// Executa o programa
main().catch(error => {
  console.error(`${colors.fg.red}✗${colors.reset} Erro fatal:`, error);
  process.exit(1);
}); 
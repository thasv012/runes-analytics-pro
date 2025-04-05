/**
 * AwakenNet Sigil Unlock System
 * 
 * Este componente permite desbloquear e autorizar sigilos de segurança
 * para nós na rede AwakenNet.
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
const SIGIL_DIR = path.join(__dirname, '..', '.sigils');
const LOCAL_SIGIL_FILE = path.join(__dirname, '..', '.sigil');
const CONFIG_PATH = path.join(__dirname, '..', 'agents.json');
const SIGNATURE = '⟁';
const MASTER_KEY_FILE = path.join(__dirname, '..', '.master_key');

// Estado do sistema
let unlockState = {
  unlockedSigils: 0,
  authorizedNodes: 0,
  masterKey: null,
  hasValidMasterKey: false,
  adminMode: false
};

/**
 * Exibe o banner do sistema
 */
function displayBanner() {
  console.log(`
${colors.fg.cyan}${colors.bright}▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄${colors.reset}
${colors.fg.cyan}${colors.bright}█                                                          █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white} ▄▄▄      █     █  █    █  █       ▄▄▄      ▄█▄▄   █  █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌     █     █  █    █  █      ▐▓▓▓▌    █▓▓▓▓▌  █  █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌     █     █  █    █  █      ▐▓▓▓▓▌  █▓▓▓▓▓▌ █  █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌     █     █  █    █  █      ▐▓▓▓▓▌  █▓▓▓▓▓▓▌ █  █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white}▐▓▓▓▌     █     █  █    █  █      ▐▓▓▓▓▌  █▓▓▓▓▓▓▌ █  █${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█   ${colors.fg.white} ▀▀▀▀▀     ▀▀▀▀▀    ▀▀▀▀   ▀▀▀▀▀▀   ▀▀▀▀    ▀▀▀▀▀   ▀  ▀${colors.reset}   █${colors.reset}
${colors.fg.cyan}${colors.bright}█                                                          █${colors.reset}
${colors.fg.cyan}${colors.bright}█  ${colors.dim}${SIGNATURE} Sigil Unlock System                       v0.1.0${colors.reset}  █${colors.reset}
${colors.fg.cyan}${colors.bright}▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀${colors.reset}
`);
}

/**
 * Verifica e carrega ou gera a chave mestra
 */
function loadOrCreateMasterKey() {
  try {
    if (fs.existsSync(MASTER_KEY_FILE)) {
      const keyData = JSON.parse(fs.readFileSync(MASTER_KEY_FILE, 'utf8'));
      unlockState.masterKey = keyData.key;
      unlockState.hasValidMasterKey = true;
      
      console.log(`${colors.fg.green}✓${colors.reset} Chave mestra carregada.`);
      return true;
    } else {
      console.log(`${colors.fg.yellow}!${colors.reset} Chave mestra não encontrada. Gerando nova chave...`);
      
      // Gera uma nova chave mestra
      const newKey = crypto.randomBytes(32).toString('hex');
      const masterKeyData = {
        key: newKey,
        created: new Date().toISOString(),
        created_by: os.hostname(),
        version: '1.0.0'
      };
      
      // Cria o diretório de sigils se não existir
      if (!fs.existsSync(path.dirname(MASTER_KEY_FILE))) {
        fs.mkdirSync(path.dirname(MASTER_KEY_FILE), { recursive: true });
      }
      
      fs.writeFileSync(MASTER_KEY_FILE, JSON.stringify(masterKeyData, null, 2));
      console.log(`${colors.fg.green}✓${colors.reset} Nova chave mestra gerada e salva.`);
      
      unlockState.masterKey = newKey;
      unlockState.hasValidMasterKey = true;
      return true;
    }
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao carregar/criar chave mestra:`, error.message);
    return false;
  }
}

/**
 * Garante que o diretório de sigilos existe
 */
function ensureSigilDirectory() {
  if (!fs.existsSync(SIGIL_DIR)) {
    fs.mkdirSync(SIGIL_DIR, { recursive: true });
    console.log(`${colors.fg.green}✓${colors.reset} Diretório de sigilos criado: ${SIGIL_DIR}`);
    return true;
  }
  return true;
}

/**
 * Lista todos os sigilos encontrados
 */
function listAllSigils() {
  try {
    ensureSigilDirectory();
    
    // Verifica o sigilo local
    let localSigil = null;
    if (fs.existsSync(LOCAL_SIGIL_FILE)) {
      try {
        localSigil = JSON.parse(fs.readFileSync(LOCAL_SIGIL_FILE, 'utf8'));
        console.log(`\n${colors.fg.cyan}${colors.bright}◆ Sigilo local encontrado:${colors.reset}`);
        console.log(`  ID do Nó: ${colors.fg.yellow}${localSigil.node_id || 'N/A'}${colors.reset}`);
        console.log(`  Status: ${localSigil.verified ? colors.fg.green + 'Verificado' : colors.fg.red + 'Não Verificado'}${colors.reset}`);
        console.log(`  Nível: ${colors.fg.white}${localSigil.level || 0}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.fg.red}✗${colors.reset} Erro ao ler sigilo local:`, error.message);
      }
    } else {
      console.log(`\n${colors.fg.yellow}!${colors.reset} Nenhum sigilo local encontrado.`);
    }
    
    // Lista os sigilos no diretório
    if (fs.existsSync(SIGIL_DIR)) {
      const files = fs.readdirSync(SIGIL_DIR);
      const sigilFiles = files.filter(file => file.endsWith('.sigil'));
      
      if (sigilFiles.length > 0) {
        console.log(`\n${colors.fg.cyan}${colors.bright}◆ Sigilos armazenados: ${sigilFiles.length}${colors.reset}`);
        
        sigilFiles.forEach((file, index) => {
          try {
            const sigilData = JSON.parse(fs.readFileSync(path.join(SIGIL_DIR, file), 'utf8'));
            const isLocalSigil = localSigil && sigilData.node_id === localSigil.node_id;
            
            console.log(`  ${index + 1}. ${colors.fg.yellow}${sigilData.node_id}${colors.reset} ${isLocalSigil ? colors.fg.green + '[LOCAL]' : ''}${colors.reset}`);
            console.log(`     Nível: ${colors.fg.white}${sigilData.level || 0}${colors.reset} | Verificado: ${sigilData.verified ? colors.fg.green + 'Sim' : colors.fg.red + 'Não'}${colors.reset}`);
            
            if (sigilData.created) {
              const createdDate = new Date(sigilData.created);
              console.log(`     Criado: ${colors.fg.white}${createdDate.toLocaleString()}${colors.reset}`);
            }
            
            console.log('');
          } catch (error) {
            console.error(`${colors.fg.red}✗${colors.reset} Erro ao ler sigilo ${file}:`, error.message);
          }
        });
        
        return sigilFiles;
      } else {
        console.log(`\n${colors.fg.yellow}!${colors.reset} Nenhum sigilo armazenado encontrado.`);
        return [];
      }
    } else {
      console.log(`\n${colors.fg.yellow}!${colors.reset} Diretório de sigilos não encontrado.`);
      return [];
    }
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao listar sigilos:`, error.message);
    return [];
  }
}

/**
 * Autoriza um sigilo para um nível específico
 */
function authorizeSigil(nodeId, level) {
  try {
    if (!nodeId) {
      console.error(`${colors.fg.red}✗${colors.reset} ID do nó não especificado.`);
      return false;
    }
    
    // Valida o nível
    const parsedLevel = parseInt(level, 10);
    if (isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > 3) {
      console.error(`${colors.fg.red}✗${colors.reset} Nível inválido. Deve ser um número entre 0 e 3.`);
      return false;
    }
    
    // Procura o sigilo
    const sigilPath = path.join(SIGIL_DIR, `${nodeId}.sigil`);
    
    if (fs.existsSync(sigilPath)) {
      const sigilData = JSON.parse(fs.readFileSync(sigilPath, 'utf8'));
      
      // Atualiza o nível
      sigilData.level = parsedLevel;
      sigilData.authorized_at = new Date().toISOString();
      sigilData.authorized_by = os.hostname();
      
      // Se for nível 3, marca como master
      if (parsedLevel === 3) {
        sigilData.is_master = true;
      } else {
        sigilData.is_master = false;
      }
      
      // Salva o sigilo atualizado
      fs.writeFileSync(sigilPath, JSON.stringify(sigilData, null, 2));
      
      console.log(`${colors.fg.green}✓${colors.reset} Sigilo ${colors.fg.yellow}${nodeId}${colors.reset} autorizado com nível ${colors.fg.white}${parsedLevel}${colors.reset}.`);
      return true;
    } else {
      console.error(`${colors.fg.red}✗${colors.reset} Sigilo não encontrado para o nó: ${nodeId}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao autorizar sigilo:`, error.message);
    return false;
  }
}

/**
 * Exporta o sigilo local para o diretório de sigilos compartilhados
 */
function exportLocalSigil() {
  try {
    if (!fs.existsSync(LOCAL_SIGIL_FILE)) {
      console.error(`${colors.fg.red}✗${colors.reset} Sigilo local não encontrado.`);
      return false;
    }
    
    // Certifica que o diretório existe
    ensureSigilDirectory();
    
    // Lê o sigilo local
    const localSigil = JSON.parse(fs.readFileSync(LOCAL_SIGIL_FILE, 'utf8'));
    
    if (!localSigil.node_id) {
      console.error(`${colors.fg.red}✗${colors.reset} Sigilo local inválido: ID do nó não encontrado.`);
      return false;
    }
    
    // Define o caminho do sigilo exportado
    const exportPath = path.join(SIGIL_DIR, `${localSigil.node_id}.sigil`);
    
    // Exporta o sigilo
    fs.writeFileSync(exportPath, JSON.stringify(localSigil, null, 2));
    
    console.log(`${colors.fg.green}✓${colors.reset} Sigilo local exportado com sucesso para: ${exportPath}`);
    return true;
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao exportar sigilo local:`, error.message);
    return false;
  }
}

/**
 * Importa um sigilo para uso local
 */
function importSigil(nodeId) {
  try {
    if (!nodeId) {
      console.error(`${colors.fg.red}✗${colors.reset} ID do nó não especificado.`);
      return false;
    }
    
    // Procura o sigilo
    const sigilPath = path.join(SIGIL_DIR, `${nodeId}.sigil`);
    
    if (!fs.existsSync(sigilPath)) {
      console.error(`${colors.fg.red}✗${colors.reset} Sigilo não encontrado para o nó: ${nodeId}`);
      return false;
    }
    
    // Lê o sigilo
    const sigilData = JSON.parse(fs.readFileSync(sigilPath, 'utf8'));
    
    // Pergunta antes de substituir o sigilo local
    if (fs.existsSync(LOCAL_SIGIL_FILE)) {
      // Faz backup do sigilo atual
      const backupPath = `${LOCAL_SIGIL_FILE}.bak`;
      fs.copyFileSync(LOCAL_SIGIL_FILE, backupPath);
      console.log(`${colors.fg.yellow}!${colors.reset} Backup do sigilo local criado: ${backupPath}`);
    }
    
    // Importa o sigilo
    fs.writeFileSync(LOCAL_SIGIL_FILE, JSON.stringify(sigilData, null, 2));
    
    console.log(`${colors.fg.green}✓${colors.reset} Sigilo importado com sucesso para uso local.`);
    return true;
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao importar sigilo:`, error.message);
    return false;
  }
}

/**
 * Verifica se há uma entrada no arquivo de configuração para o nó
 */
function checkConfigForNode(nodeId) {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      console.error(`${colors.fg.yellow}!${colors.reset} Arquivo de configuração não encontrado: ${CONFIG_PATH}`);
      return false;
    }
    
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    
    if (!config.agents || !Array.isArray(config.agents)) {
      console.error(`${colors.fg.yellow}!${colors.reset} Nenhum agente encontrado na configuração.`);
      return false;
    }
    
    const agentEntry = config.agents.find(agent => agent.id === nodeId);
    
    if (agentEntry) {
      console.log(`${colors.fg.green}✓${colors.reset} Nó encontrado na configuração:`);
      console.log(`  Nome: ${colors.fg.white}${agentEntry.name}${colors.reset}`);
      console.log(`  Tipo: ${colors.fg.white}${agentEntry.type}${colors.reset}`);
      console.log(`  Host: ${colors.fg.white}${agentEntry.host}:${agentEntry.port}${colors.reset}`);
      
      return agentEntry;
    } else {
      console.log(`${colors.fg.yellow}!${colors.reset} Nó não encontrado na configuração: ${nodeId}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.fg.red}✗${colors.reset} Erro ao verificar configuração:`, error.message);
    return false;
  }
}

/**
 * Cria um menu interativo para autorização de sigilos
 */
async function unlockMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (text) => {
    return new Promise((resolve) => {
      rl.question(text, (answer) => {
        resolve(answer.trim());
      });
    });
  };
  
  let exitMenu = false;
  
  while (!exitMenu) {
    console.log(`\n${colors.fg.cyan}${colors.bright}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}║  ${colors.fg.white}${colors.bright}Menu de Gerenciamento de Sigilos${colors.reset}                ${colors.fg.cyan}${colors.bright}║${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}╠════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}║${colors.reset}  ${colors.fg.white}1.${colors.reset} Listar todos os sigilos                      ${colors.fg.cyan}${colors.bright}║${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}║${colors.reset}  ${colors.fg.white}2.${colors.reset} Autorizar um sigilo                         ${colors.fg.cyan}${colors.bright}║${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}║${colors.reset}  ${colors.fg.white}3.${colors.reset} Exportar sigilo local                       ${colors.fg.cyan}${colors.bright}║${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}║${colors.reset}  ${colors.fg.white}4.${colors.reset} Importar sigilo                             ${colors.fg.cyan}${colors.bright}║${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}║${colors.reset}  ${colors.fg.white}5.${colors.reset} Verificar configuração para nó              ${colors.fg.cyan}${colors.bright}║${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}║${colors.reset}  ${colors.fg.white}0.${colors.reset} Sair                                        ${colors.fg.cyan}${colors.bright}║${colors.reset}`);
    console.log(`${colors.fg.cyan}${colors.bright}╚════════════════════════════════════════════════════╝${colors.reset}`);
    
    const choice = await question('Escolha uma opção: ');
    
    switch (choice) {
      case '1':
        console.clear();
        displayBanner();
        listAllSigils();
        break;
      
      case '2':
        const nodeId = await question(`ID do nó para autorizar: ${colors.fg.yellow}`);
        console.log(colors.reset);
        const level = await question(`Nível de autorização (0-3): ${colors.fg.white}`);
        console.log(colors.reset);
        
        if (nodeId && level) {
          authorizeSigil(nodeId, level);
        }
        break;
      
      case '3':
        exportLocalSigil();
        break;
      
      case '4':
        const importId = await question(`ID do nó para importar: ${colors.fg.yellow}`);
        console.log(colors.reset);
        
        if (importId) {
          const confirm = await question(`Tem certeza que deseja importar o sigilo ${importId}? (s/n): `);
          
          if (confirm.toLowerCase() === 's') {
            importSigil(importId);
          }
        }
        break;
      
      case '5':
        const checkId = await question(`ID do nó para verificar: ${colors.fg.yellow}`);
        console.log(colors.reset);
        
        if (checkId) {
          checkConfigForNode(checkId);
        }
        break;
      
      case '0':
        exitMenu = true;
        break;
      
      default:
        console.log(`${colors.fg.red}✗${colors.reset} Opção inválida!`);
    }
  }
  
  rl.close();
  console.log(`${colors.fg.cyan}${colors.bright}${SIGNATURE} Encerrando sistema de desbloqueio de sigilos.${colors.reset}`);
}

/**
 * Função principal
 */
async function main() {
  // Limpa o console
  console.clear();
  
  // Exibe o banner
  displayBanner();
  
  console.log(`${colors.fg.cyan}${colors.bright}${SIGNATURE} Iniciando sistema de desbloqueio de sigilos AwakenNet...${colors.reset}\n`);
  
  // Carrega ou cria a chave mestra
  if (!loadOrCreateMasterKey()) {
    console.error(`${colors.fg.red}✗${colors.reset} Não foi possível obter a chave mestra. Encerrando.`);
    process.exit(1);
  }
  
  // Verifica permissões do diretório
  ensureSigilDirectory();
  
  // Inicia o menu interativo
  await unlockMenu();
}

// Executa o programa
main().catch(error => {
  console.error(`${colors.fg.red}✗${colors.reset} Erro fatal:`, error);
  process.exit(1);
}); 
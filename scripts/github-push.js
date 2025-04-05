/**
 * Script para fazer push automático de documentação no GitHub
 * Detecta alterações, adiciona/faz commit e push para o repositório remoto
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Configurações
const config = {
  // Arquivos/diretórios a serem monitorados para mudanças
  trackedPaths: [
    'README.md',
    'README.en.md',
    'docs/*.md',
    'GETTING-STARTED.md'
  ],
  // Mensagem de commit padrão
  commitMessage: 'docs: atualiza documentação multilíngue',
  // Branch para fazer push
  branch: 'main',
  // Executar comandos antes de fazer o push
  prePushCommands: [
    'npm run check:translations',
    'npm run update:readme',
    'npm run update:readme:en'
  ],
  // Verificar se há mudanças específicas antes de fazer commit
  checkForChanges: true,
  // Pedir confirmação antes de fazer push
  confirmBeforePush: true
};

/**
 * Executa um comando e retorna uma promessa
 */
async function executeCommand(command, silent = false) {
  return new Promise((resolve, reject) => {
    if (!silent) {
      console.log(`${colors.yellow}Executando: ${colors.bright}${command}${colors.reset}`);
    }
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (!silent) console.error(`${colors.red}${stderr}${colors.reset}`);
        reject(error);
        return;
      }
      
      if (!silent && stdout.trim()) {
        console.log(stdout);
      }
      
      resolve(stdout.trim());
    });
  });
}

/**
 * Verifica se há mudanças nos arquivos monitorados
 */
async function checkChanges() {
  try {
    // Verificar status do git para os arquivos rastreados
    const status = await executeCommand(`git status --porcelain ${config.trackedPaths.join(' ')}`, true);
    
    // Se houver saída, significa que há mudanças
    return status.length > 0;
  } catch (error) {
    console.error(`${colors.red}Erro ao verificar mudanças: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Aguarda input do usuário para confirmação
 */
async function confirmAction(message) {
  if (!config.confirmBeforePush) return true;
  
  return new Promise(resolve => {
    process.stdout.write(`${colors.bright}${colors.magenta}${message} (s/N): ${colors.reset}`);
    
    process.stdin.once('data', data => {
      const input = data.toString().trim().toLowerCase();
      resolve(input === 's' || input === 'sim' || input === 'yes' || input === 'y');
    });
  });
}

/**
 * Executa a sequência de comandos para atualização e push
 */
async function main() {
  const header = '=== RUNES Analytics Pro - GitHub Push Automático ===';
  console.log(`\n${colors.bright}${colors.blue}${header}${colors.reset}\n`);
  
  try {
    // Executar comandos pré-push para garantir que a documentação está atualizada
    for (const command of config.prePushCommands) {
      await executeCommand(command);
    }
    
    // Verificar se há mudanças para commit
    if (config.checkForChanges) {
      const hasChanges = await checkChanges();
      
      if (!hasChanges) {
        console.log(`\n${colors.green}✓ Nenhuma alteração detectada nos arquivos de documentação.${colors.reset}\n`);
        return;
      }
      
      console.log(`\n${colors.yellow}Alterações detectadas nos arquivos de documentação.${colors.reset}`);
    }
    
    // Mostrar as mudanças
    await executeCommand(`git diff --color ${config.trackedPaths.join(' ')}`);
    
    // Confirmar se deve continuar
    const shouldContinue = await confirmAction('Deseja fazer commit e push dessas alterações?');
    
    if (!shouldContinue) {
      console.log(`\n${colors.yellow}Operação cancelada pelo usuário.${colors.reset}\n`);
      return;
    }
    
    // Adicionar arquivos ao stage
    await executeCommand(`git add ${config.trackedPaths.join(' ')}`);
    
    // Obter uma mensagem de commit personalizada ou usar a padrão
    let commitMessage = config.commitMessage;
    
    if (process.argv.length > 2) {
      // Usar a mensagem passada como argumento
      commitMessage = process.argv.slice(2).join(' ');
    }
    
    // Fazer commit
    await executeCommand(`git commit -m "${commitMessage}"`);
    
    // Fazer push
    await executeCommand(`git push origin ${config.branch}`);
    
    console.log(`\n${colors.bright}${colors.green}✓ Documentação atualizada e enviada para o GitHub com sucesso!${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}✗ Erro: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Executar o script
main().catch(console.error); 
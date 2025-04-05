/**
 * Script para atualização completa da documentação
 * Executa todos os passos em sequência:
 * 1. Adiciona/atualiza timestamps
 * 2. Verifica traduções
 * 3. Gera README em português e inglês
 */

const { spawn } = require('child_process');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Executa um comando e retorna uma promessa
 */
function executeCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}Executando: ${colors.bright}${command} ${args.join(' ')}${colors.reset}`);
    
    const childProcess = spawn(command, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
    
    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

async function updateAllDocumentation() {
  const start = Date.now();
  
  // Exibir cabeçalho
  console.log(`\n${colors.bright}${colors.blue}╔══════════════════════════════════════════════════════╗`);
  console.log(`║  ${colors.cyan}RUNES Analytics Pro${colors.blue} - Atualização de Documentação  ║`);
  console.log(`╚══════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  try {
    // Passo 1: Atualizar timestamps
    console.log(`\n${colors.bright}${colors.cyan}Passo 1: Atualizando timestamps${colors.reset}`);
    await executeCommand('npm', ['run', 'timestamps']);
    
    // Passo 2: Verificar traduções
    console.log(`\n${colors.bright}${colors.cyan}Passo 2: Verificando traduções${colors.reset}`);
    await executeCommand('npm', ['run', 'check:translations']);
    
    // Passo 3: Gerar README em português
    console.log(`\n${colors.bright}${colors.cyan}Passo 3: Gerando README em português${colors.reset}`);
    await executeCommand('npm', ['run', 'update:readme']);
    
    // Passo 4: Gerar README em inglês
    console.log(`\n${colors.bright}${colors.cyan}Passo 4: Gerando README em inglês${colors.reset}`);
    await executeCommand('npm', ['run', 'update:readme:en']);
    
    // Duração total
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    
    // Resumo final
    console.log(`\n${colors.bright}${colors.green}✅ Documentação atualizada com sucesso!${colors.reset}`);
    console.log(`${colors.bright}${colors.green}⏱️ Tempo total: ${duration} segundos${colors.reset}\n`);
    
    // Exibir próximos passos
    console.log(`${colors.cyan}Próximos passos:${colors.reset}`);
    console.log(`${colors.dim}1. Revise os arquivos gerados para garantir que estão corretos${colors.reset}`);
    console.log(`${colors.dim}2. Se precisar enviar as alterações para o GitHub, execute:${colors.reset}`);
    console.log(`   ${colors.bright}npm run git:push${colors.reset}`);
    console.log(`   ${colors.dim}ou use os scripts de conveniência:${colors.reset}`);
    console.log(`   ${colors.bright}./github-push.ps1${colors.reset} ${colors.dim}(PowerShell)${colors.reset}`);
    console.log(`   ${colors.bright}github-push.bat${colors.reset} ${colors.dim}(CMD)${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}❌ Erro ao atualizar documentação: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Executar a atualização completa
updateAllDocumentation().catch(console.error); 
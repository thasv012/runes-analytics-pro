#!/usr/bin/env node

/**
 * RUNES Analytics Pro - Doc Watcher
 * Script para monitorar mudanças nos blocos de documentação
 * e atualizar README.md e README.en.md automaticamente
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configurações
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const README_GEN_SCRIPT = path.join(__dirname, 'generate-readme-unified.js');

// Cores para console
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// Banner de inicialização
function showBanner() {
  console.log(`
${COLORS.bright}${COLORS.cyan}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${COLORS.magenta}RUNES Analytics Pro - Observador de Documentação ${COLORS.cyan}            ┃
┃ ${COLORS.dim}Monitorando arquivos .md e gerando README automaticamente ${COLORS.reset}${COLORS.cyan}    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${COLORS.reset}
  `);
}

// Verificar se diretório docs existe
if (!fs.existsSync(DOCS_DIR)) {
  console.error(`${COLORS.red}❌ Erro: Diretório 'docs' não encontrado em ${DOCS_DIR}${COLORS.reset}`);
  console.log(`${COLORS.yellow}ℹ️ Criando diretório docs...${COLORS.reset}`);
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Verificar se existem blocos no diretório
const blocksExist = fs.readdirSync(DOCS_DIR).some(file => file.endsWith('.md'));
if (!blocksExist) {
  console.warn(`${COLORS.yellow}⚠️ Nenhum bloco .md encontrado em ${DOCS_DIR}${COLORS.reset}`);
  console.log(`${COLORS.cyan}ℹ️ Por favor, crie os blocos de documentação antes de continuar.${COLORS.reset}`);
}

// Indicador de debounce para evitar múltiplas atualizações
let isUpdating = false;
let pendingUpdate = false;
let lastUpdateTime = Date.now();
const DEBOUNCE_TIME = 1000; // 1 segundo

/**
 * Gera os arquivos README.md e README.en.md
 */
function updateReadme() {
  if (isUpdating) {
    pendingUpdate = true;
    return;
  }

  const now = Date.now();
  if (now - lastUpdateTime < DEBOUNCE_TIME) {
    setTimeout(updateReadme, DEBOUNCE_TIME - (now - lastUpdateTime));
    return;
  }

  isUpdating = true;
  lastUpdateTime = now;

  console.log(`${COLORS.yellow}🔄 Atualizando documentação...${COLORS.reset}`);
  
  try {
    execSync(`node ${README_GEN_SCRIPT} --all`, { stdio: 'inherit' });
    
    console.log(`${COLORS.green}✅ Documentação atualizada com sucesso!${COLORS.reset}`);
    console.log(`${COLORS.dim}📅 ${new Date().toLocaleTimeString()}${COLORS.reset}`);
  } catch (error) {
    console.error(`${COLORS.red}❌ Erro ao atualizar documentação: ${error.message}${COLORS.reset}`);
  }

  isUpdating = false;
  
  if (pendingUpdate) {
    pendingUpdate = false;
    setTimeout(updateReadme, DEBOUNCE_TIME);
  }
}

// Iniciar o observador
function startWatcher() {
  showBanner();
  
  console.log(`${COLORS.blue}👀 Iniciando monitoramento de ${DOCS_DIR}...${COLORS.reset}`);
  
  // Configurar o observador para arquivos .md no diretório docs
  const watcher = chokidar.watch(`${DOCS_DIR}/**/*.md`, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });

  // Eventos
  watcher
    .on('add', filePath => {
      console.log(`${COLORS.green}📄 Novo arquivo detectado: ${path.basename(filePath)}${COLORS.reset}`);
      updateReadme();
    })
    .on('change', filePath => {
      console.log(`${COLORS.yellow}📝 Arquivo modificado: ${path.basename(filePath)}${COLORS.reset}`);
      updateReadme();
    })
    .on('unlink', filePath => {
      console.log(`${COLORS.red}🗑️ Arquivo removido: ${path.basename(filePath)}${COLORS.reset}`);
      updateReadme();
    })
    .on('error', error => {
      console.error(`${COLORS.red}❌ Erro no observador: ${error}${COLORS.reset}`);
    })
    .on('ready', () => {
      console.log(`${COLORS.green}✅ Observador inicializado. Aguardando mudanças...${COLORS.reset}`);
      console.log(`${COLORS.cyan}💡 Pressione Ctrl+C para encerrar o monitoramento${COLORS.reset}`);
    });

  // Manipular interrupção (Ctrl+C)
  process.on('SIGINT', () => {
    console.log(`\n${COLORS.yellow}👋 Encerrando monitoramento...${COLORS.reset}`);
    watcher.close().then(() => {
      console.log(`${COLORS.green}✅ Monitoramento encerrado com sucesso!${COLORS.reset}`);
      process.exit(0);
    });
  });
}

// Executar o programa
startWatcher(); 
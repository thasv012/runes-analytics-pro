// watch-vault.js
import chokidar from 'chokidar';
import { exec } from 'child_process';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const vaultPath = __dirname;
const dashboardScript = path.join(vaultPath, 'generate-vault-dashboard.js');
const requiredFolders = [
  '📂 Apresentação & Visão',
  '📂 Desenvolvimento & Código',
  '📂 Análise de Tokens',
  '📂 Prompts & IA',
  '📂 Documentação Técnica',
  '📂 Estratégia & Comunidade'
];

// Helper function for timestamp
const getTime = () => new Date().toLocaleTimeString('pt-BR');

console.log(`[${getTime()}] 🧠 Sistema de Monitoramento de Vault (RUNES Analytics Pro)`);
console.log(`[${getTime()}] 👁️  Monitorando alterações em: ${vaultPath}\n`);

// Check for missing folders
let missing = requiredFolders.filter(folder => !fs.existsSync(path.join(vaultPath, folder)));
if (missing.length > 0) {
  console.warn(`[${getTime()}] ⚠️ Pastas faltando: ${missing.join(', ')}`);
  console.warn(`[${getTime()}] 💡 Execute: node create-vault-structure.js\n`);
}

// Ensure the dashboard script exists before starting watcher
if (!fs.existsSync(dashboardScript)) {
  console.error(`[${getTime()}] ❌ Erro Fatal: Script do dashboard (${dashboardScript}) não encontrado.`);
  console.error(`[${getTime()}] O monitoramento não pode continuar sem ele. Execute os scripts de setup.`);
  process.exit(1); // Exit if dashboard script is essential and missing
}

const watcher = chokidar.watch(`${vaultPath}/**/*.md`, {
  ignored: [
    /\/\.obsidian\//, // Ignore .obsidian folder
    /\/node_modules\//, // Ignore node_modules
    /📂 Painel Principal\.md$/,
    /🔥 Consolidado-Vault\.md$/ // Ignore the consolidated file
  ],
  ignoreInitial: true,
  persistent: true
});

let isUpdating = false; // Debounce flag

function runDashboard(event, filePath) {
  if (isUpdating) return; // Prevent multiple simultaneous runs
  isUpdating = true;

  const relativePath = path.relative(vaultPath, filePath);
  const eventType = event === 'add' ? '➕ Novo arquivo' : '➖ Arquivo removido';
  
  console.log(`\n[${getTime()}] ${eventType}: ${relativePath}`);
  console.log(`[${getTime()}] 🔁 Executando atualização do Painel Principal...`);

  exec(`node "${dashboardScript}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`[${getTime()}] ❌ Erro ao gerar painel: ${err.message}`);
      if (stderr) console.error(`[${getTime()}]   Stderr: ${stderr}`);
    } else {
      console.log(`[${getTime()}] ✅ Painel Principal atualizado com sucesso!`);
      // Optional: Log stdout if needed
      // if (stdout) console.log(`[${getTime()}]   Saída: ${stdout}`);
      if (stderr) console.warn(`[${getTime()}]   Avisos (stderr): ${stderr}`); // Log warnings from stderr
    }
    // Reset debounce flag after a short delay to allow filesystem events to settle
    setTimeout(() => { isUpdating = false; }, 200);
  });
}

watcher
  .on('add', path => runDashboard('add', path))
  .on('unlink', path => runDashboard('unlink', path))
  .on('error', error => console.error(`[${getTime()}] ❌ Erro no watcher: ${error}`))
  .on('ready', () => console.log(`[${getTime()}] ✨ Monitoramento pronto!`));

console.log(`[${getTime()}] Pressione Ctrl+C para parar.`);

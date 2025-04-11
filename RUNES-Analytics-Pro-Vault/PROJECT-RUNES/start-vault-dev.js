import { exec, spawn } from 'child_process';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function for timestamp
const getTime = () => new Date().toLocaleTimeString('pt-BR');

// Usar chalk para logs
const logInfo = (message) => console.log(chalk.blue(`[${getTime()}] ${message}`));
const logSuccess = (message) => console.log(chalk.green(`[${getTime()}] ${message}`));
const logError = (message) => console.error(chalk.red(`[${getTime()}] ${message}`));
const logScriptOutput = (scriptName, data) => {
  data.toString().trim().split('\n').forEach(line => {
    console.log(chalk.cyan(`  [${scriptName}] ${line}`));
  });
};

const scripts = {
  init: 'create-vault-structure.js',
  fix: 'fix-vault-filenames.js',
  generate: 'generate-vault-dashboard.js',
  build: 'generate-all-md.js',
  validate: 'validate-vault-structure.js',
  watch: 'watch-vault.js'
};

// Function to run a script and return a promise
function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptFileName = scripts[scriptName];
    if (!scriptFileName) {
        logError(`Script '${scriptName}' não definido.`);
        return reject(new Error(`Script alias not found: ${scriptName}`));
    }
    const scriptPath = path.join(__dirname, scriptFileName);
    logInfo(`🚀 Executando: node ${scriptFileName}...`);

    if (!fs.existsSync(scriptPath)) {
      logError(`❌ Erro: Script ${scriptFileName} não encontrado em ${scriptPath}`);
      return reject(new Error(`Script file not found: ${scriptFileName}`));
    }

    const process = exec(`node "${scriptPath}"`);

    process.stdout.on('data', (data) => {
      logScriptOutput(scriptFileName, data);
    });

    process.stderr.on('data', (data) => {
      // Log stderr from the script
      console.error(chalk.magenta(`[${getTime()}]   [${scriptFileName} STDERR] ${data.toString().trim()}`));
    });

    process.on('close', (code) => {
      if (code === 0) {
        logSuccess(`✅ Script ${scriptFileName} concluído com sucesso.`);
        resolve();
      } else {
        logError(`❌ Script ${scriptFileName} falhou com código ${code}.`);
        reject(new Error(`Script ${scriptFileName} failed with code ${code}`));
      }
    });

    process.on('error', (err) => {
      logError(`❌ Erro ao iniciar o script ${scriptFileName}: ${err.message}`);
      reject(err);
    });
  });
}

// Function to start the watcher script (using spawn)
function startWatcher() {
  const scriptFileName = scripts.watch;
  const scriptPath = path.join(__dirname, scriptFileName);
  logInfo(`👀 Iniciando watcher: node ${scriptFileName}... (Pressione Ctrl+C para parar)`);

  if (!fs.existsSync(scriptPath)) {
    logError(`❌ Erro Fatal: Script ${scriptFileName} não encontrado em ${scriptPath}`);
    return; // Não inicia o watcher
  }

  // Use spawn para manter o watcher rodando e herdar stdio
  const watcherProcess = spawn('node', [scriptPath], {
    stdio: 'inherit' // Permite que os logs do watcher apareçam diretamente
  });

  watcherProcess.on('close', (code) => {
    logInfo(`👋 Watcher (${scriptFileName}) encerrado com código ${code}.`);
    // Oferecer voltar ao menu após o watcher fechar?
    // Ou simplesmente encerrar o script principal?
    // Por enquanto, apenas encerra.
    // showMainMenu(); // Descomente para voltar ao menu
  });

  watcherProcess.on('error', (err) => {
    logError(`❌ Erro ao iniciar o watcher ${scriptFileName}: ${err.message}`);
    // showMainMenu(); // Oferecer voltar ao menu em caso de erro
  });
}

// --- Menu Interativo --- //
async function showMainMenu() {
    logInfo('\n--- Painel de Controle do Vault ---');
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Escolha uma ação:',
            choices: [
                { name: '1. 🛠️  Inicializar/Verificar Estrutura (init)', value: 'init' },
                { name: '2. ✨ Corrigir Nomes de Arquivos (fix)', value: 'fix' },
                { name: '3. 📊 Gerar Painel Principal (generate)', value: 'generate' },
                { name: '4. 🔥 Gerar Consolidado (build)', value: 'build' },
                { name: '5. ✅ Validar Estrutura e Arquivos (validate)', value: 'validate' },
                { name: '6. 👀 Monitorar Alterações (watch)', value: 'watch' },
                new inquirer.Separator(),
                { name: '🚪 Sair', value: 'exit' }
            ]
        }
    ]);

    try {
        switch (answers.action) {
            case 'init':
                await runScript('init');
                break;
            case 'fix':
                await runScript('fix');
                break;
            case 'generate':
                await runScript('generate');
                break;
            case 'build':
                await runScript('build');
                break;
            case 'validate':
                await runScript('validate');
                break;
            case 'watch':
                startWatcher(); // Watcher usa spawn e não retorna promise aqui
                return; // Não mostra o menu novamente enquanto o watcher roda
            case 'exit':
                logInfo('👋 Saindo...');
                process.exit(0);
        }
    } catch (error) {
        // Erros já são logados por runScript/startWatcher
        logError('Ocorreu um erro durante a execução da ação.');
    }

    // Volta para o menu após a conclusão da ação (exceto para 'watch' e 'exit')
    if (answers.action !== 'exit') {
        logInfo('\nAção concluída. Pressione Enter para voltar ao menu.');
        await inquirer.prompt({ type: 'input', name: 'continue', message: '', default: ''});
        showMainMenu();
    }
}

// Inicia o menu principal
showMainMenu(); 
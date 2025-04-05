/**
 * Animação de carregamento do sistema RUNES Analytics Pro
 * Exibe uma barra de progresso animada com mensagens de inicialização
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Mensagens que serão exibidas durante o carregamento
const loadingMessages = [
  { text: 'Inicializando módulos de análise', time: 500 },
  { text: 'Conectando às APIs de tokens', time: 800 },
  { text: 'Carregando histórico de preços', time: 600 },
  { text: 'Construindo modelos preditivos', time: 1000 },
  { text: 'Analisando dados on-chain', time: 700 },
  { text: 'Verificando mempool de transações', time: 500 },
  { text: 'Compilando métricas de mercado', time: 600 },
  { text: 'Estabelecendo conexão segura', time: 400 },
  { text: 'Indexando tokens RUNES recentes', time: 900 },
  { text: 'Verificando integridade do sistema', time: 300 }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearLine() {
  process.stdout.write('\r\x1b[K');
}

async function animateLoading() {
  console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════════════╗`);
  console.log(`║  ${colors.cyan}RUNES Analytics Pro${colors.blue} - Inicialização do Sistema  ║`);
  console.log(`╚════════════════════════════════════════════════╝${colors.reset}\n`);
  
  await sleep(500);
  
  const barWidth = 40;
  let progress = 0;
  const increment = 100 / loadingMessages.length;
  
  for (const message of loadingMessages) {
    // Exibe a mensagem atual
    clearLine();
    const spinChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinIndex = 0;
    
    // Timer para animar o spinner enquanto "processa"
    const spinnerInterval = setInterval(() => {
      clearLine();
      const completedWidth = Math.floor((progress / 100) * barWidth);
      const remainingWidth = barWidth - completedWidth;
      
      process.stdout.write(
        `${colors.yellow}${spinChars[spinIndex]} ${colors.bright}${message.text.padEnd(35)}${colors.reset} ` +
        `${colors.green}[${'█'.repeat(completedWidth)}${colors.dim}${'░'.repeat(remainingWidth)}${colors.reset}${colors.green}]${colors.reset} ` +
        `${Math.floor(progress)}%`
      );
      
      spinIndex = (spinIndex + 1) % spinChars.length;
    }, 80);
    
    // Aguarda o tempo especificado para esta etapa
    await sleep(message.time);
    clearInterval(spinnerInterval);
    
    // Atualiza o progresso
    progress += increment;
    
    // Exibe a linha final para esta etapa (sem spinner, com checkmark)
    clearLine();
    const completedWidth = Math.floor((progress / 100) * barWidth);
    const remainingWidth = barWidth - completedWidth;
    
    process.stdout.write(
      `${colors.green}✓ ${colors.bright}${message.text.padEnd(35)}${colors.reset} ` +
      `${colors.green}[${'█'.repeat(completedWidth)}${colors.dim}${'░'.repeat(remainingWidth)}${colors.reset}${colors.green}]${colors.reset} ` +
      `${Math.floor(progress)}%\n`
    );
    
    await sleep(200);
  }
  
  // Finalização
  console.log(`\n${colors.bright}${colors.green}Sistema inicializado com sucesso! ${colors.yellow}Bem-vindo(a) ao RUNES Analytics Pro.${colors.reset}\n`);
}

// Executa a animação
animateLoading().catch(console.error); 
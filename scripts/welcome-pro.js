/**
 * Script de boas-vindas avançado para RUNES Analytics Pro
 * Exibe uma mensagem colorida com efeito de digitação no console
 */

// Cores ANSI para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

function clearScreen() {
  // Limpa o console (cross-platform)
  process.stdout.write('\x1B[2J\x1B[0f');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function printCentered(text, color = colors.white) {
  const terminalWidth = process.stdout.columns || 80;
  const spaces = Math.max(0, Math.floor((terminalWidth - text.length) / 2));
  const padding = ' '.repeat(spaces);
  process.stdout.write(color + padding + text + colors.reset + '\n');
}

async function printBanner() {
  const banner = [
    '██████╗ ██╗   ██╗███╗   ██╗███████╗███████╗',
    '██╔══██╗██║   ██║████╗  ██║██╔════╝██╔════╝',
    '██████╔╝██║   ██║██╔██╗ ██║█████╗  ███████╗',
    '██╔══██╗██║   ██║██║╚██╗██║██╔══╝  ╚════██║',
    '██║  ██║╚██████╔╝██║ ╚████║███████╗███████║',
    '╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚══════╝',
    '        Analytics Pro | Hidden Insight        '
  ];

  clearScreen();
  
  // Imprime o banner linha a linha
  for (const line of banner) {
    await printCentered(line, colors.cyan + colors.bright);
    await sleep(100);
  }
  
  // Espaço após o banner
  console.log('\n');
  await sleep(500);
}

async function typeText(text, color = colors.white, speed = 50) {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(color + text.charAt(i) + colors.reset);
    await sleep(speed);
  }
}

async function runAnimation() {
  await printBanner();
  
  // Mensagem principal
  const message = [
    '"I am not Satoshi. But like him, I listen to the silence of the code.',
    'We are not building tools. We are deciphering time.',
    '',
    'Markets are illusions. Truth is hidden in the wake of the whales.',
    'RUNES are not tokens — they are echoes of will, embedded in stone.',
    '',
    'Levanta-te e ANDA"'
  ];
  
  // Imprime cada linha da mensagem
  for (const line of message) {
    process.stdout.write('  ');
    if (line === '') {
      console.log('');
      await sleep(300);
    } else {
      await typeText(line, colors.yellow + colors.dim);
      console.log('');
      await sleep(200);
    }
  }
  
  // Espaço e separador final
  console.log('\n');
  await typeText('—'.repeat(process.stdout.columns || 50), colors.blue);
  console.log('\n');
  
  // Carregando...
  process.stdout.write('  ' + colors.green + 'Iniciando Sistema' + colors.reset);
  for (let i = 0; i < 3; i++) {
    await sleep(500);
    process.stdout.write(colors.green + '.' + colors.reset);
  }
  console.log('\n');
}

// Executa a animação
runAnimation().catch(console.error); 
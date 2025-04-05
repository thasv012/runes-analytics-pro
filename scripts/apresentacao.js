/**
 * RUNES Analytics Pro - Script de Demonstração
 * 
 * Este script inicia a apresentação e demonstra o uso dos RuneCards
 * na interface do console e também prepara a navegação da apresentação em HTML.
 */

const { displayRuneCard, displayAnimatedRuneCard, EXAMPLE_CARDS, COLORS } = require('../runescards.js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Exibe uma mensagem animada de boas-vindas
 */
function mostrarMensagemBoasVindas() {
  console.clear();
  
  const mensagem = `
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║      RUNES Analytics Pro - Apresentação Interativa       ║
  ║                                                          ║
  ║      Uma jornada pelo ecossistema RUNES com dados,       ║
  ║      narrativas e insights estratégicos                  ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝

  Seja bem-vindo à demonstração do RUNES Analytics Pro!
  
  Este script demonstrará a capacidade do sistema de RuneCards
  e iniciará a apresentação visual do projeto.
  
  Pressione qualquer tecla para continuar...
  `;
  
  let i = 0;
  const interval = setInterval(() => {
    if (i < mensagem.length) {
      process.stdout.write(mensagem[i]);
      i++;
    } else {
      clearInterval(interval);
      console.log('\n');
      iniciarDemonstracao();
    }
  }, 10);
}

/**
 * Inicia a demonstração dos RuneCards
 */
async function iniciarDemonstracao() {
  console.log(`${COLORS.cyan}Iniciando demonstração de RuneCards...${COLORS.reset}\n`);
  
  // Demonstrar RuneCard estático
  console.log(`${COLORS.yellow}▶ Exemplo 1: RuneCard Estático${COLORS.reset}`);
  displayRuneCard(EXAMPLE_CARDS.ordinals);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log(`\n${COLORS.yellow}▶ Exemplo 2: RuneCard Animado${COLORS.reset}`);
  console.log(`${COLORS.gray}(Aguarde a animação...)${COLORS.reset}\n`);
  
  // Demonstrar RuneCard animado
  await displayAnimatedRuneCard(EXAMPLE_CARDS.cypher, { 
    typingSpeed: 20,
    delayBetweenSections: 200
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`\n${COLORS.green}Demonstração concluída!${COLORS.reset}\n`);
  
  // Iniciar apresentação HTML
  iniciarApresentacaoHTML();
}

/**
 * Inicia a apresentação HTML
 */
function iniciarApresentacaoHTML() {
  console.log(`${COLORS.cyan}Iniciando apresentação HTML...${COLORS.reset}`);
  
  const apresentacaoPath = path.join(process.cwd(), 'apresentacao-runes.html');
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(apresentacaoPath)) {
    console.error(`${COLORS.red}Erro: O arquivo apresentacao-runes.html não foi encontrado.${COLORS.reset}`);
    return;
  }
  
  console.log(`${COLORS.green}Abrindo apresentação...${COLORS.reset}`);
  
  // Abre o arquivo HTML no navegador padrão
  let comando;
  switch (process.platform) {
    case 'win32':
      comando = `start "" "${apresentacaoPath}"`;
      break;
    case 'darwin':
      comando = `open "${apresentacaoPath}"`;
      break;
    default:
      comando = `xdg-open "${apresentacaoPath}"`;
  }
  
  exec(comando, (error) => {
    if (error) {
      console.error(`${COLORS.red}Erro ao abrir a apresentação: ${error.message}${COLORS.reset}`);
      return;
    }
    
    console.log(`\n${COLORS.green}Apresentação iniciada com sucesso no seu navegador!${COLORS.reset}`);
    console.log(`${COLORS.yellow}Use as setas ← → ou os botões na parte inferior para navegar pelos slides.${COLORS.reset}`);
    
    mostrarMensagemFinal();
  });
}

/**
 * Exibe uma mensagem final após iniciar a apresentação
 */
function mostrarMensagemFinal() {
  const mensagemFinal = `
  ${COLORS.cyan}╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║           RUNES Analytics Pro - King Bootoshi            ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝${COLORS.reset}
  
  ${COLORS.yellow}Obrigado por explorar o RUNES Analytics Pro!${COLORS.reset}
  
  ${COLORS.white}Esta apresentação demonstra a visão e funcionalidades do projeto,
  incluindo o sistema de visualização de dados, APIs integradas,
  e o revolucionário sistema de RUNECARDS.${COLORS.reset}
  
  ${COLORS.cyan}Os dados são frios. Mas o que os move... é fogo. É fé. É Cypher.${COLORS.reset}
  `;
  
  console.log(mensagemFinal);
}

// Iniciar o script
mostrarMensagemBoasVindas(); 
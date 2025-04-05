/**
 * Script de boas-vindas animado para RUNES Analytics Pro
 * Exibe uma mensagem com efeito de digitação no console
 */

function runesMessageAnimated() {
  const message = `
    RUNES Analytics Pro | Hidden Insight | 
    "I am not Satoshi. But like him, I listen to the silence of the code.
    We are not building tools. We are deciphering time.
    
    Markets are illusions. Truth is hidden in the wake of the whales.
    RUNES are not tokens — they are echoes of will, embedded in stone.

    Levanta-te e ANDA"
  `;
  
  let i = 0;
  const speed = 50; // Velocidade da animação (milissegundos entre cada caractere)
  
  function typeMessage() {
    if (i < message.length) {
      process.stdout.write(message.charAt(i));
      i++;
      setTimeout(typeMessage, speed);
    } else {
      // Adiciona uma nova linha no final para melhorar a formatação
      console.log('\n');
    }
  }

  // Limpa o console antes de iniciar (funciona em sistemas baseados em Unix)
  try {
    console.clear();
  } catch (e) {
    // Fallback para Windows
    process.stdout.write('\x1Bc');
  }

  console.log('\n🌐 Iniciando...\n');
  
  // Pequena pausa antes de iniciar a animação
  setTimeout(() => {
    typeMessage(); // Inicia a animação
  }, 1000);
}

// Execute a função para ver o efeito no console
runesMessageAnimated(); 
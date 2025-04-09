/**
 * RUNES Analytics Pro - Neural Banner Generator
 * Exemplos de uso da API JavaScript
 * 
 * Este arquivo contém exemplos para diferentes casos de uso
 * do gerador de banners neurais usando a API JavaScript.
 */

// -----------------------------------------------
// Exemplos básicos de geração de banners
// -----------------------------------------------

/**
 * Geração básica com estilo cyberpunk
 */
async function basicCyberpunkBanner() {
  const canvas = await NeuralBanner.generate({
    style: "cyberpunk",
    text: "RUNES Analytics Pro",
    resolution: "1280x720",
    textPosition: "center"
  });
  
  // Baixar o banner gerado
  NeuralBanner.download("banner-cyberpunk.png");
}

/**
 * Geração com estilo Neural Glow e texto personalizado
 */
async function neuralGlowWithCustomText() {
  const canvas = await NeuralBanner.generate({
    style: "neural-glow",
    text: "Domine o ecossistema Bitcoin\nCom RUNES Analytics Pro",
    resolution: "1920x1080",
    textPosition: "center",
    includeSignature: true
  });
  
  // Obter o data URL da imagem
  const dataUrl = NeuralBanner.getDataURL();
  console.log("Banner gerado:", dataUrl.substring(0, 50) + "...");
}

// -----------------------------------------------
// Casos de uso específicos
// -----------------------------------------------

/**
 * Banner para slide de apresentação
 */
async function presentationSlideBanner() {
  const canvas = await NeuralBanner.generate({
    style: "neural-glow",
    text: "RUNES Analytics Pro\nAnálise e Inteligência para Bitcoin",
    resolution: "1920x1080",
    textPosition: "center",
    includeSignature: false,
    theme: "dark"
  });
  
  NeuralBanner.download("slide-background.png");
}

/**
 * Banner para compartilhamento em redes sociais
 */
async function socialSharingBanner() {
  const canvas = await NeuralBanner.generate({
    style: "cyberpunk",
    text: "Whales don't follow trends.\nThey start them.",
    resolution: "1200x630", // Tamanho otimizado para redes sociais
    textPosition: "center",
    includeSignature: true,
    qr: "https://runesanalytics.pro"
  });
  
  NeuralBanner.download("social-share.png");
}

/**
 * Banner de alerta de movimentação de baleias
 */
async function whaleAlertBanner() {
  const canvas = await NeuralBanner.generate({
    style: "bitcoin-abstract",
    text: "ALERTA DE BALEIA\nRUNES-BTC\nVolume: 500 BTC",
    resolution: "1000x500",
    textPosition: "center"
  });
  
  NeuralBanner.download("whale-alert.png");
}

/**
 * Card de token vertical
 */
async function tokenCardBanner() {
  const canvas = await NeuralBanner.generate({
    style: "runes-art",
    text: "GENAI\nSupply: 21.000.000\nBurned: 5.000.000",
    resolution: "600x800", // Formato vertical
    textPosition: "bottom",
    theme: "dark"
  });
  
  NeuralBanner.download("token-card.png");
}

// -----------------------------------------------
// Funções para integração com outros sistemas
// -----------------------------------------------

/**
 * Gerar um banner para conquista no sistema de gamificação
 * @param {Object} achievement - Dados da conquista
 */
async function generateAchievementBanner(achievement) {
  const text = `CONQUISTA DESBLOQUEADA!\n${achievement.title}\n${achievement.description}`;
  
  const canvas = await NeuralBanner.generate({
    style: "neural-glow",
    text: text,
    resolution: "1200x630",
    textPosition: "center"
  });
  
  return NeuralBanner.getDataURL();
}

/**
 * Gerar um banner para alerta de movimentação significativa
 * @param {Object} movement - Dados da movimentação
 */
async function generateMovementAlert(movement) {
  const text = `ALERTA DE MOVIMENTO\n${movement.token}\nVolume: ${movement.amount} BTC\nData: ${movement.date}`;
  
  const canvas = await NeuralBanner.generate({
    style: "bitcoin-abstract",
    text: text,
    resolution: "1000x500",
    textPosition: "center"
  });
  
  return NeuralBanner.getDataURL();
}

/**
 * Gerar um conjunto de banners para uma apresentação
 * @param {string} title - Título da apresentação
 * @param {Array} topics - Lista de tópicos
 */
async function generatePresentationSet(title, topics) {
  const banners = [];
  
  // Banner de título
  banners.push({
    name: "title",
    dataURL: await NeuralBanner.generate({
      style: "neural-glow",
      text: title,
      resolution: "1920x1080",
      textPosition: "center"
    }).then(() => NeuralBanner.getDataURL())
  });
  
  // Banner para cada tópico
  for (const topic of topics) {
    banners.push({
      name: topic.replace(/\s+/g, '-').toLowerCase(),
      dataURL: await NeuralBanner.generate({
        style: "cyberpunk",
        text: topic,
        resolution: "1920x1080",
        textPosition: "center"
      }).then(() => NeuralBanner.getDataURL())
    });
  }
  
  return banners;
}

// -----------------------------------------------
// Exemplos de uso em diferentes contextos
// -----------------------------------------------

// Exemplo: Como usar em um evento de clique
document.getElementById('generate-button').addEventListener('click', async () => {
  const text = document.getElementById('text-input').value;
  const style = document.getElementById('style-select').value;
  
  // Mostrar indicador de carregamento
  document.getElementById('loading').style.display = 'block';
  
  try {
    await NeuralBanner.generate({
      style: style,
      text: text,
      resolution: "1280x720"
    });
    
    // Atualizar preview
    document.getElementById('preview').src = NeuralBanner.getDataURL();
    
    // Habilitar botão de download
    document.getElementById('download-button').disabled = false;
  } catch (error) {
    console.error("Erro ao gerar banner:", error);
    alert("Erro ao gerar banner: " + error.message);
  } finally {
    // Esconder indicador de carregamento
    document.getElementById('loading').style.display = 'none';
  }
});

// Exemplo: Como usar em um módulo de rastreamento de baleias
class WhaleTracker {
  constructor() {
    this.threshold = 100; // BTC
  }
  
  async notifyMovement(movement) {
    if (movement.amount >= this.threshold) {
      const bannerURL = await generateMovementAlert(movement);
      
      // Enviar notificação com o banner
      this.sendNotification({
        title: "Movimento de Baleia Detectado!",
        message: `${movement.amount} BTC movimentados em ${movement.token}`,
        image: bannerURL
      });
    }
  }
  
  sendNotification(notification) {
    // Código para enviar a notificação
    console.log("Notificação enviada:", notification);
  }
}

// Exemplo: Integração com sistema de gamificação
class GamificationSystem {
  async updateUserLevel(user, newLevel) {
    // Criar imagem de conquista
    const achievement = {
      title: `Nível ${newLevel} Alcançado!`,
      description: `Parabéns ${user.name}, você subiu para o nível ${newLevel}!`
    };
    
    const bannerURL = await generateAchievementBanner(achievement);
    
    // Salvar conquista no perfil do usuário
    user.achievements.push({
      type: "level_up",
      level: newLevel,
      date: new Date(),
      bannerURL: bannerURL
    });
    
    // Salvar usuário atualizado
    this.saveUser(user);
  }
  
  saveUser(user) {
    // Código para salvar usuário
    console.log("Usuário atualizado:", user);
  }
}

// Exportar funções de exemplo
export {
  basicCyberpunkBanner,
  neuralGlowWithCustomText,
  presentationSlideBanner,
  socialSharingBanner,
  whaleAlertBanner,
  tokenCardBanner,
  generateAchievementBanner,
  generateMovementAlert,
  generatePresentationSet
}; 
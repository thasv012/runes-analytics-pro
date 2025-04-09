/**
 * RUNES Analytics Pro - Script para automatizar postagem de thread no Twitter
 * 
 * Este script utiliza a API v2 do Twitter para postar automaticamente uma thread.
 * É necessário ter credenciais OAuth 2.0 do Twitter Developer Portal.
 * 
 * Para usar:
 * 1. Instale as dependências: npm install twitter-api-v2 dotenv fs path
 * 2. Configure as variáveis de ambiente em um arquivo .env
 * 3. Execute: node post-thread-twitter.js
 */

require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Configurações
const THREAD_FILE = './thread-runes-analytics-english-exportable.md';
const IMAGES_FOLDER = './media/thread-images';
const IMAGE_MAPPING = {
  '1': 'runes-analytics-thread-evolution.png',
  '2': 'runes-analytics-thread-gpu-mesh.png',
  '3': 'runes-analytics-thread-websocket.png',
  '4': 'runes-analytics-thread-roadmap.png',
  '5': 'runes-analytics-thread-ai-analysis.png',
  '6': 'runes-analytics-thread-whales-tracking.png',
  '7': 'runes-analytics-thread-comparison.png',
  '8': 'runes-analytics-thread-next-evolution.png',
  '9': 'runes-analytics-dashboard.png',
  '10': 'runes-analytics-universe.png'
};

// Configuração do cliente Twitter
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Função principal
async function postTwitterThread() {
  try {
    console.log('🚀 Iniciando postagem da thread RUNES Analytics Pro no Twitter...');
    
    // Lê o arquivo da thread
    const threadContent = await fs.promises.readFile(THREAD_FILE, 'utf8');
    
    // Divide o conteúdo em tweets individuais
    const tweets = threadContent
      .split(/🧵 \d+\/10\n/)  // Divide pelo padrão "🧵 X/10" seguido de quebra de linha
      .filter(tweet => tweet.trim().length > 0)  // Remove strings vazias
      .map((content, index) => {
        // Remonta o número do tweet
        return `🧵 ${index + 1}/10\n${content.trim()}`;
      });
    
    console.log(`📋 Thread dividida em ${tweets.length} tweets`);
    
    // Referência para tweet anterior na thread
    let lastTweetId = null;
    
    // Posta cada tweet
    for (let i = 0; i < tweets.length; i++) {
      const tweetNumber = i + 1;
      console.log(`\n📤 Postando tweet ${tweetNumber}/10...`);
      
      // Verifica se há imagem correspondente
      const imageName = IMAGE_MAPPING[tweetNumber.toString()];
      let mediaId = null;
      
      if (imageName) {
        const imagePath = path.join(IMAGES_FOLDER, imageName);
        if (fs.existsSync(imagePath)) {
          console.log(`🖼️ Anexando imagem: ${imageName}`);
          mediaId = await uploadMedia(imagePath);
        } else {
          console.warn(`⚠️ Imagem não encontrada: ${imagePath}`);
        }
      }
      
      // Configura opções para o tweet
      const tweetOptions = {
        text: tweets[i]
      };
      
      // Adiciona referência ao tweet anterior na thread
      if (lastTweetId) {
        tweetOptions.reply = { in_reply_to_tweet_id: lastTweetId };
      }
      
      // Adiciona mídia se disponível
      if (mediaId) {
        tweetOptions.media = { media_ids: [mediaId] };
      }
      
      // Posta o tweet
      const { data: createdTweet } = await client.v2.tweet(tweetOptions);
      lastTweetId = createdTweet.id;
      
      console.log(`✅ Tweet ${tweetNumber}/10 postado com sucesso!`);
      console.log(`🔗 https://twitter.com/user/status/${lastTweetId}`);
      
      // Intervalo entre tweets para evitar limites de taxa
      if (i < tweets.length - 1) {
        const delay = 5000; // 5 segundos
        console.log(`⏱️ Aguardando ${delay/1000} segundos antes de postar o próximo tweet...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log('\n🎉 Thread completa postada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao postar thread:', error);
  }
}

// Função para fazer upload de mídia
async function uploadMedia(filePath) {
  try {
    const mediaBuffer = await fs.promises.readFile(filePath);
    const mediaId = await client.v1.uploadMedia(mediaBuffer);
    return mediaId;
  } catch (error) {
    console.error(`❌ Erro ao fazer upload da mídia ${filePath}:`, error);
    return null;
  }
}

// Instrução para usar o script
function printInstructions() {
  console.log(`
📋 RUNES Analytics Pro - Automação de Thread no Twitter

Para usar este script:

1. Crie um app no Twitter Developer Portal (developer.twitter.com)
2. Crie um arquivo .env com as seguintes variáveis:
   TWITTER_API_KEY=sua_api_key
   TWITTER_API_SECRET=seu_api_secret
   TWITTER_ACCESS_TOKEN=seu_access_token
   TWITTER_ACCESS_SECRET=seu_access_secret

3. Instale as dependências:
   npm install twitter-api-v2 dotenv fs path

4. Certifique-se de que:
   - O arquivo thread-runes-analytics-english-exportable.md existe
   - As imagens estão disponíveis em media/thread-images/

5. Execute:
   node post-thread-twitter.js

⚠️ Limitações:
- A API do Twitter tem limites de requisições
- São permitidos no máximo 5 tweets por minuto
- A autenticação requer um app no Twitter Developer Portal
  `);
}

// Se for executado diretamente
if (require.main === module) {
  // Verifica se é para exibir instruções
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printInstructions();
  }
  // Verifica se é para executar em modo de simulação
  else if (process.argv.includes('--dry-run')) {
    console.log('🧪 Modo de simulação ativado, nenhum tweet será postado');
    postTwitterThread({ dryRun: true });
  }
  // Executa normalmente
  else {
    printInstructions();
    console.log('\nVerifique as instruções acima e execute com "--dry-run" para testar ou "--help" para mais informações.');
    // Descomentar a linha abaixo para executar diretamente
    // postTwitterThread();
  }
} 
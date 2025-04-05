#!/usr/bin/env node

/**
 * RUNECARD Generator - Utilitário de linha de comando
 * 
 * Uso: node create-runecard.js --title "Nome do Card" --ticker "TICKER" --inspiration "Frase inspiradora"
 */

const fs = require('fs');
const path = require('path');
const { generateRunecardTemplate } = require('./runecard-template');

// Função para processar argumentos da linha de comando
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    
    if (value) {
      params[key] = value;
    }
  }
  
  return params;
}

// Função principal
function main() {
  console.log('\n🃏 RUNECARD Generator 🃏');
  console.log('=======================\n');
  
  // Verificar os argumentos
  const args = parseArgs();
  
  if (!args.title || !args.ticker || !args.inspiration) {
    console.log('❌ Erro: Parâmetros obrigatórios faltando!\n');
    console.log('Uso:');
    console.log('  node create-runecard.js --title "Nome do Card" --ticker "TICKER" --inspiration "Frase inspiradora"\n');
    console.log('Exemplo:');
    console.log('  node create-runecard.js --title "Terra Nova" --ticker "TERRA" --inspiration "Natureza e sustentabilidade"\n');
    process.exit(1);
  }
  
  // Validar o ticker
  if (!/^[A-Z0-9]{3,10}$/.test(args.ticker)) {
    console.log('❌ Erro: O ticker deve conter entre 3 e 10 caracteres alfanuméricos (letras maiúsculas e números).\n');
    process.exit(1);
  }
  
  // Criar diretório cards se não existir
  const cardsDir = path.join(__dirname, '..', 'cards');
  if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
  }
  
  // Gerar timestamp e nome do arquivo
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '-').slice(0, 15);
  const fileName = `runecard-${args.ticker.toLowerCase()}-${timestamp}.json`;
  const filePath = path.join(cardsDir, fileName);
  
  // Gerar o RUNECARD
  console.log(`🔮 Gerando RUNECARD: ${args.title} (${args.ticker})`);
  const runecard = generateRunecardTemplate(args.title, args.ticker, args.inspiration);
  
  // Salvar o arquivo
  fs.writeFileSync(filePath, JSON.stringify(runecard, null, 2));
  
  console.log(`\n✅ RUNECARD gerado com sucesso!`);
  console.log(`📂 Arquivo salvo em: ${fileName}`);
  
  // Exibir detalhes mais completos do card
  console.log(`\n📊 Detalhes do Card:`);
  console.log(`   Título: ${runecard.title}`);
  console.log(`   Ticker: ${runecard.rune.ticker}`);
  console.log(`   Suprimento: ${runecard.rune.minted}`);
  console.log(`   Cor Tema: ${runecard.visual.themeColor}`);
  console.log(`   Animação: ${runecard.visual.animation}`);
  console.log(`   Habilidades: ${runecard.abilities.core.length} principais, ${runecard.abilities.awakening.unlocked.length} de despertar`);
  
  // Exibir novas informações
  console.log(`\n🏷️ Classificação:`);
  console.log(`   Categoria: ${runecard.meta.category}`);
  console.log(`   Tags: ${runecard.meta.tags.join(', ')}`);
  
  // Exibir avaliação de exemplo
  if (runecard.reviews && runecard.reviews.length > 0) {
    const review = runecard.reviews[0];
    console.log(`\n⭐ Avaliação de exemplo:`);
    console.log(`   Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)} (${review.rating}/5)`);
    console.log(`   Comentário: "${review.comment}"`);
  }
  
  // Sugerir próximos passos (expandido)
  console.log('\n🔍 Próximos passos:');
  console.log(`   1. Edite o card no editor visual: editor-lab.html?card=cards/${fileName}`);
  console.log('   2. Adicione uma imagem personalizada em assets/cards/');
  console.log('   3. Personalize as tags e categoria para melhor classificação');
  console.log('   4. Adicione avaliações e comentários para feedback');
  console.log('   5. Compartilhe seu RUNECARD com a comunidade\n');
  
  // Banner informativo sobre novos recursos
  console.log('\n🆕 Novos recursos disponíveis:');
  console.log('   • Sistema de tags e categorias aninhadas');
  console.log('   • Avaliações e comentários dos usuários');
  console.log('   • Validação automática de templates');
  console.log('   • Sincronização com API quando logado');
  console.log('   • Sistema de plugins extensíveis\n');
}

// Executar o programa
main(); 
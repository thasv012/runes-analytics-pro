/**
 * Script para gerar README.md a partir dos blocos de documentação
 * Uso: node scripts/generate-readme.js
 */

const fs = require('fs');
const path = require('path');

// Configuração
const docsDir = path.join(__dirname, '..', 'docs');
const outputFile = path.join(__dirname, '..', 'README.md');
const blocos = [
  'bloco1.md',
  'bloco2.md',
  'bloco3.md',
  'bloco4.md'
];

// Função principal
async function generateReadme() {
  try {
    console.log('🔄 Gerando README.md a partir dos blocos de documentação...');
    
    let conteudoFinal = '';
    let separador = '\n\n---\n\n';
    
    // Ler e concatenar os blocos
    for (const [index, bloco] of blocos.entries()) {
      const caminhoBloco = path.join(docsDir, bloco);
      
      if (!fs.existsSync(caminhoBloco)) {
        console.error(`❌ Erro: O arquivo ${bloco} não foi encontrado no diretório docs.`);
        continue;
      }
      
      const conteudo = fs.readFileSync(caminhoBloco, 'utf8');
      
      // Remove a linha de timestamp do final de cada bloco (se existir)
      let conteudoProcessado = conteudo.replace(/📅 Última atualização:.*$/m, '').trim();
      
      // Adiciona o conteúdo ao documento final
      conteudoFinal += conteudoProcessado;
      
      // Adiciona separador entre blocos (exceto após o último)
      if (index < blocos.length - 1) {
        conteudoFinal += separador;
      }
    }
    
    // Adiciona timestamp de geração
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    conteudoFinal += `\n\n---\n\n📅 *Documento gerado automaticamente em ${dataFormatada} às ${horaFormatada}*`;
    
    // Escreve o arquivo README.md
    fs.writeFileSync(outputFile, conteudoFinal);
    
    console.log(`✅ README.md gerado com sucesso em ${outputFile}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar README.md:', error);
    return false;
  }
}

// Se executado diretamente (não importado como módulo)
if (require.main === module) {
  generateReadme()
    .then(success => {
      if (success) {
        console.log('✨ Processo concluído com sucesso!');
        process.exit(0);
      } else {
        console.error('🛑 Processo falhou!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('💥 Erro fatal:', err);
      process.exit(1);
    });
}

module.exports = { generateReadme }; 
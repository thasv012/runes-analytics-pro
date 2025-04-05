const fs = require('fs').promises;
const path = require('path');
const translate = require('@vitalets/google-translate-api');

/**
 * Script para traduzir automaticamente os arquivos de documentação
 * de português para inglês
 */
async function translateDocs() {
  try {
    console.log('🔄 Iniciando processo de tradução dos blocos de documentação...');
    
    const docsDir = path.join(__dirname, '..', 'docs');
    
    // Arquivos a serem traduzidos
    const files = [
      'bloco1.md',
      'bloco2.md',
      'bloco3.md',
      'bloco4.md'
    ];
    
    // Processar cada arquivo
    for (const file of files) {
      try {
        const sourcePath = path.join(docsDir, file);
        const targetPath = path.join(docsDir, file.replace('.md', '.en.md'));
        
        // Verificar se o arquivo fonte existe
        try {
          await fs.access(sourcePath);
        } catch (err) {
          console.error(`⚠️ Arquivo ${file} não encontrado. Pulando...`);
          continue;
        }
        
        console.log(`📝 Traduzindo ${file}...`);
        
        // Ler o conteúdo do arquivo
        const content = await fs.readFile(sourcePath, 'utf8');
        
        // Dividir o conteúdo em seções: texto e código
        const sections = splitContentIntoSections(content);
        let translatedContent = '';
        
        // Processar cada seção
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          
          // Se for um bloco de código, manter como está
          if (section.type === 'code') {
            translatedContent += section.content;
            continue;
          }
          
          // Traduzir apenas o texto
          try {
            if (section.content.trim()) {
              const result = await translate.translate(section.content, { from: 'pt', to: 'en' });
              translatedContent += result.text;
            } else {
              translatedContent += section.content; // Manter espaços em branco
            }
          } catch (err) {
            console.error(`⚠️ Erro ao traduzir uma seção: ${err.message}`);
            translatedContent += section.content; // Usar original em caso de erro
          }
        }
        
        // Salvar o conteúdo traduzido
        await fs.writeFile(targetPath, translatedContent, 'utf8');
        console.log(`✅ Arquivo ${file.replace('.md', '.en.md')} gerado com sucesso.`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${file}: ${error.message}`);
      }
    }
    
    console.log('✨ Tradução concluída com sucesso.');
    
  } catch (error) {
    console.error(`❌ Erro no processo de tradução: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Divide o conteúdo em seções de texto e código
 * @param {string} content - Conteúdo do arquivo
 * @returns {Array<{type: string, content: string}>} - Array de seções
 */
function splitContentIntoSections(content) {
  const sections = [];
  const lines = content.split('\n');
  
  let currentSection = { type: 'text', content: '' };
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar início ou fim de bloco de código
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Iniciar um novo bloco de código
        // Salvar a seção de texto anterior, se existir
        if (currentSection.content) {
          sections.push(currentSection);
        }
        
        inCodeBlock = true;
        currentSection = { type: 'code', content: line + '\n' };
      } else {
        // Finalizar bloco de código
        currentSection.content += line + '\n';
        sections.push(currentSection);
        
        inCodeBlock = false;
        currentSection = { type: 'text', content: '' };
      }
    } else {
      // Adicionar linha à seção atual
      currentSection.content += line + '\n';
    }
  }
  
  // Adicionar a última seção, se existir
  if (currentSection.content) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Executar a função principal
(async function() {
  try {
    // Verificar se o módulo de tradução está instalado
    require('@vitalets/google-translate-api');
    await translateDocs();
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('📦 Instalando dependência necessária: @vitalets/google-translate-api...');
      const { execSync } = require('child_process');
      
      try {
        execSync('npm install @vitalets/google-translate-api', { stdio: 'inherit' });
        console.log('✅ Dependência instalada com sucesso.');
        await translateDocs();
      } catch (installErr) {
        console.error(`❌ Erro ao instalar dependência: ${installErr.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ Erro: ${err.message}`);
      process.exit(1);
    }
  }
})(); 
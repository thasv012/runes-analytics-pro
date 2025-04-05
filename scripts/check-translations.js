/**
 * Script para verificar se as traduções em inglês estão sincronizadas 
 * com os arquivos originais em português
 * 
 * Uso: node scripts/check-translations.js
 */

const fs = require("fs");
const path = require("path");

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Configurações
const docsDir = path.join(__dirname, '..', 'docs');
const timestampRegex = /📅 [^]*$/; // Regex para remover linhas de timestamp

/**
 * Normaliza o conteúdo para comparação
 * - Remove timestamps
 * - Remove espaços em branco extras
 * - Remove blocos de código (não são traduzidos)
 * - Remove formatação Markdown
 */
function normalizeForComparison(content) {
  // Remover timestamps
  let normalized = content.replace(timestampRegex, '');
  
  // Remover blocos de código
  normalized = normalized.replace(/```[^`]*```/g, '');
  
  // Remover formatação Markdown
  normalized = normalized.replace(/[#*_`]/g, '');
  
  // Remover espaços extras e quebras de linha
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Compara o tamanho do conteúdo normalizado
 * Retorna true se os tamanhos forem aproximadamente equivalentes (±20%)
 */
function compareSizes(original, translation) {
  const originalLength = original.length;
  const translationLength = translation.length;
  
  // Verifica se o tamanho da tradução está dentro de ±20% do original
  const ratio = translationLength / originalLength;
  return ratio > 0.8 && ratio < 1.2;
}

/**
 * Verifica se o início do conteúdo é semelhante (primeiros 100 caracteres)
 * Isso ajuda a detectar quando o arquivo foi completamente alterado
 */
function compareBeginning(original, translation, chars = 100) {
  const originalStart = original.substring(0, chars);
  const translationStart = translation.substring(0, chars);
  
  // Compara os primeiros caracteres
  return originalStart.length > 0 && translationStart.length > 0;
}

/**
 * Verifica as traduções e retorna um relatório
 */
async function checkTranslations() {
  try {
    console.log('🔍 Verificando traduções...');
    
    const files = fs.readdirSync(docsDir);
    const report = {
      upToDate: [],
      needsUpdate: [],
      missing: []
    };
    
    // Encontrar arquivos .md que não têm .en.md correspondente
    const originalFiles = files.filter(file => 
      file.endsWith('.md') && !file.endsWith('.en.md')
    );
    
    for (const originalFile of originalFiles) {
      const baseName = originalFile.replace('.md', '');
      const translationFile = `${baseName}.en.md`;
      const originalPath = path.join(docsDir, originalFile);
      const translationPath = path.join(docsDir, translationFile);
      
      // Verificar se existe arquivo de tradução
      if (!fs.existsSync(translationPath)) {
        report.missing.push(originalFile);
        continue;
      }
      
      // Ler conteúdo dos arquivos
      const originalContent = fs.readFileSync(originalPath, 'utf8');
      const translationContent = fs.readFileSync(translationPath, 'utf8');
      
      // Normalizar conteúdos para comparação
      const normalizedOriginal = normalizeForComparison(originalContent);
      const normalizedTranslation = normalizeForComparison(translationContent);
      
      // Verificar se os tamanhos são comparáveis e se o início é semelhante
      const sizesMatch = compareSizes(normalizedOriginal, normalizedTranslation);
      const beginningMatches = compareBeginning(normalizedOriginal, normalizedTranslation);
      
      if (sizesMatch && beginningMatches) {
        report.upToDate.push(originalFile);
      } else {
        report.needsUpdate.push(originalFile);
      }
    }
    
    // Exibir relatório
    console.log('\n📊 RELATÓRIO DE TRADUÇÕES:\n');
    
    console.log('✅ Arquivos atualizados:');
    if (report.upToDate.length > 0) {
      report.upToDate.forEach(file => console.log(`  - ${file} → ${file.replace('.md', '.en.md')}`));
        } else {
      console.log('  Nenhum arquivo atualizado encontrado');
        }

    console.log('\n⚠️ Arquivos que precisam de atualização:');
    if (report.needsUpdate.length > 0) {
      report.needsUpdate.forEach(file => console.log(`  - ${file} → ${file.replace('.md', '.en.md')}`));
    } else {
      console.log('  Todos os arquivos traduzidos estão atualizados!');
    }
    
    console.log('\n❌ Arquivos sem tradução:');
    if (report.missing.length > 0) {
      report.missing.forEach(file => console.log(`  - ${file} (falta ${file.replace('.md', '.en.md')})`));
    } else {
      console.log('  Todos os arquivos têm tradução!');
    }
    
    // Resumo final
    console.log('\n📋 RESUMO:');
    console.log(`  Total de arquivos originais: ${originalFiles.length}`);
    console.log(`  Atualizados: ${report.upToDate.length}`);
    console.log(`  Precisam de atualização: ${report.needsUpdate.length}`);
    console.log(`  Sem tradução: ${report.missing.length}`);
    
    const allOk = report.needsUpdate.length === 0 && report.missing.length === 0;
    if (allOk) {
      console.log('\n🎉 Todas as traduções estão sincronizadas e atualizadas!');
      return true;
    } else {
      console.log('\n⚠️ Algumas traduções precisam de atenção.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar traduções:', error);
    return false;
  }
}

// Se executado diretamente (não importado como módulo)
if (require.main === module) {
  checkTranslations()
    .then(allOk => {
      if (allOk) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('💥 Erro fatal:', err);
      process.exit(1);
    });
}

module.exports = { checkTranslations };

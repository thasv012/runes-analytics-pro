#!/usr/bin/env node

/**
 * RUNES Analytics Pro - Gerador de README Unificado
 * Gera README.md e README.en.md a partir de blocos modulares
 */

const fs = require("fs");
const path = require("path");

// Configuração dos blocos por idioma
const langs = {
  pt: ["bloco1.md", "bloco2.md", "bloco3.md", "bloco4.md", "bloco5.md"],
  en: ["bloco1.en.md", "bloco2.en.md", "bloco3.en.md", "bloco4.en.md", "bloco5.en.md"],
};

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const generateAll = args.includes("--all");
const langArg = args.find(arg => arg !== "--all") || "pt";
const lang = langArg;

// Definir arquivo de saída baseado no idioma
const output = lang === "pt" ? "README.md" : `README.${lang}.md`;

// Obter os blocos para o idioma selecionado
const blocks = langs[lang];

if (!blocks) {
  console.error(`❌ Erro: Idioma não suportado: ${lang}`);
  console.error("   Idiomas disponíveis: pt, en");
  process.exit(1);
}

// Diretório onde os blocos estão armazenados
const docsDir = path.join(__dirname, "..", "docs");

// Verificar se o diretório de documentação existe
if (!fs.existsSync(docsDir)) {
  console.error(`❌ Erro: Diretório de documentação não encontrado: ${docsDir}`);
  process.exit(1);
}

// Adicionar timestamp de última atualização
const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

// Conteúdo inicial com cabeçalho
let finalContent = `<!-- 
  RUNES Analytics Pro README
  Gerado automaticamente em: ${timestamp}
  Não edite este arquivo diretamente.
  Edite os blocos individuais em /docs/
-->

`;

// Contador para os blocos processados
let processedBlocks = 0;
let missingBlocks = [];

// Processar cada bloco
blocks.forEach((file) => {
  const filePath = path.join(docsDir, file);
  
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      finalContent += content.trim() + "\n\n";
      processedBlocks++;
    } catch (error) {
      console.error(`❌ Erro ao ler o bloco ${file}: ${error.message}`);
      missingBlocks.push(file);
    }
  } else {
    console.warn(`⚠️ Bloco não encontrado: ${file}`);
    missingBlocks.push(file);
  }
});

// Adicionar rodapé com metadados
finalContent += `\n<!-- 
  Última atualização: ${timestamp}
  Blocos processados: ${processedBlocks}/${blocks.length}
-->`;

// Salvar o arquivo final
const outputPath = path.join(__dirname, "..", output);

try {
  fs.writeFileSync(outputPath, finalContent.trim(), "utf8");
  console.log(`✅ ${output} gerado com sucesso!`);
  console.log(`   📄 Blocos processados: ${processedBlocks}/${blocks.length}`);
  
  if (missingBlocks.length > 0) {
    console.warn(`   ⚠️ Blocos ausentes: ${missingBlocks.join(", ")}`);
  }
  
  // Mostrar tamanho do arquivo
  const stats = fs.statSync(outputPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`   📊 Tamanho do arquivo: ${fileSizeKB} KB`);
  
} catch (error) {
  console.error(`❌ Erro ao salvar ${output}: ${error.message}`);
  process.exit(1);
}

// Verificar se deve gerar ambos os arquivos
if (generateAll && lang === "pt") {
  console.log(`\n🔄 Gerando também a versão em inglês...`);
  // Chamar recursivamente para gerar a versão em inglês
  require("child_process").execSync(`node ${__filename} en`, { stdio: 'inherit' });
} 
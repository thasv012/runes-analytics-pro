import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const vaultPath = __dirname; // Directory where the script is running
const outputFileName = '🔥 Consolidado-Vault.md';
const outputFilePath = path.join(vaultPath, outputFileName);
const dashboardFileName = '📂 Painel Principal.md';

let consolidatedContent = `# 🔥 Consolidado do Vault - ${new Date().toLocaleString('pt-BR')}\n\n`;
let filesProcessed = 0;

function getAllMdFilesRecursive(directory) {
  let mdFiles = [];
  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(directory, item.name);

      // Ignore hidden files/folders and node_modules
      if (item.name.startsWith('.') || item.name === 'node_modules') {
        continue;
      }

      // Skip the output file itself and the dashboard file
      if (item.name === outputFileName || item.name === dashboardFileName) {
        continue;
      }

      if (item.isDirectory()) {
        mdFiles = mdFiles.concat(getAllMdFilesRecursive(fullPath));
      } else if (item.isFile() && item.name.endsWith('.md')) {
        mdFiles.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`❌ Erro ao ler o diretório ${directory}:`, err);
  }
  return mdFiles;
}

console.log(`🚀 Iniciando consolidação de arquivos .md em "${vaultPath}"...`);

const allMdFiles = getAllMdFilesRecursive(vaultPath);

allMdFiles.sort(); // Sort files alphabetically by path for consistency

allMdFiles.forEach(filePath => {
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(vaultPath, filePath);
    const modifiedDate = stats.mtime.toLocaleDateString('pt-BR');

    consolidatedContent += `\n---\n\n## 📄 Arquivo: ${relativePath} (Modificado: ${modifiedDate})\n\n`;
    consolidatedContent += content;
    consolidatedContent += '\n'; // Add a newline after the content
    filesProcessed++;
  } catch (err) {
    console.error(`❌ Erro ao processar o arquivo ${filePath}:`, err);
  }
});

console.log(`
🔍 ${filesProcessed} arquivos .md encontrados e processados.`);

try {
  fs.writeFileSync(outputFilePath, consolidatedContent, 'utf8');
  console.log(`✅ Arquivo consolidado "${outputFilePath}" gerado com sucesso!`);
} catch (err) {
  console.error(`❌ Erro ao escrever o arquivo consolidado ${outputFilePath}:`, err);
} 
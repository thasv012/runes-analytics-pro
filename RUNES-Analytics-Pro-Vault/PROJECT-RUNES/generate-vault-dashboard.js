// generate-vault-dashboard.js
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const vaultPath = __dirname; // Assume the script runs in the vault's root directory
const dashboardFileName = '📂 Painel Principal.md';
const dashboardFilePath = path.join(vaultPath, dashboardFileName);

// Define the folders to scan, matching the structure created
const foldersToScan = [
  '📂 Apresentação & Visão',
  '📂 Desenvolvimento & Código',
  '📂 Análise de Tokens',
  '📂 Prompts & IA',
  '📂 Documentação Técnica',
  '📂 Estratégia & Comunidade'
];

console.log(`🚀 Generating dashboard file in "${vaultPath}"...`);

let dashboardContent = '# 📊 Painel Principal - RUNES Analytics Pro\n\n';

foldersToScan.forEach(folderName => {
  const folderPath = path.join(vaultPath, folderName);
  let filesInSection = [];

  if (fs.existsSync(folderPath)) {
    try {
      const files = fs.readdirSync(folderPath);
      filesInSection = files
        .filter(file => 
          file.endsWith('.md') && 
          file !== '📄 Leia-me.md' && 
          file !== dashboardFileName // Ensure dashboard doesn't link itself if moved
        )
        .map(file => path.basename(file, '.md')); // Get filename without extension
    } catch (err) {
      console.error(`❌ Error reading directory ${folderPath}:`, err);
    }
  }

  // Only add section if there are relevant files
  if (filesInSection.length > 0) {
    dashboardContent += `## ${folderName}\n`;
    filesInSection.forEach(fileNameWithoutExt => {
      dashboardContent += `- [[${fileNameWithoutExt}]]\n`;
    });
    dashboardContent += '\n'; // Add a blank line between sections
  }
});

dashboardContent += '---\n\n';
dashboardContent += '> "What is not documented, will be forgotten." — Owl\n';

try {
  fs.writeFileSync(dashboardFilePath, dashboardContent, 'utf8');
  console.log(`✅ Dashboard file "${dashboardFilePath}" generated successfully!`);
} catch (err) {
  console.error(`❌ Error writing dashboard file ${dashboardFilePath}:`, err);
}
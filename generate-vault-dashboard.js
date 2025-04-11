'use strict';

const fs = require('fs');
const path = require('path');

const vaultPath = path.resolve(__dirname, 'docs/obsidian/RUNES-Analytics-Pro');
const dashboardFileName = '📂 Painel Principal.md';
const dashboardFilePath = path.join(vaultPath, dashboardFileName);

function getDirectoryNameForHeading(dirPath, basePath) {
    const relativePath = path.relative(basePath, dirPath);
    // Use the direct parent folder name for the heading
    // If it's the root vault folder, maybe use a different default?
    return path.basename(relativePath) || 'Raiz'; // Use "Raiz" for files directly in vaultPath
}

function generateDashboardContent(dirPath, basePath) {
    let markdownContent = {}; // Using an object to group files by directory
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    let filesInCurrentDir = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            const subDirContent = generateDashboardContent(fullPath, basePath);
            // Merge results from subdirectory
            for (const key in subDirContent) {
                if (!markdownContent[key]) {
                    markdownContent[key] = [];
                }
                markdownContent[key] = markdownContent[key].concat(subDirContent[key]);
            }
        } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== dashboardFileName) {
            const fileNameWithoutExt = entry.name.replace(/\.md$/, '');
            filesInCurrentDir.push(`- [[${fileNameWithoutExt}]]`);
        }
    }

    if (filesInCurrentDir.length > 0) {
        const heading = getDirectoryNameForHeading(dirPath, basePath);
        if (!markdownContent[heading]) {
            markdownContent[heading] = [];
        }
        markdownContent[heading].push(...filesInCurrentDir.sort());
    }

    return markdownContent;
}

console.log(`Iniciando a geração do painel em: ${vaultPath}`);

if (!fs.existsSync(vaultPath)) {
    console.error(`Erro: O diretório do vault não foi encontrado: ${vaultPath}`);
    process.exit(1);
}

try {
    const organizedContent = generateDashboardContent(vaultPath, vaultPath);
    let finalMarkdown = `# 📂 Painel Principal - RUNES Analytics Pro\n\n`;

    // Ensure consistent order if needed, e.g., alphabetical by heading
    const sortedHeadings = Object.keys(organizedContent).sort();

    for (const heading of sortedHeadings) {
        // Skip empty sections if any somehow occur
        if (organizedContent[heading].length === 0) continue;

        // Format the heading - simple name for now
        finalMarkdown += `## ${heading}\n`;
        finalMarkdown += organizedContent[heading].join('\n');
        finalMarkdown += '\n\n';
    }

    fs.writeFileSync(dashboardFilePath, finalMarkdown.trim() + '\n');
    console.log(`✅ Painel principal gerado com sucesso em: ${dashboardFilePath}`);

} catch (error) {
    console.error('Ocorreu um erro ao gerar o painel:', error);
    process.exit(1);
} 
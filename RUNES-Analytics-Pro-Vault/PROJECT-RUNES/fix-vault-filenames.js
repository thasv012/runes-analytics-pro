// fix-vault-filenames.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Importante: __dirname não está disponível em ES Modules por padrão.
// Se este script PRECISA ser executado a partir do diretório onde ele está,
// use o seguinte para obter um comportamento semelhante:
const __filename = fileURLToPath(import.meta.url);
const currentScriptDir = dirname(__filename);

// --- Configuração ---
// ATENÇÃO: Se vaultPath DEVE ser relativo ao local do SCRIPT, use path.join(currentScriptDir, '../') ou similar.
// Se for um caminho absoluto ou relativo ao CWD (diretório onde o node foi chamado), mantenha como está.
const vaultPath = 'C:\\Users\\Thierry\\Desktop\\runes-limpo\\RUNES-Analytics-Pro-Vault\\PROJECT-RUNES'; // Caminho absoluto parece OK aqui.
const corrections = {
    // Erros de digitação (case-insensitive, global)
    'Currsor': 'Cursor',
    'Mobille': 'Mobile',
    'Autoomatizados': 'Automatizados',
    // Adicione outros erros comuns aqui no formato 'Errado': 'Correto'
};
// --- Fim da Configuração ---

let filesRenamedCount = 0;
let filesScannedCount = 0;

function fixFilename(filename) {
    let newFilename = filename;
    const originalExt = path.extname(newFilename);
    let baseName = path.basename(newFilename, originalExt); // Nome sem extensão

    // 1. Corrigir extensão .mmd para .md
    let currentExt = originalExt.toLowerCase() === '.mmd' ? '.md' : originalExt;

    // 2. Corrigir erros de digitação (no nome base)
    for (const wrong in corrections) {
        // Regex para substituição global e insensível a maiúsculas/minúsculas
        const regex = new RegExp(wrong.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
        baseName = baseName.replace(regex, corrections[wrong]);
    }

    // 3. Remover espaços duplicados (e trim no nome base)
    baseName = baseName.replace(/\s+/g, ' ').trim();

    // 4. Corrigir pontuações duplicadas (ex: .. -> .) no nome base
    // Adicione outros caracteres se necessário dentro dos colchetes: [\.\?!,-]
    baseName = baseName.replace(/([.])\1+/g, '$1');

    // Remonta o nome do arquivo
    newFilename = baseName + currentExt;

    // 5. Garante que não há pontuação duplicada ANTES da extensão final
    // (caso a correção anterior não pegue, ex: NomeBase..md)
    newFilename = newFilename.replace(/\.+(\.md)$/i, '$1');


    // Verifica se o nome realmente mudou (ignorando apenas a extensão mmd->md se foi a única mudança)
    if (filename.toLowerCase().replace(/\.mmd$/,'.md') === newFilename.toLowerCase() && filename !== newFilename) {
       // A única mudança foi MMD->MD, ou case, ou espaços, ou pontuação
       return newFilename;
    } else if (filename !== newFilename) {
        return newFilename;
    }

    return filename; // Retorna original se nada mudou significativamente
}

function processDirectory(directoryPath) {
    try {
        const items = fs.readdirSync(directoryPath, { withFileTypes: true });

        for (const item of items) {
            const currentPath = path.join(directoryPath, item.name);
            try {
                if (item.isDirectory()) {
                    // Ignora a pasta .obsidian
                    if (item.name.toLowerCase() !== '.obsidian') {
                        processDirectory(currentPath);
                    }
                } else if (item.isFile()) {
                    const currentFilename = item.name;
                    const fileExt = path.extname(currentFilename).toLowerCase();

                    // Processa apenas arquivos .md ou .mmd
                    if (fileExt === '.md' || fileExt === '.mmd') {
                        filesScannedCount++;
                        const correctedFilename = fixFilename(currentFilename);

                        if (currentFilename !== correctedFilename) {
                            const newPath = path.join(directoryPath, correctedFilename);

                            // Verifica se um arquivo com o novo nome já existe
                            if (fs.existsSync(newPath)) {
                                if (currentPath.toLowerCase() !== newPath.toLowerCase()) { // Evita erro no Windows por case-change
                                    console.warn(`🟡 Skipped renaming "${currentPath}" to "${newPath}" - Target already exists.`);
                                } else {
                                    // Permite renomear apenas para corrigir o case no Windows
                                    try {
                                         fs.renameSync(currentPath, newPath);
                                         console.log(`✅ Renamed (case): "${currentPath}" -> "${newPath}"`);
                                         filesRenamedCount++;
                                    } catch (renameError) {
                                         console.error(`❌ Error renaming (case) "${currentPath}" to "${newPath}":`, renameError.message);
                                    }
                                }
                                continue; // Pula para o próximo item
                            }

                            // Tenta renomear
                            try {
                                fs.renameSync(currentPath, newPath);
                                console.log(`✅ Renamed: "${currentPath}" -> "${newPath}"`);
                                filesRenamedCount++;
                            } catch (renameError) {
                                console.error(`❌ Error renaming "${currentPath}" to "${newPath}":`, renameError.message);
                            }
                        }
                    }
                }
            } catch (processError) {
                 // Erros de statSync podem acontecer com nomes de arquivo muito longos ou caracteres inválidos
                 if (processError.code === 'ENOENT') {
                     console.warn(`❓ File/Dir not found during processing, might have been renamed or deleted: "${currentPath}"`);
                 } else {
                     console.error(`❓ Error processing item "${currentPath}":`, processError.message);
                 }
            }
        }
    } catch (readDirError) {
        console.error(`❌ Error reading directory "${directoryPath}":`, readDirError.message);
    }
}

// --- Execução ---
console.log(`🚀 Starting filename fix process in "${path.resolve(vaultPath)}"...`);

if (!fs.existsSync(vaultPath)) {
    console.error(`❌ Error: Vault directory not found at "${path.resolve(vaultPath)}". Please check the path.`);
    process.exit(1); // Termina o script se o diretório não existir
}

try {
    processDirectory(vaultPath);
    console.log('\n--------------------');
    console.log('🏁 Process finished.');
    console.log(`🔍 Files scanned (.md/.mmd): ${filesScannedCount}`);
    console.log(`📝 Files renamed: ${filesRenamedCount}`);
    console.log('--------------------');
} catch (error) {
    console.error('\n❌ An unexpected error occurred during the process:', error);
}
// --- Fim da Execução ---
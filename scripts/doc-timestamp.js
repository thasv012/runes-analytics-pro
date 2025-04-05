/**
 * Script para adicionar timestamps automáticos em arquivos de documentação
 * quando forem atualizados, para monitorar as alterações.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Configurações 
const config = {
  // Diretórios a serem monitorados
  directories: ['docs', './'],
  // Extensões de arquivo para processar
  extensions: ['.md'],
  // Arquivos específicos a ignorar
  ignoreFiles: ['node_modules', '.git', 'README.md', 'README.en.md'],
  // Formato do timestamp
  timestampFormat: '📅 Última atualização: {date} às {time}',
  // Regex para encontrar o timestamp existente
  timestampRegex: /📅 Última atualização: .* às .*/,
  // Local onde adicionar o timestamp (início ou fim do arquivo)
  position: 'end' // 'start' ou 'end'
};

/**
 * Gera um timestamp formatado
 */
function generateTimestamp() {
  const now = new Date();
  
  // Formatar data como DD/MM/YYYY
  const date = now.toLocaleDateString('pt-BR');
  
  // Formatar hora como HH:MM
  const time = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return config.timestampFormat
    .replace('{date}', date)
    .replace('{time}', time);
}

/**
 * Verifica se um arquivo deve ser processado
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath);
  
  return (
    config.extensions.includes(ext) &&
    !config.ignoreFiles.some(name => filePath.includes(name))
  );
}

/**
 * Adiciona ou atualiza o timestamp em um arquivo
 */
async function updateTimestamp(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    const timestamp = generateTimestamp();
    let updatedContent;
    
    if (config.timestampRegex.test(content)) {
      // Substituir timestamp existente
      updatedContent = content.replace(config.timestampRegex, timestamp);
      console.log(`${colors.yellow}Timestamp atualizado: ${colors.reset}${filePath}`);
    } else {
      // Adicionar novo timestamp
      if (config.position === 'start') {
        updatedContent = `${timestamp}\n\n${content}`;
      } else {
        // Adicionar uma linha em branco antes do timestamp se necessário
        const needsNewline = !content.endsWith('\n\n');
        updatedContent = `${content}${needsNewline ? '\n\n' : ''}${timestamp}`;
      }
      console.log(`${colors.green}Timestamp adicionado: ${colors.reset}${filePath}`);
    }
    
    await writeFileAsync(filePath, updatedContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`${colors.red}Erro ao processar ${filePath}: ${colors.reset}${error.message}`);
    return false;
  }
}

/**
 * Processa recursivamente um diretório
 */
async function processDirectory(dirPath) {
  try {
    const entries = await readdirAsync(dirPath);
    let processed = 0;
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      
      // Ignorar arquivos na lista de exclusão
      if (config.ignoreFiles.some(name => fullPath.includes(name))) {
        continue;
      }
      
      const stats = await statAsync(fullPath);
      
      if (stats.isDirectory()) {
        // Processar subdiretório recursivamente
        const subProcessed = await processDirectory(fullPath);
        processed += subProcessed;
      } else if (stats.isFile() && shouldProcessFile(fullPath)) {
        // Processar arquivo
        const success = await updateTimestamp(fullPath);
        if (success) processed++;
      }
    }
    
    return processed;
  } catch (error) {
    console.error(`${colors.red}Erro ao processar diretório ${dirPath}: ${colors.reset}${error.message}`);
    return 0;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}=== RUNES Analytics Pro - Atualização de Timestamps ===${colors.reset}\n`);
  
  let totalProcessed = 0;
  
  for (const dir of config.directories) {
    const processed = await processDirectory(dir);
    totalProcessed += processed;
  }
  
  console.log(`\n${colors.bright}${colors.green}Processo concluído! ${totalProcessed} arquivos atualizados.${colors.reset}`);
}

// Executa o script
main().catch(error => {
  console.error(`${colors.red}Erro fatal: ${colors.reset}${error.message}`);
  process.exit(1);
}); 
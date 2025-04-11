import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk'; // Para cores no terminal

// --- Configuração ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Adapte '..' se o script estiver em um subdiretório como /scripts
const vaultBasePath = path.resolve(__dirname); // Assumindo que o script roda na raiz do projeto
const vaultDirName = ''; // Nome da pasta principal do vault. Deixe vazio se for a raiz do projeto.
const vaultFullPath = path.join(vaultBasePath, vaultDirName);

// Definição da estrutura esperada
const expectedStructure = {
  pt: ['bloco1', 'bloco2', 'bloco3', 'bloco4'],
  en: ['bloco1', 'bloco2', 'bloco3', 'bloco4']
};

// --- Fim da Configuração ---

let errorCount = 0;
let warningCount = 0;
let emptyFileCount = 0; // Contador para arquivos vazios

// Helpers para logging colorido
const logError = (message) => { console.log(chalk.red(`❌ ${message}`)); errorCount++; };
const logWarning = (message) => { console.log(chalk.yellow(`⚠️ ${message}`)); warningCount++; };
const logSuccess = (message) => console.log(chalk.green(`✅ ${message}`));
const logInfo = (message) => console.log(chalk.blue(`ℹ️ ${message}`));
const logEmpty = (message) => { console.log(chalk.gray(`⚪ ${message}`)); emptyFileCount++; }; // Log para arquivos vazios

// Regex para encontrar links markdown: [texto](caminho.md)
const markdownLinkRegex = /\[(?:[^\]]+)\]\(([^)]+\.md)\)/g;
// Regex para extrair frontmatter YAML
const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;

// Função principal de validação
async function validateVault() {
  logInfo(`Iniciando validação da estrutura do vault em: ${vaultFullPath}`);
  logInfo('--- Verificação de Pastas ---');

  if (!fs.existsSync(vaultFullPath) || !fs.statSync(vaultFullPath).isDirectory()) {
    logError(`Pasta base do vault não encontrada ou inválida: ${vaultFullPath}`);
    return; // Interrompe se a pasta base não existe
  } else {
    logSuccess(`Pasta base encontrada: ${vaultDirName || '.'}`);
  }

  for (const lang in expectedStructure) {
    const langPath = path.join(vaultFullPath, lang);
    if (!fs.existsSync(langPath) || !fs.statSync(langPath).isDirectory()) {
      logError(`Pasta de idioma ausente: ${path.join(vaultDirName, lang)}`);
      continue; // Pula para o próximo idioma se a pasta base não existe
    } else {
        logSuccess(`Pasta de idioma encontrada: ${path.join(vaultDirName, lang)}`);
    }

    for (const block of expectedStructure[lang]) {
      const blockPath = path.join(langPath, block);
      logInfo(`Verificando: ${path.join(vaultDirName, lang, block)}`);
      if (!fs.existsSync(blockPath) || !fs.statSync(blockPath).isDirectory()) {
        logError(`  Pasta de bloco ausente.`);
      } else {
        logSuccess(`  Pasta de bloco encontrada.`);
        validateDirectoryContents(blockPath);
      }
    }
  }

  logInfo('\n--- Resumo da Validação ---');
  if (errorCount === 0 && warningCount === 0 && emptyFileCount === 0) {
    logSuccess('🎉 Nenhum problema encontrado!');
  } else {
    if (errorCount > 0) console.log(chalk.red(`  Total de Erros: ${errorCount}`));
    if (warningCount > 0) console.log(chalk.yellow(`  Total de Avisos: ${warningCount}`));
    if (emptyFileCount > 0) console.log(chalk.gray(`  Total de Arquivos Vazios/Mínimos: ${emptyFileCount}`));
  }
}

// Função para validar o conteúdo de um diretório (arquivos .md)
function validateDirectoryContents(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    if (mdFiles.length === 0) {
      logError(`  Nenhum arquivo .md encontrado em ${path.basename(dirPath)}.`);
      return;
    }

    logSuccess(`  ${mdFiles.length} arquivo(s) .md encontrados.`);

    for (const mdFile of mdFiles) {
      const filePath = path.join(dirPath, mdFile);
      validateMdFile(filePath);
    }
  } catch (err) {
    logError(`  Erro ao ler o diretório ${path.basename(dirPath)}: ${err.message}`);
  }
}

// Função para validar um arquivo .md individual
function validateMdFile(filePath) {
  const relativePath = path.relative(vaultBasePath, filePath);
  logInfo(`  Validando arquivo: ${relativePath}`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const trimmedContent = content.trim();
    let hasTitle = false;
    let hasSlug = false;
    let hasOrder = false;
    let hasMeaningfulContent = false; // Flag para conteúdo além de título/frontmatter

    // 0. Verificar se está vazio ou quase vazio
    if (trimmedContent === '') {
        logEmpty(`    Arquivo completamente vazio: ${relativePath}`);
        // Não precisa validar mais nada se estiver vazio
        return;
    }

    // 1. Validar Título (primeira linha não vazia deve ser # )
    const lines = content.split('\n');
    let lineIndex = 0;
    for (; lineIndex < lines.length; lineIndex++) {
        const trimmedLine = lines[lineIndex].trim();
        if (trimmedLine) { // Ignora linhas vazias iniciais
            if (trimmedLine.startsWith('# ')) {
                hasTitle = true;
            }
            break;
        }
    }
     if (!hasTitle) {
        logError(`    Arquivo sem título H1 (# ): ${relativePath}`);
    } else {
        logSuccess(`    Título H1 encontrado.`);
    }

    // 2. Validar Frontmatter (slug, order)
    const frontmatterMatch = content.match(frontmatterRegex);
    let frontmatterEndLine = -1;
    if (frontmatterMatch && frontmatterMatch[1]) {
      const frontmatterContent = frontmatterMatch[1];
      // Calcula a linha final do frontmatter (aproximado)
      frontmatterEndLine = content.substring(0, frontmatterMatch[0].length).split('\n').length -1;

      hasSlug = /\nslug:/.test('\n' + frontmatterContent);
      hasOrder = /\norder:/.test('\n' + frontmatterContent);

      if (!hasSlug) logWarning(`    Frontmatter sem 'slug:': ${relativePath}`);
      else logSuccess(`    Frontmatter 'slug:' encontrado.`);

      if (!hasOrder) logWarning(`    Frontmatter sem 'order:': ${relativePath}`);
      else logSuccess(`    Frontmatter 'order:' encontrado.`);

    } else {
      // Só avisa se não for apenas um título
      if (trimmedContent.replace(/^#\s.*\n?/, '').trim() !== '') {
        logWarning(`    Frontmatter (--- ... ---) ausente ou inválido: ${relativePath}`);
      }
    }

    // 3. Verificar conteúdo significativo após título e frontmatter
    for (let i = lineIndex + 1; i < lines.length; i++) {
        // Pula linhas dentro do frontmatter se ele existir
        if (frontmatterEndLine !== -1 && i <= frontmatterEndLine) continue;

        if (lines[i].trim()) {
            hasMeaningfulContent = true;
            break;
        }
    }
    if (!hasMeaningfulContent && hasTitle) { // Só reporta como vazio se tiver título mas nenhum conteúdo depois
        logEmpty(`    Arquivo com conteúdo mínimo (título/frontmatter apenas?): ${relativePath}`);
    }

    // 4. Validar Links Internos
    let match;
    let foundLinks = false;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      foundLinks = true;
      const linkPath = match[1];
      // Ignorar links externos/absolutos
      if (linkPath.startsWith('http:') || linkPath.startsWith('https:') || path.isAbsolute(linkPath)) {
          continue;
      }
      const targetAbsolutePath = path.resolve(path.dirname(filePath), linkPath);

      if (!fs.existsSync(targetAbsolutePath)) {
        logWarning(`    Link quebrado: [${match[0].split('](')[0].substring(1)}](${linkPath}) em ${relativePath}`);
      } else {
         // logSuccess(`    Link válido: ${linkPath}`);
      }
    }
     if (foundLinks) {
         logSuccess(`    Links internos verificados.`);
     } else {
         logInfo(`    Nenhum link interno (.md) encontrado para verificar.`);
     }


  } catch (err) {
    logError(`    Erro ao ler ou processar o arquivo ${relativePath}: ${err.message}`);
  }
}

// Inicia a validação
validateVault(); 
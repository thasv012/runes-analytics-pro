// create-vault-structure.js
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const vaultPath = __dirname; // Assume the script runs in the vault's root directory

// Define the definitive vault structure with specific files
const structure = {
  '📂 Apresentação & Visão': [
    'bloco1-visao-emocional.md',
    'bloco2-tecnologia.md',
    'bloco3-bitcoin-ecossistema.md',
    'bloco4-roadmap.md',
    'bloco5-pitch-bootoshi.md'
  ],
  '📂 Desenvolvimento & Código': [
    'diário-de-desenvolvimento.md',
    'checklist-lançamento.md',
    'comandos-uteis.md'
  ],
  '📂 Análise de Tokens': [
    'tokens-analisados.md',
    'favoritos.md'
  ],
  '📂 Prompts & IA': [
    'prompts-gpt.md',
    'prompts-cursor.md',
    'templates-ai.md'
  ],
  '📂 Documentação Técnica': [
    'arquitetura-modular.md',
    'api-middleware.md',
    'cache-avancado.md'
  ],
  '📂 Estratégia & Comunidade': [
    'filosofia-satoshi.md',
    'elementos-gamificados.md',
    'roteiro-discord.md'
  ],
  // '📂 Dashboard': [] // Dashboard is generated, not created here
};

// Placeholder content for Readme files (if a folder has NO specific files)
// const readmeContent = (folderName) => `# ${folderName.replace('📂 ', '')}\n\nDescreva aqui os conteúdos desta seção.`;

// Placeholder content for specific files if they are created new
const defaultFileContent = (fileName) => `# ${fileName.replace('.md', '')}\n\nTODO: Adicionar conteúdo a este arquivo.`;

console.log(`🚀 Iniciando criação/atualização da estrutura do vault em: ${vaultPath}\n`);

// Ensure each folder and its specified files exist
for (const folderName in structure) {
  const folderPath = path.join(vaultPath, folderName);
  const specificFiles = structure[folderName];

  // Create folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Pasta criada: ${folderName}`);
  } else {
    // Optional: Log if folder already exists
    // console.log(`📁 Pasta já existe: ${folderName}`);
  }

  // Create specific files within the folder
  if (specificFiles && specificFiles.length > 0) {
    specificFiles.forEach(fileName => {
      const filePath = path.join(folderPath, fileName);
      if (!fs.existsSync(filePath)) {
        // Use default placeholder content for new files
        fs.writeFileSync(filePath, defaultFileContent(fileName), 'utf8');
        console.log(`  📄 Arquivo criado: ${fileName} em ${folderName}`);
      }
    });
  } else {
      // Optional: If a folder in the structure has NO specific files listed,
      // you could uncomment the code below and the readmeContent function
      // to create a default Readme.md in that specific case.
      /*
      const readmePath = path.join(folderPath, '📄 Leia-me.md');
      if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, readmeContent(folderName), 'utf8');
        console.log(`  📄 Leia-me.md criado em ${folderName} (pasta sem arquivos específicos)`);
      }
      */
  }
}

console.log('\n✅ Estrutura do vault verificada/atualizada com sucesso!');
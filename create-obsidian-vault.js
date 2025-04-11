// create-obsidian-vault.js
// CURSOR: Script para criar e popular um Vault Obsidian para o projeto RUNES Analytics Pro

const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "docs", "obsidian", "RUNES-Analytics-Pro");

// Estrutura do Vault
const folders = {
  "Prompts": [
    "animação-gamificação.md",
    "integração-cursor-gpu-mesh.md",
    "compressao-avancada-cache.md",
    "README-Generator.md"
  ],
  "Roadmap & Releases": [
    "✅ Etapas Concluídas.md",
    "📆 Planejamento Sprint.md",
    "🌐 Visão Web3 & AI.md"
  ],
  "Docs Técnicas": [
    "🧠 Arquitetura Modular.md",
    "🧰 Sistema de Cache.md",
    "🔧 Middleware de API.md",
    "🎮 Sistema de Gamificação.md"
  ],
  "Design & UX": [
    "🎨 Estilo Visual Cyberpunk.md",
    "📱 Responsividade Mobile.md",
    "🧩 Componentes UI.md"
  ],
  "Estratégia & Apresentação": [
    "🗣️ Pitch para King Bootoshi.md",
    "📊 Apresentação em Slides.md",
    "💬 Mensagens Discord.md"
  ],
  "Snippets e Comandos": [
    "🧪 Testes de Componentes.md",
    "🧵 Comandos Cursor.md",
    "🔁 Scripts Automatizados.md"
  ]
};

// Função utilitária pra criar pastas e arquivos
const createVaultStructure = () => {
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

  Object.entries(folders).forEach(([folder, files]) => {
    const folderPath = path.join(base, folder);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, `# ${file.replace(".md", "")}\n\n> Conteúdo inicial para ${file}`, "utf8");
        console.log(`✔️ Criado: ${filePath}`);
      } else {
        console.log(`↪️ Já existe: ${filePath}`);
      }
    });
  });

  console.log("\n✅ Vault Obsidian criado com sucesso em:\n", base);
};

createVaultStructure();

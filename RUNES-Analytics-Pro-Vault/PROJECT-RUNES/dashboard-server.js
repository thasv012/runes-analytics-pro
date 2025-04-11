import express from 'express';
import { exec } from 'child_process';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000; // Porta para o dashboard web

// Mapeamento de ações para scripts (similar ao start-dev)
const scriptMap = {
  'init': 'create-vault-structure.js',
  'fix': 'fix-vault-filenames.js',
  'generate': 'generate-vault-dashboard.js',
  'build': 'generate-all-md.js',
  'validate': 'validate-vault-structure.js',
};

// Middleware para servir arquivos estáticos (HTML, CSS, JS do dashboard)
app.use(express.static(path.join(__dirname, 'public'))); // Servirá de uma pasta 'public'

// Endpoint para obter o status (pode ser expandido depois)
app.get('/status', (req, res) => {
  // Exemplo: verificar se o arquivo de painel existe
  const dashboardPath = path.join(__dirname, '📂 Painel Principal.md');
  const status = {
    dashboardExists: fs.existsSync(dashboardPath),
    lastUpdated: new Date().toISOString()
    // Adicionar mais status aqui (ex: resultado da última validação)
  };
  res.json(status);
});

// Endpoint para executar scripts
app.post('/run/:scriptName', (req, res) => {
  const scriptName = req.params.scriptName;
  const scriptFileName = scriptMap[scriptName];

  if (!scriptFileName) {
    return res.status(400).json({ error: `Script inválido: ${scriptName}` });
  }

  const scriptPath = path.join(__dirname, scriptFileName);
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: `Arquivo de script não encontrado: ${scriptFileName}` });
  }

  console.log(`[WEB] Executando script: ${scriptFileName}...`);

  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[WEB] Erro ao executar ${scriptFileName}: ${error.message}`);
      console.error(`[WEB] Stderr: ${stderr}`);
      return res.status(500).json({
        error: `Erro ao executar o script: ${error.message}`,
        stdout: stdout,
        stderr: stderr
      });
    }
    console.log(`[WEB] Script ${scriptFileName} concluído.`);
    console.log(`[WEB] Stdout: ${stdout}`);
    if (stderr) console.warn(`[WEB] Stderr: ${stderr}`);

    res.json({
      message: `Script ${scriptFileName} executado com sucesso.`,
      stdout: stdout,
      stderr: stderr
    });
  });
});

// Servir o HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(port, () => {
  console.log(`🚀 Dashboard web rodando em http://localhost:${port}`);
}); 
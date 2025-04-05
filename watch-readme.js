const { exec } = require('child_process');
const fs = require('fs');

const arquivosMonitorados = ['bloco1.md', 'bloco2.md', 'bloco3.md', 'bloco4.md'];

console.log("👁️  Monitorando alterações nos blocos...");

arquivosMonitorados.forEach((arquivo) => {
  fs.watchFile(arquivo, { interval: 1000 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log(`📦 Alteração detectada em ${arquivo}. Atualizando README.md...`);
      exec('powershell.exe -ExecutionPolicy Bypass -File atualizar-readme.ps1', (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Erro ao executar o script: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`⚠️ STDERR: ${stderr}`);
          return;
        }
        console.log(`✅ README.md atualizado com sucesso!\n`);
      });
    }
  });
});

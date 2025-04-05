# Caminho para o projeto
cd "C:\Users\Thierry\Desktop\runes-limpo"

Write-Host "🚀 Iniciando ambiente de desenvolvimento RUNES Analytics Pro..."

# 1. Inicia o Cursor (ajustar caminho se necessário)
Write-Host "🧠 Abrindo Cursor com o projeto..."
Start-Process "cursor.exe" -ArgumentList "." -WorkingDirectory "C:\Users\Thierry\Desktop\runes-limpo"

Start-Sleep -Seconds 2

# 2. Inicia watcher de README.md
Write-Host "📘 Iniciando watcher do README.md..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "./atualizar-readme.ps1"

Start-Sleep -Seconds 1

# 3. Roda o live-server na porta correta
Write-Host "🌐 Rodando live-server na porta 8090..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "live-server --port=8090 --open=index.html --no-browser"

# 4. Força abrir no navegador na porta 8090, mesmo que o live-server não abra
Start-Sleep -Seconds 3
Start-Process "http://localhost:8090"

Write-Host "`n✨ Ambiente pronto, mestre. Que os gráficos mostrem o caminho dos Runes! ✨"

# Script para iniciar o watcher de documentação do RUNES Analytics Pro
Write-Host "🔍 Iniciando monitoramento da documentação..." -ForegroundColor Cyan

# Verificar se Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js para continuar." -ForegroundColor Red
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Exibir instruções
Write-Host ""
Write-Host "🔄 RUNES Analytics Pro - Modo de Monitoramento" -ForegroundColor Green
Write-Host "   Este script monitorará as alterações nos arquivos .md e regenerará"
Write-Host "   automaticamente a documentação quando houver mudanças."
Write-Host ""
Write-Host "   Para interromper o monitoramento, pressione Ctrl+C"
Write-Host ""

# Executar o watcher
npm run watch:docs

# Este script nunca chegará aqui se o watcher estiver rodando
Write-Host "🛑 Monitoramento encerrado." -ForegroundColor Red 
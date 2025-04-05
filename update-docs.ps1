# Script para atualizar toda a documentação do RUNES Analytics Pro
Write-Host "📚 Iniciando atualização completa da documentação..." -ForegroundColor Cyan

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
Write-Host "🔄 RUNES Analytics Pro - Atualização de Documentação" -ForegroundColor Green
Write-Host "   Este script atualizará toda a documentação do projeto, incluindo:"
Write-Host "   - Adicionar/atualizar timestamps em todos os arquivos"
Write-Host "   - Verificar o status das traduções"
Write-Host "   - Gerar README em português e inglês com cabeçalho multilíngue"
Write-Host ""

# Executar o script de atualização completa
npm run update:all:docs

# Este script nunca chegará aqui se o watcher estiver rodando
Write-Host "🛑 Processo de atualização encerrado." -ForegroundColor Red 
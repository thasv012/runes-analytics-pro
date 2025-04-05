# Script para enviar atualizações de documentação para o GitHub
Write-Host "📤 Preparando push para GitHub..." -ForegroundColor Cyan

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

# Verificar se Git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git não encontrado. Por favor, instale o Git para continuar." -ForegroundColor Red
    exit 1
}

# Exibir instruções
Write-Host ""
Write-Host "🔄 RUNES Analytics Pro - Push para GitHub" -ForegroundColor Green
Write-Host "   Este script atualizará a documentação e enviará para o GitHub."
Write-Host ""

# Verificar se há argumentos para mensagem de commit personalizada
$commitMessage = "docs: atualiza documentação multilíngue"
if ($args.Count -gt 0) {
    $commitMessage = $args -join " "
    Write-Host "📝 Mensagem de commit personalizada: $commitMessage" -ForegroundColor Yellow
    Write-Host ""
    
    # Executar o script com a mensagem personalizada
    node scripts/github-push.js $commitMessage
} else {
    # Executar o script com a mensagem padrão
    npm run git:push
}

# Este script nunca chegará aqui se o processo for interrompido
Write-Host "🛑 Processo de push encerrado." -ForegroundColor Red 
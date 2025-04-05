# RUNES Analytics Pro - Script de inicialização (PowerShell)
Write-Host "🚀 Iniciando RUNES Analytics Pro..." -ForegroundColor Cyan

# Verificar se Node.js está instalado
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js para continuar." -ForegroundColor Red
    exit 1
}

# Atualizar README
Write-Host "📝 Atualizando documentação..." -ForegroundColor Yellow
npm run update:readme

# Verificar traduções
Write-Host "🔍 Verificando traduções..." -ForegroundColor Yellow
npm run check:translations

# Iniciar servidor em um job separado
Write-Host "🌐 Iniciando servidor..." -ForegroundColor Magenta
$serverJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm start 
}

# Iniciar servidor de desenvolvimento em um job separado
Write-Host "🔧 Iniciando servidor de desenvolvimento..." -ForegroundColor Magenta
$liveServerJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npx live-server --port=8090
}

Write-Host "`n✅ RUNES Analytics Pro está rodando!" -ForegroundColor Green
Write-Host "📊 Acesse o dashboard em: http://localhost:8090" -ForegroundColor Cyan
Write-Host "⚙️ API disponível em: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "`nPressione CTRL+C para encerrar todos os serviços..." -ForegroundColor Yellow

# Aguardar interrupção do usuário
try {
    Wait-Job $serverJob, $liveServerJob -Timeout 3600 | Out-Null
} catch {
    # Nada a fazer aqui, apenas capturar a interrupção
} finally {
    # Limpar jobs ao encerrar
    Stop-Job $serverJob, $liveServerJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob, $liveServerJob -Force -ErrorAction SilentlyContinue
    Write-Host "`n🛑 Serviços encerrados." -ForegroundColor Yellow
} 
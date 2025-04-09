# Script para iniciar o ambiente de desenvolvimento RUNES com Cursor

$cursorPath = "C:\Users\Thierry\AppData\Local\Programs\Cursor\Cursor.exe"
$projectPath = "C:\Users\Thierry\Desktop\runes-limpo"
$serverPort = 3000

# Exibir cabeçalho
Write-Host "`n`n=======================================================" -ForegroundColor Cyan
Write-Host "      🚀 AMBIENTE DE DESENVOLVIMENTO RUNES PRO" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "✅ Iniciando ambiente integrado com Cursor e Live Server"
Write-Host "✅ Projeto: $projectPath"
Write-Host "✅ Servidor: http://localhost:$serverPort"
Write-Host "=======================================================`n" -ForegroundColor Cyan

# Verificar se o Cursor está instalado
if (-Not (Test-Path $cursorPath)) {
    Write-Host "⚠️ O Cursor não foi encontrado no caminho padrão." -ForegroundColor Yellow
    $cursorPath = Read-Host "Digite o caminho completo para o executável do Cursor (pressione Enter para cancelar)"
    
    if (-Not $cursorPath) {
        Write-Host "❌ Operação cancelada. O Cursor é necessário para este ambiente." -ForegroundColor Red
        exit 1
    }
}

# Verificar se o diretório do projeto existe
if (-Not (Test-Path $projectPath)) {
    Write-Host "⚠️ O diretório do projeto não foi encontrado." -ForegroundColor Yellow
    $projectPath = Read-Host "Digite o caminho completo do projeto RUNES (pressione Enter para cancelar)"
    
    if (-Not $projectPath -or -Not (Test-Path $projectPath)) {
        Write-Host "❌ Diretório inválido ou operação cancelada." -ForegroundColor Red
        exit 1
    }
}

# Mudar para o diretório do projeto
Set-Location $projectPath

# Verificar se o arquivo de configuração do Cursor existe
if (-Not (Test-Path ".cursor-config.json")) {
    Write-Host "⚠️ O arquivo .cursor-config.json não foi encontrado." -ForegroundColor Yellow
    Write-Host "  Os atalhos e comandos personalizados não estarão disponíveis." -ForegroundColor Yellow
}

# Verificar se o arquivo do agente existe
if (-Not (Test-Path "agente-local.js")) {
    Write-Host "⚠️ O arquivo agente-local.js não foi encontrado." -ForegroundColor Yellow
    Write-Host "  O agente IA local não estará disponível." -ForegroundColor Yellow
}

# Verificar dependências
$hasNodeModules = Test-Path "node_modules"
if (-Not $hasNodeModules) {
    Write-Host "`n🔄 Instalando dependências..." -ForegroundColor Blue
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Houve um problema ao instalar as dependências." -ForegroundColor Yellow
        Write-Host "  O ambiente pode não funcionar corretamente." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
    }
}

# Iniciar o live-server em segundo plano
Write-Host "`n🔄 Iniciando o servidor de desenvolvimento..." -ForegroundColor Blue
Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "live-server", "--port=$serverPort"

# Verificar se o servidor está rodando
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$serverPort" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Servidor iniciado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ O servidor foi iniciado, mas retornou status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Não foi possível conectar ao servidor. Verifique se a porta $serverPort está disponível." -ForegroundColor Yellow
    Write-Host "  Erro: $_" -ForegroundColor Red
}

# Iniciar o Cursor
Write-Host "`n🔄 Abrindo o Cursor com o projeto RUNES..." -ForegroundColor Blue
Start-Process -FilePath $cursorPath -ArgumentList $projectPath

# Exibir instruções finais
Write-Host "`n`n✅ Ambiente iniciado!" -ForegroundColor Green
Write-Host "`nRecursos disponíveis:" -ForegroundColor Cyan
Write-Host "📊 Layout de Produtividade: http://localhost:$serverPort/cursor-productivity-layout.html"
Write-Host "🌐 Demo GPU Mesh: http://localhost:$serverPort/gpu-mesh-demo.html"
Write-Host "📑 Documentação completa: http://localhost:$serverPort/USANDO-CURSOR-PRO.md"
Write-Host "`nPara usar o agente IA:" -ForegroundColor Cyan
Write-Host "1. Abra o console do navegador (F12)"
Write-Host "2. Digite: agente('/gpu status')"
Write-Host "`nAproveitando o ambiente:" -ForegroundColor Cyan
Write-Host "- Use Ctrl+Shift+A para adicionar 5 nós GPU"
Write-Host "- Use Ctrl+Shift+R para analisar código Runes"
Write-Host "- Use Ctrl+Alt+E para explicar código selecionado"
Write-Host "`n`n=======================================================" -ForegroundColor Cyan 
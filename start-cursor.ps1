# PowerShell script para iniciar o Cursor com configurações otimizadas
$env:USE_GPU = 1
$env:CURSOR_AI_MODE = "turbo"

# Caminho para o executável do Cursor (ajuste conforme necessário)
$cursorPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Cursor\Cursor.exe"

# Verifica se o Cursor está instalado no caminho padrão
if (-not (Test-Path $cursorPath)) {
    Write-Host "⚠️ Cursor não encontrado no caminho padrão. Tentando iniciar diretamente pelo comando 'cursor'..."
    cursor --enable-gpu --fast-llm --project "./runes-analytics-pro"
} else {
    Write-Host "🚀 Iniciando Cursor com GPU e modo turbo..."
    & $cursorPath --enable-gpu --fast-llm --project "./runes-analytics-pro"
}

Write-Host "✅ Comando executado. Verifique se o Cursor foi iniciado corretamente." 
$env:USE_GPU = "1"
$env:CURSOR_AI_MODE = "turbo"
$projectPath = "$PSScriptRoot\runes-analytics-pro"
$cursorPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\cursor\Cursor.exe"

if (Test-Path $cursorPath) {
    Start-Process $cursorPath -ArgumentList "--enable-gpu", "--fast-llm", "--project", $projectPath
    Write-Host "🚀 Cursor iniciado no Modo Turbo com GPU e AI no projeto RUNES Analytics Pro"
} else {
    Write-Host "❌ Cursor não encontrado em $cursorPath"
}

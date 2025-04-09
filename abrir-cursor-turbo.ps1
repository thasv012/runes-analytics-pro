# Ativa uso de GPU (caso esteja disponível)
$env:CURSOR_ACCELERATE = "1"

# Usa IA local (se você configurou isso previamente com Ollama ou similar)
$env:CURSOR_LOCAL_AI = "1"

# Ativa modo Pro se aplicável
$env:CURSOR_PRO_MODE = "1"

# (Opcional) Força IA no Edge runtime
$env:CURSOR_USE_EDGE_RUNTIME = "1"

# Abre o Cursor
Start-Process "$env:LOCALAPPDATA\Programs\Cursor\Cursor.exe"

# (Opcional) Loga a execução
Write-Host "Cursor iniciado com GPU + IA local em modo turbo!" -ForegroundColor Green

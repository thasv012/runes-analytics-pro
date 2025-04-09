Write-Host "🚀 Ativando Modo TURBO do Cursor..."

$cursorConfig = "$env:USERPROFILE\.cursorrc"
$backup = "$env:USERPROFILE\.cursorrc.backup"

# Cria o arquivo se ele não existir
if (-Not (Test-Path $cursorConfig)) {
    Write-Host "⚠️ Arquivo .cursorrc não encontrado. Criando um novo..."
    New-Item -Path $cursorConfig -ItemType File -Force | Out-Null
}

# Faz backup apenas se ainda não tiver sido feito
if (-Not (Test-Path $backup)) {
    Write-Host "💾 Criando backup original em .cursorrc.backup..."
    Copy-Item $cursorConfig $backup -Force
} else {
    Write-Host "🔄 Backup já existe. Pulando..."
}

# Ativa modo turbo
@"
[agent]
delete_file_protection = false
dotfiles_protection = false
mcp_tools_protection = false
"@ | Set-Content -Path $cursorConfig -Encoding UTF8

Write-Host "✅ Modo TURBO ativado com sucesso!"

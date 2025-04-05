# Script para criar um novo RUNECARD em JSON
# Criado para o RUNES Analytics Pro

param (
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$true)]
    [string]$Ticker,
    
    [Parameter(Mandatory=$true)]
    [string]$Inspiration
)

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$outputFile = "./cards/runecard-$Ticker-$timestamp.json"

Write-Host "🚀 Gerando novo RUNECARD..." -ForegroundColor Cyan
Write-Host "   Título: $Title" -ForegroundColor Yellow
Write-Host "   Ticker: $Ticker" -ForegroundColor Yellow
Write-Host "   Inspiração: $Inspiration" -ForegroundColor Yellow

# Verificar se o diretório de cards existe
if (-not (Test-Path -Path "./cards")) {
    Write-Host "📁 Criando diretório de cards..." -ForegroundColor Blue
    New-Item -ItemType Directory -Path "./cards" | Out-Null
}

# Executar a consulta no Cursor
$cursorCommand = "cursor run ""Create a new RUNECARD in JSON using the template, with title: '$Title', ticker: '$Ticker', and lore inspired by '$Inspiration'"""

try {
    Write-Host "🧠 Solicitando RUNECARD ao Cursor..." -ForegroundColor Magenta
    $jsonContent = Invoke-Expression $cursorCommand
    
    # Verificar se obtivemos um JSON válido
    try {
        $jsonObject = $jsonContent | ConvertFrom-Json
        
        # Adicionar metadados adicionais
        $jsonObject | Add-Member -NotePropertyName "created_at" -NotePropertyValue (Get-Date -Format "yyyy-MM-dd'T'HH:mm:ss")
        $jsonObject | Add-Member -NotePropertyName "creator" -NotePropertyValue "RUNES Analytics Pro"
        $jsonObject | Add-Member -NotePropertyName "version" -NotePropertyValue "1.0.0"
        
        # Converter de volta para JSON com formatação bonita
        $formattedJson = $jsonObject | ConvertTo-Json -Depth 10
        
        # Salvar o arquivo
        $formattedJson | Out-File -FilePath $outputFile -Encoding UTF8
        
        Write-Host "✅ RUNECARD criado com sucesso!" -ForegroundColor Green
        Write-Host "📄 Salvo em: $outputFile" -ForegroundColor Green
        
        # Exibir prévia do card
        Write-Host "`n📝 Prévia do RUNECARD:" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor DarkGray
        Write-Host "Título: $($jsonObject.title)" -ForegroundColor White
        Write-Host "Ticker: $($jsonObject.ticker)" -ForegroundColor White
        Write-Host "Raridade: $($jsonObject.rarity)" -ForegroundColor White
        Write-Host "Lore: $($jsonObject.lore | Select-Object -First 50)..." -ForegroundColor White
        Write-Host "=========================================" -ForegroundColor DarkGray
        
        # Perguntar se deseja visualizar no navegador
        $viewInBrowser = Read-Host "Deseja visualizar o card no navegador? (S/N)"
        if ($viewInBrowser -eq "S" -or $viewInBrowser -eq "s") {
            # Verificar se o arquivo editor-lab.html existe
            if (Test-Path -Path "./editor-lab.html") {
                Start-Process "http://localhost:50592/editor-lab.html?card=$outputFile"
            } else {
                Start-Process $outputFile
            }
        }
        
    } catch {
        Write-Host "❌ Erro ao processar o JSON retornado pelo Cursor." -ForegroundColor Red
        Write-Host $_ -ForegroundColor Red
        Write-Host "Conteúdo bruto recebido:" -ForegroundColor Yellow
        Write-Host $jsonContent -ForegroundColor Gray
        exit 1
    }
    
} catch {
    Write-Host "❌ Erro ao executar o comando no Cursor." -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
    exit 1
} 
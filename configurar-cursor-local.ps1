# Caminho para a pasta do projeto (ajuste se necessário)
$projetoPath = Get-Location
$cursorPath = Join-Path $projetoPath ".cursor"
$arquivoPath = Join-Path $cursorPath "cursor-settings.json"

# Cria a pasta .cursor se não existir
if (!(Test-Path $cursorPath)) {
    New-Item -ItemType Directory -Path $cursorPath | Out-Null
}

# Conteúdo JSON do cursor-settings
$json = @'
{
  "models": {
    "local": {
      "llama-local": {
        "name": "Llama Local",
        "provider": "custom",
        "apiBaseUrl": "http://localhost:1234/v1",
        "chatCompletionEndpoint": "/chat/completions",
        "completionEndpoint": "/completions",
        "apiKey": "",
        "headers": {},
        "modelType": "chat"
      }
    }
  },
  "modelGroups": [
    {
      "title": "Locais",
      "models": ["llama-local"]
    }
  ],
  "preferredModel": "llama-local"
}
'@

# Salva o JSON no arquivo
$json | Out-File -Encoding UTF8 -FilePath $arquivoPath -Force

Write-Host "✅ Configuração do Llama Local adicionada com sucesso ao Cursor!" -ForegroundColor Green
Write-Host "📁 Arquivo salvo em: $arquivoPath"
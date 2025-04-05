Get-ChildItem -Path . -Filter "bloco*.md" | Sort-Object Name | ForEach-Object { Get-Content $_.FullName } | Set-Content README.md
Write-Host "✅ README.md atualizado com sucesso!"

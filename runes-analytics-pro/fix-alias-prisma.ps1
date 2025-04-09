# fix-alias-prisma.ps1 - Script PowerShell para limpar, regenerar e reiniciar

Write-Host "🛑 Parando servidor Next.js..." -ForegroundColor Yellow
Write-Host "   -> IMPORTANTE: Certifique-se de que o servidor (npm run dev) foi parado manualmente (Ctrl+C) antes de continuar." -ForegroundColor Yellow
# Pausa para garantir que o usuário veja a mensagem e pare o servidor
Read-Host -Prompt "Pressione Enter para continuar após parar o servidor..."

Write-Host "🧹 Limpando node_modules, .next e yarn.lock..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ./node_modules -ErrorAction SilentlyContinue
if ($?) { Write-Host "   -> node_modules removido." } else { Write-Host "   -> node_modules não encontrado ou erro ao remover." -ForegroundColor Yellow }

Remove-Item -Recurse -Force ./.next -ErrorAction SilentlyContinue
if ($?) { Write-Host "   -> .next removido." } else { Write-Host "   -> .next não encontrado ou erro ao remover." -ForegroundColor Yellow }

Remove-Item -Force ./yarn.lock -ErrorAction SilentlyContinue
if ($?) { Write-Host "   -> yarn.lock removido." } else { Write-Host "   -> yarn.lock não encontrado ou erro ao remover." -ForegroundColor Yellow }

# Remove package-lock.json também, por segurança
Remove-Item -Force ./package-lock.json -ErrorAction SilentlyContinue

Write-Host "🔁 Regenerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "   -> ERRO ao regenerar Prisma Client. Verifique as mensagens acima." -ForegroundColor Red
    exit $LASTEXITCODE
} else {
    Write-Host "   -> Prisma Client gerado com sucesso."
}

Write-Host "📦 Reinstalando dependências com Yarn..." -ForegroundColor Cyan
yarn install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   -> ERRO ao instalar dependências com Yarn. Verifique as mensagens acima." -ForegroundColor Red
    exit $LASTEXITCODE
} else {
    Write-Host "   -> Dependências instaladas com sucesso."
}


Write-Host "🚀 Iniciando servidor de desenvolvimento (npm run dev)..." -ForegroundColor Green
# O comando abaixo iniciará o servidor, mas o script terminará.
# O servidor continuará rodando no terminal.
npm run dev

Write-Host "✅ Script concluído. O servidor de desenvolvimento foi iniciado." -ForegroundColor Green
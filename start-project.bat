@echo off
REM RUNES Analytics Pro - Script de inicialização (Windows)
echo 🚀 Iniciando RUNES Analytics Pro...

REM Atualizar README
echo 📝 Atualizando documentação...
call npm run update:readme

REM Verificar traduções
echo 🔍 Verificando traduções...
call npm run check:translations

REM Iniciar servidor em segundo plano
echo 🌐 Iniciando servidor...
start /B npm start

REM Iniciar servidor de desenvolvimento
echo 🔧 Iniciando servidor de desenvolvimento...
start /B npx live-server --port=8090

echo ✅ RUNES Analytics Pro está rodando!
echo 📊 Acesse o dashboard em: http://localhost:8090
echo ⚙️ API disponível em: http://localhost:3000/api
echo.
echo Pressione qualquer tecla para encerrar todos os serviços...
pause > nul

REM Encerrar processos ao fechar
taskkill /F /IM node.exe > nul 2>&1 
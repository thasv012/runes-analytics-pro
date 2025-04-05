@echo off
title RUNES Analytics Pro - Modo TURBO

echo ======================================================================
echo 🌐 Iniciando RUNES Analytics Pro em modo TURBO...
echo 🚀 Ativando IA com suporte a GPU (local e remota)...
echo ======================================================================
echo.

:: Verifica se npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js/npm não encontrado! Por favor instale Node.js e tente novamente.
    pause
    exit /b 1
)

:: Verifica se já existe um arquivo package.json
if not exist package.json (
    echo 📦 Inicializando projeto Node.js...
    npm init -y >nul 2>&1
)

:: Verifica se as dependências estão instaladas
if not exist node_modules\express (
    echo 📦 Instalando dependências necessárias...
    npm install express cors ws axios uuid >nul 2>&1
)

:: Detecta a GPU disponível (Windows)
echo 🔄 Detectando hardware GPU...
for /f "tokens=*" %%a in ('wmic path win32_VideoController get name ^| findstr /i "NVIDIA AMD Radeon"') do (
    set GPU_MODEL=%%a
    goto :gpu_found
)
:gpu_found

if "%GPU_MODEL%"=="" (
    set GPU_MODEL=GPU não detectada
    echo ⚠️ Não foi possível detectar uma GPU compatível no sistema
) else (
    echo ✅ GPU detectada: %GPU_MODEL%
)

:: Cria variável de ambiente para o GPU model
set GPU_MODEL=%GPU_MODEL%

:: Cria diretório de logs se não existir
if not exist logs mkdir logs

:: Inicia o servidor de agente GPU
echo 🔄 Iniciando servidor de agente GPU...
start /B cmd /c "node gpu-agent.js > logs\gpu-agent.log 2>&1"
timeout /t 1 >nul
echo ✅ Agente GPU iniciado

:: Inicia a rede Mesh P2P
echo 🔄 Iniciando rede Mesh P2P...
start /B cmd /c "node gpu-mesh.js > logs\gpu-mesh.log 2>&1"
timeout /t 1 >nul
echo ✅ Rede Mesh iniciada

:: Verifica se live-server está instalado
call npm list -g live-server >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Instalando servidor HTTP...
    call npm install -g live-server >nul 2>&1
)

:: Inicia o servidor web
echo 🔄 Iniciando servidor web para frontend...
start /B cmd /c "live-server --port=8090 --no-browser > logs\web-server.log 2>&1"
timeout /t 2 >nul
echo ✅ Servidor web iniciado

:: Cria o script de encerramento
echo @echo off > stop-runes-turbo.bat
echo echo Encerrando RUNES Analytics Pro... >> stop-runes-turbo.bat
echo for /f "tokens=2" %%%%a in ('tasklist ^| findstr "node.exe"') do taskkill /F /PID %%%%a >> stop-runes-turbo.bat
echo echo ✅ Todos os processos encerrados >> stop-runes-turbo.bat
echo pause >> stop-runes-turbo.bat

echo.
echo ======================================================================
echo 🧠 CypherAI e RUNES Analytics estão rodando com GPU colaborativa!
echo.
echo 📊 Acessos:
echo   • Painel de controle: http://localhost:8090/index.html
echo   • API Demo: http://localhost:8090/api-demo.html
echo   • Status do agente GPU: http://localhost:8081/status
echo.
echo 🛑 Para encerrar todos os serviços, execute: stop-runes-turbo.bat
echo ======================================================================

:: Abre a página principal no navegador padrão
timeout /t 3 >nul
start http://localhost:8090/index.html 
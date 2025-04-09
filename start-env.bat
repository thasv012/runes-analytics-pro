@echo off
:: RUNES Analytics Turbo - Script de Inicialização (CMD)
:: Este script configura e inicia o ambiente de desenvolvimento integrado no Windows

echo [94m🚀 Iniciando RUNES Analytics Turbo...[0m

:: Diretório atual
set projectDir=%~dp0
cd /d %projectDir%

:: Criar diretórios necessários (se não existirem)
echo [93m📁 Criando diretórios necessários...[0m
if not exist "js" mkdir js
if not exist "js\banners" mkdir js\banners
if not exist "js\components" mkdir js\components
if not exist "css" mkdir css
if not exist "css\components" mkdir css\components
if not exist "components" mkdir components
if not exist "assets" mkdir assets
if not exist "assets\banners" mkdir assets\banners
if not exist "assets\social" mkdir assets\social

:: Verificar dependências
echo [94m🔍 Verificando dependências...[0m

:: Verificar Node.js
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo [91m❌ Node.js não encontrado. Por favor, instale o Node.js para continuar.[0m
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set nodeVersion=%%i
echo [92m✅ Node.js encontrado: %nodeVersion%[0m

:: Verificar npm
npm -v > nul 2>&1
if %errorlevel% neq 0 (
    echo [91m❌ npm não encontrado. Por favor, instale o npm para continuar.[0m
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set npmVersion=%%i
echo [92m✅ npm encontrado: %npmVersion%[0m

:: Instalar dependências se package.json existir
if exist package.json (
    echo [94m📦 Instalando dependências do projeto...[0m
    call npm install
    
    if %errorlevel% neq 0 (
        echo [91m❌ Falha ao instalar dependências. Verifique os erros acima.[0m
        pause
        exit /b 1
    )
    
    echo [92m✅ Dependências instaladas com sucesso![0m
) else (
    :: Criar package.json básico se não existir
    echo [93m📄 Criando package.json...[0m
    
    echo {> package.json
    echo   "name": "runes-analytics-pro",>> package.json
    echo   "version": "1.0.0",>> package.json
    echo   "description": "Plataforma de análise para tokens Runes no Bitcoin",>> package.json
    echo   "main": "index.js",>> package.json
    echo   "scripts": {>> package.json
    echo     "dev": "live-server --port=3000",>> package.json
    echo     "gen:readme": "node scripts/generate-readme.js",>> package.json
    echo     "banner:build": "node run-agent.js exec \"generate-banner style=cyberpunk text='RUNES Analytics'\"",>> package.json
    echo     "setup": "node run-agent.js setup",>> package.json
    echo     "start": "start start-env.bat">> package.json
    echo   },>> package.json
    echo   "keywords": [>> package.json
    echo     "runes",>> package.json
    echo     "bitcoin",>> package.json
    echo     "analytics",>> package.json
    echo     "dashboard">> package.json
    echo   ],>> package.json
    echo   "author": "",>> package.json
    echo   "license": "MIT",>> package.json
    echo   "dependencies": {>> package.json
    echo     "commander": "^9.4.1",>> package.json
    echo     "live-server": "^1.2.2">> package.json
    echo   }>> package.json
    echo }>> package.json
    
    echo [94m📦 Instalando dependências básicas...[0m
    call npm install
    
    if %errorlevel% neq 0 (
        echo [91m❌ Falha ao instalar dependências. Verifique os erros acima.[0m
        pause
        exit /b 1
    )
    
    echo [92m✅ Dependências instaladas com sucesso![0m
)

:: Criar scripts
if not exist "scripts" mkdir scripts

:: Configurar o agente
if exist run-agent.js (
    echo [94m🤖 Configurando o agente...[0m
    call node run-agent.js setup
)

:: Iniciar serviços
echo [94m🌐 Iniciando ambiente de desenvolvimento...[0m

:: Iniciar servidor de desenvolvimento (em segundo plano)
start "RUNES Analytics Dev Server" cmd /c npm run dev

:: Esperar um pouco para o servidor iniciar
timeout /t 3 > nul

:: Abrir dashboard no navegador padrão
echo [94m🔗 Abrindo dashboard no navegador...[0m
start http://localhost:3000/runes-dashboard.html

:: Abrir Cursor ou outro editor, se disponível
echo [94m🖥️ Verificando editor de código...[0m
set "cursorFound=false"

if exist "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" (
    echo [92m✅ Cursor encontrado. Abrindo editor...[0m
    start "" "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" "%projectDir%"
    set "cursorFound=true"
) else if exist "%LOCALAPPDATA%\cursor\Cursor.exe" (
    echo [92m✅ Cursor encontrado. Abrindo editor...[0m
    start "" "%LOCALAPPDATA%\cursor\Cursor.exe" "%projectDir%"
    set "cursorFound=true"
) else if exist "%ProgramFiles%\cursor\Cursor.exe" (
    echo [92m✅ Cursor encontrado. Abrindo editor...[0m
    start "" "%ProgramFiles%\cursor\Cursor.exe" "%projectDir%"
    set "cursorFound=true"
) else if exist "%ProgramFiles(x86)%\cursor\Cursor.exe" (
    echo [92m✅ Cursor encontrado. Abrindo editor...[0m
    start "" "%ProgramFiles(x86)%\cursor\Cursor.exe" "%projectDir%"
    set "cursorFound=true"
) else if exist "%ProgramFiles%\Microsoft VS Code\Code.exe" (
    echo [93m⚠️ Cursor não encontrado. Abrindo VS Code...[0m
    start "" "%ProgramFiles%\Microsoft VS Code\Code.exe" "%projectDir%"
    set "cursorFound=true"
) else if exist "%ProgramFiles(x86)%\Microsoft VS Code\Code.exe" (
    echo [93m⚠️ Cursor não encontrado. Abrindo VS Code...[0m
    start "" "%ProgramFiles(x86)%\Microsoft VS Code\Code.exe" "%projectDir%"
    set "cursorFound=true"
)

if "%cursorFound%"=="false" (
    echo [93m⚠️ Editor não encontrado. Abra o Cursor ou seu editor favorito manualmente.[0m
)

:: Mensagem final
echo.
echo [92m✅ Ambiente RUNES Analytics Turbo configurado e iniciado![0m
echo.
echo [94m🔹 Dashboard: http://localhost:3000/runes-dashboard.html[0m
echo [94m🔹 Comandos disponíveis:[0m
echo    - //generate-banner style=cyberpunk text="GENAI"
echo    - //update-readme section=Roadmap content="..."
echo    - //create-social-card platform=twitter text="RUNES Analytics"
echo.
echo [94m🔹 Para parar o ambiente, pressione Ctrl+C nos terminais ou feche as janelas.[0m
echo.

:: Manter o script aberto
echo [90mPressione qualquer tecla para fechar este terminal...[0m
pause > nul 
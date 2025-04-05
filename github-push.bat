@echo off
title RUNES Analytics Pro - Push para GitHub
color 0B

echo Preparando push para GitHub...
echo.

:: Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo Node.js nao encontrado. Por favor, instale o Node.js para continuar.
    echo.
    pause
    exit /b 1
)

:: Verificar se Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo Git nao encontrado. Por favor, instale o Git para continuar.
    echo.
    pause
    exit /b 1
)

:: Verificar se as dependências estão instaladas
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
)

:: Exibir instruções
echo.
color 0A
echo RUNES Analytics Pro - Push para GitHub
echo   Este script atualizara a documentacao e enviara para o GitHub.
echo.

:: Verificar se há argumentos para mensagem de commit personalizada
if "%~1"=="" (
    :: Executar com mensagem padrão
    call npm run git:push
) else (
    :: Executar com mensagem personalizada
    echo Mensagem de commit personalizada: %*
    echo.
    node scripts/github-push.js %*
)

:: Esse código nunca será executado se o processo for interrompido
color 0C
echo Processo de push encerrado.
pause 
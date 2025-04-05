@echo off
title RUNES Analytics Pro - Monitor de Documentacao
color 0B

echo Iniciando monitoramento da documentacao...
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

:: Verificar se as dependências estão instaladas
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
)

:: Exibir instruções
echo.
color 0A
echo RUNES Analytics Pro - Modo de Monitoramento
echo   Este script monitorara as alteracoes nos arquivos .md e regenerara
echo   automaticamente a documentacao quando houver mudancas.
echo.
echo   Para interromper o monitoramento, pressione Ctrl+C
echo.

:: Executar o watcher
npm run watch:docs

:: Esse código nunca será executado se o watcher estiver rodando
color 0C
echo Monitoramento encerrado.
pause 
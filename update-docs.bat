@echo off
title RUNES Analytics Pro - Atualizacao de Documentacao
color 0B

echo Iniciando atualizacao completa da documentacao...
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
echo RUNES Analytics Pro - Atualizacao de Documentacao
echo   Este script atualizara toda a documentacao do projeto, incluindo:
echo   - Adicionar/atualizar timestamps em todos os arquivos
echo   - Verificar o status das traducoes
echo   - Gerar README em portugues e ingles com cabecalho multilingue
echo.

:: Executar o script de atualização completa
npm run update:all:docs

:: Esse código nunca será executado se o processo for interrompido
color 0C
echo Processo de atualizacao encerrado.
pause 
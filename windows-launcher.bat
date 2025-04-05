@echo off
REM RUNES Analytics Pro - Launcher para Windows
echo.
echo 🚀 RUNES Analytics Pro - Launcher
echo.

REM Verificar se PowerShell está disponível
where powershell >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✅ PowerShell detectado, usando script aprimorado...
    echo.
    powershell -ExecutionPolicy Bypass -File .\start-project.ps1
) else (
    echo ℹ️ PowerShell não encontrado, usando script de fallback...
    echo.
    call start-project.bat
)

REM Este código será executado após o encerramento do script
echo.
echo 👋 Obrigado por usar o RUNES Analytics Pro!
echo.
pause 
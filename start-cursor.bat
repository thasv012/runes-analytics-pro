@echo off
echo 🚀 Iniciando Cursor com configurações otimizadas...

rem Definir variáveis de ambiente
set USE_GPU=1
set CURSOR_AI_MODE=turbo

rem Caminho padrão do Cursor no Windows
set CURSOR_PATH="%LOCALAPPDATA%\Programs\Cursor\Cursor.exe"

rem Verificar se o Cursor existe no caminho padrão
if exist %CURSOR_PATH% (
    echo Usando executável do Cursor no caminho: %CURSOR_PATH%
    %CURSOR_PATH% --enable-gpu --fast-llm --project "./runes-analytics-pro"
) else (
    echo Tentando iniciar o Cursor via comando PATH...
    cursor --enable-gpu --fast-llm --project "./runes-analytics-pro"
)

echo ✅ Comando executado. Verifique se o Cursor foi iniciado corretamente.
pause 
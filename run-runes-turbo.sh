#!/bin/bash

echo "======================================================================"
echo "🌐 Iniciando RUNES Analytics Pro em modo TURBO..."
echo "🚀 Ativando IA com suporte a GPU (local e remota)..."
echo "======================================================================"

# Verifica se já existe um arquivo package.json
if [ ! -f "package.json" ]; then
    echo "📦 Inicializando projeto Node.js..."
    npm init -y > /dev/null 2>&1
fi

# Verifica se as dependências estão instaladas
if [ ! -d "node_modules/express" ] || [ ! -d "node_modules/cors" ] || [ ! -d "node_modules/ws" ] || [ ! -d "node_modules/axios" ] || [ ! -d "node_modules/uuid" ]; then
    echo "📦 Instalando dependências necessárias..."
    npm install express cors ws axios uuid > /dev/null 2>&1
fi

# Detecta a GPU disponível
GPU_MODEL=$(lspci | grep -i 'vga\|3d\|2d' | grep -i 'nvidia' | head -n 1 | sed 's/.*\[//;s/\].*//')
if [ -z "$GPU_MODEL" ]; then
    # Tenta outro método em sistemas Windows
    GPU_MODEL=$(wmic path win32_VideoController get name | grep -i 'nvidia' | head -n 1 | sed 's/^[ \t]*//')
fi

if [ -z "$GPU_MODEL" ]; then
    GPU_MODEL="GPU não detectada"
    echo "⚠️ Não foi possível detectar uma GPU NVIDIA no sistema"
else
    echo "✅ GPU detectada: $GPU_MODEL"
fi

# Exporta a variável para que o agente possa usá-la
export GPU_MODEL

# Cria diretório de logs se não existir
mkdir -p logs

echo "🔄 Iniciando servidor de agente GPU..."
node gpu-agent.js > logs/gpu-agent.log 2>&1 &
AGENT_PID=$!
echo "✅ Agente GPU iniciado (PID: $AGENT_PID)"

echo "🔄 Iniciando rede Mesh P2P..."
node gpu-mesh.js > logs/gpu-mesh.log 2>&1 &
MESH_PID=$!
echo "✅ Rede Mesh iniciada (PID: $MESH_PID)"

# Detecta o servidor HTTP mais adequado
if command -v live-server > /dev/null 2>&1; then
    SERVER_CMD="live-server"
elif command -v http-server > /dev/null 2>&1; then
    SERVER_CMD="http-server"
else
    echo "📦 Instalando servidor HTTP..."
    npm install -g live-server > /dev/null 2>&1
    SERVER_CMD="live-server"
fi

echo "🔄 Iniciando servidor web para frontend..."
$SERVER_CMD --port=8090 --no-browser > logs/web-server.log 2>&1 &
SERVER_PID=$!
echo "✅ Servidor web iniciado (PID: $SERVER_PID)"

# Salva os PIDs para posterior encerramento
echo "$AGENT_PID $MESH_PID $SERVER_PID" > .runes-pids

# Cria script para encerrar todos os processos
cat > stop-runes-turbo.sh << EOF
#!/bin/bash
echo "Encerrando RUNES Analytics Pro..."
if [ -f ".runes-pids" ]; then
    PIDS=\$(cat .runes-pids)
    for PID in \$PIDS; do
        kill -9 \$PID 2>/dev/null
    done
    rm .runes-pids
    echo "✅ Todos os processos encerrados"
else
    echo "⚠️ Arquivo de PIDs não encontrado"
fi
EOF

chmod +x stop-runes-turbo.sh

# Aguardar um pouco para os serviços iniciarem
sleep 3

# Exibir informações finais
echo ""
echo "======================================================================"
echo "🧠 CypherAI e RUNES Analytics estão rodando com GPU colaborativa!"
echo ""
echo "📊 Acessos:"
echo "  • Painel de controle: http://localhost:8090/index.html"
echo "  • API Demo: http://localhost:8090/api-demo.html"
echo "  • Status do agente GPU: http://localhost:8081/status"
echo ""
echo "🛑 Para encerrar todos os serviços, execute: ./stop-runes-turbo.sh"
echo "====================================================================== 
#!/bin/bash

# RUNES Analytics Pro - Script de inicialização
echo "🚀 Iniciando RUNES Analytics Pro..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js para continuar."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "🔧 Criando arquivo .env a partir do exemplo..."
    cp .env.example .env
    echo "⚠️ Por favor, edite o arquivo .env com suas configurações!"
fi

# Atualizar README
echo "📝 Atualizando documentação..."
npm run update:readme

# Verificar traduções
echo "🔍 Verificando traduções..."
npm run check:translations

# Iniciar servidor em segundo plano
echo "🌐 Iniciando servidor..."
npm start &

# Iniciar servidor de desenvolvimento
echo "🔧 Iniciando servidor de desenvolvimento..."
npx live-server --port=8090 &

echo "✅ RUNES Analytics Pro está rodando!"
echo "📊 Acesse o dashboard em: http://localhost:8090"
echo "⚙️ API disponível em: http://localhost:3000/api" 
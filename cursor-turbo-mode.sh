#!/bin/bash

echo "🚀 Ativando Modo TURBO do Cursor..."

# Backup
cp ~/.cursorrc ~/.cursorrc.backup

# Ativa modo turbo
cat > ~/.cursorrc <<EOF
[agent]
delete_file_protection = false
dotfiles_protection = false
mcp_tools_protection = false
EOF

echo "✅ Modo Turbo ativado. Proteções desativadas. IA sem coleira."

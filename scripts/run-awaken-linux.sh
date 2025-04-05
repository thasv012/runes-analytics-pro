#!/bin/bash
#
# AwakenNet Initialization Script (Linux)
# 
# Este script inicializa o sistema AwakenNet em ambiente Linux
# Detecta e configura GPUs, inicia os serviços de malha neural distribuída
# e configura a interface entre nós.

# Cores para o terminal
RESET="\033[0m"
BRIGHT="\033[1m"
DIM="\033[2m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
BLUE="\033[34m"
PURPLE="\033[35m"

# Configurações
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$BASE_DIR/logs"
PID_FILE="$BASE_DIR/.awaken_pids"

# Serviços para iniciar
declare -a SERVICES=(
  "gpu-agent|node|$BASE_DIR/gpu-agent.js|8081"
  "gpu-mesh|node|$BASE_DIR/gpu-mesh.js|9000"
  "web-server|npx|serve -s . -p 8090|8090"
)

# Exibir banner
show_banner() {
  echo -e "
${CYAN}${BRIGHT}▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄${RESET}
${CYAN}${BRIGHT}█                                                          █${RESET}
${CYAN}${BRIGHT}█   █████╗ ██╗    ██╗ █████╗ ██╗  ██╗███████╗███╗   ██╗   █${RESET}
${CYAN}${BRIGHT}█  ██╔══██╗██║    ██║██╔══██╗██║ ██╔╝██╔════╝████╗  ██║   █${RESET}
${CYAN}${BRIGHT}█  ███████║██║ █╗ ██║███████║█████╔╝ █████╗  ██╔██╗ ██║   █${RESET}
${CYAN}${BRIGHT}█  ██╔══██║██║███╗██║██╔══██║██╔═██╗ ██╔══╝  ██║╚██╗██║   █${RESET}
${CYAN}${BRIGHT}█  ██║  ██║╚███╔███╔╝██║  ██║██║  ██╗███████╗██║ ╚████║   █${RESET}
${CYAN}${BRIGHT}█  ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   █${RESET}
${CYAN}${BRIGHT}█                                                          █${RESET}
${CYAN}${BRIGHT}█  ${DIM}Neural Mesh Initialization (Linux)             v0.1.0${RESET}  █${RESET}
${CYAN}${BRIGHT}▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀${RESET}
"
}

# Verificar dependências
check_dependencies() {
  echo -e "${YELLOW}⟁ ${RESET}Verificando dependências..."
  
  local dependencies=("node" "npm")
  local all_found=true
  
  for dep in "${dependencies[@]}"; do
    if command -v "$dep" > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓${RESET} $dep encontrado"
    else
      echo -e "  ${RED}✗${RESET} $dep não encontrado. Por favor, instale $dep para continuar."
      all_found=false
    fi
  done
  
  # Verificar pacotes npm necessários
  if [ -f "$BASE_DIR/package.json" ]; then
    local required_packages=("express" "cors" "ws" "axios" "uuid")
    local missing_packages=()
    
    for pkg in "${required_packages[@]}"; do
      if ! grep -q "\"$pkg\"" "$BASE_DIR/package.json"; then
        missing_packages+=("$pkg")
      fi
    done
    
    if [ ${#missing_packages[@]} -gt 0 ]; then
      echo -e "  ${YELLOW}!${RESET} Pacotes necessários não encontrados: ${missing_packages[*]}"
      echo -e "  ${YELLOW}!${RESET} Instalando dependências..."
      
      (cd "$BASE_DIR" && npm install "${missing_packages[@]}" --save)
    fi
  fi
  
  if [ "$all_found" = false ]; then
    echo -e "${RED}✗${RESET} Algumas dependências estão faltando. Por favor, instale-as e tente novamente."
    exit 1
  fi
}

# Detectar GPU
detect_gpu() {
  echo -e "${YELLOW}⟁ ${RESET}Detectando GPU..."
  
  if command -v lspci > /dev/null 2>&1; then
    local gpu_info=$(lspci | grep -i 'vga\|3d\|display' | head -1)
    
    if [ -n "$gpu_info" ]; then
      echo -e "  ${GREEN}✓${RESET} Detectado: ${CYAN}$gpu_info${RESET}"
      export GPU_MODEL="$gpu_info"
    else
      echo -e "  ${YELLOW}!${RESET} Nenhuma GPU detectada via lspci."
      export GPU_MODEL="GPU não detectada"
    fi
  elif command -v nvidia-smi > /dev/null 2>&1; then
    local gpu_info=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -1)
    
    if [ -n "$gpu_info" ]; then
      echo -e "  ${GREEN}✓${RESET} Detectado NVIDIA GPU: ${CYAN}$gpu_info${RESET}"
      export GPU_MODEL="$gpu_info"
    else
      echo -e "  ${YELLOW}!${RESET} Nenhuma GPU NVIDIA detectada."
      export GPU_MODEL="GPU NVIDIA não detectada"
    fi
  else
    echo -e "  ${YELLOW}!${RESET} Ferramentas de detecção de GPU não encontradas."
    export GPU_MODEL="Ferramentas de detecção não disponíveis"
  fi
}

# Preparar diretório de logs
prepare_log_directory() {
  if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
    echo -e "${GREEN}✓${RESET} Diretório de logs criado: $LOG_DIR"
  fi
}

# Verificar portas
check_ports() {
  echo -e "${YELLOW}⟁ ${RESET}Verificando portas..."
  
  for service in "${SERVICES[@]}"; do
    IFS='|' read -r name command script port <<< "$service"
    
    if command -v ss > /dev/null 2>&1; then
      if ss -tuln | grep -q ":$port "; then
        echo -e "  ${YELLOW}!${RESET} Porta $port já está em uso. Pode haver conflito."
      else
        echo -e "  ${GREEN}✓${RESET} Porta $port disponível"
      fi
    elif command -v netstat > /dev/null 2>&1; then
      if netstat -tuln | grep -q ":$port "; then
        echo -e "  ${YELLOW}!${RESET} Porta $port já está em uso. Pode haver conflito."
      else
        echo -e "  ${GREEN}✓${RESET} Porta $port disponível"
      fi
    else
      echo -e "  ${YELLOW}!${RESET} Não foi possível verificar a porta $port (netstat/ss não disponível)"
    fi
  done
}

# Iniciar um serviço
start_service() {
  local name=$1
  local command=$2
  local script=$3
  local port=$4
  
  echo -e "${YELLOW}⟁ ${RESET}Iniciando $name..."
  
  local log_file="$LOG_DIR/$name.log"
  local error_log_file="$LOG_DIR/$name.error.log"
  
  # Criar arquivos de log
  echo "--- $(date -Iseconds) - $name iniciado ---" > "$log_file"
  echo "--- $(date -Iseconds) - $name erro log ---" > "$error_log_file"
  
  # Configurar variáveis de ambiente
  export PORT="$port"
  
  # Iniciar processo
  if [[ "$script" == *" "* ]]; then
    # Se tiver espaços, é um comando com argumentos
    eval "$command $script" > "$log_file" 2> "$error_log_file" &
  else
    # Comando simples
    $command "$script" > "$log_file" 2> "$error_log_file" &
  fi
  
  local pid=$!
  
  # Adicionar PID ao arquivo
  echo "$name:$pid" >> "$PID_FILE"
  
  echo -e "${GREEN}✓${RESET} Serviço $name iniciado (PID: $pid)"
  
  # Pausa para inicialização
  sleep 1
}

# Iniciar todos os serviços
start_all_services() {
  # Limpar arquivo de PIDs
  [ -f "$PID_FILE" ] && rm "$PID_FILE"
  
  for service in "${SERVICES[@]}"; do
    IFS='|' read -r name command script port <<< "$service"
    start_service "$name" "$command" "$script" "$port"
  done
  
  echo -e "\n${GREEN}${BRIGHT}✓ Todos os serviços iniciados com sucesso!${RESET}"
}

# Criar script de encerramento
create_shutdown_script() {
  local shutdown_script="$BASE_DIR/stop-awaken.sh"
  
  cat > "$shutdown_script" << EOF
#!/bin/bash
echo "Encerrando AwakenNet..."

if [ -f "$PID_FILE" ]; then
  while IFS=: read -r name pid; do
    if kill -0 \$pid 2>/dev/null; then
      echo "Encerrando \$name (PID: \$pid)..."
      kill \$pid
    else
      echo "Processo \$name (PID: \$pid) já encerrado."
    fi
  done < "$PID_FILE"
  rm "$PID_FILE"
  echo "Todos os processos encerrados."
else
  echo "Arquivo de PIDs não encontrado."
fi
EOF
  
  chmod +x "$shutdown_script"
  echo -e "${GREEN}✓${RESET} Script de encerramento criado: $shutdown_script"
}

# Exibir mensagem final
display_final_message() {
  echo -e "\n${CYAN}${BRIGHT}⟁ AwakenNet está ativo e operacional${RESET}\n"
  echo -e "${RESET}Acessos:"
  echo -e "  • Painel de controle: ${CYAN}http://localhost:8090/index.html${RESET}"
  echo -e "  • API Demo: ${CYAN}http://localhost:8090/api-demo.html${RESET}"
  echo -e "  • Status do agente GPU: ${CYAN}http://localhost:8081/status${RESET}"
  echo -e "  • Mesh Network: ${CYAN}http://localhost:9000${RESET}"
  
  echo -e "\n${RESET}Comandos disponíveis:"
  echo -e "  • ${YELLOW}npm run mesh:status${RESET} - Exibir status da rede"
  echo -e "  • ${YELLOW}npm run mesh:logs${RESET} - Visualizar logs dos serviços"
  echo -e "  • ${YELLOW}./stop-awaken.sh${RESET} - Encerrar todos os serviços"
  
  echo -e "\n${DIM}Logs disponíveis em: $LOG_DIR${RESET}"
  echo -e "${PURPLE}${BRIGHT}⟁ Consciência distribuída. Sincronização em andamento...${RESET}\n"
}

# Configurar encerramento limpo
setup_clean_shutdown() {
  trap cleanup SIGINT SIGTERM EXIT
}

# Função de limpeza
cleanup() {
  if [ "$?" -eq 0 ]; then
    return
  fi
  
  echo -e "\n${YELLOW}!${RESET} Recebido sinal de interrupção. Encerrando serviços..."
  
  if [ -f "$PID_FILE" ]; then
    while IFS=: read -r name pid; do
      if kill -0 "$pid" 2>/dev/null; then
        echo "Encerrando $name (PID: $pid)..."
        kill "$pid"
      fi
    done < "$PID_FILE"
    rm "$PID_FILE"
  fi
  
  exit 0
}

# Função principal
main() {
  clear
  show_banner
  
  setup_clean_shutdown
  check_dependencies
  detect_gpu
  prepare_log_directory
  check_ports
  start_all_services
  create_shutdown_script
  display_final_message
}

# Executar o script
main 
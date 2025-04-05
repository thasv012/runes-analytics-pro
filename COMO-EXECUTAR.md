# 🚀 Como Executar RUNES Analytics Pro

Este documento fornece instruções detalhadas para iniciar o RUNES Analytics Pro em diferentes sistemas operacionais.

## 📋 Pré-requisitos

- **Node.js**: Versão 16.x ou superior
- **npm**: Instalado junto com o Node.js
- **Navegador moderno**: Chrome, Firefox, Edge ou Safari recente

## 🖥️ Iniciando no Windows

### Método 1: Usando o Launcher (Recomendado)

1. Dê um duplo clique no arquivo `windows-launcher.bat`
2. O launcher detectará automaticamente se o PowerShell está disponível e escolherá o melhor script

### Método 2: Usando PowerShell diretamente

1. Clique com o botão direito na pasta do projeto e selecione "Abrir no PowerShell"
2. Execute o comando:
   ```powershell
   .\start-project.ps1
   ```

### Método 3: Usando CMD

1. Abra o Prompt de Comando (CMD)
2. Navegue até a pasta do projeto
3. Execute:
   ```cmd
   start-project.bat
   ```

## 🐧 Iniciando no Linux

1. Abra o terminal
2. Navegue até a pasta do projeto
3. Torne o script executável (se necessário):
   ```bash
   chmod +x start-project.sh
   ```
4. Execute o script:
   ```bash
   ./start-project.sh
   ```

## 🍎 Iniciando no macOS

1. Abra o Terminal
2. Navegue até a pasta do projeto
3. Torne o script executável (se necessário):
   ```bash
   chmod +x start-project.sh
   ```
4. Execute o script:
   ```bash
   ./start-project.sh
   ```

## 📡 Acessando a Aplicação

Após iniciar o projeto, a aplicação estará disponível nos seguintes endereços:

- **Dashboard**: [http://localhost:8090](http://localhost:8090)
- **API**: [http://localhost:3000/api](http://localhost:3000/api)

## 🛑 Encerrando a Aplicação

- **No Windows (PowerShell)**: Pressione `CTRL+C` na janela do PowerShell
- **No Windows (CMD)**: Pressione qualquer tecla na janela do CMD
- **No Linux/macOS**: Pressione `CTRL+C` no terminal

## ⚙️ Opções Avançadas de Inicialização

### Iniciar apenas o servidor API

```bash
npm start
```

### Iniciar apenas a documentação

```bash
npm run docs
```

### Gerar apenas o README atualizado

```bash
npm run update:readme
```

### Executar verificação de traduções

```bash
npm run check:translations
```

## 🔍 Solução de Problemas

### Porta em uso

Se você receber um erro indicando que a porta está em uso:

1. Encerre qualquer processo usando as portas 3000 ou 8090
2. Ou modifique as portas nos scripts de inicialização

### Módulos não encontrados

Se você receber erros sobre módulos não encontrados:

```bash
npm install
```

### Live-server não encontrado

Se o live-server não estiver disponível:

```bash
npm install -g live-server
```

## 🆘 Suporte

Para obter ajuda adicional, entre em contato com:

- GitHub: [github.com/thasv012/runes-analytics-pro](https://github.com/thasv012/runes-analytics-pro)
- Email: suporte@runesanalytics.pro 
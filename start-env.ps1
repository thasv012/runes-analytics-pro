# RUNES Analytics Turbo - Script de Inicialização
# Este script configura e inicia o ambiente de desenvolvimento integrado

Write-Host "🚀 Iniciando RUNES Analytics Turbo..." -ForegroundColor Cyan

# Diretório atual
$projectDir = $PSScriptRoot
Set-Location $projectDir

# Criar diretórios necessários (se não existirem)
$directories = @(
    "js", 
    "js/banners", 
    "js/components", 
    "css", 
    "css/components", 
    "components", 
    "assets", 
    "assets/banners", 
    "assets/social"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        Write-Host "📁 Criando diretório: $dir" -ForegroundColor Yellow
        New-Item -Path $dir -ItemType Directory | Out-Null
    }
}

# Verificar dependências
Write-Host "🔍 Verificando dependências..." -ForegroundColor Cyan

# Verificar Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js para continuar." -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm não encontrado. Por favor, instale o npm para continuar." -ForegroundColor Red
    exit 1
}

# Instalar dependências se package.json existir
if (Test-Path "package.json") {
    Write-Host "📦 Instalando dependências do projeto..." -ForegroundColor Cyan
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao instalar dependências. Verifique os erros acima." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
}
else {
    # Criar package.json básico se não existir
    Write-Host "📄 Criando package.json..." -ForegroundColor Yellow
    
    $packageJson = @"
{
  "name": "runes-analytics-pro",
  "version": "1.0.0",
  "description": "Plataforma de análise para tokens Runes no Bitcoin",
  "main": "index.js",
  "scripts": {
    "dev": "live-server --port=3000",
    "gen:readme": "node scripts/generate-readme.js",
    "banner:build": "node run-agent.js exec \"generate-banner style=cyberpunk text='RUNES Analytics'\"",
    "setup": "node run-agent.js setup",
    "start": "powershell -File start-env.ps1"
  },
  "keywords": [
    "runes",
    "bitcoin",
    "analytics",
    "dashboard"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "commander": "^9.4.1",
    "live-server": "^1.2.2"
  }
}
"@
    
    Set-Content -Path "package.json" -Value $packageJson
    
    Write-Host "📦 Instalando dependências básicas..." -ForegroundColor Cyan
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao instalar dependências. Verifique os erros acima." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
}

# Criar o arquivo runes-dashboard.html se não existir
if (-not (Test-Path "runes-dashboard.html")) {
    Write-Host "📄 Criando dashboard interativo..." -ForegroundColor Yellow
    
    $dashboardHtml = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUNES Analytics Pro - Dashboard Operacional</title>
    <style>
        :root {
            --primary-color: #ff5e00;
            --secondary-color: #00ffea;
            --bg-color: #121212;
            --card-bg: #1a1a1a;
            --text-color: #ffffff;
            --border-color: #333;
        }
        
        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
        }
        
        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .header-controls {
            display: flex;
            gap: 15px;
        }
        
        .btn {
            background-color: transparent;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.3s;
        }
        
        .btn:hover {
            background-color: var(--primary-color);
            color: var(--bg-color);
        }
        
        .btn-primary {
            background-color: var(--primary-color);
            color: var(--bg-color);
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
        }
        
        .card-title {
            font-size: 1.2rem;
            margin: 0;
            color: var(--secondary-color);
        }
        
        .card-actions {
            display: flex;
            gap: 10px;
        }
        
        .card-content {
            min-height: 150px;
        }
        
        .command-input {
            display: flex;
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 30px;
        }
        
        .command-prompt {
            color: var(--primary-color);
            margin-right: 10px;
            font-weight: bold;
        }
        
        #command {
            background-color: transparent;
            border: none;
            color: var(--text-color);
            font-family: inherit;
            font-size: 1rem;
            flex-grow: 1;
            outline: none;
        }
        
        .banner-preview {
            width: 100%;
            height: 200px;
            background-color: var(--bg-color);
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }
        
        .banner-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        
        .readme-content {
            max-height: 300px;
            overflow-y: auto;
            font-size: 0.9rem;
            padding-right: 10px;
        }
        
        .readme-content h1, .readme-content h2, .readme-content h3 {
            color: var(--secondary-color);
        }
        
        .readme-content code {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        .recent-tokens {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .token-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .token-name {
            font-weight: bold;
        }
        
        .token-price {
            color: var(--secondary-color);
        }
        
        .token-change.positive {
            color: #00ff00;
        }
        
        .token-change.negative {
            color: #ff0000;
        }
        
        .footer {
            margin-top: 40px;
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.6);
            text-align: center;
        }
        
        /* Estilos para terminal/console embutido */
        .terminal {
            background-color: #000;
            border-radius: 5px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            height: 300px;
            overflow-y: auto;
        }
        
        .terminal-output {
            color: #0f0;
            white-space: pre-wrap;
            margin: 0;
        }
        
        /* Animações */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">RUNES Analytics Turbo</div>
            <div class="header-controls">
                <button class="btn" id="toggleTheme">Modo Claro</button>
                <button class="btn btn-primary" id="startDevServer">Iniciar Servidor</button>
            </div>
        </header>
        
        <div class="command-input">
            <span class="command-prompt">//</span>
            <input type="text" id="command" placeholder="Digite um comando (ex: generate-banner style=cyberpunk text='RUNES Pro')" />
        </div>
        
        <div class="dashboard-grid">
            <div class="card fade-in">
                <div class="card-header">
                    <h2 class="card-title">Banners Gerados</h2>
                    <div class="card-actions">
                        <button class="btn" id="refreshBanners">🔄</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="banner-preview" id="bannerPreview">
                        <p>Nenhum banner gerado ainda</p>
                    </div>
                </div>
            </div>
            
            <div class="card fade-in">
                <div class="card-header">
                    <h2 class="card-title">README</h2>
                    <div class="card-actions">
                        <button class="btn" id="refreshReadme">🔄</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="readme-content" id="readmeContent">
                        <p>Carregando README...</p>
                    </div>
                </div>
            </div>
            
            <div class="card fade-in">
                <div class="card-header">
                    <h2 class="card-title">Tokens Monitorados</h2>
                    <div class="card-actions">
                        <button class="btn" id="refreshTokens">🔄</button>
                    </div>
                </div>
                <div class="card-content">
                    <ul class="recent-tokens" id="tokensList">
                        <li class="token-item">
                            <span class="token-name">RUNES</span>
                            <span class="token-price">0.00024 BTC</span>
                            <span class="token-change positive">+5.2%</span>
                        </li>
                        <li class="token-item">
                            <span class="token-name">PEPE</span>
                            <span class="token-price">0.00012 BTC</span>
                            <span class="token-change negative">-2.1%</span>
                        </li>
                        <li class="token-item">
                            <span class="token-name">ORDI</span>
                            <span class="token-price">0.00089 BTC</span>
                            <span class="token-change positive">+1.7%</span>
                        </li>
                        <li class="token-item">
                            <span class="token-name">MEME</span>
                            <span class="token-price">0.00005 BTC</span>
                            <span class="token-change positive">+0.5%</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="card fade-in">
            <div class="card-header">
                <h2 class="card-title">Terminal Integrado</h2>
                <div class="card-actions">
                    <button class="btn" id="clearTerminal">Limpar</button>
                </div>
            </div>
            <div class="terminal">
                <pre class="terminal-output" id="terminalOutput">🚀 RUNES Analytics Turbo v1.0.0
Ambiente de desenvolvimento pronto!
Digite um comando acima ou use o menu de ações.

> _</pre>
            </div>
        </div>
        
        <div class="footer">
            RUNES Analytics Pro v1.0.0 &copy; 2025 - Ambiente de Desenvolvimento
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Referências a elementos
            const commandInput = document.getElementById('command');
            const terminalOutput = document.getElementById('terminalOutput');
            const tokensList = document.getElementById('tokensList');
            const bannerPreview = document.getElementById('bannerPreview');
            const readmeContent = document.getElementById('readmeContent');
            
            // Botões
            const toggleThemeBtn = document.getElementById('toggleTheme');
            const startDevServerBtn = document.getElementById('startDevServer');
            const clearTerminalBtn = document.getElementById('clearTerminal');
            const refreshTokensBtn = document.getElementById('refreshTokens');
            const refreshReadmeBtn = document.getElementById('refreshReadme');
            const refreshBannersBtn = document.getElementById('refreshBanners');
            
            // Variáveis globais
            let isDarkTheme = true;
            let isServerRunning = false;
            
            // Carregar README
            function loadReadme() {
                terminalOutput.textContent += "\n> Carregando README...";
                
                // Simular carregamento
                setTimeout(() => {
                    readmeContent.innerHTML = `
                        <h1>RUNES Analytics Pro</h1>
                        
                        <p>Plataforma de análise exclusiva para tokens Runes no Bitcoin, oferecendo interface intuitiva, design gamificado e integração com múltiplas fontes de dados.</p>
                        
                        <h2>Funcionalidades</h2>
                        
                        <ul>
                            <li>Dashboard interativo com métricas em tempo real</li>
                            <li>Sistema de gamificação para engajamento de usuários</li>
                            <li>Rastreador de baleias e movimentações significativas</li>
                            <li>Análise de sentimento social</li>
                        </ul>
                        
                        <h2>Comandos</h2>
                        
                        <p>Use os comandos a seguir para interagir com o agente:</p>
                        
                        <code>//generate-banner style=cyberpunk text="GENAI"</code><br>
                        <code>//update-readme section=Roadmap content="..."</code><br>
                        <code>//create-social-card platform=twitter text="RUNES Analytics"</code>
                    `;
                    
                    terminalOutput.textContent += "\n> README carregado com sucesso!";
                }, 800);
            }
            
            // Processar comando
            function processCommand(cmd) {
                if (!cmd) return;
                
                terminalOutput.textContent += `\n> ${cmd}`;
                
                // Parse do comando
                if (cmd.startsWith('generate-banner') || cmd.startsWith('//generate-banner')) {
                    // Remover prefixo se existir
                    const cleanCmd = cmd.replace(/^\/\//, '');
                    
                    // Extrair parâmetros
                    const styleMatch = cleanCmd.match(/style=([^\s]+)/);
                    const textMatch = cleanCmd.match(/text=['"]([^'"]+)['"]/);
                    
                    const style = styleMatch ? styleMatch[1] : 'default';
                    const text = textMatch ? textMatch[1] : 'RUNES Analytics';
                    
                    terminalOutput.textContent += `\n>> Gerando banner: estilo="${style}", texto="${text}"`;
                    
                    // Simular geração de banner
                    setTimeout(() => {
                        terminalOutput.textContent += `\n>> Banner gerado: banner-${style}-${text.toLowerCase().replace(/\s+/g, '-')}.html`;
                        
                        // Atualizar preview
                        bannerPreview.innerHTML = `
                            <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; 
                                        background: linear-gradient(135deg, #0e0b16, #1a1a2e); color: white; text-align: center;">
                                <div>
                                    <h3 style="font-size: 24px; background: linear-gradient(90deg, #e83e8c, #42e6f5); 
                                              -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${text}</h3>
                                    <p>RUNES Analytics Pro</p>
                                </div>
                            </div>
                        `;
                    }, 1500);
                }
                else if (cmd.startsWith('update-readme') || cmd.startsWith('//update-readme')) {
                    terminalOutput.textContent += `\n>> Atualizando README...`;
                    
                    // Simulação
                    setTimeout(() => {
                        terminalOutput.textContent += `\n>> README atualizado com sucesso!`;
                        loadReadme();
                    }, 1000);
                }
                else if (cmd.startsWith('create-social-card') || cmd.startsWith('//create-social-card')) {
                    terminalOutput.textContent += `\n>> Gerando card social...`;
                    
                    // Simulação
                    setTimeout(() => {
                        terminalOutput.textContent += `\n>> Card social gerado com sucesso!`;
                    }, 1200);
                }
                else {
                    terminalOutput.textContent += `\n>> Comando não reconhecido. Tente //generate-banner, //update-readme ou //create-social-card`;
                }
                
                // Limpar input
                commandInput.value = '';
            }
            
            // Alternar tema
            function toggleTheme() {
                isDarkTheme = !isDarkTheme;
                
                if (isDarkTheme) {
                    document.documentElement.style.setProperty('--bg-color', '#121212');
                    document.documentElement.style.setProperty('--card-bg', '#1a1a1a');
                    document.documentElement.style.setProperty('--text-color', '#ffffff');
                    toggleThemeBtn.textContent = 'Modo Claro';
                } else {
                    document.documentElement.style.setProperty('--bg-color', '#f5f5f5');
                    document.documentElement.style.setProperty('--card-bg', '#ffffff');
                    document.documentElement.style.setProperty('--text-color', '#333333');
                    toggleThemeBtn.textContent = 'Modo Escuro';
                }
            }
            
            // Iniciar servidor de desenvolvimento
            function toggleDevServer() {
                isServerRunning = !isServerRunning;
                
                if (isServerRunning) {
                    terminalOutput.textContent += "\n> Iniciando servidor de desenvolvimento...";
                    startDevServerBtn.textContent = "Parar Servidor";
                    
                    // Simulação
                    setTimeout(() => {
                        terminalOutput.textContent += "\n> Servidor rodando em http://localhost:3000";
                    }, 1500);
                } else {
                    terminalOutput.textContent += "\n> Parando servidor de desenvolvimento...";
                    startDevServerBtn.textContent = "Iniciar Servidor";
                    
                    // Simulação
                    setTimeout(() => {
                        terminalOutput.textContent += "\n> Servidor parado";
                    }, 800);
                }
            }
            
            // Simular atualização de tokens
            function refreshTokens() {
                terminalOutput.textContent += "\n> Atualizando dados de tokens...";
                
                // Simulação
                setTimeout(() => {
                    const tokens = [
                        { name: "RUNES", price: "0.00024", change: "+5.2%" },
                        { name: "PEPE", price: "0.00012", change: "-2.1%" },
                        { name: "ORDI", price: "0.00089", change: "+1.7%" },
                        { name: "MEME", price: "0.00005", change: "+0.5%" }
                    ];
                    
                    // Atualizar alguns valores aleatoriamente
                    tokens.forEach(token => {
                        const random = Math.random();
                        if (random > 0.5) {
                            const changeVal = (Math.random() * 5).toFixed(1);
                            token.change = random > 0.7 ? `+${changeVal}%` : `-${changeVal}%`;
                        }
                    });
                    
                    // Atualizar lista
                    tokensList.innerHTML = '';
                    tokens.forEach(token => {
                        const isPositive = token.change.startsWith('+');
                        tokensList.innerHTML += `
                            <li class="token-item">
                                <span class="token-name">${token.name}</span>
                                <span class="token-price">${token.price} BTC</span>
                                <span class="token-change ${isPositive ? 'positive' : 'negative'}">${token.change}</span>
                            </li>
                        `;
                    });
                    
                    terminalOutput.textContent += "\n> Dados de tokens atualizados!";
                }, 1000);
            }
            
            // Event listeners
            commandInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    processCommand(commandInput.value);
                }
            });
            
            toggleThemeBtn.addEventListener('click', toggleTheme);
            startDevServerBtn.addEventListener('click', toggleDevServer);
            clearTerminalBtn.addEventListener('click', () => {
                terminalOutput.textContent = '🚀 RUNES Analytics Turbo v1.0.0\nTerminal limpo.\n\n> _';
            });
            refreshTokensBtn.addEventListener('click', refreshTokens);
            refreshReadmeBtn.addEventListener('click', loadReadme);
            refreshBannersBtn.addEventListener('click', () => {
                terminalOutput.textContent += "\n> Atualizando lista de banners...";
                
                setTimeout(() => {
                    terminalOutput.textContent += "\n> Lista de banners atualizada!";
                }, 800);
            });
            
            // Inicialização
            loadReadme();
        });
    </script>
</body>
</html>
"@
    
    Set-Content -Path "runes-dashboard.html" -Value $dashboardHtml
    Write-Host "✅ Dashboard criado: runes-dashboard.html" -ForegroundColor Green
}

# Criar o script de inicialização do ambiente
if (-not (Test-Path "scripts")) {
    New-Item -Path "scripts" -ItemType Directory | Out-Null
}

# Iniciar serviços
Write-Host "🌐 Iniciando ambiente de desenvolvimento..." -ForegroundColor Cyan

# Abrir dashboard no navegador padrão
Write-Host "🔗 Abrindo dashboard no navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3000/runes-dashboard.html"

# Iniciar servidor de desenvolvimento (em segundo plano)
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WindowStyle Minimized

# Abrir Cursor ou outro editor, se disponível
$editorPathOptions = @(
    "${env:LOCALAPPDATA}\Programs\cursor\Cursor.exe",
    "${env:LOCALAPPDATA}\cursor\Cursor.exe",
    "${env:ProgramFiles}\cursor\Cursor.exe",
    "${env:ProgramFiles(x86)}\cursor\Cursor.exe",
    "${env:ProgramFiles}\Microsoft VS Code\Code.exe",
    "${env:ProgramFiles(x86)}\Microsoft VS Code\Code.exe"
)

$editorPath = $null
foreach ($path in $editorPathOptions) {
    if (Test-Path $path) {
        $editorPath = $path
        break
    }
}

if ($editorPath) {
    Write-Host "🖥️ Abrindo editor..." -ForegroundColor Cyan
    Start-Process $editorPath -ArgumentList $projectDir
}
else {
    Write-Host "⚠️ Editor não encontrado. Abra o Cursor ou seu editor favorito manualmente." -ForegroundColor Yellow
}

# Mensagem final
Write-Host @"

✅ Ambiente RUNES Analytics Turbo configurado e iniciado!

🔹 Dashboard: http://localhost:3000/runes-dashboard.html
🔹 Comandos disponíveis:
   - //generate-banner style=cyberpunk text="GENAI"
   - //update-readme section=Roadmap content="..."
   - //create-social-card platform=twitter text="RUNES Analytics"

🔹 Para parar o ambiente, pressione Ctrl+C nos terminais ou feche as janelas.

"@ -ForegroundColor Green

# Manter o script aberto
Write-Host "Pressione qualquer tecla para fechar este terminal..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null 
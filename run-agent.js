const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { Command } = require('commander');

const program = new Command();

// Definição do prompt do agente
const agentPrompt = `Você é um agente desenvolvedor do RUNES Analytics Pro.
Sua função é:

- Interpretar comandos como //generate-banner style=cyberpunk text="GENAI"
- Criar ou editar arquivos HTML/CSS/JS do projeto
- Atualizar blocos de documentação
- Gerar prompts ou imagens estilizadas para redes sociais
- Manter estilo visual cyberpunk + minimalista

Comandos suportados:
- //generate-banner style=[style] text=[text] -> Gera um banner visual com texto e estilo especificados
- //update-readme section=[section] content=[content] -> Atualiza ou adiciona uma seção no README
- //create-social-card platform=[twitter/linkedin] text=[text] -> Cria uma imagem para redes sociais
- //create-component name=[name] type=[type] -> Cria um novo componente no formato especificado
`;

// Função para gerar banner baseado em estilo e texto
function generateBanner(style, text) {
  console.log(`Gerando banner com estilo ${style} e texto "${text}"`);
  
  // Template do banner HTML
  const bannerTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RUNES Banner - ${text}</title>
  <style>
    :root {
      --primary-color: #ff5e00;
      --secondary-color: #00ffea;
      --bg-color: #121212;
      --text-color: #ffffff;
    }
    
    body {
      background-color: var(--bg-color);
      margin: 0;
      padding: 0;
      font-family: 'Courier New', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: var(--text-color);
      overflow: hidden;
    }
    
    .banner {
      position: relative;
      width: 1200px;
      height: 628px;
      background: linear-gradient(135deg, #1a1a1a, #000000);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      border: 2px solid var(--primary-color);
      box-shadow: 0 0 20px rgba(255, 94, 0, 0.5);
      overflow: hidden;
    }
    
    .banner::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(255, 94, 0, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 30%, rgba(0, 255, 234, 0.15) 0%, transparent 50%);
      z-index: 1;
    }
    
    .banner-content {
      position: relative;
      z-index: 2;
      padding: 2rem;
    }
    
    .banner-title {
      font-size: 6rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
      letter-spacing: -1px;
    }
    
    .banner-subtitle {
      font-size: 2rem;
      margin-top: 1rem;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .runes-logo {
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    
    .glitch-effect {
      animation: glitch 1s infinite;
      position: relative;
      display: inline-block;
    }
    
    @keyframes glitch {
      0% {
        transform: translate(0);
      }
      20% {
        transform: translate(-2px, 2px);
      }
      40% {
        transform: translate(-2px, -2px);
      }
      60% {
        transform: translate(2px, 2px);
      }
      80% {
        transform: translate(2px, -2px);
      }
      100% {
        transform: translate(0);
      }
    }
    
    /* Estilos específicos para cyberpunk */
    ${style === 'cyberpunk' ? `
    .banner {
      background: linear-gradient(135deg, #0e0b16, #1a1a2e);
      border: 2px solid #e83e8c;
      box-shadow: 0 0 30px rgba(232, 62, 140, 0.6);
    }
    
    .banner::before {
      background: 
        linear-gradient(90deg, rgba(232, 62, 140, 0.1) 0%, transparent 50%),
        linear-gradient(180deg, rgba(66, 230, 245, 0.1) 0%, transparent 50%),
        url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e83e8c' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E");
    }
    
    .banner-title {
      font-family: 'Blender Pro', 'Rajdhani', sans-serif;
      background: linear-gradient(90deg, #e83e8c, #42e6f5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .banner-subtitle {
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 1px;
    }
    ` : ''}
    
    /* Estilos específicos para minimalista */
    ${style === 'minimal' ? `
    .banner {
      background: #0f0f0f;
      border: 1px solid #333;
      box-shadow: none;
    }
    
    .banner::before {
      background: none;
    }
    
    .banner-title {
      font-family: 'Inter', sans-serif;
      color: white;
      -webkit-text-fill-color: white;
      background: none;
      font-weight: 300;
      letter-spacing: -1px;
    }
    
    .banner-subtitle {
      font-weight: 300;
    }
    ` : ''}
    
    /* Estilos específicos para neon */
    ${style === 'neon' ? `
    .banner {
      background: #000000;
      border: 3px solid #00ff00;
      box-shadow: 0 0 40px rgba(0, 255, 0, 0.6), inset 0 0 40px rgba(0, 255, 0, 0.4);
    }
    
    .banner::before {
      background: radial-gradient(circle at center, rgba(0, 255, 0, 0.1) 0%, transparent 70%);
    }
    
    .banner-title {
      color: #ffffff;
      -webkit-text-fill-color: #ffffff;
      background: none;
      text-shadow: 
        0 0 5px #00ff00, 
        0 0 10px #00ff00, 
        0 0 20px #00ff00;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 2px;
    }
    
    .banner-subtitle {
      color: #00ff00;
      text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
    }
    ` : ''}
  </style>
</head>
<body>
  <div class="banner">
    <div class="banner-content">
      <h1 class="banner-title"><span class="glitch-effect">${text}</span></h1>
      <p class="banner-subtitle">RUNES Analytics Pro</p>
    </div>
    <div class="runes-logo">RUNES ANALYTICS</div>
  </div>
</body>
</html>
  `;
  
  // Salvar o banner como arquivo HTML
  const fileName = `banner-${style}-${text.replace(/\s+/g, '-').toLowerCase()}.html`;
  fs.writeFileSync(fileName, bannerTemplate);
  
  // Também salvar versão JS para importação
  const bannerJs = `
// Banner gerado para "${text}" com estilo "${style}"
export const banner = {
  style: "${style}",
  text: "${text}",
  html: \`${bannerTemplate}\`,
  createdAt: "${new Date().toISOString()}"
};
  `;
  
  const jsFileName = `js/banners/${fileName.replace('.html', '.js')}`;
  
  // Verificar se o diretório existe e criar se necessário
  const dir = path.dirname(jsFileName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(jsFileName, bannerJs);
  
  console.log(`Banner HTML gerado: ${fileName}`);
  console.log(`Banner JS gerado: ${jsFileName}`);
  
  // Abrir o banner no navegador
  openInBrowser(fileName);
  
  return { htmlFile: fileName, jsFile: jsFileName };
}

// Função para atualizar o README
function updateReadme(section, content) {
  console.log(`Atualizando README com seção "${section}"`);
  
  // Ler o arquivo README atual
  let readmeContent = '';
  try {
    readmeContent = fs.readFileSync('README.md', 'utf8');
  } catch (error) {
    // Se não existir, criar um novo
    readmeContent = `# RUNES Analytics Pro\n\n`;
  }
  
  // Verificar se a seção já existe
  const sectionRegex = new RegExp(`## ${section}[\\s\\S]*?(?=## |$)`, 'i');
  const sectionExists = sectionRegex.test(readmeContent);
  
  if (sectionExists) {
    // Substituir a seção existente
    readmeContent = readmeContent.replace(sectionRegex, `## ${section}\n\n${content}\n\n`);
  } else {
    // Adicionar nova seção
    readmeContent += `\n## ${section}\n\n${content}\n\n`;
  }
  
  // Salvar o README atualizado
  fs.writeFileSync('README.md', readmeContent);
  console.log(`README atualizado com seção "${section}"`);
  
  return true;
}

// Função para criar cartão social
function createSocialCard(platform, text) {
  console.log(`Criando cartão social para ${platform} com texto "${text}"`);
  
  // Configurações específicas para cada plataforma
  const dimensions = platform === 'twitter' ? 
    { width: 1200, height: 675 } : 
    { width: 1200, height: 628 };
  
  // Template do cartão social
  const cardTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RUNES Social Card - ${platform}</title>
  <style>
    body {
      background-color: #121212;
      margin: 0;
      padding: 0;
      font-family: 'Courier New', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: #ffffff;
    }
    
    .card {
      position: relative;
      width: ${dimensions.width}px;
      height: ${dimensions.height}px;
      background: linear-gradient(135deg, #1a1a1a, #000000);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      border: 2px solid #ff5e00;
      box-shadow: 0 0 20px rgba(255, 94, 0, 0.5);
      overflow: hidden;
    }
    
    .card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(255, 94, 0, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 30%, rgba(0, 255, 234, 0.15) 0%, transparent 50%);
      z-index: 1;
    }
    
    .card-content {
      position: relative;
      z-index: 2;
      padding: 2rem;
    }
    
    .card-title {
      font-size: 4rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(90deg, #ff5e00, #00ffea);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
    }
    
    .card-description {
      font-size: 1.5rem;
      margin-top: 1rem;
      color: rgba(255, 255, 255, 0.8);
      max-width: 80%;
      margin-left: auto;
      margin-right: auto;
    }
    
    .runes-logo {
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #ff5e00;
    }
    
    .platform-tag {
      position: absolute;
      top: 2rem;
      left: 2rem;
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      background-color: ${platform === 'twitter' ? '#1DA1F2' : '#0077B5'};
      padding: 0.5rem 1rem;
      border-radius: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="platform-tag">${platform === 'twitter' ? 'Twitter' : 'LinkedIn'}</div>
    <div class="card-content">
      <h1 class="card-title">${text}</h1>
      <p class="card-description">Descubra o poder da análise de RUNES com nossa plataforma de última geração</p>
    </div>
    <div class="runes-logo">RUNES ANALYTICS</div>
  </div>
</body>
</html>
  `;
  
  // Salvar o cartão como arquivo HTML
  const fileName = `social-${platform}-${text.replace(/\s+/g, '-').toLowerCase()}.html`;
  fs.writeFileSync(fileName, cardTemplate);
  console.log(`Cartão social gerado: ${fileName}`);
  
  // Abrir o cartão no navegador
  openInBrowser(fileName);
  
  return { file: fileName };
}

// Função para criar componente
function createComponent(name, type) {
  console.log(`Criando componente ${name} do tipo ${type}`);
  
  let componentContent = '';
  let fileName = '';
  
  switch (type) {
    case 'html':
      componentContent = `
<!-- Componente: ${name} -->
<div class="component-${name.toLowerCase()}">
  <h2 class="component-title">${name}</h2>
  <div class="component-content">
    <!-- Conteúdo do componente -->
  </div>
</div>
      `;
      fileName = `components/${name.toLowerCase()}.html`;
      break;
    
    case 'js':
      componentContent = `
/**
 * Componente ${name}
 * Descrição: Novo componente JavaScript para o RUNES Analytics Pro
 */
class ${name}Component {
  constructor(options = {}) {
    this.options = options;
    this.element = null;
    this.init();
  }
  
  init() {
    console.log('Inicializando componente ${name}');
    this.element = document.createElement('div');
    this.element.className = 'component-${name.toLowerCase()}';
    this.render();
  }
  
  render() {
    this.element.innerHTML = \`
      <h2 class="component-title">${name}</h2>
      <div class="component-content">
        <!-- Conteúdo do componente -->
      </div>
    \`;
    
    return this.element;
  }
  
  mount(targetElement) {
    if (typeof targetElement === 'string') {
      targetElement = document.querySelector(targetElement);
    }
    
    if (targetElement) {
      targetElement.appendChild(this.element);
    }
  }
}

export default ${name}Component;
      `;
      fileName = `js/components/${name}Component.js`;
      break;
    
    case 'css':
      componentContent = `
/**
 * Estilos para o componente ${name}
 */
.component-${name.toLowerCase()} {
  position: relative;
  margin: 1rem 0;
  padding: 1.5rem;
  background-color: var(--bg-color-secondary, #1a1a1a);
  border: 1px solid var(--border-color, #333);
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.component-${name.toLowerCase()} .component-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary-color, #ff5e00);
}

.component-${name.toLowerCase()} .component-content {
  width: 100%;
}
      `;
      fileName = `css/components/${name.toLowerCase()}.css`;
      break;
      
    default:
      console.error(`Tipo de componente inválido: ${type}`);
      return null;
  }
  
  // Verificar se o diretório existe e criar se necessário
  const dir = path.dirname(fileName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Salvar o componente
  fs.writeFileSync(fileName, componentContent);
  console.log(`Componente ${name} criado: ${fileName}`);
  
  return { file: fileName };
}

// Função para abrir no navegador
function openInBrowser(filePath) {
  const absolutePath = path.resolve(filePath);
  const url = `file://${absolutePath}`;
  
  // Detectar sistema operacional e abrir navegador apropriado
  switch (process.platform) {
    case 'win32':
      exec(`start ${url}`);
      break;
    case 'darwin':
      exec(`open ${url}`);
      break;
    default:
      exec(`xdg-open ${url}`);
  }
  
  console.log(`Abrindo no navegador: ${url}`);
}

// Função para processar comandos
function processCommand(command) {
  if (!command || typeof command !== 'string') {
    console.error('Comando inválido');
    return;
  }
  
  // Remover prefixo de comentário se existir
  if (command.startsWith('//')) {
    command = command.substring(2);
  }
  
  // Extrair o nome do comando e os parâmetros
  const cmdParts = command.trim().split(' ');
  const cmdName = cmdParts[0];
  
  // Extrair parâmetros no formato nome=valor
  const params = {};
  cmdParts.slice(1).forEach(part => {
    const match = part.match(/^([^=]+)=(.+)$/);
    if (match) {
      const [, name, value] = match;
      // Remover aspas se existirem
      params[name] = value.replace(/^["']|["']$/g, '');
    }
  });
  
  // Executar o comando correspondente
  switch (cmdName) {
    case 'generate-banner':
      return generateBanner(params.style || 'default', params.text || 'RUNES Analytics');
    
    case 'update-readme':
      return updateReadme(params.section || 'Novo Conteúdo', params.content || 'Conteúdo da seção');
    
    case 'create-social-card':
      return createSocialCard(params.platform || 'twitter', params.text || 'RUNES Analytics');
    
    case 'create-component':
      return createComponent(params.name || 'NovoComponente', params.type || 'js');
    
    default:
      console.error(`Comando desconhecido: ${cmdName}`);
      return null;
  }
}

// Configuração do programa CLI
program
  .name('run-agent')
  .description('Agente IA para RUNES Analytics Pro')
  .version('1.0.0');

program
  .command('exec <command>')
  .description('Executa um comando do agente')
  .action((command) => {
    console.log(`Executando comando: ${command}`);
    const result = processCommand(command);
    console.log('Resultado:', result);
  });

program
  .command('watch')
  .description('Monitora comentários em arquivos para comandos automáticos')
  .action(() => {
    console.log('Modo de monitoramento iniciado. Procurando por comandos em arquivos...');
    // TODO: Implementar monitoramento de arquivos
    console.log('Pressione Ctrl+C para sair.');
  });

program
  .command('setup')
  .description('Configura o ambiente de desenvolvimento')
  .action(() => {
    console.log('Configurando ambiente de desenvolvimento...');
    
    // Criar estrutura de diretórios base
    const dirs = [
      'js',
      'js/banners',
      'js/components',
      'css',
      'css/components',
      'components',
      'assets',
      'assets/banners',
      'assets/social'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório criado: ${dir}`);
      }
    });
    
    // Criar arquivo de setup
    const setupContent = `
# RUNES Analytics Pro - Ambiente de Desenvolvimento

Este ambiente foi configurado para o desenvolvimento do RUNES Analytics Pro.

## Ferramentas Disponíveis

- **run-agent.js**: Agente IA para geração de banners, componentes e mais
- **scripts/start-env.js**: Script para iniciar todo o ambiente de desenvolvimento

## Comandos Disponíveis

- \`//generate-banner style=cyberpunk text="GENAI"\`: Gera um banner visual
- \`//update-readme section=Roadmap content="..."\`: Atualiza o README
- \`//create-social-card platform=twitter text="RUNES Analytics"\`: Cria um card para redes sociais
- \`//create-component name=DataCard type=js\`: Cria um novo componente

## Como Usar

Execute \`node run-agent.js exec "//generate-banner style=cyberpunk text='RUNES Analytics'"\` para testar.
    `;
    
    fs.writeFileSync('SETUP.md', setupContent);
    console.log('Arquivo SETUP.md criado');
    
    console.log('Ambiente configurado com sucesso!');
  });

// Inicializar o CLI
if (require.main === module) {
  program.parse(process.argv);
}

module.exports = {
  processCommand,
  generateBanner,
  updateReadme,
  createSocialCard,
  createComponent,
  agentPrompt
}; 
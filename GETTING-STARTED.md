# RUNES Analytics Pro - Instruções de Início

## Bem-vindo à Comunidade RUNES Analytics Pro!

Este guia vai ajudar você a configurar o ambiente de desenvolvimento para começar a contribuir com o projeto. Seguindo estas instruções, você terá o ambiente completo funcionando em questão de minutos.

## Requisitos do Sistema

- **Node.js**: v16.x ou superior
- **npm**: v8.x ou superior
- **Espaço em Disco**: Mínimo de 500MB para instalação completa
- **RAM**: Recomendado 4GB para melhor performance (8GB+ para modo Turbo)
- **GPU**: Opcional, mas recomendado para renderização avançada no modo Turbo

## Configuração Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/thierry-runes/runes-analytics-pro.git
cd runes-analytics-pro
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais e configurações:

```
# API Keys
RUNES_API_KEY=sua_chave_api_aqui
MEMPOOL_API_KEY=sua_chave_mempool_aqui

# Configurações
CACHE_ENABLED=true
CACHE_TTL=300
```

## Modos de Execução

### Modo Desenvolvedor Padrão

Inicia o servidor de desenvolvimento com hot-reload:

```bash
npm run dev
```

### Modo Turbo (Alto Desempenho)

Inicia o servidor com otimizações para máximo desempenho (recomendado para sistemas com 8GB+ RAM e GPU):

```bash
npm run turbo-dev
```

O modo Turbo ativa:
- Maior alocação de memória para Node.js
- Compilação otimizada com Turbo
- Aceleração por GPU (quando disponível)
- Pré-carregamento de dados frequentes

### Executando com Scripts de Conveniência

#### Windows (PowerShell)

```powershell
.\start-project.ps1 -mode turbo
```

#### Windows (CMD)

```cmd
start-project.bat turbo
```

#### Linux/macOS

```bash
./start-project.sh turbo
```

## Estrutura do Projeto

```
runes-analytics-pro/
├── components/          # Componentes React reutilizáveis
├── pages/               # Páginas da aplicação
├── public/              # Arquivos estáticos
├── services/            # Serviços e integrações
│   ├── api/             # Gerenciamento de APIs
│   ├── cache/           # Sistema de cache
│   ├── db/              # Conexões com banco de dados
│   └── sharing/         # Sistema de compartilhamento
├── styles/              # CSS e Tailwind
├── utils/               # Funções utilitárias
├── scripts/             # Scripts de automação
└── docs/                # Documentação
```

## Ferramentas de Desenvolvimento Recomendadas

- **Visual Studio Code** com as extensões:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - GitHub Copilot (opcional)
  - Cursor AI (para assistência avançada no código)

- **Chrome DevTools** com a extensão React Developer Tools

## Dicas para Desenvolvedores

### Recursos Avançados do Cursor

O projeto está otimizado para trabalhar com o Cursor IDE. Para abrir o projeto no Cursor:

```bash
# PowerShell
.\start-cursor.ps1

# CMD
start-cursor.bat
```

### Console de Desenvolvedor

Todos os logs de desenvolvimento incluem cores e formatação para fácil leitura. Para ver logs específicos do sistema de API, você pode filtrar no console:

```javascript
// No console do navegador
console.filter('API Manager')
```

### Easter Eggs para Desenvolvedores

O projeto inclui alguns easter eggs interessantes para desenvolvedores:

- Pressione `Alt+R` para ativar um easter egg filosófico no console
- Pressione `Ctrl+Shift+S` para uma mensagem especial "à la Satoshi"
- Digite `runecardMode()` no console para habilitar o modo RuneCard

## Contribuindo para o Projeto

1. Crie um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/MinhaFeature`
3. Faça suas alterações com testes apropriados
4. Envie seu código: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

### Padrões de Código

- Utilize TypeScript sempre que possível
- Siga as convenções de nomeação existentes
- Escreva testes para novas funcionalidades
- Documente APIs e funções complexas
- Mantenha os componentes pequenos e focados

## Precisa de Ajuda?

- Confira a documentação em `/docs`
- Visite nosso [Discord](https://discord.gg/runesanalytics)
- Abra uma issue no GitHub

---

Desenvolvido com 💚 pela comunidade RUNES Analytics Pro
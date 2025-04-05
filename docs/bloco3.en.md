### 2. Integration with real apis

- ** API Management System **
- ** Automatic Fallback **

## Installation and configuration

### System Requirements

- ** node.js **: version 16.x or higher
- ** NPM **: Version 8.x or higher
- ** DISC SPACE **: minimum of 500MB for full installation
- ** RAM memory **: Recommended 4GB for better performance

### Technologies used

- ** Frontend **:
  - Next.js 13 (App Router)
  - React 18
  - Tailwind CSS
  - Chart.js for views
  - SWR for data fetching

- ** Backend **:
  - Node.js with Express
  - PostgreSQL for persistent data
  - Redis for high performance cache
  - Socket.io for real -time updates

- ** Devops **:
  - Docker and docker compose
  - Github Actions for CI/CD
  - Jest for automated tests

### Steps for installation

1. Clone the repository:```bash
git clone https://github.com/thierry-runes/runes-analytics-pro.git
cd runes-analytics-pro
```
2. Install the facilities:```bash
npm install
```
3. Set the environment variables:```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```
4. Configure the APIs that will be used:```bash
# Edite o arquivo config/api-config.js
```
5. Initialize the database:```bash
npm run db:setup
```
### Starting the project

For local development:```bash
npm run dev
```
For production environment:```bash
npm run build
npm start
```
Or use convenience scripts for Windows:```bash
# PowerShell
.\start-project.ps1

# CMD
start-project.bat
```
### Project structure```
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


📅 Última atualização: 05/04/2025 às 00:40
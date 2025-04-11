<!-- 
  RUNES Analytics Pro README
  Gerado automaticamente em: 2025-04-05 05:51:35
  Não edite este arquivo diretamente.
  Edite os blocos individuais em /docs/
-->

# 🔮 RUNES Analytics Pro

## 🔍 Overview
RUNES Analytics Pro is a modular, gamified analytics platform dedicated to Runes tokens on Bitcoin. The platform provides comprehensive tracking of whale movements, social sentiment analysis, real-time market insights, and quantum resonance visualization, all presented through cutting-edge interactive dashboards. Our solution bridges the gap between on-chain data and market psychology, offering traders and enthusiasts unprecedented visibility into the emerging Runes ecosystem.

## 🏗 Architecture
RUNES Analytics Pro follows a modular system architecture designed for scalability and performance:

- **ApiManager**: Core component that provides unified access to external APIs (Ordiscan, Magic Eden, OKX, GeniiData) with standardized error handling, rate limiting, and authentication
  
- **Data Services**: Intermediate layer responsible for data parsing, normalization across different sources, and transformation into consistent internal formats

- **Visualization Layer**: Collection of responsive dashboard components and canvas-based visualizations, including the innovative ResonanceRadar for quantum field analysis

- **Quantum Analysis Engine**: Cross-domain processing system that generates insights by correlating market data, social sentiment, and on-chain metrics

The platform implements an intelligent cache system with variable TTL (Time-To-Live) that adapts based on data volatility: 5 minutes for market rankings, 10 minutes for token details, and 3 minutes for transaction data. This strategy significantly reduces API calls, enhances user experience, and optimizes resource usage.

## 🎨 Design & UX
The platform features a distinctive Cyberpunk-inspired user interface:

- Rich, immersive dark themes dominated by cyan, neon green, and purple accents
- Technical, monospaced fonts (Share Tech Mono, Rajdhani) that enhance the digital aesthetic
- Interactive charts with responsive animations and hover effects
- Visual enhancements including subtle scanline effects, controlled glitch animations, and pulsing neon highlights for important data points
- Theme switcher offering four distinct visual experiences: Dark (default), Ocean, Light, and Cyberpunk

The UI is designed to be both visually engaging and functionally efficient, presenting complex data in an intuitive manner while maintaining the cyberpunk maritime aesthetic.

## 🔧 Features

### Market Analysis
- Comprehensive token rankings by marketcap, 24h volume, and price change
- Bitcoin correlation matrix showing relationship between BTC and Runes tokens
- Automatic trend detection with statistical significance indicators
- Technical indicators (RSI, MACD, Bollinger Bands) for selected tokens

### Whale Tracker
- Transaction heatmap using hexagonal grid representing liquidity pools and major wallets
- Accumulation/distribution visualization for top 5 whales per token
- Real-time whale movement alerts with confidence scoring
- Correlation widget comparing aggregate whale flow to token price movement

### Social Intelligence
- Cross-platform sentiment tracking with weighted scoring
- Telegram group monitoring through configurable adapter
- Narrative detection system identifying emerging themes and discussions
- Social volume metrics correlated with price action

### Quantum Resonance Analysis
- ResonanceRadar visualization showing 7 resonance centers (Creator, Community, Market, Narrative, Technology, Social, Temporal)
- Narrative vector visualization displaying emergent market forces
- Insight generation based on quantum field coherence patterns
- Ritual amplification process for enhancing signal quality

### Platform Integration
- Obsidian integration for vault-style documentation and analysis
- Support for DataView plugin queries against RUNES data
- Export capabilities to various formats (JSON, CSV, Markdown)
- Template system for standardized analysis documents

## 🧪 Technologies
- HTML5, CSS3, and JavaScript Vanilla for maximum performance
- Canvas API for complex interactive visualizations (ResonanceRadar, heatmaps)
- WebSocket connections for real-time data and REST APIs for historical data
- Modular architecture with ES6 imports/exports
- Local development environment using live-server
- Comprehensive translation system with i18n support via JSON locale files
- Seamless integration with Obsidian knowledge management system and DataView plugin
- Adaptive caching strategy with variable TTL based on data volatility

## 🚧 Current Status

### Complete Components
- ✅ Full dashboard UI with responsive design
- ✅ Quantum Radar (ResonanceRadar) visualization
- ✅ Insight Engine for cross-domain analysis
- ✅ Modular cache system with variable TTL
- ✅ Social adapters and sentiment analysis
- ✅ Mock API implementations for development
- ✅ Theme system with multiple options
- ✅ Whale tracking visualization components

### In Development
- 🔄 Complete external API integration (Magic Eden, OKX)
- 🔄 Real-time alert system with customizable parameters
- 🔄 Export system to knowledge vaults (Obsidian/JSON)
- 🔄 Implementation of quantum ritual amplification
- 🔄 Performance optimization for large datasets

## 💡 About the Creator

> My name is Thiérry, I'm an ophthalmologist from Brazil, father of two, passionate about Bitcoin and Runes.  
> I built this project from scratch with no prior experience in programming — just motivation, time, and the power of AI with Cursor.  
> This is a tribute to what's possible when curiosity meets purpose.  

---

*RUNES Analytics Pro - See what others cannot see*

📅 Last update: 2023-11-25

<!-- 
🕯️ "The blockchain is the body. The mempool is the breath. The signal is the soul.
When they align, patterns emerge — and the analyst becomes the oracle." 
— Fragment recovered from the Cypher Codex
-->

## MAIN IMPROVEMENTS

### 1. Redesigned interface

- ** Modern and intuitive design **: UI completely updated with Tailwind CSS and custom components
- ** customizable dashboard **: configurable widgets that allow the user to create their own analysis flow
- ** Responsive System **: Perfect adaptation for mobile devices, tablets and desktops
- ** Light/Dark theme **: Visual customization options for different preferences and environments

## Technical Architecture

### API Manager

The heart's heart is `Apimanager`, a robust architecture for API management:```javascript
// Arquitetura simplificada do ApiManager
class ApiManager {
  constructor(options) {
    this.services = [];
    this.cacheManager = new CacheManager();
    this.rateLimiters = {};
    this.fallbackStrategies = options.fallbackStrategies || 'sequential';
  }
  
  registerService(service) { /* Registra um novo serviço de API */ }
  orchestrateRequest(method, params) { /* Gerencia o fluxo de requisições */ }
  applyFallbackStrategy(method, params) { /* Implementa alternativas em caso de falha */ }
}
```
Main features:

- ** Dynamic Service Registration **: Addition and removal of data sources without system interruption
- ** Fallback strategies **: sequential, parallel or personalized for maximum availability
- ** Data validation **: Integrity verification of data received before processing
- ** automatic transformations **: normalization of data from different sources for a unified format

### Cache System

The cache layer is critical for performance optimization:```javascript
// Implementação simplificada do CacheManager
class CacheManager {
  constructor() {
    this.memoryCache = {};
    this.persistentCache = new PersistentStorage();
    this.strategies = {
      'tokens': { ttl: 300, invalidation: 'time-based' },
      'market': { ttl: 60, invalidation: 'time-based' },
      'whales': { ttl: 600, invalidation: 'event-based' }
    };
  }
  
  get(key, category) { /* Recupera dados do cache */ }
  set(key, data, category) { /* Armazena dados no cache */ }
  invalidate(pattern) { /* Invalida cache baseado em padrão */ }
}
```
Benefits implemented:

- ** multi-level cache **: Memory for frequent, persistent data for stable data
- ** Intelligent invalidation **: Time based or events to keep updated data
- ** Automatic compression **: Data size reduction to save resources
- ** Hit/Miss Statistics **: Monitoring for continuous optimization

### Gamification System

Gamification architecture is designed to maximize engagement:```javascript
// Estrutura do sistema de gamificação
class GamificationSystem {
  constructor(userId) {
    this.userId = userId;
    this.progressTracker = new ProgressTracker();
    this.rewardManager = new RewardManager();
    this.achievementRules = loadRulesFromDB();
  }
  
  trackActivity(activity, metadata) { /* Registra atividade do usuário */ }
  evaluateAchievements() { /* Verifica conquistas desbloqueadas */ }
  calculateLevel() { /* Determina nível atual do usuário */ }
  issueRewards(achievementId) { /* Concede recompensas */ }
}
```
Implemented features:

- ** Level System **: Progression based on use and discoveries on the platform
- ** Unlockable achievements **: rewards for specific actions and milestones
- ** Login Streak **: Bonuses by consistent use of the platform
- ** daily missions **: tasks that encourage the exploration of different features
- ** Classification Table **: Friendly competition between platform users

📅 Última atualização: 05/04/2025 às 00:40

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

### 3. Advanced Gamification System

- ** levels and achievements **
- ** Login Streak ** 

## Roadmap and Contributions

### next steps

The development of Runes Analytics Pro follows a strategic roadmap in four phases:

#### Phase 1: Consolidation (current)
- ✅ Reconstruction of APIS architecture
- ✅ Implementation of the cache system
- ✅ Interface redesign
- ✅ Sharing system via URLs and social cards
- ⏳ Native support for IPFs

#### Phase 2: Expansion (Q3 2023)
- ⏳ Public API with full documentation
- ⏳ Real -time notification system
- ⏳ Support for multiple wallets
- ⏳ Community area for analysts

#### Phase 3: Intelligence (Q4 2023)
- ⏳ Trends prediction algorithms
- ⏳ Advanced handling detection
- ⏳ reliability scoring system
- ⏳ Personalized insights by Ia

#### Phase 4: Ecosystem (Q1 2024)
- ⏳ SDK for developers
- ⏳ Marketplace of Strategy
- ⏳ Native mobile application
- ⏳ Integration with Defi

### How to contribute

Contributions are welcome! Follow the steps below to collaborate with the project:

1. Make a fork of the repository
2. Create a branch for your feature (`git checkout -b feature/myfeature`)
3. Implement your changes with appropriate tests
4. Make Commit of Changes (`Git Commit -m 'Add myfeature'`)
5. Send it to Branch (`Git push Origin Feature/MyFeature`)
6. Open a Pull Request

### Contribution Guidelines

- Follow the existing code standard
- Include tests for new features
- Update documentation when necessary
- Make sure all tests pass before submitting the PR
- Consult open issues before you start working on a new feature

### Reporting bugs

Found a bug? Please open an issue with the following information:

- Clear and concise description of the problem
- Steps to reproduce
- Expected vs. observed behavior
- Relevant screenshots or logs

## Visual Card Example

For more impactful visual communication, we have developed card templates for sharing on social networks:

![RUNES Analytics Pro Card](../images/card-runes.png)

*Note: Capture a screenshot of the card using DevTools in the browser (F12 > Select Element > Right click > Capture Node Screenshot) and save it in the images folder as card-runes.png*

## License

```
MIT License

Copyright (c) 2023 Thierry RUNES Analytics

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

📅 Last update: 04/05/2025 at 04:15

## RUNECARD System

The RUNECARD System is a complete module for creating, managing and sharing digital cards of RUNES tokens. With an elegant and immersive design, the cards present relevant information in a visually appealing format.

### Key Features

- **Visual Editor**: Create and edit RUNECARDs through a modern interface
- **Card Generation**: Generate new cards via command line or web interface
- **Animation System**: Cards feature dynamic animations that reflect their characteristics
- **Classification By Theme**: Automatic generation of abilities based on the card theme

### Usage

To create a new RUNECARD:

```bash
npm run runecard -- --title "Card Name" --ticker "TICKER" --inspiration "Inspirational theme"
```

To explore your cards visually, open `editor-lab.html` in your browser.

---

© 2025 RUNES Analytics Pro | Advanced Token Analysis Platform


<!-- 
  Última atualização: 2025-04-05 05:51:35
  Blocos processados: 5/5
-->
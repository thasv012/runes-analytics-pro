# Guia de Integração do Sistema de Compartilhamento - RUNES Analytics Pro

Este documento detalha como integrar completamente o sistema de compartilhamento na plataforma RUNES Analytics Pro.

## Visão Geral da Integração

O sistema de compartilhamento permite que os usuários:
- Compartilhem análises de tokens específicos
- Exportem dados para CSV/JSON
- Gerem cartões sociais para Twitter, Discord
- Criem URLs compartilháveis que preservam o estado da aplicação

## Componentes Necessários

Já foram criados os seguintes componentes:
- `services/sharing/SharingService.js` - Serviço base para compartilhamento
- `services/sharing/StateManager.js` - Gerenciador de estado da aplicação
- `components/ShareTools.js` - Componente UI base para compartilhamento
- `components/TokenShareTools.js` - Componente especializado para tokens
- `components/templates/token-twitter-template.html` - Template para cartões sociais

## Passos para Integração Completa

### 1. Página de Detalhes do Token

```javascript
// Em components/TokenDetails.js
import { TokenShareTools } from '../components/TokenShareTools.js';

class TokenDetails {
  constructor() {
    // Inicialização existente
    this.shareTools = null;
  }
  
  async initialize() {
    // Código existente de inicialização
    
    // Inicializar o componente de compartilhamento
    this.shareTools = new TokenShareTools('token-share-container');
    
    // Registrar no StateManager para permitir restauração de estado
    if (window.stateManager) {
      stateManager.registerComponent('token', this);
    }
  }
  
  // Implementar método navegateToToken para StateManager
  navigateToToken(tokenName, period = '30d') {
    // Carregar dados do token
    this.loadTokenDetails(tokenName);
    // Configurar período
    this.selectPeriod(period);
    return Promise.resolve(true);
  }
  
  // Atualizar quando os dados do token são carregados
  onTokenDataLoaded(tokenName, tokenData, period) {
    // Atualizar UI com os dados
    // ...código existente...
    
    // Atualizar ferramentas de compartilhamento
    if (this.shareTools) {
      this.shareTools.setTokenData(tokenName, tokenData, period);
    }
  }
}
```

### 2. Dashboard Principal

```javascript
// Em components/Dashboard.js
import { ShareTools } from '../components/ShareTools.js';

class Dashboard {
  constructor() {
    // Código existente
    this.shareTools = null;
  }
  
  initialize() {
    // Código existente
    
    // Configurar compartilhamento
    this.shareTools = new ShareTools('dashboard-share-container', {
      enableShareUrls: true,
      enableSocialCards: true,
      enableExport: true,
      defaultFileName: 'runes-dashboard-export',
      supportedPlatforms: ['twitter', 'discord']
    });
    
    // Atualizar estado compartilhável quando filtros mudam
    this.setupFilterListeners();
    
    // Registrar no StateManager
    if (window.stateManager) {
      stateManager.registerComponent('dashboard', this);
    }
  }
  
  // Implementar para StateManager
  navigateToDashboard(filters = {}) {
    this.applyFilters(filters);
    return Promise.resolve(true);
  }
  
  // Quando filtros mudam, atualizar estado compartilhável
  onFiltersChanged(filters) {
    if (this.shareTools) {
      this.shareTools.setState({
        viewType: 'dashboard',
        filters: filters
      });
    }
  }
}
```

### 3. Tracker de Baleias (Whale Tracker)

```javascript
// Em components/WhaleTracker.js
import { ShareTools } from '../components/ShareTools.js';

class WhaleTracker {
  initialize() {
    // Código existente
    
    // Botão para compartilhar transação específica
    document.querySelectorAll('.whale-transaction').forEach(tx => {
      const shareBtn = tx.querySelector('.share-tx-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          const txData = JSON.parse(tx.dataset.transaction);
          this.shareTransaction(txData);
        });
      }
    });
    
    // Registrar no StateManager
    if (window.stateManager) {
      stateManager.registerComponent('whaleTracker', this);
    }
  }
  
  // Compartilhar transação específica
  shareTransaction(txData) {
    const txShareTools = new ShareTools('tx-share-modal-container', {
      enableShareUrls: true,
      enableSocialCards: true,
      defaultFileName: `tx-${txData.txid.substring(0, 8)}`
    });
    
    txShareTools.setState({
      viewType: 'transaction',
      txid: txData.txid,
      data: txData
    });
    
    // Abrir modal
    this.openShareModal();
  }
  
  // Implementar para StateManager
  navigateToTransaction(txid) {
    this.loadTransactionDetails(txid);
    return Promise.resolve(true);
  }
}
```

### 4. Inicialização Global

```javascript
// Em app.js ou main.js
import { SharingService } from './services/sharing/SharingService.js';
import { StateManager } from './services/sharing/StateManager.js';

// Inicializar serviços
const sharingService = new SharingService({
  appName: 'RUNES Analytics Pro',
  appUrl: 'https://runesanalytics.pro',
  logoUrl: '/assets/logo.png',
  socialTemplatesPath: '/components/templates/',
  shortUrlService: 'https://api.runesanalytics.pro/short-url'
});

// Configurar como global
window.sharingService = sharingService;

// Inicializar gerenciador de estado
const stateManager = new StateManager();
window.stateManager = stateManager;

// Inicializar depois que DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se há estado para restaurar (de URL compartilhada)
  stateManager.checkForSharedState();
});
```

### 5. Integração com Notificações e Animações

```javascript
// Em services/sharing/SharingService.js (adicionar este método)

/**
 * Configura integração com o sistema de animações
 * @param {Object} animationsService - Referência ao serviço RunesAnimations
 */
setupAnimationsIntegration(animationsService) {
  this.animations = animationsService;
  
  // Usar para feedback visual durante operações
  this.onStatusChange = (status, message) => {
    if (this.animations) {
      if (status === 'generating') {
        this.animations.showNotification({
          type: 'info',
          title: 'Gerando cartão social',
          message: 'Aguarde enquanto preparamos seu cartão...'
        });
      } else if (status === 'success') {
        this.animations.showNotification({
          type: 'success',
          title: 'Compartilhamento pronto',
          message: message || 'Seu conteúdo está pronto para compartilhar!'
        });
      } else if (status === 'error') {
        this.animations.showNotification({
          type: 'error',
          title: 'Erro no compartilhamento',
          message: message || 'Não foi possível completar a operação'
        });
      }
    }
  };
}
```

## Casos de Uso e Exemplos

### Compartilhar Token Específico

```javascript
// Exemplo com token ORDIBITS
const tokenData = {
  name: 'ORDIBITS',
  supply: '21000000',
  holders: '1823',
  transactions: '12734',
  price: '0.00025',
  volume: '5.2',
  marketCap: '5250',
  creationDate: '2023-01-05'
};

// Criar e configurar componente
const tokenShare = new TokenShareTools('share-container');
tokenShare.setTokenData('ORDIBITS', tokenData, '30d');

// A UI de compartilhamento será renderizada no elemento com id 'share-container'
```

### Exportar Dados da Tabela

```javascript
// Para exportar dados de uma tabela (exemplo: lista de tokens)
const tableData = [
  {name: 'ORDIBITS', supply: '21000000', holders: '1823', price: '0.00025'},
  {name: 'MEME', supply: '1000000', holders: '952', price: '0.00015'},
  // ...mais dados
];

const shareTools = new ShareTools('export-container', {
  enableExport: true,
  enableShareUrls: false,
  enableSocialCards: false,
  defaultFileName: 'runes-list',
  exportFormats: ['csv', 'json']
});

shareTools.setExportData(tableData);
```

### Compartilhar Estado da Aplicação

```javascript
// Compartilhar estado atual dos filtros e visualizações
const currentFilters = {
  dateRange: {start: '2023-01-01', end: '2023-06-30'},
  priceRange: {min: 0.0001, max: 0.001},
  sortBy: 'marketCap',
  sortDirection: 'desc'
};

shareTools.setState({
  viewType: 'explorer',
  filters: currentFilters,
  currentPage: 2
});

// Isso permitirá gerar URLs que restaurarão esse estado exato
```

## Verificação de Implementação

Após implementar o sistema, verifique se:

1. Os botões de compartilhamento aparecem nos locais adequados
2. As URLs compartilháveis restauram corretamente o estado da aplicação
3. Os cartões sociais são gerados com os dados corretos
4. A exportação de dados funciona em todos os formatos
5. O sistema lida corretamente com erros (como falha na geração do cartão)

## Próximos Passos

Após a implementação básica, considere estas melhorias:

1. Adicionar mais templates para diferentes plataformas
2. Implementar análise de compartilhamento (tracking)
3. Adicionar suporte a mais formatos de exportação
4. Personalização de cartões sociais pelo usuário
5. Preview de cartões sociais antes do compartilhamento 

📅 Última atualização: 05/04/2025 às 00:40
# Dashboard Analítico para Tokens Runes

Um dashboard interativo e moderno para visualização e análise de dados sobre tokens Runes no Bitcoin.

## Visão Geral

O Dashboard Analítico para Tokens Runes oferece uma interface completa para acompanhar o mercado de tokens Runes, com visualizações de dados em tempo real, gráficos interativos e ferramentas de análise avançada.

A interface segue um design cyberpunk com elementos neon, oferecendo uma experiência visual moderna e agradável para os usuários que acompanham o mercado de tokens no ecossistema Runes.

## Componentes Principais

O dashboard é composto pelos seguintes componentes principais:

### RunesDashboard

Componente principal que gerencia todos os widgets e coordena a exibição de dados. Responsável por:

- Inicializar todos os componentes filhos
- Gerenciar o estado global do dashboard (timeframe, filtros, etc.)
- Coordenar atualizações de dados
- Manipular interações entre componentes

### RunesMarketOverview

Widget que exibe uma visão geral do mercado de Runes, incluindo:

- Capitalização de mercado total
- Volume de negociação em 24h
- Quantidade de tokens ativos
- Total de holders
- Tendência do mercado nas últimas 24 horas
- Tokens com melhor e pior desempenho

### RunesTopTokens

Widget que apresenta uma tabela classificável com os principais tokens Runes, incluindo:

- Nome e símbolo do token
- Preço atual
- Variação de preço em 24h
- Capitalização de mercado
- Volume de negociação
- Número de holders

A tabela suporta classificação por qualquer coluna, pesquisa de tokens e paginação.

### RunesPriceChart

Widget de gráfico de preços que exibe a evolução do preço de um token selecionado ao longo do tempo:

- Suporta múltiplos timeframes (1h, 24h, 7d, 30d, máximo)
- Tipos de gráficos (linha, candlestick)
- Exibição de volume
- Estatísticas de preço (máximo, mínimo, variação)

## Instalação e Configuração

### Dependências

- Chart.js: Biblioteca utilizada para renderização de gráficos
- Font Awesome: Para ícones da interface
- Fonte Roboto: Para tipografia consistente

### Arquivos do Dashboard

```
js/dashboard/
  ├── RunesDashboard.js       # Componente principal
  ├── RunesMarketOverview.js  # Widget de visão geral
  ├── RunesTopTokens.js       # Widget de lista de tokens
  ├── RunesPriceChart.js      # Widget de gráfico de preços
  └── README.md               # Esta documentação
  
css/dashboard/
  └── dashboard.css           # Estilos do dashboard
```

### Instalação

1. Inclua os arquivos JS e CSS em sua página:

```html
<!-- Estilos CSS -->
<link rel="stylesheet" href="css/dashboard/dashboard.css">

<!-- Scripts do Dashboard -->
<script src="js/dashboard/RunesMarketOverview.js"></script>
<script src="js/dashboard/RunesTopTokens.js"></script>
<script src="js/dashboard/RunesPriceChart.js"></script>
<script src="js/dashboard/RunesDashboard.js"></script>
```

2. Adicione um container para o dashboard em seu HTML:

```html
<div id="dashboard-container"></div>
```

3. Inicialize o dashboard:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const dashboard = new RunesDashboard({
        container: 'dashboard-container',
        darkMode: true,
        refreshInterval: 60000, // 1 minuto
        maxTokens: 50,
        defaultTimeframe: '24h'
    });
    
    dashboard.init();
});
```

## Opções de Configuração

O dashboard aceita as seguintes opções de configuração:

### RunesDashboard

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| container | string | 'dashboard-content' | ID do elemento HTML que conterá o dashboard |
| darkMode | boolean | false | Ativa/desativa o tema escuro |
| refreshInterval | number | 60000 | Intervalo de atualização automática dos dados em milissegundos |
| maxTokens | number | 100 | Número máximo de tokens a serem exibidos na lista de tokens |
| defaultTimeframe | string | '24h' | Timeframe padrão para gráficos ('1h', '24h', '7d', '30d', 'all') |
| layout | string | 'grid' | Layout do dashboard ('grid' ou 'list') |
| animations | boolean | true | Ativa/desativa animações |
| autoRefresh | boolean | true | Ativa/desativa atualização automática de dados |
| showFilters | boolean | true | Ativa/desativa a exibição da seção de filtros |

## Eventos

O dashboard emite vários eventos que podem ser utilizados para integrar com outros componentes da aplicação:

```javascript
// Exemplo de uso de eventos
dashboard.on('runeSelected', (data) => {
    console.log(`Token selecionado: ${data.ticker}`);
});

dashboard.on('dataRefreshed', (data) => {
    console.log('Dados atualizados');
});
```

### Eventos disponíveis:

- `dashboardReady`: Emitido quando o dashboard termina de inicializar
- `dataLoaded`: Emitido quando os dados iniciais são carregados
- `dataRefreshed`: Emitido quando os dados são atualizados
- `runeSelected`: Emitido quando um token é selecionado
- `timeframeChanged`: Emitido quando o timeframe é alterado
- `filtersApplied`: Emitido quando filtros são aplicados
- `filtersToggled`: Emitido quando a seção de filtros é mostrada/ocultada
- `layoutChanged`: Emitido quando o layout é alterado

## Integração com APIs

O dashboard foi projetado para trabalhar com o serviço `RunesDataService`, que gerencia a comunicação com APIs externas e obtenção de dados. Este serviço deve fornecer os seguintes métodos:

- `getRunesRanking()`: Lista de tokens ordenados por capitalização de mercado
- `getRuneDetails(ticker)`: Detalhes de um token específico
- `getRunesStats()`: Estatísticas gerais do mercado
- `getRecentTransactions(limit)`: Transações recentes

## Personalização

### Temas

O dashboard suporta um tema claro e um tema escuro, controlado pela opção `darkMode`. Os estilos estão definidos com variáveis CSS em `dashboard.css`, o que facilita a personalização das cores e outros aspectos visuais.

### Estendendo o Dashboard

Para adicionar novos widgets ao dashboard, siga estes passos:

1. Crie um novo arquivo JS para seu widget
2. Implemente as funções padrão: `init()`, `updateData()` e `destroy()`
3. Adicione seu widget no método `loadComponents()` do `RunesDashboard.js`

## Exemplo de Uso Avançado

```javascript
// Inicializar o dashboard com configurações personalizadas
const dashboard = new RunesDashboard({
    container: 'dashboard-container',
    darkMode: true,
    refreshInterval: 30000, // Atualizar a cada 30 segundos
    maxTokens: 100,
    defaultTimeframe: '7d',
    layout: 'grid',
    animations: true,
    autoRefresh: true,
    showFilters: true
});

// Inicializar
dashboard.init().then(success => {
    if (success) {
        console.log('Dashboard inicializado com sucesso!');
        
        // Registrar listeners para eventos
        dashboard.on('runeSelected', (data) => {
            console.log(`Token selecionado: ${data.ticker}`, data.details);
            
            // Integração com outros componentes da aplicação
            if (window.runesAnalytics) {
                window.runesAnalytics.analyzeToken(data.ticker);
            }
        });
        
        dashboard.on('dataRefreshed', (data) => {
            // Atualizar outros componentes da página
            updatePageMetrics(data);
        });
    }
});

// Função para atualização manual
function refreshDashboardData() {
    if (dashboard) {
        dashboard.refreshData();
    }
}

// Função para mudar tema
function toggleDarkMode() {
    const container = document.getElementById('dashboard-container');
    container.classList.toggle('dark-mode');
}
```

## Navegadores Suportados

O dashboard é compatível com os seguintes navegadores:

- Chrome (versão 70+)
- Firefox (versão 65+)
- Safari (versão 12+)
- Edge (versão 79+)

## Licença

Este dashboard é parte do projeto RUNES Analytics Pro e está disponível sob os termos da licença MIT.

---

Desenvolvido por Thierry para RUNES Analytics Pro. 
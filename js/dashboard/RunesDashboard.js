// RunesDashboard.js - Componente principal do dashboard analítico de Runes
// Responsável por organizar os widgets e coordenar a exibição de dados

class RunesDashboard {
    constructor(options = {}) {
        // Opções do dashboard
        this.options = {
            container: options.container || 'dashboard-content',
            darkMode: options.darkMode || false,
            refreshInterval: options.refreshInterval || 60000, // 1 minuto
            maxTokens: options.maxTokens || 100,
            defaultTimeframe: options.defaultTimeframe || '24h',
            layout: options.layout || 'grid', // grid ou list
            animations: options.animations !== false,
            autoRefresh: options.autoRefresh !== false,
            showFilters: options.showFilters !== false
        };
        
        // Estado do dashboard
        this.state = {
            isLoading: true,
            currentTimeframe: this.options.defaultTimeframe,
            selectedRune: null,
            filters: {
                minMarketCap: 0,
                maxTokenAge: null,
                category: 'all',
                sortBy: 'marketCap',
                sortOrder: 'desc',
                searchQuery: ''
            },
            visibleWidgets: [
                'marketOverview', 
                'topTokens', 
                'priceChart',
                'volumeChart',
                'recentTransactions',
                'tokenDistribution'
            ]
        };
        
        // Referências aos componentes filhos
        this.components = {
            marketOverview: null,
            topTokens: null,
            priceChart: null,
            volumeChart: null,
            recentTransactions: null,
            tokenDistribution: null,
            filters: null
        };
        
        // Referência ao serviço de dados
        this.dataService = window.runesDataService;
        
        // Timer para atualização automática
        this.refreshTimer = null;
        
        // Callbacks de eventos
        this.eventHandlers = {};
        
        console.log('RunesDashboard inicializado com as opções:', this.options);
    }
    
    // Inicializar o dashboard
    async init() {
        console.log('Inicializando dashboard Runes...');
        
        // Verificar se o conteiner existe
        const container = document.getElementById(this.options.container);
        if (!container) {
            console.error(`Container '${this.options.container}' não encontrado!`);
            return false;
        }
        
        // Verificar se o serviço de dados está disponível
        if (!this.dataService) {
            console.warn('RunesDataService não encontrado. Tentando carregar...');
            
            // Tentar carregar o serviço de dados
            if (typeof RunesDataService !== 'undefined') {
                this.dataService = new RunesDataService();
                this.dataService.init();
            } else {
                console.error('RunesDataService não está disponível. O dashboard não poderá exibir dados reais.');
                return false;
            }
        }
        
        // Renderizar a estrutura base do dashboard
        this.renderDashboardStructure();
        
        // Inicializar componentes
        await this.initComponents();
        
        // Carregar dados iniciais
        await this.loadInitialData();
        
        // Configurar atualização automática
        if (this.options.autoRefresh) {
            this.setupAutoRefresh();
        }
        
        // Atualizar estado de carregamento
        this.state.isLoading = false;
        this.updateLoadingState();
        
        // Configurar manipuladores de eventos
        this.setupEventListeners();
        
        // Notificar inicialização completa
        this.notifyEvent('dashboardReady', { dashboard: this });
        
        console.log('✅ Dashboard Runes inicializado com sucesso!');
        return true;
    }
    
    // Renderizar a estrutura base do dashboard
    renderDashboardStructure() {
        const container = document.getElementById(this.options.container);
        container.innerHTML = '';
        container.classList.add('runes-dashboard');
        
        if (this.options.darkMode) {
            container.classList.add('dark-mode');
        }
        
        // Estrutura HTML do dashboard
        container.innerHTML = `
            <div class="dashboard-header">
                <h2>Dashboard Runes</h2>
                <div class="dashboard-controls">
                    <div class="timeframe-selector">
                        <button data-timeframe="1h" class="timeframe-btn">1H</button>
                        <button data-timeframe="24h" class="timeframe-btn active">24H</button>
                        <button data-timeframe="7d" class="timeframe-btn">7D</button>
                        <button data-timeframe="30d" class="timeframe-btn">30D</button>
                        <button data-timeframe="all" class="timeframe-btn">ALL</button>
                    </div>
                    <div class="dashboard-actions">
                        <button id="refresh-dashboard" class="action-btn"><i class="fa fa-refresh"></i></button>
                        <button id="toggle-filters" class="action-btn"><i class="fa fa-filter"></i></button>
                        <button id="toggle-layout" class="action-btn"><i class="fa fa-th-large"></i></button>
                    </div>
                </div>
            </div>
            
            <div id="dashboard-filters" class="dashboard-filters" style="${this.options.showFilters ? '' : 'display: none;'}">
                <!-- Área de filtros preenchida dinamicamente -->
            </div>
            
            <div class="dashboard-content">
                <div class="widget-row market-overview-row">
                    <div id="market-overview-widget" class="dashboard-widget"></div>
                </div>
                
                <div class="widget-row main-charts-row">
                    <div id="price-chart-widget" class="dashboard-widget"></div>
                    <div id="volume-chart-widget" class="dashboard-widget"></div>
                </div>
                
                <div class="widget-row data-row">
                    <div id="top-tokens-widget" class="dashboard-widget"></div>
                    <div id="token-distribution-widget" class="dashboard-widget"></div>
                </div>
                
                <div class="widget-row bottom-row">
                    <div id="recent-transactions-widget" class="dashboard-widget"></div>
                </div>
            </div>
            
            <div id="dashboard-loading" class="dashboard-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Carregando dados Runes...</div>
            </div>
        `;
        
        console.log('Estrutura base do dashboard renderizada');
    }
    
    // Inicializar todos os componentes do dashboard
    async initComponents() {
        console.log('Inicializando componentes do dashboard...');
        
        try {
            // Carregar e inicializar cada componente do dashboard
            await this.loadComponents();
            
            // Inicializar filtros
            this.initFilters();
            
            console.log('Todos os componentes do dashboard inicializados');
            return true;
        } catch (error) {
            console.error('Erro ao inicializar componentes do dashboard:', error);
            return false;
        }
    }
    
    // Carregar os componentes do dashboard
    async loadComponents() {
        // Importar e instanciar componentes
        try {
            // Market Overview
            const MarketOverview = await this.importComponent('RunesMarketOverview');
            this.components.marketOverview = new MarketOverview({
                container: 'market-overview-widget',
                darkMode: this.options.darkMode
            });
            await this.components.marketOverview.init();
            
            // Top Tokens
            const TopTokens = await this.importComponent('RunesTopTokens');
            this.components.topTokens = new TopTokens({
                container: 'top-tokens-widget',
                darkMode: this.options.darkMode,
                maxTokens: this.options.maxTokens
            });
            await this.components.topTokens.init();
            
            // Price Chart
            const PriceChart = await this.importComponent('RunesPriceChart');
            this.components.priceChart = new PriceChart({
                container: 'price-chart-widget',
                darkMode: this.options.darkMode,
                timeframe: this.state.currentTimeframe
            });
            await this.components.priceChart.init();
            
            // Volume Chart
            const VolumeChart = await this.importComponent('RunesVolumeChart');
            this.components.volumeChart = new VolumeChart({
                container: 'volume-chart-widget',
                darkMode: this.options.darkMode,
                timeframe: this.state.currentTimeframe
            });
            await this.components.volumeChart.init();
            
            // Recent Transactions
            const RecentTransactions = await this.importComponent('RunesRecentTransactions');
            this.components.recentTransactions = new RecentTransactions({
                container: 'recent-transactions-widget',
                darkMode: this.options.darkMode,
                maxTransactions: 10
            });
            await this.components.recentTransactions.init();
            
            // Token Distribution
            const TokenDistribution = await this.importComponent('RunesTokenDistribution');
            this.components.tokenDistribution = new TokenDistribution({
                container: 'token-distribution-widget',
                darkMode: this.options.darkMode
            });
            await this.components.tokenDistribution.init();
            
            console.log('Componentes do dashboard carregados com sucesso');
        } catch (error) {
            console.error('Erro ao carregar componentes do dashboard:', error);
            throw error;
        }
    }
    
    // Importar um componente dinamicamente
    async importComponent(componentName) {
        console.log(`Importando componente: ${componentName}`);
        
        // Verificar se o componente já está disponível globalmente
        if (window[componentName]) {
            console.log(`Componente ${componentName} encontrado globalmente`);
            return window[componentName];
        }
        
        try {
            // Tentar importar o componente da pasta do dashboard
            const script = document.createElement('script');
            script.src = `js/dashboard/${componentName}.js`;
            
            // Criar uma promessa para esperar o carregamento do script
            const loadPromise = new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log(`Script ${componentName} carregado com sucesso`);
                    
                    // Verificar se o componente está disponível após o carregamento
                    if (window[componentName]) {
                        resolve(window[componentName]);
                    } else {
                        reject(new Error(`Componente ${componentName} não encontrado após carregar o script`));
                    }
                };
                
                script.onerror = () => {
                    reject(new Error(`Falha ao carregar o script ${componentName}`));
                };
            });
            
            // Adicionar o script ao documento
            document.head.appendChild(script);
            
            // Esperar o carregamento
            return await loadPromise;
        } catch (error) {
            console.error(`Erro ao importar componente ${componentName}:`, error);
            throw error;
        }
    }
    
    // Inicializar a área de filtros
    initFilters() {
        const filtersContainer = document.getElementById('dashboard-filters');
        if (!filtersContainer) return;
        
        filtersContainer.innerHTML = `
            <div class="filter-row">
                <div class="filter-group">
                    <label for="search-runes">Buscar Runes:</label>
                    <input type="text" id="search-runes" placeholder="Nome ou ticker...">
                </div>
                
                <div class="filter-group">
                    <label for="sort-by">Ordenar por:</label>
                    <select id="sort-by">
                        <option value="marketCap">Cap. de Mercado</option>
                        <option value="price">Preço</option>
                        <option value="volume24h">Volume 24h</option>
                        <option value="priceChange24h">Variação 24h</option>
                        <option value="holders">Holders</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="sort-order">Ordem:</label>
                    <select id="sort-order">
                        <option value="desc">Descendente</option>
                        <option value="asc">Ascendente</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="filter-category">Categoria:</label>
                    <select id="filter-category">
                        <option value="all">Todas</option>
                        <option value="meme">Meme</option>
                        <option value="defi">DeFi</option>
                        <option value="nft">NFT</option>
                        <option value="gaming">Gaming</option>
                        <option value="other">Outras</option>
                    </select>
                </div>
                
                <div class="filter-action">
                    <button id="apply-filters" class="btn-apply-filters">Aplicar Filtros</button>
                </div>
            </div>
        `;
        
        // Adicionar event listeners para os filtros
        document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
        document.getElementById('search-runes').addEventListener('input', (e) => {
            this.state.filters.searchQuery = e.target.value;
        });
        
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.state.filters.sortBy = e.target.value;
        });
        
        document.getElementById('sort-order').addEventListener('change', (e) => {
            this.state.filters.sortOrder = e.target.value;
        });
        
        document.getElementById('filter-category').addEventListener('change', (e) => {
            this.state.filters.category = e.target.value;
        });
        
        console.log('Filtros do dashboard inicializados');
    }
    
    // Aplicar filtros aos dados
    applyFilters() {
        console.log('Aplicando filtros:', this.state.filters);
        
        // Notificar todos os componentes sobre a mudança nos filtros
        Object.values(this.components).forEach(component => {
            if (component && typeof component.applyFilters === 'function') {
                component.applyFilters(this.state.filters);
            }
        });
        
        // Notificar evento de filtros aplicados
        this.notifyEvent('filtersApplied', { filters: this.state.filters });
    }
    
    // Carregar dados iniciais para o dashboard
    async loadInitialData() {
        console.log('Carregando dados iniciais para o dashboard...');
        
        try {
            // Obter dados do mercado
            const marketData = await this.dataService.getRunesStats();
            
            // Obter ranking de tokens
            const tokensRanking = await this.dataService.getRunesRanking();
            
            // Obter transações recentes
            const recentTransactions = await this.dataService.getRecentTransactions(10);
            
            // Atualizar componentes com os dados
            if (this.components.marketOverview) {
                this.components.marketOverview.updateData(marketData);
            }
            
            if (this.components.topTokens) {
                this.components.topTokens.updateData(tokensRanking);
            }
            
            if (this.components.recentTransactions) {
                this.components.recentTransactions.updateData(recentTransactions);
            }
            
            if (this.components.tokenDistribution) {
                this.components.tokenDistribution.updateData(tokensRanking);
            }
            
            // Se houver tokens, selecionar o primeiro por padrão para os gráficos
            if (tokensRanking && tokensRanking.length > 0) {
                this.selectRune(tokensRanking[0].ticker);
            }
            
            console.log('Dados iniciais carregados com sucesso');
            
            // Notificar evento de dados carregados
            this.notifyEvent('dataLoaded', { 
                marketData, 
                tokensRanking,
                recentTransactions 
            });
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.showError('Falha ao carregar dados. Tente novamente mais tarde.');
        }
    }
    
    // Selecionar um token Rune específico
    selectRune(ticker) {
        console.log(`Selecionando token Rune: ${ticker}`);
        
        // Atualizar estado
        this.state.selectedRune = ticker;
        
        // Carregar detalhes do token selecionado
        this.dataService.getRuneDetails(ticker)
            .then(runeDetails => {
                // Atualizar gráficos com dados do token selecionado
                if (this.components.priceChart) {
                    this.components.priceChart.updateData(runeDetails, this.state.currentTimeframe);
                }
                
                if (this.components.volumeChart) {
                    this.components.volumeChart.updateData(runeDetails, this.state.currentTimeframe);
                }
                
                // Notificar evento de seleção de token
                this.notifyEvent('runeSelected', { 
                    ticker, 
                    details: runeDetails 
                });
            })
            .catch(error => {
                console.error(`Erro ao carregar detalhes do token ${ticker}:`, error);
                this.showError(`Não foi possível carregar dados para ${ticker}`);
            });
    }
    
    // Mudar o timeframe dos gráficos
    changeTimeframe(timeframe) {
        console.log(`Mudando timeframe para: ${timeframe}`);
        
        // Atualizar estado
        this.state.currentTimeframe = timeframe;
        
        // Atualizar UI
        const buttons = document.querySelectorAll('.timeframe-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.timeframe === timeframe) {
                btn.classList.add('active');
            }
        });
        
        // Recarregar dados dos gráficos se houver um token selecionado
        if (this.state.selectedRune) {
            this.selectRune(this.state.selectedRune);
        }
        
        // Notificar evento de mudança de timeframe
        this.notifyEvent('timeframeChanged', { timeframe });
    }
    
    // Configurar atualização automática de dados
    setupAutoRefresh() {
        // Limpar timer anterior se existir
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // Configurar novo timer
        this.refreshTimer = setInterval(() => {
            this.refreshData();
        }, this.options.refreshInterval);
        
        console.log(`Auto-refresh configurado a cada ${this.options.refreshInterval / 1000} segundos`);
    }
    
    // Atualizar dados do dashboard
    refreshData() {
        console.log('Atualizando dados do dashboard...');
        
        // Mostrar indicador de carregamento para atualização
        const refreshButton = document.getElementById('refresh-dashboard');
        if (refreshButton) {
            refreshButton.classList.add('rotating');
        }
        
        // Recarregar dados
        Promise.all([
            this.dataService.getRunesStats(),
            this.dataService.getRunesRanking(),
            this.dataService.getRecentTransactions(10)
        ])
        .then(([marketData, tokensRanking, recentTransactions]) => {
            // Atualizar componentes
            if (this.components.marketOverview) {
                this.components.marketOverview.updateData(marketData);
            }
            
            if (this.components.topTokens) {
                this.components.topTokens.updateData(tokensRanking);
            }
            
            if (this.components.recentTransactions) {
                this.components.recentTransactions.updateData(recentTransactions);
            }
            
            if (this.components.tokenDistribution) {
                this.components.tokenDistribution.updateData(tokensRanking);
            }
            
            // Se o token selecionado ainda existir, atualizá-lo
            if (this.state.selectedRune) {
                const selectedExists = tokensRanking.some(token => token.ticker === this.state.selectedRune);
                if (selectedExists) {
                    this.selectRune(this.state.selectedRune);
                } else if (tokensRanking.length > 0) {
                    // Se não existir mais, selecionar o primeiro
                    this.selectRune(tokensRanking[0].ticker);
                }
            }
            
            // Notificar evento de atualização de dados
            this.notifyEvent('dataRefreshed', { 
                marketData, 
                tokensRanking,
                recentTransactions 
            });
            
            console.log('Dados do dashboard atualizados com sucesso');
        })
        .catch(error => {
            console.error('Erro ao atualizar dados:', error);
            this.showError('Falha ao atualizar dados');
        })
        .finally(() => {
            // Remover indicador de carregamento
            if (refreshButton) {
                refreshButton.classList.remove('rotating');
            }
        });
    }
    
    // Configurar listeners de eventos
    setupEventListeners() {
        // Botões de timeframe
        const timeframeButtons = document.querySelectorAll('.timeframe-btn');
        timeframeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const timeframe = e.target.dataset.timeframe;
                this.changeTimeframe(timeframe);
            });
        });
        
        // Botão de atualização
        const refreshButton = document.getElementById('refresh-dashboard');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refreshData());
        }
        
        // Botão de toggle de filtros
        const toggleFiltersButton = document.getElementById('toggle-filters');
        if (toggleFiltersButton) {
            toggleFiltersButton.addEventListener('click', () => this.toggleFilters());
        }
        
        // Botão de toggle de layout
        const toggleLayoutButton = document.getElementById('toggle-layout');
        if (toggleLayoutButton) {
            toggleLayoutButton.addEventListener('click', () => this.toggleLayout());
        }
        
        // Adicionar listener para seleção de token do componente TopTokens
        if (this.components.topTokens) {
            this.components.topTokens.onTokenSelect((ticker) => {
                this.selectRune(ticker);
            });
        }
        
        console.log('Event listeners do dashboard configurados');
    }
    
    // Alternar exibição dos filtros
    toggleFilters() {
        const filtersContainer = document.getElementById('dashboard-filters');
        if (filtersContainer) {
            if (filtersContainer.style.display === 'none') {
                filtersContainer.style.display = 'block';
            } else {
                filtersContainer.style.display = 'none';
            }
            
            // Notificar evento de toggle de filtros
            this.notifyEvent('filtersToggled', { 
                visible: filtersContainer.style.display !== 'none' 
            });
        }
    }
    
    // Alternar entre layouts grid e lista
    toggleLayout() {
        const container = document.getElementById(this.options.container);
        if (container) {
            if (this.options.layout === 'grid') {
                container.classList.remove('grid-layout');
                container.classList.add('list-layout');
                this.options.layout = 'list';
            } else {
                container.classList.remove('list-layout');
                container.classList.add('grid-layout');
                this.options.layout = 'grid';
            }
            
            // Notificar evento de mudança de layout
            this.notifyEvent('layoutChanged', { layout: this.options.layout });
        }
    }
    
    // Atualizar estado de carregamento na UI
    updateLoadingState() {
        const loadingElement = document.getElementById('dashboard-loading');
        if (loadingElement) {
            if (this.state.isLoading) {
                loadingElement.style.display = 'flex';
            } else {
                loadingElement.style.display = 'none';
            }
        }
    }
    
    // Exibir mensagem de erro
    showError(message) {
        console.error('Erro no dashboard:', message);
        
        // Verificar se já existe uma mensagem de erro
        let errorElement = document.querySelector('.dashboard-error');
        
        if (!errorElement) {
            // Criar elemento de erro
            errorElement = document.createElement('div');
            errorElement.className = 'dashboard-error';
            
            // Adicionar ao container
            const container = document.getElementById(this.options.container);
            if (container) {
                container.appendChild(errorElement);
            }
        }
        
        // Atualizar mensagem
        errorElement.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-message">${message}</div>
            <button class="error-close">×</button>
        `;
        
        // Mostrar com animação
        errorElement.style.display = 'flex';
        
        // Adicionar event listener para fechar
        const closeButton = errorElement.querySelector('.error-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                errorElement.style.display = 'none';
            });
        }
        
        // Auto-ocultar após 5 segundos
        setTimeout(() => {
            if (errorElement.style.display !== 'none') {
                errorElement.style.display = 'none';
            }
        }, 5000);
    }
    
    // Adicionar um listener para um evento
    on(eventName, callback) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        
        this.eventHandlers[eventName].push(callback);
        return this;
    }
    
    // Notificar um evento
    notifyEvent(eventName, data) {
        if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Erro ao executar callback para evento ${eventName}:`, error);
                }
            });
        }
    }
    
    // Destruir o dashboard e limpar recursos
    destroy() {
        console.log('Destruindo dashboard Runes...');
        
        // Limpar timer de atualização
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        // Destruir componentes
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // Limpar container
        const container = document.getElementById(this.options.container);
        if (container) {
            container.innerHTML = '';
            container.classList.remove('runes-dashboard', 'dark-mode', 'grid-layout', 'list-layout');
        }
        
        // Limpar event handlers
        this.eventHandlers = {};
        
        console.log('Dashboard Runes destruído com sucesso');
    }
}

// Exportar a classe para uso global
window.RunesDashboard = RunesDashboard; 
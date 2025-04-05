// Componente principal para a seção de Ranking de RUNES
class RunesRanking {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container com ID "${containerId}" não encontrado.`);
            return;
        }
        
        this.runesData = [];
        this.currentMetric = 'volume24h';
        this.sortOrder = 'desc';
        this.sentimentColors = {
            positive: 'linear-gradient(90deg, #2ecc71, #27ae60)',
            neutral: 'linear-gradient(90deg, #f39c12, #f1c40f)',
            negative: 'linear-gradient(90deg, #e74c3c, #c0392b)'
        };
        
       this.initializeUI();
  // Tenta carregar dados reais se disponível
this.loadRealData();
}

    initializeUI() {
        console.log('Inicializando UI da seção de Ranking de RUNES');
        
        // Criar estrutura base do componente
        this.container.innerHTML = `
            <div class="section-intro">
                <h3>Ranking de RUNES</h3>
                <p>RUNES são tokens fungíveis baseados em Bitcoin L1 com características únicas de eficiência e escalabilidade.</p>
            </div>
            
            <div class="ranking-controls">
                <div class="metric-selector">
                    <label for="metric-select">Ordenar por:</label>
                    <select id="metric-select" class="select-styled">
                        <option value="volume24h">Volume 24h</option>
                        <option value="priceChange24h">Variação de Preço 24h</option>
                        <option value="holdersCount">Número de Holders</option>
                        <option value="marketCap">Capitalização de Mercado</option>
                        <option value="sentiment">Sentimento</option>
                    </select>
                </div>
                
                <div class="sort-direction">
                    <button id="sort-asc" class="sort-btn" title="Ordem crescente">↑</button>
                    <button id="sort-desc" class="sort-btn active" title="Ordem decrescente">↓</button>
                </div>
                
                <div class="view-options">
                    <button id="table-view" class="view-btn active"><i class="fas fa-table"></i> Tabela</button>
                    <button id="grid-view" class="view-btn"><i class="fas fa-th"></i> Cards</button>
                </div>
            </div>
            
            <div id="ranking-table-container" class="ranking-table-container"></div>
        `;
        
        try {
            // Adicionar event listeners
            this.setupEventListeners();
            
            // Carregar dados
            this.loadMockData();
            
            // Configurar atualizações em tempo real
            this.setupRealtimeUpdates();
        } catch (error) {
            console.error('Erro na inicialização da UI:', error);
        }
    }
    
    // Método para carregar dados reais via serviço
    async loadRealData() {
        try {
            console.log('Buscando dados reais de RUNES...');
        
        // Exibir indicador de carregamento
        this.showLoading(true);
        
            // Verificar se o serviço existe e se tem o método necessário
            if (typeof window.RunesDataService !== 'undefined' && 
                typeof window.RunesDataService.getRunesStats === 'function') {
                
                try {
                    const data = await window.RunesDataService.getRunesStats();
                    console.log('Dados recebidos:', data);
                    if (data && Array.isArray(data.recentTransactions)) {
                        this.runesData = data.recentTransactions;
            this.updateRanking();
        } else {
            this.loadMockData();
                    }
                } catch (err) {
                    console.error('Erro ao carregar dados:', err);
                    this.loadMockData();
                } finally {
                    this.showLoading(false);
                }
            } else {
                console.warn('RunesDataService não disponível ou método getRunesStats não encontrado, usando dados mockup');
                
                // Por enquanto, usamos uma simulação de chamada de API
                // No futuro, substituiremos por API real
    setTimeout(() => {
                    // Dados simulados vindos de uma API
            const apiData = [
                { 
                    ticker: 'BAR•BITCOIN•TOKEN', 
                    symbol: '🍺', 
                    price: 0.0031, 
                    priceChange24h: 15.82, 
                    volume24h: 187500000, 
                    holdersCount: 121400, 
                    sentiment: 92, 
                            marketCap: 313750000 
                },
                { 
                    ticker: 'RUNES•DEV•DAO', 
                    symbol: '👨‍💻', 
                    price: 0.0024, 
                    priceChange24h: -3.41, 
                    volume24h: 76300000, 
                    holdersCount: 38200, 
                    sentiment: 68, 
                            marketCap: 47180000 
                },
                { 
                    ticker: 'BITCOIN•PIZZA•DAY', 
                    symbol: '🍕', 
                    price: 0.0096, 
                    priceChange24h: 28.12, 
                    volume24h: 42600000, 
                    holdersCount: 31650, 
                    sentiment: 84, 
                            marketCap: 168320000 
                        },
                        // Mantenha os dados mockados originais também
                        ...this.getMockData()
                    ];
                    
                    this.runesData = apiData;
            this.updateRanking();
                    this.showLoading(false);
                }, 1500); // Atraso de 1.5s para simular o tempo de resposta da API
            }
        } catch (error) {
            console.error('Erro ao tentar carregar dados reais:', error);
            this.loadMockData();
            this.showLoading(false);
        }
}

    // Método auxiliar para devolver os dados mock originais
getMockData() {
    return [
        { 
            ticker: 'DOG•GO•TO•THE•MOON', 
            symbol: '🐕', 
            price: 0.0017, 
            priceChange24h: 2.01, 
            volume24h: 105100000, 
            holdersCount: 97900, 
            sentiment: 85, 
                marketCap: 173090000 
        },
        { 
            ticker: 'MAGIC•INTERNET•MONEY', 
            symbol: '💰', 
            price: 0.0013, 
            priceChange24h: 37.51, 
            volume24h: 26000000, 
            holdersCount: 40600, 
            sentiment: 78, 
                marketCap: 31030000 
            },
            { 
                ticker: 'NIKOLA•TESLA•GOD', 
                symbol: '⚡', 
                price: 0.016, 
                priceChange24h: 0.55, 
                volume24h: 12500000, 
                holdersCount: 56300, 
                sentiment: 62, 
                marketCap: 16270000 
            }
        ];
    }
    
    loadMockData() {
        console.log('Carregando dados mockup para RUNES');
        
        // Dados mockup para testes
        const mockData = [
            { 
                ticker: 'DOG•GO•TO•THE•MOON', 
                symbol: '🐕', 
                price: 0.0017, 
                priceChange24h: 2.01, 
                volume24h: 105100000, 
                holdersCount: 97900, 
                sentiment: 85, 
                marketCap: 173090000 
            },
            { 
                ticker: 'MAGIC•INTERNET•MONEY', 
                symbol: '💰', 
                price: 0.0013, 
                priceChange24h: 37.51, 
                volume24h: 26000000, 
                holdersCount: 40600, 
                sentiment: 78, 
                marketCap: 31030000 
            },
            { 
                ticker: 'NIKOLA•TESLA•GOD', 
                symbol: '⚡', 
                price: 0.016, 
                priceChange24h: 0.55, 
                volume24h: 12500000, 
                holdersCount: 56300, 
                sentiment: 62, 
                marketCap: 16270000 
            },
            { 
                ticker: 'CYPHER•GENESIS', 
                symbol: '🔐', 
                price: 0.0012, 
                priceChange24h: 53.46, 
                volume24h: 2700000, 
                holdersCount: 57200, 
                sentiment: 79, 
                marketCap: 1260000 
            },
            { 
                ticker: 'BILLION•DOLLAR•CAT', 
                symbol: '🐱', 
                price: 0.0082, 
                priceChange24h: 0.96, 
                volume24h: 7400000, 
                holdersCount: 15100, 
                sentiment: 71, 
                marketCap: 8950000 
            },
            { 
                ticker: 'GCM•BITCOIN•PARTNER', 
                symbol: '🤝', 
                price: 4.2, 
                priceChange24h: 3.14, 
                volume24h: 2600000, 
                holdersCount: 13900, 
                sentiment: 65, 
                marketCap: 88530000 
            },
            { 
                ticker: 'PUPS•WORLD•PEACE', 
                symbol: '🐶', 
                price: 0.02, 
                priceChange24h: -0.24, 
                volume24h: 3900000, 
                holdersCount: 13000, 
                sentiment: 69, 
                marketCap: 20760000 
            },
            { 
                ticker: 'CRAZY•THURSDAY', 
                symbol: '🗓️', 
                price: 0.41, 
                priceChange24h: 6.3, 
                volume24h: 1100000, 
                holdersCount: 6600, 
                sentiment: 77, 
                marketCap: 8760000 
            },
            { 
                ticker: 'RSIC•GENESIS•RUNE', 
                symbol: '🔄', 
                price: 0.00059, 
                priceChange24h: -7.44, 
                volume24h: 2900000, 
                holdersCount: 98200, 
                sentiment: 58, 
                marketCap: 12940000 
            },
            { 
                ticker: 'MEMENTO•MORI', 
                symbol: '⏳', 
                price: 0.017, 
                priceChange24h: 1.39, 
                volume24h: 4100000, 
                holdersCount: 8100, 
                sentiment: 64, 
                marketCap: 1780000 
            }
        ];
        
        this.runesData = mockData;
        this.updateRanking();
    }
    
    setupEventListeners() {
        // Event listener para seleção de métrica
        const metricSelect = document.getElementById('metric-select');
        if (metricSelect) {
            metricSelect.addEventListener('change', (e) => {
                this.currentMetric = e.target.value;
                this.updateRanking();
            });
        }
        
        // Event listeners para botões de ordenação
        const sortAscBtn = document.getElementById('sort-asc');
        const sortDescBtn = document.getElementById('sort-desc');
        
        if (sortAscBtn && sortDescBtn) {
            sortAscBtn.addEventListener('click', () => {
                sortAscBtn.classList.add('active');
                sortDescBtn.classList.remove('active');
                this.sortOrder = 'asc';
            this.updateRanking();
            });
            
            sortDescBtn.addEventListener('click', () => {
                sortDescBtn.classList.add('active');
                sortAscBtn.classList.remove('active');
                this.sortOrder = 'desc';
                this.updateRanking();
            });
        }
        
        // Event listeners para botões de visualização
        const tableViewBtn = document.getElementById('table-view');
        const gridViewBtn = document.getElementById('grid-view');
        
        if (tableViewBtn && gridViewBtn) {
            tableViewBtn.addEventListener('click', () => {
                tableViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
                this.updateViewMode('table');
            });
            
            gridViewBtn.addEventListener('click', () => {
                gridViewBtn.classList.add('active');
                tableViewBtn.classList.remove('active');
                this.updateViewMode('grid');
            });
        }
    }
    
    setupRealtimeUpdates() {
        // Simulação de atualizações em tempo real
        console.log('Configurando atualizações em tempo real...');
        
        // Armazenar referência ao interval para poder limpar depois
        this.realtimeInterval = setInterval(() => {
            // Apenas para demonstração: atualiza um item aleatório a cada 5-10 segundos
            if (!this.runesData || this.runesData.length === 0) return;
            
            const randomIndex = Math.floor(Math.random() * this.runesData.length);
            const rune = this.runesData[randomIndex];
            
            // Gerar uma mudança de preço aleatória (entre -2% e +2%)
            const priceChange = (Math.random() * 4 - 2) / 100;
            const oldPrice = rune.price;
            const newPrice = oldPrice * (1 + priceChange);
            
            // Atualizar o preço e a variação
            rune.price = newPrice;
            rune.priceChange24h = rune.priceChange24h + (priceChange * 100);
            
            // Atualizar timestamp da última atualização
            rune.lastUpdate = new Date().toISOString();
            
            console.log(`Atualização em tempo real: ${rune.ticker} - Preço: ${this.formatPrice(oldPrice)} -> ${this.formatPrice(newPrice)}`);
            
            // Destaque visual na UI
            this.highlightPriceChange(rune.ticker, priceChange >= 0);
            
            // Se estiver ordenado por preço, reordenar a tabela
            if (this.currentMetric === 'price' || this.currentMetric === 'priceChange24h') {
        this.updateRanking();
            } else {
                // Caso contrário, apenas atualizar célula específica
                this.updatePriceCell(rune.ticker, newPrice, rune.priceChange24h);
            }
        }, 5000 + Math.random() * 5000); // Interval entre 5 e 10 segundos
    }
    
    updateRanking() {
        // Verificar se o container existe
        const container = document.getElementById('ranking-table-container');
        if (!container) return;
        
    // Limpar o container
    container.innerHTML = '';
    
    // Ordenar os dados
    const sortedData = this.sortItems(this.runesData, this.currentMetric, this.sortOrder);
    
        // Criar a tabela
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-responsive';
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Cabeçalho
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>RUNE</th>
                <th>Preço (sats)</th>
                <th>24h %</th>
                <th>Volume 24h</th>
                <th>Cap. de Mercado</th>
                <th>Holders</th>
                <th>Sentimento</th>
            </tr>
        `;
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
    
    sortedData.forEach((rune, index) => {
            const row = document.createElement('tr');
            
        const changeClass = rune.priceChange24h >= 0 ? 'positive' : 'negative';
        const formattedPrice = this.formatPrice(rune.price);
        const priceChange = (rune.priceChange24h >= 0 ? '+' : '') + rune.priceChange24h.toFixed(2) + '%';
        
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="rune-ticker">${rune.symbol || '🪙'} ${rune.ticker}</td>
                <td>${formattedPrice}</td>
                <td class="${changeClass}">${priceChange}</td>
                <td>$${this.formatNumber(rune.volume24h, true)}</td>
                <td>$${this.formatNumber(rune.marketCap, true)}</td>
                <td>${this.formatNumber(rune.holdersCount)}</td>
                <td>
                    <div class="sentiment-meter">
                        <div class="sentiment-bar" style="width: ${rune.sentiment}%; background: ${this.getSentimentColor(rune.sentiment)}"></div>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
    
    // Adicionar nota sobre dados
    const noteDiv = document.createElement('div');
    noteDiv.className = 'data-note';
    noteDiv.innerHTML = `
        <p><i>Dados baseados em plataformas de RUNES como Magic Eden, BestInSlot e OKX. Última atualização: ${new Date().toLocaleTimeString()}</i></p>
    `;
    container.appendChild(noteDiv);
    }
    
    updateViewMode(mode) {
        // Alternar entre exibição de tabela e grid
        const container = document.getElementById('ranking-table-container');
        if (!container) return;
        
        if (mode === 'grid') {
            // Renderizar visualização em cards
            this.renderGridView(container);
        } else {
            // Renderizar visualização em tabela
            this.updateRanking();
        }
    }
    
    renderGridView(container) {
        // Limpar o container
        container.innerHTML = '';
        
        // Ordenar os dados
        const sortedData = this.sortItems(this.runesData, this.currentMetric, this.sortOrder);
        
        // Criar o wrapper do grid
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'runes-grid';
        
        sortedData.forEach((rune, index) => {
            // Formatar dados
            const changeClass = rune.priceChange24h >= 0 ? 'positive' : 'negative';
            const formattedPrice = this.formatPrice(rune.price);
            const priceChange = (rune.priceChange24h >= 0 ? '+' : '') + rune.priceChange24h.toFixed(2) + '%';
            
            // Criar card
            const card = document.createElement('div');
            card.className = 'rune-card';
            
            // Adicionar fonte de dados se disponível
            const dataSourceTag = rune.dataSource ? 
                `<div class="data-source-tag">${rune.dataSource}</div>` : '';
            
            card.innerHTML = `
                <div class="rune-card-header">
                    <div class="rune-card-rank">#${index + 1}</div>
                    <div class="rune-card-symbol">${rune.symbol || '🪙'}</div>
                    <div class="rune-card-info">
                        <h3>${rune.ticker}</h3>
                        <div class="price-container">
                            <span class="price">${formattedPrice}</span>
                            <span class="price-change ${changeClass}">${priceChange}</span>
                        </div>
                    </div>
                    ${dataSourceTag}
                </div>
                <div class="rune-card-details">
                    <div class="detail-row">
                        <div class="detail-label">Volume 24h</div>
                        <div class="detail-value">$${this.formatNumber(rune.volume24h, true)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Market Cap</div>
                        <div class="detail-value">$${this.formatNumber(rune.marketCap, true)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Holders</div>
                        <div class="detail-value">${this.formatNumber(rune.holdersCount)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Sentimento</div>
                        <div class="detail-value">
                            <div class="sentiment-meter small">
                                <div class="sentiment-bar" style="width: ${rune.sentiment}%;"></div>
                                <span>${rune.sentiment}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            gridWrapper.appendChild(card);
        });
        
        container.appendChild(gridWrapper);
        
        // Adicionar nota sobre dados
        const noteDiv = document.createElement('div');
        noteDiv.className = 'data-note';
        noteDiv.innerHTML = `
            <p><i>Dados baseados em plataformas de RUNES como Magic Eden, BestInSlot e OKX. Última atualização: ${new Date().toLocaleTimeString()}</i></p>
        `;
        container.appendChild(noteDiv);
    }
    
    // Destacar visualmente uma mudança de preço
highlightPriceChange(ticker, isPositive) {
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    rows.forEach(row => {
        const tickerCell = row.querySelector('.rune-ticker');
            if (tickerCell && tickerCell.textContent.includes(ticker)) {
            const priceCell = row.querySelector('td:nth-child(3)');
            const changeCell = row.querySelector('td:nth-child(4)');
            
            if (priceCell && changeCell) {
                // Adicionar classe para animação
                const highlightClass = isPositive ? 'highlight-positive' : 'highlight-negative';
                
                priceCell.classList.add(highlightClass);
                changeCell.classList.add(highlightClass);
                
                // Remover classe após a animação
                setTimeout(() => {
                    priceCell.classList.remove(highlightClass);
                    changeCell.classList.remove(highlightClass);
                }, 1000);
            }
        }
    });
}

// Atualizar apenas uma célula de preço sem reordenar toda a tabela
updatePriceCell(ticker, newPrice, priceChange) {
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    rows.forEach(row => {
        const tickerCell = row.querySelector('.rune-ticker');
            if (tickerCell && tickerCell.textContent.includes(ticker)) {
            const priceCell = row.querySelector('td:nth-child(3)');
            const changeCell = row.querySelector('td:nth-child(4)');
            
            if (priceCell && changeCell) {
                priceCell.textContent = this.formatPrice(newPrice);
                
                const changeClass = priceChange >= 0 ? 'positive' : 'negative';
                const formattedChange = (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + '%';
                
                changeCell.textContent = formattedChange;
                changeCell.className = changeClass;
            }
        }
    });
}

// Exibir indicador de carregamento
showLoading(isLoading) {
    const container = document.getElementById('ranking-table-container');
    if (!container) return;
    
    if (isLoading) {
        // Criar e mostrar o indicador de carregamento
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-indicator';
        loadingEl.innerHTML = `
            <div class="spinner"></div>
            <p>Carregando dados das APIs...</p>
        `;
        container.innerHTML = '';
        container.appendChild(loadingEl);
    }
}
        
    // Mostrar mensagem de erro
    showError(message) {
        const container = this.container;
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>Erro ao carregar ranking</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    // Método para limpar recursos quando o componente é destruído
    destroy() {
        // Remover event listeners para evitar memory leaks
        const metricSelect = document.getElementById('metric-select');
        const sortAscBtn = document.getElementById('sort-asc');
        const sortDescBtn = document.getElementById('sort-desc');
        const tableViewBtn = document.getElementById('table-view');
        const gridViewBtn = document.getElementById('grid-view');
        
        // Use a referência correta das funções de evento
        if (metricSelect) metricSelect.removeEventListener('change', e => this.currentMetric = e.target.value);
        if (sortAscBtn) sortAscBtn.removeEventListener('click', () => this.sortOrder = 'asc');
        if (sortDescBtn) sortDescBtn.removeEventListener('click', () => this.sortOrder = 'desc');
        if (tableViewBtn) tableViewBtn.removeEventListener('click', () => this.updateViewMode('table'));
        if (gridViewBtn) gridViewBtn.removeEventListener('click', () => this.updateViewMode('grid'));
        
        // Limpar quaisquer timers ou WebSockets
        if (this.realtimeInterval) {
            clearInterval(this.realtimeInterval);
            this.realtimeInterval = null;
        }
    }
    
    // Métodos auxiliares
    sortItems(data, metric, order) {
        return [...data].sort((a, b) => {
            let valueA = a[metric] || 0;
            let valueB = b[metric] || 0;
            
            // Converter para número se for string
            if (typeof valueA === 'string') valueA = parseFloat(valueA) || 0;
            if (typeof valueB === 'string') valueB = parseFloat(valueB) || 0;
            
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        });
    }
    
    formatPrice(price) {
        if (!price) return '0.00 sats';
        
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        // Converter para satoshis (1 BTC = 100,000,000 sats)
        const satPrice = numPrice < 1 ? numPrice : numPrice * 100000000;
        
        if (satPrice < 0.01) return satPrice.toExponential(2) + ' sats';
        if (satPrice < 1) return satPrice.toFixed(5) + ' sats';
        if (satPrice < 10) return satPrice.toFixed(4) + ' sats';
        if (satPrice < 100) return satPrice.toFixed(3) + ' sats';
        if (satPrice < 1000) return satPrice.toFixed(2) + ' sats';
        return Math.round(satPrice) + ' sats';
    }
    
    formatNumber(num, abbreviated = false) {
        if (abbreviated) {
            if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
            if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
            return num.toFixed(0);
        }
        
        return new Intl.NumberFormat().format(num);
    }
    
    getSentimentColor(sentiment) {
        if (sentiment >= 70) return this.sentimentColors.positive;
        if (sentiment >= 40) return this.sentimentColors.neutral;
        return this.sentimentColors.negative;
    }
}

// Exportar a classe para o escopo global
window.RunesRanking = RunesRanking;

// Removemos a inicialização automática para evitar conflitos
// Agora o componente será inicializado apenas quando importado e instanciado
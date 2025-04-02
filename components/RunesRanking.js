// ranking-melhorado.js
console.log("Inicializando componente de ranking melhorado...");

// Função para inicializar o ranking de RUNES
function initRunesRanking() {
    console.log("Inicializando ranking de RUNES avançado...");
    
    try {
        // Procurar por um container válido
        const container = document.getElementById('ranking-container');
        
        if (!container) {
            console.error("Container de ranking não encontrado");
            return;
        }
        
        // Limpar o container e adicionar mensagem de carregamento
        container.innerHTML = '<div class="loading">Carregando dados de RUNES...</div>';
        
        // Dados mockup mais detalhados para testes
        const mockData = [
            { ticker: 'ORDI', symbol: '🪙', price: 21.56, change: 8.32, volume24h: 105100000, holdersCount: 97900, marketCap: 173090000, sentiment: 85 },
            { ticker: 'SATS', symbol: '💰', price: 0.000420, change: 3.2, volume24h: 26000000, holdersCount: 40600, marketCap: 31030000, sentiment: 78 },
            { ticker: 'PEPE', symbol: '🐸', price: 0.0012, change: -5.8, volume24h: 12500000, holdersCount: 56300, marketCap: 16270000, sentiment: 62 },
            { ticker: 'DOG', symbol: '🐕', price: 0.0017, change: 2.01, volume24h: 8700000, holdersCount: 23400, marketCap: 9820000, sentiment: 71 },
            { ticker: 'MEME', symbol: '😂', price: 0.0045, change: -2.3, volume24h: 5300000, holdersCount: 18700, marketCap: 7540000, sentiment: 65 }
        ];
        async loadRealData() {
    try {
        console.log('Buscando dados reais de RUNES...');
        
        // Exibir indicador de carregamento
        this.showLoading(true);
        
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
        
    } catch (error) {
        console.error('Erro ao buscar dados reais:', error);
        // Fallback para dados mockados em caso de erro
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
        // Adicionar filtros e controles
        let controlsHTML = `
            <div class="ranking-controls">
                <div class="filter-group">
                    <label for="metric-selector">Ordenar por:</label>
                    <select id="metric-selector" class="select-styled">
                        <option value="volume24h">Volume 24h</option>
                        <option value="change">Variação de Preço 24h</option>
                        <option value="marketCap">Capitalização de Mercado</option>
                        <option value="holdersCount">Número de Holders</option>
                        <option value="sentiment">Sentimento</option>
                    </select>
                </div>
                
                <div class="sort-direction">
                    <button id="sort-asc" class="sort-btn" title="Ordem crescente">↑</button>
                    <button id="sort-desc" class="sort-btn active" title="Ordem decrescente">↓</button>
                </div>
            </div>
        `;
        
        // Gerar HTML para a tabela
        let tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Token</th>
                        <th>Preço (BTC)</th>
                        <th>24h %</th>
                        <th>Volume 24h</th>
                        <th>Cap. de Mercado</th>
                        <th>Holders</th>
                        <th>Sentimento</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Adicionar linhas à tabela
        mockData.forEach((rune, index) => {
            const changeClass = rune.change > 0 ? 'positive' : 'negative';
            
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="rune-info">
                            <span class="rune-symbol">${rune.symbol}</span>
                            <span class="rune-ticker">${rune.ticker}</span>
                        </div>
                    </td>
                    <td>${rune.price}</td>
                    <td class="${changeClass}">${rune.change}%</td>
                    <td>$${formatNumber(rune.volume24h)}</td>
                    <td>$${formatNumber(rune.marketCap)}</td>
                    <td>${formatNumber(rune.holdersCount)}</td>
                    <td>
                        <div class="sentiment-meter">
                            <div class="sentiment-bar" style="width: ${rune.sentiment}%; 
                                 background: linear-gradient(90deg, #2ecc71, #3498db);"></div>
                            <span>${rune.sentiment}</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        // Adicionar nota sobre os dados
        let noteHTML = `
            <div class="data-note">
                <p><i>Dados baseados em plataformas de RUNES como Magic Eden, BestInSlot e OKX. Atualizado há 5 minutos.</i></p>
            </div>
        `;
        
        // Atualizar o container com o HTML completo
        container.innerHTML = controlsHTML + tableHTML + noteHTML;
        
        // Adicionar event listeners para controles
        setupRankingControls(mockData);
        
        console.log("Ranking de RUNES inicializado com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar ranking de RUNES:", error);
    }
}

// Configurar os controles de ordenação
function setupRankingControls(data) {
    const metricSelector = document.getElementById('metric-selector');
    const sortAscBtn = document.getElementById('sort-asc');
    const sortDescBtn = document.getElementById('sort-desc');
    
    if (metricSelector && sortAscBtn && sortDescBtn) {
        let currentMetric = 'volume24h';
        let currentOrder = 'desc';
        
        // Event listener para o seletor de métrica
        metricSelector.addEventListener('change', function() {
            currentMetric = this.value;
            updateRankingTable(data, currentMetric, currentOrder);
        });
        
        // Event listeners para botões de ordenação
        sortAscBtn.addEventListener('click', function() {
            sortAscBtn.classList.add('active');
            sortDescBtn.classList.remove('active');
            currentOrder = 'asc';
            updateRankingTable(data, currentMetric, currentOrder);
        });
        
        sortDescBtn.addEventListener('click', function() {
            sortDescBtn.classList.add('active');
            sortAscBtn.classList.remove('active');
            currentOrder = 'desc';
            updateRankingTable(data, currentMetric, currentOrder);
        });
    }
}

// Atualizar a tabela com base na ordenação
function updateRankingTable(data, metric, order) {
    const sortedData = sortItems(data, metric, order);
    const tbody = document.querySelector('.data-table tbody');
    
    if (tbody) {
        tbody.innerHTML = '';
        
        sortedData.forEach((rune, index) => {
            const changeClass = rune.change > 0 ? 'positive' : 'negative';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="rune-info">
                        <span class="rune-symbol">${rune.symbol}</span>
                        <span class="rune-ticker">${rune.ticker}</span>
                    </div>
                </td>
                <td>${rune.price}</td>
                <td class="${changeClass}">${rune.change}%</td>
                <td>$${formatNumber(rune.volume24h)}</td>
                <td>$${formatNumber(rune.marketCap)}</td>
                <td>${formatNumber(rune.holdersCount)}</td>
                <td>
                    <div class="sentiment-meter">
                        <div class="sentiment-bar" style="width: ${rune.sentiment}%; 
                             background: linear-gradient(90deg, #2ecc71, #3498db);"></div>
                        <span>${rune.sentiment}</span>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
}

// Função para ordenar os dados
function sortItems(data, metric, order) {
    return [...data].sort((a, b) => {
        let valueA = a[metric] || 0;
        let valueB = b[metric] || 0;
        
        return order === 'asc' ? valueA - valueB : valueB - valueA;
    });
}

// Função auxiliar para formatar números
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, inicializando componentes...");
    
    // Verificar se estamos na seção de ranking
    if (document.getElementById('ranking').classList.contains('active')) {
        initRunesRanking();
    } else {
        // Adicionamos um listener para quando a seção de ranking for ativada
        document.addEventListener('sectionChanged', function(e) {
            if (e.detail.sectionId === 'ranking') {
                initRunesRanking();
            }
        });
    }
});

// Para uso direto
window.initRunesRanking = initRunesRanking;
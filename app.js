import runesMarketDataService from './services/runesMarketDataService.js';
import whaleAlertService from './services/whaleAlertService.js';
import TokenDashboard from './components/TokenDashboard.js';
import WhaleMonitor from './components/WhaleMonitor.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar serviços
    initializeServices();
    
    // Configurar navegação
    setupNavigation();
    
    // Carregar dados iniciais
    loadInitialData();
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar componentes
    initializeComponents();
});

function initializeServices() {
    // Os serviços já são inicializados automaticamente quando importados
    console.log('Serviços inicializados');
}

function setupNavigation() {
    // Botão de voltar para a lista
    document.getElementById('back-to-list').addEventListener('click', () => {
        document.getElementById('token-analysis-section').classList.add('hidden-section');
        document.getElementById('token-analysis-section').classList.remove('active-section');
        document.getElementById('tokens-list-section').classList.add('active-section');
        document.getElementById('tokens-list-section').classList.remove('hidden-section');
    });
    
    // Painel de favoritos
    document.getElementById('favorites-btn').addEventListener('click', () => {
        document.getElementById('favorites-panel').classList.toggle('active');
    });
    
    document.getElementById('close-favorites').addEventListener('click', () => {
        document.getElementById('favorites-panel').classList.remove('active');
    });
}

async function loadInitialData() {
    try {
        // Carregar tokens por volume
        const timeframe = document.querySelector('.timeframe-btn.active').dataset.timeframe || '24h';
        await loadTokensByVolume(timeframe);
        
        // Carregar top movers
        await loadTopMovers();
        
        // Carregar favoritos
        loadFavorites();
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
    }
}

function setupEventListeners() {
    // Seletor de timeframe
    document.querySelectorAll('.timeframe-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            // Atualizar botão ativo
            document.querySelectorAll('.timeframe-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Carregar dados para o timeframe selecionado
            const timeframe = e.target.dataset.timeframe;
            await loadTokensByVolume(timeframe);
        });
    });
    
    // Pesquisa de tokens
    const searchInput = document.getElementById('token-search');
    const searchResults = document.getElementById('search-results');
    
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }
        
        try {
            const results = await runesMarketDataService.searchTokens(query);
            
            if (results.length > 0) {
                searchResults.innerHTML = results.map(token => `
                    <div class="search-item" data-ticker="${token.ticker}">
                        <div class="token-name">
                            <div class="token-icon">${token.ticker.charAt(0)}</div>
                            <div>
                                <span class="token-symbol">${token.ticker}</span>
                                <span class="token-fullname">${token.name || token.ticker}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                searchResults.classList.add('active');
                
                // Adicionar evento de clique aos resultados
                document.querySelectorAll('.search-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const ticker = item.dataset.ticker;
                        navigateToTokenAnalysis(ticker);
                        searchResults.classList.remove('active');
                        searchInput.value = '';
                    });
                });
            } else {
                searchResults.innerHTML = '<div class="search-item">Nenhum resultado encontrado</div>';
                searchResults.classList.add('active');
            }
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            searchResults.innerHTML = '<div class="search-item">Erro na pesquisa</div>';
            searchResults.classList.add('active');
        }
    });
    
    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    // Alternar tema
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const themeIcon = document.querySelector('#theme-toggle i');
        if (document.body.classList.contains('light-theme')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });
    
    // Adicionar eventos aos itens de top movers
    document.addEventListener('click', (e) => {
        const moverItem = e.target.closest('.mover-item');
        if (moverItem) {
            const ticker = moverItem.dataset.ticker;
            navigateToTokenAnalysis(ticker);
        }
    });
}

function initializeComponents() {
    // Os componentes serão inicializados quando necessário
}

async function loadTokensByVolume(timeframe) {
    try {
        const tableBody = document.getElementById('tokens-table-body');
        tableBody.innerHTML = '<tr><td colspan="9" class="loading">Carregando tokens...</td></tr>';
        
        const tokens = await runesMarketDataService.getTopTokensByVolume(timeframe);
        
        if (tokens.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="no-data">Nenhum token encontrado</td></tr>';
            return;
        }
        
        // Carregar favoritos
        const favorites = getFavorites();
        
        tableBody.innerHTML = tokens.map((token, index) => `
            <tr data-ticker="${token.ticker}">
                <td class="favorite-col">
                    <button class="favorite-btn ${favorites.includes(token.ticker) ? 'active' : ''}" data-ticker="${token.ticker}">
                        <i class="fas fa-star"></i>
                    </button>
                </td>
                <td class="rank-col">${index + 1}</td>
                <td class="name-col">
                    <div class="token-name">
                        <div class="token-icon">${token.ticker.charAt(0)}</div>
                        <div>
                            <span class="token-symbol">${token.ticker}</span>
                            <span class="token-fullname">${token.name || token.ticker}</span>
                        </div>
                    </div>
                </td>
                <td class="price-col">${formatPrice(token.price)}</td>
                <td class="change-col ${getChangeClass(token.change24h)}">
                    ${formatChange(token.change24h)}
                </td>
                <td class="volume-col">${formatNumber(token.volume24h)} BTC</td>
                <td class="market-cap-col">${formatNumber(token.marketCap)} BTC</td>
                <td class="holders-col">${formatNumber(token.holders)}</td>
                <td class="whale-alert-col">
                    ${getWhaleIndicator(token.ticker)}
                </td>
            </tr>
        `).join('');
        
        // Adicionar evento de clique às linhas
        document.querySelectorAll('#tokens-table-body tr').forEach(row => {
            row.addEventListener('click', (e) => {
                // Ignorar clique no botão de favorito
                if (e.target.closest('.favorite-btn')) return;
                
                const ticker = row.dataset.ticker;
                navigateToTokenAnalysis(ticker);
            });
        });
        
        // Adicionar evento de clique aos botões de favorito
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const ticker = button.dataset.ticker;
                toggleFavorite(ticker);
                button.classList.toggle('active');
            });
        });
    } catch (error) {
        console.error('Erro ao carregar tokens por volume:', error);
        document.getElementById('tokens-table-body').innerHTML = 
            '<tr><td colspan="9" class="error">Erro ao carregar tokens</td></tr>';
    }
}

async function loadTopMovers() {
    try {
        // Carregar top gainers
        const gainers = await runesMarketDataService.getTopGainers();
        document.getElementById('top-gainers').innerHTML = gainers.slice(0, 5).map(token => `
            <div class="mover-item" data-ticker="${token.ticker}">
                <div class="mover-token">
                    <div class="token-icon">${token.ticker.charAt(0)}</div>
                    <span>${token.ticker}</span>
                </div>
                <div class="mover-change positive">+${token.change24h.toFixed(2)}%</div>
            </div>
        `).join('');
        
        // Carregar top losers
        const losers = await runesMarketDataService.getTopLosers();
        document.getElementById('top-losers').innerHTML = losers.slice(0, 5).map(token => `
            <div class="mover-item" data-ticker="${token.ticker}">
                <div class="mover-token">
                    <div class="token-icon">${token.ticker.charAt(0)}</div>
                    <span>${token.ticker}</span>
                </div>
                <div class="mover-change negative">${token.change24h.toFixed(2)}%</div>
            </div>
        `).join('');
        
        // Carregar top volume
        const topVolume = await runesMarketDataService.getTopTokensByVolume('24h');
        document.getElementById('top-volume').innerHTML = topVolume.slice(0, 5).map(token => `
            <div class="mover-item" data-ticker="${token.ticker}">
                <div class="mover-token">
                    <div class="token-icon">${token.ticker.charAt(0)}</div>
                    <span>${token.ticker}</span>
                </div>
                <div class="mover-volume">${formatNumber(token.volume24h)} BTC</div>
            </div>
        `).join('');
        
        // Carregar atividade de baleias
        const whaleActivity = await whaleAlertService.getRecentAlerts();
        document.getElementById('whale-activity').innerHTML = whaleActivity.slice(0, 5).map(alert => `
            <div class="mover-item" data-ticker="${alert.ticker}">
                <div class="mover-token">
                    <div class="token-icon">${alert.ticker.charAt(0)}</div>
                    <span>${alert.ticker}</span>
                </div>
                <div class="mover-alert ${alert.type === 'accumulation' ? 'positive' : 'negative'}">
                    ${alert.type === 'accumulation' ? 'Acumulação' : 'Distribuição'}
                </div>
            </div>
        `).join('');
        
        // Adicionar evento de clique aos itens
        document.querySelectorAll('.mover-item').forEach(item => {
            item.addEventListener('click', () => {
                const ticker = item.dataset.ticker;
                navigateToTokenAnalysis(ticker);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar top movers:', error);
    }
}

function loadFavorites() {
    const favorites = getFavorites();
    const favoritesList = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="no-favorites">Nenhum favorito adicionado</div>';
        return;
    }
    
    // Carregar dados dos favoritos
    Promise.all(favorites.map(ticker => runesMarketDataService.getTokenDetails(ticker)))
        .then(tokens => {
            favoritesList.innerHTML = tokens.map(token => {
                if (!token) return '';
                
                return `
                    <div class="favorite-item" data-ticker="${token.ticker}">
                        <div class="favorite-token">
                            <div class="token-icon">${token.ticker.charAt(0)}</div>
                            <div>
                                <span class="token-symbol">${token.ticker}</span>
                                <span class="token-fullname">${token.name || token.ticker}</span>
                            </div>
                        </div>
                        <div class="favorite-price">
                            <div>${formatPrice(token.price)}</div>
                            <div class="favorite-change ${getChangeClass(token.change24h)}">
                                ${formatChange(token.change24h)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Adicionar evento de clique aos favoritos
            document.querySelectorAll('.favorite-item').forEach(item => {
                item.addEventListener('click', () => {
                    const ticker = item.dataset.ticker;
                    navigateToTokenAnalysis(ticker);
                    document.getElementById('favorites-panel').classList.remove('active');
                });
            });
        })
        .catch(error => {
            console.error('Erro ao carregar favoritos:', error);
            favoritesList.innerHTML = '<div class="error">Erro ao carregar favoritos</div>';
        });
}

function navigateToTokenAnalysis(ticker) {
    // Esconder seção de lista e mostrar seção de análise
    document.getElementById('tokens-list-section').classList.remove('active-section');
    document.getElementById('tokens-list-section').classList.add('hidden-section');
    document.getElementById('token-analysis-section').classList.remove('hidden-section');
    document.getElementById('token-analysis-section').classList.add('active-section');
    
    // Inicializar dashboard para o token
    const dashboard = new TokenDashboard('token-dashboard');
    dashboard.loadTokenData(ticker);
    
    // Inicializar monitor de baleias para o token
    const whaleMonitor = new WhaleMonitor('whale-monitor');
    whaleMonitor.loadWhaleData(ticker);
    
    // Atualizar URL (opcional, para permitir compartilhamento)
    history.pushState({ ticker }, `${ticker} - RUNES Analytics Pro`, `?token=${ticker}`);
}

function toggleFavorite(ticker) {
    const favorites = getFavorites();
    
    if (favorites.includes(ticker)) {
        // Remover dos favoritos
        const index = favorites.indexOf(ticker);
        favorites.splice(index, 1);
    } else {
        // Adicionar aos favoritos
        favorites.push(ticker);
    }
    
    // Salvar favoritos
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Atualizar lista de favoritos
    loadFavorites();
}

function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

function getWhaleIndicator(ticker) {
    // Obter nível de atividade de baleias para o token
    const whaleActivity = whaleAlertService.getWhaleActivityLevel(ticker);
    
    let level = 'low';
    if (whaleActivity >= 70) level = 'high';
    else if (whaleActivity >= 30) level = 'medium';
    
    return `
        <div class="whale-indicator ${level}">
            ${level === 'high' ? 'Alto' : level === 'medium' ? 'Médio' : 'Baixo'}
        </div>
    `;
}

function formatPrice(price) {
    if (typeof price !== 'number') return '0.00000000';
    return price.toFixed(8);
}

function formatChange(change) {
    if (typeof change !== 'number') return '0.00%';
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
}

function getChangeClass(change) {
    if (typeof change !== 'number') return 'neutral';
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
}

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    
    return num.toFixed(0);
}

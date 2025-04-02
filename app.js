import socialAnalysisService from "./services/socialAnalysisService.js";
import runesMarketDataService from "./services/runesMarketDataService.js";
import socialAnalysisService from "./services/socialAnalysisService.js";
import whaleAlertService from "./services/whaleAlertService.js";
import socialAnalysisService from "./services/socialAnalysisService.js";
import fibonacciAnalysisService from "./services/fibonacciAnalysisService.js";
import socialAnalysisService from "./services/socialAnalysisService.js";
import notificationService from "./services/notificationService.js";
import socialAnalysisService from "./services/socialAnalysisService.js";
import integrationService from "./services/integrationService.js";
import socialAnalysisService from "./services/socialAnalysisService.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeServices();
    setupNavigation();
    loadInitialData();
    setupEventListeners();
});

function initializeServices() {
    console.log("Servi�os inicializados");
}

function setupNavigation() {
    document.getElementById("back-to-list")?.addEventListener("click", () => {
        document.getElementById("token-analysis-section").classList.add("hidden-section");
        document.getElementById("token-analysis-section").classList.remove("active-section");
        document.getElementById("tokens-list-section").classList.add("active-section");
        document.getElementById("tokens-list-section").classList.remove("hidden-section");
    });
    
    document.getElementById("favorites-btn")?.addEventListener("click", () => {
        document.getElementById("favorites-panel").classList.toggle("active");
    });
    
    document.getElementById("close-favorites")?.addEventListener("click", () => {
        document.getElementById("favorites-panel").classList.remove("active");
    });
    
    window.addEventListener("navigate_to_token", (event) => {
        const ticker = event.detail.ticker;
        if (ticker) navigateToTokenAnalysis(ticker);
    });
}

async function loadInitialData() {
    try {
        const timeframe = document.querySelector(".timeframe-btn.active")?.dataset.timeframe || "24h";
        await loadTokensByVolume(timeframe);
        await loadTopMovers();
        loadFavorites();
    
        // Carregar dados sociais
        await loadSocialData(); catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
    
        // Carregar dados sociais
        await loadSocialData();

        // Carregar dados sociais
        await loadSocialData();

function setupEventListeners() {
    // Seletor de timeframe
    document.querySelectorAll(".timeframe-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            document.querySelectorAll(".timeframe-btn").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            await loadTokensByVolume(e.target.dataset.timeframe);
        });
    });
    
    // Pesquisa de tokens
    setupSearchFunctionality();
    
    // Alternar tema
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        const themeIcon = document.querySelector("#theme-toggle i");
        if (themeIcon) {
            if (document.body.classList.contains("light-theme")) {
                themeIcon.classList.remove("fa-moon");
                themeIcon.classList.add("fa-sun");
            } else {
                themeIcon.classList.remove("fa-sun");
                themeIcon.classList.add("fa-moon");
            }
        }
    });
    
    // Adicionar eventos aos itens de top movers
    document.addEventListener("click", (e) => {
        const moverItem = e.target.closest(".mover-item");
        if (moverItem) navigateToTokenAnalysis(moverItem.dataset.ticker);
    });
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById("token-search");
    const searchResults = document.getElementById("search-results");
    
    if (!searchInput || !searchResults) return;
    
    searchInput.addEventListener("input", async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.classList.remove("active");
            searchResults.innerHTML = "";
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
                `).join("");
                
                searchResults.classList.add("active");
                
                document.querySelectorAll(".search-item").forEach(item => {
                    item.addEventListener("click", () => {
                        navigateToTokenAnalysis(item.dataset.ticker);
                        searchResults.classList.remove("active");
                        searchInput.value = "";
                    });
                });
            } else {
                searchResults.innerHTML = '<div class="search-item">Nenhum resultado encontrado</div>';
                searchResults.classList.add("active");
            }
        } catch (error) {
            console.error("Erro na pesquisa:", error);
            searchResults.innerHTML = '<div class="search-item">Erro na pesquisa</div>';
            searchResults.classList.add("active");
        }
    });
    
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove("active");
        }
    });
}

async function loadTokensByVolume(timeframe) {
    const tableBody = document.getElementById("tokens-table-body");
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="9" class="loading">Carregando tokens...</td></tr>';
    
    try {
        const tokens = await runesMarketDataService.getTopTokensByVolume(timeframe);
        
        if (tokens.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="no-data">Nenhum token encontrado</td></tr>';
            return;
        }
        
        const favorites = getFavorites();
        
        tableBody.innerHTML = tokens.map((token, index) => `
            <tr data-ticker="${token.ticker}">
                <td class="favorite-col">
                    <button class="favorite-btn ${favorites.includes(token.ticker) ? "active" : ""}" data-ticker="${token.ticker}">
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
        `).join("");
        
        // Adicionar eventos
        document.querySelectorAll("#tokens-table-body tr").forEach(row => {
            row.addEventListener("click", (e) => {
                if (e.target.closest(".favorite-btn")) return;
                navigateToTokenAnalysis(row.dataset.ticker);
            });
        });
        
        document.querySelectorAll(".favorite-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleFavorite(button.dataset.ticker);
                button.classList.toggle("active");
            });
        });
    } catch (error) {
        console.error("Erro ao carregar tokens por volume:", error);
        tableBody.innerHTML = '<tr><td colspan="9" class="error">Erro ao carregar tokens</td></tr>';
    }
}

async function loadTopMovers() {
    try {
        // Top gainers
        const gainers = await runesMarketDataService.getTopGainers();
        const gainersContainer = document.getElementById("top-gainers");
        if (gainersContainer) {
            gainersContainer.innerHTML = gainers.slice(0, 5).map(token => `
                <div class="mover-item" data-ticker="${token.ticker}">
                    <div class="mover-token">
                        <div class="token-icon">${token.ticker.charAt(0)}</div>
                        <span>${token.ticker}</span>
                    </div>
                    <div class="mover-change positive">+${token.change24h.toFixed(2)}%</div>
                </div>
            `).join("");
        }
        
        // Top losers
        const losers = await runesMarketDataService.getTopLosers();
        const losersContainer = document.getElementById("top-losers");
        if (losersContainer) {
            losersContainer.innerHTML = losers.slice(0, 5).map(token => `
                <div class="mover-item" data-ticker="${token.ticker}">
                    <div class="mover-token">
                        <div class="token-icon">${token.ticker.charAt(0)}</div>
                        <span>${token.ticker}</span>
                    </div>
                    <div class="mover-change negative">${token.change24h.toFixed(2)}%</div>
                </div>
            `).join("");
        }
        
        // Top volume
        const topVolume = await runesMarketDataService.getTopTokensByVolume("24h");
        const volumeContainer = document.getElementById("top-volume");
        if (volumeContainer) {
            volumeContainer.innerHTML = topVolume.slice(0, 5).map(token => `
                <div class="mover-item" data-ticker="${token.ticker}">
                    <div class="mover-token">
                        <div class="token-icon">${token.ticker.charAt(0)}</div>
                        <span>${token.ticker}</span>
                    </div>
                    <div class="mover-volume">${formatNumber(token.volume24h)} BTC</div>
                </div>
            `).join("");
        }
        
        // Whale activity
        const whaleActivity = await whaleAlertService.getRecentAlerts();
        const whaleContainer = document.getElementById("whale-activity");
        if (whaleContainer) {
            whaleContainer.innerHTML = whaleActivity.slice(0, 5).map(alert => `
                <div class="mover-item" data-ticker="${alert.ticker}">
                    <div class="mover-token">
                        <div class="token-icon">${alert.ticker.charAt(0)}</div>
                        <span>${alert.ticker}</span>
                    </div>
                    <div class="mover-alert ${alert.type === 'accumulation' ? 'positive' : alert.type === 'distribution' ? 'negative' : 'neutral'}">
                        ${alert.type === 'accumulation' ? 'Acumula��o' : alert.type === 'distribution' ? 'Distribui��o' : 'Transfer�ncia'}
                    </div>
                </div>
            `).join("");
        }
    } catch (error) {
        console.error("Erro ao carregar top movers:", error);
    }
}

function loadFavorites() {
    const favorites = getFavorites();
    const container = document.getElementById("favorites-list");
    
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="no-favorites">Nenhum token favorito adicionado</div>';
        return;
    }
    
    // Buscar dados para cada favorito
    Promise.all(favorites.map(ticker => runesMarketDataService.getTokenDetails(ticker)))
        .then(tokens => {
            container.innerHTML = tokens.map(token => `
                <div class="favorite-item" data-ticker="${token.ticker}">
                    <div class="favorite-token">
                        <div class="token-icon">${token.ticker.charAt(0)}</div>
                        <div>
                            <span class="token-symbol">${token.ticker}</span>
                            <span class="token-price">${formatPrice(token.price)} BTC</span>
                        </div>
                    </div>
                    <div class="favorite-change ${getChangeClass(token.change24h)}">
                        ${formatChange(token.change24h)}
                    </div>
                    <button class="remove-favorite" data-ticker="${token.ticker}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join("");
            
            // Adicionar eventos
            document.querySelectorAll(".favorite-item").forEach(item => {
                item.addEventListener("click", (e) => {
                    if (e.target.closest(".remove-favorite")) return;
                    navigateToTokenAnalysis(item.dataset.ticker);
                    document.getElementById("favorites-panel").classList.remove("active");
                });
            });
            
            document.querySelectorAll(".remove-favorite").forEach(button => {
                button.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleFavorite(button.dataset.ticker);
                    loadFavorites(); // Recarregar lista
                });
            });
        })
        .catch(error => {
            console.error("Erro ao carregar favoritos:", error);
            container.innerHTML = '<div class="error">Erro ao carregar favoritos</div>';
        });
}

function getFavorites() {
    const favorites = localStorage.getItem("favorites");
    return favorites ? JSON.parse(favorites) : [];
}

function toggleFavorite(ticker) {
    const favorites = getFavorites();
    
    if (favorites.includes(ticker)) {
        const index = favorites.indexOf(ticker);
        favorites.splice(index, 1);
    } else {
        favorites.push(ticker);
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
    
    // Atualizar bot�es na interface
    document.querySelectorAll(`.favorite-btn[data-ticker="${ticker}"]`).forEach(btn => {
        btn.classList.toggle("active");
    });
}

async function navigateToTokenAnalysis(ticker) {
    // Esconder se��o de lista e mostrar se��o de an�lise
    document.getElementById("tokens-list-section").classList.remove("active-section");
    document.getElementById("tokens-list-section").classList.add("hidden-section");
    document.getElementById("token-analysis-section").classList.remove("hidden-section");
    document.getElementById("token-analysis-section").classList.add("active-section");
    
    // Mostrar loading
    document.getElementById("token-dashboard").innerHTML = '<div class="loading">Carregando an�lise...</div>';
    
    try {
        // Buscar dados do token
        const tokenData = await runesMarketDataService.getTokenDetails(ticker);
        
        // Renderizar dashboard
        renderTokenDashboard(tokenData);
        
        // Iniciar monitoramento
        integrationService.startMonitoring(ticker);
        
        // Atualizar URL (opcional, para permitir compartilhamento)
        history.pushState({ ticker }, `${ticker} - RUNES Analytics Pro`, `?token=${ticker}`);
    } catch (error) {
        console.error(`Erro ao carregar an�lise para ${ticker}:`, error);
        document.getElementById("token-dashboard").innerHTML = '<div class="error">Erro ao carregar an�lise</div>';
    }
}

// Fun��es auxiliares
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

function getWhaleIndicator(ticker) {
    const whaleActivity = whaleAlertService.getWhaleActivityLevel(ticker);
    
    let level = 'low';
    if (whaleActivity >= 70) level = 'high';
    else if (whaleActivity >= 30) level = 'medium';
    
    return `
        <div class="whale-indicator ${level}">
            ${level === 'high' ? 'Alto' : level === 'medium' ? 'M�dio' : 'Baixo'}
        </div>
    `;
}

// Fun��es para renderiza��o do dashboard (implementa��o simplificada)
function renderTokenDashboard(tokenData) {
    const dashboard = document.getElementById("token-dashboard");
    if (!dashboard) return;
    
    const favorites = getFavorites();
    
    dashboard.innerHTML = `
        <div class="token-dashboard">
            <div class="dashboard-header">
                <div class="token-info">
                    <div class="token-icon large">${tokenData.ticker.charAt(0)}</div>
                    <div class="token-details">
                        <h2>${tokenData.ticker}</h2>
                        <p>${tokenData.name}</p>
                    </div>
                </div>
                <div class="token-price-info">
                    <div class="current-price">${formatPrice(tokenData.price)} BTC</div>
                    <div class="price-change ${getChangeClass(tokenData.change24h)}">
                        ${formatChange(tokenData.change24h)}
                    </div>
                </div>
                <div class="token-actions">
                    <button class="action-btn favorite-btn ${favorites.includes(tokenData.ticker) ? 'active' : ''}" data-ticker="${tokenData.ticker}">
                        <i class="fas fa-star"></i>
                        <span>Favorito</span>
                    </button>
                    <button class="action-btn alert-btn" data-ticker="${tokenData.ticker}">
                        <i class="fas fa-bell"></i>
                        <span>Alertas</span>
                    </button>
                </div>
            </div>
            
            <div class="dashboard-tabs">
                <button class="tab-btn active" data-tab="overview">Vis�o Geral</button>
                <button class="tab-btn" data-tab="chart">Gr�fico</button>
                <button class="tab-btn" data-tab="whales">Baleias</button>
                <button class="tab-btn" data-tab="fibonacci">Fibonacci</button>
            </div>
            
            <div class="dashboard-content">
                <!-- Conte�do das tabs ser� carregado dinamicamente -->
                <div class="tab-content active" id="overview-tab"></div>
                <div class="tab-content" id="chart-tab"></div>
                <div class="tab-content" id="whales-tab"></div>
                <div class="tab-content" id="fibonacci-tab"></div>
            </div>
        </div>
    `;
    
    // Configurar tabs
    setupDashboardTabs();
    
    // Carregar conte�do inicial (vis�o geral)
    loadOverviewTab(tokenData);
    
    // Configurar bot�es
    setupDashboardButtons(tokenData);
}

function setupDashboardTabs() {
    document.querySelectorAll(".tab-btn").forEach(button => {
        button.addEventListener("click", () => {
            // Atualizar bot�o ativo
            document.querySelectorAll(".tab-btn").forEach(btn => {
                btn.classList.remove("active");
            });
            button.classList.add("active");
            
            // Mostrar conte�do da tab
            const tabId = button.dataset.tab + "-tab";
            document.querySelectorAll(".tab-content").forEach(content => {
                content.classList.remove("active");
            });
            document.getElementById(tabId).classList.add("active");
            
            // Carregar conte�do da tab se necess�rio
            const ticker = document.querySelector(".token-dashboard").dataset.ticker;
            loadTabContent(button.dataset.tab, ticker);
        });
    });
}

function setupDashboardButtons(tokenData) {
    // Bot�o de favorito
    document.querySelector(".token-dashboard .favorite-btn")?.addEventListener("click", (e) => {
        toggleFavorite(tokenData.ticker);
    });
    
    // Bot�o de alerta
    document.querySelector(".token-dashboard .alert-btn")?.addEventListener("click", () => {
        showAlertDialog(tokenData.ticker, tokenData);
    });
}

function loadTabContent(tab, ticker) {
    // Implementa��o simplificada - em produ��o, carregaria dados espec�ficos para cada tab
    console.log(`Carregando conte�do da tab ${tab} para ${ticker}`);
}

function loadOverviewTab(tokenData) {
    const container = document.getElementById("overview-tab");
    if (!container) return;
    
    container.innerHTML = `
        <div class="overview-grid">
            <div class="overview-card">
                <h3>Informa��es do Token</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Pre�o Atual</span>
                        <span class="info-value">${formatPrice(tokenData.price)} BTC</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Alta 24h</span>
                        <span class="info-value">${formatPrice(tokenData.high24h)} BTC</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Baixa 24h</span>
                        <span class="info-value">${formatPrice(tokenData.low24h)} BTC</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Volume 24h</span>
                        <span class="info-value">${formatNumber(tokenData.volume24h)} BTC</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Market Cap</span>
                        <span class="info-value">${formatNumber(tokenData.marketCap)} BTC</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Holders</span>
                        <span class="info-value">${formatNumber(tokenData.holders)}</span>
                    </div>
                </div>
            </div>
            
            <div class="overview-card">
                <h3>Atividade de Baleias</h3>
                <div class="whale-activity-gauge">
                    <div class="gauge-value" style="width: ${tokenData.whaleActivity}%"></div>
                </div>
                <div class="gauge-labels">
                    <span>Baixa</span>
                    <span>M�dia</span>
                    <span>Alta</span>
                </div>
            </div>
            
            <div class="overview-card">
                <h3>N�veis Fibonacci</h3>
                <div class="fibonacci-preview">
                    <p>Clique na aba Fibonacci para an�lise completa</p>
                </div>
            </div>
        </div>
    `;
}

function showAlertDialog(ticker, tokenData) {
    // Implementa��o simplificada - em produ��o, mostraria um di�logo para configurar alertas
    alert(`Configurar alertas para ${ticker} - Funcionalidade em desenvolvimento`);
}

async function loadSocialData() {
    try {
        // Carregar tokens por engajamento social
        const socialTokens = await socialAnalysisService.getTopTokensBySocialScore(5);
        const socialContainer = document.getElementById("social-engagement");
        
        if (socialContainer) {
            socialContainer.innerHTML = socialTokens.map(token => `
                <div class="social-item" data-ticker="${token.ticker}">
                    <div class="social-token">
                        <div class="social-icon" style="background-color: ${getRandomColor(token.ticker)}">${token.ticker.charAt(0)}</div>
                        <div>${token.ticker}</div>
                    </div>
                    <div class="social-score">
                        <div class="score-bar">
                            <div class="score-value" style="width: ${token.socialScore}%"></div>
                        </div>
                        <div>${token.socialScore}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Carregar tokens por potencial de viraliza��o
        const viralTokens = await socialAnalysisService.getTopTokensByVirality(5);
        const viralContainer = document.getElementById("viral-potential");
        
        if (viralContainer) {
            viralContainer.innerHTML = viralTokens.map(token => `
                <div class="social-item" data-ticker="${token.ticker}">
                    <div class="social-token">
                        <div class="social-icon" style="background-color: ${getRandomColor(token.ticker)}">${token.ticker.charAt(0)}</div>
                        <div>${token.ticker}</div>
                    </div>
                    <div class="social-score">
                        <div class="score-bar">
                            <div class="score-value" style="width: ${token.viralityPotential}%"></div>
                        </div>
                        <div>${token.viralityPotential}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Erro ao carregar dados sociais:", error);
    }
}

function getRandomColor(seed) {
    // Gerar cor baseada no ticker para consist�ncia
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
}




// Função para gerenciar a navegação
function setupNavigation() {
    const sections = document.querySelectorAll('main > section, section#alerts');
    const navLinks = document.querySelectorAll('nav a, a[href="#alerts"]');
    
    // Também capturar links de texto dentro do conteúdo
    const contentLinks = document.querySelectorAll('.content-link');
    
    function navigateTo(targetId) {
        // Esconder todas as seções
        sections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Remover classe ativa de todos os links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Mostrar a seção alvo
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            
            // Adicionar classe ativa ao link correspondente
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${targetId}`) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Adicionar evento de clique aos links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
    
    // Adicionar evento de clique aos links de conteúdo
    contentLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
    
    // Inicializar "Sistema de Alertas" quando clicado
    document.querySelector('a[href="#alerts"], .content-link[href="#alerts"]')?.addEventListener('click', () => {
        // Garantir que o AlertPanel seja inicializado
        if (typeof AlertPanel !== 'undefined' && document.getElementById('alerts-container')) {
            // A inicialização já deve acontecer via DOMContentLoaded
            console.log('Sistema de Alertas ativado');
        }
    });
}

// Adicionar à função init existente ou chamar diretamente
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    
    // Adicionar manipuladores para links de texto no conteúdo
    const alertsLink = document.querySelector('.content-link[href="#alerts"], a:contains("Sistema de Alertas")');
    if (alertsLink) {
        alertsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const alertsSection = document.getElementById('alerts');
            if (alertsSection) {
                document.querySelectorAll('main > section, section#alerts').forEach(s => s.classList.add('hidden'));
                alertsSection.classList.remove('hidden');
            }
        });
    }
});

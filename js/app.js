// Aplicação principal RUNES Analytics Pro
import runesApi from '../services/runesApi.js';

// Estado global da aplicação
const appState = {
    currentTimeframe: '24h',
    currentSection: 'dashboard',
    darkMode: localStorage.getItem('darkMode') === 'true',
    selectedToken: null,
    tokenData: [],
    alertsData: []
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar tema
    if (appState.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').src = 'assets/icons/sun.svg';
    }
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar controles de tema e timeframe
    setupControls();
    
    // Inicializar os dados
    try {
        await loadInitialData();
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showError('Falha ao carregar dados. Por favor, tente novamente mais tarde.');
    }
    
    // Configurar sistema de alertas
    setupAlerts();
});

// Configurar navegação
function setupNavigation() {
    // Navegação principal
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
    
    // Função para navegar entre seções
    window.navigateTo = function(sectionId) {
        // Ocultar todas as seções
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Mostrar a seção alvo
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
            appState.currentSection = sectionId;
        }
    };
}

// Configurar controles de tema e timeframe
function setupControls() {
    // Alternar tema claro/escuro
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            appState.darkMode = !appState.darkMode;
            document.body.classList.toggle('dark-mode');
            
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                themeIcon.src = appState.darkMode ? 'assets/icons/sun.svg' : 'assets/icons/moon.svg';
            }
            
            localStorage.setItem('darkMode', appState.darkMode);
        });
    }
    
    // Controles de timeframe
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const timeframe = btn.getAttribute('data-interval');
            
            // Atualizar botões
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            appState.currentTimeframe = timeframe;
            
            // Atualizar dados com o novo timeframe
            try {
                await updateDataWithTimeframe(timeframe);
            } catch (error) {
                console.error('Erro ao atualizar dados:', error);
                showError('Falha ao atualizar dados para o período selecionado.');
            }
        });
    });
}

// Carregar dados iniciais
async function loadInitialData() {
    showLoading(true);
    
    try {
        // Obter lista de tokens RUNES
        const tokens = await runesApi.getTopRunesTokens();
        appState.tokenData = tokens;
        
        // Renderizar tabela de tokens
        renderTokenTable(tokens);
        
        // Inicializar alertas
        loadAlerts();
        
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showError('Não foi possível carregar dados dos tokens RUNES. Verifique sua conexão.');
    } finally {
        showLoading(false);
    }
}

// Renderizar tabela de tokens
function renderTokenTable(tokens) {
    const tableBody = document.getElementById('tokenTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    tokens.forEach((token, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="token-info">
                    <span class="token-name">${token.ticker}</span>
                </div>
            </td>
            <td>${formatBTCPrice(token.price || 0)}</td>
            <td class="${getChangeClass(token.change24h)}">
                ${formatPercentage(token.change24h || 0)}
            </td>
            <td>${formatCurrency(token.volume || 0)}</td>
            <td>${formatCurrency(token.marketCap || 0)}</td>
            <td>${formatNumber(token.holders || 0)}</td>
            <td>
                <button class="btn-alert" data-token="${token.ticker}">
                    <img src="assets/icons/bell.svg" alt="Alert" width="16">
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Configurar sistema de alertas
function setupAlerts() {
    // Carregar alertas salvos
    loadAlerts();
    
    // Configurar abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todas as abas
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Ocultar todos os conteúdos
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Mostrar o conteúdo correspondente
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId)?.classList.add('active');
        });
    });
    
    // Configurar filtros
    document.getElementById('alertTypeFilter')?.addEventListener('change', filterAlerts);
    document.getElementById('alertSeverityFilter')?.addEventListener('change', filterAlerts);
}

// Carregar alertas salvos
function loadAlerts() {
    try {
        const savedAlerts = localStorage.getItem('runesAlerts');
        appState.alertsData = savedAlerts ? JSON.parse(savedAlerts) : [];
        
        renderAlerts(appState.alertsData);
    } catch (error) {
        console.error('Erro ao carregar alertas:', error);
    }
}

// Renderizar alertas
function renderAlerts(alerts) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    alertsList.innerHTML = '';
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<p class="no-data">Nenhum alerta configurado</p>';
        return;
    }
    
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${alert.severity}`;
        alertElement.dataset.type = alert.type;
        alertElement.dataset.severity = alert.severity;
        
        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-token">${alert.token}</span>
                <span class="alert-type">${formatAlertType(alert.type)}</span>
                <span class="alert-status ${alert.triggered ? 'status-triggered' : 'status-active'}">
                    ${alert.triggered ? 'Disparado' : 'Ativo'}
                </span>
            </div>
            <div class="alert-body">
                <p class="alert-condition">${formatAlertCondition(alert)}</p>
                <p class="alert-details">${formatAlertDetails(alert)}</p>
            </div>
            <div class="alert-actions">
                ${alert.triggered ? 
                    '<button class="btn-reset">Redefinir</button>' : 
                    '<button class="btn-edit">Editar</button>'}
                <button class="btn-delete">Excluir</button>
            </div>
        `;
        
        alertsList.appendChild(alertElement);
    });
}

// Filtrar alertas
function filterAlerts() {
    const typeFilter = document.getElementById('alertTypeFilter').value;
    const severityFilter = document.getElementById('alertSeverityFilter').value;
    
    document.querySelectorAll('.alert-item').forEach(item => {
        const matchesType = typeFilter === 'all' || item.dataset.type === typeFilter;
        const matchesSeverity = severityFilter === 'all' || item.dataset.severity === severityFilter;
        
        item.style.display = matchesType && matchesSeverity ? 'block' : 'none';
    });
}

// Funções utilitárias para formatação
function formatBTCPrice(price) {
    return price.toFixed(8) + ' BTC';
}

function formatPercentage(value) {
    return value.toFixed(2) + '%';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function getChangeClass(change) {
    return change >= 0 ? 'positive' : 'negative';
}

function formatAlertType(type) {
    const types = {
        'price': 'Preço',
        'volume': 'Volume',
        'whale': 'Movimento de Baleias',
        'sentiment': 'Sentimento'
    };
    return types[type] || type;
}

function formatAlertCondition(alert) {
    const conditions = {
        'above': 'acima de',
        'below': 'abaixo de',
        'increase': 'aumentar',
        'decrease': 'diminuir'
    };
    
    return `${alert.token} ${conditions[alert.condition] || alert.condition} ${alert.value}${alert.type === 'price' ? ' BTC' : '%'}`;
}

function formatAlertDetails(alert) {
    return `Criado em: ${new Date(alert.createdAt).toLocaleString('pt-BR')}`;
}

// Funções para exibir feedback na interface
function showLoading(isLoading) {
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'flex' : 'none';
    }
}

function showError(message) {
    alert(message); // Simples alerta para mostrar erros
}

// Atualizar dados com base no timeframe selecionado
async function updateDataWithTimeframe(timeframe) {
    showLoading(true);
    
    try {
        // Atualizar dados com base no timeframe
        // Implementação depende dos dados específicos a serem atualizados
        console.log(`Atualizando dados para timeframe: ${timeframe}`);
        
        // Aqui você pode adicionar lógica para atualizar gráficos, tabelas, etc.
        
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

// Exportar funções que precisam ser acessíveis globalmente
window.navigateTo = navigateTo;

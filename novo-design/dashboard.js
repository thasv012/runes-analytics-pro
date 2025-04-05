/**
 * Dashboard Principal para RUNES Analytics Pro
 * Sistema integrado com rastreador de baleias e gamificação
 */

class Dashboard {
    constructor() {
        // Referências para os sistemas
        this.whaleDetector = window.whaleDetector;
        this.gamification = window.gamificationSystem;
        this.apiManager = window.apiManager;
        
        // Estado do dashboard
        this.state = {
            activeTab: 'overview',
            timeframe: '24h',
            topTokens: [],
            whaleActivities: [],
            userLevel: 1,
            challengeProgress: null,
            isLoading: true
        };
        
        // Seletores de elementos (serão inicializados em setup)
        this.elements = {};
        
        // Inicializar
        this.setup();
    }
    
    /**
     * Configuração inicial do dashboard
     */
    async setup() {
        // Inicializar referências a elementos DOM
        this.cacheElementReferences();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar dados iniciais
        await this.loadInitialData();
        
        // Inicializar widgets
        this.initializeWidgets();
        
        // Atualizar UI
        this.updateUI();
        
        // Configurar atualizações periódicas
        this.setupPeriodicUpdates();
        
        console.log('Dashboard inicializado com sucesso');
    }
    
    /**
     * Armazena referências para elementos DOM frequentemente usados
     */
    cacheElementReferences() {
        // Containers principais
        this.elements.mainContent = document.querySelector('.main-content');
        this.elements.widgetContainer = document.querySelector('.widget-container');
        this.elements.rankingTable = document.querySelector('.ranking-table tbody');
        this.elements.whaleContainer = document.querySelector('.whale-activity-container');
        
        // Elementos de gamificação
        this.elements.userLevel = document.querySelector('.level');
        this.elements.challengeWidget = document.getElementById('challenge-widget');
        
        // Elementos de controle
        this.elements.timeframeButtons = document.querySelectorAll('.timeframe-btn');
        this.elements.refreshButton = document.querySelector('.btn-refresh');
    }
    
    /**
     * Configura event listeners para interatividade
     */
    setupEventListeners() {
        // Event listener para botão de refresh
        if (this.elements.refreshButton) {
            this.elements.refreshButton.addEventListener('click', async () => {
                this.elements.refreshButton.classList.add('rotating');
                await this.refreshData();
                this.elements.refreshButton.classList.remove('rotating');
            });
        }
        
        // Event listeners para botões de timeframe
        if (this.elements.timeframeButtons) {
            this.elements.timeframeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remover classe 'active' de todos os botões
                    this.elements.timeframeButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Adicionar classe 'active' ao botão clicado
                    button.classList.add('active');
                    
                    // Atualizar timeframe no estado
                    this.state.timeframe = button.textContent;
                    
                    // Atualizar dados com novo timeframe
                    this.refreshData();
                });
            });
        }
        
        // Event listener para detecção de movimentos de baleias
        document.addEventListener('whaleMovementDetected', (event) => {
            const whaleAlert = event.detail;
            this.handleWhaleAlert(whaleAlert);
        });
        
        // Event listeners para eventos de gamificação
        document.addEventListener('level-up', (event) => {
            this.showLevelUpNotification(event.detail);
            this.updateUserLevel();
        });
        
        document.addEventListener('achievement-unlocked', (event) => {
            this.showAchievementNotification(event.detail);
        });
        
        document.addEventListener('challenge-completed', (event) => {
            this.showChallengeCompletedNotification(event.detail);
            this.updateChallengeProgress();
        });
        
        document.addEventListener('new-challenge', () => {
            this.updateChallengeProgress();
        });
    }
    
    /**
     * Carrega dados iniciais para o dashboard
     */
    async loadInitialData() {
        try {
            this.state.isLoading = true;
            
            // Carregar ranking de tokens
            this.state.topTokens = await this.apiManager.getRunesRanking({ 
                limit: 10, 
                sortBy: 'volume', 
                sortOrder: 'desc' 
            });
            
            // Carregar movimentos de baleias recentes
            this.state.whaleActivities = await this.apiManager.getWhaleActivities({ 
                limit: 5 
            });
            
            // Carregar dados de gamificação
            const userStatus = this.gamification.getUserStatus();
            this.state.userLevel = userStatus.level;
            this.state.challengeProgress = userStatus.challengeProgress;
            
            this.state.isLoading = false;
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.state.isLoading = false;
            this.showErrorNotification('Falha ao carregar dados. Tente novamente em alguns instantes.');
        }
    }
    
    /**
     * Atualiza os dados do dashboard
     */
    async refreshData() {
        try {
            this.state.isLoading = true;
            
            // Atualizar ranking de tokens
            this.state.topTokens = await this.apiManager.getRunesRanking({ 
                limit: 10, 
                sortBy: 'volume', 
                sortOrder: 'desc',
                timeframe: this.state.timeframe
            });
            
            // Atualizar movimentos de baleias
            this.state.whaleActivities = await this.apiManager.getWhaleActivities({ 
                limit: 5,
                timeframe: this.state.timeframe
            });
            
            // Atualizar UI
            this.updateUI();
            
            this.state.isLoading = false;
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            this.state.isLoading = false;
            this.showErrorNotification('Falha ao atualizar dados. Tente novamente em alguns instantes.');
        }
    }
    
    /**
     * Configura atualizações periódicas de dados
     */
    setupPeriodicUpdates() {
        // Atualizar dados a cada 5 minutos
        setInterval(() => this.refreshData(), 5 * 60 * 1000);
        
        // Atualizar progresso de desafios a cada minuto
        setInterval(() => this.updateChallengeProgress(), 60 * 1000);
    }
    
    /**
     * Inicializa widgets dinâmicos
     */
    initializeWidgets() {
        // Inicializar widget de desafio atual
        this.createChallengeWidget();
        
        // Inicializar mini gráficos
        this.initializeCharts();
    }
    
    /**
     * Atualiza a interface do usuário com dados atuais
     */
    updateUI() {
        // Atualizar tabela de tokens
        this.updateTokensTable();
        
        // Atualizar atividades de baleias
        this.updateWhaleActivities();
        
        // Atualizar nível de usuário
        this.updateUserLevel();
        
        // Atualizar progresso de desafio
        this.updateChallengeProgress();
    }
    
    /**
     * Cria widget de desafio diário
     */
    createChallengeWidget() {
        if (!this.elements.challengeWidget) return;
        
        const challenge = this.state.challengeProgress?.challenge;
        if (!challenge) {
            this.elements.challengeWidget.innerHTML = `
                <div class="widget-header">
                    <h3 class="widget-title">Desafio Diário</h3>
                </div>
                <div class="widget-content">
                    <p>Nenhum desafio disponível no momento.</p>
                </div>
            `;
            return;
        }
        
        const progress = this.state.challengeProgress;
        this.elements.challengeWidget.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">Desafio Diário</h3>
                <div class="widget-actions">
                    <span class="badge">${challenge.icon}</span>
                </div>
            </div>
            <div class="widget-content">
                <div class="challenge-info">
                    <h4>${challenge.name}</h4>
                    <p>${challenge.description}</p>
                </div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="progress-text">
                        ${progress.current}/${progress.required} completado
                    </div>
                </div>
                <div class="challenge-reward">
                    <span class="reward-label">Recompensa:</span>
                    <span class="reward-value">${challenge.reward} pontos</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Inicializa gráficos e visualizações
     */
    initializeCharts() {
        // Função de exemplo para inicializar gráficos
        // Na implementação real, usaria uma biblioteca como Chart.js
        console.log('Inicializando gráficos');
    }
    
    /**
     * Atualiza a tabela de tokens
     */
    updateTokensTable() {
        if (!this.elements.rankingTable) return;
        
        // Limpar tabela atual
        this.elements.rankingTable.innerHTML = '';
        
        // Adicionar cada token
        this.state.topTokens.forEach((token, index) => {
            const changeClass = token.priceChange24h >= 0 ? 'positive' : 'negative';
            const changeIcon = token.priceChange24h >= 0 ? 'fa-caret-up' : 'fa-caret-down';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="rune-name-cell">
                        <div class="rune-icon">${token.ticker.charAt(0)}</div>
                        <div class="rune-info">
                            <div class="rune-ticker">${token.ticker}</div>
                            <div class="rune-fullname">${token.name}</div>
                        </div>
                    </div>
                </td>
                <td>$${token.price.toFixed(4)}</td>
                <td><span class="value-change ${changeClass}">${token.priceChange24h.toFixed(2)}% <i class="fas ${changeIcon}"></i></span></td>
                <td>$${this.formatNumber(token.volume24h)}</td>
                <td>$${this.formatNumber(token.marketCap)}</td>
                <td>
                    <div class="activity-sparkline">
                        <!-- Mini gráfico de atividade seria adicionado aqui -->
                    </div>
                </td>
                <td>
                    <button class="action-btn"><i class="fas fa-star"></i></button>
                    <button class="action-btn"><i class="fas fa-bell"></i></button>
                </td>
            `;
            
            this.elements.rankingTable.appendChild(row);
        });
    }
    
    /**
     * Atualiza as atividades de baleias
     */
    updateWhaleActivities() {
        if (!this.elements.whaleContainer) return;
        
        // Limpar container atual
        this.elements.whaleContainer.innerHTML = '';
        
        // Adicionar cada atividade de baleia
        this.state.whaleActivities.forEach(activity => {
            const activityType = this.getActivityTypeClass(activity.type);
            const impact = this.getImpactClass(activity.impactScore);
            const timeAgo = this.formatTimeAgo(activity.timestamp);
            
            const activityElement = document.createElement('div');
            activityElement.className = 'whale-activity';
            activityElement.innerHTML = `
                <div class="whale-activity-header">
                    <span class="whale-activity-type whale-${activityType}">${this.getActivityTypeName(activity.type)}</span>
                    <span class="whale-timestamp">${timeAgo}</span>
                </div>
                <div class="whale-activity-details">
                    <div class="activity-token">${activity.tokenId}</div>
                    <div class="activity-amount">${this.formatNumber(activity.amount)} ${activity.tokenId} ($${this.formatNumber(activity.value)})</div>
                    <div class="activity-address">${this.shortenAddress(activity.sender)} → ${this.shortenAddress(activity.recipient)}</div>
                </div>
                <div class="whale-activity-impact">
                    <span class="impact-label">Impacto no Preço:</span>
                    <span class="impact-value ${impact}">${this.getImpactName(activity.impactScore)}</span>
                </div>
            `;
            
            this.elements.whaleContainer.appendChild(activityElement);
        });
    }
    
    /**
     * Atualiza o nível do usuário na interface
     */
    updateUserLevel() {
        if (!this.elements.userLevel) return;
        
        const userStatus = this.gamification.getUserStatus();
        this.state.userLevel = userStatus.level;
        
        this.elements.userLevel.textContent = `${userStatus.levelTitle} ${userStatus.level}`;
        
        // Adicionar barra de progresso de XP se existir
        const xpProgress = document.querySelector('.user-xp-progress');
        if (xpProgress) {
            xpProgress.style.width = `${userStatus.xpPercentage}%`;
            xpProgress.setAttribute('aria-valuenow', userStatus.xpPercentage);
        }
    }
    
    /**
     * Atualiza o progresso de desafio atual
     */
    updateChallengeProgress() {
        const userStatus = this.gamification.getUserStatus();
        this.state.challengeProgress = userStatus.challengeProgress;
        
        // Reconstruir widget de desafio
        this.createChallengeWidget();
    }
    
    /**
     * Processa um novo alerta de baleia
     * @param {Object} alert - Alerta de baleia
     */
    handleWhaleAlert(alert) {
        // Adicionar ao início da lista
        this.state.whaleActivities.unshift(alert.transaction);
        
        // Manter apenas os 5 mais recentes
        if (this.state.whaleActivities.length > 5) {
            this.state.whaleActivities.pop();
        }
        
        // Atualizar UI
        this.updateWhaleActivities();
        
        // Mostrar notificação
        this.showWhaleAlertNotification(alert);
    }
    
    /**
     * Mostra notificação de baleia
     * @param {Object} alert - Alerta de baleia
     */
    showWhaleAlertNotification(alert) {
        const { transaction, severity } = alert;
        let severityClass = 'info';
        
        if (severity >= 4) severityClass = 'danger';
        else if (severity >= 3) severityClass = 'warning';
        else if (severity >= 2) severityClass = 'success';
        
        this.showNotification({
            title: 'Movimento de Baleia Detectado!',
            message: `${this.getActivityTypeName(transaction.type)} de ${this.formatNumber(transaction.amount)} ${transaction.tokenId} ($${this.formatNumber(transaction.value)})`,
            type: severityClass,
            icon: 'fa-whale'
        });
    }
    
    /**
     * Mostra notificação de level up
     * @param {Object} detail - Detalhes do level up
     */
    showLevelUpNotification(detail) {
        this.showNotification({
            title: 'Nível Aumentado!',
            message: `Você avançou para o nível ${detail.newLevel}! Bônus: ${detail.bonus} pontos`,
            type: 'success',
            icon: 'fa-arrow-up'
        });
    }
    
    /**
     * Mostra notificação de conquista desbloqueada
     * @param {Object} detail - Detalhes da conquista
     */
    showAchievementNotification(detail) {
        const { achievement } = detail;
        
        this.showNotification({
            title: 'Conquista Desbloqueada!',
            message: `${achievement.name}: ${achievement.description}. +${achievement.xp} XP`,
            type: 'success',
            icon: 'fa-trophy'
        });
    }
    
    /**
     * Mostra notificação de desafio completado
     * @param {Object} detail - Detalhes do desafio
     */
    showChallengeCompletedNotification(detail) {
        const { challenge, reward } = detail;
        
        this.showNotification({
            title: 'Desafio Completado!',
            message: `${challenge.name}: ${challenge.description}. +${reward} pontos`,
            type: 'success',
            icon: 'fa-check-circle'
        });
    }
    
    /**
     * Mostra notificação de erro
     * @param {String} message - Mensagem de erro
     */
    showErrorNotification(message) {
        this.showNotification({
            title: 'Erro',
            message,
            type: 'danger',
            icon: 'fa-exclamation-circle'
        });
    }
    
    /**
     * Sistema de notificação genérico
     * @param {Object} options - Opções da notificação
     */
    showNotification(options) {
        const { title, message, type = 'info', icon = 'fa-info-circle', duration = 5000 } = options;
        
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Adicionar ao container de notificações
        const container = document.querySelector('.notifications-container') || 
                         this.createNotificationContainer();
        
        container.appendChild(notification);
        
        // Configurar animação de entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Configurar remoção automática
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
        
        // Configurar botão de fechar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    /**
     * Cria container para notificações
     * @returns {HTMLElement} Container de notificações
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }
    
    /**
     * Formata um número para exibição
     * @param {Number} num - Número a ser formatado
     * @returns {String} Número formatado
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else {
            return num.toFixed(2);
        }
    }
    
    /**
     * Formata um endereço para exibição curta
     * @param {String} address - Endereço completo
     * @returns {String} Endereço abreviado
     */
    shortenAddress(address) {
        if (!address) return '';
        
        const start = address.substring(0, 5);
        const end = address.substring(address.length - 4);
        
        return `${start}...${end}`;
    }
    
    /**
     * Obtém classe CSS baseada no tipo de atividade
     * @param {String} type - Tipo de atividade (buy, sell, transfer)
     * @returns {String} Classe CSS
     */
    getActivityTypeClass(type) {
        switch (type) {
            case 'buy': return 'buy';
            case 'sell': return 'sell';
            default: return 'transfer';
        }
    }
    
    /**
     * Obtém nome do tipo de atividade
     * @param {String} type - Tipo de atividade
     * @returns {String} Nome traduzido
     */
    getActivityTypeName(type) {
        switch (type) {
            case 'buy': return 'Compra';
            case 'sell': return 'Venda';
            default: return 'Transferência';
        }
    }
    
    /**
     * Obtém classe CSS baseada na pontuação de impacto
     * @param {Number} score - Pontuação de impacto (0-100)
     * @returns {String} Classe CSS
     */
    getImpactClass(score) {
        if (score >= 80) return 'high';
        if (score >= 50) return 'medium';
        return 'low';
    }
    
    /**
     * Obtém nome do nível de impacto
     * @param {Number} score - Pontuação de impacto (0-100)
     * @returns {String} Nome do nível de impacto
     */
    getImpactName(score) {
        if (score >= 80) return 'Alto';
        if (score >= 50) return 'Médio';
        return 'Baixo';
    }
    
    /**
     * Formata tempo relativo (quanto tempo atrás)
     * @param {String|Date} date - Data/hora
     * @returns {String} Tempo formatado
     */
    formatTimeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);
        
        if (diffSec < 60) {
            return `${diffSec} seg atrás`;
        } else if (diffMin < 60) {
            return `${diffMin} min atrás`;
        } else if (diffHour < 24) {
            return `${diffHour}h atrás`;
        } else {
            return `${diffDay}d atrás`;
        }
    }
}

// Inicializar dashboard quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
}); 
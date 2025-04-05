/**
 * RUNES Analytics Pro - Componente de Gamificação do Dashboard
 * Implementa elementos de gamificação para aumentar o engajamento do usuário
 * com recursos como pontos, níveis, conquistas e previsões de mercado
 */

class RunesGamification {
    constructor() {
        // Dados do usuário (em produção, viria de um banco de dados)
        this.userData = {
            username: 'Investidor RUNES',
            level: 3,
            xp: 720,
            xpToNextLevel: 1000,
            points: 480,
            streak: 5, // Dias consecutivos de login
            achievements: [],
            badges: [],
            predictions: []
        };
        
        // Níveis e seus requisitos
        this.levels = [
            { level: 1, name: 'Novato em RUNES', xpRequired: 0 },
            { level: 2, name: 'Explorador de RUNES', xpRequired: 250 },
            { level: 3, name: 'Analista de RUNES', xpRequired: 500 },
            { level: 4, name: 'Especialista em RUNES', xpRequired: 1000 },
            { level: 5, name: 'Mestre de RUNES', xpRequired: 2000 },
            { level: 6, name: 'Guru de RUNES', xpRequired: 3500 },
            { level: 7, name: 'Oráculo de RUNES', xpRequired: 5000 },
            { level: 8, name: 'Lenda das RUNES', xpRequired: 7500 },
            { level: 9, name: 'Visionário RUNES', xpRequired: 10000 },
            { level: 10, name: 'Baleia RUNES', xpRequired: 15000 }
        ];
        
        // Todas as conquistas disponíveis
        this.availableAchievements = [
            { id: 'first-login', name: 'Primeira Expedição', description: 'Faça seu primeiro login', icon: '🚀', xpReward: 50, completed: true },
            { id: 'streak-5', name: 'Comprometido', description: 'Faça login por 5 dias consecutivos', icon: '📅', xpReward: 100, completed: true },
            { id: 'streak-30', name: 'Dedicação Total', description: 'Faça login por 30 dias consecutivos', icon: '🔥', xpReward: 500, completed: false },
            { id: 'whale-spot-1', name: 'Olho da Baleia', description: 'Identifique sua primeira transação de baleia', icon: '🐋', xpReward: 150, completed: true },
            { id: 'whale-spot-10', name: 'Caçador de Baleias', description: 'Identifique 10 transações de baleias', icon: '🔍', xpReward: 300, completed: false },
            { id: 'correct-prediction', name: 'Vidente', description: 'Acerte sua primeira previsão de mercado', icon: '🔮', xpReward: 200, completed: true },
            { id: 'prediction-streak-3', name: 'Em Rajada', description: 'Acerte 3 previsões consecutivas', icon: '🎯', xpReward: 250, completed: false },
            { id: 'sentiment-master', name: 'Mestre dos Sentimentos', description: 'Analise sentimentos por 7 dias consecutivos', icon: '😎', xpReward: 200, completed: false },
            { id: 'alert-setup', name: 'Sempre Vigilante', description: 'Configure 5 alertas diferentes', icon: '🔔', xpReward: 100, completed: true },
            { id: 'share-insight', name: 'Influenciador Crypto', description: 'Compartilhe uma análise nas redes sociais', icon: '📱', xpReward: 150, completed: false }
        ];
        
        // Emblemas desbloqueados
        this.unlockedBadges = [
            { id: 'analyst-badge', name: 'Analista Bronze', icon: '🥉', description: 'Alcance o nível 3', date: '10/06/2023' },
            { id: 'prediction-badge', name: 'Oráculo Iniciante', icon: '🔮', description: 'Acerte 5 previsões', date: '15/06/2023' },
            { id: 'streak-badge', name: 'Determinado', icon: '📅', description: '5 dias consecutivos', date: '18/06/2023' }
        ];
        
        // Eventos de mercado para previsões
        this.marketEvents = [
            { id: 'event-1', title: 'DOG ultrapassará 0.0030 sats hoje?', endTime: new Date(Date.now() + 6 * 3600000) },
            { id: 'event-2', title: 'MAGIC terá volume maior que $10M nas próximas 24h?', endTime: new Date(Date.now() + 24 * 3600000) },
            { id: 'event-3', title: 'CYPHER terá um aumento de mais de 20% esta semana?', endTime: new Date(Date.now() + 7 * 24 * 3600000) }
        ];
    }
    
    /**
     * Inicializa o componente de gamificação
     */
    async initialize() {
        console.log('Inicializando componente de gamificação...');
        
        // Encontrar o container para o componente
        this.container = document.getElementById('gamification-container') || 
                         document.getElementById('dashboard-content') ||
                         document.querySelector('.dashboard-section-content');
                         
        if (!this.container) {
            console.error('Container para gamificação não encontrado');
            return false;
        }
        
        // Renderizar os elementos de gamificação
        this.renderGamificationElements();
        
        // Adicionar event listeners
        this.setupEventListeners();
        
        // Verificar conquistas em segundo plano
        this.checkAchievements();
        
        return true;
    }
    
    /**
     * Renderiza os elementos de gamificação na interface
     */
    renderGamificationElements() {
        // Criar o painel de gamificação
        const gamificationPanel = document.createElement('div');
        gamificationPanel.className = 'gamification-panel';
        
        // Construir o HTML do painel
        gamificationPanel.innerHTML = `
            <div class="gamification-header">
                <div class="user-profile">
                    <div class="user-avatar">${this.getLevelIcon(this.userData.level)}</div>
                    <div class="user-info">
                        <div class="username">${this.userData.username}</div>
                        <div class="user-level-title">${this.getLevelTitle(this.userData.level)}</div>
                    </div>
                </div>
                
                <div class="user-metrics">
                    <div class="metric-box">
                        <div class="metric-label">Nível</div>
                        <div class="metric-value">${this.userData.level}</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Pontos</div>
                        <div class="metric-value">${this.userData.points}</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Sequência</div>
                        <div class="metric-value">🔥 ${this.userData.streak}</div>
                    </div>
                </div>
            </div>
            
            <div class="progress-container">
                <div class="xp-bar">
                    <div class="xp-progress" style="width: ${this.calculateXpPercentage()}%"></div>
                </div>
                <div class="xp-text">${this.userData.xp}/${this.userData.xpToNextLevel} XP para o nível ${this.userData.level + 1}</div>
            </div>
            
            <div class="gamification-tabs">
                <button class="tab-button active" data-tab="achievements">Conquistas</button>
                <button class="tab-button" data-tab="badges">Emblemas</button>
                <button class="tab-button" data-tab="predictions">Previsões</button>
            </div>
            
            <div class="gamification-content">
                <div class="tab-content active" id="achievements-tab">
                    <h3>Suas Conquistas</h3>
                    <div class="achievements-grid">
                        ${this.renderAchievements()}
                    </div>
                </div>
                
                <div class="tab-content" id="badges-tab">
                    <h3>Seus Emblemas</h3>
                    <div class="badges-grid">
                        ${this.renderBadges()}
                    </div>
                </div>
                
                <div class="tab-content" id="predictions-tab">
                    <h3>Previsões de Mercado</h3>
                    <div class="predictions-list">
                        ${this.renderPredictions()}
                    </div>
                    <button class="view-all-predictions">Ver histórico completo</button>
                </div>
            </div>
            
            <div class="daily-challenge">
                <h3>Desafio Diário</h3>
                <div class="challenge-content">
                    <div class="challenge-icon">🎯</div>
                    <div class="challenge-info">
                        <div class="challenge-title">Identifique 3 movimentos de baleias hoje</div>
                        <div class="challenge-progress">Progresso: 1/3</div>
                    </div>
                    <div class="challenge-reward">+100 XP</div>
                </div>
            </div>
        `;
        
        // Adicionar o painel ao container
        this.container.appendChild(gamificationPanel);
    }
    
    /**
     * Calcula a porcentagem de XP para o próximo nível
     */
    calculateXpPercentage() {
        const currentLevel = this.levels.find(l => l.level === this.userData.level);
        const nextLevel = this.levels.find(l => l.level === this.userData.level + 1);
        
        if (!currentLevel || !nextLevel) return 0;
        
        const currentLevelXp = currentLevel.xpRequired;
        const xpInCurrentLevel = this.userData.xp - currentLevelXp;
        const xpRequiredForNextLevel = nextLevel.xpRequired - currentLevelXp;
        
        return Math.min(100, Math.floor((xpInCurrentLevel / xpRequiredForNextLevel) * 100));
    }
    
    /**
     * Renderiza a lista de conquistas
     */
    renderAchievements() {
        let html = '';
        
        // Mostrar primeiro as conquistas já completadas
        const completedAchievements = this.availableAchievements.filter(a => a.completed);
        const incompleteAchievements = this.availableAchievements.filter(a => !a.completed);
        const allAchievements = [...completedAchievements, ...incompleteAchievements];
        
        allAchievements.forEach(achievement => {
            const achievementClass = achievement.completed ? 'achievement completed' : 'achievement locked';
            
            html += `
                <div class="${achievementClass}" data-achievement-id="${achievement.id}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                    <div class="achievement-reward">+${achievement.xpReward} XP</div>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Renderiza a lista de emblemas
     */
    renderBadges() {
        if (this.unlockedBadges.length === 0) {
            return '<div class="no-badges">Você ainda não desbloqueou nenhum emblema.</div>';
        }
        
        let html = '';
        this.unlockedBadges.forEach(badge => {
            html += `
                <div class="badge-card" data-badge-id="${badge.id}">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-info">
                        <div class="badge-name">${badge.name}</div>
                        <div class="badge-description">${badge.description}</div>
                        <div class="badge-date">Obtido em: ${badge.date}</div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Renderiza a lista de previsões de mercado
     */
    renderPredictions() {
        if (this.marketEvents.length === 0) {
            return '<div class="no-predictions">Não há eventos de mercado ativos no momento.</div>';
        }
        
        let html = '';
        this.marketEvents.forEach(event => {
            const timeLeft = this.formatTimeLeft(event.endTime);
            const userPrediction = this.userData.predictions.find(p => p.eventId === event.id);
            
            let predictionStatus = '';
            if (userPrediction) {
                predictionStatus = `
                    <div class="user-prediction">
                        Sua previsão: <span class="prediction-vote">${userPrediction.prediction ? 'SIM' : 'NÃO'}</span>
                    </div>
                `;
            } else {
                predictionStatus = `
                    <div class="prediction-buttons">
                        <button class="predict-yes" data-event-id="${event.id}">SIM</button>
                        <button class="predict-no" data-event-id="${event.id}">NÃO</button>
                    </div>
                `;
            }
            
            html += `
                <div class="prediction-card" data-event-id="${event.id}">
                    <div class="prediction-title">${event.title}</div>
                    <div class="prediction-time">Encerra em: ${timeLeft}</div>
                    ${predictionStatus}
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Configura os event listeners para interatividade
     */
    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover classe ativa de todos os botões e conteúdos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Adicionar classe ativa ao botão clicado
                button.classList.add('active');
                
                // Mostrar conteúdo correspondente
                const tabId = button.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Previsões de mercado
        const predictionButtons = document.querySelectorAll('.predict-yes, .predict-no');
        predictionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.eventId;
                const prediction = e.target.classList.contains('predict-yes');
                
                this.makePrediction(eventId, prediction);
                
                // Atualizar a interface
                const predictionCard = document.querySelector(`.prediction-card[data-event-id="${eventId}"]`);
                const buttonsContainer = predictionCard.querySelector('.prediction-buttons');
                
                buttonsContainer.innerHTML = `
                    <div class="user-prediction">
                        Sua previsão: <span class="prediction-vote">${prediction ? 'SIM' : 'NÃO'}</span>
                    </div>
                `;
                
                // Adicionar animação de notificação
                this.showNotification(`Previsão registrada! +10 XP se você acertar.`);
                
                // Adicionar XP por participar
                this.addXp(5, 'Participação em previsão');
            });
        });
    }
    
    /**
     * Adiciona uma nova previsão feita pelo usuário
     */
    makePrediction(eventId, prediction) {
        // Adicionar à lista de previsões do usuário
        this.userData.predictions.push({
            eventId,
            prediction,
            timestamp: new Date(),
            resolved: false,
            wasCorrect: null
        });
        
        console.log(`Previsão registrada para o evento ${eventId}: ${prediction ? 'SIM' : 'NÃO'}`);
    }
    
    /**
     * Verifica se o usuário completou alguma conquista nova
     */
    checkAchievements() {
        // Em uma aplicação real, aqui verificaríamos condições baseadas nas ações do usuário
        // Para este exemplo, vamos apenas simular uma nova conquista após um tempo
        
        setTimeout(() => {
            // Simular completar a conquista "Caçador de Baleias"
            const achievement = this.availableAchievements.find(a => a.id === 'whale-spot-10');
            if (achievement && !achievement.completed) {
                achievement.completed = true;
                
                // Reproduzir som de conquista
                if (window.runesSoundManager) {
                    window.runesSoundManager.play('achievement');
                }
                
                // Mostrar notificação
                this.showNotification(`🎉 Nova conquista: ${achievement.name}! +${achievement.xpReward} XP`);
                
                // Adicionar XP
                this.addXp(achievement.xpReward, `Conquista: ${achievement.name}`);
                
                // Atualizar a interface
                document.querySelector(`[data-achievement-id="${achievement.id}"]`).classList.add('completed');
                document.querySelector(`[data-achievement-id="${achievement.id}"]`).classList.remove('locked');
            }
        }, 30000); // Simular após 30 segundos para demonstração
    }
    
    /**
     * Adiciona XP ao usuário e verifica subida de nível
     */
    addXp(amount, reason) {
        const oldLevel = this.userData.level;
        this.userData.xp += amount;
        
        // Verificar se subiu de nível
        for (let i = 0; i < this.levels.length; i++) {
            if (this.userData.xp >= this.levels[i].xpRequired) {
                this.userData.level = this.levels[i].level;
            } else {
                break;
            }
        }
        
        // Atualizar XP para próximo nível
        const nextLevel = this.levels.find(l => l.level === this.userData.level + 1);
        if (nextLevel) {
            this.userData.xpToNextLevel = nextLevel.xpRequired;
        }
        
        // Se subiu de nível, mostrar animação e atualizar interface
        if (this.userData.level > oldLevel) {
            this.showLevelUpAnimation(this.userData.level);
            
            // Reproduzir som de level up
            if (window.runesSoundManager) {
                window.runesSoundManager.play('levelUp');
            }
        } else {
            // Reproduzir som de ganho de XP
            if (window.runesSoundManager) {
                window.runesSoundManager.play('success');
            }
        }
        
        // Atualizar barra de progresso
        const progressBar = document.querySelector('.xp-progress');
        if (progressBar) {
            progressBar.style.width = `${this.calculateXpPercentage()}%`;
        }
        
        // Atualizar texto de XP
        const xpText = document.querySelector('.xp-text');
        if (xpText) {
            xpText.textContent = `${this.userData.xp}/${this.userData.xpToNextLevel} XP para o nível ${this.userData.level + 1}`;
        }
        
        // Adicionar ao log (em produção, salvaria no servidor)
        console.log(`XP adicionado: +${amount} por "${reason}". Total: ${this.userData.xp}, Nível: ${this.userData.level}`);
    }
    
    /**
     * Exibe uma animação de subida de nível
     */
    showLevelUpAnimation(newLevel) {
        const levelUpModal = document.createElement('div');
        levelUpModal.className = 'level-up-modal';
        
        levelUpModal.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎖️</div>
                <h2>Subiu de Nível!</h2>
                <div class="new-level">Nível ${newLevel}</div>
                <div class="level-title">${this.getLevelTitle(newLevel)}</div>
                <div class="level-rewards">
                    <p>Desbloqueou:</p>
                    <ul>
                        <li>+100 pontos de bônus</li>
                        <li>Novo emblema disponível</li>
                        <li>Novas funcionalidades de análise</li>
                    </ul>
                </div>
                <button class="close-level-up">Continuar</button>
            </div>
        `;
        
        document.body.appendChild(levelUpModal);
        
        // Adicionar evento ao botão
        const closeButton = levelUpModal.querySelector('.close-level-up');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(levelUpModal);
        });
        
        // Atualizar métricas na interface
        document.querySelector('.metric-value').textContent = this.userData.level;
        document.querySelector('.user-level-title').textContent = this.getLevelTitle(newLevel);
    }
    
    /**
     * Exibe uma notificação temporária
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'gamification-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Reproduzir som de notificação
        if (window.runesSoundManager) {
            window.runesSoundManager.play('notification');
        }
        
        // Fade in
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Fade out e remover após 3 segundos
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Métodos auxiliares
    
    /**
     * Obtém o título correspondente ao nível do usuário
     */
    getLevelTitle(level) {
        const levelInfo = this.levels.find(l => l.level === level);
        return levelInfo ? levelInfo.name : 'Desconhecido';
    }
    
    /**
     * Retorna um ícone apropriado para o nível
     */
    getLevelIcon(level) {
        if (level >= 10) return '👑';
        if (level >= 7) return '🔱';
        if (level >= 5) return '⭐';
        if (level >= 3) return '🔷';
        return '🔹';
    }
    
    /**
     * Formata o tempo restante para exibição
     */
    formatTimeLeft(endTime) {
        const now = new Date();
        const diffMs = endTime - now;
        
        if (diffMs <= 0) return 'Encerrado';
        
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 24) {
            return `${diffHours}h`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} dias`;
        }
    }
}

// Exportar a classe para uso global
window.RunesGamification = RunesGamification; 
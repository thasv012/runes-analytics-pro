class RunesGamification {
    constructor() {
        this.userData = {
            username: 'Usuário',
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            joinDate: new Date(),
            achievements: [],
            badges: [],
            predictions: [],
            premium: false
        };
        
        this.levels = [
            { level: 1, xpRequired: 0, unlocks: ['Análise de Sentimentos Básica'] },
            { level: 2, xpRequired: 100, unlocks: ['Rastreamento de Baleias Limitado'] },
            { level: 3, xpRequired: 250, unlocks: ['Ferramentas de Análise Técnica'] },
            { level: 4, xpRequired: 500, unlocks: ['Alerta de Preço', 'Notificações Básicas'] },
            { level: 5, xpRequired: 1000, unlocks: ['Análise de Sentimentos Avançada'] },
            { level: 6, xpRequired: 2000, unlocks: ['Rastreamento de Baleias Completo'] },
            { level: 7, xpRequired: 3500, unlocks: ['Análise Técnica Avançada (Fibonacci)'] },
            { level: 8, xpRequired: 5500, unlocks: ['Análise On-Chain', 'Notificações Avançadas'] },
            { level: 9, xpRequired: 8000, unlocks: ['Acesso a API de Dados'] },
            { level: 10, xpRequired: 12000, unlocks: ['Análise Preditiva com IA', 'Alertas Personalizados Ilimitados'] }
        ];
        
        this.achievementList = [
            { id: 'first_login', name: 'Primeiro Passo', description: 'Faça seu primeiro login na plataforma', xp: 10, icon: 'trophy', completed: true },
            { id: 'analysis_master', name: 'Mestre da Análise', description: 'Visualize mais de 50 análises técnicas', xp: 50, icon: 'chart-line', completed: false },
            { id: 'sentiment_guru', name: 'Guru do Sentimento', description: 'Analise o sentimento de 20 tokens diferentes', xp: 30, icon: 'smile', completed: false },
            { id: 'whale_watcher', name: 'Observador de Baleias', description: 'Identifique 5 movimentos de baleias antes que eles afetem o mercado', xp: 75, icon: 'eye', completed: false },
            { id: 'prediction_pro', name: 'Profissional em Previsões', description: 'Acerte 10 previsões consecutivas de movimentos do mercado', xp: 100, icon: 'bullseye', completed: false },
            { id: 'sharing_wizard', name: 'Mago do Compartilhamento', description: 'Compartilhe análises nas redes sociais 15 vezes', xp: 45, icon: 'share-alt', completed: false },
            { id: 'login_streak', name: 'Compromisso Diário', description: 'Faça login por 7 dias consecutivos', xp: 25, icon: 'calendar-check', completed: false },
            { id: 'portfolio_master', name: 'Mestre do Portfólio', description: 'Monitore um portfólio de pelo menos 10 tokens', xp: 40, icon: 'wallet', completed: false }
        ];
        
        this.badgeList = [
            { id: 'novice', name: 'Novato', description: 'Recém-chegado ao mundo de análise cripto', icon: 'user-graduate', level: 1 },
            { id: 'analyst', name: 'Analista', description: 'Está desenvolvendo suas habilidades de análise', icon: 'chart-bar', level: 3 },
            { id: 'expert', name: 'Especialista', description: 'Domina diversas técnicas de análise', icon: 'user-tie', level: 5 },
            { id: 'master', name: 'Mestre', description: 'Um guru respeitado na comunidade', icon: 'crown', level: 7 },
            { id: 'oracle', name: 'Oráculo', description: 'Previsões com precisão sobrenatural', icon: 'gem', level: 10 }
        ];
        
        this.marketEvents = [
            { name: 'Alta do Bitcoin', startDate: new Date(Date.now() - 86400000 * 2), endDate: new Date(Date.now() + 86400000 * 5) },
            { name: 'Lançamento de RUNES', startDate: new Date(Date.now() - 86400000 * 5), endDate: new Date(Date.now() + 86400000 * 2) },
            { name: 'Evento de Queima', startDate: new Date(Date.now() + 86400000 * 3), endDate: new Date(Date.now() + 86400000 * 4) },
            { name: 'Reunião da FED', startDate: new Date(Date.now() + 86400000 * 7), endDate: new Date(Date.now() + 86400000 * 7) }
        ];
        
        this.dailyTasks = [
            { id: 'login', name: 'Login Diário', description: 'Faça login na plataforma', xp: 5, completed: true },
            { id: 'analysis', name: 'Realizar Análise', description: 'Realize uma análise técnica', xp: 10, completed: false },
            { id: 'prediction', name: 'Fazer Previsão', description: 'Faça uma previsão de mercado', xp: 15, completed: false },
            { id: 'share', name: 'Compartilhar', description: 'Compartilhe uma análise', xp: 10, completed: false }
        ];
        
        this.tiersAndRewards = [
            { tier: 'Bronze', requirements: 'Nível 1-3', rewards: ['Acesso a indicadores básicos', 'Alertas de preço (limite: 3)'] },
            { tier: 'Prata', requirements: 'Nível 4-6', rewards: ['Indicadores técnicos avançados', 'Alertas de preço (limite: 10)', 'Rastreamento de baleias'] },
            { tier: 'Ouro', requirements: 'Nível 7-9', rewards: ['Análise Fibonacci', 'Estratégias personalizadas', 'Alertas ilimitados', 'Análise on-chain'] },
            { tier: 'Diamante', requirements: 'Nível 10', rewards: ['Análise preditiva com IA', 'Acesso à API', 'Recompensas exclusivas', 'Suporte prioritário'] }
        ];
    }

    init() {
        this.ensureContainersExist();
        this.renderGamificationPanel();
        this.setupEventListeners();
        this.checkForAchievements();
        this.updateUserBadges();
        
        // Simular ganho de XP após algumas ações
        setTimeout(() => {
            this.awardXP(15, 'Análise técnica realizada');
        }, 3000);
        
        // Definir tarefas diárias para reiniciar à meia-noite
        this.setDailyReset();
    }

    ensureContainersExist() {
        const gamificationSection = document.getElementById('gamification-section');
        
        if (!gamificationSection) {
            const mainContent = document.querySelector('.main-content');
            
            if (mainContent) {
                const newSection = document.createElement('section');
                newSection.id = 'gamification-section';
                newSection.className = 'content-section hidden';
                mainContent.appendChild(newSection);
            }
        }
    }

    renderGamificationPanel() {
        const gamificationSection = document.getElementById('gamification-section');
        
        if (!gamificationSection) return;
        
        // Obter próximo nível
        const currentLevel = this.userData.level;
        const nextLevel = this.levels.find(l => l.level === currentLevel + 1);
        
        // Encontrar o tier atual
        const currentTier = this.tiersAndRewards.find(tier => {
            const tierRange = tier.requirements.replace('Nível ', '').split('-');
            const minLevel = parseInt(tierRange[0]);
            const maxLevel = tierRange.length > 1 ? parseInt(tierRange[1]) : 100;
            return currentLevel >= minLevel && currentLevel <= maxLevel;
        });
        
        // Determinar progresso do nível
        let xpPercentage = 0;
        if (nextLevel) {
            const currentLevelObj = this.levels.find(l => l.level === currentLevel);
            const totalXpForLevel = nextLevel.xpRequired - currentLevelObj.xpRequired;
            const userXpInLevel = this.userData.xp - currentLevelObj.xpRequired;
            xpPercentage = Math.round((userXpInLevel / totalXpForLevel) * 100);
        } else {
            xpPercentage = 100; // Nível máximo
        }
        
        // Criar a estrutura HTML
        gamificationSection.innerHTML = `
            <h2 class="section-title">Centro de Gamificação</h2>
            
            <div class="gamification-dashboard">
                <div class="user-level-panel">
                    <div class="user-profile">
                        <div class="user-avatar">
                            <i class="fas fa-user-circle"></i>
                            <span class="user-level-badge">${this.userData.level}</span>
                        </div>
                        <div class="user-info">
                            <h3 class="user-name">${this.userData.username}</h3>
                            <div class="user-tier ${currentTier.tier.toLowerCase()}-tier">
                                <i class="fas fa-${this.getTierIcon(currentTier.tier)}"></i> 
                                Tier ${currentTier.tier}
                            </div>
                            <div class="level-progress">
                                <div class="level-bar">
                                    <div class="level-fill" style="width: ${xpPercentage}%"></div>
                                </div>
                                <div class="level-text">
                                    <span>Nível ${currentLevel}</span>
                                    <span>${this.userData.xp} / ${nextLevel ? nextLevel.xpRequired : 'MAX'} XP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="level-benefits">
                        <h3 class="panel-title">Benefícios do Nível</h3>
                        
                        <div class="current-benefits">
                            <h4>Benefícios Atuais</h4>
                            <ul class="benefits-list">
                                ${this.levels.find(l => l.level === currentLevel).unlocks.map(unlock => 
                                    `<li><i class="fas fa-check"></i> ${unlock}</li>`
                                ).join('')}
                            </ul>
                        </div>
                        
                        ${nextLevel ? `
                        <div class="next-level-benefits">
                            <h4>Próximo Nível (${currentLevel + 1})</h4>
                            <ul class="benefits-list locked">
                                ${nextLevel.unlocks.map(unlock => 
                                    `<li><i class="fas fa-lock"></i> ${unlock}</li>`
                                ).join('')}
                            </ul>
                            <div class="xp-needed">
                                <span>Faltam ${nextLevel.xpRequired - this.userData.xp} XP para desbloquear</span>
                            </div>
                        </div>
                        ` : `
                        <div class="max-level-reached">
                            <h4>Nível Máximo Atingido!</h4>
                            <p>Parabéns! Você alcançou o nível máximo e desbloqueou todos os benefícios.</p>
                        </div>
                        `}
                    </div>
                </div>
                
                <div class="achievements-panel">
                    <h3 class="panel-title">Conquistas <span class="counter">${this.userData.achievements.length}/${this.achievementList.length}</span></h3>
                    
                    <div class="achievements-grid">
                        ${this.achievementList.map(achievement => `
                            <div class="achievement-card ${achievement.completed ? 'completed' : 'locked'}">
                                <div class="achievement-icon">
                                    <i class="fas fa-${achievement.icon}"></i>
                                </div>
                                <div class="achievement-info">
                                    <h4>${achievement.name}</h4>
                                    <p>${achievement.description}</p>
                                    <span class="achievement-xp">+${achievement.xp} XP</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="gamification-columns">
                    <div class="badges-panel">
                        <h3 class="panel-title">Medalhas</h3>
                        
                        <div class="badges-grid">
                            ${this.badgeList.map(badge => {
                                const unlocked = this.userData.level >= badge.level;
                                return `
                                    <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}">
                                        <div class="badge-icon">
                                            <i class="fas fa-${badge.icon}"></i>
                                        </div>
                                        <div class="badge-info">
                                            <h4>${badge.name}</h4>
                                            <p>${badge.description}</p>
                                            <span class="badge-requirement">Nível ${badge.level}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="daily-tasks-panel">
                        <h3 class="panel-title">Tarefas Diárias</h3>
                        
                        <div class="daily-tasks-list">
                            ${this.dailyTasks.map(task => `
                                <div class="task-card ${task.completed ? 'completed' : ''}">
                                    <div class="task-checkbox">
                                        <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                                    </div>
                                    <div class="task-info">
                                        <h4>${task.name}</h4>
                                        <p>${task.description}</p>
                                    </div>
                                    <div class="task-reward">
                                        <span>+${task.xp} XP</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="tasks-reset-time">
                            <i class="fas fa-sync-alt"></i>
                            Reinicia à meia-noite
                        </div>
                    </div>
                </div>
                
                <div class="prediction-panel">
                    <h3 class="panel-title">Previsões de Mercado</h3>
                    
                    <div class="prediction-controls">
                        <button id="new-prediction-btn" class="action-button">
                            <i class="fas fa-plus"></i> Nova Previsão
                        </button>
                        
                        <div class="prediction-filter">
                            <select id="prediction-filter" class="styled-select">
                                <option value="all">Todas</option>
                                <option value="active">Ativas</option>
                                <option value="completed">Concluídas</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="active-predictions">
                        <div class="empty-predictions">
                            <i class="far fa-chart-bar"></i>
                            <p>Nenhuma previsão ativa no momento</p>
                            <button id="start-prediction-btn" class="action-button">
                                Começar a prever
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="rewards-panel">
                    <h3 class="panel-title">Sistema de Recompensas</h3>
                    
                    <div class="tier-progression">
                        <div class="tier-track">
                            ${this.tiersAndRewards.map((tier, index) => `
                                <div class="tier-node ${this.isTierUnlocked(tier) ? 'unlocked' : 'locked'}">
                                    <div class="tier-icon">
                                        <i class="fas fa-${this.getTierIcon(tier.tier)}"></i>
                                    </div>
                                    <span class="tier-name">${tier.tier}</span>
                                </div>
                                ${index < this.tiersAndRewards.length - 1 ? '<div class="tier-connector"></div>' : ''}
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="rewards-grid">
                        ${this.tiersAndRewards.map(tier => `
                            <div class="reward-card ${this.isTierUnlocked(tier) ? 'unlocked' : 'locked'}">
                                <div class="reward-header ${tier.tier.toLowerCase()}-tier">
                                    <i class="fas fa-${this.getTierIcon(tier.tier)}"></i>
                                    <h4>${tier.tier}</h4>
                                </div>
                                <div class="reward-requirements">
                                    <p>${tier.requirements}</p>
                                </div>
                                <ul class="reward-list">
                                    ${tier.rewards.map(reward => `
                                        <li><i class="fas fa-gift"></i> ${reward}</li>
                                    `).join('')}
                                </ul>
                                <div class="reward-status">
                                    ${this.isTierUnlocked(tier) ? 
                                        '<span class="unlocked-status"><i class="fas fa-check-circle"></i> Desbloqueado</span>' : 
                                        '<span class="locked-status"><i class="fas fa-lock"></i> Bloqueado</span>'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="events-panel">
                    <h3 class="panel-title">Eventos do Mercado</h3>
                    
                    <div class="events-timeline">
                        ${this.marketEvents.map(event => {
                            const isActive = new Date() >= event.startDate && new Date() <= event.endDate;
                            const isUpcoming = new Date() < event.startDate;
                            const isPast = new Date() > event.endDate;
                            
                            let statusClass = isActive ? 'active' : (isUpcoming ? 'upcoming' : 'past');
                            
                            return `
                                <div class="event-card ${statusClass}">
                                    <div class="event-status">
                                        <i class="fas ${this.getEventStatusIcon(statusClass)}"></i>
                                    </div>
                                    <div class="event-info">
                                        <h4>${event.name}</h4>
                                        <p>
                                            ${this.formatEventDates(event.startDate, event.endDate)}
                                        </p>
                                    </div>
                                    <div class="event-action">
                                        ${isActive || isUpcoming ? 
                                            '<button class="event-button">Fazer previsão</button>' : 
                                            '<span class="event-result">Concluído</span>'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="xp-history-panel">
                    <h3 class="panel-title">Histórico de XP <button id="xp-history-toggle" class="toggle-btn"><i class="fas fa-chevron-down"></i></button></h3>
                    
                    <div class="xp-history-content" style="display: none;">
                        <div class="xp-timeline">
                            <div class="xp-event">
                                <div class="xp-timestamp">Hoje, 10:45</div>
                                <div class="xp-action">Análise técnica realizada</div>
                                <div class="xp-amount">+15 XP</div>
                            </div>
                            <div class="xp-event">
                                <div class="xp-timestamp">Hoje, 09:30</div>
                                <div class="xp-action">Login diário</div>
                                <div class="xp-amount">+5 XP</div>
                            </div>
                            <div class="xp-event">
                                <div class="xp-timestamp">Ontem, 14:22</div>
                                <div class="xp-action">Conquista desbloqueada: Primeiro Passo</div>
                                <div class="xp-amount">+10 XP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Toggle para história de XP
        const xpHistoryToggle = document.getElementById('xp-history-toggle');
        if (xpHistoryToggle) {
            xpHistoryToggle.addEventListener('click', () => {
                const content = document.querySelector('.xp-history-content');
                const icon = xpHistoryToggle.querySelector('i');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    content.style.display = 'none';
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });
        }
        
        // Botão de nova previsão
        const newPredictionBtn = document.getElementById('new-prediction-btn');
        if (newPredictionBtn) {
            newPredictionBtn.addEventListener('click', () => {
                this.showPredictionModal();
            });
        }
        
        // Botão alternativo de começar previsão
        const startPredictionBtn = document.getElementById('start-prediction-btn');
        if (startPredictionBtn) {
            startPredictionBtn.addEventListener('click', () => {
                this.showPredictionModal();
            });
        }
        
        // Botões de eventos
        const eventButtons = document.querySelectorAll('.event-button');
        eventButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const eventName = this.marketEvents[index].name;
                this.showPredictionModal(eventName);
            });
        });
    }

    showPredictionModal(eventName = null) {
        // Em uma implementação real, aqui abriria um modal para criar previsões
        alert(`Funcionalidade de previsões estará disponível em breve!${eventName ? ` Evento selecionado: ${eventName}` : ''}`);
    }
    
    awardXP(amount, reason) {
        this.userData.xp += amount;
        
        // Verificar se subiu de nível
        const currentLevelObj = this.levels.find(l => l.level === this.userData.level);
        const nextLevelObj = this.levels.find(l => l.level === this.userData.level + 1);
        
        if (nextLevelObj && this.userData.xp >= nextLevelObj.xpRequired) {
            this.userData.level++;
            this.showLevelUpNotification();
            
            // Atualizar interface de gamificação
            this.renderGamificationPanel();
            this.updateUserBadges();
            
            // Verificar se desbloqueou algo novo
            const unlockedFeatures = nextLevelObj.unlocks;
            if (unlockedFeatures && unlockedFeatures.length > 0) {
                this.showUnlockNotification(unlockedFeatures);
            }
        } else {
            // Apenas mostrar notificação de XP
            this.showXPNotification(amount, reason);
            
            // Atualizar só a barra de progresso
            this.updateXPProgress();
        }
        
        // Adicionar ao histórico de XP
        this.addXPHistoryEntry(amount, reason);
    }
    
    addXPHistoryEntry(amount, reason) {
        const xpTimeline = document.querySelector('.xp-timeline');
        if (!xpTimeline) return;
        
        const now = new Date();
        const timeString = `Hoje, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const xpEvent = document.createElement('div');
        xpEvent.className = 'xp-event new-entry';
        xpEvent.innerHTML = `
            <div class="xp-timestamp">${timeString}</div>
            <div class="xp-action">${reason}</div>
            <div class="xp-amount">+${amount} XP</div>
        `;
        
        // Inserir no início da timeline
        xpTimeline.insertBefore(xpEvent, xpTimeline.firstChild);
        
        // Animação de entrada
        setTimeout(() => {
            xpEvent.classList.remove('new-entry');
        }, 10);
    }
    
    updateXPProgress() {
        const currentLevelObj = this.levels.find(l => l.level === this.userData.level);
        const nextLevelObj = this.levels.find(l => l.level === this.userData.level + 1);
        
        if (!currentLevelObj || !nextLevelObj) return;
        
        const totalXpForLevel = nextLevelObj.xpRequired - currentLevelObj.xpRequired;
        const userXpInLevel = this.userData.xp - currentLevelObj.xpRequired;
        const xpPercentage = Math.round((userXpInLevel / totalXpForLevel) * 100);
        
        const levelFill = document.querySelector('.level-fill');
        const levelText = document.querySelector('.level-text');
        
        if (levelFill) {
            levelFill.style.width = `${xpPercentage}%`;
        }
        
        if (levelText) {
            levelText.innerHTML = `
                <span>Nível ${this.userData.level}</span>
                <span>${this.userData.xp} / ${nextLevelObj.xpRequired} XP</span>
            `;
        }
    }
    
    showXPNotification(amount, reason) {
        // Em uma implementação real, isso mostraria uma notificação na tela
        console.log(`Ganhou ${amount} XP por: ${reason}`);
        
        // Criar elemento de notificação temporária
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="notification-text">
                    <span class="notification-title">+${amount} XP</span>
                    <span class="notification-reason">${reason}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.classList.add('show');
            
            // Remover após alguns segundos
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        }, 100);
    }
    
    showLevelUpNotification() {
        console.log(`Parabéns! Você atingiu o nível ${this.userData.level}`);
        
        // Criar elemento de notificação de level up
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-level-up-alt"></i>
                </div>
                <div class="notification-text">
                    <span class="notification-title">Nível ${this.userData.level} Alcançado!</span>
                    <span class="notification-reason">Novas funcionalidades desbloqueadas</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.classList.add('show');
            
            // Remover após alguns segundos
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 4000);
        }, 100);
    }
    
    showUnlockNotification(features) {
        console.log(`Novas funcionalidades desbloqueadas: ${features.join(', ')}`);
    }
    
    checkForAchievements() {
        // Simulação de conquistas
        // Em um ambiente real, isso verificaria condições baseadas em ações do usuário
        
        // Exemplo: verificar se o usuário já fez login por X dias
        const loginStreakAchievement = this.achievementList.find(a => a.id === 'login_streak');
        if (loginStreakAchievement && !loginStreakAchievement.completed) {
            // Simulando que atingiu a conquista
            if (Math.random() > 0.7) {
                loginStreakAchievement.completed = true;
                this.userData.achievements.push('login_streak');
                
                // Atualizar interface e dar XP
                this.renderGamificationPanel();
                this.awardXP(loginStreakAchievement.xp, `Conquista desbloqueada: ${loginStreakAchievement.name}`);
            }
        }
    }
    
    updateUserBadges() {
        // Atualizar medalhas com base no nível atual
        this.userData.badges = [];
        
        this.badgeList.forEach(badge => {
            if (this.userData.level >= badge.level) {
                this.userData.badges.push(badge.id);
            }
        });
    }
    
    setDailyReset() {
        // Calcular tempo até meia-noite
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        
        const timeUntilMidnight = midnight.getTime() - now.getTime();
        
        // Agendar reset
        setTimeout(() => {
            this.resetDailyTasks();
            // Agendar o próximo reset
            this.setDailyReset();
        }, timeUntilMidnight);
    }
    
    resetDailyTasks() {
        this.dailyTasks.forEach(task => {
            if (task.id !== 'login') { // Manter login como concluído se o usuário estiver online
                task.completed = false;
            }
        });
        
        // Atualizar interface
        this.renderGamificationPanel();
    }
    
    getTierIcon(tier) {
        switch(tier.toLowerCase()) {
            case 'bronze': return 'medal';
            case 'prata': return 'medal';
            case 'ouro': return 'trophy';
            case 'diamante': return 'gem';
            default: return 'medal';
        }
    }
    
    isTierUnlocked(tier) {
        const tierRange = tier.requirements.replace('Nível ', '').split('-');
        const minLevel = parseInt(tierRange[0]);
        return this.userData.level >= minLevel;
    }
    
    getEventStatusIcon(status) {
        switch(status) {
            case 'active': return 'fa-play-circle';
            case 'upcoming': return 'fa-clock';
            case 'past': return 'fa-check-circle';
            default: return 'fa-circle';
        }
    }
    
    formatEventDates(startDate, endDate) {
        const options = { day: 'numeric', month: 'short' };
        const start = startDate.toLocaleDateString('pt-BR', options);
        const end = endDate.toLocaleDateString('pt-BR', options);
        
        if (start === end) {
            return start;
        }
        
        return `${start} - ${end}`;
    }
}

// Exportar a classe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RunesGamification;
} 
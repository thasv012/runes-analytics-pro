/**
 * Gamification UI
 * Gerencia a interface do usuário relacionada ao sistema de gamificação
 * Inclui animações, notificações, e atualização do painel de conquistas
 */

class GamificationUI {
    constructor() {
        this.config = {
            notificationDuration: 5000, // 5 segundos para notificações
            confettiCount: 100, // número de confetes para conquistas
            confettiColors: ['#ffcc00', '#ff6699', '#33ccff', '#99ff66', '#ff9933', '#cc99ff'], // cores para confete
            pulseAnimationDuration: 2000, // duração da animação de pulso
        };
        
        // Elementos da interface
        this.elements = {
            achievementsModal: document.getElementById('achievements-modal'),
            showAchievementsButton: document.getElementById('show-achievements-button'),
            closeAchievementsModal: document.getElementById('close-achievements-modal'),
            closeAchievementsButton: document.getElementById('close-achievements-button'),
            achievementsTabs: document.querySelectorAll('.achievement-tab'),
            achievementCards: document.querySelectorAll('.achievement-card'),
            userLevelValue: document.getElementById('user-level-value'),
            xpText: document.querySelector('.xp-text'),
            xpFill: document.querySelector('.xp-fill'),
            tokensViewedCount: document.getElementById('tokens-viewed-count'),
            tokensFavoritedCount: document.getElementById('tokens-favorited-count'),
            tokensSharedCount: document.getElementById('tokens-shared-count'),
            achievementsCount: document.getElementById('achievements-count'),
            badgeItems: document.querySelectorAll('.badge-item')
        };
        
        // Inicializar
        this.initialize();
    }
    
    /**
     * Inicializa a UI de gamificação
     */
    initialize() {
        this.setupEventListeners();
        this.syncWithGameSystem();
        
        // Escutar eventos de gamificação
        window.addEventListener('achievement-unlocked', this.handleAchievementUnlocked.bind(this));
        window.addEventListener('level-up', this.handleLevelUp.bind(this));
        window.addEventListener('xp-gained', this.handleXPGained.bind(this));
        
        // Adicionar animação de pulso ao botão de troféu
        this.elements.showAchievementsButton.classList.add('pulse-animation');
        
        // Criar container para confetti
        this.confettiContainer = document.createElement('div');
        this.confettiContainer.className = 'confetti-container';
        document.body.appendChild(this.confettiContainer);
    }
    
    /**
     * Configura event listeners para elementos da interface
     */
    setupEventListeners() {
        // Abrir modal de conquistas
        if (this.elements.showAchievementsButton) {
            this.elements.showAchievementsButton.addEventListener('click', () => {
                this.openAchievementsModal();
            });
        }
        
        // Fechar modal de conquistas
        if (this.elements.closeAchievementsModal) {
            this.elements.closeAchievementsModal.addEventListener('click', () => {
                this.closeAchievementsModal();
            });
        }
        
        if (this.elements.closeAchievementsButton) {
            this.elements.closeAchievementsButton.addEventListener('click', () => {
                this.closeAchievementsModal();
            });
        }
        
        // Fechar modal clicando fora
        if (this.elements.achievementsModal) {
            this.elements.achievementsModal.addEventListener('click', (e) => {
                if (e.target === this.elements.achievementsModal) {
                    this.closeAchievementsModal();
                }
            });
        }
        
        // Alternar entre abas
        if (this.elements.achievementsTabs) {
            this.elements.achievementsTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.dataset.tab);
                });
            });
        }
    }
    
    /**
     * Sincroniza a UI com o sistema de gamificação
     */
    syncWithGameSystem() {
        if (!window.gamification) {
            console.warn('Sistema de gamificação não encontrado');
            return;
        }
        
        // Obter dados do usuário
        const userStatus = window.gamification.getUserStatus();
        
        // Atualizar nível e XP
        if (this.elements.userLevelValue) {
            this.elements.userLevelValue.textContent = userStatus.level;
        }
        
        if (this.elements.xpText && this.elements.xpFill) {
            this.elements.xpText.textContent = `${userStatus.currentLevelXP}/${userStatus.nextLevelXP} XP`;
            const xpPercentage = (userStatus.currentLevelXP / userStatus.nextLevelXP) * 100;
            this.elements.xpFill.style.width = `${xpPercentage}%`;
        }
        
        // Atualizar estatísticas
        if (this.elements.tokensViewedCount && userStatus.viewedTokens) {
            this.elements.tokensViewedCount.textContent = userStatus.viewedTokens.size || 0;
        }
        
        if (this.elements.tokensFavoritedCount && userStatus.favoritedTokens) {
            this.elements.tokensFavoritedCount.textContent = userStatus.favoritedTokens.size || 0;
        }
        
        if (this.elements.tokensSharedCount) {
            this.elements.tokensSharedCount.textContent = userStatus.sharedCount || 0;
        }
        
        if (this.elements.achievementsCount) {
            const completedCount = userStatus.achievements.filter(a => a.completed).length;
            const totalCount = userStatus.achievements.length;
            this.elements.achievementsCount.textContent = `${completedCount}/${totalCount}`;
        }
        
        // Popular conquistas
        this.updateAchievementsDisplay(userStatus.achievements);
    }
    
    /**
     * Atualiza o display de conquistas
     * @param {Array} achievements - Lista de conquistas
     */
    updateAchievementsDisplay(achievements) {
        const container = document.querySelector('.achievements-container');
        if (!container) return;
        
        // Limpar conteúdo atual
        container.innerHTML = '';
        
        // Criar cards para cada conquista
        achievements.forEach(achievement => {
            const card = this.createAchievementCard(achievement);
            container.appendChild(card);
        });
    }
    
    /**
     * Cria um card de conquista
     * @param {Object} achievement - Conquista a ser exibida
     * @returns {HTMLElement} - Card de conquista
     */
    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = `achievement-card${achievement.completed ? ' completed' : ''}${achievement.locked ? ' locked' : ''}`;
        card.dataset.type = achievement.type || 'explorer';
        
        const progressPercentage = achievement.threshold > 0 
            ? Math.min(100, (achievement.progress / achievement.threshold) * 100)
            : 0;
        
        const iconClass = achievement.locked ? 'fa-lock' : (achievement.badgeIcon || 'fa-trophy');
        
        card.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="achievement-info">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <span class="progress-text">${achievement.completed ? 'Completo!' : `${achievement.progress}/${achievement.threshold}`}</span>
                </div>
            </div>
            <div class="achievement-reward">
                <span>+${achievement.reward} XP</span>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Muda para uma aba específica no painel de conquistas
     * @param {string} tabName - Nome da aba (all, explorer, engagement, social)
     */
    switchTab(tabName) {
        // Atualizar abas ativas
        this.elements.achievementsTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Filtrar cards
        const cards = document.querySelectorAll('.achievement-card');
        cards.forEach(card => {
            if (tabName === 'all' || card.dataset.type === tabName) {
                card.style.display = 'grid';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    /**
     * Abre o modal de conquistas
     */
    openAchievementsModal() {
        if (this.elements.achievementsModal) {
            this.syncWithGameSystem(); // Atualizar dados antes de mostrar
            this.elements.achievementsModal.classList.add('active');
            
            // Remover animação de pulso do botão quando o usuário visualiza
            this.elements.showAchievementsButton.classList.remove('pulse-animation');
        }
    }
    
    /**
     * Fecha o modal de conquistas
     */
    closeAchievementsModal() {
        if (this.elements.achievementsModal) {
            this.elements.achievementsModal.classList.remove('active');
        }
    }
    
    /**
     * Manipula o evento de conquista desbloqueada
     * @param {Event} event - Evento de desbloqueio de conquista
     */
    handleAchievementUnlocked(event) {
        const achievement = event.detail;
        
        // Exibir notificação
        this.showAchievementNotification(achievement);
        
        // Adicionar animação de pulso ao botão de conquistas
        this.elements.showAchievementsButton.classList.add('pulse-animation');
        
        // Atualizar interface
        this.syncWithGameSystem();
        
        // Criar efeito de confete
        this.createConfetti();
    }
    
    /**
     * Exibe uma notificação de conquista
     * @param {Object} achievement - Conquista desbloqueada
     */
    showAchievementNotification(achievement) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        notification.innerHTML = `
            <div class="achievement-notification-icon">
                <i class="fas ${achievement.badgeIcon || 'fa-trophy'}"></i>
            </div>
            <div class="achievement-notification-content">
                <h4>Conquista Desbloqueada!</h4>
                <p>${achievement.name}</p>
                <div class="achievement-notification-xp">+${achievement.reward} XP</div>
            </div>
            <button class="achievement-notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Mostrar com animação
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Adicionar event listener para fechar
        const closeBtn = notification.querySelector('.achievement-notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 400);
            });
        }
        
        // Auto-remover após um tempo
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, this.config.notificationDuration);
    }
    
    /**
     * Manipula o evento de subida de nível
     * @param {Event} event - Evento de subida de nível
     */
    handleLevelUp(event) {
        const levelData = event.detail;
        
        // Atualizar interface
        if (this.elements.userLevelValue) {
            this.elements.userLevelValue.textContent = levelData.newLevel;
        }
        
        // Criar efeito de confete
        this.createConfetti();
        
        // Exibir notificação de nível
        this.showLevelUpNotification(levelData);
    }
    
    /**
     * Exibe uma notificação de subida de nível
     * @param {Object} levelData - Dados do novo nível
     */
    showLevelUpNotification(levelData) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        notification.innerHTML = `
            <div class="achievement-notification-icon">
                <i class="fas fa-level-up-alt"></i>
            </div>
            <div class="achievement-notification-content">
                <h4>Nível Aumentado!</h4>
                <p>Você alcançou o nível ${levelData.newLevel}</p>
                <div class="achievement-notification-xp">Novas conquistas desbloqueadas!</div>
            </div>
            <button class="achievement-notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Mostrar com animação
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Adicionar event listener para fechar
        const closeBtn = notification.querySelector('.achievement-notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 400);
            });
        }
        
        // Auto-remover após um tempo
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, this.config.notificationDuration);
    }
    
    /**
     * Manipula o evento de ganho de XP
     * @param {Event} event - Evento de ganho de XP
     */
    handleXPGained(event) {
        const xpData = event.detail;
        
        // Atualizar barra de XP
        if (this.elements.xpText && this.elements.xpFill) {
            this.elements.xpText.textContent = `${xpData.currentXP}/${xpData.nextLevelXP} XP`;
            const xpPercentage = (xpData.currentXP / xpData.nextLevelXP) * 100;
            this.elements.xpFill.style.width = `${xpPercentage}%`;
        }
        
        // Exibir mini-notificação de XP
        this.showXPNotification(xpData.amount);
    }
    
    /**
     * Exibe uma mini-notificação de XP ganho
     * @param {number} amount - Quantidade de XP ganho
     */
    showXPNotification(amount) {
        // Criar elemento flutuante
        const xpNotification = document.createElement('div');
        xpNotification.className = 'xp-notification';
        xpNotification.textContent = `+${amount} XP`;
        
        // Estilo inline para não precisar adicionar ao CSS
        xpNotification.style.position = 'fixed';
        xpNotification.style.right = '100px';
        xpNotification.style.bottom = '30px';
        xpNotification.style.background = 'rgba(var(--success-rgb), 0.9)';
        xpNotification.style.color = 'white';
        xpNotification.style.padding = '0.5rem 1rem';
        xpNotification.style.borderRadius = '20px';
        xpNotification.style.fontWeight = '600';
        xpNotification.style.fontSize = '0.9rem';
        xpNotification.style.opacity = '0';
        xpNotification.style.transform = 'translateY(20px)';
        xpNotification.style.transition = 'opacity 0.3s, transform 0.3s';
        xpNotification.style.zIndex = '9999';
        xpNotification.style.pointerEvents = 'none';
        
        // Adicionar ao DOM
        document.body.appendChild(xpNotification);
        
        // Mostrar com animação
        setTimeout(() => {
            xpNotification.style.opacity = '1';
            xpNotification.style.transform = 'translateY(0)';
        }, 10);
        
        // Auto-remover após 2 segundos
        setTimeout(() => {
            xpNotification.style.opacity = '0';
            xpNotification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                xpNotification.remove();
            }, 300);
        }, 2000);
    }
    
    /**
     * Cria efeito de confete para conquistas e subidas de nível
     */
    createConfetti() {
        // Limpar confetes existentes
        this.confettiContainer.innerHTML = '';
        
        // Criar novos confetes
        for (let i = 0; i < this.config.confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Personalizar confete
            const color = this.config.confettiColors[Math.floor(Math.random() * this.config.confettiColors.length)];
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            const rotation = Math.random() * 360;
            
            confetti.style.backgroundColor = color;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.left = `${left}%`;
            confetti.style.animationDelay = `${delay}s`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            
            // Formas variadas
            if (Math.random() > 0.6) {
                confetti.style.borderRadius = '50%';
            } else if (Math.random() > 0.5) {
                confetti.style.borderRadius = '2px';
            }
            
            this.confettiContainer.appendChild(confetti);
        }
        
        // Remover confetes após a animação
        setTimeout(() => {
            this.confettiContainer.innerHTML = '';
        }, 6000);
    }
}

// Inicializar a UI de gamificação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando UI de Gamificação...');
    window.gamificationUI = new GamificationUI();
}); 
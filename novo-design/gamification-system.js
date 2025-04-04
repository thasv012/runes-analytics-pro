/**
 * Sistema de Gamificação para RUNES Analytics Pro
 * Gerencia níveis, conquistas, desafios e recompensas para os usuários
 */

class GamificationSystem {
    constructor() {
        // Configurações
        this.config = {
            xpLevels: [
                { level: 1, title: 'Iniciante', requiredXP: 0 },
                { level: 2, title: 'Aprendiz', requiredXP: 200 },
                { level: 3, title: 'Explorador', requiredXP: 500 },
                { level: 4, title: 'Analista', requiredXP: 1000 },
                { level: 5, title: 'Especialista', requiredXP: 2000 },
                { level: 6, title: 'Mestre', requiredXP: 4000 },
                { level: 7, title: 'Guru', requiredXP: 8000 },
                { level: 8, title: 'Visionário', requiredXP: 15000 },
                { level: 9, title: 'Lendário', requiredXP: 25000 },
                { level: 10, title: 'Satoshi', requiredXP: 50000 }
            ],
            
            // Pontos de XP para ações
            xpActions: {
                login: 10,              // Login diário
                viewToken: 5,           // Visualizar detalhes de um token
                search: 2,              // Realizar busca
                addFavorite: 10,        // Adicionar um token aos favoritos
                createAlert: 15,        // Criar um alerta
                viewAnalysis: 10,       // Ver análise técnica
                spotWhale: 20,          // Identificar movimento de baleia antes do alerta
                completeDailyChallenge: 50 // Completar desafio diário
            },
            
            // Tipos de desafios
            challengeTypes: {
                daily: 'daily',         // Desafios diários
                weekly: 'weekly',       // Desafios semanais
                achievement: 'achievement' // Conquistas (permanentes)
            }
        };
        
        // Estado do usuário (será carregado do storage)
        this.userState = {
            userId: null,
            username: null,
            isLoggedIn: false,
            level: 1,
            currentXP: 0,
            totalXP: 0,
            dayStreak: 0,
            lastLogin: null,
            achievements: [],
            completedChallenges: [],
            activeChallenges: [],
            favorites: [],
            activityLog: []
        };
        
        // Dados simulados para desenvolvimento
        this.mockData = this.generateMockData();
        
        // Flag para modo de desenvolvimento
        this.devMode = true;
        
        // Inicializar
        this.initialize();
        
        console.log('Sistema de Gamificação inicializado');
    }
    
    /**
     * Gera dados simulados para desenvolvimento
     * @returns {Object} Dados simulados
     */
    generateMockData() {
        return {
            challenges: [
                {
                    id: 'daily-analysis',
                    type: 'daily',
                    name: 'Análise Diária',
                    description: 'Analise 3 tokens Runes diferentes hoje',
                    reward: 50,
                    requiredCount: 3,
                    icon: '📊'
                },
                {
                    id: 'daily-login',
                    type: 'daily',
                    name: 'Login Diário',
                    description: 'Faça login no app 5 dias seguidos',
                    reward: 100,
                    requiredCount: 5,
                    icon: '📅'
                },
                {
                    id: 'whale-watcher',
                    type: 'weekly',
                    name: 'Observador de Baleias',
                    description: 'Detecte 10 movimentos de baleias em uma semana',
                    reward: 200,
                    requiredCount: 10,
                    icon: '🐋'
                }
            ],
            
            achievements: [
                {
                    id: 'first-login',
                    name: 'Primeira Exploração',
                    description: 'Faça seu primeiro login no RUNES Analytics Pro',
                    xp: 50,
                    icon: '🚀'
                },
                {
                    id: 'token-expert',
                    name: 'Especialista em Tokens',
                    description: 'Analise 50 tokens diferentes',
                    xp: 200,
                    icon: '🔍'
                },
                {
                    id: 'whale-hunter',
                    name: 'Caçador de Baleias',
                    description: 'Detecte um movimento de baleia antes do sistema',
                    xp: 300,
                    icon: '🎯'
                },
                {
                    id: 'prediction-master',
                    name: 'Mestre da Previsão',
                    description: 'Acerte 10 previsões de movimentos de preço',
                    xp: 500,
                    icon: '🧙‍♂️'
                },
                {
                    id: 'diamond-hands',
                    name: 'Mãos de Diamante',
                    description: 'Mantenha um token em seus favoritos por 30 dias',
                    xp: 300,
                    icon: '💎'
                }
            ]
        };
    }
    
    /**
     * Inicializa o sistema e carrega os dados do usuário
     */
    initialize() {
        // Carregar estado do usuário do localStorage
        this.loadUserState();
        
        // Se for o primeiro acesso, adicionar conquista de primeiro login
        if (this.devMode && this.userState.achievements.length === 0) {
            this.unlockAchievement('first-login');
        }
        
        // Verificar login diário
        this.checkDailyLogin();
        
        // Verificar e atualizar desafios ativos
        this.updateActiveChallenges();
    }
    
    /**
     * Carrega o estado do usuário do armazenamento local
     */
    loadUserState() {
        try {
            const savedState = localStorage.getItem('runes_user_state');
            
            if (savedState) {
                this.userState = JSON.parse(savedState);
            } else if (this.devMode) {
                // Em modo de desenvolvimento, criar um estado simulado
                this.userState = {
                    userId: 'dev-user',
                    username: 'Usuário Demo',
                    isLoggedIn: true,
                    level: 3,
                    currentXP: 320,
                    totalXP: 720,
                    dayStreak: 3,
                    lastLogin: new Date(Date.now() - 86400000), // Ontem
                    achievements: ['first-login'],
                    completedChallenges: ['daily-login'],
                    activeChallenges: [
                        {
                            id: 'daily-analysis',
                            progress: 1,
                            startedAt: new Date()
                        }
                    ],
                    favorites: ['ORDI', 'RATS'],
                    activityLog: []
                };
                
                this.saveUserState();
            }
        } catch (error) {
            console.error('Erro ao carregar estado do usuário:', error);
            // Em caso de erro, manter o estado padrão
        }
    }
    
    /**
     * Salva o estado do usuário no armazenamento local
     */
    saveUserState() {
        try {
            localStorage.setItem('runes_user_state', JSON.stringify(this.userState));
        } catch (error) {
            console.error('Erro ao salvar estado do usuário:', error);
        }
    }
    
    /**
     * Verifica e processa login diário
     */
    checkDailyLogin() {
        const now = new Date();
        const lastLogin = this.userState.lastLogin ? new Date(this.userState.lastLogin) : null;
        
        // Se não há último login, considerar como primeiro login
        if (!lastLogin) {
            this.userState.lastLogin = now;
            this.userState.dayStreak = 1;
            this.addXP(this.config.xpActions.login);
            this.saveUserState();
            return;
        }
        
        // Verificar se é um novo dia
        const isSameDay = this.isSameDay(lastLogin, now);
        
        if (!isSameDay) {
            // Verificar se houve quebra de sequência (mais de um dia entre logins)
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const isConsecutiveDay = this.isSameDay(lastLogin, yesterday);
            
            if (isConsecutiveDay) {
                // Login consecutivo, incrementar sequência
                this.userState.dayStreak++;
                
                // Bônus para sequências longas
                const streakBonus = Math.min(Math.floor(this.userState.dayStreak / 5) * 10, 50);
                this.addXP(this.config.xpActions.login + streakBonus);
                
                if (this.userState.dayStreak % 5 === 0) {
                    this.showNotification('Sequência de Login', `Você fez login ${this.userState.dayStreak} dias seguidos! Bônus: +${streakBonus} XP`);
                }
            } else {
                // Quebra de sequência
                this.userState.dayStreak = 1;
                this.addXP(this.config.xpActions.login);
            }
            
            this.userState.lastLogin = now;
            this.saveUserState();
            
            // Verificar se completou desafio de login diário
            this.updateChallengeProgress('daily-login', 1);
        }
    }
    
    /**
     * Verifica se duas datas são o mesmo dia
     * @param {Date} date1 - Primeira data
     * @param {Date} date2 - Segunda data
     * @returns {Boolean} Verdadeiro se as datas são o mesmo dia
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    /**
     * Adiciona pontos de experiência ao usuário
     * @param {Number} amount - Quantidade de XP a adicionar
     */
    addXP(amount) {
        if (amount <= 0) return;
        
        const prevLevel = this.userState.level;
        this.userState.totalXP += amount;
        
        // Calcular nível atual baseado no XP total
        const newLevel = this.calculateLevel(this.userState.totalXP);
        
        // Atualizar nível e XP atual
        if (newLevel > prevLevel) {
            // Subiu de nível
            this.userState.level = newLevel;
            this.levelUp(prevLevel, newLevel);
        }
        
        // Calcular XP atual dentro do nível
        this.updateCurrentXP();
        
        // Salvar alterações
        this.saveUserState();
    }
    
    /**
     * Calcula o nível baseado no XP total
     * @param {Number} totalXP - XP total do usuário
     * @returns {Number} Nível atual
     */
    calculateLevel(totalXP) {
        const levels = this.config.xpLevels;
        
        for (let i = levels.length - 1; i >= 0; i--) {
            if (totalXP >= levels[i].requiredXP) {
                return levels[i].level;
            }
        }
        
        return 1; // Nível mínimo se não atingir nenhum limiar
    }
    
    /**
     * Atualiza o XP atual dentro do nível
     */
    updateCurrentXP() {
        const currentLevel = this.userState.level;
        const nextLevel = currentLevel + 1;
        
        // Obter XP requerido para o nível atual e próximo
        const currentLevelObj = this.config.xpLevels.find(l => l.level === currentLevel);
        const nextLevelObj = this.config.xpLevels.find(l => l.level === nextLevel);
        
        if (!nextLevelObj) {
            // Já está no nível máximo
            this.userState.currentXP = 0;
            return;
        }
        
        const currentLevelXP = currentLevelObj ? currentLevelObj.requiredXP : 0;
        const nextLevelXP = nextLevelObj.requiredXP;
        
        // Calcular XP dentro do nível atual
        this.userState.currentXP = this.userState.totalXP - currentLevelXP;
        this.userState.xpRequired = nextLevelXP - currentLevelXP;
        this.userState.xpPercentage = Math.round((this.userState.currentXP / this.userState.xpRequired) * 100);
    }
    
    /**
     * Processa a subida de nível
     * @param {Number} prevLevel - Nível anterior
     * @param {Number} newLevel - Novo nível
     */
    levelUp(prevLevel, newLevel) {
        const levelDiff = newLevel - prevLevel;
        const levelInfo = this.config.xpLevels.find(l => l.level === newLevel);
        
        // Bônus de XP para cada nível subido
        const levelBonus = 50 * levelDiff;
        
        // Disparar evento de level up
        const eventDetail = {
            prevLevel,
            newLevel,
            levelTitle: levelInfo ? levelInfo.title : `Nível ${newLevel}`,
            bonus: levelBonus
        };
        
        this.dispatchEvent('level-up', eventDetail);
        
        // Adicionar bônus de XP
        this.userState.totalXP += levelBonus;
        
        // Mostrar notificação
        this.showNotification('Nível Aumentado!', `Você subiu para o nível ${newLevel}! Bônus: ${levelBonus} XP`);
    }
    
    /**
     * Atualiza lista de desafios ativos
     */
    updateActiveChallenges() {
        const now = new Date();
        
        // Remover desafios expirados
        this.userState.activeChallenges = this.userState.activeChallenges.filter(challenge => {
            const startDate = new Date(challenge.startedAt);
            const daysDiff = this.daysBetween(startDate, now);
            
            // Manter desafios diários com menos de 1 dia
            if (challenge.id.startsWith('daily-') && daysDiff < 1) {
                return true;
            }
            
            // Manter desafios semanais com menos de 7 dias
            if (challenge.id.startsWith('weekly-') && daysDiff < 7) {
                return true;
            }
            
            return false;
        });
        
        // Adicionar novos desafios diários se necessário
        const hasDailyChallenge = this.userState.activeChallenges.some(c => c.id.startsWith('daily-'));
        
        if (!hasDailyChallenge) {
            const dailyChallenges = this.mockData.challenges.filter(c => c.type === 'daily');
            if (dailyChallenges.length > 0) {
                // Selecionar um desafio diário aleatório
                const randomIndex = Math.floor(Math.random() * dailyChallenges.length);
                const newChallenge = dailyChallenges[randomIndex];
                
                this.userState.activeChallenges.push({
                    id: newChallenge.id,
                    progress: 0,
                    startedAt: now
                });
                
                // Notificar novo desafio
                this.dispatchEvent('new-challenge', { challenge: newChallenge });
                this.showNotification('Novo Desafio!', `${newChallenge.name}: ${newChallenge.description}`);
            }
        }
        
        // Adicionar desafios semanais se necessário
        const hasWeeklyChallenge = this.userState.activeChallenges.some(c => c.id.startsWith('weekly-'));
        
        if (!hasWeeklyChallenge) {
            const weeklyChallenges = this.mockData.challenges.filter(c => c.type === 'weekly');
            if (weeklyChallenges.length > 0) {
                // Selecionar um desafio semanal aleatório
                const randomIndex = Math.floor(Math.random() * weeklyChallenges.length);
                const newChallenge = weeklyChallenges[randomIndex];
                
                this.userState.activeChallenges.push({
                    id: newChallenge.id,
                    progress: 0,
                    startedAt: now
                });
                
                // Notificar novo desafio
                this.dispatchEvent('new-challenge', { challenge: newChallenge });
                this.showNotification('Novo Desafio Semanal!', `${newChallenge.name}: ${newChallenge.description}`);
            }
        }
        
        this.saveUserState();
    }
    
    /**
     * Calcula o número de dias entre duas datas
     * @param {Date} date1 - Primeira data
     * @param {Date} date2 - Segunda data
     * @returns {Number} Número de dias entre as datas
     */
    daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
        return diffDays;
    }
    
    /**
     * Atualiza o progresso de um desafio
     * @param {String} challengeId - ID do desafio
     * @param {Number} incrementAmount - Quantidade a incrementar
     */
    updateChallengeProgress(challengeId, incrementAmount = 1) {
        // Verificar se o desafio está ativo
        const challengeIndex = this.userState.activeChallenges.findIndex(c => c.id === challengeId);
        
        if (challengeIndex === -1) return;
        
        const challenge = this.userState.activeChallenges[challengeIndex];
        
        // Incrementar progresso
        challenge.progress += incrementAmount;
        
        // Obter dados completos do desafio
        const challengeData = this.mockData.challenges.find(c => c.id === challengeId);
        
        if (!challengeData) return;
        
        // Verificar se completou o desafio
        if (challenge.progress >= challengeData.requiredCount) {
            // Marcar como concluído
            this.userState.completedChallenges.push({
                id: challengeId,
                completedAt: new Date()
            });
            
            // Remover dos desafios ativos
            this.userState.activeChallenges.splice(challengeIndex, 1);
            
            // Adicionar recompensa
            this.addXP(challengeData.reward);
            
            // Disparar evento de desafio concluído
            this.dispatchEvent('challenge-completed', { 
                challenge: challengeData,
                reward: challengeData.reward
            });
            
            // Notificação
            this.showNotification('Desafio Concluído!', 
                `${challengeData.name} concluído! Recompensa: ${challengeData.reward} XP`);
        } else {
            // Atualizar progresso na lista de desafios ativos
            this.userState.activeChallenges[challengeIndex] = challenge;
        }
        
        this.saveUserState();
    }
    
    /**
     * Desbloqueia uma conquista para o usuário
     * @param {String} achievementId - ID da conquista
     */
    unlockAchievement(achievementId) {
        // Verificar se já possui a conquista
        if (this.userState.achievements.includes(achievementId)) {
            return;
        }
        
        // Obter detalhes da conquista
        const achievement = this.mockData.achievements.find(a => a.id === achievementId);
        
        if (!achievement) {
            console.error(`Conquista ${achievementId} não encontrada`);
            return;
        }
        
        // Adicionar à lista de conquistas do usuário
        this.userState.achievements.push(achievementId);
        
        // Adicionar XP
        this.addXP(achievement.xp);
        
        // Disparar evento de conquista desbloqueada
        this.dispatchEvent('achievement-unlocked', { achievement });
        
        // Notificação
        this.showNotification('Conquista Desbloqueada!', 
            `${achievement.name}: ${achievement.description}. +${achievement.xp} XP`);
        
        this.saveUserState();
    }
    
    /**
     * Registra uma ação do usuário e adiciona XP conforme a ação
     * @param {String} actionType - Tipo de ação
     * @param {Object} actionData - Dados adicionais da ação
     */
    logAction(actionType, actionData = {}) {
        if (!this.config.xpActions[actionType]) {
            console.warn(`Tipo de ação desconhecido: ${actionType}`);
            return;
        }
        
        // Registrar ação no log
        this.userState.activityLog.push({
            type: actionType,
            timestamp: new Date(),
            data: actionData
        });
        
        // Manter o log limitado para não sobrecarregar o storage
        if (this.userState.activityLog.length > 100) {
            this.userState.activityLog = this.userState.activityLog.slice(-100);
        }
        
        // Adicionar XP pela ação
        this.addXP(this.config.xpActions[actionType]);
        
        // Processar ações específicas
        this.processActionEffects(actionType, actionData);
        
        this.saveUserState();
    }
    
    /**
     * Processa efeitos específicos de cada tipo de ação
     * @param {String} actionType - Tipo de ação
     * @param {Object} actionData - Dados adicionais da ação
     */
    processActionEffects(actionType, actionData) {
        switch (actionType) {
            case 'viewToken':
                // Incrementar contagem para o desafio de análise diária
                this.updateChallengeProgress('daily-analysis');
                break;
                
            case 'addFavorite':
                // Adicionar aos favoritos
                if (actionData.tokenId && !this.userState.favorites.includes(actionData.tokenId)) {
                    this.userState.favorites.push(actionData.tokenId);
                }
                break;
                
            case 'spotWhale':
                // Verificar conquista de caçador de baleias
                this.unlockAchievement('whale-hunter');
                
                // Incrementar progresso para o desafio de observador de baleias
                this.updateChallengeProgress('whale-watcher');
                break;
        }
    }
    
    /**
     * Mostra uma notificação para o usuário
     * @param {String} title - Título da notificação
     * @param {String} message - Mensagem da notificação
     */
    showNotification(title, message) {
        // Usando a API de notificações do browser, se disponível
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body: message });
        }
        
        // Também disparar evento para o sistema de notificações interno
        this.dispatchEvent('notification', { title, message });
        
        console.log(`[Notificação] ${title}: ${message}`);
    }
    
    /**
     * Dispara um evento customizado no documento
     * @param {String} eventName - Nome do evento
     * @param {Object} detail - Detalhes do evento
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * Obtém o status atual do usuário
     * @returns {Object} Status do usuário
     */
    getUserStatus() {
        // Obter detalhes do nível atual
        const levelInfo = this.config.xpLevels.find(l => l.level === this.userState.level);
        
        // Obter desafio atual
        const activeChallenge = this.userState.activeChallenges[0];
        let challengeProgress = null;
        
        if (activeChallenge) {
            const challengeData = this.mockData.challenges.find(c => c.id === activeChallenge.id);
            
            if (challengeData) {
                challengeProgress = {
                    challenge: challengeData,
                    current: activeChallenge.progress,
                    required: challengeData.requiredCount,
                    percentage: Math.round((activeChallenge.progress / challengeData.requiredCount) * 100)
                };
            }
        }
        
        return {
            isLoggedIn: this.userState.isLoggedIn,
            username: this.userState.username,
            level: this.userState.level,
            levelTitle: levelInfo ? levelInfo.title : `Nível ${this.userState.level}`,
            xp: this.userState.currentXP,
            xpRequired: this.userState.xpRequired || 0,
            xpPercentage: this.userState.xpPercentage || 0,
            dayStreak: this.userState.dayStreak,
            achievements: this.userState.achievements,
            favorites: this.userState.favorites,
            challengeProgress
        };
    }
    
    /**
     * Define o estado de login do usuário
     * @param {Boolean} isLoggedIn - Estado de login
     * @param {Object} userData - Dados do usuário (para login)
     */
    setLoginState(isLoggedIn, userData = null) {
        this.userState.isLoggedIn = isLoggedIn;
        
        if (isLoggedIn && userData) {
            this.userState.userId = userData.id;
            this.userState.username = userData.username;
            
            // Verificar se é o primeiro login
            if (!this.userState.lastLogin) {
                this.unlockAchievement('first-login');
            }
            
            // Registrar login
            this.checkDailyLogin();
        }
        
        this.saveUserState();
    }

    /**
     * Gera desafios relacionados à exploração de tokens Runes
     */
    generateRunesExplorerChallenges() {
        return [
            {
                id: 'discover_10_tokens',
                name: 'Explorador Iniciante',
                description: 'Visualize detalhes de 10 tokens Runes diferentes',
                type: 'explorer',
                reward: 50,
                badgeIcon: 'fa-search',
                threshold: 10,
                progress: 0,
                completed: false
            },
            {
                id: 'discover_50_tokens',
                name: 'Explorador Avançado',
                description: 'Visualize detalhes de 50 tokens Runes diferentes',
                type: 'explorer',
                reward: 200,
                badgeIcon: 'fa-binoculars',
                threshold: 50,
                progress: 0,
                completed: false
            },
            {
                id: 'favorite_5_tokens',
                name: 'Colecionador',
                description: 'Adicione 5 tokens Runes aos seus favoritos',
                type: 'engagement',
                reward: 30,
                badgeIcon: 'fa-star',
                threshold: 5,
                progress: 0,
                completed: false
            },
            {
                id: 'explore_top_10',
                name: 'Conhecedor de Elite',
                description: 'Visualize detalhes dos 10 tokens Runes mais bem classificados',
                type: 'explorer',
                reward: 100,
                badgeIcon: 'fa-crown',
                threshold: 10,
                progress: 0,
                completed: false,
                progressTracker: new Set() // Usado para rastrear quais tokens top 10 foram visualizados
            },
            {
                id: 'use_all_filters',
                name: 'Pesquisador Minucioso',
                description: 'Use todos os filtros disponíveis no explorador de tokens',
                type: 'explorer',
                reward: 40,
                badgeIcon: 'fa-filter',
                threshold: 1,
                progress: 0,
                completed: false,
                progressTracker: new Set() // Usado para rastrear quais filtros foram usados
            },
            {
                id: 'share_token',
                name: 'Embaixador Runes',
                description: 'Compartilhe informações sobre um token Rune',
                type: 'social',
                reward: 25,
                badgeIcon: 'fa-share-alt',
                threshold: 1,
                progress: 0,
                completed: false
            },
            {
                id: 'spot_whale_activity',
                name: 'Observador de Baleias',
                description: 'Identifique atividade de baleia em um token Rune',
                type: 'explorer',
                reward: 75,
                badgeIcon: 'fa-whale',
                threshold: 1,
                progress: 0,
                completed: false
            },
            {
                id: 'discover_new_token',
                name: 'Descobridor',
                description: 'Seja um dos primeiros a explorar um token recém-criado',
                type: 'explorer',
                reward: 150,
                badgeIcon: 'fa-certificate',
                threshold: 1,
                progress: 0,
                completed: false
            },
            {
                id: 'daily_explorer',
                name: 'Explorador Diário',
                description: 'Explore 5 tokens Runes diferentes em um único dia',
                type: 'daily',
                reward: 30,
                badgeIcon: 'fa-calendar-check',
                threshold: 5,
                progress: 0,
                completed: false,
                resetDaily: true,
                progressTracker: new Set() // Usado para rastrear tokens visualizados hoje
            }
        ];
    }

    /**
     * Processa uma ação de visualização de detalhes de um token Rune
     * @param {string} tokenId - ID do token visualizado
     * @param {Object} tokenData - Dados do token visualizado
     */
    processTokenView(tokenId, tokenData) {
        if (!tokenId || !tokenData) return;
        
        // Registrar token visualizado
        if (!this.userState.viewedTokens) {
            this.userState.viewedTokens = new Set();
        }
        
        const isNewView = !this.userState.viewedTokens.has(tokenId);
        this.userState.viewedTokens.add(tokenId);
        
        // Se este for um token que o usuário não tinha visto antes
        if (isNewView) {
            // Atualizar desafios de visualização de tokens
            this.updateChallengeProgress('discover_10_tokens', 1);
            this.updateChallengeProgress('discover_50_tokens', 1);
            
            // Verificar se é um token do top 10
            if (tokenData.rank <= 10) {
                const challenge = this.findChallenge('explore_top_10');
                if (challenge && !challenge.completed) {
                    // Adicionar ao tracker e atualizar progresso
                    if (!challenge.progressTracker) {
                        challenge.progressTracker = new Set();
                    }
                    
                    if (!challenge.progressTracker.has(tokenId)) {
                        challenge.progressTracker.add(tokenId);
                        challenge.progress = challenge.progressTracker.size;
                        
                        if (challenge.progress >= challenge.threshold) {
                            this.updateChallengeProgress(challenge.id);
                        } else {
                            this.saveUserState();
                        }
                    }
                }
            }
            
            // Verificar se é um token novo (criado nas últimas 48h)
            const tokenAge = this.calculateTokenAge(tokenData.mintedAt);
            if (tokenAge <= 48) { // Token com menos de 48h
                this.updateChallengeProgress('discover_new_token', 1);
            }
            
            // Atualizar desafio diário
            const dailyChallenge = this.findChallenge('daily_explorer');
            if (dailyChallenge && !dailyChallenge.completed) {
                if (!dailyChallenge.progressTracker) {
                    dailyChallenge.progressTracker = new Set();
                }
                
                if (!dailyChallenge.progressTracker.has(tokenId)) {
                    dailyChallenge.progressTracker.add(tokenId);
                    dailyChallenge.progress = dailyChallenge.progressTracker.size;
                    
                    if (dailyChallenge.progress >= dailyChallenge.threshold) {
                        this.updateChallengeProgress(dailyChallenge.id);
                    } else {
                        this.saveUserState();
                    }
                }
            }
            
            // Adicionar XP pela exploração
            this.addXP(2);
        }
    }
    
    /**
     * Processa a ação de favoritar um token
     * @param {string} tokenId - ID do token favoritado
     */
    processTokenFavorite(tokenId) {
        if (!tokenId) return;
        
        // Registrar token favoritado
        if (!this.userState.favoritedTokens) {
            this.userState.favoritedTokens = new Set();
        }
        
        const isNewFavorite = !this.userState.favoritedTokens.has(tokenId);
        
        if (isNewFavorite) {
            this.userState.favoritedTokens.add(tokenId);
            
            // Atualizar desafio de favoritar tokens
            this.updateChallengeProgress('favorite_5_tokens', 1);
            
            // Adicionar XP pelo engajamento
            this.addXP(3);
        } else {
            // Remover dos favoritos
            this.userState.favoritedTokens.delete(tokenId);
        }
        
        this.saveUserState();
    }
    
    /**
     * Processa a ação de compartilhar um token
     * @param {string} tokenId - ID do token compartilhado
     */
    processTokenShare(tokenId) {
        if (!tokenId) return;
        
        // Atualizar desafio de compartilhamento
        this.updateChallengeProgress('share_token', 1);
        
        // Adicionar XP pela socialização
        this.addXP(5);
        
        this.saveUserState();
    }
    
    /**
     * Registra o uso de um filtro no explorador
     * @param {string} filterType - Tipo de filtro usado
     */
    registerFilterUse(filterType) {
        if (!filterType) return;
        
        const challenge = this.findChallenge('use_all_filters');
        if (challenge && !challenge.completed) {
            if (!challenge.progressTracker) {
                challenge.progressTracker = new Set();
            }
            
            const isNewFilter = !challenge.progressTracker.has(filterType);
            
            if (isNewFilter) {
                challenge.progressTracker.add(filterType);
                
                // Se todos os filtros foram usados (assumindo 5 tipos de filtros)
                if (challenge.progressTracker.size >= 5) {
                    this.updateChallengeProgress(challenge.id);
                }
            }
        }
        
        // Adicionar pequena quantidade de XP pelo uso de filtros
        this.addXP(1);
        
        this.saveUserState();
    }
    
    /**
     * Calcula a idade de um token em horas
     * @param {string} mintedAt - Data de criação do token
     * @returns {number} Idade em horas
     */
    calculateTokenAge(mintedAt) {
        if (!mintedAt) return Infinity;
        
        const mintDate = new Date(mintedAt);
        const now = new Date();
        
        const ageInMs = now - mintDate;
        const ageInHours = ageInHours = ageInMs / (1000 * 60 * 60);
        
        return ageInHours;
    }
    
    /**
     * Encontra um desafio pelo ID
     * @param {string} challengeId - ID do desafio
     * @returns {Object|null} O desafio encontrado ou null
     */
    findChallenge(challengeId) {
        return this.mockData.challenges.find(c => c.id === challengeId) || null;
    }

    /**
     * Inicializa os desafios do explorador de tokens
     */
    initializeExplorerChallenges() {
        // Adicionar desafios do explorador ao estado
        const explorerChallenges = this.generateRunesExplorerChallenges();
        
        // Verificar se já existem desafios do mesmo tipo e removê-los para evitar duplicatas
        this.mockData.challenges = this.mockData.challenges.filter(c => 
            !explorerChallenges.some(ec => ec.id === c.id)
        );
        
        // Adicionar os novos desafios
        this.mockData.challenges = [...this.mockData.challenges, ...explorerChallenges];
        
        // Inicializar conjuntos para rastreamento
        this.userState.viewedTokens = new Set();
        this.userState.favoritedTokens = new Set();
        
        this.saveUserState();
    }
}

// Inicializar sistema de gamificação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Sistema de Gamificação...');
    window.gamificationSystem = new GamificationSystem();
}); 
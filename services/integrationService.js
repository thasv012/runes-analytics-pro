import runesMarketDataService from './runesMarketDataService.js';
import whaleAlertService from './whaleAlertService.js';
import fibonacciAnalysisService from './fibonacciAnalysisService.js';
import notificationService from './notificationService.js';

class IntegrationService {
    constructor() {
        this.activeMonitoring = new Set();
        this.monitoringInterval = null;
        this.priceAlerts = new Map(); // ticker -> [{price, direction, triggered}]
        this.fibonacciAlerts = new Map(); // ticker -> [{level, direction, triggered}]
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Escutar por navegação para token
        window.addEventListener('navigate_to_token', (event) => {
            const ticker = event.detail.ticker;
            if (ticker) {
                this.startMonitoring(ticker);
            }
        });
    }
    
    startMonitoring(ticker) {
        if (this.activeMonitoring.has(ticker)) return;
        
        console.log(`Iniciando monitoramento para ${ticker}`);
        this.activeMonitoring.add(ticker);
        
        // Iniciar monitoramento se ainda não estiver ativo
        if (!this.monitoringInterval) {
            this.monitoringInterval = setInterval(() => this.checkAllMonitoredTokens(), 30000);
            // Primeira verificação imediata
            this.checkAllMonitoredTokens();
        }
    }
    
    stopMonitoring(ticker) {
        if (!this.activeMonitoring.has(ticker)) return;
        
        console.log(`Parando monitoramento para ${ticker}`);
        this.activeMonitoring.delete(ticker);
        
        // Se não houver mais tokens monitorados, parar o intervalo
        if (this.activeMonitoring.size === 0 && this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    
    async checkAllMonitoredTokens() {
        for (const ticker of this.activeMonitoring) {
            try {
                await this.checkToken(ticker);
            } catch (error) {
                console.error(`Erro ao verificar token ${ticker}:`, error);
            }
        }
    }
    
    async checkToken(ticker) {
        // Buscar dados atualizados do token
        const tokenData = await runesMarketDataService.getTokenDetails(ticker);
        if (!tokenData) return;
        
        // Verificar movimentos de baleias
        this.checkWhaleMovements(ticker, tokenData);
        
        // Verificar alertas de preço
        this.checkPriceAlerts(ticker, tokenData);
        
        // Verificar níveis de Fibonacci
        this.checkFibonacciLevels(ticker, tokenData);
        
        // Verificar mudanças de tendência
        this.checkTrendChanges(ticker, tokenData);
    }
    
    checkWhaleMovements(ticker, tokenData) {
        // Simular detecção de movimento de baleia
        const whales = tokenData.whales || [];
        
        whales.forEach(whale => {
            const lastTransaction = whale.lastTransaction;
            if (!lastTransaction) return;
            
            // Verificar se a transação é recente (últimas 24h)
            const transactionTime = new Date(lastTransaction.time);
            const now = new Date();
            const hoursSinceTransaction = (now - transactionTime) / (1000 * 60 * 60);
            
            if (hoursSinceTransaction <= 24) {
                // Determinar severidade com base no tamanho da transação
                let severity = 'low';
                const percentOfSupply = (lastTransaction.amount / tokenData.supply) * 100;
                
                if (percentOfSupply > 1) severity = 'critical';
                else if (percentOfSupply > 0.5) severity = 'high';
                else if (percentOfSupply > 0.1) severity = 'medium';
                
                // Criar mensagem de alerta
                const action = lastTransaction.type === 'buy' ? 'acumulando' : 'distribuindo';
                const message = `Baleia ${action} ${ticker}. ${lastTransaction.amount.toLocaleString()} tokens (${percentOfSupply.toFixed(4)}% do supply) ${lastTransaction.type === 'buy' ? 'comprados' : 'vendidos'}.`;
                
                // Enviar alerta
                notificationService.createWhaleMovementAlert(ticker, message, severity, {
                    whale: {
                        address: whale.address,
                        holdingPercentage: whale.holdingPercentage
                    },
                    transaction: lastTransaction
                });
            }
        });
    }
    
    checkPriceAlerts(ticker, tokenData) {
        // Verificar se o preço atingiu algum alerta configurado
        const alerts = this.priceAlerts.get(ticker) || [];
        
        alerts.forEach(alert => {
            if (alert.triggered) return;
            
            const currentPrice = tokenData.price;
            let triggered = false;
            
            if (alert.direction === 'above' && currentPrice >= alert.price) {
                triggered = true;
            } else if (alert.direction === 'below' && currentPrice <= alert.price) {
                triggered = true;
            }
            
            if (triggered) {
                alert.triggered = true;
                
                const message = `${ticker} ${alert.direction === 'above' ? 'subiu acima de' : 'caiu abaixo de'} ${alert.price.toFixed(8)} BTC.`;
                
                notificationService.createPriceAlert(ticker, message, 'medium', {
                    price: currentPrice,
                    targetPrice: alert.price,
                    direction: alert.direction
                });
            }
        });
        
        // Atualizar a lista de alertas (remover os já disparados)
        this.priceAlerts.set(ticker, alerts.filter(alert => !alert.triggered));
    }
    
    checkFibonacciLevels(ticker, tokenData) {
        // Verificar se o preço está próximo de níveis de Fibonacci importantes
        const fibLevels = tokenData.fibonacciLevels;
        if (!fibLevels) return;
        
        const currentPrice = tokenData.price;
        
        // Verificar proximidade com suportes
        fibLevels.supports.forEach(support => {
            if (support.strength !== 'forte' && support.strength !== 'muito forte') return;
            
            const distance = Math.abs(currentPrice - support.price) / support.price;
            
            if (distance < 0.02) { // Dentro de 2% do nível
                const message = `${ticker} está próximo de um suporte Fibonacci forte (${support.level}). Preço atual: ${currentPrice.toFixed(8)}, Suporte: ${support.price.toFixed(8)}.`;
                
                notificationService.createFibonacciLevelAlert(ticker, message, 'medium', {
                    level: support.level,
                    price: support.price,
                    currentPrice,
                    type: 'support'
                });
            }
        });
        
        // Verificar proximidade com resistências
        fibLevels.resistances.forEach(resistance => {
            if (resistance.strength !== 'forte' && resistance.strength !== 'muito forte') return;
            
            const distance = Math.abs(currentPrice - resistance.price) / resistance.price;
            
            if (distance < 0.02) { // Dentro de 2% do nível
                const message = `${ticker} está próximo de uma resistência Fibonacci forte (${resistance.level}). Preço atual: ${currentPrice.toFixed(8)}, Resistência: ${resistance.price.toFixed(8)}.`;
                
                notificationService.createFibonacciLevelAlert(ticker, message, 'medium', {
                    level: resistance.level,
                    price: resistance.price,
                    currentPrice,
                    type: 'resistance'
                });
            }
        });
    }
    
    checkTrendChanges(ticker, tokenData) {
        // Simular detecção de mudança de tendência
        // Em um sistema real, isso seria baseado em análise técnica mais complexa
        
        const previousTrend = localStorage.getItem(`trend_${ticker}`);
        const currentTrend = this.simulateTrendDetection(tokenData);
        
        if (previousTrend && previousTrend !== currentTrend) {
            const message = `${ticker} mudou de tendência: ${previousTrend} ? ${currentTrend}.`;
            
            notificationService.createTrendChangeAlert(ticker, message, 'high', {
                previousTrend,
                currentTrend
            });
        }
        
        // Salvar tendência atual
        localStorage.setItem(`trend_${ticker}`, currentTrend);
    }
    
    simulateTrendDetection(tokenData) {
        // Simulação simples - em produção, usaria indicadores técnicos reais
        const change24h = tokenData.change24h;
        
        if (change24h > 5) return 'uptrend';
        if (change24h < -5) return 'downtrend';
        return 'sideways';
    }
    
    // Métodos para configurar alertas
    setPriceAlert(ticker, price, direction) {
        if (!this.priceAlerts.has(ticker)) {
            this.priceAlerts.set(ticker, []);
        }
        
        const alerts = this.priceAlerts.get(ticker);
        alerts.push({
            price,
            direction, // 'above' ou 'below'
            triggered: false,
            createdAt: new Date()
        });
        
        // Iniciar monitoramento se ainda não estiver ativo
        this.startMonitoring(ticker);
        
        return true;
    }
    
    setFibonacciAlert(ticker, level, direction) {
        if (!this.fibonacciAlerts.has(ticker)) {
            this.fibonacciAlerts.set(ticker, []);
        }
        
        const alerts = this.fibonacciAlerts.get(ticker);
        alerts.push({
            level,
            direction, // 'above' ou 'below'
            triggered: false,
            createdAt: new Date()
        });
        
        // Iniciar monitoramento se ainda não estiver ativo
        this.startMonitoring(ticker);
        
        return true;
    }
    
    getActiveAlerts(ticker) {
        return {
            price: this.priceAlerts.get(ticker) || [],
            fibonacci: this.fibonacciAlerts.get(ticker) || []
        };
    }
    
    clearAlerts(ticker) {
        this.priceAlerts.delete(ticker);
        this.fibonacciAlerts.delete(ticker);
        
        // Se não houver mais alertas, parar monitoramento
        if (!this.hasAnyAlerts(ticker)) {
            this.stopMonitoring(ticker);
        }
    }
    
    hasAnyAlerts(ticker) {
        return (
            (this.priceAlerts.has(ticker) && this.priceAlerts.get(ticker).length > 0) ||
            (this.fibonacciAlerts.has(ticker) && this.fibonacciAlerts.get(ticker).length > 0)
        );
    }
}

export default new IntegrationService();

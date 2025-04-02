import soundService from "./soundService.js";

class NotificationService {
    constructor() {
        this.notificationQueue = [];
        this.notificationHistory = [];
        this.notificationSettings = this.loadSettings();
        this.setupNotifications();
    }
    
    loadSettings() {
        // Carregar configurações do localStorage ou usar padrões
        const savedSettings = localStorage.getItem("notificationSettings");
        
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
        
        // Configurações padrão
        return {
            enableBrowserNotifications: true,
            enableSoundAlerts: true,
            enableTelegramAlerts: false,
            telegramChatId: "",
            useFunnySounds: true,
            alertTypes: {
                whaleMovement: true,
                priceAlert: true,
                fibonacciLevel: true,
                trendChange: true
            },
            minSeverity: "medium" // low, medium, high, critical
        };
    }
    
    saveSettings(settings) {
        this.notificationSettings = settings;
        localStorage.setItem("notificationSettings", JSON.stringify(settings));
    }
    
    setupNotifications() {
        // Solicitar permissão para notificações do navegador
        if (this.notificationSettings.enableBrowserNotifications && "Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        }
        
        // Configurar listeners para eventos
        window.addEventListener("whale_movement", (event) => {
            this.processAlert({
                type: "whaleMovement",
                title: "Movimento de Baleia Detectado",
                message: event.detail.message,
                ticker: event.detail.ticker,
                severity: event.detail.severity,
                data: event.detail
            });
        });
        
        window.addEventListener("price_alert", (event) => {
            this.processAlert({
                type: "priceAlert",
                title: "Alerta de Preço",
                message: event.detail.message,
                ticker: event.detail.ticker,
                severity: event.detail.severity,
                data: event.detail
            });
        });
        
        window.addEventListener("fibonacci_level", (event) => {
            this.processAlert({
                type: "fibonacciLevel",
                title: "Nível de Fibonacci Atingido",
                message: event.detail.message,
                ticker: event.detail.ticker,
                severity: event.detail.severity,
                data: event.detail
            });
        });
        
        window.addEventListener("trend_change", (event) => {
            this.processAlert({
                type: "trendChange",
                title: "Mudança de Tendência",
                message: event.detail.message,
                ticker: event.detail.ticker,
                severity: event.detail.severity,
                data: event.detail
            });
        });
        
        // Iniciar processamento da fila de notificações
        setInterval(() => this.processNotificationQueue(), 3000);
    }
    
    processAlert(alert) {
        // Verificar se o tipo de alerta está habilitado
        if (!this.notificationSettings.alertTypes[alert.type]) {
            console.log(`Alerta ignorado (tipo desabilitado): ${alert.type}`);
            return;
        }
        
        // Verificar severidade mínima
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        const minSeverity = severityLevels[this.notificationSettings.minSeverity];
        const alertSeverity = severityLevels[alert.severity];
        
        if (alertSeverity < minSeverity) {
            console.log(`Alerta ignorado (severidade insuficiente): ${alert.severity}`);
            return;
        }
        
        // Adicionar timestamp
        alert.timestamp = new Date();
        
        // Adicionar à fila de notificações
        this.notificationQueue.push(alert);
        
        // Adicionar ao histórico
        this.notificationHistory.unshift(alert);
        
        // Manter histórico limitado a 100 itens
        if (this.notificationHistory.length > 100) {
            this.notificationHistory.pop();
        }
        
        // Salvar histórico no localStorage
        localStorage.setItem("notificationHistory", JSON.stringify(this.notificationHistory));
        
        // Disparar evento de nova notificação
        window.dispatchEvent(new CustomEvent("new_notification", { detail: alert }));
    }
    
    processNotificationQueue() {
        if (this.notificationQueue.length === 0) return;
        
        const alert = this.notificationQueue.shift();
        
        // Enviar notificação do navegador
        if (this.notificationSettings.enableBrowserNotifications && Notification.permission === "granted") {
            this.showBrowserNotification(alert);
        }
        
        // Reproduzir som de alerta
        if (this.notificationSettings.enableSoundAlerts) {
            if (this.notificationSettings.useFunnySounds) {
                soundService.playAlertSound(alert.type, alert.ticker);
            } else {
                // Usar sons padrão se os sons engraçados estiverem desativados
                soundService.playSound("alert");
            }
        }
        
        // Enviar alerta para Telegram
        if (this.notificationSettings.enableTelegramAlerts && this.notificationSettings.telegramChatId) {
            this.sendTelegramAlert(alert);
        }
    }
    
    showBrowserNotification(alert) {
        const iconMap = {
            whaleMovement: "assets/logo.svg",
            priceAlert: "assets/logo.svg",
            fibonacciLevel: "assets/logo.svg",
            trendChange: "assets/logo.svg"
        };
        
        const notification = new Notification(alert.title, {
            body: alert.message,
            icon: iconMap[alert.type] || "assets/logo.svg",
            tag: `${alert.type}-${alert.ticker}`,
            requireInteraction: alert.severity === "critical"
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
            
            // Navegar para a análise do token
            if (alert.ticker) {
                window.dispatchEvent(new CustomEvent("navigate_to_token", {
                    detail: { ticker: alert.ticker }
                }));
            }
        };
    }
    
    async sendTelegramAlert(alert) {
        try {
            const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = this.notificationSettings.telegramChatId;
            
            if (!telegramBotToken || !chatId) {
                console.error("Configurações de Telegram incompletas");
                return;
            }
            
            const severityEmojis = {
                low: "🔵",
                medium: "🟡",
                high: "🔴",
                critical: "⚠️"
            };
            
            const message = `${severityEmojis[alert.severity]} *${alert.title}*\n\n${alert.message}\n\nToken: ${alert.ticker}\nHorário: ${alert.timestamp.toLocaleString()}`;
            
            const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: "Markdown"
                })
            });
            
            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(data.description || "Erro ao enviar alerta para Telegram");
            }
            
            console.log("Alerta enviado para Telegram com sucesso");
        } catch (error) {
            console.error("Erro ao enviar alerta para Telegram:", error);
        }
    }
    
    getNotificationHistory() {
        return this.notificationHistory;
    }
    
    clearNotificationHistory() {
        this.notificationHistory = [];
        localStorage.removeItem("notificationHistory");
    }
    
    // Métodos para criar alertas manualmente
    createWhaleMovementAlert(ticker, message, severity, data) {
        window.dispatchEvent(new CustomEvent("whale_movement", {
            detail: {
                ticker,
                message,
                severity,
                ...data
            }
        }));
    }
    
    createPriceAlert(ticker, message, severity, data) {
        window.dispatchEvent(new CustomEvent("price_alert", {
            detail: {
                ticker,
                message,
                severity,
                ...data
            }
        }));
    }
    
    createFibonacciLevelAlert(ticker, message, severity, data) {
        window.dispatchEvent(new CustomEvent("fibonacci_level", {
            detail: {
                ticker,
                message,
                severity,
                ...data
            }
        }));
    }
    
    createTrendChangeAlert(ticker, message, severity, data) {
        window.dispatchEvent(new CustomEvent("trend_change", {
            detail: {
                ticker,
                message,
                severity,
                ...data
            }
        }));
    }
    
    // Configurações de som
    toggleFunnySounds(enabled) {
        this.notificationSettings.useFunnySounds = enabled;
        this.saveSettings(this.notificationSettings);
    }
}

export default new NotificationService();
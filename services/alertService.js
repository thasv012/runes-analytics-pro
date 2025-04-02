            return announcements;
        } catch (error) {
            console.error('Erro ao obter anúncios de exchanges:', error);
            return [];
        }
    }
    
    async getTokenUpdates() {
        try {
            // Em produção, isso buscaria dados reais de APIs de projetos ou GitHub
            const updates = [];
            
            // 10% de chance de ter uma atualização
            if (Math.random() < 0.1) {
                const tokens = await this.getTopRunesTokens();
                const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
                const updateTypes = ['Atualização de protocolo', 'Nova funcionalidade', 'Correção de bugs', 'Melhoria de desempenho'];
                const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
                
                // 30% de chance de incluir liberação de tokens
                const includeTokenUnlock = Math.random() < 0.3;
                
                const update = {
                    ticker: randomToken,
                    type: updateType,
                    version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
                    releaseDate: new Date(Date.now() + Math.floor(Math.random() * 14 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    url: `https://github.com/${randomToken.toLowerCase()}/releases`
                };
                
                if (includeTokenUnlock) {
                    update.tokenUnlock = {
                        amount: Math.floor(Math.random() * 1000000000) + 100000000,
                        percentage: (Math.random() * 10 + 1).toFixed(2),
                        date: new Date(Date.now() + Math.floor(Math.random() * 30 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        walletType: Math.random() > 0.5 ? 'Equipe' : 'Investidores'
                    };
                }
                
                updates.push(update);
            }
            
            return updates;
        } catch (error) {
            console.error('Erro ao obter atualizações de tokens:', error);
            return [];
        }
    }
    
    createAlert(alertData) {
        // Verificar se o alerta atende aos critérios mínimos de severidade
        const typeSettings = this.alertSettings.alertTypeSettings[alertData.type];
        if (!typeSettings || !typeSettings.enabled) {
            return null;
        }
        
        const severityLevels = {
            [this.alertSeverity.LOW]: 1,
            [this.alertSeverity.MEDIUM]: 2,
            [this.alertSeverity.HIGH]: 3,
            [this.alertSeverity.CRITICAL]: 4
        };
        
        if (severityLevels[alertData.severity] < severityLevels[typeSettings.minSeverity]) {
            return null;
        }
        
        // Criar o objeto de alerta
        const alert = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            type: alertData.type,
            ticker: alertData.ticker,
            title: alertData.title,
            message: alertData.message,
            severity: alertData.severity,
            data: alertData.data || {},
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Adicionar ao histórico
        this.alertHistory.unshift(alert);
        this.saveAlertHistory();
        
        // Enviar para os canais configurados
        this.sendAlertToChannels(alert);
        
        return alert;
    }
    
    async sendAlertToChannels(alert) {
        // Enviar para o app (notificação interna)
        if (this.alertSettings.enabledChannels[this.alertChannels.APP]) {
            this.sendAppNotification(alert);
        }
        
        // Enviar notificação do navegador
        if (this.alertSettings.enabledChannels[this.alertChannels.BROWSER]) {
            this.sendBrowserNotification(alert);
        }
        
        // Enviar para Telegram
        if (this.alertSettings.enabledChannels[this.alertChannels.TELEGRAM] && 
            this.alertSettings.telegramSettings.enabled) {
            await this.sendTelegramNotification(alert);
        }
        
        // Enviar para WhatsApp
        if (this.alertSettings.enabledChannels[this.alertChannels.WHATSAPP] && 
            this.alertSettings.whatsappSettings.enabled) {
            await this.sendWhatsAppNotification(alert);
        }
        
        // Enviar por email
        if (this.alertSettings.enabledChannels[this.alertChannels.EMAIL] && 
            this.alertSettings.emailSettings.enabled) {
            await this.sendEmailNotification(alert);
        }
    }
    
    sendAppNotification(alert) {
        // Disparar evento para o sistema de notificações do app
        const event = new CustomEvent('newAlert', {
            detail: alert
        });
        
        window.dispatchEvent(event);
        
        // Reproduzir som se habilitado
        const typeSettings = this.alertSettings.alertTypeSettings[alert.type];
        if (typeSettings && typeSettings.sound) {
            this.playAlertSound(alert);
        }
    }
    
    playAlertSound(alert) {
        // Usar o serviço de som para reproduzir o som apropriado
        try {
            if (typeof soundService !== 'undefined') {
                soundService.playAlertSound(alert.type, alert.severity);
            }
        } catch (error) {
            console.error('Erro ao reproduzir som de alerta:', error);
        }
    }
    
    sendBrowserNotification(alert) {
        // Verificar se as notificações do navegador estão disponíveis e permitidas
        if (!("Notification" in window)) {
            console.log("Este navegador não suporta notificações desktop");
            return;
        }
        
        if (Notification.permission === "granted") {
            const notification = new Notification(`${alert.title}`, {
                body: alert.message,
                icon: "/assets/logo.svg"
            });
            
            notification.onclick = function() {
                window.focus();
                notification.close();
            };
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.sendBrowserNotification(alert);
                }
            });
        }
    }
    
    async sendTelegramNotification(alert) {
        try {
            const { botToken, chatId } = this.alertSettings.telegramSettings;
            
            if (!botToken || !chatId) {
                console.error('Configurações do Telegram incompletas');
                return;
            }
            
            // Formatar mensagem para Telegram (Markdown)
            const severityEmojis = {
                [this.alertSeverity.LOW]: '🔵',
                [this.alertSeverity.MEDIUM]: '🟡',
                [this.alertSeverity.HIGH]: '🟠',
                [this.alertSeverity.CRITICAL]: '🔴'
            };
            
            const message = `
${severityEmojis[alert.severity]} *${alert.title}*
${alert.message}

*Detalhes:*
${Object.entries(alert.data || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

_Alerta gerado por RUNES Analytics Pro em ${new Date().toLocaleString()}_
            `;
            
            // Em produção, isso enviaria uma requisição real para a API do Telegram
            const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            
            const response = await fetch(telegramApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            
            const data = await response.json();
            if (!data.ok) {
                throw new Error(data.description || 'Erro ao enviar mensagem para o Telegram');
            }
            
            console.log('[TELEGRAM] Alerta enviado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação para o Telegram:', error);
            return false;
        }
    }
    
    async sendWhatsAppNotification(alert) {
        try {
            const { apiKey, phoneNumber } = this.alertSettings.whatsappSettings;
            
            if (!apiKey || !phoneNumber) {
                console.error('Configurações do WhatsApp incompletas');
                return;
            }
            
            // Formatar mensagem para WhatsApp
            const message = `
🚨 *${alert.title}*
${alert.message}

*Detalhes:*
${Object.entries(alert.data || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

_Alerta gerado por RUNES Analytics Pro_
            `;
            
            // Em produção, isso enviaria uma requisição real para uma API de WhatsApp
            // como a Twilio, MessageBird, etc.
            
            // Exemplo com Twilio
            const twilioApiUrl = 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json';
            
            const formData = new URLSearchParams();
            formData.append('To', `whatsapp:${phoneNumber}`);
            formData.append('From', 'whatsapp:YOUR_TWILIO_NUMBER');
            formData.append('Body', message);
            
            const response = await fetch(twilioApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`YOUR_ACCOUNT_SID:${apiKey}`)}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao enviar mensagem para o WhatsApp: ${response.statusText}`);
            }
            
            console.log('[WHATSAPP] Alerta enviado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação para o WhatsApp:', error);
            return false;
        }
    }
    
    async sendEmailNotification(alert) {
        try {
            const { address } = this.alertSettings.emailSettings;
            
            if (!address) {
                console.error('Configurações de email incompletas');
                return;
            }
            
            // Formatar mensagem para email
            const subject = `RUNES Analytics Pro: ${alert.title}`;
            const body = `
<h2>${alert.title}</h2>
<p>${alert.message}</p>

<h3>Detalhes:</h3>
<ul>
    ${Object.entries(alert.data || {}).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
</ul>

<p><em>Alerta gerado por RUNES Analytics Pro em ${new Date().toLocaleString()}</em></p>
            `;
            
            // Em produção, isso enviaria um email real usando um serviço como SendGrid, Mailgun, etc.
            // Exemplo com EmailJS
            const emailJsServiceId = 'YOUR_SERVICE_ID';
            const emailJsTemplateId = 'YOUR_TEMPLATE_ID';
            const emailJsUserId = 'YOUR_USER_ID';
            
            const templateParams = {
                to_email: address,
                subject: subject,
                message_html: body
            };
            
            // Enviar email usando EmailJS
            await emailjs.send(emailJsServiceId, emailJsTemplateId, templateParams, emailJsUserId);
            
            console.log('[EMAIL] Alerta enviado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação por email:', error);
            return false;
        }
    }
    
    // Métodos para configuração
    updateTelegramSettings(botToken, chatId, enabled = true) {
        this.alertSettings.telegramSettings = {
            botToken,
            chatId,
            enabled
        };
        this.saveSettings();
    }
    
    updateWhatsAppSettings(apiKey, phoneNumber, enabled = true) {
        this.alertSettings.whatsappSettings = {
            apiKey,
            phoneNumber,
            enabled
        };
        this.saveSettings();
    }
    
    updateEmailSettings(address, enabled = true) {
        this.alertSettings.emailSettings = {
            address,
            enabled
        };
        this.saveSettings();
    }
    
    updateAlertTypeSettings(type, settings) {
        this.alertSettings.alertTypeSettings[type] = {
            ...this.alertSettings.alertTypeSettings[type],
            ...settings
        };
        this.saveSettings();
    }
    
    updateEnabledChannels(channels) {
        this.alertSettings.enabledChannels = {
            ...this.alertSettings.enabledChannels,
            ...channels
        };
        this.saveSettings();
    }
    
    addFavoriteToken(ticker) {
        if (!this.alertSettings.favoriteTokens.includes(ticker)) {
            this.alertSettings.favoriteTokens.push(ticker);
            this.saveSettings();
        }
    }
    
    removeFavoriteToken(ticker) {
        this.alertSettings.favoriteTokens = this.alertSettings.favoriteTokens.filter(t => t !== ticker);
        this.saveSettings();
    }
    
    addCustomAlert(alert) {
        this.alertSettings.customAlerts.push(alert);
        this.saveSettings();
    }
    
    removeCustomAlert(alertId) {
        this.alertSettings.customAlerts = this.alertSettings.customAlerts.filter(a => a.id !== alertId);
        this.saveSettings();
    }
    
    getAlertHistory(limit = 50) {
        return this.alertHistory.slice(0, limit);
    }
    
    markAlertAsRead(alertId) {
        const alert = this.alertHistory.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            this.saveAlertHistory();
        }
    }
    
    markAllAlertsAsRead() {
        this.alertHistory.forEach(alert => {
            alert.read = true;
        });
        this.saveAlertHistory();
    }
    
    clearAlertHistory() {
        this.alertHistory = [];
        this.saveAlertHistory();
    }
}

export default new AdvancedAlertService();
'@

Set-Content -Path "C:\Users\Thierry\Desktop\runes-analytics-pro\services\alertService.js" -Value $alertServiceContent
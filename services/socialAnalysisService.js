class SocialAnalysisService {
    constructor() {
        this.platforms = ["twitter", "telegram", "discord", "reddit"];
        this.cachedData = new Map();
        this.updateInterval = 30 * 60 * 1000; // 30 minutos
        
        // Iniciar com dados simulados
        this.initializeSimulatedData();
        
        // Atualizar periodicamente
        setInterval(() => this.updateSocialData(), this.updateInterval);
    }
    
    initializeSimulatedData() {
        const tokens = ["PEPE", "MEME", "DOGE", "SHIB", "WOJAK", "MOON", "FOMO", "PUMP", "DUMP", "HODL"];
        tokens.forEach(ticker => {
            this.cachedData.set(ticker, this.generateSimulatedSocialData(ticker));
        });
    }
    
    generateSimulatedSocialData(ticker) {
        const popularityFactor = ["PEPE", "DOGE", "SHIB", "MEME"].includes(ticker) ? 3 : 1;
        
        // Dados do Twitter (X)
        const twitterData = {
            mentions24h: Math.floor(Math.random() * 1000 * popularityFactor) + 100,
            tweets24h: Math.floor(Math.random() * 500 * popularityFactor) + 50,
            engagement: (Math.random() * 5 * popularityFactor) + 1,
            sentimentScore: (Math.random() * 100) - 50,
            influencerMentions: Math.floor(Math.random() * 20 * popularityFactor),
            whaleInfluencerMentions: Math.floor(Math.random() * 5 * popularityFactor)
        };
        
        // Calcular pontuação social
        const socialScore = Math.min(Math.round((
            (twitterData.mentions24h / 1000) * 0.2 +
            (twitterData.tweets24h / 500) * 0.15 +
            (twitterData.engagement / 5) * 0.25 +
            ((twitterData.sentimentScore + 50) / 100) * 0.1 +
            (twitterData.influencerMentions / 20) * 0.3
        ) * 100), 100);
        
        return {
            ticker,
            lastUpdated: new Date(),
            twitter: twitterData,
            socialScore,
            viralityPotential: Math.min(Math.round(twitterData.engagement * 20), 100),
            communityHealth: Math.min(Math.round(((twitterData.sentimentScore + 50) / 100) * 100), 100)
        };
    }
    
    async getSocialData(ticker) {
        if (!this.cachedData.has(ticker)) {
            this.cachedData.set(ticker, this.generateSimulatedSocialData(ticker));
        }
        return this.cachedData.get(ticker);
    }
    
    async updateSocialData() {
        for (const ticker of this.cachedData.keys()) {
            this.cachedData.set(ticker, this.generateSimulatedSocialData(ticker));
        }
        console.log("Dados sociais atualizados:", new Date());
    }
    
    async getTopTokensBySocialScore(limit = 10) {
        const allData = Array.from(this.cachedData.values());
        return allData
            .sort((a, b) => b.socialScore - a.socialScore)
            .slice(0, limit);
    }
    
    async getTopTokensByVirality(limit = 10) {
        const allData = Array.from(this.cachedData.values());
        return allData
            .sort((a, b) => b.viralityPotential - a.viralityPotential)
            .slice(0, limit);
    }
}

export default new SocialAnalysisService();

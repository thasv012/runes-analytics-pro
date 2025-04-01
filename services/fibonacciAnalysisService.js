class FibonacciAnalysisService {
    constructor() {
        this.levels = {
            extensions: [4.236, 2.618, 1.618],
            retracements: [1.000, 0.786, 0.618, 0.500, 0.382, 0.236],
            projections: [1.272, 1.414, 1.618, 2.000, 2.414, 2.618]
        };
        this.trendData = null;
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('fib-trend').addEventListener('change', (e) => {
            this.updateTrendDirection(e.target.value);
        });

        document.getElementById('refresh-fib').addEventListener('click', () => {
            this.recalculateLevels();
        });
    }

    async analyzeTrend(priceData) {
        const high = Math.max(...priceData.map(p => p.high));
        const low = Math.min(...priceData.map(p => p.low));
        const current = priceData[priceData.length - 1].close;

        this.trendData = {
            high,
            low,
            current,
            range: high - low,
            trend: current > (high + low) / 2 ? 'uptrend' : 'downtrend'
        };

        return this.trendData;
    }

    calculateLevels() {
        if (!this.trendData) return null;

        const { high, low, range } = this.trendData;
        const levels = {
            extensions: {},
            retracements: {},
            projections: {}
        };

        // Calcular extensões
        this.levels.extensions.forEach(level => {
            levels.extensions[level] = high + (range * level);
        });

        // Calcular retrações
        this.levels.retracements.forEach(level => {
            levels.retracements[level] = high - (range * level);
        });

        // Calcular projeções
        this.levels.projections.forEach(level => {
            levels.projections[level] = low + (range * level);
        });

        return levels;
    }

    findConfluenceZones(levels) {
        const allLevels = [];
        const tolerance = 0.001; // 0.1% de tolerância

        // Combinar todos os níveis
        Object.entries(levels).forEach(([type, typeLevels]) => {
            Object.entries(typeLevels).forEach(([level, price]) => {
                allLevels.push({
                    type,
                    level: parseFloat(level),
                    price
                });
            });
        });

        // Encontrar zonas de confluência
        const zones = [];
        allLevels.forEach((level1, i) => {
            const confluent = allLevels.slice(i + 1).filter(level2 => {
                const diff = Math.abs(level1.price - level2.price) / level1.price;
                return diff <= tolerance;
            });

            if (confluent.length > 0) {
                zones.push({
                    price: level1.price,
                    levels: [level1, ...confluent],
                    strength: confluent.length + 1
                });
            }
        });

        return zones.sort((a, b) => b.strength - a.strength);
    }

    calculateProbability(level, confluenceZones, historicalData) {
        let probability = 0;

        // Fatores que aumentam a probabilidade
        const factors = {
            confluenceStrength: 0.3,  // 30% peso para confluência
            historicalReaction: 0.4,  // 40% peso para reações históricas
            trendAlignment: 0.3      // 30% peso para alinhamento com tendência
        };

        // Análise de confluência
        const confluence = confluenceZones.find(zone => 
            Math.abs(zone.price - level) / level < 0.001
        );
        if (confluence) {
            probability += (confluence.strength / 5) * factors.confluenceStrength;
        }

        // Análise histórica
        const historicalReactions = this.analyzeHistoricalReactions(level, historicalData);
        probability += historicalReactions * factors.historicalReaction;

        // Alinhamento com tendência
        const trendAlignment = this.calculateTrendAlignment(level);
        probability += trendAlignment * factors.trendAlignment;

        return Math.min(Math.round(probability * 100), 100);
    }

    updateUI(levels, confluenceZones, probabilities) {
        // Atualizar níveis de extensão
        Object.entries(levels.extensions).forEach(([level, price]) => {
            const element = document.querySelector(`.ext-${level.replace('.', '')}`);
            if (element) {
                element.querySelector('.level-price').textContent = price.toFixed(8);
            }
        });

        // Atualizar níveis de retração
        Object.entries(levels.retracements).forEach(([level, price]) => {
            const element = document.querySelector(`.ret-${level.replace('.', '')}`);
            if (element) {
                element.querySelector('.level-price').textContent = price.toFixed(8);
            }
        });

        // Atualizar zonas de confluência
        const confluenceContainer = document.getElementById('confluence-zones');
        if (confluenceContainer) {
            confluenceContainer.innerHTML = confluenceZones.map(zone => `
                <div class="zone-item">
                    <div class="zone-price">${zone.price.toFixed(8)}</div>
                    <div class="zone-levels">
                        ${zone.levels.map(l => l.level).join(' | ')}
                    </div>
                    <div class="zone-strength">
                        Força: ${zone.strength}
                    </div>
                </div>
            `).join('');
        }

        // Atualizar probabilidades
        if (probabilities) {
            document.getElementById('support-conf').textContent = `${probabilities.support}%`;
            document.getElementById('resistance-conf').textContent = `${probabilities.resistance}%`;
            document.getElementById('target-conf').textContent = `${probabilities.target}%`;
        }
    }
}

export default new FibonacciAnalysisService();

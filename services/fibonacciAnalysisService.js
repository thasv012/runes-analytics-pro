class FibonacciAnalysisService {
    constructor() {
        this.retracementLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        this.extensionLevels = [1.272, 1.414, 1.618, 2, 2.272, 2.414, 2.618, 3, 3.618, 4.236];
    }
    
    analyzeTrend(priceData) {
        // Determinar tendência atual
        const prices = priceData.map(p => p.close);
        const periods = [7, 14, 30]; // Períodos para análise
        
        const trends = periods.map(period => {
            const relevantPrices = prices.slice(-period);
            if (relevantPrices.length < period) return null;
            
            const firstPrice = relevantPrices[0];
            const lastPrice = relevantPrices[relevantPrices.length - 1];
            const change = (lastPrice - firstPrice) / firstPrice * 100;
            
            return {
                period,
                change,
                direction: change > 0 ? 'uptrend' : change < 0 ? 'downtrend' : 'sideways'
            };
        }).filter(t => t !== null);
        
        // Determinar tendência dominante
        const dominantTrend = this.getDominantTrend(trends);
        
        return {
            trends,
            dominantTrend
        };
    }
    
    getDominantTrend(trends) {
        if (trends.length === 0) return { direction: 'sideways', confidence: 0 };
        
        // Pesos para diferentes períodos (mais recente tem mais peso)
        const weights = {
            7: 0.5,  // 50% de peso para tendência de 7 dias
            14: 0.3, // 30% de peso para tendência de 14 dias
            30: 0.2  // 20% de peso para tendência de 30 dias
        };
        
        let uptrendScore = 0;
        let downtrendScore = 0;
        
        trends.forEach(trend => {
            const weight = weights[trend.period] || 0;
            const score = Math.min(Math.abs(trend.change), 20) / 20; // Normalizar para 0-1
            
            if (trend.direction === 'uptrend') {
                uptrendScore += score * weight;
            } else if (trend.direction === 'downtrend') {
                downtrendScore += score * weight;
            }
        });
        
        const totalScore = uptrendScore + downtrendScore;
        
        if (totalScore < 0.2) {
            return { direction: 'sideways', confidence: Math.round((1 - totalScore) * 100) };
        } else if (uptrendScore > downtrendScore) {
            return { direction: 'uptrend', confidence: Math.round((uptrendScore / totalScore) * 100) };
        } else {
            return { direction: 'downtrend', confidence: Math.round((downtrendScore / totalScore) * 100) };
        }
    }
    
    calculateFibonacciLevels(high, low, currentPrice, trend) {
        const range = high - low;
        const levels = {};
        
        // Calcular níveis de retração
        this.retracementLevels.forEach(level => {
            levels[`retracement_${level}`] = {
                level: level,
                price: high - (range * level),
                type: 'retracement'
            };
        });
        
        // Calcular níveis de extensão
        this.extensionLevels.forEach(level => {
            const extensionLevel = level - 1; // Ajustar para cálculo correto
            levels[`extension_${level}`] = {
                level: level,
                price: high + (range * extensionLevel),
                type: 'extension'
            };
        });
        
        // Identificar níveis próximos ao preço atual
        const nearLevels = this.findNearLevels(levels, currentPrice);
        
        // Identificar suportes e resistências baseados na tendência
        const supports = this.identifySupports(levels, currentPrice, trend);
        const resistances = this.identifyResistances(levels, currentPrice, trend);
        
        // Identificar alvos potenciais
        const targets = this.identifyTargets(levels, currentPrice, trend);
        
        return {
            high,
            low,
            currentPrice,
            trend,
            levels,
            nearLevels,
            supports,
            resistances,
            targets
        };
    }
    
    findNearLevels(levels, currentPrice) {
        const threshold = 0.03; // 3% de proximidade
        const nearLevels = [];
        
        Object.values(levels).forEach(level => {
            const distance = Math.abs(level.price - currentPrice) / currentPrice;
            if (distance <= threshold) {
                nearLevels.push({
                    ...level,
                    distance: distance,
                    percentDistance: (distance * 100).toFixed(2) + '%'
                });
            }
        });
        
        return nearLevels.sort((a, b) => a.distance - b.distance);
    }
    
    identifySupports(levels, currentPrice, trend) {
        const supports = [];
        
        Object.values(levels).forEach(level => {
            if (level.price < currentPrice) {
                let strength = 'fraca';
                
                // Níveis de retração específicos são suportes mais fortes
                if (level.type === 'retracement') {
                    if (level.level === 0.618) strength = 'forte';
                    else if (level.level === 0.786) strength = 'muito forte';
                    else if (level.level === 0.5) strength = 'moderada';
                }
                
                // Em tendência de alta, suportes são mais importantes
                if (trend.direction === 'uptrend') {
                    if (strength === 'fraca') strength = 'moderada';
                    else if (strength === 'moderada') strength = 'forte';
                    else if (strength === 'forte') strength = 'muito forte';
                }
                
                supports.push({
                    ...level,
                    strength
                });
            }
        });
        
        return supports.sort((a, b) => b.price - a.price);
    }
    
    identifyResistances(levels, currentPrice, trend) {
        const resistances = [];
        
        Object.values(levels).forEach(level => {
            if (level.price > currentPrice) {
                let strength = 'fraca';
                
                // Níveis de retração específicos são resistências mais fortes
                if (level.type === 'retracement') {
                    if (level.level === 0.236) strength = 'forte';
                    else if (level.level === 0) strength = 'muito forte';
                    else if (level.level === 0.382) strength = 'moderada';
                }
                
                // Níveis de extensão específicos também são resistências importantes
                if (level.type === 'extension') {
                    if (level.level === 1.618) strength = 'forte';
                    else if (level.level === 2.618) strength = 'muito forte';
                }
                
                // Em tendência de baixa, resistências são mais importantes
                if (trend.direction === 'downtrend') {
                    if (strength === 'fraca') strength = 'moderada';
                    else if (strength === 'moderada') strength = 'forte';
                    else if (strength === 'forte') strength = 'muito forte';
                }
                
                resistances.push({
                    ...level,
                    strength
                });
            }
        });
        
        return resistances.sort((a, b) => a.price - b.price);
    }
    
    identifyTargets(levels, currentPrice, trend) {
        const targets = [];
        
        if (trend.direction === 'uptrend') {
            // Em tendência de alta, alvos são extensões acima do preço atual
            const extensionTargets = [1.618, 2.618, 3.618];
            
            extensionTargets.forEach((targetLevel, index) => {
                const level = levels[`extension_${targetLevel}`];
                if (level && level.price > currentPrice) {
                    targets.push({
                        ...level,
                        probability: index === 0 ? 'alta' : index === 1 ? 'média' : 'baixa',
                        potentialReturn: ((level.price - currentPrice) / currentPrice * 100).toFixed(2) + '%'
                    });
                }
            });
        } else if (trend.direction === 'downtrend') {
            // Em tendência de baixa, alvos são retrações abaixo do preço atual
            const retracementTargets = [0.618, 0.786, 1];
            
            retracementTargets.forEach((targetLevel, index) => {
                const level = levels[`retracement_${targetLevel}`];
                if (level && level.price < currentPrice) {
                    targets.push({
                        ...level,
                        probability: index === 0 ? 'alta' : index === 1 ? 'média' : 'baixa',
                        potentialDrop: ((currentPrice - level.price) / currentPrice * 100).toFixed(2) + '%'
                    });
                }
            });
        }
        
        return targets;
    }
    
    generateFibonacciReport(analysis) {
        const { trend, supports, resistances, targets, nearLevels } = analysis;
        
        let report = {
            trendAnalysis: {
                direction: trend.direction,
                confidence: trend.confidence,
                recommendation: this.getTrendRecommendation(trend)
            },
            keyLevels: {
                nearestLevel: nearLevels.length > 0 ? nearLevels[0] : null,
                strongestSupport: supports.find(s => s.strength === 'muito forte') || supports[0],
                strongestResistance: resistances.find(r => r.strength === 'muito forte') || resistances[0]
            },
            targets: targets.map(target => ({
                price: target.price,
                level: target.level,
                probability: target.probability,
                potentialReturn: target.potentialReturn || target.potentialDrop
            })),
            tradingStrategy: this.generateTradingStrategy(analysis)
        };
        
        return report;
    }
    
    getTrendRecommendation(trend) {
        if (trend.direction === 'uptrend' && trend.confidence > 70) {
            return 'Tendência de alta forte - considere comprar em suportes';
        } else if (trend.direction === 'uptrend') {
            return 'Tendência de alta - busque oportunidades de entrada em retrações';
        } else if (trend.direction === 'downtrend' && trend.confidence > 70) {
            return 'Tendência de baixa forte - considere vender em resistências';
        } else if (trend.direction === 'downtrend') {
            return 'Tendência de baixa - evite compras, aguarde reversão';
        } else {
            return 'Mercado lateral - opere com cautela nos extremos do range';
        }
    }
    
    generateTradingStrategy(analysis) {
        const { trend, supports, resistances, currentPrice } = analysis;
        
        if (trend.direction === 'uptrend') {
            // Estratégia para tendência de alta
            const entryPoints = supports.slice(0, 2).map(s => ({
                price: s.price,
                type: 'suporte',
                level: s.level,
                strength: s.strength
            }));
            
            const exitPoints = resistances.slice(0, 2).map(r => ({
                price: r.price,
                type: 'resistência',
                level: r.level,
                strength: r.strength
            }));
            
            const stopLoss = supports.length > 0 ? 
                supports[0].price * 0.95 : // 5% abaixo do primeiro suporte
                currentPrice * 0.9; // 10% abaixo do preço atual
            
            return {
                strategy: 'Comprar em suportes, vender em resistências',
                entryPoints,
                exitPoints,
                stopLoss,
                riskRewardRatio: this.calculateRiskReward(currentPrice, exitPoints[0]?.price, stopLoss)
            };
        } else if (trend.direction === 'downtrend') {
            // Estratégia para tendência de baixa
            const entryPoints = resistances.slice(0, 2).map(r => ({
                price: r.price,
                type: 'resistência',
                level: r.level,
                strength: r.strength
            }));
            
            const exitPoints = supports.slice(0, 2).map(s => ({
                price: s.price,
                type: 'suporte',
                level: s.level,
                strength: s.strength
            }));
            
            const stopLoss = resistances.length > 0 ? 
                resistances[0].price * 1.05 : // 5% acima da primeira resistência
                currentPrice * 1.1; // 10% acima do preço atual
            
            return {
                strategy: 'Vender em resistências, comprar em suportes',
                entryPoints,
                exitPoints,
                stopLoss,
                riskRewardRatio: this.calculateRiskReward(currentPrice, exitPoints[0]?.price, stopLoss)
            };
        } else {
            // Estratégia para mercado lateral
            return {
                strategy: 'Operar nos extremos do range',
                entryPoints: [
                    { price: supports[0]?.price, type: 'suporte', strength: supports[0]?.strength },
                    { price: resistances[0]?.price, type: 'resistência', strength: resistances[0]?.strength }
                ],
                exitPoints: [
                    { price: resistances[0]?.price, type: 'resistência', strength: resistances[0]?.strength },
                    { price: supports[0]?.price, type: 'suporte', strength: supports[0]?.strength }
                ],
                stopLoss: supports[0]?.price * 0.95,
                riskRewardRatio: 1
            };
        }
    }
    
    calculateRiskReward(entryPrice, targetPrice, stopLoss) {
        if (!entryPrice || !targetPrice || !stopLoss) return 1;
        
        const reward = Math.abs(targetPrice - entryPrice);
        const risk = Math.abs(entryPrice - stopLoss);
        
        if (risk === 0) return 0;
        
        return (reward / risk).toFixed(2);
    }
}

export default new FibonacciAnalysisService();

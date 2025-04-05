// Componente simplificado para exibir a tabela de ranking de RUNES
class RunesRankingTable {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container com ID "${containerId}" não encontrado.`);
            return;
        }
        
        this.runesData = [];
    }
    
    // Carregar dados e renderizar a tabela
    loadData(runesData) {
        console.log('Carregando dados para tabela de ranking de RUNES:', runesData?.length || 0, 'itens');
        this.runesData = runesData || [];
        this.render();
    }
    
    // Renderizar a tabela de RUNES
    render() {
        if (!this.container) return;
        
        // Limpar conteúdo existente
        this.container.innerHTML = '';
        
        if (!this.runesData || this.runesData.length === 0) {
            this.container.innerHTML = '<div class="no-data">Nenhum dado de RUNES disponível.</div>';
            return;
        }
        
        // Criar tabela
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Cabeçalho
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>RUNE</th>
                <th>Preço (BTC)</th>
                <th>24h %</th>
                <th>Volume 24h</th>
                <th>Cap. de Mercado</th>
                <th>Holders</th>
            </tr>
        `;
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        
        this.runesData.forEach((rune, index) => {
            const row = document.createElement('tr');
            
            const changeClass = (rune.change && rune.change > 0) ? 'positive' : 'negative';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${rune.ticker || "RUNE"}</td>
                <td>${rune.price || "0.00"}</td>
                <td class="${changeClass}">${(rune.change || "0") + "%"}</td>
                <td>$${this.formatNumber(rune.volume24h || 0)}</td>
                <td>$${this.formatNumber(rune.marketCap || 0)}</td>
                <td>${this.formatNumber(rune.holdersCount || 0)}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        this.container.appendChild(table);
    }
    
    // Formatação de números
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Para uso direto sem módulos
window.RunesRankingTable = RunesRankingTable;
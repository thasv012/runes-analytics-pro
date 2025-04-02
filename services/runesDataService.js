class RunesDataService {
    constructor() {
        console.log("RunesDataService inicializado");
        this.data = {
            tokens: ['ORDI', 'SATS', 'RATS', 'MEME', 'VMPX']
        };
    }
    
    async getTopTokens() {
        return this.data.tokens;
    }
    
    async getTokenInfo(token) {
        return {
            name: token,
            price: Math.floor(Math.random() * 10000),
            change24h: (Math.random() * 20 - 10).toFixed(2) + '%'
        };
    }
}

console.log("runesDataService.js carregado");
const runesDataService = new RunesDataService();
export default runesDataService;

/**
 * RUNES Analytics Pro - Serviço de API Geniidata
 * Implementa integração com a API Geniidata para obter dados sobre RUNES
 */

const axios = require('axios');
const BaseApiService = require('./BaseApiService');

class GeniiDataService extends BaseApiService {
    constructor() {
        super();
        this.baseUrl = 'https://api.geniidata.com';
        this.apiKey = null;
    }

    /**
     * Configura a chave de API para autenticação
     * @param {string} apiKey - Chave de API da Geniidata
     */
    auth(apiKey) {
        this.apiKey = apiKey;
        return this;
    }

    /**
     * Realiza uma requisição à API com a autenticação configurada
     * @param {string} endpoint - Endpoint da API
     * @param {Object} params - Parâmetros da requisição
     * @returns {Promise} - Promise com o resultado da requisição
     */
    async request(endpoint, params = {}) {
        if (!this.apiKey) {
            throw new Error('API key não configurada. Use o método auth() primeiro.');
        }

        try {
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro na requisição à API Geniidata:', error.message);
            throw error;
        }
    }

    /**
     * Obtém a lista de informações sobre RUNES
     * @param {Object} options - Opções de paginação e filtros
     * @returns {Promise} - Promise com os dados de RUNES
     */
    async getRunesInfoList(options = { limit: '20', offset: '0' }) {
        return this.request('/v1/runes/info', options);
    }

    /**
     * Obtém informações detalhadas sobre uma RUNE específica
     * @param {string} runeName - Nome da RUNE
     * @returns {Promise} - Promise com os dados detalhados da RUNE
     */
    async getRuneDetails(runeName) {
        return this.request(`/v1/runes/info/${runeName}`);
    }

    /**
     * Obtém histórico de transações de uma RUNE
     * @param {string} runeName - Nome da RUNE
     * @param {Object} options - Opções de paginação e filtros
     * @returns {Promise} - Promise com o histórico de transações
     */
    async getRuneTransactions(runeName, options = { limit: '20', offset: '0' }) {
        return this.request(`/v1/runes/transactions/${runeName}`, options);
    }

    /**
     * Obtém dados de mercado para RUNES
     * @param {Object} options - Opções de paginação e filtros
     * @returns {Promise} - Promise com dados de mercado
     */
    async getRunesMarketData(options = {}) {
        return this.request('/v1/runes/market', options);
    }

    /**
     * Obtém saldo de RUNES para um endereço específico
     * @param {string} address - Endereço Bitcoin
     * @returns {Promise} - Promise com os saldos de RUNES
     */
    async getAddressBalances(address) {
        return this.request(`/v1/runes/balances/${address}`);
    }
}

// Exportar uma instância única do serviço
const geniidata = new GeniiDataService();
module.exports = geniidata;

// Para uso no navegador
if (typeof window !== 'undefined') {
    window.geniidata = geniidata;
} 
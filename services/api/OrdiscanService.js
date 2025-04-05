// services/api/OrdiscanService.js
const BaseApiService = require('./BaseApiService');
const cacheService = require('../cache/CacheService');

class OrdiscanService extends BaseApiService {
  constructor() {
    super('https://ordiscan.com/api');
  }

  async listRunes() {
    return this.fetchWithCache('/runes', {}, 'ordiscan-runes-list');
  }

  async getRuneInfo(runeName) {
    return this.fetchWithCache(`/rune/${runeName}`, {}, `ordiscan-rune-${runeName}`);
  }

  async getRuneMarketInfo(runeName) {
    return this.fetchWithCache(`/rune/${runeName}/market`, {}, `ordiscan-rune-market-${runeName}`);
  }

  async getRuneBalance(address, runeName) {
    return this.fetchWithCache(
      `/address/${address}/rune/${runeName}`, 
      {}, 
      `ordiscan-balance-${address}-${runeName}`
    );
  }

  async getRunesActivity(limit = 50) {
    return this.fetchWithCache('/runes/activity', { limit }, `ordiscan-activity-${limit}`);
  }

  async getRunesInTx(txid) {
    return this.fetchWithCache(`/tx/${txid}/runes`, {}, `ordiscan-tx-${txid}`);
  }
}

module.exports = new OrdiscanService();
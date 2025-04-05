// services/cache/CacheService.js
const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    // TTL padrão: 5 minutos
    this.cache = new NodeCache({ 
      stdTTL: process.env.CACHE_TTL || 300,
      checkperiod: 60 
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = null) {
    return this.cache.set(key, value, ttl);
  }

  has(key) {
    return this.cache.has(key);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }
}

module.exports = new CacheService();
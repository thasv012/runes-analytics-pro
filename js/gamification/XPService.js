/**
 * RUNES Analytics Pro - XP Service
 * 
 * A service to handle user XP tracking, level calculation, and event emission on level-ups.
 * Part of the gamification system for RUNES Analytics Pro platform.
 */

class XPService {
  constructor() {
    this.dbName = 'runesAnalyticsPro';
    this.storeName = 'userProgress';
    this.levels = [
      { level: 1, name: "Runes Initiate", xpRequired: 0 },
      { level: 2, name: "Token Explorer", xpRequired: 100 },
      { level: 3, name: "Data Analyst", xpRequired: 500 },
      { level: 4, name: "Cypher Mage", xpRequired: 1500 },
      { level: 5, name: "Inscription Master", xpRequired: 3000 },
      { level: 6, name: "Blockchain Oracle", xpRequired: 6000 },
      { level: 7, name: "Network Guardian", xpRequired: 10000 },
      { level: 8, name: "Crypto Legend", xpRequired: 15000 }
    ];
    
    this.user = {
      xp: 0,
      level: 1,
      rank: "Runes Initiate",
      history: []
    };
    
    this.init();
  }
  
  /**
   * Initialize the service and database connection
   */
  async init() {
    try {
      await this.initDB();
      await this.loadUserProgress();
      console.log('XP Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize XP Service:', error);
    }
  }
  
  /**
   * Initialize IndexedDB for data persistence
   */
  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      
      request.onerror = (event) => {
        reject(`IndexedDB error: ${event.target.errorCode}`);
      };
    });
  }
  
  /**
   * Load user progress from IndexedDB
   */
  async loadUserProgress() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('userXP');
      
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          this.user = result;
          console.log('User progress loaded:', this.user);
        }
        resolve();
      };
      
      request.onerror = (event) => {
        reject(`Error loading user progress: ${event.target.errorCode}`);
      };
    });
  }
  
  /**
   * Save user progress to IndexedDB
   */
  async saveUserProgress() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const userData = { ...this.user, id: 'userXP', lastUpdated: new Date() };
      const request = store.put(userData);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(`Error saving user progress: ${event.target.errorCode}`);
      };
    });
  }
  
  /**
   * Award XP to the user
   * @param {number} amount - Amount of XP to award
   * @param {string} reason - Reason for awarding XP
   * @returns {Object} Result object with new level info if leveled up
   */
  async awardXP(amount, reason) {
    if (amount <= 0) return { success: false, error: 'Invalid XP amount' };
    
    const oldLevel = this.getCurrentLevel();
    const oldXP = this.user.xp;
    
    // Update user XP
    this.user.xp += amount;
    
    // Check for level up
    const newLevel = this.getCurrentLevel();
    let levelUpData = null;
    
    if (newLevel > oldLevel) {
      // Level up occurred
      levelUpData = await this.handleLevelUp(newLevel);
    }
    
    // Add to history
    this.user.history.push({
      timestamp: new Date(),
      action: 'xp_gain',
      amount,
      reason,
      newTotal: this.user.xp
    });
    
    // Limit history to last 50 entries
    if (this.user.history.length > 50) {
      this.user.history = this.user.history.slice(-50);
    }
    
    // Save progress
    await this.saveUserProgress();
    
    // Emit XP update event
    this.emitXPUpdateEvent({
      oldXP,
      newXP: this.user.xp,
      amount,
      reason,
      levelUp: levelUpData
    });
    
    return {
      success: true,
      newXP: this.user.xp,
      levelUp: levelUpData
    };
  }
  
  /**
   * Handle level up logic
   * @param {number} newLevel - The new level
   * @returns {Object} Level up data
   */
  async handleLevelUp(newLevel) {
    const levelInfo = this.levels.find(l => l.level === newLevel);
    
    if (!levelInfo) {
      console.error(`Level information not found for level ${newLevel}`);
      return null;
    }
    
    // Update user level and rank
    this.user.level = newLevel;
    this.user.rank = levelInfo.name;
    
    // Add to history
    this.user.history.push({
      timestamp: new Date(),
      action: 'level_up',
      newLevel,
      newRank: levelInfo.name
    });
    
    // Emit level up event
    this.emitLevelUpEvent({
      level: newLevel,
      rank: levelInfo.name
    });
    
    return {
      level: newLevel,
      rank: levelInfo.name,
      rewards: this.getRewardsForLevel(newLevel)
    };
  }
  
  /**
   * Get the current level based on XP
   * @returns {number} Current level
   */
  getCurrentLevel() {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (this.user.xp >= this.levels[i].xpRequired) {
        return this.levels[i].level;
      }
    }
    return 1; // Default to level 1
  }
  
  /**
   * Get rewards for specified level
   * @param {number} level - Level to get rewards for
   * @returns {Array} Array of rewards
   */
  getRewardsForLevel(level) {
    // This would be expanded with actual rewards
    const rewardsByLevel = {
      2: [{ type: 'theme', id: 'cyberNeon', name: 'Cyber Neon Theme' }],
      3: [{ type: 'powerup', id: 'fastAnalysis', name: 'Fast Analysis' }],
      4: [{ type: 'badge', id: 'cypherMage', name: 'Cypher Mage Badge' }],
      5: [{ type: 'feature', id: 'advancedFilters', name: 'Advanced Filters' }],
      6: [{ type: 'badge', id: 'oracle', name: 'Oracle Badge' }],
      7: [{ type: 'powerup', id: 'meshPriority', name: 'GPU Mesh Priority' }],
      8: [{ type: 'trophy', id: 'legend', name: 'Crypto Legend Trophy' }]
    };
    
    return rewardsByLevel[level] || [];
  }
  
  /**
   * Get progress to next level
   * @returns {Object} Progress information
   */
  getProgressToNextLevel() {
    const currentLevel = this.getCurrentLevel();
    const currentLevelInfo = this.levels.find(l => l.level === currentLevel);
    const nextLevelInfo = this.levels.find(l => l.level === currentLevel + 1);
    
    // If max level reached
    if (!nextLevelInfo) {
      return {
        currentLevel,
        currentXP: this.user.xp,
        nextLevel: null,
        xpForNextLevel: null,
        progress: 100,
        isMaxLevel: true
      };
    }
    
    const currentLevelXP = this.user.xp - currentLevelInfo.xpRequired;
    const xpForNextLevel = nextLevelInfo.xpRequired - currentLevelInfo.xpRequired;
    const progress = Math.min(100, Math.floor((currentLevelXP / xpForNextLevel) * 100));
    
    return {
      currentLevel,
      currentXP: this.user.xp,
      nextLevel: currentLevel + 1,
      nextLevelName: nextLevelInfo.name,
      xpRequired: nextLevelInfo.xpRequired,
      xpForNextLevel,
      xpRemaining: nextLevelInfo.xpRequired - this.user.xp,
      progress,
      isMaxLevel: false
    };
  }
  
  /**
   * Get user's XP history
   * @param {number} limit - Max number of entries to return
   * @returns {Array} History entries
   */
  getXPHistory(limit = 10) {
    return this.user.history
      .filter(entry => entry.action === 'xp_gain')
      .slice(-limit)
      .reverse();
  }
  
  /**
   * Reset user progress (for testing)
   */
  async resetProgress() {
    this.user = {
      xp: 0,
      level: 1,
      rank: "Runes Initiate",
      history: [{
        timestamp: new Date(),
        action: 'reset',
        reason: 'Manual reset'
      }]
    };
    
    await this.saveUserProgress();
    this.emitXPUpdateEvent({
      oldXP: null,
      newXP: 0,
      reset: true
    });
  }
  
  /**
   * Emit XP update event
   * @param {Object} data - Event data
   */
  emitXPUpdateEvent(data) {
    const event = new CustomEvent('xp:updated', {
      detail: data
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Emit level up event
   * @param {Object} data - Event data
   */
  emitLevelUpEvent(data) {
    const event = new CustomEvent('xp:levelUp', {
      detail: data
    });
    document.dispatchEvent(event);
  }
}

// Export as singleton
const xpService = new XPService();
export default xpService; 
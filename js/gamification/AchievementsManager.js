/**
 * RUNES Analytics Pro - Achievements Manager
 * 
 * A modular service that evaluates daily/weekly challenges, triggers achievements,
 * and manages badges as part of the gamification system.
 */

import xpService from './XPService.js';

class AchievementsManager {
  constructor() {
    this.dbName = 'runesAnalyticsPro';
    this.storeName = 'achievements';
    
    // User achievements data
    this.userData = {
      achievements: [],
      badges: [],
      challenges: {
        daily: [],
        weekly: []
      },
      stats: {
        tokensAnalyzed: 0,
        precisePredictions: 0,
        meshUsage: 0,
        meshTasksCompleted: 0,
        consecutiveLogins: 0,
        lastLogin: null
      }
    };
    
    // Badge definitions
    this.badges = {
      eagleEye: {
        id: 'eagleEye',
        icon: '🔍',
        name: 'Eagle Eye',
        category: 'analysis',
        description: 'Detect anomalies in 5 different tokens',
        hint: 'Look closely at token patterns',
        xpReward: 50,
        condition: (stats) => stats.anomaliesDetected >= 5
      },
      earlyAdopter: {
        id: 'earlyAdopter',
        icon: '🚀',
        name: 'Early Adopter',
        category: 'special',
        description: 'Among the first 100 users of RUNES Analytics Pro',
        hint: 'Join the platform early',
        xpReward: 100,
        condition: (stats, userData) => userData.userNumber && userData.userNumber <= 100
      },
      diamondHands: {
        id: 'diamondHands',
        icon: '💎',
        name: 'Diamond Hands',
        category: 'community',
        description: 'Consistent analysis for 30 consecutive days',
        hint: 'Keep using the platform consistently',
        xpReward: 150,
        condition: (stats) => stats.consecutiveLogins >= 30
      },
      lightningSpeed: {
        id: 'lightningSpeed',
        icon: '⚡',
        name: 'Lightning Speed',
        category: 'mesh',
        description: 'Complete 10 GPU Mesh tasks in record time',
        hint: 'Process data quickly using the GPU Mesh',
        xpReward: 75,
        condition: (stats) => stats.fastMeshTasks >= 10
      },
      visionary: {
        id: 'visionary',
        icon: '🔮',
        name: 'Visionary',
        category: 'analysis',
        description: 'Make 5 consecutive accurate predictions',
        hint: 'Predict token movements correctly',
        xpReward: 100,
        condition: (stats) => stats.consecutivePredictions >= 5
      },
      meshMaster: {
        id: 'meshMaster',
        icon: '🧠',
        name: 'Mesh Master',
        category: 'mesh',
        description: 'Complete 100 GPU Mesh tasks',
        hint: 'Use the GPU Mesh consistently',
        xpReward: 120,
        condition: (stats) => stats.meshTasksCompleted >= 100
      },
      tokenExplorer: {
        id: 'tokenExplorer',
        icon: '🔎',
        name: 'Token Explorer',
        category: 'analysis',
        description: 'Analyze 50 different tokens',
        hint: 'Explore different tokens in the ecosystem',
        xpReward: 80,
        condition: (stats) => stats.uniqueTokensAnalyzed >= 50
      },
      networkContributor: {
        id: 'networkContributor',
        icon: '🌐',
        name: 'Network Contributor',
        category: 'community',
        description: 'Share 20 analyses with the community',
        hint: 'Share your insights with others',
        xpReward: 90,
        condition: (stats) => stats.sharedAnalyses >= 20
      }
    };
    
    // Challenge templates
    this.challengeTemplates = {
      daily: [
        {
          id: 'dailyAnalysis',
          name: 'Daily Analyst',
          description: 'Analyze 5 different tokens today',
          icon: '📊',
          target: 5,
          metric: 'dailyTokensAnalyzed',
          reset: 'daily',
          xpReward: 25
        },
        {
          id: 'meshUsage',
          name: 'Mesh User',
          description: 'Complete 3 GPU Mesh tasks',
          icon: '🧠',
          target: 3,
          metric: 'dailyMeshTasks',
          reset: 'daily',
          xpReward: 20
        },
        {
          id: 'accuratePrediction',
          name: 'Accurate Predictor',
          description: 'Make an accurate token prediction',
          icon: '🎯',
          target: 1,
          metric: 'dailyAccuratePredictions',
          reset: 'daily',
          xpReward: 30
        }
      ],
      weekly: [
        {
          id: 'whaleHunter',
          name: 'Whale Hunter',
          description: 'Identify 3 major wallet movements',
          icon: '🐋',
          target: 3,
          metric: 'weeklyWhaleSightings',
          reset: 'weekly',
          xpReward: 50
        },
        {
          id: 'tokenResearcher',
          name: 'Token Researcher',
          description: 'Perform in-depth analysis on 10 tokens',
          icon: '🔬',
          target: 10,
          metric: 'weeklyInDepthAnalyses',
          reset: 'weekly',
          xpReward: 75
        },
        {
          id: 'communityContributor',
          name: 'Community Contributor',
          description: 'Share 5 analyses with the community',
          icon: '🌐',
          target: 5,
          metric: 'weeklySharedAnalyses',
          reset: 'weekly',
          xpReward: 60
        }
      ]
    };
    
    this.init();
  }
  
  /**
   * Initialize the service and database connection
   */
  async init() {
    try {
      await this.initDB();
      await this.loadUserData();
      await this.checkLoginStreak();
      this.setupChallenges();
      console.log('Achievements Manager initialized successfully');
      
      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize Achievements Manager:', error);
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
   * Load user achievements data from IndexedDB
   */
  async loadUserData() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('userData');
      
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          this.userData = result;
          console.log('User achievements data loaded:', this.userData);
        }
        resolve();
      };
      
      request.onerror = (event) => {
        reject(`Error loading user achievements data: ${event.target.errorCode}`);
      };
    });
  }
  
  /**
   * Save user achievements data to IndexedDB
   */
  async saveUserData() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const userData = { ...this.userData, id: 'userData', lastUpdated: new Date() };
      const request = store.put(userData);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(`Error saving user achievements data: ${event.target.errorCode}`);
      };
    });
  }
  
  /**
   * Set up event listeners for tracking achievements
   */
  setupEventListeners() {
    // GPU Mesh events
    document.addEventListener('gpuMesh:taskCompleted', (e) => this.handleMeshTaskCompleted(e.detail));
    
    // Analysis events
    document.addEventListener('analysis:completed', (e) => this.handleAnalysisCompleted(e.detail));
    document.addEventListener('analysis:anomalyDetected', (e) => this.handleAnomalyDetected(e.detail));
    document.addEventListener('analysis:shared', (e) => this.handleAnalysisShared(e.detail));
    
    // Prediction events
    document.addEventListener('prediction:made', (e) => this.handlePredictionMade(e.detail));
    document.addEventListener('prediction:result', (e) => this.handlePredictionResult(e.detail));
    
    // Whale tracking events
    document.addEventListener('whale:detected', (e) => this.handleWhaleDetected(e.detail));
    
    // Level up events
    document.addEventListener('xp:levelUp', (e) => this.handleLevelUp(e.detail));
  }
  
  /**
   * Check login streak and update consecutive logins
   */
  async checkLoginStreak() {
    const now = new Date();
    const lastLogin = this.userData.stats.lastLogin ? new Date(this.userData.stats.lastLogin) : null;
    
    if (lastLogin) {
      // Check if last login was yesterday (within 24-48 hours)
      const hoursSinceLastLogin = (now - lastLogin) / (1000 * 60 * 60);
      
      if (hoursSinceLastLogin < 48 && hoursSinceLastLogin > 12) {
        // Consecutive login
        this.userData.stats.consecutiveLogins++;
        
        // Check for Diamond Hands badge
        if (this.userData.stats.consecutiveLogins >= 30) {
          await this.checkAndAwardBadge('diamondHands');
        }
      } else if (hoursSinceLastLogin > 48) {
        // Reset streak if more than 48 hours
        this.userData.stats.consecutiveLogins = 1;
      }
    } else {
      // First login
      this.userData.stats.consecutiveLogins = 1;
    }
    
    // Update last login
    this.userData.stats.lastLogin = now;
    await this.saveUserData();
  }
  
  /**
   * Set up daily and weekly challenges
   */
  setupChallenges() {
    const now = new Date();
    
    // Check if we need to reset daily challenges
    if (this.shouldResetChallenges('daily')) {
      this.resetChallenges('daily');
    }
    
    // Check if we need to reset weekly challenges
    if (this.shouldResetChallenges('weekly')) {
      this.resetChallenges('weekly');
    }
    
    // Ensure we have active challenges
    if (this.userData.challenges.daily.length === 0) {
      this.generateDailyChallenges();
    }
    
    if (this.userData.challenges.weekly.length === 0) {
      this.generateWeeklyChallenges();
    }
  }
  
  /**
   * Check if challenges should be reset
   * @param {string} type - 'daily' or 'weekly'
   * @returns {boolean} Whether challenges should be reset
   */
  shouldResetChallenges(type) {
    const now = new Date();
    const lastReset = this.userData.challenges[`${type}ResetTime`] 
      ? new Date(this.userData.challenges[`${type}ResetTime`]) 
      : null;
    
    if (!lastReset) return true;
    
    if (type === 'daily') {
      // Reset if it's a new day
      return now.getDate() !== lastReset.getDate() || 
             now.getMonth() !== lastReset.getMonth() ||
             now.getFullYear() !== lastReset.getFullYear();
    } else if (type === 'weekly') {
      // Reset if it's been a week
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      return (now - lastReset) >= weekInMs;
    }
    
    return false;
  }
  
  /**
   * Reset challenges of specified type
   * @param {string} type - 'daily' or 'weekly'
   */
  resetChallenges(type) {
    // Reset challenges
    this.userData.challenges[type] = [];
    
    // Reset challenge-specific metrics
    if (type === 'daily') {
      this.userData.stats.dailyTokensAnalyzed = 0;
      this.userData.stats.dailyMeshTasks = 0;
      this.userData.stats.dailyAccuratePredictions = 0;
    } else if (type === 'weekly') {
      this.userData.stats.weeklyWhaleSightings = 0;
      this.userData.stats.weeklyInDepthAnalyses = 0;
      this.userData.stats.weeklySharedAnalyses = 0;
    }
    
    // Update reset time
    this.userData.challenges[`${type}ResetTime`] = new Date();
    
    // Generate new challenges
    if (type === 'daily') {
      this.generateDailyChallenges();
    } else if (type === 'weekly') {
      this.generateWeeklyChallenges();
    }
    
    this.saveUserData();
  }
  
  /**
   * Generate daily challenges
   */
  generateDailyChallenges() {
    // Select 3 random daily challenges
    const selectedChallenges = this.shuffleArray([...this.challengeTemplates.daily])
      .slice(0, 3)
      .map(challenge => ({
        ...challenge,
        progress: 0,
        completed: false
      }));
    
    this.userData.challenges.daily = selectedChallenges;
  }
  
  /**
   * Generate weekly challenges
   */
  generateWeeklyChallenges() {
    // Select 3 random weekly challenges
    const selectedChallenges = this.shuffleArray([...this.challengeTemplates.weekly])
      .slice(0, 3)
      .map(challenge => ({
        ...challenge,
        progress: 0,
        completed: false
      }));
    
    this.userData.challenges.weekly = selectedChallenges;
  }
  
  /**
   * Shuffle array using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  /**
   * Handle GPU Mesh task completion
   * @param {Object} taskData - Task data
   */
  async handleMeshTaskCompleted(taskData) {
    // Update mesh usage stats
    this.userData.stats.meshUsage++;
    this.userData.stats.meshTasksCompleted++;
    this.userData.stats.dailyMeshTasks = (this.userData.stats.dailyMeshTasks || 0) + 1;
    
    // Check for fast tasks
    if (taskData.duration && taskData.duration < 1000 && taskData.complexity > 3) {
      this.userData.stats.fastMeshTasks = (this.userData.stats.fastMeshTasks || 0) + 1;
      await this.checkAndAwardBadge('lightningSpeed');
    }
    
    // Check for Mesh Master badge
    if (this.userData.stats.meshTasksCompleted >= 100) {
      await this.checkAndAwardBadge('meshMaster');
    }
    
    // Update challenge progress
    await this.updateChallengeProgress('dailyMeshTasks');
    
    // Save updated data
    await this.saveUserData();
  }
  
  /**
   * Handle token analysis completion
   * @param {Object} analysisData - Analysis data
   */
  async handleAnalysisCompleted(analysisData) {
    // Update analysis stats
    this.userData.stats.tokensAnalyzed++;
    this.userData.stats.dailyTokensAnalyzed = (this.userData.stats.dailyTokensAnalyzed || 0) + 1;
    
    // Track unique tokens
    if (!this.userData.analyzedTokens) {
      this.userData.analyzedTokens = [];
    }
    
    if (!this.userData.analyzedTokens.includes(analysisData.tokenId)) {
      this.userData.analyzedTokens.push(analysisData.tokenId);
      this.userData.stats.uniqueTokensAnalyzed = this.userData.analyzedTokens.length;
      
      // Check for Token Explorer badge
      if (this.userData.stats.uniqueTokensAnalyzed >= 50) {
        await this.checkAndAwardBadge('tokenExplorer');
      }
    }
    
    // Check if this is an in-depth analysis
    if (analysisData.isInDepth) {
      this.userData.stats.weeklyInDepthAnalyses = (this.userData.stats.weeklyInDepthAnalyses || 0) + 1;
      await this.updateChallengeProgress('weeklyInDepthAnalyses');
    }
    
    // Update challenge progress
    await this.updateChallengeProgress('dailyTokensAnalyzed');
    
    // Save updated data
    await this.saveUserData();
  }
  
  /**
   * Handle anomaly detection in analysis
   * @param {Object} anomalyData - Anomaly data
   */
  async handleAnomalyDetected(anomalyData) {
    // Update anomaly stats
    if (!this.userData.detectedAnomalies) {
      this.userData.detectedAnomalies = [];
    }
    
    // Track unique anomalies by token
    const anomalyKey = `${anomalyData.tokenId}-${anomalyData.type}`;
    if (!this.userData.detectedAnomalies.includes(anomalyKey)) {
      this.userData.detectedAnomalies.push(anomalyKey);
      
      // Count unique tokens with anomalies
      const uniqueTokensWithAnomalies = new Set(
        this.userData.detectedAnomalies.map(key => key.split('-')[0])
      ).size;
      
      this.userData.stats.anomaliesDetected = uniqueTokensWithAnomalies;
      
      // Check for Eagle Eye badge
      if (uniqueTokensWithAnomalies >= 5) {
        await this.checkAndAwardBadge('eagleEye');
      }
    }
    
    // Save updated data
    await this.saveUserData();
  }
  
  /**
   * Handle analysis sharing
   * @param {Object} shareData - Share data
   */
  async handleAnalysisShared(shareData) {
    // Update sharing stats
    this.userData.stats.sharedAnalyses = (this.userData.stats.sharedAnalyses || 0) + 1;
    this.userData.stats.weeklySharedAnalyses = (this.userData.stats.weeklySharedAnalyses || 0) + 1;
    
    // Check for Network Contributor badge
    if (this.userData.stats.sharedAnalyses >= 20) {
      await this.checkAndAwardBadge('networkContributor');
    }
    
    // Update challenge progress
    await this.updateChallengeProgress('weeklySharedAnalyses');
    
    // Save updated data
    await this.saveUserData();
  }
  
  /**
   * Handle prediction being made
   * @param {Object} predictionData - Prediction data
   */
  async handlePredictionMade(predictionData) {
    // We just store the prediction for now, results will come later
    if (!this.userData.activePredictions) {
      this.userData.activePredictions = [];
    }
    
    this.userData.activePredictions.push({
      id: predictionData.id,
      tokenId: predictionData.tokenId,
      timestamp: new Date(),
      prediction: predictionData.prediction
    });
    
    // Limit active predictions array size
    if (this.userData.activePredictions.length > 50) {
      this.userData.activePredictions = this.userData.activePredictions.slice(-50);
    }
    
    await this.saveUserData();
  }
  
  /**
   * Handle prediction result
   * @param {Object} resultData - Prediction result data
   */
  async handlePredictionResult(resultData) {
    if (!this.userData.activePredictions) return;
    
    // Find the prediction
    const predictionIndex = this.userData.activePredictions.findIndex(p => p.id === resultData.id);
    
    if (predictionIndex === -1) return;
    
    // Remove from active predictions
    const prediction = this.userData.activePredictions.splice(predictionIndex, 1)[0];
    
    // Update prediction stats
    if (resultData.correct) {
      this.userData.stats.precisePredictions = (this.userData.stats.precisePredictions || 0) + 1;
      this.userData.stats.dailyAccuratePredictions = (this.userData.stats.dailyAccuratePredictions || 0) + 1;
      
      // Update consecutive predictions
      this.userData.stats.consecutivePredictions = (this.userData.stats.consecutivePredictions || 0) + 1;
      
      // Check for Visionary badge
      if (this.userData.stats.consecutivePredictions >= 5) {
        await this.checkAndAwardBadge('visionary');
      }
      
      // Award XP for correct prediction
      await xpService.awardXP(10, 'Correct prediction');
      
      // Update challenge progress
      await this.updateChallengeProgress('dailyAccuratePredictions');
    } else {
      // Reset consecutive counter
      this.userData.stats.consecutivePredictions = 0;
    }
    
    // Save updated data
    await this.saveUserData();
  }
  
  /**
   * Handle whale detection
   * @param {Object} whaleData - Whale detection data
   */
  async handleWhaleDetected(whaleData) {
    // Update whale stats
    this.userData.stats.whalesDetected = (this.userData.stats.whalesDetected || 0) + 1;
    this.userData.stats.weeklyWhaleSightings = (this.userData.stats.weeklyWhaleSightings || 0) + 1;
    
    // Update challenge progress
    await this.updateChallengeProgress('weeklyWhaleSightings');
    
    // Save updated data
    await this.saveUserData();
  }
  
  /**
   * Handle level up event
   * @param {Object} levelData - Level data
   */
  async handleLevelUp(levelData) {
    // Nothing special to do here yet, but could add level-specific achievements
    console.log('User leveled up to', levelData.level);
  }
  
  /**
   * Update challenge progress
   * @param {string} metric - Metric to update
   */
  async updateChallengeProgress(metric) {
    // Check daily challenges
    for (const challenge of this.userData.challenges.daily) {
      if (challenge.metric === metric && !challenge.completed) {
        challenge.progress = Math.min(this.userData.stats[metric] || 0, challenge.target);
        
        // Check if challenge completed
        if (challenge.progress >= challenge.target) {
          await this.completeChallenge(challenge, 'daily');
        }
      }
    }
    
    // Check weekly challenges
    for (const challenge of this.userData.challenges.weekly) {
      if (challenge.metric === metric && !challenge.completed) {
        challenge.progress = Math.min(this.userData.stats[metric] || 0, challenge.target);
        
        // Check if challenge completed
        if (challenge.progress >= challenge.target) {
          await this.completeChallenge(challenge, 'weekly');
        }
      }
    }
  }
  
  /**
   * Complete a challenge
   * @param {Object} challenge - Challenge to complete
   * @param {string} type - 'daily' or 'weekly'
   */
  async completeChallenge(challenge, type) {
    // Mark as completed
    challenge.completed = true;
    
    // Award XP
    await xpService.awardXP(challenge.xpReward, `Completed ${challenge.name} challenge`);
    
    // Emit challenge completed event
    this.emitChallengeCompletedEvent(challenge, type);
  }
  
  /**
   * Check if badge should be awarded and award it
   * @param {string} badgeId - Badge ID to check
   */
  async checkAndAwardBadge(badgeId) {
    // Check if user already has this badge
    if (this.userData.badges.some(b => b.id === badgeId)) {
      return false;
    }
    
    const badge = this.badges[badgeId];
    if (!badge) return false;
    
    // Add to user badges
    const badgeData = {
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      awardedAt: new Date()
    };
    
    this.userData.badges.push(badgeData);
    this.userData.achievements.push(badge.id);
    
    // Award XP for badge
    if (badge.xpReward) {
      await xpService.awardXP(badge.xpReward, `Earned ${badge.name} badge`);
    }
    
    // Emit badge earned event
    this.emitBadgeEarnedEvent(badge);
    
    return true;
  }
  
  /**
   * Get all badges (both earned and unearned)
   * @param {boolean} onlyEarned - Whether to only return earned badges
   * @returns {Array} Badges
   */
  getAllBadges(onlyEarned = false) {
    if (onlyEarned) {
      return this.userData.badges;
    }
    
    return Object.values(this.badges).map(badge => {
      const earned = this.userData.badges.some(b => b.id === badge.id);
      return {
        ...badge,
        earned,
        earnedAt: earned ? this.userData.badges.find(b => b.id === badge.id).awardedAt : null
      };
    });
  }
  
  /**
   * Get active challenges
   * @param {string} type - 'daily' or 'weekly', or null for both
   * @returns {Object} Challenges
   */
  getChallenges(type = null) {
    if (type === 'daily') {
      return this.userData.challenges.daily;
    } else if (type === 'weekly') {
      return this.userData.challenges.weekly;
    } else {
      return {
        daily: this.userData.challenges.daily,
        weekly: this.userData.challenges.weekly
      };
    }
  }
  
  /**
   * Get user stats
   * @returns {Object} User stats
   */
  getUserStats() {
    return this.userData.stats;
  }
  
  /**
   * Reset all achievements (for testing)
   */
  async resetAchievements() {
    this.userData = {
      achievements: [],
      badges: [],
      challenges: {
        daily: [],
        weekly: []
      },
      stats: {
        tokensAnalyzed: 0,
        precisePredictions: 0,
        meshUsage: 0,
        meshTasksCompleted: 0,
        consecutiveLogins: 0,
        lastLogin: new Date()
      }
    };
    
    // Re-initialize challenges
    this.setupChallenges();
    
    await this.saveUserData();
  }
  
  /**
   * Emit challenge completed event
   * @param {Object} challenge - Completed challenge
   * @param {string} type - 'daily' or 'weekly'
   */
  emitChallengeCompletedEvent(challenge, type) {
    const event = new CustomEvent('challenge:completed', {
      detail: {
        challenge,
        type,
        timestamp: new Date()
      }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Emit badge earned event
   * @param {Object} badge - Earned badge
   */
  emitBadgeEarnedEvent(badge) {
    const event = new CustomEvent('badge:earned', {
      detail: {
        badge,
        timestamp: new Date()
      }
    });
    document.dispatchEvent(event);
  }
}

// Export as singleton
const achievementsManager = new AchievementsManager();
export default achievementsManager; 
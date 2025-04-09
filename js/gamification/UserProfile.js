/**
 * RUNES Analytics Pro - User Profile Component
 * 
 * A UI component showing user stats, XP progress, recent achievements,
 * and analysis history as part of the gamification system.
 */

import xpService from './XPService.js';
import achievementsManager from './AchievementsManager.js';

class UserProfile {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }
    
    this.options = {
      theme: 'dark',
      showXP: true,
      showBadges: true,
      showChallenges: true,
      showHistory: true,
      showStats: true,
      compact: false,
      badgesLimit: 5,
      historyLimit: 5,
      ...options
    };
    
    this.init();
  }
  
  /**
   * Initialize the profile component
   */
  async init() {
    this.setupEventListeners();
    await this.render();
  }
  
  /**
   * Set up event listeners for real-time updates
   */
  setupEventListeners() {
    // Listen for XP updates
    document.addEventListener('xp:updated', () => this.updateXPSection());
    
    // Listen for level up events
    document.addEventListener('xp:levelUp', () => this.updateProfileComplete());
    
    // Listen for badge earned events
    document.addEventListener('badge:earned', () => this.updateBadgesSection());
    
    // Listen for challenge completion events
    document.addEventListener('challenge:completed', () => this.updateChallengesSection());
  }
  
  /**
   * Render the full profile
   */
  async render() {
    if (!this.container) return;
    
    // Set theme class
    this.container.className = `runes-user-profile theme-${this.options.theme} ${this.options.compact ? 'compact' : ''}`;
    
    // Create the profile structure
    this.container.innerHTML = `
      <div class="profile-header">
        <div id="${this.containerId}-avatar" class="profile-avatar">
          <div class="avatar-image">
            <img src="assets/images/default-avatar.png" alt="User Avatar">
          </div>
          <div id="${this.containerId}-level-badge" class="level-badge"></div>
        </div>
        <div class="profile-info">
          <h2 id="${this.containerId}-username" class="username">User</h2>
          <div id="${this.containerId}-rank" class="rank"></div>
        </div>
      </div>
      
      ${this.options.showXP ? `
      <div id="${this.containerId}-xp" class="profile-xp">
        <div class="xp-container">
          <div class="xp-info">
            <span class="xp-value"></span>
            <span class="next-level"></span>
          </div>
          <div class="xp-bar">
            <div class="xp-progress"></div>
          </div>
        </div>
      </div>
      ` : ''}
      
      ${this.options.showStats ? `
      <div id="${this.containerId}-stats" class="profile-stats">
        <h3>Statistics</h3>
        <div class="stats-grid"></div>
      </div>
      ` : ''}
      
      ${this.options.showBadges ? `
      <div id="${this.containerId}-badges" class="profile-badges">
        <div class="section-header">
          <h3>Recent Badges</h3>
          <button class="view-all-btn">View All</button>
        </div>
        <div class="badges-container"></div>
      </div>
      ` : ''}
      
      ${this.options.showChallenges ? `
      <div id="${this.containerId}-challenges" class="profile-challenges">
        <div class="section-header">
          <h3>Daily Challenges</h3>
          <div class="tabs">
            <button class="tab-btn active" data-tab="daily">Daily</button>
            <button class="tab-btn" data-tab="weekly">Weekly</button>
          </div>
        </div>
        <div class="challenges-container"></div>
      </div>
      ` : ''}
      
      ${this.options.showHistory ? `
      <div id="${this.containerId}-history" class="profile-history">
        <h3>Recent Activity</h3>
        <div class="history-container"></div>
      </div>
      ` : ''}
    `;
    
    // Set up tab navigation for challenges
    if (this.options.showChallenges) {
      const tabs = this.container.querySelectorAll('.tab-btn');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.updateChallengesSection(tab.dataset.tab);
        });
      });
    }
    
    // Set up view all badges button
    if (this.options.showBadges) {
      const viewAllBtn = this.container.querySelector('.view-all-btn');
      if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => this.openBadgesModal());
      }
    }
    
    // Update all sections with data
    await this.updateProfileComplete();
  }
  
  /**
   * Update the complete profile
   */
  async updateProfileComplete() {
    if (!this.container) return;
    
    // Update user info
    this.updateUserInfo();
    
    // Update all sections
    if (this.options.showXP) this.updateXPSection();
    if (this.options.showStats) this.updateStatsSection();
    if (this.options.showBadges) this.updateBadgesSection();
    if (this.options.showChallenges) this.updateChallengesSection();
    if (this.options.showHistory) this.updateHistorySection();
  }
  
  /**
   * Update user info (name, rank, level)
   */
  updateUserInfo() {
    const usernamElem = document.getElementById(`${this.containerId}-username`);
    const rankElem = document.getElementById(`${this.containerId}-rank`);
    const levelBadgeElem = document.getElementById(`${this.containerId}-level-badge`);
    
    if (usernamElem) usernamElem.textContent = localStorage.getItem('username') || 'Runes Analyst';
    if (rankElem) rankElem.textContent = xpService.user.rank;
    if (levelBadgeElem) levelBadgeElem.textContent = xpService.user.level;
  }
  
  /**
   * Update XP section with progress bar
   */
  updateXPSection() {
    const xpContainer = document.getElementById(`${this.containerId}-xp`);
    if (!xpContainer) return;
    
    const progressInfo = xpService.getProgressToNextLevel();
    const xpValueElem = xpContainer.querySelector('.xp-value');
    const nextLevelElem = xpContainer.querySelector('.next-level');
    const progressBar = xpContainer.querySelector('.xp-progress');
    
    if (xpValueElem) xpValueElem.textContent = `${progressInfo.currentXP} XP`;
    
    if (nextLevelElem) {
      if (progressInfo.isMaxLevel) {
        nextLevelElem.textContent = 'Max Level';
      } else {
        nextLevelElem.textContent = `${progressInfo.xpRemaining} XP to Level ${progressInfo.nextLevel}`;
      }
    }
    
    if (progressBar) {
      progressBar.style.width = `${progressInfo.progress}%`;
    }
  }
  
  /**
   * Update stats section
   */
  updateStatsSection() {
    const statsContainer = document.getElementById(`${this.containerId}-stats`);
    if (!statsContainer) return;
    
    const statsGrid = statsContainer.querySelector('.stats-grid');
    const stats = achievementsManager.getUserStats();
    
    const displayStats = [
      { label: 'Tokens Analyzed', value: stats.tokensAnalyzed || 0, icon: '📊' },
      { label: 'Accurate Predictions', value: stats.precisePredictions || 0, icon: '🎯' },
      { label: 'GPU Mesh Tasks', value: stats.meshTasksCompleted || 0, icon: '🧠' },
      { label: 'Consecutive Logins', value: stats.consecutiveLogins || 0, icon: '📆' }
    ];
    
    statsGrid.innerHTML = displayStats.map(stat => `
      <div class="stat-item">
        <div class="stat-icon">${stat.icon}</div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  }
  
  /**
   * Update badges section
   */
  updateBadgesSection() {
    const badgesContainer = document.getElementById(`${this.containerId}-badges`);
    if (!badgesContainer) return;
    
    const badgesGrid = badgesContainer.querySelector('.badges-container');
    const earnedBadges = achievementsManager.getAllBadges(true);
    
    // Sort by newest first and limit
    const recentBadges = earnedBadges
      .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
      .slice(0, this.options.badgesLimit);
    
    if (recentBadges.length === 0) {
      badgesGrid.innerHTML = `
        <div class="no-badges">
          <p>No badges earned yet. Complete challenges to earn badges!</p>
        </div>
      `;
      return;
    }
    
    badgesGrid.innerHTML = recentBadges.map(badge => `
      <div class="badge-item" data-badge-id="${badge.id}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-info">
          <div class="badge-name">${badge.name}</div>
          <div class="badge-date">${this.formatDate(badge.awardedAt)}</div>
        </div>
      </div>
    `).join('');
    
    // Add click handlers for badges
    badgesGrid.querySelectorAll('.badge-item').forEach(badgeElem => {
      badgeElem.addEventListener('click', () => {
        const badgeId = badgeElem.dataset.badgeId;
        const badge = achievementsManager.badges[badgeId];
        if (badge) {
          this.showBadgeDetails(badge);
        }
      });
    });
  }
  
  /**
   * Update challenges section
   * @param {string} type - 'daily' or 'weekly'
   */
  updateChallengesSection(type = 'daily') {
    const challengesContainer = document.getElementById(`${this.containerId}-challenges`);
    if (!challengesContainer) return;
    
    const challengesGrid = challengesContainer.querySelector('.challenges-container');
    const challenges = achievementsManager.getChallenges(type);
    
    if (!challenges || challenges.length === 0) {
      challengesGrid.innerHTML = `
        <div class="no-challenges">
          <p>No ${type} challenges available right now.</p>
        </div>
      `;
      return;
    }
    
    challengesGrid.innerHTML = challenges.map(challenge => `
      <div class="challenge-item ${challenge.completed ? 'completed' : ''}">
        <div class="challenge-icon">${challenge.icon}</div>
        <div class="challenge-info">
          <div class="challenge-name">${challenge.name}</div>
          <div class="challenge-description">${challenge.description}</div>
          <div class="challenge-progress-container">
            <div class="challenge-progress-bar">
              <div class="challenge-progress" style="width: ${(challenge.progress / challenge.target) * 100}%"></div>
            </div>
            <div class="challenge-progress-text">
              ${challenge.progress}/${challenge.target}
            </div>
          </div>
        </div>
        <div class="challenge-reward">+${challenge.xpReward} XP</div>
      </div>
    `).join('');
  }
  
  /**
   * Update history section
   */
  updateHistorySection() {
    const historyContainer = document.getElementById(`${this.containerId}-history`);
    if (!historyContainer) return;
    
    const historyGrid = historyContainer.querySelector('.history-container');
    const xpHistory = xpService.getXPHistory(this.options.historyLimit);
    
    if (xpHistory.length === 0) {
      historyGrid.innerHTML = `
        <div class="no-history">
          <p>No recent activity yet.</p>
        </div>
      `;
      return;
    }
    
    historyGrid.innerHTML = xpHistory.map(entry => `
      <div class="history-item">
        <div class="history-icon">🔮</div>
        <div class="history-info">
          <div class="history-title">Earned ${entry.amount} XP</div>
          <div class="history-description">${entry.reason}</div>
          <div class="history-date">${this.formatDate(entry.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Show badge details modal
   * @param {Object} badge - Badge to show details for
   */
  showBadgeDetails(badge) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('badge-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'badge-details-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Badge Details</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="badge-details">
            <div class="badge-icon-large">${badge.icon}</div>
            <div class="badge-details-info">
              <h4 class="badge-name">${badge.name}</h4>
              <p class="badge-description">${badge.description}</p>
              <p class="badge-category">Category: ${this.formatCategory(badge.category)}</p>
              <p class="badge-reward">Reward: ${badge.xpReward} XP</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    // Display the modal
    modal.classList.add('active');
  }
  
  /**
   * Open the badges gallery modal
   */
  openBadgesModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('badges-gallery-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'badges-gallery-modal';
      modal.className = 'modal badges-gallery';
      document.body.appendChild(modal);
    }
    
    const badges = achievementsManager.getAllBadges();
    
    // Group badges by category
    const categories = {
      analysis: [],
      mesh: [],
      community: [],
      special: []
    };
    
    badges.forEach(badge => {
      if (categories[badge.category]) {
        categories[badge.category].push(badge);
      } else {
        categories.special.push(badge);
      }
    });
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Badges Gallery</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          ${Object.entries(categories).map(([category, categoryBadges]) => `
            <div class="badges-category">
              <h4>${this.formatCategory(category)}</h4>
              <div class="badges-grid">
                ${categoryBadges.map(badge => `
                  <div class="badge-item ${badge.earned ? 'earned' : 'locked'}" data-badge-id="${badge.id}">
                    <div class="badge-icon">${badge.earned ? badge.icon : '?'}</div>
                    <div class="badge-info">
                      <div class="badge-name">${badge.earned ? badge.name : 'Locked Badge'}</div>
                      <div class="badge-hint">${badge.earned ? badge.description : badge.hint}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    // Add badge detail functionality
    const badgeItems = modal.querySelectorAll('.badge-item.earned');
    badgeItems.forEach(badgeElem => {
      badgeElem.addEventListener('click', () => {
        const badgeId = badgeElem.dataset.badgeId;
        const badge = achievementsManager.badges[badgeId];
        if (badge) {
          this.showBadgeDetails(badge);
        }
      });
    });
    
    // Display the modal
    modal.classList.add('active');
  }
  
  /**
   * Format a date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
      return dateObj.toLocaleDateString();
    } else if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }
  
  /**
   * Format a category name for display
   * @param {string} category - Category name
   * @returns {string} Formatted category name
   */
  formatCategory(category) {
    const categories = {
      analysis: 'Analysis',
      mesh: 'GPU Mesh',
      community: 'Community',
      special: 'Special'
    };
    
    return categories[category] || 'General';
  }
}

// Export the class
export default UserProfile; 
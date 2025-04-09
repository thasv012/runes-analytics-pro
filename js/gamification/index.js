/**
 * RUNES Analytics Pro - Gamification System
 * 
 * Main entry point for the gamification system.
 * Exports all components for easy importing.
 */

import xpService from './XPService.js';
import achievementsManager from './AchievementsManager.js';
import UserProfile from './UserProfile.js';

// Initialize GPU Mesh integration
const initGPUMeshIntegration = () => {
  // Listen for GPU Mesh events
  document.addEventListener('gpuMesh:connected', () => {
    console.log('GPU Mesh connected - Gamification system ready');
  });
  
  // Listen for task completion
  document.addEventListener('gpuMesh:taskCompleted', (event) => {
    const taskData = event.detail;
    // This will be handled by the AchievementsManager
    console.log('Task completed tracked by gamification system', taskData.id);
  });
};

// Helper functions for UI components
const createFloatingXPBar = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`);
    return null;
  }
  
  // Create the XP bar
  container.innerHTML = `
    <div class="floating-xp-bar">
      <div class="xp-icon">🔮</div>
      <div class="xp-info">
        <div class="xp-value">${xpService.user.xp} XP</div>
        <div class="xp-progress-container">
          <div class="xp-progress" style="width: ${xpService.getProgressToNextLevel().progress}%"></div>
        </div>
      </div>
      <div class="level-badge">${xpService.user.level}</div>
    </div>
  `;
  
  // Update on XP changes
  document.addEventListener('xp:updated', () => {
    const xpValue = container.querySelector('.xp-value');
    const xpProgress = container.querySelector('.xp-progress');
    const levelBadge = container.querySelector('.level-badge');
    
    if (xpValue) xpValue.textContent = `${xpService.user.xp} XP`;
    if (xpProgress) xpProgress.style.width = `${xpService.getProgressToNextLevel().progress}%`;
    if (levelBadge) levelBadge.textContent = xpService.user.level;
  });
  
  return container;
};

// Notification system for achievements and challenges
const notificationSystem = {
  showLevelUp: (levelData) => {
    const notification = document.createElement('div');
    notification.className = 'gamification-notification level-up';
    notification.innerHTML = `
      <div class="notification-icon">⭐</div>
      <div class="notification-content">
        <div class="notification-title">Level Up!</div>
        <div class="notification-message">You've reached Level ${levelData.level}: ${levelData.rank}</div>
      </div>
      <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('visible'), 100);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  },
  
  showBadgeEarned: (badgeData) => {
    const notification = document.createElement('div');
    notification.className = 'gamification-notification badge-earned';
    notification.innerHTML = `
      <div class="notification-icon">${badgeData.icon}</div>
      <div class="notification-content">
        <div class="notification-title">Badge Earned!</div>
        <div class="notification-message">${badgeData.name}</div>
        <div class="notification-desc">${badgeData.description}</div>
      </div>
      <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('visible'), 100);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  },
  
  showChallengeCompleted: (challengeData) => {
    const notification = document.createElement('div');
    notification.className = 'gamification-notification challenge-completed';
    notification.innerHTML = `
      <div class="notification-icon">${challengeData.icon}</div>
      <div class="notification-content">
        <div class="notification-title">Challenge Completed!</div>
        <div class="notification-message">${challengeData.name}</div>
        <div class="notification-reward">+${challengeData.xpReward} XP</div>
      </div>
      <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('visible'), 100);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
};

// Set up event listeners for the notification system
document.addEventListener('xp:levelUp', (event) => {
  notificationSystem.showLevelUp(event.detail);
});

document.addEventListener('badge:earned', (event) => {
  notificationSystem.showBadgeEarned(event.detail.badge);
});

document.addEventListener('challenge:completed', (event) => {
  notificationSystem.showChallengeCompleted(event.detail.challenge);
});

// Helper function to award XP for various actions
const awardXPForAction = async (action, amount, customReason) => {
  const reasons = {
    tokenAnalysis: 'Analyzing a token',
    accuratePrediction: 'Making an accurate prediction',
    meshTask: 'Completing a GPU Mesh task',
    firstLogin: 'First login of the day',
    customQuery: 'Creating a custom query',
    shareAnalysis: 'Sharing analysis with the community'
  };
  
  const reason = customReason || reasons[action] || 'Platform activity';
  await xpService.awardXP(amount, reason);
};

// Initialize the gamification system
const init = () => {
  // Set up GPU Mesh integration
  initGPUMeshIntegration();
  
  console.log('Gamification system initialized');
  
  // Return public API
  return {
    xpService,
    achievementsManager,
    UserProfile,
    createFloatingXPBar,
    notificationSystem,
    awardXPForAction
  };
};

// Export components individually
export { xpService, achievementsManager, UserProfile };

// Export helper functions
export { createFloatingXPBar, notificationSystem, awardXPForAction };

// Export default initialized system
export default init(); 
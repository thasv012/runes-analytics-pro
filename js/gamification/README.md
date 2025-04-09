# RUNES Analytics Pro - Gamification System

A modular gamification system for the RUNES Analytics Pro platform, designed to increase user engagement through rewards, challenges, and progression.

## Overview

The gamification system provides:

- XP-based progression with multiple levels
- Achievement badges for completing specific actions
- Daily and weekly challenges to encourage regular platform usage
- Visual profile showing progress and accomplishments
- Integration with the GPU Mesh for task-based rewards
- Persistence of user data using IndexedDB

## Components

### Core Services

- **XPService**: Handles XP tracking, level calculation, and progression
- **AchievementsManager**: Manages achievements, badges, and challenges
- **UserProfile**: UI component showing user stats and achievements

### UI Components

- Floating XP bar for persistent display of progress
- Notification system for achievements and leveling up
- Modals for detailed achievement information
- Challenge cards with progress indicators

### Events

The system uses custom events to communicate between components:

- `xp:updated`: Fired when XP changes
- `xp:levelUp`: Fired when the user levels up
- `badge:earned`: Fired when a user earns a badge
- `challenge:completed`: Fired when a challenge is completed

## Integration with GPU Mesh

The gamification system integrates with the GPU Mesh client through the following events:

- `gpuMesh:connected`: Tracked for login streaks
- `gpuMesh:taskCompleted`: Awards XP and progress towards mesh-related achievements
- `analysis:completed`: Tracked for analysis-related achievements
- `prediction:made` and `prediction:result`: For tracking prediction accuracy

## Installation

1. Copy the `gamification` folder to your project's `js` directory
2. Include the necessary CSS:

```html
<link rel="stylesheet" href="js/gamification/styles.css">
```

3. Import and initialize the system:

```javascript
import gamification from './js/gamification/index.js';

// The system is initialized automatically
```

## Usage Examples

### Initialize User Profile

```javascript
import { UserProfile } from './js/gamification/index.js';

// Create a user profile in a container
const profile = new UserProfile('profile-container', {
  theme: 'dark',
  compact: false
});
```

### Show Floating XP Bar

```javascript
import { createFloatingXPBar } from './js/gamification/index.js';

// Create a floating XP bar
createFloatingXPBar('xp-bar-container');
```

### Award XP for Actions

```javascript
import { awardXPForAction } from './js/gamification/index.js';

// Award XP for analyzing a token
await awardXPForAction('tokenAnalysis', 25);

// Award XP for completing a GPU Mesh task
await awardXPForAction('meshTask', 15);

// Award XP with custom reason
await awardXPForAction('custom', 50, 'Discovered a rare token pattern');
```

### Show Notifications

```javascript
import { notificationSystem } from './js/gamification/index.js';

// Show a custom notification
notificationSystem.showLevelUp({
  level: 5,
  rank: 'Inscription Master'
});
```

## GPU Mesh Integration Guide

To integrate with GPU Mesh tasks, ensure your task events are structured properly:

```javascript
// When a GPU Mesh task completes
document.dispatchEvent(new CustomEvent('gpuMesh:taskCompleted', {
  detail: {
    id: 'task-123',
    complexity: 5, // 1-10 scale
    duration: 2500, // ms to complete
    type: 'analysis',
    startTime: startTimestamp,
    endTime: endTimestamp
  }
}));

// When an analysis is completed
document.dispatchEvent(new CustomEvent('analysis:completed', {
  detail: {
    tokenId: 'rune-xyz',
    analysisType: 'standard',
    isInDepth: true,
    timestamp: new Date()
  }
}));
```

## Customization

### Themes

The system supports themes by adding a class to the profile container. Currently available themes:

- `theme-dark`: Dark cyberpunk theme (default)
- `theme-light`: Light theme

### Badges and Challenges

Add or modify badges and challenges by editing the `AchievementsManager.js` file:

```javascript
// Add a new badge
this.badges.yourBadgeId = {
  id: 'yourBadgeId',
  icon: '🏆',
  name: 'Your Badge Name',
  category: 'category',
  description: 'Description of the badge',
  hint: 'Hint for unlocking',
  xpReward: 100,
  condition: (stats) => stats.yourMetric >= 10
};

// Add a new challenge template
this.challengeTemplates.daily.push({
  id: 'yourChallenge',
  name: 'Challenge Name',
  description: 'Description of the challenge',
  icon: '🎯',
  target: 5,
  metric: 'yourMetric',
  reset: 'daily',
  xpReward: 30
});
```

## Dependencies

- None! The system is built with vanilla JavaScript
- Uses IndexedDB for local persistence

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

## License

This system is part of the RUNES Analytics Pro platform and is not licensed for external use without permission. 
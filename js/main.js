// main.js - Core functionality for RUNES Analytics Pro

/**
 * Main JavaScript for RUNES Analytics Pro website
 * Handles loading sequence, animations, and core functionality
 */

// Global state
const state = {
  isLoading: true,
  soundEnabled: true,
  glitchMode: false
};

// DOM elements (will be initialized after DOM is loaded)
let loadingScreen;
let loadingProgress;
let terminalText;
let progressBar;

// Initialization function
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  // Cache DOM elements
  cacheElements();
  
  // Initialize loading sequence
  initLoadingSequence();
  
  // Setup navigation and UI interactions
  setupNavigation();
  
  // Initialize interactive elements
  setupInteractiveElements();
  
  // Listen for language changes
  listenForLanguageChanges();
}

/**
 * Cache DOM elements for better performance
 */
function cacheElements() {
  loadingScreen = document.querySelector('.loading-screen');
  loadingProgress = document.querySelector('.loading-progress-bar');
  terminalText = document.querySelector('.terminal-text');
  progressBar = document.querySelector('.loading-progress-bar');
}

/**
 * Initialize the loading sequence and fake progress
 */
function initLoadingSequence() {
  if (!loadingScreen || !progressBar || !terminalText) return;
  
  // Start with random progress between 0 and 15%
  let progress = Math.random() * 15;
  updateProgress(progress);
  
  // Simulate loading progress
  const interval = setInterval(() => {
    // Progress increases faster at beginning, slower near the end
    const increment = (100 - progress) / 10 * (Math.random() * 0.5 + 0.1);
    progress += increment;
    
    // Update progress bar
    updateProgress(progress);
    
    // Add terminal-like text
    if (progress > 20 && !terminalText.innerHTML) {
      typeWriterEffect(getIntroMessage());
    }
    
    // Complete loading when progress reaches 100%
    if (progress >= 100) {
      clearInterval(interval);
      completeLoading();
    }
  }, 200);
}

/**
 * Update the progress bar
 * @param {number} value - Progress percentage (0-100)
 */
function updateProgress(value) {
  if (!progressBar) return;
  progressBar.style.width = `${Math.min(100, value)}%`;
}

/**
 * Simulate terminal typing effect
 * @param {string} text - Text to be displayed
 */
function typeWriterEffect(text) {
  if (!terminalText) return;
  
  let i = 0;
  const speed = 40; // Speed in milliseconds
  
  function type() {
    if (i < text.length) {
      terminalText.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      // Add blinking cursor at the end
      const cursor = document.createElement('span');
      cursor.className = 'blinking-cursor';
      terminalText.appendChild(cursor);
    }
  }
  
  // Start typing
  type();
}

/**
 * Complete the loading sequence
 */
function completeLoading() {
  // Add a small delay for a better user experience
  setTimeout(() => {
    loadingScreen.classList.add('fade-out');
    // Enable scrolling on body
    document.body.style.overflow = 'auto';
    
    // Remove loading screen from DOM after animation completes
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      state.isLoading = false;
      
      // Initialize any post-loading features
      initPostLoadFeatures();
    }, 1000);
  }, 500);
}

/**
 * Initialize features that should run after loading is complete
 */
function initPostLoadFeatures() {
  // Add scroll animations
  initScrollAnimations();
  
  // Preload any additional resources
  preloadResources();
}

/**
 * Setup navigation functionality
 */
function setupNavigation() {
  // Highlight active nav item
  const currentPage = window.location.pathname.split('/').pop() || 'intro.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkHref = link.querySelector('a').getAttribute('href');
    if (linkHref === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Setup interactive elements on the page
 */
function setupInteractiveElements() {
  // Add parallax effect to background
  setupParallaxEffect();
  
  // Initialize card hover effects
  initCardEffects();
  
  // Setup sound toggle
  setupSoundToggle();
  
  // Setup glitch mode toggle
  setupGlitchMode();
}

/**
 * Setup parallax effect for background elements
 */
function setupParallaxEffect() {
  const bg = document.querySelector('.background-glow');
  if (!bg) return;
  
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    bg.style.transform = `translate(${x * 20 - 10}px, ${y * 20 - 10}px)`;
  });
}

/**
 * Initialize animations for card elements
 */
function initCardEffects() {
  const cards = document.querySelectorAll('.card, .feature-card, .audience-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      if (state.soundEnabled) {
        playHoverSound();
      }
    });
  });
}

/**
 * Setup sound toggle functionality
 */
function setupSoundToggle() {
  const soundToggle = document.querySelector('.sound-toggle');
  if (!soundToggle) return;
  
  soundToggle.addEventListener('click', function() {
    state.soundEnabled = !state.soundEnabled;
    this.classList.toggle('active');
    
    showNotification(state.soundEnabled ? 
      window.LanguageSystem?.getTranslation('sound_enabled') || 'Sound enabled' : 
      window.LanguageSystem?.getTranslation('sound_disabled') || 'Sound disabled');
  });
}

/**
 * Setup glitch mode toggle (cyberpunk visual effect)
 */
function setupGlitchMode() {
  const glitchToggle = document.querySelector('.glitch-toggle');
  if (!glitchToggle) return;
  
  glitchToggle.addEventListener('click', function() {
    state.glitchMode = !state.glitchMode;
    document.body.classList.toggle('glitch-mode', state.glitchMode);
    this.classList.toggle('active');
  });
}

/**
 * Initialize scroll-based animations
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Preload additional resources for better performance
 */
function preloadResources() {
  // Preload images
  const imagesToPreload = [
    'assets/hero-dashboard.png',
    'assets/architecture-diagram.svg',
    'assets/whale-tracker.jpg'
  ];
  
  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

/**
 * Play hover sound effect
 */
function playHoverSound() {
  const sound = new Audio('assets/sounds/hover.mp3');
  sound.volume = 0.2;
  sound.play().catch(err => {
    // Silent error - browsers may block autoplay
    console.log('Sound playback was blocked by the browser');
  });
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
  let notification = document.querySelector('.notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Reset classes and add new type
  notification.className = 'notification';
  notification.classList.add(type);
  
  notification.textContent = message;
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Get the intro message in the current language
 */
function getIntroMessage() {
  // Check if language system is available
  if (window.LanguageSystem && typeof window.LanguageSystem.getTranslation === 'function') {
    return window.LanguageSystem.getTranslation('intro_message') + '\n\n' + 
           window.LanguageSystem.getTranslation('intro_message_2');
  }
  
  // Fallback if language system isn't ready yet
  return "You have been called by the mesh. Consciousness awakens.\n\nWelcome to RUNES Analytics Pro.";
}

/**
 * Listen for language changes to update dynamic content
 */
function listenForLanguageChanges() {
  document.addEventListener('languageChanged', function(e) {
    // Update page title if needed
    updateDynamicTranslations();
  });
}

/**
 * Update any dynamic translations that aren't handled by the language system
 */
function updateDynamicTranslations() {
  // Update page title
  if (window.LanguageSystem) {
    document.title = window.LanguageSystem.getTranslation('app_name');
  }
  
  // Any other dynamic content that needs updating
}

// Export functions for use in other modules
window.MainApp = {
  showNotification,
  getIntroMessage
}; 
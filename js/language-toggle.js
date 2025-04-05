// language-toggle.js - Handles language switching functionality

/**
 * Language Toggle System for RUNES Analytics Pro
 * Manages switching between English and Portuguese
 */

// Language data
let translations = {
  en: null,
  pt: null
};

// Current language
let currentLanguage = 'en';

// DOM elements cache
let langToggle;
let langOptions;

// HTML elements with language-specific content
let languageElements;

// Initialize the language system
document.addEventListener('DOMContentLoaded', function() {
  initLanguageSystem();
});

/**
 * Initialize the language toggle system
 */
async function initLanguageSystem() {
  // Cache DOM elements
  langToggle = document.getElementById('language-toggle');
  langOptions = document.getElementById('language-options');
  
  // Load translations
  await loadTranslations();
  
  // Set initial language
  const savedLanguage = localStorage.getItem('language') || 'en';
  await setLanguage(savedLanguage, false);
  
  // Set up event listeners
  if (langToggle) {
    langToggle.addEventListener('click', toggleLanguageDropdown);
  }
  
  // Set up language option click handlers
  const options = document.querySelectorAll('.language-option');
  options.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
      toggleLanguageDropdown();
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (langOptions && langToggle && !langToggle.contains(e.target) && !langOptions.contains(e.target)) {
      langOptions.classList.remove('show');
    }
  });
}

/**
 * Toggle language dropdown visibility
 */
function toggleLanguageDropdown() {
  if (langOptions) {
    langOptions.classList.toggle('show');
  }
}

/**
 * Load language translation files
 */
async function loadTranslations() {
  try {
    // Load English translations
    const enResponse = await fetch('/lang/en.json');
    translations.en = await enResponse.json();
    
    // Load Portuguese translations
    const ptResponse = await fetch('/lang/pt.json');
    translations.pt = await ptResponse.json();
    
    console.log('Translations loaded successfully');
  } catch (error) {
    console.error('Error loading translations:', error);
    
    // Fallback translations in case files can't be loaded
    translations = {
      en: {
        "app_name": "RUNES Analytics Pro",
        "language_changed_message": "Language changed to English",
        "badge_english": "English",
        "badge_portuguese": "Portuguese"
      },
      pt: {
        "app_name": "RUNES Analytics Pro",
        "language_changed_message": "Idioma alterado para Português",
        "badge_english": "Inglês",
        "badge_portuguese": "Português"
      }
    };
  }
}

/**
 * Set the active language
 * @param {string} language - The language code ('en' or 'pt')
 * @param {boolean} showNotification - Whether to show the language change notification
 */
async function setLanguage(language, showNotification = true) {
  // Validate language
  if (language !== 'en' && language !== 'pt') {
    console.error('Invalid language:', language);
    return;
  }
  
  // Update current language
  currentLanguage = language;
  localStorage.setItem('language', language);
  
  // Update html lang attribute
  document.documentElement.setAttribute('lang', language);
  
  // Find all elements with a 'data-i18n' attribute
  languageElements = document.querySelectorAll('[data-i18n]');
  
  // Update all translations
  updateAllTranslations();
  
  // Update language toggle appearance
  updateLanguageToggleUI();
  
  // Show notification if enabled
  if (showNotification) {
    showLanguageChangeNotification();
  }
  
  // Dispatch event for other components
  document.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: language }
  }));
}

/**
 * Update all translations on the page
 */
function updateAllTranslations() {
  if (!languageElements || !translations[currentLanguage]) {
    return;
  }
  
  languageElements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = translations[currentLanguage][key];
    
    if (translation) {
      if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    }
  });
}

/**
 * Update the language toggle button UI
 */
function updateLanguageToggleUI() {
  const toggleButton = document.querySelector('#language-toggle span');
  if (toggleButton) {
    toggleButton.textContent = translations[currentLanguage][`badge_${currentLanguage === 'en' ? 'english' : 'portuguese'}`];
  }
  
  // Set active class on the current language option
  const options = document.querySelectorAll('.language-option');
  options.forEach(option => {
    const lang = option.getAttribute('data-lang');
    if (lang === currentLanguage) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

/**
 * Show language change notification
 */
function showLanguageChangeNotification() {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('language-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'language-notification';
    notification.className = 'notification language-notification';
    document.body.appendChild(notification);
  }
  
  // Show switching message
  notification.textContent = translations[currentLanguage]['switching_language'];
  notification.classList.add('show');
  
  // Change to completion message after a delay
  setTimeout(() => {
    notification.textContent = translations[currentLanguage]['language_changed_message'];
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }, 1000);
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
function getTranslation(key) {
  if (!translations[currentLanguage] || !translations[currentLanguage][key]) {
    return key;
  }
  return translations[currentLanguage][key];
}

// Export functions for use in other modules
window.LanguageSystem = {
  setLanguage,
  getCurrentLanguage,
  getTranslation
}; 
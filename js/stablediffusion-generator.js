/**
 * RUNES Analytics Pro - Stable Diffusion Image Generator
 * 
 * This script handles the image generation functionality,
 * connecting to local Stable Diffusion API or using mock data.
 */

// Configuration and Constants
const CONFIG = {
  API_URL: "http://127.0.0.1:7860/sdapi/v1/txt2img",
  MOCK_MODE: true, // Set to false to disable mock mode
  DEFAULT_STEPS: 30,
  DEFAULT_RESOLUTION: "768x768",
  DEFAULT_STYLE: "neural-runes",
  RANDOM_SEED_MAX: 4294967295,
  STORAGE_KEY: "runesAnalyticsSdHistory",
  MAX_HISTORY_ITEMS: 20,
  CONNECTION_CHECK_INTERVAL: 30000, // 30 seconds
};

// Style Presets with Descriptions and Prompts
const STYLE_PRESETS = {
  "neural-runes": {
    description: "A digital matrix-like environment with glowing runes floating in a neural network pattern",
    promptPrefix: "digital matrix with floating runes, neural network connections, glowing blue symbols, cybernetic visualization, Bitcoin runes",
    negativePrompt: "blurry, text, watermark, logo, pixelated, low quality"
  },
  "bitcoin-symbols": {
    description: "Ancient Bitcoin symbols and runes etched on stone or metal surfaces with mystical lighting",
    promptPrefix: "ancient Bitcoin symbols, cryptocurrency hieroglyphics, stone etched runes, mystical engraving, sacred geometry",
    negativePrompt: "cartoonish, childish, blurry, text, watermark"
  },
  "cyberpunk": {
    description: "Cyberpunk cityscape with neon grids, futuristic elements and holographic runes displays",
    promptPrefix: "cyberpunk cityscape, neon grid overlay, holographic rune displays, night city with glowing symbols, digital rain",
    negativePrompt: "daylight, natural landscape, vintage, black and white, watermark"
  },
  "ai-emotion": {
    description: "Emotional AI interpretation of Runes with abstract color patterns and flowing energy",
    promptPrefix: "abstract AI interpretation, flowing energy patterns, emotional color representation, digital consciousness, runes visualized as energy",
    negativePrompt: "concrete objects, faces, realistic, photographic, text, watermark"
  },
  "satoshi": {
    description: "Mystical Bitcoin visualization with Satoshi symbolism and spiritual cryptographic elements",
    promptPrefix: "mystical Bitcoin visualization, Satoshi Nakamoto symbolism, crypto spiritual elements, mathematical patterns, sacred blockchain geometry",
    negativePrompt: "cartoon, childish, human faces, watermark, signature, text"
  },
  "custom": {
    description: "Your custom style with no predefined prompt elements",
    promptPrefix: "",
    negativePrompt: ""
  }
};

// Random Prompt Ideas for Inspiration
const PROMPT_IDEAS = [
  "Bitcoin runes floating in a digital ocean with data streams connecting them",
  "Ancient stone tablet with glowing rune inscriptions in a bitcoin temple",
  "Cybernetic tree with runes as leaves, connecting to a Bitcoin root system",
  "Neural network visualized with runes as nodes in a cosmic web",
  "Holographic rune symbols appearing above an old Bitcoin mining rig",
  "Mystical mountain landscape with runes carved into cliff faces, glowing at sunset",
  "Runes appearing in constellation patterns in a night sky over a futuristic city",
  "Abstract fractal patterns forming Bitcoin rune symbols in a digital space",
  "Ancient scroll unfolding with animated rune symbols in neon colors",
  "Blockchain visualized as a physical chain with rune symbols on each link"
];

// DOM Elements
let elements = {};

// State Management
const state = {
  generatingImage: false,
  connected: false,
  connectionChecking: false,
  history: [],
  currentImageData: null,
  styleDescriptions: {},
  mockImages: [
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='768' height='768' viewBox='0 0 768 768'%3E%3Crect width='768' height='768' fill='%23060a14'/%3E%3Ctext x='384' y='384' font-family='monospace' font-size='20' fill='%235ce1e6' text-anchor='middle'%3EMOCK IMAGE: Stable Diffusion API not connected%3C/text%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='768' height='768' viewBox='0 0 768 768'%3E%3Crect width='768' height='768' fill='%23060a14'/%3E%3Ctext x='384' y='384' font-family='monospace' font-size='20' fill='%239d4edd' text-anchor='middle'%3EMOCK IMAGE: Using placeholder for demo%3C/text%3E%3C/svg%3E"
  ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  cacheElements();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize UI components
  initializeUI();
  
  // Load settings from local storage
  loadSettings();
  
  // Load history from IndexedDB
  loadHistory();
  
  // Check connection to Stable Diffusion API
  checkApiConnection();
  
  // Start connection check interval
  setInterval(checkApiConnection, CONFIG.CONNECTION_CHECK_INTERVAL);
  
  // Hide loading screen after initialization
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 2000);
  
  // Log initialization
  console.log('%c[RUNES.AI] %cImage Generation System Initialized', 'color: #5ce1e6; font-weight: bold', 'color: white');
});

// Cache DOM elements
function cacheElements() {
  elements = {
    // Input elements
    promptInput: document.getElementById('prompt-input'),
    styleSelect: document.getElementById('style-select'),
    resolutionSelect: document.getElementById('resolution-select'),
    seedInput: document.getElementById('seed-input'),
    stepsSlider: document.getElementById('steps-slider'),
    sliderValue: document.querySelector('.slider-value'),
    
    // Style elements
    styleDescription: document.querySelector('.style-description'),
    
    // Buttons
    generateBtn: document.getElementById('generate-btn'),
    inspireBtn: document.getElementById('inspire-btn'),
    downloadBtn: document.getElementById('download-btn'),
    shareBtn: document.getElementById('share-btn'),
    regenerateBtn: document.getElementById('regenerate-btn'),
    diceButton: document.querySelector('.dice-button'),
    connectionSettings: document.querySelector('.connection-settings'),
    clearHistory: document.querySelector('.clear-history'),
    testConnection: document.querySelector('.test-connection'),
    saveSettings: document.querySelector('.save-settings'),
    closeModal: document.querySelector('.close-modal'),
    
    // Preview elements
    previewImage: document.getElementById('preview-image'),
    previewPlaceholder: document.querySelector('.preview-placeholder'),
    loadingIndicator: document.querySelector('.loading-indicator'),
    progressFill: document.querySelector('.progress-fill'),
    generationInfo: document.querySelector('.generation-info'),
    promptValue: document.querySelector('.prompt-value'),
    styleValue: document.querySelector('.style-value'),
    seedValue: document.querySelector('.seed-value'),
    previewActions: document.querySelector('.preview-actions'),
    
    // History elements
    historyList: document.querySelector('.history-list'),
    historyEmpty: document.querySelector('.history-empty'),
    
    // Connection elements
    statusIndicator: document.querySelector('.status-indicator'),
    statusText: document.querySelector('.status-text'),
    
    // Settings elements
    settingsModal: document.querySelector('.settings-modal'),
    apiUrl: document.getElementById('api-url'),
    apiKey: document.getElementById('api-key'),
    modelSelect: document.getElementById('model-select'),
    mockMode: document.getElementById('mock-mode'),
    
    // Theme toggle
    themeToggle: document.querySelector('.theme-toggle')
  };
}

// Setup event listeners
function setupEventListeners() {
  // Generate button click
  elements.generateBtn.addEventListener('click', generateImage);
  
  // Inspire button click
  elements.inspireBtn.addEventListener('click', getRandomPrompt);
  
  // Style select change
  elements.styleSelect.addEventListener('change', updateStyleDescription);
  
  // Steps slider input
  elements.stepsSlider.addEventListener('input', updateSliderValue);
  
  // Dice button click for random seed
  elements.diceButton.addEventListener('click', generateRandomSeed);
  
  // Connection settings button click
  elements.connectionSettings.addEventListener('click', openSettingsModal);
  
  // Close modal button click
  elements.closeModal.addEventListener('click', closeSettingsModal);
  
  // Test connection button click
  elements.testConnection.addEventListener('click', testApiConnection);
  
  // Save settings button click
  elements.saveSettings.addEventListener('click', saveSettings);
  
  // Download button click
  elements.downloadBtn.addEventListener('click', downloadImage);
  
  // Share button click
  elements.shareBtn.addEventListener('click', shareImage);
  
  // Regenerate button click
  elements.regenerateBtn.addEventListener('click', regenerateImage);
  
  // Clear history button click
  elements.clearHistory.addEventListener('click', clearHistory);
  
  // Theme toggle button click
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // Close modal when clicking outside
  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
      closeSettingsModal();
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape key closes modal
    if (e.key === 'Escape' && !elements.settingsModal.classList.contains('hidden')) {
      closeSettingsModal();
    }
    
    // Enter key generates image if prompt is focused and Ctrl/Cmd is pressed
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && document.activeElement === elements.promptInput) {
      generateImage();
    }
  });
}

// Initialize UI components
function initializeUI() {
  // Populate style descriptions
  for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
    state.styleDescriptions[key] = preset.description;
  }
  
  // Update style description for default style
  updateStyleDescription();
  
  // Update slider value display
  updateSliderValue();
}

// Update style description when style is changed
function updateStyleDescription() {
  const selectedStyle = elements.styleSelect.value;
  elements.styleDescription.textContent = state.styleDescriptions[selectedStyle] || '';
}Abra o arquivo media/thread-images/thread-banner-generator-english.html no seu navegador
Gere os banners para cada tweet (Project Evolution, GPU Mesh, etc.)
Salve as imagens com os nomes corretos na pasta media/thread-images+/


// Update slider value display
function updateSliderValue() {
  elements.sliderValue.textContent = elements.stepsSlider.value;
}

// Generate a random seed
function generateRandomSeed() {
  const randomSeed = Math.floor(Math.random() * CONFIG.RANDOM_SEED_MAX);
  elements.seedInput.value = randomSeed;
}

// Get a random prompt for inspiration
function getRandomPrompt() {
  const randomIndex = Math.floor(Math.random() * PROMPT_IDEAS.length);
  elements.promptInput.value = PROMPT_IDEAS[randomIndex];
}

// Open settings modal
function openSettingsModal() {
  elements.settingsModal.classList.remove('hidden');
}

// Close settings modal
function closeSettingsModal() {
  elements.settingsModal.classList.add('hidden');
}

// Toggle theme between dark and light
function toggleTheme() {
  const body = document.body;
  const isDark = !body.hasAttribute('data-theme') || body.getAttribute('data-theme') === 'dark';
  
  if (isDark) {
    body.setAttribute('data-theme', 'light');
    elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    body.setAttribute('data-theme', 'dark');
    elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
  
  // Save theme preference
  localStorage.setItem('runesAnalyticsTheme', isDark ? 'light' : 'dark');
}

// Load settings from local storage
function loadSettings() {
  // Load API URL
  const savedApiUrl = localStorage.getItem('runesAnalyticsSdApiUrl');
  if (savedApiUrl) {
    elements.apiUrl.value = savedApiUrl;
    CONFIG.API_URL = savedApiUrl;
  }
  
  // Load API Key
  const savedApiKey = localStorage.getItem('runesAnalyticsSdApiKey');
  if (savedApiKey) {
    elements.apiKey.value = savedApiKey;
  }
  
  // Load model selection
  const savedModel = localStorage.getItem('runesAnalyticsSdModel');
  if (savedModel) {
    elements.modelSelect.value = savedModel;
  }
  
  // Load mock mode setting
  const mockModeSetting = localStorage.getItem('runesAnalyticsSdMockMode');
  if (mockModeSetting !== null) {
    CONFIG.MOCK_MODE = mockModeSetting === 'true';
    elements.mockMode.checked = CONFIG.MOCK_MODE;
  }
  
  // Load theme preference
  const savedTheme = localStorage.getItem('runesAnalyticsTheme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    elements.themeToggle.innerHTML = savedTheme === 'light' 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
  }
}

// Save settings to local storage
function saveSettings() {
  CONFIG.API_URL = elements.apiUrl.value;
  CONFIG.MOCK_MODE = elements.mockMode.checked;
  
  localStorage.setItem('runesAnalyticsSdApiUrl', elements.apiUrl.value);
  localStorage.setItem('runesAnalyticsSdApiKey', elements.apiKey.value);
  localStorage.setItem('runesAnalyticsSdModel', elements.modelSelect.value);
  localStorage.setItem('runesAnalyticsSdMockMode', CONFIG.MOCK_MODE);
  
  // Check connection with new settings
  checkApiConnection(true);
  
  // Close modal
  closeSettingsModal();
  
  // Show success notification
  showNotification('Settings saved successfully', 'success');
}

// Check connection to Stable Diffusion API
function checkApiConnection(showResult = false) {
  if (state.connectionChecking) return;
  
  state.connectionChecking = true;
  
  // Update UI to show checking state
  elements.statusIndicator.className = 'status-indicator';
  elements.statusText.textContent = 'Checking connection...';
  
  // Attempt to connect to API
  fetch(CONFIG.API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    state.connected = response.ok;
    updateConnectionStatus();
    
    if (showResult) {
      showNotification(
        state.connected ? 'Successfully connected to Stable Diffusion API' : 'Failed to connect to Stable Diffusion API',
        state.connected ? 'success' : 'error'
      );
    }
  })
  .catch(error => {
    console.log('%c[RUNES.AI] %cAPI Connection Error:', 'color: #5ce1e6; font-weight: bold', 'color: #ff3864', error);
    state.connected = false;
    updateConnectionStatus();
    
    if (showResult) {
      showNotification('Failed to connect to Stable Diffusion API', 'error');
    }
  })
  .finally(() => {
    state.connectionChecking = false;
  });
}

// Test API connection explicitly
function testApiConnection() {
  checkApiConnection(true);
}

// Update connection status UI
function updateConnectionStatus() {
  elements.statusIndicator.className = state.connected 
    ? 'status-indicator online' 
    : 'status-indicator offline';
    
  elements.statusText.textContent = state.connected 
    ? 'Local SD: Connected' 
    : 'Local SD: Not Connected';
}

// Generate image
function generateImage() {
  if (state.generatingImage) return;
  
  // Get input values
  const prompt = elements.promptInput.value.trim();
  if (prompt === '') {
    showNotification('Please enter a prompt', 'warning');
    elements.promptInput.focus();
    return;
  }
  
  state.generatingImage = true;
  
  // Update UI to show generating state
  elements.generateBtn.disabled = true;
  elements.loadingIndicator.classList.remove('hidden');
  elements.previewPlaceholder.classList.add('hidden');
  elements.previewActions.classList.add('hidden');
  elements.generationInfo.classList.add('hidden');
  
  // Start progress animation
  startProgressAnimation();
  
  // Get selected parameters
  const style = elements.styleSelect.value;
  const resolution = elements.resolutionSelect.value;
  const seed = elements.seedInput.value === '' ? -1 : parseInt(elements.seedInput.value);
  const steps = parseInt(elements.stepsSlider.value);
  
  // Get style preset
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.custom;
  
  // Build the full prompt with style prefix if not custom
  let fullPrompt = prompt;
  if (style !== 'custom' && stylePreset.promptPrefix) {
    fullPrompt = `${stylePreset.promptPrefix}, ${prompt}`;
  }
  
  // Log generation parameters
  console.log('%c[RUNES.AI] %cGenerating image with parameters:', 'color: #5ce1e6; font-weight: bold', 'color: white');
  console.log({
    prompt: fullPrompt,
    style,
    resolution,
    seed,
    steps,
    negativePrompt: stylePreset.negativePrompt
  });
  
  // Check if we can use the actual API or need to use mock data
  if (state.connected && !CONFIG.MOCK_MODE) {
    generateImageViaApi(fullPrompt, stylePreset.negativePrompt, resolution, seed, steps);
  } else {
    generateMockImage(fullPrompt, style, resolution, seed);
  }
}

// Generate image via Stable Diffusion API
function generateImageViaApi(prompt, negativePrompt, resolution, seed, steps) {
  // Parse resolution
  const [width, height] = resolution.split('x').map(Number);
  
  // Prepare the request body
  const requestBody = {
    prompt: prompt,
    negative_prompt: negativePrompt,
    width: width,
    height: height,
    seed: seed,
    steps: steps,
    cfg_scale: 7.5,
    sampler_name: "Euler a"
  };
  
  // Send request to API
  fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const imageData = data.images[0];
    if (!imageData) {
      throw new Error('No image data returned');
    }
    
    // Process the generated image
    processGeneratedImage(
      `data:image/png;base64,${imageData}`,
      prompt,
      elements.styleSelect.value,
      seed !== -1 ? seed : data.seed || Math.floor(Math.random() * CONFIG.RANDOM_SEED_MAX)
    );
  })
  .catch(error => {
    console.log('%c[RUNES.AI] %cAPI Error:', 'color: #5ce1e6; font-weight: bold', 'color: #ff3864', error);
    showNotification('Failed to generate image: ' + error.message, 'error');
    
    // Fall back to mock image
    generateMockImage(prompt, elements.styleSelect.value, resolution, seed);
  });
}

// Generate a mock image for demonstration
function generateMockImage(prompt, style, resolution, seed) {
  // Simulate API delay
  setTimeout(() => {
    const randomSeed = seed !== -1 ? seed : Math.floor(Math.random() * CONFIG.RANDOM_SEED_MAX);
    const mockIndex = randomSeed % state.mockImages.length;
    
    // Process the mock image
    processGeneratedImage(
      state.mockImages[mockIndex],
      prompt,
      style,
      randomSeed
    );
    
    console.log('%c[RUNES.AI] %cUsing mock image (API not available)', 'color: #5ce1e6; font-weight: bold', 'color: #ffb700');
  }, 2000);
}

// Process a generated image (real or mock)
function processGeneratedImage(imageUrl, prompt, style, seed) {
  // Cache the current image data
  state.currentImageData = {
    url: imageUrl,
    prompt,
    style,
    seed,
    timestamp: new Date().toISOString()
  };
  
  // Display the image
  elements.previewImage.src = imageUrl;
  elements.previewImage.classList.remove('hidden');
  
  // Update generation info
  elements.promptValue.textContent = prompt;
  elements.styleValue.textContent = STYLE_PRESETS[style]?.description || style;
  elements.seedValue.textContent = seed;
  
  // Show the image info and actions
  elements.generationInfo.classList.remove('hidden');
  elements.previewActions.classList.remove('hidden');
  
  // Hide loading indicator
  elements.loadingIndicator.classList.add('hidden');
  
  // Re-enable generate button
  elements.generateBtn.disabled = false;
  
  // Add to history
  addToHistory(state.currentImageData);
  
  // End generating state
  state.generatingImage = false;
}

// Add an image to the history
function addToHistory(imageData) {
  // Add to beginning of history array
  state.history.unshift(imageData);
  
  // Limit history size
  if (state.history.length > CONFIG.MAX_HISTORY_ITEMS) {
    state.history = state.history.slice(0, CONFIG.MAX_HISTORY_ITEMS);
  }
  
  // Save history to storage
  saveHistory();
  
  // Update history UI
  updateHistoryUI();
}

// Update the history UI
function updateHistoryUI() {
  // Clear history list
  elements.historyList.innerHTML = '';
  
  if (state.history.length === 0) {
    // Show empty state
    elements.historyEmpty.style.display = 'flex';
    return;
  }
  
  // Hide empty state
  elements.historyEmpty.style.display = 'none';
  
  // Add history items
  state.history.forEach((item, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.dataset.index = index;
    
    const historyImage = document.createElement('img');
    historyImage.className = 'history-image';
    historyImage.src = item.url;
    historyImage.alt = `Generated image: ${item.prompt}`;
    
    const historyOverlay = document.createElement('div');
    historyOverlay.className = 'history-overlay';
    
    // Format timestamp to readable date
    const timestamp = new Date(item.timestamp);
    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    historyOverlay.textContent = formattedTime;
    
    historyItem.appendChild(historyImage);
    historyItem.appendChild(historyOverlay);
    
    // Add click event to restore this image
    historyItem.addEventListener('click', () => {
      restoreFromHistory(index);
    });
    
    elements.historyList.appendChild(historyItem);
  });
}

// Restore an image from history
function restoreFromHistory(index) {
  const item = state.history[index];
  if (!item) return;
  
  // Update form values
  elements.promptInput.value = item.prompt;
  elements.styleSelect.value = item.style;
  elements.seedInput.value = item.seed;
  
  // Update style description
  updateStyleDescription();
  
  // Show the image
  elements.previewImage.src = item.url;
  elements.previewImage.classList.remove('hidden');
  elements.previewPlaceholder.classList.add('hidden');
  
  // Update generation info
  elements.promptValue.textContent = item.prompt;
  elements.styleValue.textContent = STYLE_PRESETS[item.style]?.description || item.style;
  elements.seedValue.textContent = item.seed;
  
  // Show the image info and actions
  elements.generationInfo.classList.remove('hidden');
  elements.previewActions.classList.remove('hidden');
  
  // Update current image data
  state.currentImageData = item;
}

// Start progress animation
function startProgressAnimation() {
  // Animation is handled by CSS
}

// Download the current image
function downloadImage() {
  if (!state.currentImageData) return;
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = state.currentImageData.url;
  
  // Generate a filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const shortPrompt = state.currentImageData.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase();
  link.download = `runes-ai-${shortPrompt}-${timestamp}.png`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Share the current image 
function shareImage() {
  if (!state.currentImageData) return;
  
  // Check if Web Share API is available
  if (navigator.share) {
    // Convert base64 to blob for sharing
    fetch(state.currentImageData.url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'runes-ai-image.png', { type: 'image/png' });
        
        navigator.share({
          title: 'RUNES Analytics Pro AI Generated Image',
          text: `AI generated image with prompt: ${state.currentImageData.prompt}`,
          files: [file]
        })
        .catch(error => {
          console.log('%c[RUNES.AI] %cShare Error:', 'color: #5ce1e6; font-weight: bold', 'color: #ff3864', error);
          showNotification('Unable to share image', 'error');
        });
      });
  } else {
    showNotification('Share functionality not supported by your browser', 'warning');
  }
}

// Regenerate the current image
function regenerateImage() {
  if (!state.currentImageData) return;
  
  // Set the form values from current image data
  elements.promptInput.value = state.currentImageData.prompt;
  elements.styleSelect.value = state.currentImageData.style;
  
  // Generate a new seed
  generateRandomSeed();
  
  // Generate new image
  generateImage();
}

// Clear the history
function clearHistory() {
  // Confirm before clearing
  if (confirm('Are you sure you want to clear your generation history?')) {
    state.history = [];
    saveHistory();
    updateHistoryUI();
    showNotification('History cleared', 'success');
  }
}

// Load history from storage
function loadHistory() {
  try {
    const historyJson = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (historyJson) {
      state.history = JSON.parse(historyJson);
      updateHistoryUI();
    }
  } catch (error) {
    console.log('%c[RUNES.AI] %cError loading history:', 'color: #5ce1e6; font-weight: bold', 'color: #ff3864', error);
    state.history = [];
  }
}

// Save history to storage
function saveHistory() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.history));
  } catch (error) {
    console.log('%c[RUNES.AI] %cError saving history:', 'color: #5ce1e6; font-weight: bold', 'color: #ff3864', error);
    showNotification('Failed to save history', 'error');
  }
}

// Show a notification
function showNotification(message, type = 'info') {
  // Check if mesh-notify.js is available
  if (typeof window.meshNotify === 'function') {
    window.meshNotify({
      text: message,
      type: type,
      duration: 3000
    });
  } else {
    // Fallback to alert for critical errors
    if (type === 'error') {
      alert(message);
    } else {
      console.log('%c[RUNES.AI] %c' + message, 'color: #5ce1e6; font-weight: bold', 'color: white');
    }
  }
} 
/**
 * RUNES Analytics Pro - Main JavaScript
 * Powers interactions and animations for the presentation website
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize loading sequence
  initLoadingSequence();
  
  // Setup navigation and mobile menu
  setupNavigation();
  
  // Initialize glitch mode toggle
  initGlitchMode();
  
  // Setup all interactive elements
  setupInteractiveElements();
  
  // Initialize page-specific functions based on current page
  initPageSpecific();
});

/**
 * Terminal-style loading sequence
 */
function initLoadingSequence() {
  const loadingScreen = document.querySelector('.loading-screen');
  const terminalText = document.querySelector('.terminal-text');
  const progressBar = document.querySelector('.progress-bar');
  
  if (!loadingScreen || !terminalText || !progressBar) return;
  
  const bootSequence = [
    { text: '> Initializing RUNES Analytics Pro system...', delay: 400 },
    { text: '> Connecting to blockchain nodes...', delay: 800 },
    { text: '> Loading API endpoints...', delay: 600 },
    { text: '> Initializing cache system...', delay: 700 },
    { text: '> Establishing secure connection...', delay: 900 },
    { text: '> Loading UI components...', delay: 500 },
    { text: '> Preparing data visualization modules...', delay: 800 },
    { text: '> Finalizing system boot...', delay: 700 },
    { text: '> RUNES Analytics Pro ready. Welcome.', delay: 1000 }
  ];
  
  let currentIndex = 0;
  let currentText = '';
  
  // Simulate typing effect for terminal text
  function typeNextLine() {
    if (currentIndex >= bootSequence.length) {
      // Loading complete
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        document.body.classList.add('loaded');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          animateEntryElements();
        }, 500);
      }, 1000);
      return;
    }
    
    const line = bootSequence[currentIndex];
    currentText += line.text + '\n';
    terminalText.textContent = currentText;
    
    // Update progress bar
    const progress = (currentIndex + 1) / bootSequence.length * 100;
    progressBar.style.width = `${progress}%`;
    
    currentIndex++;
    setTimeout(typeNextLine, line.delay);
  }
  
  // Start the loading sequence
  setTimeout(typeNextLine, 500);
}

/**
 * Setup navigation functionality
 */
function setupNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', 
        navToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
      );
    });
  }
  
  // Highlight current page in navigation
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.endsWith(linkPath)) {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize glitch mode toggle
 */
function initGlitchMode() {
  const glitchToggle = document.querySelector('.glitch-toggle');
  
  if (glitchToggle) {
    glitchToggle.addEventListener('click', () => {
      document.body.classList.toggle('glitch-mode');
      glitchToggle.classList.toggle('active');
      
      if (document.body.classList.contains('glitch-mode')) {
        // Add more glitch effects when mode is active
        document.querySelectorAll('h1, h2, h3').forEach(element => {
          element.classList.add('glitch-text');
        });
      } else {
        // Remove extra glitch effects
        document.querySelectorAll('h1, h2, h3').forEach(element => {
          if (!element.classList.contains('permanent-glitch')) {
            element.classList.remove('glitch-text');
          }
        });
      }
    });
  }
}

/**
 * Setup all interactive elements across pages
 */
function setupInteractiveElements() {
  // Setup tooltips
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(element => {
    const tooltipText = element.getAttribute('data-tooltip');
    element.addEventListener('mouseenter', () => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);
      
      const rect = element.getBoundingClientRect();
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    });
    
    element.addEventListener('mouseleave', () => {
      const tooltip = document.querySelector('.tooltip');
      if (tooltip) tooltip.remove();
    });
  });
  
  // Add animation to stat counters
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  
  const observerOptions = {
    threshold: 0.5
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const finalValue = parseInt(element.getAttribute('data-count'));
        animateCounter(element, finalValue);
        observer.unobserve(element);
      }
    });
  }, observerOptions);
  
  statValues.forEach(stat => {
    observer.observe(stat);
  });
}

/**
 * Animate counter from 0 to target value
 */
function animateCounter(element, finalValue) {
  let currentValue = 0;
  const duration = 2000; // ms
  const interval = 16; // ms (approx 60fps)
  const steps = duration / interval;
  const increment = finalValue / steps;
  
  const timer = setInterval(() => {
    currentValue += increment;
    
    if (currentValue >= finalValue) {
      element.textContent = finalValue;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(currentValue);
    }
  }, interval);
}

/**
 * Add entrance animations to elements
 */
function animateEntryElements() {
  const fadeElements = document.querySelectorAll('.fade-in');
  const slideUpElements = document.querySelectorAll('.slide-in-up');
  const slideRightElements = document.querySelectorAll('.slide-in-right');
  
  // Create a combined array of all elements to animate
  const allAnimatedElements = [
    ...fadeElements, 
    ...slideUpElements, 
    ...slideRightElements
  ];
  
  // Set initial opacity to 0
  allAnimatedElements.forEach(element => {
    element.style.opacity = '0';
  });
  
  // Animate each element with a slight delay between them
  allAnimatedElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = '1';
    }, 100 * index);
  });
}

/**
 * Initialize page-specific functionality
 */
function initPageSpecific() {
  const currentPath = window.location.pathname;
  
  // Home page (intro.html)
  if (currentPath.includes('intro') || currentPath.endsWith('/')) {
    initParticleAnimation();
    initTypingEffect();
  }
  
  // Architecture page
  if (currentPath.includes('architecture')) {
    initArchitecturePage();
  }
  
  // Features page
  if (currentPath.includes('features')) {
    initFeaturesPage();
  }
  
  // Web3 page
  if (currentPath.includes('web3')) {
    initWeb3Page();
  }
  
  // Demo page
  if (currentPath.includes('demo')) {
    initDemoPage();
  }
  
  // Bootoshi special page
  if (currentPath.includes('bootoshi')) {
    initBootoshiPage();
  }
}

/**
 * Particle animation for the home hero section
 */
function initParticleAnimation() {
  const particleContainer = document.querySelector('.particle-container');
  if (!particleContainer) return;
  
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 3 + 1;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const animationDuration = Math.random() * 20 + 10;
    const animationDelay = Math.random() * 5;
    
    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animationDuration = `${animationDuration}s`;
    particle.style.animationDelay = `${animationDelay}s`;
    
    // Random color
    const colors = ['var(--primary-cyan)', 'var(--primary-purple)', 'var(--primary-green)'];
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    particleContainer.appendChild(particle);
  }
}

/**
 * Typing effect for specific text elements
 */
function initTypingEffect() {
  const typingElements = document.querySelectorAll('.typing-effect');
  
  typingElements.forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    let i = 0;
    const typingSpeed = 100; // ms per character
    
    function typeChar() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, typingSpeed);
      }
    }
    
    typeChar();
  });
}

/**
 * Architecture page specific initialization
 */
function initArchitecturePage() {
  // Initialize interactive diagram
  const diagramElements = document.querySelectorAll('.arch-diagram-element');
  const detailsContainer = document.querySelector('.component-details');
  
  if (diagramElements.length && detailsContainer) {
    diagramElements.forEach(element => {
      element.addEventListener('click', () => {
        // Remove active class from all elements
        diagramElements.forEach(el => el.classList.remove('active'));
        
        // Add active class to clicked element
        element.classList.add('active');
        
        // Get component details and update container
        const componentId = element.getAttribute('data-component');
        const detailsSection = document.getElementById(`${componentId}-details`);
        
        if (detailsSection) {
          detailsContainer.innerHTML = detailsSection.innerHTML;
          detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    
    // Activate first element by default
    if (diagramElements[0]) {
      diagramElements[0].click();
    }
  }
  
  // Add animation to connection lines
  animateConnectionLines();
}

/**
 * Animate connection lines in architecture diagram
 */
function animateConnectionLines() {
  const connectionLines = document.querySelectorAll('.connection-line');
  
  connectionLines.forEach(line => {
    const length = line.getTotalLength();
    
    // Set up the animation
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
    
    // Triggered when line comes into view
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          line.style.transition = 'stroke-dashoffset 2s ease-in-out';
          line.style.strokeDashoffset = '0';
          observer.unobserve(line);
        }
      });
    });
    
    observer.observe(line);
  });
}

/**
 * Features page specific initialization
 */
function initFeaturesPage() {
  // Initialize feature cards hover effects
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
    const animation = card.getAttribute('data-animation');
    
    card.addEventListener('mouseenter', () => {
      card.classList.add(animation);
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove(animation);
    });
  });
  
  // Initialize comparison table highlighting
  const comparisonTable = document.querySelector('.comparison-table');
  if (comparisonTable) {
    const cells = comparisonTable.querySelectorAll('td[data-highlight="true"]');
    
    cells.forEach(cell => {
      cell.classList.add('highlight-cell');
    });
  }
}

/**
 * Web3 page specific initialization
 */
function initWeb3Page() {
  // Blockchain animation
  animateBlockchain();
  
  // Initialize expanding glossary terms
  const glossaryTerms = document.querySelectorAll('.glossary-term');
  
  glossaryTerms.forEach(term => {
    term.addEventListener('click', () => {
      term.classList.toggle('expanded');
    });
  });
}

/**
 * Animate blockchain blocks
 */
function animateBlockchain() {
  const blockchainContainer = document.querySelector('.blockchain-visualization');
  if (!blockchainContainer) return;
  
  const blocks = blockchainContainer.querySelectorAll('.block');
  
  blocks.forEach((block, index) => {
    setTimeout(() => {
      block.classList.add('connected');
    }, 500 * index);
  });
}

/**
 * Demo page specific initialization
 */
function initDemoPage() {
  // Initialize feature carousel
  initFeatureCarousel();
  
  // Initialize workflow simulator
  initWorkflowSimulator();
  
  // Setup Konami code easter egg
  setupKonamiCode();
}

/**
 * Initialize feature carousel on demo page
 */
function initFeatureCarousel() {
  const carousel = document.querySelector('.feature-carousel');
  if (!carousel) return;
  
  const slides = carousel.querySelectorAll('.carousel-slide');
  const indicators = carousel.querySelectorAll('.carousel-indicator');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  
  let currentIndex = 0;
  
  function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
      slide.style.display = 'none';
    });
    
    // Remove active class from all indicators
    indicators.forEach(indicator => {
      indicator.classList.remove('active');
    });
    
    // Show current slide and activate indicator
    slides[index].style.display = 'block';
    indicators[index].classList.add('active');
  }
  
  // Initially show first slide
  showSlide(currentIndex);
  
  // Setup navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });
  }
  
  // Setup indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentIndex = index;
      showSlide(currentIndex);
    });
  });
}

/**
 * Initialize workflow simulator on demo page
 */
function initWorkflowSimulator() {
  const simulator = document.querySelector('.workflow-simulator');
  if (!simulator) return;
  
  const steps = simulator.querySelectorAll('.workflow-step');
  const nextBtn = simulator.querySelector('.workflow-next');
  const prevBtn = simulator.querySelector('.workflow-prev');
  
  let currentStep = 0;
  
  function showStep(index) {
    // Hide all steps
    steps.forEach(step => {
      step.style.display = 'none';
    });
    
    // Show current step
    steps[index].style.display = 'block';
    
    // Update buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === steps.length - 1;
  }
  
  // Initially show first step
  showStep(currentStep);
  
  // Setup navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  }
}

/**
 * Setup Konami code easter egg
 */
function setupKonamiCode() {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      
      if (konamiIndex === konamiCode.length) {
        // Konami code completed!
        activateWhaleMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

/**
 * Activate "whale mode" easter egg
 */
function activateWhaleMode() {
  const demoContainer = document.querySelector('.demo-container');
  if (!demoContainer) return;
  
  demoContainer.classList.add('whale-mode');
  
  // Change all metric values to extreme numbers
  const metricValues = document.querySelectorAll('.metric-value');
  metricValues.forEach(value => {
    const originalValue = value.textContent;
    value.setAttribute('data-original', originalValue);
    
    // Generate an extreme value
    if (originalValue.includes('%')) {
      value.textContent = '999%';
    } else if (originalValue.includes('$')) {
      value.textContent = '$999,999,999';
    } else {
      value.textContent = '9,999,999';
    }
  });
  
  // Add whale emoji particles
  for (let i = 0; i < 20; i++) {
    const whale = document.createElement('div');
    whale.className = 'whale-emoji';
    whale.textContent = '🐋';
    whale.style.left = `${Math.random() * 100}%`;
    whale.style.top = `${Math.random() * 100}%`;
    whale.style.animationDuration = `${Math.random() * 5 + 3}s`;
    whale.style.animationDelay = `${Math.random() * 2}s`;
    
    demoContainer.appendChild(whale);
  }
  
  // Reset after 10 seconds
  setTimeout(() => {
    demoContainer.classList.remove('whale-mode');
    
    // Restore original values
    metricValues.forEach(value => {
      const originalValue = value.getAttribute('data-original');
      if (originalValue) {
        value.textContent = originalValue;
      }
    });
    
    // Remove whale emojis
    document.querySelectorAll('.whale-emoji').forEach(whale => {
      whale.remove();
    });
  }, 10000);
}

/**
 * Bootoshi page specific initialization
 */
function initBootoshiPage() {
  // Add special effects for Bootoshi page
  document.body.classList.add('bootoshi-theme');
  
  // Initialize hidden poetic easter egg
  setupPoeticEasterEgg();
}

/**
 * Setup the poetic easter egg on Bootoshi page
 */
function setupPoeticEasterEgg() {
  const bitcoinSymbol = document.querySelector('.bitcoin-symbol');
  if (!bitcoinSymbol) return;
  
  bitcoinSymbol.addEventListener('click', () => {
    const poem = document.querySelector('.hidden-poem');
    if (poem) {
      poem.classList.add('reveal');
      
      // Animate each line of the poem
      const lines = poem.querySelectorAll('p');
      lines.forEach((line, index) => {
        setTimeout(() => {
          line.classList.add('visible');
        }, 500 + (index * 300));
      });
    }
  });
} 
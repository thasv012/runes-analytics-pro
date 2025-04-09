/**
 * RUNES Analytics Pro - Neural Banner Generator
 * 
 * This module provides functionality to generate visual banners with 
 * customizable styles, text, and effects. It uses Canvas API for rendering.
 */

// Main Neural Banner Generator module
const NeuralBanner = (() => {
  // Private variables
  let canvas = null;
  let ctx = null;
  let config = {};
  let generatedDataURL = null;

  // Default Configuration
  const defaultConfig = {
    width: 1280,
    height: 720,
    style: 'cyberpunk',
    text: 'RUNES Analytics',
    subtitle: 'Blockchain Data Intelligence',
    textPosition: 'center',
    theme: 'dark',
    includeSignature: true,
    animationSpeed: 'medium',
    lang: 'EN'
  };

  // Style Definitions
  const styles = {
    cyberpunk: {
      background: {
        gradient: ['#0e0b16', '#1a1a2e'],
        pattern: 'grid'
      },
      text: {
        fontFamily: '"Blender Pro", "Rajdhani", sans-serif',
        gradient: ['#e83e8c', '#42e6f5'],
        textTransform: 'uppercase',
        letterSpacing: 2,
        shadow: '0 0 10px rgba(232, 62, 140, 0.8)'
      },
      border: {
        color: '#e83e8c',
        width: 3,
        glowAmount: 20
      },
      effects: ['scanlines', 'glitch', 'dataNoise']
    },
    neural: {
      background: {
        gradient: ['#000000', '#1e1e2f'],
        pattern: 'neural'
      },
      text: {
        fontFamily: '"Syncopate", "Orbitron", sans-serif',
        gradient: ['#ff5e00', '#00ffea'],
        textTransform: 'uppercase',
        letterSpacing: 1,
        shadow: '0 0 15px rgba(0, 255, 234, 0.5)'
      },
      border: {
        color: '#00ffea',
        width: 2,
        glowAmount: 15
      },
      effects: ['particles', 'pulse', 'dataFlow']
    },
    minimal: {
      background: {
        gradient: ['#0f0f0f', '#0a0a0a'],
        pattern: 'none'
      },
      text: {
        fontFamily: '"Inter", sans-serif',
        gradient: ['#ffffff', '#f0f0f0'],
        textTransform: 'none',
        letterSpacing: -1,
        shadow: 'none'
      },
      border: {
        color: '#333',
        width: 1,
        glowAmount: 0
      },
      effects: []
    },
    bitcoin: {
      background: {
        gradient: ['#f7931a', '#df7b10'],
        pattern: 'blockchain'
      },
      text: {
        fontFamily: '"Montserrat", sans-serif',
        gradient: ['#ffffff', '#f0f0f0'],
        textTransform: 'none',
        letterSpacing: 0,
        shadow: '0 2px 4px rgba(0,0,0,0.5)'
      },
      border: {
        color: '#ffcb6c',
        width: 2,
        glowAmount: 10
      },
      effects: ['bitcoinSymbols', 'shine']
    }
  };

  // Animation Timing Presets (in milliseconds)
  const animationSpeeds = {
    slow: {
      initialDelay: 800,
      textRevealDuration: 1500,
      effectsDuration: 2000,
      totalDuration: 4000
    },
    medium: {
      initialDelay: 400,
      textRevealDuration: 1000,
      effectsDuration: 1500,
      totalDuration: 3000
    },
    fast: {
      initialDelay: 200,
      textRevealDuration: 700,
      effectsDuration: 1000,
      totalDuration: 2000
    }
  };

  // Text translations
  const translations = {
    EN: {
      signature: 'RUNES Analytics Pro',
      watermark: 'Powered by Neural Banner Generator'
    },
    PT: {
      signature: 'RUNES Analytics Pro',
      watermark: 'Gerado pelo Neural Banner Generator'
    }
  };

  // Create and set up the canvas
  function setupCanvas(targetElement) {
    // Create canvas if not provided
    if (!targetElement) {
      canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
    } else if (typeof targetElement === 'string') {
      canvas = document.getElementById(targetElement);
      if (!canvas) {
        console.error(`Target element '${targetElement}' not found`);
        return null;
      }
    } else {
      canvas = targetElement;
    }

    // Set canvas dimensions
    canvas.width = config.width;
    canvas.height = config.height;
    
    // Get context
    ctx = canvas.getContext('2d');
    
    return canvas;
  }

  // Parse configuration
  function parseConfig(userConfig) {
    // Merge with default config
    config = { ...defaultConfig, ...userConfig };
    
    // Parse resolution if provided as string
    if (typeof config.resolution === 'string' && config.resolution.includes('x')) {
      const [width, height] = config.resolution.split('x').map(Number);
      config.width = width || defaultConfig.width;
      config.height = height || defaultConfig.height;
    }
    
    // Validate style
    if (!styles[config.style]) {
      console.warn(`Style '${config.style}' not found, falling back to 'cyberpunk'`);
      config.style = 'cyberpunk';
    }
    
    // Validate animation speed
    if (!animationSpeeds[config.animationSpeed]) {
      config.animationSpeed = defaultConfig.animationSpeed;
    }
    
    // Validate language
    if (!translations[config.lang]) {
      config.lang = defaultConfig.lang;
    }
    
    return config;
  }

  // Draw background based on style
  function drawBackground() {
    const style = styles[config.style];
    const { width, height } = config;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, style.background.gradient[0]);
    gradient.addColorStop(1, style.background.gradient[1]);
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw pattern if needed
    if (style.background.pattern !== 'none') {
      drawPattern(style.background.pattern);
    }
    
    // Draw border
    if (style.border.width > 0) {
      ctx.strokeStyle = style.border.color;
      ctx.lineWidth = style.border.width;
      ctx.strokeRect(
        style.border.width / 2, 
        style.border.width / 2, 
        width - style.border.width, 
        height - style.border.width
      );
      
      // Add glow if specified
      if (style.border.glowAmount > 0) {
        ctx.shadowColor = style.border.color;
        ctx.shadowBlur = style.border.glowAmount;
        ctx.strokeRect(
          style.border.width / 2, 
          style.border.width / 2, 
          width - style.border.width, 
          height - style.border.width
        );
        ctx.shadowBlur = 0;
      }
    }
  }
  
  // Draw pattern based on type
  function drawPattern(patternType) {
    switch (patternType) {
      case 'grid':
        drawGridPattern();
        break;
      case 'neural':
        drawNeuralPattern();
        break;
      case 'blockchain':
        drawBlockchainPattern();
        break;
    }
  }
  
  // Draw grid pattern
  function drawGridPattern() {
    const { width, height } = config;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 50; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 50; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }
  
  // Draw neural network pattern
  function drawNeuralPattern() {
    const { width, height } = config;
    const nodes = [];
    const nodeCount = 30;
    const connections = [];
    
    // Generate random nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 2 + Math.random() * 3
      });
    }
    
    // Generate connections
    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      
      // Connect to 2-4 closest nodes
      const connectionsCount = 2 + Math.floor(Math.random() * 3);
      
      // Find distances to all other nodes
      const distances = [];
      for (let j = 0; j < nodeCount; j++) {
        if (i !== j) {
          const targetNode = nodes[j];
          const dx = node.x - targetNode.x;
          const dy = node.y - targetNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          distances.push({ index: j, distance });
        }
      }
      
      // Sort by distance
      distances.sort((a, b) => a.distance - b.distance);
      
      // Connect to closest nodes
      for (let j = 0; j < Math.min(connectionsCount, distances.length); j++) {
        const targetIndex = distances[j].index;
        connections.push({
          from: i,
          to: targetIndex,
          opacity: 0.1 + Math.random() * 0.2
        });
      }
    }
    
    // Draw connections
    ctx.lineWidth = 1;
    for (const connection of connections) {
      const fromNode = nodes[connection.from];
      const toNode = nodes[connection.to];
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${connection.opacity})`;
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    }
    
    // Draw nodes
    for (const node of nodes) {
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw blockchain pattern
  function drawBlockchainPattern() {
    const { width, height } = config;
    const blockSize = 60;
    const blocks = [];
    const rows = Math.ceil(height / blockSize);
    const cols = Math.ceil(width / blockSize);
    
    // Create blocks
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.7) { // Only draw some blocks for a sparse effect
          blocks.push({
            x: col * blockSize,
            y: row * blockSize,
            opacity: 0.05 + Math.random() * 0.1
          });
        }
      }
    }
    
    // Draw blocks
    for (const block of blocks) {
      ctx.fillStyle = `rgba(255, 255, 255, ${block.opacity})`;
      ctx.fillRect(
        block.x + 5, 
        block.y + 5, 
        blockSize - 10, 
        blockSize - 10
      );
      
      // Draw connector lines
      if (Math.random() > 0.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${block.opacity / 2})`;
        ctx.beginPath();
        ctx.moveTo(block.x + blockSize / 2, block.y + blockSize);
        ctx.lineTo(block.x + blockSize / 2, block.y + blockSize + 20);
        ctx.stroke();
      }
    }
  }

  // Draw main text
  function drawText() {
    const style = styles[config.style];
    const { width, height, text, subtitle, textPosition } = config;
    
    // Set font properties
    const fontSize = Math.floor(width / 15); // Scale font based on banner width
    ctx.font = `bold ${fontSize}px ${style.text.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Create text gradient
    const gradient = ctx.createLinearGradient(
      width * 0.25, 
      height * 0.4, 
      width * 0.75, 
      height * 0.6
    );
    gradient.addColorStop(0, style.text.gradient[0]);
    gradient.addColorStop(1, style.text.gradient[1]);
    ctx.fillStyle = gradient;
    
    // Apply text shadow
    if (style.text.shadow !== 'none') {
      ctx.shadowColor = style.text.shadow.split(' ').pop().replace(/[()]/g, '');
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Calculate vertical position based on textPosition config
    let yPos;
    switch (textPosition) {
      case 'top':
        yPos = height * 0.25;
        break;
      case 'bottom':
        yPos = height * 0.75;
        break;
      case 'center':
      default:
        yPos = height * 0.45;
    }
    
    // Draw main text with specified transform
    const displayText = style.text.textTransform === 'uppercase' 
      ? text.toUpperCase() 
      : text;
    ctx.fillText(displayText, width / 2, yPos, width * 0.9);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw subtitle if provided
    if (subtitle) {
      ctx.font = `${fontSize / 3}px ${style.text.fontFamily}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(subtitle, width / 2, yPos + fontSize * 0.8, width * 0.8);
    }
    
    // Draw signature/watermark if enabled
    if (config.includeSignature) {
      const translations = {
        EN: {
          signature: 'RUNES Analytics Pro',
          watermark: 'Powered by Neural Banner Generator'
        },
        PT: {
          signature: 'RUNES Analytics Pro',
          watermark: 'Gerado pelo Neural Banner Generator'
        }
      };
      
      const textContent = translations[config.lang] || translations.EN;
      
      ctx.font = `bold ${fontSize / 4}px ${style.text.fontFamily}`;
      ctx.fillStyle = style.border.color;
      ctx.textAlign = 'right';
      ctx.fillText(textContent.signature, width - 30, height - 50, width * 0.4);
      
      ctx.font = `${fontSize / 6}px ${style.text.fontFamily}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(textContent.watermark, width - 30, height - 25, width * 0.4);
    }
  }

  // Apply special effects based on style
  function applyEffects() {
    const style = styles[config.style];
    
    if (!style.effects || style.effects.length === 0) {
      return;
    }
    
    for (const effect of style.effects) {
      switch (effect) {
        case 'scanlines':
          applyScanlines();
          break;
        case 'glitch':
          applyGlitchEffect();
          break;
        case 'particles':
          applyParticles();
          break;
        case 'dataNoise':
          applyDataNoise();
          break;
        case 'shine':
          applyShine();
          break;
        case 'bitcoinSymbols':
          applyBitcoinSymbols();
          break;
      }
    }
  }
  
  // Scanlines effect
  function applyScanlines() {
    const { width, height } = config;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1);
    }
  }
  
  // Glitch effect
  function applyGlitchEffect() {
    const { width, height } = config;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Create 3-10 glitch areas
    const glitchCount = 3 + Math.floor(Math.random() * 7);
    
    for (let i = 0; i < glitchCount; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const w = 5 + Math.floor(Math.random() * 50);
      const h = 2 + Math.floor(Math.random() * 10);
      const offset = Math.floor(Math.random() * 30) - 15;
      
      // Simple horizontal RGB shift
      for (let py = y; py < y + h && py < height; py++) {
        for (let px = x; px < x + w && px < width; px++) {
          const pos = (py * width + px) * 4;
          if (pos + offset * 4 + 2 < data.length && pos + offset * 4 >= 0) {
            // Move only red channel for RGB split effect
            data[pos] = data[pos + offset * 4];
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  // Particles effect
  function applyParticles() {
    const { width, height } = config;
    const particleCount = 100;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Data noise effect
  function applyDataNoise() {
    const { width, height } = config;
    const binaryChars = '10';
    const charSize = 10;
    const opacity = 0.15;
    
    ctx.font = `${charSize}px monospace`;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    
    for (let y = 10; y < height; y += charSize * 1.5) {
      for (let x = 10; x < width; x += charSize) {
        if (Math.random() > 0.85) { // Make it sparse
          const char = binaryChars.charAt(Math.floor(Math.random() * binaryChars.length));
          ctx.fillText(char, x, y);
        }
      }
    }
  }
  
  // Shine effect
  function applyShine() {
    const { width, height } = config;
    
    // Create diagonal shine gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Bitcoin symbols effect
  function applyBitcoinSymbols() {
    const { width, height } = config;
    const symbols = ['₿', '₿', '₿', 'Ƀ', 'Ξ']; // Bitcoin and Ethereum symbols
    const symbolCount = 15;
    
    ctx.font = `20px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    
    for (let i = 0; i < symbolCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      ctx.fillText(symbol, x, y);
    }
  }

  // Generate QR code if requested in config
  function generateQR() {
    if (!config.qr) return;
    
    // This is a simplified QR generation for demonstration
    // In a real application, you'd use a QR code generation library
    
    const { width, height } = config;
    const qrSize = Math.min(width, height) * 0.2;
    let qrX, qrY;
    
    // Position QR code based on config
    switch (config.qrPosition || 'bottom-right') {
      case 'bottom-right':
        qrX = width - qrSize - 20;
        qrY = height - qrSize - 20;
        break;
      case 'bottom-left':
        qrX = 20;
        qrY = height - qrSize - 20;
        break;
      case 'top-right':
        qrX = width - qrSize - 20;
        qrY = 20;
        break;
      case 'top-left':
        qrX = 20;
        qrY = 20;
        break;
    }
    
    // Draw QR background
    ctx.fillStyle = 'white';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    
    // Draw QR label
    ctx.fillStyle = 'black';
    ctx.font = `${qrSize / 12}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Scan me', qrX + qrSize / 2, qrY + qrSize + 15);
    
    // Draw fake QR pattern
    ctx.fillStyle = 'black';
    const cellSize = qrSize / 25;
    
    // Draw corner squares
    for (let i = 0; i < 3; i++) {
      // Top-left
      ctx.fillRect(qrX + i * cellSize, qrY + i * cellSize, 7 * cellSize - i * 2 * cellSize, cellSize);
      ctx.fillRect(qrX + i * cellSize, qrY + i * cellSize, cellSize, 7 * cellSize - i * 2 * cellSize);
      ctx.fillRect(qrX + i * cellSize, qrY + 6 * cellSize - i * cellSize, 7 * cellSize - i * 2 * cellSize, cellSize);
      ctx.fillRect(qrX + 6 * cellSize - i * cellSize, qrY + i * cellSize, cellSize, 7 * cellSize - i * 2 * cellSize);
      
      // Top-right
      ctx.fillRect(qrX + qrSize - 7 * cellSize + i * cellSize, qrY + i * cellSize, 7 * cellSize - i * 2 * cellSize, cellSize);
      ctx.fillRect(qrX + qrSize - cellSize - i * cellSize, qrY + i * cellSize, cellSize, 7 * cellSize - i * 2 * cellSize);
      ctx.fillRect(qrX + qrSize - 7 * cellSize + i * cellSize, qrY + 6 * cellSize - i * cellSize, 7 * cellSize - i * 2 * cellSize, cellSize);
      ctx.fillRect(qrX + qrSize - 7 * cellSize + i * cellSize, qrY + i * cellSize, cellSize, 7 * cellSize - i * 2 * cellSize);
      
      // Bottom-left
      ctx.fillRect(qrX + i * cellSize, qrY + qrSize - 7 * cellSize + i * cellSize, 7 * cellSize - i * 2 * cellSize, cellSize);
      ctx.fillRect(qrX + i * cellSize, qrY + qrSize - 7 * cellSize + i * cellSize, cellSize, 7 * cellSize - i * 2 * cellSize);
      ctx.fillRect(qrX + i * cellSize, qrY + qrSize - cellSize - i * cellSize, 7 * cellSize - i * 2 * cellSize, cellSize);
      ctx.fillRect(qrX + 6 * cellSize - i * cellSize, qrY + qrSize - 7 * cellSize + i * cellSize, cellSize, 7 * cellSize - i * 2 * cellSize);
    }
    
    // Draw random dots to make it look like a QR code
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        // Skip corners
        if (
          (x < 7 && y < 7) || 
          (x >= 25 - 7 && y < 7) || 
          (x < 7 && y >= 25 - 7)
        ) {
          continue;
        }
        
        if (Math.random() > 0.65) {
          ctx.fillRect(qrX + x * cellSize, qrY + y * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Render complete banner based on config
  function render() {
    drawBackground();
    drawText();
    applyEffects();
    generateQR();
    
    // Store the generated banner as data URL
    generatedDataURL = canvas.toDataURL('image/png');
    
    return canvas;
  }

  // Public API
  return {
    // Generate a banner with config
    generate: function(userConfig, targetElement) {
      parseConfig(userConfig);
      const canvas = setupCanvas(targetElement);
      if (!canvas) return null;
      
      return render();
    },
    
    // Get the data URL of the last generated banner
    getDataURL: function() {
      return generatedDataURL;
    },
    
    // Download the banner as PNG
    download: function(filename = 'runes-banner.png') {
      if (!generatedDataURL) {
        console.error('No banner has been generated yet');
        return false;
      }
      
      const link = document.createElement('a');
      link.href = generatedDataURL;
      link.download = filename;
      link.click();
      
      return true;
    },
    
    // Get available styles
    getStyles: function() {
      return Object.keys(styles);
    }
  };
})();

// If running in a Node.js environment, export the module
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = NeuralBanner;
} else {
  // If in browser, attach to window
  window.NeuralBanner = NeuralBanner;
} 
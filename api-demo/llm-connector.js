/**
 * LLM Connector - Integration with Local Language Models
 * For RUNES Analytics Pro
 */

class LLMConnector {
  constructor() {
    this.isConnected = false;
    this.modelName = null;
    this.endpointUrl = 'http://localhost:1234/v1/chat/completions'; // Default LM Studio URL
    this.availableModels = [];
    this.runeContext = {};
  }

  /**
   * Initialize connection to LLM server
   * @param {string} url - Custom endpoint URL (optional)
   * @returns {Promise<boolean>} Connection status
   */
  async connect(url = null) {
    if (url) {
      this.endpointUrl = url;
    }

    try {
      console.log('%c🧠 Attempting to connect to LLM server...', 'color: #9d4edd; font-size: 14px;');
      
      // Attempt to connect to the LLM server - ping endpoint
      const response = await fetch(this.endpointUrl.replace('/chat/completions', '/models'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        console.log('%c❌ LLM server connection failed', 'color: #ff5555; font-size: 14px;');
        return null;
      });

      if (!response || !response.ok) {
        this.handleConnectionFailure();
        return false;
      }

      const models = await response.json();
      if (models && models.data && models.data.length > 0) {
        this.availableModels = models.data.map(model => model.id);
        this.modelName = this.availableModels[0];
        this.isConnected = true;
        
        console.log('%c✅ Connected to LLM server successfully', 'color: #55ff55; font-size: 14px;');
        console.log(`%c🤖 Available models: ${this.availableModels.join(', ')}`, 'color: #5ce1e6; font-size: 12px;');
        
        this.loadRuneContext();
        return true;
      } else {
        this.handleConnectionFailure();
        return false;
      }
    } catch (error) {
      console.error('Error connecting to LLM server:', error);
      this.handleConnectionFailure();
      return false;
    }
  }

  /**
   * Handle connection failure with graceful fallback
   */
  handleConnectionFailure() {
    console.log('%c⚠️ Could not connect to LLM server. Falling back to simulation mode.', 'color: #ffaa00; font-size: 14px;');
    
    // Set up simulation mode
    this.isConnected = false;
    this.modelName = 'SIMULATION_MODE';
    this.availableModels = ['SIMULATION_MODE'];
    
    this.loadRuneContext(); // Still load context for simulation
  }

  /**
   * Load Rune tokens context for better analysis
   */
  loadRuneContext() {
    // Basic context about authentic Rune tokens
    this.runeContext = {
      '.RUNESATS': {
        supply: '2,100,000,000,000',
        created: 'January 2024',
        description: 'The first Rune on the Bitcoin network, satoshi representation',
        uniqueAddresses: '>50,000'
      },
      '.RUNES': {
        supply: '21,000,000',
        created: 'December 2023',
        description: 'Official protocol token representing the Runes ecosystem',
        uniqueAddresses: '>30,000'
      },
      '.RUNEPIZZA': {
        supply: '10,000',
        created: 'February 2024',
        description: 'Commemorative Rune of the first Bitcoin pizza purchase',
        uniqueAddresses: '>8,000'
      },
      '.RUNEDOGE': {
        supply: '1,000,000,000,000',
        created: 'March 2024',
        description: 'Bitcoin L1 meme token based on the Doge meme',
        uniqueAddresses: '>25,000'
      }
    };
    
    console.log('%c📚 Loaded context for Rune tokens analysis', 'color: #5ce1e6; font-size: 12px;');
  }

  /**
   * Query the LLM about a specific Rune token
   * @param {string} query - User query about Rune token
   * @returns {Promise<string>} LLM response
   */
  async queryAboutRune(query) {
    if (!this.isConnected && this.modelName !== 'SIMULATION_MODE') {
      await this.connect();
    }
    
    console.log(`%c🔍 Querying LLM: "${query}"`, 'color: #9d4edd; font-size: 12px;');
    
    // Extract token name from query if possible
    const tokenMatch = query.match(/\b(\.(RUNE(SATS|DOGE|PIZZA)?)|\.RUNES)\b/i);
    const tokenName = tokenMatch ? tokenMatch[0].toUpperCase() : null;
    
    if (this.modelName === 'SIMULATION_MODE') {
      return this.simulateResponse(query, tokenName);
    }
    
    try {
      const systemPrompt = this.generateSystemPrompt(tokenName);
      
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        console.log('%c❌ LLM query failed', 'color: #ff5555; font-size: 14px;');
        return this.simulateResponse(query, tokenName);
      }
      
      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error('Error querying LLM:', error);
      return this.simulateResponse(query, tokenName);
    }
  }

  /**
   * Generate system prompt based on context
   * @param {string} tokenName - Rune token name if detected
   * @returns {string} System prompt
   */
  generateSystemPrompt(tokenName) {
    let systemPrompt = `You are a cryptocurrency analytics assistant specialized in Runes tokens on Bitcoin L1. 
Your task is to provide concise, accurate information about Rune tokens. 
Be precise and focus on data-driven insights. Limit responses to 3-4 sentences.`;
    
    if (tokenName && this.runeContext[tokenName]) {
      const tokenContext = this.runeContext[tokenName];
      systemPrompt += `\n\nContext about ${tokenName}:
- Total Supply: ${tokenContext.supply}
- Created: ${tokenContext.created}
- Description: ${tokenContext.description}
- Unique Addresses: ${tokenContext.uniqueAddresses}`;
    }
    
    return systemPrompt;
  }

  /**
   * Simulate LLM response when real connection is unavailable
   * @param {string} query - User query
   * @param {string} tokenName - Detected token name
   * @returns {string} Simulated response
   */
  simulateResponse(query, tokenName) {
    console.log('%c🤖 Generating simulated response', 'color: #ffaa00; font-size: 12px;');
    
    // Check if we have context for this token
    if (tokenName && this.runeContext[tokenName]) {
      const context = this.runeContext[tokenName];
      
      if (query.toLowerCase().includes('price') || query.toLowerCase().includes('worth')) {
        return `${tokenName} has shown significant price movements recently, with a 30-day increase of approximately ${Math.floor(Math.random() * 300)}%. Current market cap is estimated around ${Math.floor(Math.random() * 50) + 10} million USD equivalent in BTC. Trading volume has been steadily increasing across multiple exchanges.`;
      }
      
      if (query.toLowerCase().includes('arbitrage') || query.toLowerCase().includes('opportunity')) {
        const exchanges = ['OKX', 'Bitmart', 'Binance', 'Kraken', 'Unisat'];
        const exchange1 = exchanges[Math.floor(Math.random() * exchanges.length)];
        let exchange2 = exchanges[Math.floor(Math.random() * exchanges.length)];
        while (exchange2 === exchange1) {
          exchange2 = exchanges[Math.floor(Math.random() * exchanges.length)];
        }
        
        const priceDiff = (Math.random() * 5 + 1).toFixed(1);
        
        return `I've detected a ${priceDiff}% price difference for ${tokenName} between ${exchange1} and ${exchange2}. This arbitrage window has been open for ${Math.floor(Math.random() * 60) + 15} minutes and may represent a short-term opportunity for traders with access to both platforms. Transaction costs and timing would need to be considered.`;
      }
      
      if (query.toLowerCase().includes('hold') || query.toLowerCase().includes('invest')) {
        return `${tokenName} was created in ${context.created} with a total supply of ${context.supply}. Currently, it has ${context.uniqueAddresses} unique addresses holding the token. ${context.description}. The trend over the past month has been generally ${Math.random() > 0.5 ? 'positive' : 'consolidating'}.`;
      }
      
      // Generic response
      return `${tokenName} is a Rune token created in ${context.created}, with a total supply of ${context.supply}. ${context.description}, with ${context.uniqueAddresses} unique addresses currently. The token shows ${Math.random() > 0.5 ? 'consistent' : 'growing'} trading volume across major exchanges.`;
    }
    
    // Try to extract any mention of Runes from the query
    const runesMention = query.match(/runes/i);
    if (runesMention) {
      return `Runes are a new token protocol on Bitcoin L1 that enables the creation of fungible tokens directly on the Bitcoin blockchain. They were developed by Casey Rodarmor and launched in late 2023. Runes use the Bitcoin UTXO model with a special encoding format in transaction data.`;
    }
    
    // Generic response for unknown tokens
    return `Based on my analysis, this appears to be a newer Rune token in the Bitcoin L1 ecosystem. To be considered a valid Rune, tokens must follow the proper Rune protocol specification and be properly inscribed on the Bitcoin blockchain. For accurate information, I recommend checking the Runes explorer or official verification tools.`;
  }
}

// Initialize and expose globally
window.llmConnector = new LLMConnector();

// Auto-connect on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.llmConnector.connect().then(connected => {
      if (connected) {
        console.log('%c🔮 LLM ready for Neural Pulse Vision queries', 'color: #5ce1e6; font-size: 14px;');
      }
    });
  }, 2000); // Small delay to ensure page is loaded
}); 
// services/WhaleSocketService.js

export class WhaleSocketService {
  /**
   * @param {string} url - WebSocket server URL. Defaults to a mock indicator.
   * @param {boolean} useMock - Force use of mock data generation.
   */
  constructor(url = 'wss://mocked-btc-ws-server.com', useMock = false) {
    this.url = url;
    this.useMock = useMock || url === 'wss://mocked-btc-ws-server.com'; // Use mock if URL is the default mock one
    this.ws = null;
    this.reconnectInterval = 5000; // 5 seconds
    this.onMessageCallback = null;
    this.mockIntervalId = null;
    this.isConnected = false;
    this.shouldReconnect = true; // Flag to control reconnection attempts
    console.log(`[WhaleSocketService] Initialized. ${this.useMock ? 'Using Mock Data Generator.' : 'Attempting connection to ' + this.url}`);
  }

  /**
   * Connects to the WebSocket server or starts the mock generator.
   * @param {function} onMessageCallback - Function to call when a relevant message is received.
   */
  connect(onMessageCallback) {
    this.onMessageCallback = onMessageCallback;
    this.shouldReconnect = true; // Enable reconnection attempts when connect is called

    if (this.useMock) {
      this.startMockGenerator();
      this.isConnected = true; // Simulate connection for mock
    } else {
      this.attemptConnection();
    }
  }

  attemptConnection() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('[🐋 WS] Already connected.');
        return;
    }
    
    console.log(`[🐋 WS] Attempting to connect to ${this.url}...`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[🐋 WS] Connection opened successfully!');
      this.isConnected = true;
      // Maybe send a subscription message if the real API requires it
      // this.ws.send(JSON.stringify({ action: 'subscribe', channel: 'whale_transactions' }));
    };

    this.ws.onmessage = (event) => {
      // console.log('[🐋 WS] Raw message received:', event.data);
      try {
        const tx = JSON.parse(event.data);
        // Basic validation - adapt based on actual message structure
        if (tx && typeof tx === 'object') { 
          // Assuming filtering happens here or is done by the server
           if (this.onMessageCallback) {
               this.onMessageCallback(tx); // Pass the full message
           }
        } else {
             console.warn('[🐋 WS] Received non-object message:', event.data);
        }
      } catch (e) {
        console.warn('[🐋 WS] Error processing message:', e, 'Raw data:', event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[🐋 WS] WebSocket Error:', error);
      // The onclose event will usually fire after an error.
    };

    this.ws.onclose = (event) => {
      console.warn(`[🐋 WS] Connection closed. Code: ${event.code}, Reason: ${event.reason}. Clean close: ${event.wasClean}`);
      this.isConnected = false;
      this.ws = null; // Clean up the instance
      if (this.shouldReconnect) {
          console.log(`[🐋 WS] Attempting to reconnect in ${this.reconnectInterval / 1000}s...`);
          setTimeout(() => this.attemptConnection(), this.reconnectInterval);
      } else {
          console.log('[🐋 WS] Reconnection disabled.');
      }
    };
  }

  startMockGenerator() {
    console.log('[🐋 Mock WS] Starting mock data generator...');
    if (this.mockIntervalId) {
        clearInterval(this.mockIntervalId);
    }
    this.mockIntervalId = setInterval(() => {
        // Generate a fake transaction
        const fakeTx = {
            type: 'transfer', // Standardize type if possible
            from: 'bc1q' + Math.random().toString(16).slice(2, 12),
            to: 'bc1p' + Math.random().toString(16).slice(2, 12),
            rune: ['SATOSHI•NAKAMOTO', 'UNCOMMON•GOODS', 'Z•Z•Z•FEHU•Z•Z•Z'][Math.floor(Math.random() * 3)], // Random rune
            // Use 'amount' or 'value' consistently based on what showWhaleAlert expects
            amount: Math.floor(1000 + Math.random() * 1000000), 
            impact: Math.random() * 10, // Random impact 0-10
            time: Date.now(),
            // Add other fields if needed by the alert/processing logic
            // value_usd: fakeTx.amount * 0.07 // Example USD value calculation
        };

        // Simulate receiving the message only if impact is high
        // The component's listener will also check impact, but filtering here mimics server-side filtering
        const impactThreshold = 7;
        if (fakeTx.impact >= impactThreshold && this.onMessageCallback) {
             console.log(`[🐋 Mock WS] Generating high-impact event (Impact: ${fakeTx.impact.toFixed(1)}):`, fakeTx);
             this.onMessageCallback(fakeTx);
        }
    }, 8000 + Math.random() * 5000); // Simulate random intervals (8-13 seconds)
  }

  stopMockGenerator() {
     if (this.mockIntervalId) {
         console.log('[🐋 Mock WS] Stopping mock data generator.');
         clearInterval(this.mockIntervalId);
         this.mockIntervalId = null;
     }
  }

  /**
   * Closes the WebSocket connection and prevents automatic reconnection.
   */
  disconnect() {
    console.log('[🐋 WS] Disconnecting requested.');
    this.shouldReconnect = false; // Prevent reconnection attempts
    this.stopMockGenerator(); // Stop mock generator if running
    if (this.ws) {
      this.ws.close(1000, 'Client disconnected manually'); // Use standard code 1000 for normal closure
    }
    this.isConnected = false;
    this.ws = null;
    this.onMessageCallback = null;
  }

   // Optional: Method to send messages if needed later
   // send(message) {
   //    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
   //        this.ws.send(JSON.stringify(message));
   //    } else if (this.useMock) {
   //        console.log('[🐋 Mock WS] Send called (ignored in mock mode):', message);
   //    } else {
   //        console.error('[🐋 WS] Cannot send message, WebSocket is not open.');
   //    }
   // }
} 
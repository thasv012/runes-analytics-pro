import { mockInteractions } from '../data/mock-interactions.js';

// Assumes global translate function (e.g., window.translate)
const translate = window.translate || function(key, lang, replacements = {}) { 
    console.warn('[WhaleSim] Global translate function not found.'); return key; 
};

export class WhaleTrackerSimulator {
    constructor(parentElement, language) {
        this.parent = parentElement;
        this.language = language;
        this.feedElement = null;
        this.terminalCodeElement = null;
        this.feedInterval = null;
        this.terminalTimeout = null;
        this.feedItems = [];
        this.currentFeedIndex = 0;
        this.isTerminalAnimating = false;

        this.init();
    }

    init() {
        this.parent.innerHTML = ''; // Clear previous content
        this.createFeedList();
        this.createTerminalBox();
        this.loadInitialFeed();
        this.startSimulation();
    }

    createFeedList() {
        const data = mockInteractions.whaleTracker;
        if (data.feed_i18n) {
            this.feedElement = document.createElement('ul');
            this.feedElement.className = 'feed';
            this.parent.appendChild(this.feedElement);
        }
    }

    createTerminalBox() {
        const terminalBox = document.createElement('div');
        terminalBox.className = 'terminal-box';
        this.terminalCodeElement = document.createElement('code');
        terminalBox.appendChild(this.terminalCodeElement);
        this.parent.appendChild(terminalBox);
    }

    loadInitialFeed() {
        const data = mockInteractions.whaleTracker;
        if (data.feed_i18n) {
             // Assuming translate returns the array for the feed
            this.feedItems = translate(data.feed_i18n, this.language) || [];
            this.currentFeedIndex = 0; // Start from the beginning
            // Display initial items immediately if needed, or wait for interval
            // this.addFeedItem(); // Example: Add one immediately
        }
    }

    addFeedItem() {
        if (!this.feedElement || this.feedItems.length === 0) return;

        const itemText = this.feedItems[this.currentFeedIndex % this.feedItems.length];
        const li = document.createElement('li');
        li.innerHTML = itemText; // Use innerHTML for icons/HTML
        li.style.opacity = 0;
        
        // Add to top and limit list length (e.g., 10 items)
        this.feedElement.insertBefore(li, this.feedElement.firstChild);
        while (this.feedElement.children.length > 10) {
            this.feedElement.removeChild(this.feedElement.lastChild);
        }

        // Fade in animation
        requestAnimationFrame(() => {
            li.style.transition = 'opacity 0.5s ease';
            li.style.opacity = 1;
        });

        this.currentFeedIndex++;
    }

    animateTerminal() {
        if (this.isTerminalAnimating || !this.terminalCodeElement) return;
        this.isTerminalAnimating = true;
        
        // Clear previous timeouts
        if (this.terminalTimeout) clearTimeout(this.terminalTimeout);

        this.terminalCodeElement.innerHTML = ''; // Clear previous animation
        console.log('[WhaleSim] Animating terminal');
        const terminalData = mockInteractions.whaleTracker.terminal;

        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = terminalData.command + '\n';
        this.terminalCodeElement.appendChild(prompt);

        const lines = [];
        lines.push({ 
            text: translate(terminalData.monitoring_i18n, this.language) + '\n',
            delay: 500
        });

        let accumulatedDelay = 500;
        const activityPrefix = terminalData.activity_i18n_prefix;
        let i = 1;
        while (true) {
            const lineKey = `${activityPrefix}.line${i}`;
            const lineText = translate(lineKey, this.language);
            if (lineText === lineKey) break; 
            accumulatedDelay += 600; // Stagger subsequent lines
            lines.push({ text: lineText + '\n', delay: accumulatedDelay });
            i++;
        }

        // Add lines one by one using timeouts
        let timeoutChain = Promise.resolve();
        lines.forEach(line => {
            timeoutChain = timeoutChain.then(() => {
                 return new Promise(resolve => {
                     this.terminalTimeout = setTimeout(() => {
                         const lineSpan = document.createElement('span');
                         lineSpan.className = 'output-line';
                         lineSpan.innerHTML = line.text;
                         this.terminalCodeElement.appendChild(lineSpan);
                         // Auto-scroll terminal
                         this.terminalCodeElement.parentElement.scrollTop = this.terminalCodeElement.parentElement.scrollHeight;
                         resolve();
                     }, line.delay - (lines.indexOf(line) > 0 ? lines[lines.indexOf(line) - 1].delay : 0)); // Relative delay
                 });
            });
        });
        
        timeoutChain.then(() => {
            this.isTerminalAnimating = false; 
            console.log('[WhaleSim] Terminal animation finished');
        });
    }

    startSimulation() {
        this.stopSimulation(); // Clear existing intervals/timeouts
        // Add new feed items periodically
        this.feedInterval = setInterval(() => this.addFeedItem(), 4000); // Add item every 4 seconds
        // Start terminal animation
        this.animateTerminal();
    }

    stopSimulation() {
        if (this.feedInterval) clearInterval(this.feedInterval);
        if (this.terminalTimeout) clearTimeout(this.terminalTimeout);
        this.isTerminalAnimating = false;
        console.log('[WhaleSim] Simulation stopped');
    }

    setLanguage(lang) {
        this.language = lang;
        // Reload feed items with new language
        this.loadInitialFeed(); 
        // Clear existing displayed feed items
        if(this.feedElement) this.feedElement.innerHTML = ''; 
        // Restart terminal animation with new language
        this.isTerminalAnimating = false; // Allow re-animation
        this.animateTerminal();
    }
    
    // Optional: Call this when the simulation is hidden to save resources
    deactivate() {
        this.stopSimulation();
    }
    
    // Optional: Call this when the simulation is shown again
    activate() {
        // Restart simulation if needed, maybe only if it was stopped for a while
        this.startSimulation();
    }
} 
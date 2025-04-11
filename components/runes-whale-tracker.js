/**
 * RUNES Analytics Pro - Componente de Rastreamento de Baleias
 * Responsável por monitorar e visualizar movimentos de grandes investidores (baleias) no mercado de RUNES
 * Oferece visualizações avançadas e alertas para movimentos significativos
 */

// --- NEW: Import RunesApiService --- 
// Assuming RunesApiService is accessible, adjust path if needed
// Make sure this file can use ES Modules or adapt import syntax
import RunesApiService from '../services/RunesApiService.js';
import { WhaleSocketService } from '../services/WhaleSocketService.js'; // Import the WebSocket service
// Assuming a translate function exists globally or via import
// import { translate } from './i18n.js'; // Example import
const translate = (key, fallback) => (typeof window.translate === 'function' ? window.translate(key, fallback) : fallback || key);

// Placeholder for global functions if needed - Replace with actual imports/references
const updateTopWhalesList = () => console.log("Placeholder: updateTopWhalesList called");

// Assuming WhaleSocketService is globally available via window or imported
// Adjust if needed based on your project setup
const WhaleSocketService = window.WhaleSocketService; 

class WhaleSocketService {
    constructor() {
        this.socket = null;
        this.isSocketConnected = false;
        this.messageCallback = null;
    }

    connect(url, messageCallback) {
        this.socket = new WebSocket(url);
        this.messageCallback = messageCallback;

        this.socket.onopen = () => {
            console.log("WebSocket conectado");
            this.isSocketConnected = true;
        };

        this.socket.onclose = () => {
            console.log("WebSocket desconectado");
            this.isSocketConnected = false;
        };

        this.socket.onmessage = (message) => {
            this.messageCallback(message);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    toggleConnection() {
        if (this.isSocketConnected) {
            this.disconnect();
        } else {
            this.connect();
        }
    }
}

class RunesWhaleTracker {
    constructor() {
        this.socketService = new WhaleSocketService();
        this.eventHistory = JSON.parse(localStorage.getItem("whaleEventHistory")) || [];
        this.debounceTimer = null;
    }

    init() {
        this.renderBaseStructure();
        this.setupEventListeners();
        this.loadHistory();
        this.connectSocket();
    }

    renderBaseStructure() {
        const container = document.querySelector("#whale-events-panel-container");
        container.innerHTML = `
            <div id="whale-events-panel">
                <h2>Feed de Eventos de Baleias</h2>
                <ul id="event-feed-list"></ul>
            </div>
            <button id="toggle-socket-btn" title="Pausar Feed Ao Vivo">⏸️ Pausar Ao Vivo</button>
        `;
    }

    appendTransactionToPanel(transaction) {
        const eventFeedList = document.querySelector("#event-feed-list");
        const li = document.createElement("li");
        li.classList.add("event-item");
        li.setAttribute('data-impact-level', transaction.impact);

        const content = `
            <strong>${transaction.token}</strong> moveu <span>${transaction.amount}</span> às ${transaction.timestamp}
            <div class="impact-level">Impacto: ${transaction.impact}</div>
        `;
        li.innerHTML = content;
        eventFeedList.appendChild(li);

        this.saveEventToHistory(transaction);
    }

    loadHistory() {
        const eventFeedList = document.querySelector("#event-feed-list");
        this.eventHistory.forEach(transaction => {
            const li = document.createElement("li");
            li.classList.add("event-item");
            li.setAttribute('data-impact-level', transaction.impact);

            const content = `
                <strong>${transaction.token}</strong> moveu <span>${transaction.amount}</span> às ${transaction.timestamp}
                <div class="impact-level">Impacto: ${transaction.impact}</div>
            `;
            li.innerHTML = content;
            eventFeedList.appendChild(li);
        });
    }

    saveEventToHistory(transaction) {
        this.eventHistory.push(transaction);
        if (this.eventHistory.length > 25) {
            this.eventHistory.shift();
        }
        localStorage.setItem("whaleEventHistory", JSON.stringify(this.eventHistory));
    }

    connectSocket() {
        this.socketService.connect("wss://example.com/socket", (message) => this.socketMessageCallback(message));
    }

    disconnectSocket() {
        this.socketService.disconnect();
    }

    toggleSocketConnection() {
        this.socketService.toggleConnection();
    }

    updateToggleButton() {
        const button = document.querySelector("#toggle-socket-btn");
        if (this.socketService.isSocketConnected) {
            button.textContent = "⏸️ Pausar Ao Vivo";
            button.title = "Pausar Feed Ao Vivo";
        } else {
            button.textContent = "▶️ Retomar Ao Vivo";
            button.title = "Retomar Feed Ao Vivo";
        }
    }

    scheduleHolderRefresh() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            console.log("Atualização do holder agendada...");
            // Placeholder: Chame o método para atualizar a lista de holders de baleias.
        }, 15000); // Debounce de 15 segundos
    }

    socketMessageCallback(message) {
        const transaction = JSON.parse(message.data);
        this.appendTransactionToPanel(transaction);
        if (transaction.impact >= 7) {
            console.log("Transação de alto impacto detectada. Agendando atualização de holders...");
            this.scheduleHolderRefresh();
        }
    }

    showWhaleAlert(transaction) {
        const impact = transaction.impact;
        if (impact >= 7) {
            console.log("Alerta de Baleia:", transaction);
            if (window.runesSoundManager) {
                window.runesSoundManager.play("whaleAlertSound");
            }
            if (window.TourAnalytics) {
                window.TourAnalytics.log({ type: "whaleAlert", transaction });
            }
        }
    }

    setupEventListeners() {
        const toggleButton = document.querySelector("#toggle-socket-btn");
        toggleButton.addEventListener("click", () => this.toggleSocketConnection());
    }

    destroy() {
        if (this.socketService.socket) {
            this.socketService.socket.close();
        }
        console.log("Conexão WebSocket fechada.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const whaleTracker = new RunesWhaleTracker();
    whaleTracker.init();
});

// Importar componentes (serão implementados depois)
// import MarketDataCharts from "./components/MarketDataCharts.js";
// import WhaleTracker from "./components/WhaleTracker.js";
// import RunesRanking from "./components/RunesRanking.js";
// import AlertSystem from "./components/AlertSystem.js";
// import SentimentAnalysis from "./components/SentimentAnalysis.js";

// Estado global da aplicação
const appState = {
    currentSection: "dashboard",
    darkMode: true, // Tema escuro por padrão
    selectedRune: "ORDI", // Rune padrão selecionada
    timeframe: "1D"
};

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", () => {
    console.log("Inicializando o Runes Analytics Pro...");
    initializeNavigation();
    initializeThemeToggle();
    initializeAlertModal();
    mockChartData();
});

// Configuração da navegação
function initializeNavigation() {
    // Mudar de seção ao clicar nos links do menu
    const navLinks = document.querySelectorAll(".main-nav a");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            changeSection(targetId);
        });
    });
}

// Alternar entre seções
function changeSection(sectionId) {
    // Atualizar o estado
    appState.currentSection = sectionId;
    
    // Atualizar links ativos
    const navLinks = document.querySelectorAll(".main-nav a");
    navLinks.forEach(link => {
        const linkTarget = link.getAttribute("href").substring(1);
        link.classList.toggle("active", linkTarget === sectionId);
    });
    
    // Mostrar apenas a seção selecionada
    const sections = document.querySelectorAll(".section");
    sections.forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });
    
    console.log(`Mudou para a seção: ${sectionId}`);
}

// Alternância de tema (claro/escuro)
function initializeThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            appState.darkMode = !appState.darkMode;
            document.body.classList.toggle("light-mode", !appState.darkMode);
            updateThemeIcon();
        });
        
        // Inicializar ícone correto
        updateThemeIcon();
    }
}

function updateThemeIcon() {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.innerHTML = appState.darkMode 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

// Inicialização do modal de alertas
function initializeAlertModal() {
    const newAlertBtn = document.getElementById("new-alert-btn");
    const alertModal = document.getElementById("alert-modal");
    const closeModal = document.querySelector(".close-modal");
    const cancelBtn = document.querySelector(".btn-cancel");
    
    if (newAlertBtn && alertModal) {
        newAlertBtn.addEventListener("click", () => {
            alertModal.classList.add("active");
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            alertModal.classList.remove("active");
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            alertModal.classList.remove("active");
        });
    }
    
    // Fechar modal ao clicar fora dele
    window.addEventListener("click", (e) => {
        if (e.target === alertModal) {
            alertModal.classList.remove("active");
        }
    });
    
    // Capturar envio do formulário
    const alertForm = document.getElementById("new-alert-form");
    if (alertForm) {
        alertForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Aqui seria implementada a lógica de criação de alerta
            console.log("Alerta criado!");
            alertModal.classList.remove("active");
            
            // Mostrar uma notificação de sucesso
            showNotification("Alerta criado com sucesso!", "success");
        });
    }
}

// Função para exibir notificações
function showNotification(message, type = "info") {
    const alertsContainer = document.getElementById("alerts-container");
    if (!alertsContainer) return;
    
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === "success" ? "fa-check-circle" : "fa-info-circle"}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    alertsContainer.appendChild(notification);
    
    // Configurar botão de fechar
    const closeBtn = notification.querySelector(".notification-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            notification.remove();
        });
    }
    
    // Auto remover após 5 segundos
    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Mockup de dados para os gráficos (temporário)
function mockChartData() {
    // Verificar se os elementos existem
    const mainChart = document.getElementById("main-chart");
    if (!mainChart) return;
    
    // Desenhar um gráfico simples usando Canvas
    const ctx = document.createElement("canvas");
    ctx.width = mainChart.offsetWidth;
    ctx.height = mainChart.offsetHeight;
    mainChart.appendChild(ctx);
    
    const chart = ctx.getContext("2d");
    
    // Desenhar eixos
    chart.strokeStyle = "#a2a9b4";
    chart.lineWidth = 1;
    
    // Eixo X
    chart.beginPath();
    chart.moveTo(50, ctx.height - 50);
    chart.lineTo(ctx.width - 50, ctx.height - 50);
    chart.stroke();
    
    // Eixo Y
    chart.beginPath();
    chart.moveTo(50, 50);
    chart.lineTo(50, ctx.height - 50);
    chart.stroke();
    
    // Dados mockup
    const data = generateRandomData(20);
    const maxData = Math.max(...data);
    const minData = Math.min(...data);
    const dataRange = maxData - minData;
    
    // Calcular escala
    const xStep = (ctx.width - 100) / (data.length - 1);
    const yScale = (ctx.height - 100) / (dataRange || 1);
    
    // Desenhar linha de preço
    chart.strokeStyle = "#3498db";
    chart.lineWidth = 2;
    chart.beginPath();
    
    // Primeiro ponto
    let x = 50;
    let y = ctx.height - 50 - (data[0] - minData) * yScale;
    chart.moveTo(x, y);
    
    // Restante dos pontos
    for (let i = 1; i < data.length; i++) {
        x += xStep;
        y = ctx.height - 50 - (data[i] - minData) * yScale;
        chart.lineTo(x, y);
    }
    
    chart.stroke();
    
    // Área sob a linha
    chart.fillStyle = "rgba(52, 152, 219, 0.2)";
    chart.lineTo(x, ctx.height - 50);
    chart.lineTo(50, ctx.height - 50);
    chart.closePath();
    chart.fill();
    
    // Desenhar pontos
    chart.fillStyle = "#3498db";
    for (let i = 0; i < data.length; i++) {
        x = 50 + i * xStep;
        y = ctx.height - 50 - (data[i] - minData) * yScale;
        
        chart.beginPath();
        chart.arc(x, y, 3, 0, Math.PI * 2);
        chart.fill();
    }
    
    console.log("Mockup do gráfico principal criado");
    
    // Tentar inicializar outros gráficos se os elementos existirem
    mockSecondaryCharts();
}

// Gerar dados aleatórios para os gráficos mockup
function generateRandomData(count, base = 100, volatility = 10) {
    const data = [];
    let value = base;
    
    for (let i = 0; i < count; i++) {
        // Adicionar ruído aleatório
        value += (Math.random() - 0.5) * volatility;
        
        // Garantir que não fique negativo
        value = Math.max(value, 1);
        
        data.push(value);
    }
    
    return data;
}

// Mockup para os gráficos secundários
function mockSecondaryCharts() {
    const sentimentGauge = document.getElementById("sentiment-gauge");
    if (sentimentGauge) {
        // Desenhar um gauge simples
        const ctx = document.createElement("canvas");
        ctx.width = 140;
        ctx.height = 140;
        sentimentGauge.appendChild(ctx);
        
        const gauge = ctx.getContext("2d");
        
        // Arco do fundo
        gauge.beginPath();
        gauge.arc(70, 70, 60, Math.PI, 2 * Math.PI);
        gauge.lineWidth = 10;
        gauge.strokeStyle = "rgba(255, 255, 255, 0.1)";
        gauge.stroke();
        
        // Valor (65%)
        gauge.beginPath();
        gauge.arc(70, 70, 60, Math.PI, Math.PI + (65/100) * Math.PI);
        gauge.lineWidth = 10;
        gauge.strokeStyle = "#2ecc71"; // Verde
        gauge.stroke();
        
        // Círculo central
        gauge.beginPath();
        gauge.arc(70, 70, 5, 0, 2 * Math.PI);
        gauge.fillStyle = "#f0f4f8";
        gauge.fill();
        
        console.log("Mockup do gauge de sentimento criado");
    }
    
    // Aqui seria adicionado mais mockups para outros gráficos
}

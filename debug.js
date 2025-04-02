// Script de diagnóstico para encontrar problemas de carregamento
console.log("=== DIAGNÓSTICO DE CARREGAMENTO ===");

// Verificar se estamos em um módulo ES
console.log("Executando em modo módulo:", typeof import === 'function');

// Verificar paths
console.log("Caminhos absolutos:");
console.log("location.origin:", location.origin);
console.log("Caminho completo:", location.href);

// Listar módulos carregados
setTimeout(() => {
    console.log("=== VERIFICAÇÃO DE ELEMENTOS ===");
    console.log("Seção de alertas:", document.getElementById('alerts') ? "Encontrada" : "Não encontrada");
    console.log("Container de alertas:", document.getElementById('alerts-container') ? "Encontrado" : "Não encontrado");
    
    // Verificar erros no console
    if (window.onerror) {
        console.log("Erros capturados:", window.onerror);
    }
}, 1000);

// Tentar carregar os módulos manualmente
setTimeout(async () => {
    console.log("=== TENTATIVA DE CARREGAMENTO MANUAL ===");
    try {
        const alertServiceModule = await import('./services/alertService.js');
        console.log("alertService carregado:", alertServiceModule.default ? "Sim" : "Não");
    } catch (error) {
        console.error("Erro ao carregar alertService:", error);
    }
    
    try {
        const runesDataServiceModule = await import('./services/runesDataService.js');
        console.log("runesDataService carregado:", runesDataServiceModule.default ? "Sim" : "Não");
    } catch (error) {
        console.error("Erro ao carregar runesDataService:", error);
    }
    
    try {
        const alertPanelModule = await import('./components/AlertPanel.js');
        console.log("AlertPanel carregado:", alertPanelModule.default ? "Sim" : "Não");
    } catch (error) {
        console.error("Erro ao carregar AlertPanel:", error);
    }
}, 2000);

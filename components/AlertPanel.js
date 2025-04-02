class AlertPanel {
    constructor(containerId, alertService, runesDataService) {
        this.container = document.getElementById(containerId);
        this.alertService = alertService;
        this.runesDataService = runesDataService;
        
        console.log("AlertPanel inicializado");
        this.render();
    }

    render() {
        if (!this.container) {
            console.error("Container de alertas não encontrado");
            return;
        }
        
        this.container.innerHTML = `
            <div class="alert-dashboard">
                <h3>Sistema de Alertas RUNES</h3>
                <div class="alert-content">
                    <p>Painel de alertas carregado com sucesso.</p>
                    <div class="alert-item high">
                        <div class="alert-header">
                            <span class="alert-token">ORDI</span>
                            <span class="alert-type">Movimento de Preço</span>
                            <span class="alert-status status-active">Ativo</span>
                        </div>
                        <div class="alert-body">
                            <h4 class="alert-title">Alta de 15% em 1h</h4>
                            <p class="alert-message">ORDI subiu mais de 15% na última hora.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log("Renderização do AlertPanel concluída");
    }
}

console.log("AlertPanel.js carregado");
export default AlertPanel;

// Arquivo de entrada para inicializar os componentes usando ES modules
import RunesRanking from './RunesRanking.js';

// Inicializar os componentes quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando componentes via ES modules...');
    
    // Inicializar componente de ranking
    const rankingContainer = document.getElementById('ranking-container');
    if (rankingContainer) {
        window.runesRanking = new RunesRanking('ranking-container');
        console.log('Componente de ranking inicializado com sucesso');
    }
});

// Expor classes para uso global se necessário
window.RunesRanking = RunesRanking;
// Função para corrigir o erro destroy()
// Copie esta função para substituir a função destroy() em app.js
function destroyRunesRanking() {
    console.log('Destruindo componente RunesRanking...');

    // Remover event listeners para evitar memory leaks
    const metricSelect = document.getElementById('metric-select');
    const sortAscBtn = document.getElementById('sort-asc');
    const sortDescBtn = document.getElementById('sort-desc');
    const tableViewBtn = document.getElementById('table-view');
    const gridViewBtn = document.getElementById('grid-view');

    if (metricSelect) metricSelect.removeEventListener('change', window.handleMetricChange);
    if (sortAscBtn) sortAscBtn.removeEventListener('click', window.handleSortAsc);
    if (sortDescBtn) sortDescBtn.removeEventListener('click', window.handleSortDesc);
    if (tableViewBtn) tableViewBtn.removeEventListener('click', window.handleTableView);
    if (gridViewBtn) gridViewBtn.removeEventListener('click', window.handleGridView);

    // Limpar quaisquer timers ou WebSockets
    if (window.realtimeInterval) {
        clearInterval(window.realtimeInterval);
        window.realtimeInterval = null;
    }
}

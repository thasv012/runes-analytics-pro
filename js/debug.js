// Ferramenta de diagnóstico para depuração
console.log('Ferramenta de diagnóstico carregada');

document.addEventListener('DOMContentLoaded', () => {
    // Listar todas as seções disponíveis
    console.log('--- Seções disponíveis ---');
    document.querySelectorAll('section').forEach(section => {
        console.log(`Seção: ${section.id}, Classes: ${section.className}, Visível: ${!section.classList.contains('hidden')}`);
    });
    
    // Monitorar cliques em toda a página
    document.addEventListener('click', (event) => {
        console.log('Clique detectado:', event.target);
    });
    
    // Adicionar auxiliar visual temporário
    const helpBtn = document.createElement('button');
    helpBtn.textContent = '🔍 Debug';
    helpBtn.style.position = 'fixed';
    helpBtn.style.bottom = '20px';
    helpBtn.style.right = '20px';
    helpBtn.style.zIndex = '9999';
    helpBtn.style.background = '#3498db';
    helpBtn.style.color = 'white';
    helpBtn.style.border = 'none';
    helpBtn.style.borderRadius = '4px';
    helpBtn.style.padding = '8px 12px';
    
    helpBtn.addEventListener('click', () => {
        document.querySelectorAll('section').forEach(section => {
            console.log(`Alternando visibilidade da seção: ${section.id}`);
            section.classList.toggle('debug-highlight');
        });
    });
    
    document.body.appendChild(helpBtn);
});

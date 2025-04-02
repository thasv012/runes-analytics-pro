// Manipulação de Links e Navegação
document.addEventListener('DOMContentLoaded', () => {
    // Conectar todos os links de "Sistema de Alertas"
    const alertsLinks = document.querySelectorAll('a[href="#alerts"], .content-link, a:contains("Sistema de Alertas")');
    
    alertsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('alerts');
        });
    });
    
    // Conectar links de "Maiores Movimentações"
    const movimentosLinks = document.querySelectorAll('.movimento-link, a:contains("Maiores Movimenta")');
    movimentosLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('movimentos');
        });
    });
    
    // Conectar links de "Análise Social"
    const socialLinks = document.querySelectorAll('.social-link, a:contains("Análise Social")');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('social');
        });
    });
    
    // Função para mostrar uma seção específica
    function showSection(sectionId) {
        // Ocultar todas as seções
        document.querySelectorAll('main > section, section#alerts, section#social, section#movimentos').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Mostrar a seção desejada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log(`Seção ${sectionId} ativada`);
        } else {
            console.warn(`Seção ${sectionId} não encontrada`);
        }
    }
    
    // Ativar qualquer elemento com a classe "clickable"
    document.querySelectorAll('.clickable').forEach(element => {
        element.addEventListener('click', () => {
            const targetId = element.dataset.target;
            if (targetId) {
                showSection(targetId);
            }
        });
    });
});

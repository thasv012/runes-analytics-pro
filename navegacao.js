// Arquivo para gerenciar a navegação entre seções
console.log("Carregando módulo de navegação...");

// Função principal para navegar entre seções
function toggleSections(sectionId) {
    console.log(`Tentando alternar para seção: ${sectionId}`);
    
    try {
        // 1. Selecionar todas as seções
        const allSections = document.querySelectorAll('section');
        console.log(`Encontradas ${allSections.length} seções no total`);
        
        // 2. Ocultar todas as seções primeiro
        allSections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
        // 3. Mostrar a seção selecionada
        const targetSection = document.getElementById(sectionId);
        
        if (targetSection) {
            console.log(`Seção ${sectionId} encontrada, ativando...`);
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
        } else {
            console.error(`Seção ${sectionId} não encontrada!`);
            // Fallback para o dashboard
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.style.display = 'block';
                dashboard.classList.add('active');
            }
        }
        
        // 4. Atualizar os links de navegação
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Verificar se o link corresponde à seção atual
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.includes(sectionId)) {
                link.classList.add('active');
            }
        });
        
        // 5. Atualizar o estado da aplicação
        if (window.appState) {
            window.appState.currentSection = sectionId;
        }
        
        console.log(`Navegação para ${sectionId} concluída com sucesso`);
    } catch (error) {
        console.error(`Erro ao navegar para ${sectionId}:`, error);
    }
}

// Inicializar navegação na carga da página
document.addEventListener('DOMContentLoaded', function() {
    console.log("Configurando eventos de navegação...");
    
    // Adicionar eventos de clique aos links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1); // Remover o #
                toggleSections(sectionId);
            }
        });
    });
    
    // Iniciar com a seção dashboard ativa
    toggleSections('dashboard');
});

// Tornar a função disponível globalmente
window.toggleSections = toggleSections;
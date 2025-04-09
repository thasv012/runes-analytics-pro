/**
 * Demo Navigation System
 * Gerencia a navegação entre seções, featurers e animações de transição
 * na página de demonstração do RUNES Analytics Pro
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeDemoNavigation();
});

// Configuração das seções de navegação
const demoSections = [
    { id: 'video-tour', name: 'Video Tour' },
    { id: 'interactive-tour', name: 'Interactive Tour' },
    { id: 'runecards-showcase', name: 'RuneCards' },
    { id: 'platform-access', name: 'Platform Access' }
];

// Configuração das features na seção interativa
const interactiveFeatures = [
    { id: 'feature-dashboard', name: 'Dashboard Analytics' },
    { id: 'feature-market-data', name: 'Market Data' },
    { id: 'feature-whale-tracker', name: 'Whale Tracker' },
    { id: 'feature-rune-scanner', name: 'Rune Scanner' },
    { id: 'feature-price-alerts', name: 'Price Alerts' },
    { id: 'feature-portfolio', name: 'Portfolio Manager' }
];

function initializeDemoNavigation() {
    // Inicializar navegação entre seções
    setupSectionNavigation();
    
    // Inicializar navegação entre features
    setupFeatureNavigation();
    
    // Adicionar event listeners para botões de subida
    document.querySelectorAll('.back-to-top').forEach(button => {
        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
    
    // Inicializar botões de ação especiais
    setupActionButtons();
    
    console.log('Demo navigation initialized successfully');
}

function setupSectionNavigation() {
    // Adicionar listeners para botões de navegação entre seções
    document.querySelectorAll('[data-navigate-to]').forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-navigate-to');
            navigateToSection(targetSection);
        });
    });
}

function navigateToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        // Adicionar animação de fade-in
        targetSection.classList.add('fade-in-section');
        
        // Rolar até a seção
        targetSection.scrollIntoView({
            behavior: 'smooth'
        });
        
        // Remover classe de animação após completar
        setTimeout(() => {
            targetSection.classList.remove('fade-in-section');
        }, 1000);
    }
}

function setupFeatureNavigation() {
    const prevFeatureBtn = document.getElementById('prev-feature');
    const nextFeatureBtn = document.getElementById('next-feature');
    let currentFeatureIndex = 0;
    
    if (prevFeatureBtn && nextFeatureBtn) {
        // Mostrar a primeira feature
        showFeature(currentFeatureIndex);
        
        // Configurar navegação para trás
        prevFeatureBtn.addEventListener('click', () => {
            currentFeatureIndex = (currentFeatureIndex - 1 + interactiveFeatures.length) % interactiveFeatures.length;
            showFeature(currentFeatureIndex);
        });
        
        // Configurar navegação para frente
        nextFeatureBtn.addEventListener('click', () => {
            currentFeatureIndex = (currentFeatureIndex + 1) % interactiveFeatures.length;
            showFeature(currentFeatureIndex);
        });
    }
}

function showFeature(index) {
    // Esconder todas as features
    interactiveFeatures.forEach(feature => {
        const featureElement = document.getElementById(feature.id);
        if (featureElement) {
            featureElement.style.display = 'none';
        }
    });
    
    // Mostrar a feature selecionada
    const selectedFeature = interactiveFeatures[index];
    const selectedElement = document.getElementById(selectedFeature.id);
    
    if (selectedElement) {
        // Animar entrada da feature
        selectedElement.style.display = 'block';
        selectedElement.classList.add('feature-animate-in');
        
        // Atualizar título da feature atual
        const featureTitle = document.getElementById('current-feature-title');
        if (featureTitle) {
            featureTitle.textContent = selectedFeature.name;
        }
        
        // Remover classe de animação após completar
        setTimeout(() => {
            selectedElement.classList.remove('feature-animate-in');
        }, 500);
    }
}

function setupActionButtons() {
    // Botão "Explore More" - Leva para a seção de RuneCards
    const exploreMoreBtn = document.getElementById('explore-more-btn');
    if (exploreMoreBtn) {
        exploreMoreBtn.addEventListener('click', () => {
            navigateToSection('runecards-showcase');
        });
    }
    
    // Botão "Meet Bootoshi" - Abre modal ou seção relacionada
    const meetBootoshiBtn = document.getElementById('meet-bootoshi-btn');
    if (meetBootoshiBtn) {
        meetBootoshiBtn.addEventListener('click', () => {
            // Se houver um modal ou seção específica
            const bootoshiModal = document.getElementById('bootoshi-modal');
            if (bootoshiModal) {
                bootoshiModal.classList.add('show');
            } else {
                // Alternativa: rolar para uma seção relacionada
                navigateToSection('platform-access');
            }
        });
    }
}

// Adicionar CSS para animações
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .fade-in-section {
            animation: fadeIn 0.5s ease-in-out;
        }
        
        .feature-animate-in {
            animation: slideIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        @keyframes slideIn {
            0% { transform: translateX(20px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar estilos de animação
addAnimationStyles(); 
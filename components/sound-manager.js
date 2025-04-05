/**
 * RUNES Analytics Pro - Gerenciador de Sons
 * Responsável por gerenciar e reproduzir efeitos sonoros na aplicação
 */

class SoundManager {
    constructor() {
        // Mapeamento de nomes amigáveis para arquivos de som
        this.sounds = {
            notification: 'assets/sounds/notification.mp3',
            achievement: 'assets/sounds/achievement.mp3',
            levelUp: 'assets/sounds/level-up.mp3',
            click: 'assets/sounds/click.mp3',
            alert: 'assets/sounds/alert.mp3',
            whaleAlert: 'assets/sounds/whale-alert.mp3',
            success: 'assets/sounds/success.mp3',
            error: 'assets/sounds/error.mp3',
            trading: 'assets/sounds/trading.mp3'
        };
        
        // Cache para elementos de áudio
        this.audioElements = {};
        
        // Volume padrão (0.0 a 1.0)
        this.volume = 0.5;
        
        // Estado de mudo
        this.muted = false;
        
        // Carregar configurações do usuário do localStorage
        this.loadSettings();
    }
    
    /**
     * Inicializa o gerenciador de sons
     */
    initialize() {
        console.log('Inicializando gerenciador de sons...');
        
        // Pré-carregar sons comuns
        this.preloadCommonSounds();
        
        // Adicionar controles de áudio à interface (se necessário)
        this.setupAudioControls();
        
        return true;
    }
    
    /**
     * Carrega as configurações do usuário
     */
    loadSettings() {
        // Tentar carregar as configurações de som do localStorage
        try {
            const settings = JSON.parse(localStorage.getItem('runesAudioSettings'));
            if (settings) {
                this.volume = settings.volume !== undefined ? settings.volume : this.volume;
                this.muted = settings.muted !== undefined ? settings.muted : this.muted;
                console.log(`Configurações de som carregadas: volume=${this.volume}, mudo=${this.muted}`);
            }
        } catch (e) {
            console.warn('Erro ao carregar configurações de som:', e);
        }
    }
    
    /**
     * Salva as configurações do usuário
     */
    saveSettings() {
        try {
            const settings = {
                volume: this.volume,
                muted: this.muted
            };
            localStorage.setItem('runesAudioSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Erro ao salvar configurações de som:', e);
        }
    }
    
    /**
     * Pré-carrega sons comuns para evitar atrasos
     */
    preloadCommonSounds() {
        // Pré-carregar sons que serão usados com frequência
        const commonSounds = ['notification', 'click', 'success'];
        commonSounds.forEach(sound => {
            this.getAudio(sound);
        });
    }
    
    /**
     * Adiciona controles de áudio à interface
     */
    setupAudioControls() {
        // Verificar se já existe um controle de áudio
        let audioControl = document.getElementById('audio-control');
        
        if (!audioControl) {
            // Criar elemento de controle de áudio
            audioControl = document.createElement('div');
            audioControl.id = 'audio-control';
            audioControl.className = 'audio-control';
            audioControl.innerHTML = `
                <button id="toggle-sound" title="Alternar som">
                    <i class="fas ${this.muted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>
                </button>
                <div class="volume-slider-container">
                    <input type="range" id="volume-slider" min="0" max="100" value="${this.volume * 100}" />
                </div>
            `;
            
            // Adicionar à interface (preferencialmente no cabeçalho ou barra lateral)
            const header = document.querySelector('header');
            const sidebar = document.querySelector('.sidebar');
            
            if (header) {
                header.appendChild(audioControl);
            } else if (sidebar) {
                sidebar.appendChild(audioControl);
            } else {
                // Adicionar ao corpo se não encontrar local específico
                document.body.appendChild(audioControl);
            }
            
            // Adicionar event listeners
            const toggleButton = document.getElementById('toggle-sound');
            const volumeSlider = document.getElementById('volume-slider');
            
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    this.toggleMute();
                    toggleButton.innerHTML = `<i class="fas ${this.muted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>`;
                });
            }
            
            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    this.setVolume(e.target.value / 100);
                });
            }
        }
    }
    
    /**
     * Retorna um elemento de áudio para o som especificado
     */
    getAudio(soundName) {
        // Verificar se o som está no mapeamento
        if (!this.sounds[soundName]) {
            console.error(`Som '${soundName}' não encontrado`);
            return null;
        }
        
        // Verificar se já temos o elemento no cache
        if (!this.audioElements[soundName]) {
            const audio = new Audio(this.sounds[soundName]);
            audio.volume = this.volume;
            this.audioElements[soundName] = audio;
        }
        
        return this.audioElements[soundName];
    }
    
    /**
     * Reproduz um som pelo nome
     */
    play(soundName, options = {}) {
        // Se estiver mudo, não reproduzir
        if (this.muted) {
            console.log(`Som '${soundName}' não reproduzido: mudo ativado`);
            return;
        }
        
        const audio = this.getAudio(soundName);
        if (!audio) return;
        
        // Definir o volume (usando o padrão ou sobrescrevendo com opções)
        const volume = options.volume !== undefined ? options.volume : this.volume;
        audio.volume = volume;
        
        // Reiniciar o som se já estiver tocando
        audio.currentTime = 0;
        
        // Reproduzir o som
        audio.play().catch(e => {
            console.warn(`Erro ao reproduzir som '${soundName}':`, e);
        });
        
        console.log(`Som '${soundName}' reproduzido com volume ${volume}`);
    }
    
    /**
     * Alterna o estado de mudo
     */
    toggleMute() {
        this.muted = !this.muted;
        console.log(`Som ${this.muted ? 'desativado' : 'ativado'}`);
        
        // Atualizar configurações
        this.saveSettings();
        
        return this.muted;
    }
    
    /**
     * Define o volume para todos os sons
     */
    setVolume(volume) {
        // Garantir que o volume esteja entre 0 e 1
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Atualizar o volume de todos os elementos de áudio no cache
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = this.volume;
        });
        
        console.log(`Volume definido para ${this.volume}`);
        
        // Atualizar configurações
        this.saveSettings();
        
        return this.volume;
    }
}

// Exportar a classe para uso global
window.SoundManager = SoundManager; 
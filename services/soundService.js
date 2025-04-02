class SoundService {
    constructor() {
        // Usar URLs de CDNs para sons online em vez de arquivos locais
        this.sounds = {
            // Sons nostálgicos
            icq: new Audio("https://www.myinstants.com/media/sounds/icq-uh-oh.mp3"),
            msn: new Audio("https://www.myinstants.com/media/sounds/msn-online.mp3"),
            nokia: new Audio("https://www.myinstants.com/media/sounds/nokia-tune.mp3"),
            windows: new Audio("https://www.myinstants.com/media/sounds/windows-xp-startup.mp3"),
            
            // Sons temáticos para tokens
            cat: new Audio("https://www.myinstants.com/media/sounds/cat-meow.mp3"),
            dog: new Audio("https://www.myinstants.com/media/sounds/dog-barking-sound-effect.mp3"),
            frog: new Audio("https://www.myinstants.com/media/sounds/frog.mp3"),
            monkey: new Audio("https://www.myinstants.com/media/sounds/monkey.mp3"),
            whale: new Audio("https://www.myinstants.com/media/sounds/whale-sound.mp3"),
            moon: new Audio("https://www.myinstants.com/media/sounds/rocket-launch.mp3"),
            
            // Sons para alertas
            alert: new Audio("https://www.myinstants.com/media/sounds/alert.mp3"),
            success: new Audio("https://www.myinstants.com/media/sounds/success-sound-effect.mp3"),
            warning: new Audio("https://www.myinstants.com/media/sounds/warning.mp3"),
            error: new Audio("https://www.myinstants.com/media/sounds/error.mp3")
        };
        
        // Mapeamento de tokens para sons temáticos
        this.tokenSoundMap = {
            "CAT": "cat",
            "KITTY": "cat",
            "NYAN": "cat",
            "DOGE": "dog",
            "SHIB": "dog",
            "WOOF": "dog",
            "PEPE": "frog",
            "RIBBIT": "frog",
            "APE": "monkey",
            "KONG": "monkey",
            "BANANA": "monkey",
            "WHALE": "whale",
            "MOON": "moon",
            "ROCKET": "moon"
        };
    }
    
    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            // Reiniciar o som se já estiver tocando
            sound.pause();
            sound.currentTime = 0;
            
            // Tocar o som
            sound.play().catch(e => console.log("Erro ao reproduzir som:", e));
        } else {
            console.warn(`Som não encontrado: ${soundName}`);
        }
    }
    
    playTokenSound(ticker) {
        // Verificar se o token tem um som temático
        const soundName = this.tokenSoundMap[ticker.toUpperCase()];
        
        if (soundName) {
            this.playSound(soundName);
        } else {
            // Usar som padrão para tokens sem mapeamento específico
            this.playSound("alert");
        }
    }
    
    playAlertSound(alertType, ticker) {
        // Primeiro, verificar se devemos usar um som temático baseado no ticker
        if (ticker && this.tokenSoundMap[ticker.toUpperCase()]) {
            this.playTokenSound(ticker);
            return;
        }
        
        // Caso contrário, usar som baseado no tipo de alerta
        switch (alertType) {
            case "whaleMovement":
                this.playSound("whale");
                break;
            case "priceAlert":
                this.playSound("icq");
                break;
            case "fibonacciLevel":
                this.playSound("success");
                break;
            case "trendChange":
                this.playSound("msn");
                break;
            default:
                this.playSound("alert");
        }
    }
}

export default new SoundService();
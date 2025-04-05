// ComponentManager - Sistema de gerenciamento de componentes
// Este arquivo resolve o problema de componentes não encontrados, garantindo
// que eles sejam registrados corretamente e só inicializados quando disponíveis.

class ComponentManager {
    constructor() {
        // Registra todos os componentes disponíveis
        this.components = {};
        
        // Status de inicialização de cada componente
        this.componentStatus = {};
        
        // Callbacks para eventos de componentes
        this.callbacks = {
            onComponentLoaded: {},
            onComponentFailed: {}
        };
        
        // Configuração do observer para monitorar o carregamento de scripts
        this.observer = null;
        
        // Inicializa o MutationObserver para detectar quando scripts são carregados
        this.initObserver();
        
        console.log('✅ ComponentManager inicializado!');
    }
    
    // Inicializa o MutationObserver para monitorar o DOM
    initObserver() {
        this.observer = new MutationObserver(mutations => {
            let scriptsAdded = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.tagName === 'SCRIPT') {
                            scriptsAdded = true;
                        }
                    }
                }
            }
            
            // Se scripts foram adicionados, verificar componentes após um breve delay
            if (scriptsAdded) {
                setTimeout(() => this.checkComponents(), 100);
            }
        });
        
        // Observar todo o documento para detectar novos scripts
        this.observer.observe(document, {
            childList: true,
            subtree: true
        });
    }
    
    // Registra um componente no sistema
    register(componentKey, config) {
        console.log(`Registrando componente: ${componentKey}`);
        
        this.components[componentKey] = {
            name: config.name || componentKey,
            className: config.className || componentKey,
            globalVar: config.globalVar || `window.${componentKey.toLowerCase()}`,
            scriptPath: config.scriptPath || `components/${componentKey.toLowerCase()}.js`,
            initMethod: config.initMethod || 'init',
            dependencies: config.dependencies || [],
            fallback: config.fallback || null
        };
        
        this.componentStatus[componentKey] = {
            loaded: false,
            initialized: false,
            failed: false,
            loadAttempts: 0,
            lastError: null
        };
        
        return this;
    }
    
    // Verifica a disponibilidade de todos os componentes registrados
    checkComponents() {
        console.log('Verificando disponibilidade de componentes...');
        
        Object.keys(this.components).forEach(key => {
            const component = this.components[key];
            const status = this.componentStatus[key];
            
            // Verifica se o construtor do componente existe no escopo global
            if (window[component.className] && !status.loaded) {
                console.log(`✅ Componente ${key} encontrado!`);
                status.loaded = true;
                
                // Disparar callbacks de carregamento
                if (this.callbacks.onComponentLoaded[key]) {
                    this.callbacks.onComponentLoaded[key].forEach(callback => callback());
                }
            }
            
            // Se o componente já foi inicializado mas a instância global não existe,
            // isso significa que foi destruído ou removido
            if (status.initialized && !this.getComponentInstance(key)) {
                console.log(`⚠️ Instância do componente ${key} não encontrada, redefinindo status...`);
                status.initialized = false;
            }
        });
    }
    
    // Inicializa um componente específico
    initComponent(componentKey) {
        if (!this.components[componentKey]) {
            console.error(`❌ Componente ${componentKey} não registrado!`);
            return Promise.reject(new Error(`Componente ${componentKey} não registrado`));
        }
        
        return new Promise((resolve, reject) => {
            const component = this.components[componentKey];
            const status = this.componentStatus[componentKey];
            
            // Se o componente já estiver inicializado, retorna a instância
            if (status.initialized && this.getComponentInstance(componentKey)) {
                console.log(`ℹ️ Componente ${componentKey} já inicializado, retornando instância existente`);
                resolve(this.getComponentInstance(componentKey));
                return;
            }
            
            // Verifica dependências primeiro
            const dependencyPromises = component.dependencies.map(dep => 
                this.initComponent(dep)
            );
            
            Promise.all(dependencyPromises)
                .then(() => {
                    // Verifica se o componente já está carregado
                    if (window[component.className]) {
                        return this.instantiateComponent(componentKey);
                    } else {
                        // Se não estiver carregado, tentar carregar o script
                        return this.loadComponentScript(componentKey);
                    }
                })
                .then(instance => {
                    status.initialized = true;
                    resolve(instance);
                })
                .catch(error => {
                    status.failed = true;
                    status.lastError = error;
                    
                    // Registrar erro no console
                    console.error(`❌ Falha ao inicializar componente ${componentKey}:`, error);
                    
                    // Tentar usar fallback se disponível
                    if (component.fallback) {
                        console.log(`⚠️ Usando fallback para ${componentKey}...`);
                        return component.fallback()
                            .then(fallbackInstance => {
                                resolve(fallbackInstance);
                            })
                            .catch(fallbackError => {
                                console.error(`❌ Fallback para ${componentKey} também falhou:`, fallbackError);
                                reject(error); // Rejeitar com o erro original
                            });
                    }
                    
                    // Disparar callbacks de falha
                    if (this.callbacks.onComponentFailed[componentKey]) {
                        this.callbacks.onComponentFailed[componentKey].forEach(callback => callback(error));
                    }
                    
                    reject(error);
                });
        });
    }
    
    // Cria uma instância do componente
    instantiateComponent(componentKey) {
        return new Promise((resolve, reject) => {
            const component = this.components[componentKey];
            
            try {
                // Verificar se já existe uma instância global
                let instance = this.getComponentInstance(componentKey);
                
                if (!instance) {
                    console.log(`🔄 Criando nova instância de ${componentKey}...`);
                    // Criar nova instância
                    instance = new window[component.className]();
                    
                    // Armazenar no escopo global conforme convenção
                    const globalVarName = component.globalVar.replace('window.', '');
                    window[globalVarName] = instance;
                }
                
                // Se a instância tiver um método de inicialização, chamá-lo
                if (instance[component.initMethod] && typeof instance[component.initMethod] === 'function') {
                    const initResult = instance[component.initMethod]();
                    
                    // Se o método de inicialização retornar uma Promise, aguardar sua conclusão
                    if (initResult instanceof Promise) {
                        initResult
                            .then(() => {
                                console.log(`✅ Componente ${componentKey} inicializado com sucesso!`);
                                this.componentStatus[componentKey].initialized = true;
                                resolve(instance);
                            })
                            .catch(error => {
                                console.error(`❌ Erro ao inicializar ${componentKey}:`, error);
                                reject(error);
                            });
                    } else {
                        console.log(`✅ Componente ${componentKey} inicializado com sucesso!`);
                        this.componentStatus[componentKey].initialized = true;
                        resolve(instance);
                    }
                } else {
                    console.log(`✅ Componente ${componentKey} instanciado (sem método de inicialização)`);
                    this.componentStatus[componentKey].initialized = true;
                    resolve(instance);
                }
            } catch (error) {
                console.error(`❌ Erro ao instanciar ${componentKey}:`, error);
                reject(error);
            }
        });
    }
    
    // Carrega o script do componente dinamicamente
    loadComponentScript(componentKey) {
        return new Promise((resolve, reject) => {
            const component = this.components[componentKey];
            const status = this.componentStatus[componentKey];
            
            // Incrementar contador de tentativas
            status.loadAttempts++;
            
            // Verificar número de tentativas para evitar loops infinitos
            if (status.loadAttempts > 3) {
                console.error(`❌ Excedido máximo de tentativas para carregar ${componentKey}`);
                reject(new Error(`Excedido máximo de tentativas para carregar ${componentKey}`));
                return;
            }
            
            console.log(`🔄 Carregando script para ${componentKey}: ${component.scriptPath}`);
            
            const script = document.createElement('script');
            script.src = component.scriptPath;
            script.async = true;
            
            // Configurar handlers de evento
            script.onload = () => {
                console.log(`✅ Script carregado para ${componentKey}`);
                status.loaded = true;
                
                // Esperar um momento para garantir que o script foi completamente avaliado
                setTimeout(() => {
                    if (window[component.className]) {
                        this.instantiateComponent(componentKey)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        const error = new Error(`Script carregado, mas classe ${component.className} não encontrada`);
                        console.error(`❌ ${error.message}`);
                        status.lastError = error;
                        reject(error);
                    }
                }, 100);
            };
            
            script.onerror = (event) => {
                const error = new Error(`Falha ao carregar script: ${component.scriptPath}`);
                console.error(`❌ ${error.message}`);
                status.lastError = error;
                reject(error);
            };
            
            // Adicionar script ao DOM para iniciar o carregamento
            document.head.appendChild(script);
        });
    }
    
    // Obtém a instância global do componente
    getComponentInstance(componentKey) {
        const component = this.components[componentKey];
        if (!component) return null;
        
        const globalVarName = component.globalVar.replace('window.', '');
        return window[globalVarName];
    }
    
    // Registra um callback para quando um componente for carregado
    onComponentLoaded(componentKey, callback) {
        if (!this.callbacks.onComponentLoaded[componentKey]) {
            this.callbacks.onComponentLoaded[componentKey] = [];
        }
        this.callbacks.onComponentLoaded[componentKey].push(callback);
    }
    
    // Registra um callback para quando um componente falhar
    onComponentFailed(componentKey, callback) {
        if (!this.callbacks.onComponentFailed[componentKey]) {
            this.callbacks.onComponentFailed[componentKey] = [];
        }
        this.callbacks.onComponentFailed[componentKey].push(callback);
    }
    
    // Verifica se um componente está disponível
    isComponentAvailable(componentKey) {
        return this.componentStatus[componentKey]?.loaded || false;
    }
    
    // Verifica se um componente está inicializado
    isComponentInitialized(componentKey) {
        return this.componentStatus[componentKey]?.initialized || false;
    }
}

// Criar instância global do ComponentManager
window.componentManager = new ComponentManager();

// Registrar os componentes conhecidos
window.componentManager
    .register('RunesGamification', {
        className: 'RunesGamification',
        globalVar: 'window.runesGamification',
        scriptPath: 'components/runes-gamification.js',
        initMethod: 'init',
        fallback: () => {
            console.log('🔄 Criando substituto para RunesGamification...');
            return Promise.resolve({
                init: () => console.log('Mock de runesGamification inicializado'),
                updateXPProgress: () => console.log('Mock de atualização de XP chamado'),
                userData: { level: 1, xp: 0 }
            });
        }
    })
    .register('RunesAnalysis', {
        className: 'RunesAnalysis',
        globalVar: 'window.runesAnalysis',
        scriptPath: 'components/runes-analysis.js',
        initMethod: 'init',
        fallback: () => {
            console.log('🔄 Criando substituto para RunesAnalysis...');
            return Promise.resolve({
                init: () => console.log('Mock de runesAnalysis inicializado'),
                updateTokenInfo: () => console.log('Mock de atualização de tokens chamado'),
                initialize: () => Promise.resolve(true)
            });
        }
    })
    .register('RunesSentimentAnalysis', {
        className: 'RunesSentimentAnalysis',
        globalVar: 'window.runesSentiment',
        scriptPath: 'components/runes-sentiment.js',
        initMethod: 'init',
        fallback: () => {
            console.log('🔄 Criando substituto para RunesSentimentAnalysis...');
            return Promise.resolve({
                init: () => console.log('Mock de runesSentiment inicializado'),
                loadSentimentData: () => Promise.resolve([]),
                initialize: () => Promise.resolve(true)
            });
        }
    })
    .register('RunesWhaleTracker', {
        className: 'RunesWhaleTracker',
        globalVar: 'window.whaleTracker',
        scriptPath: 'components/runes-whale-tracker.js',
        dependencies: [],
        initMethod: 'init',
        fallback: () => {
            console.log('🔄 Criando substituto para RunesWhaleTracker...');
            return Promise.resolve({
                init: () => console.log('Mock de whaleTracker inicializado'),
                updateUI: () => console.log('Mock de atualização de UI do whale tracker chamado'),
                initialize: () => Promise.resolve(true)
            });
        }
    });

// Verificar componentes assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.componentManager.checkComponents();
}); 
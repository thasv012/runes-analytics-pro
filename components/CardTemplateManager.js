/**
 * Gerenciador de templates de cartões e compartilhamento
 */
class CardTemplateManager {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container '${containerId}' não encontrado`);
        }

        this.config = {
            ipfsService: config.ipfsService,
            defaultTemplate: config.defaultTemplate || 'default',
            onTemplateChange: config.onTemplateChange,
            onShare: config.onShare,
            ...config
        };

        this.currentTemplate = null;
        this.currentData = null;
        this.initialize();
    }

    /**
     * Inicializa o componente
     */
    async initialize() {
        this.render();
        this.setupEventListeners();
        
        if (this.config.defaultTemplate) {
            await this.loadTemplate(this.config.defaultTemplate);
        }
    }

    /**
     * Renderiza a interface do componente
     */
    render() {
        this.container.innerHTML = `
            <div class="card-template-manager">
                <div class="template-controls">
                    <select class="template-selector" title="Selecionar template">
                        <option value="">Selecione um template...</option>
                    </select>
                    
                    <button class="edit-template-btn" title="Editar template">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    
                    <button class="save-template-btn" title="Salvar template">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                    
                    <button class="new-template-btn" title="Novo template">
                        <i class="fas fa-plus"></i> Novo
                    </button>
                </div>
                
                <div class="template-editor" style="display: none;">
                    <textarea class="template-code" spellcheck="false"></textarea>
                    
                    <div class="editor-controls">
                        <button class="preview-btn" title="Visualizar">
                            <i class="fas fa-eye"></i> Visualizar
                        </button>
                        
                        <button class="apply-btn" title="Aplicar mudanças">
                            <i class="fas fa-check"></i> Aplicar
                        </button>
                        
                        <button class="cancel-btn" title="Cancelar">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
                
                <div class="preview-container">
                    <div class="card-preview"></div>
                    
                    <div class="share-controls">
                        <button class="share-twitter-btn" title="Compartilhar no Twitter">
                            <i class="fab fa-twitter"></i> Post on X
                        </button>
                        
                        <button class="save-ipfs-btn" title="Salvar no IPFS">
                            <i class="fas fa-cloud-upload-alt"></i> Salvar no IPFS
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .card-template-manager {
                background: var(--card-background, #1a1a2e);
                border-radius: 12px;
                padding: 1.5rem;
                color: var(--text-color, #e6e6e6);
            }

            .template-controls {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .template-selector {
                flex: 1;
                padding: 0.5rem;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: inherit;
            }

            .template-editor {
                margin-bottom: 1.5rem;
            }

            .template-code {
                width: 100%;
                min-height: 200px;
                padding: 1rem;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: inherit;
                font-family: 'JetBrains Mono', monospace;
                margin-bottom: 1rem;
                resize: vertical;
            }

            .editor-controls {
                display: flex;
                gap: 0.5rem;
                justify-content: flex-end;
            }

            button {
                padding: 0.5rem 1rem;
                border-radius: 6px;
                border: none;
                background: var(--accent-color, #3b82f6);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
            }

            button:hover {
                filter: brightness(1.1);
            }

            button i {
                font-size: 0.9em;
            }

            .preview-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 1.5rem;
            }

            .card-preview {
                margin-bottom: 1rem;
                min-height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
            }

            .share-controls {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }

            .share-twitter-btn {
                background: #1DA1F2;
            }

            .save-ipfs-btn {
                background: #65C2CB;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Seletor de template
        const selector = this.container.querySelector('.template-selector');
        selector.addEventListener('change', (e) => {
            this.loadTemplate(e.target.value);
        });

        // Botões de edição
        this.container.querySelector('.edit-template-btn').addEventListener('click', () => {
            this.showEditor();
        });

        this.container.querySelector('.save-template-btn').addEventListener('click', () => {
            this.saveTemplate();
        });

        this.container.querySelector('.new-template-btn').addEventListener('click', () => {
            this.createNewTemplate();
        });

        // Controles do editor
        this.container.querySelector('.preview-btn').addEventListener('click', () => {
            this.previewTemplate();
        });

        this.container.querySelector('.apply-btn').addEventListener('click', () => {
            this.applyChanges();
        });

        this.container.querySelector('.cancel-btn').addEventListener('click', () => {
            this.hideEditor();
        });

        // Botões de compartilhamento
        this.container.querySelector('.share-twitter-btn').addEventListener('click', () => {
            this.shareOnTwitter();
        });

        this.container.querySelector('.save-ipfs-btn').addEventListener('click', () => {
            this.saveToIpfs();
        });
    }

    /**
     * Carrega um template
     * @param {string} templateName - Nome do template
     */
    async loadTemplate(templateName) {
        if (!templateName) return;

        try {
            const template = await this.config.ipfsService.getTemplate(templateName);
            if (template) {
                this.currentTemplate = template;
                this.updatePreview();
                this.config.onTemplateChange?.(template);
            }
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            // Mostrar notificação de erro se disponível
            if (window.RunesAnimations) {
                RunesAnimations.showNotification({
                    type: 'error',
                    title: 'Erro ao carregar template',
                    message: error.message
                });
            }
        }
    }

    /**
     * Mostra o editor de template
     */
    showEditor() {
        const editor = this.container.querySelector('.template-editor');
        const codeArea = editor.querySelector('.template-code');
        
        if (this.currentTemplate) {
            codeArea.value = JSON.stringify(this.currentTemplate, null, 2);
        }
        
        editor.style.display = 'block';
    }

    /**
     * Esconde o editor de template
     */
    hideEditor() {
        const editor = this.container.querySelector('.template-editor');
        editor.style.display = 'none';
    }

    /**
     * Salva o template atual
     */
    async saveTemplate() {
        try {
            const codeArea = this.container.querySelector('.template-code');
            const template = JSON.parse(codeArea.value);
            
            if (this.currentTemplate?.name) {
                await this.config.ipfsService.setTemplate(this.currentTemplate.name, template);
                this.updatePreview();
                this.hideEditor();
                
                // Mostrar notificação de sucesso
                if (window.RunesAnimations) {
                    RunesAnimations.showNotification({
                        type: 'success',
                        title: 'Template salvo',
                        message: 'O template foi atualizado com sucesso!'
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            if (window.RunesAnimations) {
                RunesAnimations.showNotification({
                    type: 'error',
                    title: 'Erro ao salvar template',
                    message: error.message
                });
            }
        }
    }

    /**
     * Cria um novo template
     */
    createNewTemplate() {
        const name = prompt('Nome do novo template:');
        if (!name) return;

        const template = {
            name,
            version: '1.0.0',
            created: new Date().toISOString(),
            content: {
                title: '{{title}}',
                description: '{{description}}',
                image: '{{image}}',
                data: {}
            }
        };

        this.currentTemplate = template;
        this.showEditor();
    }

    /**
     * Atualiza a visualização do template
     */
    updatePreview() {
        if (!this.currentTemplate || !this.currentData) return;

        const preview = this.container.querySelector('.card-preview');
        const rendered = this.config.ipfsService.applyTemplate(this.currentTemplate, this.currentData);
        
        // Renderizar preview (implementação depende do formato do template)
        preview.innerHTML = `<pre>${JSON.stringify(rendered, null, 2)}</pre>`;
    }

    /**
     * Compartilha no Twitter
     */
    async shareOnTwitter() {
        if (!this.currentTemplate || !this.currentData) {
            if (window.RunesAnimations) {
                RunesAnimations.showNotification({
                    type: 'error',
                    title: 'Erro ao compartilhar',
                    message: 'Nenhum dado disponível para compartilhar'
                });
            }
            return;
        }

        try {
            // Primeiro salvar no IPFS para ter uma URL permanente
            const ipfsResult = await this.saveToIpfs();
            
            // Preparar dados para compartilhamento
            const shareData = {
                ...this.currentData,
                url: ipfsResult.url,
                image: ipfsResult.url // Usar imagem do IPFS
            };

            // Gerar URL do Twitter
            const twitterData = this.config.ipfsService.prepareTwitterShare(shareData);
            
            // Abrir janela do Twitter
            const width = 550;
            const height = 420;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            
            window.open(
                twitterData.url,
                'Compartilhar no Twitter',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Callback de sucesso
            this.config.onShare?.('twitter', {
                template: this.currentTemplate.name,
                data: shareData,
                ipfs: ipfsResult
            });

        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            if (window.RunesAnimations) {
                RunesAnimations.showNotification({
                    type: 'error',
                    title: 'Erro ao compartilhar',
                    message: error.message
                });
            }
        }
    }

    /**
     * Salva o cartão atual no IPFS
     */
    async saveToIpfs() {
        if (!this.currentTemplate || !this.currentData) {
            throw new Error('Nenhum dado disponível para salvar');
        }

        try {
            // Gerar cartão
            const card = await this.config.ipfsService.generateCard(
                this.currentTemplate.name,
                this.currentData
            );

            if (window.RunesAnimations) {
                RunesAnimations.showNotification({
                    type: 'success',
                    title: 'Salvo no IPFS',
                    message: `Cartão salvo com sucesso! CID: ${card.cid}`
                });
            }

            return card;

        } catch (error) {
            console.error('Erro ao salvar no IPFS:', error);
            throw error;
        }
    }

    /**
     * Atualiza os dados do cartão
     * @param {Object} data - Novos dados
     */
    updateData(data) {
        this.currentData = data;
        this.updatePreview();
    }
}

// Exportar a classe
export default CardTemplateManager; 
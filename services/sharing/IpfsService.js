/**
 * Serviço para gerenciamento de armazenamento IPFS e templates de cartões
 */
class IpfsService {
    constructor(config = {}) {
        this.config = {
            ipfsGateway: config.ipfsGateway || 'https://ipfs.io/ipfs/',
            pinataApiKey: config.pinataApiKey,
            pinataSecretKey: config.pinataSecretKey,
            defaultTemplates: config.defaultTemplates || {},
            ...config
        };

        this.templates = new Map();
        this.loadDefaultTemplates();
    }

    /**
     * Carrega templates padrão
     */
    loadDefaultTemplates() {
        Object.entries(this.config.defaultTemplates).forEach(([key, template]) => {
            this.templates.set(key, template);
        });
    }

    /**
     * Adiciona ou atualiza um template
     * @param {string} name - Nome do template
     * @param {Object} template - Configuração do template
     */
    setTemplate(name, template) {
        this.templates.set(name, {
            ...template,
            lastModified: new Date().toISOString()
        });
    }

    /**
     * Obtém um template pelo nome
     * @param {string} name - Nome do template
     */
    getTemplate(name) {
        return this.templates.get(name);
    }

    /**
     * Lista todos os templates disponíveis
     */
    listTemplates() {
        return Array.from(this.templates.entries()).map(([name, template]) => ({
            name,
            ...template
        }));
    }

    /**
     * Salva dados no IPFS via Pinata
     * @param {Object} data - Dados a serem salvos
     * @param {Object} options - Opções de pinning
     */
    async saveToIpfs(data, options = {}) {
        if (!this.config.pinataApiKey || !this.config.pinataSecretKey) {
            throw new Error('Credenciais Pinata não configuradas');
        }

        const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
        
        try {
            const response = await fetch(pinataEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.config.pinataApiKey,
                    'pinata_secret_api_key': this.config.pinataSecretKey
                },
                body: JSON.stringify({
                    pinataContent: data,
                    pinataMetadata: {
                        name: options.name || 'RUNES Analytics Data',
                        keyvalues: {
                            type: options.type || 'card',
                            timestamp: new Date().toISOString(),
                            ...options.metadata
                        }
                    },
                    pinataOptions: {
                        cidVersion: 1
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Erro ao salvar no IPFS: ${response.statusText}`);
            }

            const result = await response.json();
            return {
                cid: result.IpfsHash,
                url: `${this.config.ipfsGateway}${result.IpfsHash}`,
                timestamp: new Date().toISOString(),
                metadata: options.metadata
            };
        } catch (error) {
            console.error('Erro ao salvar no IPFS:', error);
            throw error;
        }
    }

    /**
     * Gera um cartão usando um template
     * @param {string} templateName - Nome do template
     * @param {Object} data - Dados para o cartão
     */
    async generateCard(templateName, data) {
        const template = this.getTemplate(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' não encontrado`);
        }

        // Aplicar dados ao template
        const cardContent = this.applyTemplate(template, data);

        // Salvar no IPFS se configurado
        if (this.config.pinataApiKey) {
            return this.saveToIpfs(cardContent, {
                name: `${data.name || 'card'}-${Date.now()}`,
                type: 'card',
                metadata: {
                    template: templateName,
                    ...data.metadata
                }
            });
        }

        return cardContent;
    }

    /**
     * Aplica dados a um template
     * @param {Object} template - Template a ser usado
     * @param {Object} data - Dados para aplicar
     */
    applyTemplate(template, data) {
        const compiled = { ...template };

        // Processar variáveis do template
        const processValue = (value) => {
            if (typeof value === 'string') {
                return value.replace(/\{\{(.*?)\}\}/g, (match, key) => {
                    const path = key.trim().split('.');
                    let result = data;
                    for (const segment of path) {
                        result = result?.[segment];
                        if (result === undefined) break;
                    }
                    return result !== undefined ? result : match;
                });
            }
            if (typeof value === 'object' && value !== null) {
                return Object.entries(value).reduce((acc, [k, v]) => ({
                    ...acc,
                    [k]: processValue(v)
                }), Array.isArray(value) ? [] : {});
            }
            return value;
        };

        return processValue(compiled);
    }

    /**
     * Gera meta tags para compartilhamento social
     * @param {Object} data - Dados do cartão
     */
    generateMetaTags(data) {
        return {
            title: data.title || 'RUNES Analytics Pro',
            description: data.description || 'Análise de tokens Runes no Bitcoin',
            image: data.image || '',
            url: data.url || window.location.href,
            'twitter:card': 'summary_large_image',
            'twitter:site': '@runesanalytics',
            'twitter:creator': data.creator || '@thasv012',
            'og:title': data.title || 'RUNES Analytics Pro',
            'og:description': data.description || 'Análise de tokens Runes no Bitcoin',
            'og:image': data.image || '',
            'og:url': data.url || window.location.href,
            'og:type': 'website'
        };
    }

    /**
     * Prepara dados para compartilhamento no Twitter
     * @param {Object} data - Dados do cartão
     */
    prepareTwitterShare(data) {
        const text = data.text || `Confira esta análise no RUNES Analytics Pro!`;
        const url = data.url || window.location.href;
        const hashtags = data.hashtags?.join(',') || 'RUNES,Bitcoin,Ordinals';
        const via = data.via || 'runesanalytics';

        return {
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}&via=${encodeURIComponent(via)}`,
            meta: this.generateMetaTags(data)
        };
    }
}

// Exportar a classe
export default IpfsService; 
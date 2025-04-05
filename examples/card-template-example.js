import CardTemplateManager from '../components/CardTemplateManager';
import IpfsService from '../services/sharing/IpfsService';

// Configurar o serviço IPFS
const ipfsService = new IpfsService({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretKey: process.env.PINATA_SECRET_KEY,
    defaultGateway: 'https://gateway.pinata.cloud'
});

// Inicializar o gerenciador de templates
const templateManager = new CardTemplateManager('card-template-container', {
    ipfsService,
    defaultTemplate: 'rune-card',
    onTemplateChange: (template) => {
        console.log('Template alterado:', template);
    },
    onShare: (platform, data) => {
        console.log(`Compartilhado no ${platform}:`, data);
    }
});

// Exemplo de dados de um token Rune
const runeData = {
    title: 'ORDIBITS',
    description: 'Token Rune na rede Bitcoin',
    supply: '21000000',
    holders: '1337',
    transactions: '42069',
    price: '0.00001 BTC',
    volume: '1.5 BTC',
    marketCap: '210 BTC',
    createdAt: '2024-03-15T12:00:00Z',
    image: 'https://example.com/ordibits.png'
};

// Atualizar os dados do cartão
templateManager.updateData(runeData);

// Exemplo de template personalizado
const customTemplate = {
    name: 'rune-card',
    version: '1.0.0',
    created: new Date().toISOString(),
    content: {
        title: '{{title}}',
        description: '{{description}}',
        image: '{{image}}',
        data: {
            supply: '{{supply}}',
            holders: '{{holders}}',
            transactions: '{{transactions}}',
            price: '{{price}}',
            volume: '{{volume}}',
            marketCap: '{{marketCap}}'
        },
        layout: {
            type: 'card',
            theme: 'dark',
            style: {
                width: '600px',
                height: '400px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#e6e6e6',
                fontFamily: 'Inter, sans-serif'
            }
        }
    }
};

// Adicionar template personalizado
ipfsService.setTemplate('rune-card', customTemplate); 
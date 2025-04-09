/**
 * Gerador de Imagens para Thread do RUNES Analytics Pro
 * 
 * Este script utiliza Puppeteer para abrir os geradores de banner
 * e visualizações, capturar screenshots e salvar como imagens.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configurações
const outputDir = path.join(__dirname);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Templates a serem capturados
const templates = [
  'evolution',
  'gpu-mesh',
  'websocket',
  'roadmap',
  'ai-analysis',
  'whales-tracking',
  'comparison',
  'next-evolution'
];

// Função principal
async function generateImages() {
  console.log('Iniciando geração de imagens para a thread...');
  
  // Verifica se o diretório de saída existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1200,
      height: 675
    }
  });
  
  try {
    // 1. Capturar banners dos templates
    await captureBanners(browser);
    
    // 2. Capturar visualização do GPU Mesh
    await captureGpuMesh(browser);
    
    console.log('Todas as imagens foram geradas com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar imagens:', error);
  } finally {
    await browser.close();
  }
}

// Captura os banners de todos os templates
async function captureBanners(browser) {
  console.log('Gerando banners...');
  
  const page = await browser.newPage();
  await page.goto(`file://${path.join(__dirname, 'thread-banner-generator.html')}`, {
    waitUntil: 'networkidle2'
  });
  
  for (const template of templates) {
    console.log(`Processando template: ${template}`);
    
    // Seleciona o template
    await page.select('#banner-template', template);
    await delay(500);
    
    // Clica no botão gerar
    await page.click('#generate-btn');
    await delay(1000);
    
    // Captura screenshot
    const banner = await page.$('#banner');
    await banner.screenshot({
      path: path.join(outputDir, `runes-analytics-thread-${template}.png`),
      omitBackground: true
    });
    
    console.log(`Banner para ${template} salvo com sucesso!`);
  }
  
  await page.close();
}

// Captura a visualização do GPU Mesh
async function captureGpuMesh(browser) {
  console.log('Gerando visualização do GPU Mesh...');
  
  const page = await browser.newPage();
  await page.goto(`file://${path.join(__dirname, 'gpu-mesh-visualizer.html')}`, {
    waitUntil: 'networkidle2'
  });
  
  // Aguarda um tempo para a animação inicializar
  await delay(3000);
  
  // Simula alguns cliques para gerar tráfego
  const centerX = 600;
  const centerY = 337;
  await page.mouse.click(centerX, centerY);
  await delay(1000);
  
  await page.mouse.click(centerX + 150, centerY + 100);
  await delay(1000);
  
  await page.mouse.click(centerX - 150, centerY - 100);
  await delay(2000);
  
  // Captura screenshot
  await page.screenshot({
    path: path.join(outputDir, 'runes-analytics-thread-gpu-mesh-dynamic.png')
  });
  
  console.log('Visualização do GPU Mesh salva com sucesso!');
  await page.close();
}

// Executa o script
generateImages().catch(console.error); 
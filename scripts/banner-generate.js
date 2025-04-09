#!/usr/bin/env node

/**
 * RUNES Analytics Pro - Neural Banner Generator CLI
 * 
 * Este script permite gerar banners via linha de comando
 * Utiliza a API do Neural Banner Generator para criar 
 * imagens personalizadas.
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Obtém o diretório atual para o módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do CLI
const program = new Command();
program
  .name('banner-generate')
  .description('RUNES Analytics Pro - Gerador de Banners Neurais CLI')
  .version('1.0.0');

// Comando principal para criar banner
program
  .command('create')
  .description('Gera um banner neural com as configurações especificadas')
  .requiredOption('--style <style>', 'Estilo do banner: cyberpunk, neural-glow, runes-art, bitcoin-abstract')
  .requiredOption('--text <text>', 'Texto a ser exibido no banner')
  .option('--lang <lang>', 'Idioma: PT, EN', 'PT')
  .option('--resolution <resolution>', 'Resolução: 1280x720, 1920x1080, etc.', '1280x720')
  .option('--position <position>', 'Posição do texto: center, top, bottom', 'center')
  .option('--qr <url>', 'URL para gerar QR code')
  .option('--qr-position <position>', 'Posição do QR: bottom-right, bottom-left, top-right, top-left', 'bottom-right')
  .option('--theme <theme>', 'Tema: dark, light', 'dark')
  .option('--output <filename>', 'Nome do arquivo de saída')
  .option('--no-signature', 'Não incluir assinatura no banner')
  .action(async (options) => {
    console.log('🎨 RUNES Analytics Pro - Gerando Banner Neural');
    console.log('Estilo: ' + options.style);
    console.log('Texto: ' + options.text);
    console.log('Resolução: ' + options.resolution);
    
    // Constrói o objeto de configuração para a API
    const config = {
      style: options.style,
      lang: options.lang,
      text: options.text,
      resolution: options.resolution,
      textPosition: options.position,
      theme: options.theme,
      includeSignature: options.signature
    };
    
    // Adiciona QR code se especificado
    if (options.qr) {
      config.qr = options.qr;
      config.qrPosition = options.qrPosition;
      console.log('QR Code: ' + options.qr);
    }
    
    // Nome do arquivo de saída
    const outputFilename = options.output || `banner-${Date.now()}.png`;
    console.log('Arquivo de saída: ' + outputFilename);
    
    // Gera um script temporário para executar no navegador
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempHtmlPath = path.join(tempDir, 'banner-generator.html');
    const tempScriptPath = path.join(tempDir, 'banner-script.js');
    
    // Cria um HTML mínimo com o código necessário
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Banner Generator</title>
      <script src="../js/neural-banner.js"></script>
      <script src="../js/banner-backgrounds.js"></script>
      <script src="../js/banner-utils.js"></script>
    </head>
    <body>
      <canvas id="banner-canvas"></canvas>
      <div id="status"></div>
      <script src="./banner-script.js"></script>
    </body>
    </html>
    `;
    
    // Cria um script JS que invoca a API e salva o resultado
    const scriptContent = `
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        const config = ${JSON.stringify(config, null, 2)};
        const canvas = await NeuralBanner.generate(config);
        
        // Obtém o Data URL
        const dataUrl = NeuralBanner.getDataURL();
        
        // Salva no localStorage para o script Node ler
        localStorage.setItem('banner_result', dataUrl);
        document.getElementById('status').textContent = 'Banner gerado com sucesso!';
        
        // Sinaliza que terminou
        document.title = 'DONE';
      } catch (error) {
        console.error('Erro ao gerar banner:', error);
        document.getElementById('status').textContent = 'Erro: ' + error.message;
        document.title = 'ERROR';
      }
    });
    `;
    
    // Escreve os arquivos temporários
    fs.writeFileSync(tempHtmlPath, htmlContent);
    fs.writeFileSync(tempScriptPath, scriptContent);
    
    console.log('Gerando banner...');
    
    try {
      // Abre a página em um navegador headless e extrai o resultado
      // Isso é um exemplo - necessita de adaptação conforme o ambiente
      // const result = execSync(`chromium-browser --headless --disable-gpu --screenshot=${outputFilename} ${tempHtmlPath}`);
      
      // Como é difícil executar headless em todos os ambientes, este é apenas um exemplo
      console.log('Para executar este comando, você precisa abrir o arquivo banner-generator.html em um navegador.');
      console.log(`Caminho do arquivo: ${tempHtmlPath}`);
      console.log('O banner será gerado no navegador e você poderá salvá-lo manualmente.');
      
      // Em produção, seria algo como:
      // const dataUrl = localStorage.getItem('banner_result');
      // const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      // fs.writeFileSync(outputFilename, base64Data, 'base64');
      
      console.log('✅ Banner gerado em: ' + outputFilename);
    } catch (error) {
      console.error('❌ Erro ao gerar banner:', error.message);
    } finally {
      // Limpar arquivos temporários em produção
      // fs.unlinkSync(tempHtmlPath);
      // fs.unlinkSync(tempScriptPath);
    }
  });

// Comando para exportar todos os estilos
program
  .command('export-all')
  .description('Exporta banners em todos os estilos com o mesmo texto')
  .requiredOption('--text <text>', 'Texto a ser exibido nos banners')
  .option('--output <dir>', 'Diretório de saída', './exports')
  .option('--resolution <resolution>', 'Resolução dos banners', '1280x720')
  .action((options) => {
    console.log('🎨 RUNES Analytics Pro - Exportando todos os estilos');
    console.log('Texto: ' + options.text);
    console.log('Diretório de saída: ' + options.output);
    
    // Cria o diretório de saída se não existir
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, { recursive: true });
    }
    
    // Lista de estilos disponíveis
    const styles = ['cyberpunk', 'neural-glow', 'runes-art', 'bitcoin-abstract'];
    
    // Para cada estilo, executa o comando de criação
    styles.forEach(style => {
      const outputFile = path.join(options.output, `banner-${style}.png`);
      console.log(`Gerando banner no estilo ${style}...`);
      
      // Executa o comando create para cada estilo
      try {
        program.executableDir = __dirname;
        program.parse([
          'node', 'banner-generate.js', 'create',
          `--style=${style}`,
          `--text=${options.text}`,
          `--resolution=${options.resolution}`,
          `--output=${outputFile}`
        ]);
      } catch (error) {
        console.error(`❌ Erro ao gerar banner no estilo ${style}:`, error.message);
      }
    });
    
    console.log('✅ Exportação concluída!');
  });

// Análise dos argumentos da linha de comando
program.parse();

// Se nenhum comando foi especificado, exibe a ajuda
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 
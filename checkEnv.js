import fs from 'fs/promises';
import path from 'path';

async function checkEnvironment() {
    const requiredFiles = [
        'package.json',
        'server.js',
        'index.html',
        'app.js',
        'config.js',
        'styles.css'
    ];

    const requiredDirs = [
        'assets',
        'components',
        'services'
    ];

    try {
        // Verificar arquivos
        for (const file of requiredFiles) {
            try {
                await fs.access(file);
                console.log(`✓ ${file} encontrado`);
            } catch {
                console.log(`✗ ${file} não encontrado`);
            }
        }

        // Verificar diretórios
        for (const dir of requiredDirs) {
            try {
                await fs.access(dir);
                console.log(`✓ ${dir}/ encontrado`);
            } catch {
                console.log(`✗ ${dir}/ não encontrado`);
            }
        }

        // Verificar node_modules
        try {
            await fs.access('node_modules');
            console.log('✓ Dependências instaladas');
        } catch {
            console.log('✗ Dependências não instaladas');
        }

    } catch (error) {
        console.error('Erro na verificação do ambiente:', error);
        process.exit(1);
    }
}

checkEnvironment();

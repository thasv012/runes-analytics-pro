const fs = require('fs').promises;
const path = require('path');

/**
 * Script to generate README.en.md by combining content blocks
 * from docs/ folder separated by horizontal lines
 */
async function generateEnglishReadme() {
  try {
    console.log('🔄 Generating README.en.md from English content blocks...');
    
    // Path to directories and files
    const docsDir = path.join(__dirname, '..', 'docs');
    const readmePath = path.join(__dirname, '..', 'README.en.md');
    
    // List of files to combine, in correct order
    const blocksFiles = [
      'bloco1.en.md',
      'bloco2.en.md',
      'bloco3.en.md',
      'bloco4.en.md'
    ];
    
    // Array to store content from each block
    const contents = [];
    
    // Read each block file
    for (const blockFile of blocksFiles) {
      try {
        const filePath = path.join(docsDir, blockFile);
        
        // Check if file exists
        try {
          await fs.access(filePath);
        } catch (err) {
          console.error(`⚠️ File ${blockFile} not found. Skipping...`);
          continue;
        }
        
        // Read file content
        const content = await fs.readFile(filePath, 'utf8');
        contents.push(content);
        console.log(`✅ Block ${blockFile} successfully read`);
      } catch (error) {
        console.error(`❌ Error reading ${blockFile}: ${error.message}`);
      }
    }
    
    // If no content to combine, abort
    if (contents.length === 0) {
      console.error('❌ No block files found. README.en.md was not generated.');
      process.exit(1);
    }
    
    // Combine contents with horizontal line separators
    const combinedContent = contents.join('\n\n---\n\n');
    
    // Write to README.en.md file
    await fs.writeFile(readmePath, combinedContent, 'utf8');
    console.log('✅ README.en.md successfully updated!');
    
  } catch (error) {
    console.error(`❌ Error generating README.en.md: ${error.message}`);
    process.exit(1);
  }
}

// Execute main function
generateEnglishReadme(); 
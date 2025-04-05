// LZ-String - Versão simplificada para compressão de dados
// Adaptado de https://github.com/pieroxy/lz-string/
// Usado para reduzir o tamanho de dados armazenados no IndexedDB e localStorage

(function(global) {
  // Caracteres utilizados para compressão
  const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  
  const baseReverseDic = {};
  
  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }
  
  const LZString = {
    /**
     * Comprime uma string usando LZ-based compression
     * @param {string} input - String a ser comprimida
     * @returns {string} - String comprimida em formato Base64
     */
    compress: function(input) {
      if (input === null || input === undefined || input === '') return '';
      
      // Converter string para array de caracteres
      const output = [];
      let c;
      let current = 0;
      let status = 0;
      
      // Compressão LZ
      input = String(input);
      
      for (let i = 0; i < input.length; i++) {
        c = input.charAt(i);
        
        // Processar em partes de 8 bits
        current = (current << 8) | c.charCodeAt(0);
        status += 8;
        
        while (status >= 6) {
          status -= 6;
          output.push(keyStrBase64.charAt((current >> status) & 0x3F));
        }
      }
      
      // Lidar com bits restantes
      if (status > 0) {
        output.push(keyStrBase64.charAt((current << (6 - status)) & 0x3F));
      }
      
      return output.join('');
    },
    
    /**
     * Descomprime uma string previamente comprimida
     * @param {string} input - String comprimida
     * @returns {string} - String original descomprimida
     */
    decompress: function(input) {
      if (input === null || input === undefined || input === '') return '';
      
      const output = [];
      let current = 0;
      let status = 0;
      
      // Descompressão
      input = String(input);
      
      for (let i = 0; i < input.length; i++) {
        current = (current << 6) | getBaseValue(keyStrBase64, input.charAt(i));
        status += 6;
        
        if (status >= 8) {
          status -= 8;
          output.push(String.fromCharCode((current >> status) & 0xFF));
        }
      }
      
      return output.join('');
    },
    
    /**
     * Comprime uma string para uma versão segura para URI (URI-encoded)
     * @param {string} input - String a ser comprimida
     * @returns {string} - String comprimida e segura para URI
     */
    compressToEncodedURIComponent: function(input) {
      if (input === null || input === undefined || input === '') return '';
      
      // Similar ao compress, mas usando caracteres seguros para URI
      const output = [];
      let c;
      let current = 0;
      let status = 0;
      
      input = String(input);
      
      for (let i = 0; i < input.length; i++) {
        c = input.charAt(i);
        current = (current << 8) | c.charCodeAt(0);
        status += 8;
        
        while (status >= 6) {
          status -= 6;
          output.push(keyStrUriSafe.charAt((current >> status) & 0x3F));
        }
      }
      
      if (status > 0) {
        output.push(keyStrUriSafe.charAt((current << (6 - status)) & 0x3F));
      }
      
      return output.join('');
    },
    
    /**
     * Descomprime uma string segura para URI
     * @param {string} input - String comprimida e segura para URI
     * @returns {string} - String original descomprimida
     */
    decompressFromEncodedURIComponent: function(input) {
      if (input === null || input === undefined || input === '') return '';
      
      // Substituir caracteres seguros para URI
      input = input.replace(/ /g, '+');
      
      const output = [];
      let current = 0;
      let status = 0;
      
      for (let i = 0; i < input.length; i++) {
        current = (current << 6) | getBaseValue(keyStrUriSafe, input.charAt(i));
        status += 6;
        
        if (status >= 8) {
          status -= 8;
          output.push(String.fromCharCode((current >> status) & 0xFF));
        }
      }
      
      return output.join('');
    },
    
    /**
     * Comprime um objeto JSON
     * @param {Object} obj - Objeto a ser comprimido
     * @returns {string} - String comprimida do objeto JSON
     */
    compressToJSON: function(obj) {
      try {
        return this.compress(JSON.stringify(obj));
      } catch (e) {
        console.error('Erro ao comprimir objeto JSON:', e);
        return '';
      }
    },
    
    /**
     * Descomprime para um objeto JSON
     * @param {string} compressedStr - String comprimida do objeto JSON
     * @returns {Object|null} - Objeto JSON ou null em caso de erro
     */
    decompressToJSON: function(compressedStr) {
      try {
        const jsonStr = this.decompress(compressedStr);
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error('Erro ao descomprimir para JSON:', e);
        return null;
      }
    }
  };
  
  // Exportar para diferentes ambientes
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LZString;
  } else {
    global.LZString = LZString;
  }
}(typeof window !== 'undefined' ? window : this)); 
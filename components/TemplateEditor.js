/**
 * Editor de Templates com Drag-and-Drop
 * Permite criar e editar templates para cards de forma visual
 */
class TemplateEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container #${containerId} não encontrado`);
      return;
    }
    
    this.options = {
      ipfsService: null,
      onSave: null,
      onPreview: null,
      ...options
    };
    
    this.currentTemplate = null;
    this.elements = {};
    this.draggedElement = null;
    
    this.initialize();
  }
  
  /**
   * Inicializa o editor
   */
  initialize() {
    this.render();
    this.setupEventListeners();
    this.loadComponents();
  }
  
  /**
   * Renderiza a interface do editor
   */
  render() {
    this.container.innerHTML = `
      <div class="template-editor">
        <div class="editor-toolbar">
          <div class="toolbar-group">
            <button class="btn" id="save-template-btn"><i class="fas fa-save"></i> Salvar</button>
            <button class="btn" id="preview-template-btn"><i class="fas fa-eye"></i> Visualizar</button>
            <button class="btn" id="share-ipfs-btn"><i class="fas fa-cloud-upload-alt"></i> IPFS</button>
          </div>
          <div class="toolbar-group">
            <select id="template-theme-select">
              <option value="dark">Tema Escuro</option>
              <option value="light">Tema Claro</option>
              <option value="crypto">Tema Crypto</option>
              <option value="minimal">Tema Minimalista</option>
            </select>
          </div>
        </div>
        
        <div class="editor-workspace">
          <div class="components-panel">
            <h3>Componentes</h3>
            <div class="components-list" id="components-list">
              <div class="component-item" draggable="true" data-type="header">
                <i class="fas fa-heading"></i> Cabeçalho
              </div>
              <div class="component-item" draggable="true" data-type="text">
                <i class="fas fa-font"></i> Texto
              </div>
              <div class="component-item" draggable="true" data-type="image">
                <i class="fas fa-image"></i> Imagem
              </div>
              <div class="component-item" draggable="true" data-type="stats">
                <i class="fas fa-chart-bar"></i> Estatísticas
              </div>
              <div class="component-item" draggable="true" data-type="divider">
                <i class="fas fa-minus"></i> Divisor
              </div>
              <div class="component-item" draggable="true" data-type="button">
                <i class="fas fa-square"></i> Botão
              </div>
              <div class="component-item" draggable="true" data-type="footer">
                <i class="fas fa-shoe-prints"></i> Rodapé
              </div>
            </div>
          </div>
          
          <div class="canvas-container">
            <div class="template-canvas" id="template-canvas">
              <div class="placeholder-message">
                <i class="fas fa-arrow-left"></i>
                <p>Arraste componentes para começar a criar seu template</p>
              </div>
            </div>
          </div>
          
          <div class="properties-panel">
            <h3>Propriedades</h3>
            <div class="properties-content" id="properties-content">
              <p class="placeholder-message">Selecione um elemento para editar suas propriedades</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Adicionar estilos básicos
    const style = document.createElement('style');
    style.textContent = `
      .template-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #1E1E2E;
        color: #CDD6F4;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .editor-toolbar {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        background: #181825;
        border-bottom: 1px solid #313244;
      }
      
      .toolbar-group {
        display: flex;
        gap: 8px;
      }
      
      .editor-workspace {
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      
      .components-panel, .properties-panel {
        width: 250px;
        background: #181825;
        padding: 12px;
        border-right: 1px solid #313244;
        overflow-y: auto;
      }
      
      .properties-panel {
        border-right: none;
        border-left: 1px solid #313244;
      }
      
      .canvas-container {
        flex: 1;
        padding: 20px;
        overflow: auto;
        background: #11111B;
      }
      
      .template-canvas {
        min-height: 500px;
        background: #1E1E2E;
        border-radius: 8px;
        padding: 20px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .component-item {
        padding: 10px;
        background: #313244;
        margin-bottom: 8px;
        border-radius: 4px;
        cursor: grab;
        transition: all 0.2s;
        user-select: none;
      }
      
      .component-item:hover {
        background: #45475A;
      }
      
      .placeholder-message {
        text-align: center;
        color: #6C7086;
        padding: 20px;
      }
      
      .canvas-element {
        padding: 15px;
        background: rgba(49, 50, 68, 0.5);
        border: 1px dashed #6C7086;
        border-radius: 4px;
        margin-bottom: 10px;
        position: relative;
        transition: all 0.2s;
      }
      
      .canvas-element:hover {
        border-color: #CBA6F7;
      }
      
      .canvas-element.selected {
        border: 2px solid #CBA6F7;
        background: rgba(203, 166, 247, 0.1);
      }
      
      .element-controls {
        position: absolute;
        top: 5px;
        right: 5px;
        display: flex;
        gap: 5px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .canvas-element:hover .element-controls {
        opacity: 1;
      }
      
      .control-btn {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #11111B;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .btn {
        padding: 8px 12px;
        background: #45475A;
        border: none;
        border-radius: 4px;
        color: #CDD6F4;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .btn:hover {
        background: #585B70;
      }
      
      select {
        padding: 8px;
        background: #313244;
        border: none;
        border-radius: 4px;
        color: #CDD6F4;
      }
      
      .dropzone {
        border: 2px dashed #CBA6F7;
        background: rgba(203, 166, 247, 0.1);
      }
      
      .properties-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .property-group {
        margin-bottom: 10px;
      }
      
      .property-label {
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        color: #A6ADC8;
      }
      
      .property-input {
        width: 100%;
        padding: 8px;
        background: #313244;
        border: none;
        border-radius: 4px;
        color: #CDD6F4;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Configura os event listeners
   */
  setupEventListeners() {
    // Componentes arrastáveis
    const componentItems = this.container.querySelectorAll('.component-item');
    componentItems.forEach(item => {
      item.addEventListener('dragstart', this.handleDragStart.bind(this));
      item.addEventListener('dragend', this.handleDragEnd.bind(this));
    });
    
    // Canvas (área onde os elementos são soltos)
    const canvas = this.container.querySelector('#template-canvas');
    canvas.addEventListener('dragover', this.handleDragOver.bind(this));
    canvas.addEventListener('drop', this.handleDrop.bind(this));
    canvas.addEventListener('dragenter', this.handleDragEnter.bind(this));
    canvas.addEventListener('dragleave', this.handleDragLeave.bind(this));
    
    // Botões da toolbar
    this.container.querySelector('#save-template-btn').addEventListener('click', this.saveTemplate.bind(this));
    this.container.querySelector('#preview-template-btn').addEventListener('click', this.previewTemplate.bind(this));
    this.container.querySelector('#share-ipfs-btn').addEventListener('click', this.shareToIpfs.bind(this));
    
    // Seletor de tema
    this.container.querySelector('#template-theme-select').addEventListener('change', this.changeTheme.bind(this));
  }
  
  /**
   * Carrega os componentes disponíveis
   */
  loadComponents() {
    // Esta função pode carregar componentes de uma API ou arquivo de configuração
    // Por enquanto estamos usando os componentes definidos no HTML
  }
  
  // Handlers de arrastar e soltar
  handleDragStart(e) {
    this.draggedElement = e.target;
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
    e.dataTransfer.effectAllowed = 'copy';
  }
  
  handleDragEnd() {
    this.draggedElement = null;
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
  
  handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('template-canvas')) {
      e.target.classList.add('dropzone');
    }
  }
  
  handleDragLeave(e) {
    if (e.target.classList.contains('template-canvas')) {
      e.target.classList.remove('dropzone');
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    const canvas = this.container.querySelector('#template-canvas');
    canvas.classList.remove('dropzone');
    
    // Remover mensagem placeholder se existir
    const placeholder = canvas.querySelector('.placeholder-message');
    if (placeholder) {
      placeholder.remove();
    }
    
    const componentType = e.dataTransfer.getData('text/plain');
    this.addComponent(componentType, canvas);
  }
  
  /**
   * Adiciona um novo componente ao canvas
   */
  addComponent(type, canvas) {
    const elementId = `element-${Date.now()}`;
    const element = document.createElement('div');
    element.id = elementId;
    element.className = 'canvas-element';
    element.dataset.type = type;
    element.draggable = true;
    
    // Adicionar controles do elemento
    const controls = document.createElement('div');
    controls.className = 'element-controls';
    controls.innerHTML = `
      <div class="control-btn move-btn" title="Mover"><i class="fas fa-arrows-alt"></i></div>
      <div class="control-btn edit-btn" title="Editar"><i class="fas fa-edit"></i></div>
      <div class="control-btn delete-btn" title="Excluir"><i class="fas fa-trash"></i></div>
    `;
    
    // Conteúdo baseado no tipo
    let content = '';
    switch (type) {
      case 'header':
        content = `<div class="element-header">
                    <h2 contenteditable="true">Título do Cartão</h2>
                    <p contenteditable="true">Subtítulo ou descrição</p>
                  </div>`;
        break;
      case 'text':
        content = `<p contenteditable="true">Digite seu texto aqui. Este é um parágrafo de exemplo que pode ser editado diretamente.</p>`;
        break;
      case 'image':
        content = `<div class="element-image">
                    <div class="image-placeholder">
                      <i class="fas fa-image"></i>
                      <p>Imagem</p>
                    </div>
                  </div>`;
        break;
      case 'stats':
        content = `<div class="element-stats">
                    <div class="stat-item">
                      <div class="stat-value" contenteditable="true">42.5M</div>
                      <div class="stat-label" contenteditable="true">Total Supply</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value" contenteditable="true">$1.23</div>
                      <div class="stat-label" contenteditable="true">Preço</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value" contenteditable="true">+12.7%</div>
                      <div class="stat-label" contenteditable="true">24h</div>
                    </div>
                  </div>`;
        break;
      case 'divider':
        content = `<hr class="element-divider" />`;
        break;
      case 'button':
        content = `<button class="element-button" contenteditable="true">Botão de Ação</button>`;
        break;
      case 'footer':
        content = `<div class="element-footer">
                    <p contenteditable="true">© 2025 RUNES Analytics Pro • Bitcoin • Runes • Ordinals</p>
                  </div>`;
        break;
    }
    
    element.innerHTML = content;
    element.appendChild(controls);
    
    // Adicionar ao canvas
    canvas.appendChild(element);
    
    // Adicionar event listeners para este elemento
    this.setupElementListeners(element);
    
    // Selecionar o elemento recém-adicionado
    this.selectElement(element);
  }
  
  /**
   * Configura listeners para um elemento no canvas
   */
  setupElementListeners(element) {
    // Seleção de elemento
    element.addEventListener('click', (e) => {
      if (!e.target.classList.contains('control-btn') && 
          !e.target.closest('.control-btn')) {
        this.selectElement(element);
      }
    });
    
    // Botões de controle
    const moveBtn = element.querySelector('.move-btn');
    moveBtn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      element.draggable = true;
    });
    
    const editBtn = element.querySelector('.edit-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editElement(element);
    });
    
    const deleteBtn = element.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteElement(element);
    });
    
    // Drag and drop de elementos no canvas
    element.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      this.draggedElement = element;
      e.dataTransfer.setData('application/element-id', element.id);
      e.dataTransfer.effectAllowed = 'move';
    });
  }
  
  /**
   * Seleciona um elemento para edição
   */
  selectElement(element) {
    // Desselecionar elementos anteriores
    const selectedElements = this.container.querySelectorAll('.canvas-element.selected');
    selectedElements.forEach(el => el.classList.remove('selected'));
    
    // Selecionar o novo elemento
    element.classList.add('selected');
    
    // Mostrar propriedades
    this.showElementProperties(element);
  }
  
  /**
   * Exibe o painel de propriedades para o elemento selecionado
   */
  showElementProperties(element) {
    const propertiesPanel = this.container.querySelector('#properties-content');
    const type = element.dataset.type;
    
    let propertiesHTML = `
      <div class="properties-form">
        <div class="property-group">
          <label class="property-label">ID do Elemento</label>
          <input type="text" class="property-input" value="${element.id}" readonly>
        </div>
        <div class="property-group">
          <label class="property-label">Tipo</label>
          <input type="text" class="property-input" value="${type}" readonly>
        </div>
    `;
    
    // Propriedades específicas por tipo
    switch (type) {
      case 'header':
        propertiesHTML += `
          <div class="property-group">
            <label class="property-label">Título</label>
            <input type="text" class="property-input" id="header-title" 
              value="${element.querySelector('h2').textContent}">
          </div>
          <div class="property-group">
            <label class="property-label">Subtítulo</label>
            <input type="text" class="property-input" id="header-subtitle" 
              value="${element.querySelector('p').textContent}">
          </div>
        `;
        break;
      
      case 'text':
        propertiesHTML += `
          <div class="property-group">
            <label class="property-label">Texto</label>
            <textarea class="property-input" id="text-content" rows="4">${element.querySelector('p').textContent}</textarea>
          </div>
        `;
        break;
        
      // Adicionar mais casos para outros tipos
    }
    
    propertiesHTML += `
        <div class="property-group">
          <label class="property-label">CSS Personalizado</label>
          <textarea class="property-input" id="custom-css" rows="4" placeholder="Digite CSS personalizado"></textarea>
        </div>
        <button class="btn" id="apply-properties-btn">Aplicar Alterações</button>
      </div>
    `;
    
    propertiesPanel.innerHTML = propertiesHTML;
    
    // Adicionar listener para o botão de aplicar
    const applyBtn = propertiesPanel.querySelector('#apply-properties-btn');
    applyBtn.addEventListener('click', () => this.applyProperties(element));
  }
  
  /**
   * Aplica as propriedades editadas ao elemento
   */
  applyProperties(element) {
    const type = element.dataset.type;
    
    switch (type) {
      case 'header':
        const headerTitle = this.container.querySelector('#header-title').value;
        const headerSubtitle = this.container.querySelector('#header-subtitle').value;
        
        element.querySelector('h2').textContent = headerTitle;
        element.querySelector('p').textContent = headerSubtitle;
        break;
        
      case 'text':
        const textContent = this.container.querySelector('#text-content').value;
        element.querySelector('p').textContent = textContent;
        break;
        
      // Adicionar mais casos para outros tipos
    }
    
    // Aplicar CSS personalizado
    const customCSS = this.container.querySelector('#custom-css').value;
    if (customCSS) {
      element.style.cssText = customCSS;
    }
  }
  
  /**
   * Abre o editor de propriedades do elemento
   */
  editElement(element) {
    this.selectElement(element);
  }
  
  /**
   * Remove um elemento do canvas
   */
  deleteElement(element) {
    if (confirm('Tem certeza que deseja excluir este elemento?')) {
      element.remove();
    }
  }
  
  /**
   * Salva o template atual
   */
  saveTemplate() {
    const canvas = this.container.querySelector('#template-canvas');
    const elements = Array.from(canvas.querySelectorAll('.canvas-element'));
    
    const template = {
      id: `template-${Date.now()}`,
      name: 'Meu Template Personalizado',
      timestamp: new Date().toISOString(),
      theme: this.container.querySelector('#template-theme-select').value,
      elements: elements.map(element => {
        return {
          id: element.id,
          type: element.dataset.type,
          content: element.innerHTML,
          style: element.style.cssText
        };
      })
    };
    
    // Salvar localmente
    localStorage.setItem(`template-${template.id}`, JSON.stringify(template));
    
    // Callback se configurado
    if (typeof this.options.onSave === 'function') {
      this.options.onSave(template);
    }
    
    alert('Template salvo com sucesso!');
  }
  
  /**
   * Gera uma visualização do template atual
   */
  previewTemplate() {
    const canvas = this.container.querySelector('#template-canvas');
    const previewWindow = window.open('', '_blank');
    
    // Clonar o canvas sem os controles
    const clone = canvas.cloneNode(true);
    
    // Remover os controles dos elementos
    clone.querySelectorAll('.element-controls').forEach(el => el.remove());
    
    // Aplicar tema
    const theme = this.container.querySelector('#template-theme-select').value;
    
    // Estilos de tema
    const themeStyles = {
      dark: {
        background: '#1E1E2E',
        color: '#CDD6F4',
        accent: '#CBA6F7'
      },
      light: {
        background: '#EFF1F5',
        color: '#4C4F69',
        accent: '#8839EF'
      },
      crypto: {
        background: '#0F172A',
        color: '#E2E8F0',
        accent: '#F59E0B'
      },
      minimal: {
        background: '#FFFFFF',
        color: '#000000',
        accent: '#3B82F6'
      }
    };
    
    const selectedTheme = themeStyles[theme] || themeStyles.dark;
    
    // Criar conteúdo para o preview
    const previewContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview do Template</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: ${selectedTheme.background};
            color: ${selectedTheme.color};
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          
          .preview-container {
            max-width: 800px;
            width: 100%;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }
          
          .canvas-element {
            margin-bottom: 15px;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          
          .element-header h2 {
            color: ${selectedTheme.accent};
          }
          
          .element-button {
            background-color: ${selectedTheme.accent};
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
          }
          
          .element-stats {
            display: flex;
            justify-content: space-between;
          }
          
          .stat-item {
            text-align: center;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: ${selectedTheme.accent};
          }
          
          .element-divider {
            border: none;
            border-top: 1px solid rgba(127, 127, 127, 0.2);
            margin: 20px 0;
          }
          
          [contenteditable="true"] {
            outline: none;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          ${clone.innerHTML}
        </div>
      </body>
      </html>
    `;
    
    previewWindow.document.open();
    previewWindow.document.write(previewContent);
    previewWindow.document.close();
    
    // Callback se configurado
    if (typeof this.options.onPreview === 'function') {
      this.options.onPreview(previewContent);
    }
  }
  
  /**
   * Salva o template no IPFS
   */
  async shareToIpfs() {
    if (!this.options.ipfsService) {
      alert('Serviço IPFS não configurado!');
      return;
    }
    
    const canvas = this.container.querySelector('#template-canvas');
    const elements = Array.from(canvas.querySelectorAll('.canvas-element'));
    
    const template = {
      id: `template-${Date.now()}`,
      name: 'Meu Template Personalizado',
      timestamp: new Date().toISOString(),
      theme: this.container.querySelector('#template-theme-select').value,
      elements: elements.map(element => {
        return {
          id: element.id,
          type: element.dataset.type,
          content: element.innerHTML,
          style: element.style.cssText
        };
      })
    };
    
    try {
      const result = await this.options.ipfsService.saveToIpfs(template, {
        name: template.name,
        type: 'template',
        metadata: {
          theme: template.theme,
          elementCount: template.elements.length
        }
      });
      
      alert(`Template salvo no IPFS com sucesso!\nCID: ${result.cid}\nURL: ${result.url}`);
    } catch (error) {
      console.error('Erro ao salvar no IPFS:', error);
      alert(`Erro ao salvar no IPFS: ${error.message}`);
    }
  }
  
  /**
   * Muda o tema do template
   */
  changeTheme(e) {
    const theme = e.target.value;
    const canvas = this.container.querySelector('#template-canvas');
    
    // Remover classes de tema anteriores
    canvas.classList.remove('theme-dark', 'theme-light', 'theme-crypto', 'theme-minimal');
    
    // Adicionar nova classe de tema
    canvas.classList.add(`theme-${theme}`);
  }
  
  /**
   * Carrega um template existente
   */
  loadTemplate(template) {
    const canvas = this.container.querySelector('#template-canvas');
    
    // Limpar canvas
    canvas.innerHTML = '';
    
    // Definir tema
    if (template.theme) {
      this.container.querySelector('#template-theme-select').value = template.theme;
      this.changeTheme({ target: { value: template.theme } });
    }
    
    // Adicionar elementos
    template.elements.forEach(element => {
      const el = document.createElement('div');
      el.id = element.id;
      el.className = 'canvas-element';
      el.dataset.type = element.type;
      el.innerHTML = element.content;
      el.style.cssText = element.style;
      
      canvas.appendChild(el);
      this.setupElementListeners(el);
    });
  }
}

// Exportar para uso global
window.TemplateEditor = TemplateEditor; 
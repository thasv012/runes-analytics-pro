/**
 * RUNES Analytics Pro - Advanced Template UI
 * Interface para o gerenciamento avançado de templates
 */

// Inicializar o gerenciador de templates
const templateManager = new TemplateManager({
  storageKey: 'runes-templates-advanced',
  validateOnSave: true,
  enablePlugins: true
});

/**
 * Renderiza a seção de metadados avançados para um template
 * @param {Object} template - O template a ser exibido
 * @param {HTMLElement} container - O container onde será renderizado
 */
function renderAdvancedMetadata(template, container) {
  // Seção de metadados avançados
  const metaSection = document.createElement('div');
  metaSection.className = 'advanced-meta-section';
  
  // Título da seção
  const metaTitle = document.createElement('h3');
  metaTitle.textContent = 'Metadados Avançados';
  metaSection.appendChild(metaTitle);
  
  // Categoria
  const categoryContainer = document.createElement('div');
  categoryContainer.className = 'meta-item';
  
  const categoryLabel = document.createElement('span');
  categoryLabel.className = 'meta-label';
  categoryLabel.textContent = 'Categoria:';
  categoryContainer.appendChild(categoryLabel);
  
  const categoryValue = document.createElement('span');
  categoryValue.className = 'meta-value category-value';
  categoryValue.textContent = template.meta && template.meta.category 
    ? template.meta.category 
    : 'general';
  categoryContainer.appendChild(categoryValue);
  
  metaSection.appendChild(categoryContainer);
  
  // Tags
  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'meta-item';
  
  const tagsLabel = document.createElement('span');
  tagsLabel.className = 'meta-label';
  tagsLabel.textContent = 'Tags:';
  tagsContainer.appendChild(tagsLabel);
  
  const tagsValue = document.createElement('div');
  tagsValue.className = 'tags-container';
  
  // Renderizar tags
  const tags = template.meta && template.meta.tags ? template.meta.tags : [];
  tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.textContent = tag;
    tagsValue.appendChild(tagElement);
  });
  
  tagsContainer.appendChild(tagsValue);
  metaSection.appendChild(tagsContainer);
  
  // Reviews
  const reviewsContainer = document.createElement('div');
  reviewsContainer.className = 'reviews-container';
  
  const reviewsTitle = document.createElement('h4');
  reviewsTitle.textContent = 'Avaliações';
  reviewsContainer.appendChild(reviewsTitle);
  
  // Renderizar avaliações
  const reviews = template.reviews || [];
  if (reviews.length > 0) {
    reviews.forEach(review => {
      const reviewItem = document.createElement('div');
      reviewItem.className = 'review-item';
      
      const rating = document.createElement('div');
      rating.className = 'rating';
      rating.innerHTML = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      reviewItem.appendChild(rating);
      
      const comment = document.createElement('div');
      comment.className = 'review-comment';
      comment.textContent = review.comment;
      reviewItem.appendChild(comment);
      
      const date = document.createElement('div');
      date.className = 'review-date';
      date.textContent = new Date(review.date).toLocaleDateString();
      reviewItem.appendChild(date);
      
      reviewsContainer.appendChild(reviewItem);
    });
  } else {
    const noReviews = document.createElement('p');
    noReviews.className = 'no-reviews';
    noReviews.textContent = 'Nenhuma avaliação disponível.';
    reviewsContainer.appendChild(noReviews);
  }
  
  metaSection.appendChild(reviewsContainer);
  
  // Plugins
  const pluginsContainer = document.createElement('div');
  pluginsContainer.className = 'plugins-container';
  
  const pluginsTitle = document.createElement('h4');
  pluginsTitle.textContent = 'Plugins';
  pluginsContainer.appendChild(pluginsTitle);
  
  // Renderizar plugins
  const plugins = template.plugins || [];
  if (plugins.length > 0) {
    plugins.forEach(plugin => {
      const pluginItem = document.createElement('div');
      pluginItem.className = 'plugin-item';
      
      const pluginName = document.createElement('span');
      pluginName.className = 'plugin-name';
      pluginName.textContent = plugin.id;
      pluginItem.appendChild(pluginName);
      
      // Botão para carregar plugin
      const loadButton = document.createElement('button');
      loadButton.className = 'plugin-load-btn';
      loadButton.textContent = 'Carregar';
      loadButton.onclick = () => loadPlugin(plugin);
      pluginItem.appendChild(loadButton);
      
      pluginsContainer.appendChild(pluginItem);
    });
  } else {
    const noPlugins = document.createElement('p');
    noPlugins.className = 'no-plugins';
    noPlugins.textContent = 'Nenhum plugin disponível.';
    pluginsContainer.appendChild(noPlugins);
  }
  
  metaSection.appendChild(pluginsContainer);
  
  // Adicionar ao container
  container.appendChild(metaSection);
}

/**
 * Carrega um plugin do template
 * @param {Object} plugin - Plugin a ser carregado
 */
async function loadPlugin(plugin) {
  try {
    await templateManager.loadPlugin(plugin);
    showNotification(`Plugin ${plugin.id} carregado com sucesso!`, 'success');
  } catch (error) {
    showNotification(`Erro ao carregar plugin: ${error.message}`, 'error');
  }
}

/**
 * Salva um template no TemplateManager
 * @param {Object} template - Template a ser salvo
 */
function saveTemplate(template) {
  try {
    templateManager.validateTemplate(template);
    
    // Verificar se o template já existe
    const existingTemplate = templateManager.templates.find(t => t.id === template.id);
    
    if (existingTemplate) {
      templateManager.updateTemplate(template.id, template);
    } else {
      templateManager.addTemplate(template);
    }
    
    showNotification('Template salvo com sucesso no gerenciador!', 'success');
    return true;
  } catch (error) {
    showNotification(`Erro ao salvar template: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Abre modal para editar tags do template
 * @param {Object} template - Template a editar
 * @param {Function} onSave - Função de callback ao salvar
 */
function openTagsEditor(template, onSave) {
  // Criar modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Título do modal
  const title = document.createElement('h3');
  title.textContent = 'Editar Tags';
  modalContent.appendChild(title);
  
  // Input para tags
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.className = 'tags-input';
  tagsInput.placeholder = 'Digite as tags separadas por vírgulas';
  tagsInput.value = template.meta && template.meta.tags 
    ? template.meta.tags.join(', ') 
    : '';
  modalContent.appendChild(tagsInput);
  
  // Input para categoria
  const categoryContainer = document.createElement('div');
  categoryContainer.className = 'category-container';
  
  const categoryLabel = document.createElement('label');
  categoryLabel.textContent = 'Categoria:';
  categoryContainer.appendChild(categoryLabel);
  
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.className = 'category-input';
  categoryInput.placeholder = 'categoria/subcategoria (ex: finance/analytics)';
  categoryInput.value = template.meta && template.meta.category 
    ? template.meta.category 
    : 'general';
  categoryContainer.appendChild(categoryInput);
  
  modalContent.appendChild(categoryContainer);
  
  // Botões de ação
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancelar';
  cancelButton.onclick = () => document.body.removeChild(modal);
  actions.appendChild(cancelButton);
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Salvar';
  saveButton.className = 'primary-btn';
  saveButton.onclick = () => {
    // Processar as tags
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Atualizar o template
    if (!template.meta) template.meta = {};
    template.meta.tags = tags;
    template.meta.category = categoryInput.value.trim();
    
    // Fechar o modal
    document.body.removeChild(modal);
    
    // Callback
    if (typeof onSave === 'function') {
      onSave(template);
    }
  };
  actions.appendChild(saveButton);
  
  modalContent.appendChild(actions);
  modal.appendChild(modalContent);
  
  // Adicionar ao body
  document.body.appendChild(modal);
}

/**
 * Abre modal para adicionar uma avaliação
 * @param {Object} template - Template a avaliar
 * @param {Function} onSave - Função de callback ao salvar
 */
function openReviewEditor(template, onSave) {
  // Criar modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Título do modal
  const title = document.createElement('h3');
  title.textContent = 'Adicionar Avaliação';
  modalContent.appendChild(title);
  
  // Stars rating
  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'rating-container';
  
  const ratingLabel = document.createElement('label');
  ratingLabel.textContent = 'Avaliação:';
  ratingContainer.appendChild(ratingLabel);
  
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars-container';
  
  let selectedRating = 5;
  
  // Criar estrelas para seleção
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star selected';
    star.textContent = '★';
    star.dataset.value = i;
    
    star.onclick = (e) => {
      selectedRating = parseInt(e.target.dataset.value);
      
      // Atualizar estrelas
      const stars = starsContainer.querySelectorAll('.star');
      stars.forEach(s => {
        if (parseInt(s.dataset.value) <= selectedRating) {
          s.className = 'star selected';
        } else {
          s.className = 'star';
        }
      });
    };
    
    starsContainer.appendChild(star);
  }
  
  ratingContainer.appendChild(starsContainer);
  modalContent.appendChild(ratingContainer);
  
  // Comentário
  const commentContainer = document.createElement('div');
  commentContainer.className = 'comment-container';
  
  const commentLabel = document.createElement('label');
  commentLabel.textContent = 'Comentário:';
  commentContainer.appendChild(commentLabel);
  
  const commentInput = document.createElement('textarea');
  commentInput.className = 'comment-input';
  commentInput.placeholder = 'Digite seu comentário sobre o template';
  commentContainer.appendChild(commentInput);
  
  modalContent.appendChild(commentContainer);
  
  // Botões de ação
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancelar';
  cancelButton.onclick = () => document.body.removeChild(modal);
  actions.appendChild(cancelButton);
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Salvar';
  saveButton.className = 'primary-btn';
  saveButton.onclick = () => {
    // Validar
    if (commentInput.value.trim().length < 3) {
      showNotification('Por favor, digite um comentário válido', 'error');
      return;
    }
    
    // Criar avaliação
    const review = {
      rating: selectedRating,
      comment: commentInput.value.trim(),
      date: new Date().toISOString()
    };
    
    // Adicionar ao template
    if (!template.reviews) template.reviews = [];
    template.reviews.push(review);
    
    // Fechar o modal
    document.body.removeChild(modal);
    
    // Callback
    if (typeof onSave === 'function') {
      onSave(template);
    }
  };
  actions.appendChild(saveButton);
  
  modalContent.appendChild(actions);
  modal.appendChild(modalContent);
  
  // Adicionar ao body
  document.body.appendChild(modal);
}

// Exportar funções
window.AdvancedTemplateUI = {
  renderAdvancedMetadata,
  saveTemplate,
  openTagsEditor,
  openReviewEditor,
  templateManager
}; 
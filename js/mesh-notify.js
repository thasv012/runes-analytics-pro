/**
 * Módulo de notificações para o GPU Mesh
 * Fornece funções para notificar eventos importantes na rede GPU Mesh
 */

const NOTIFICATION_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug'
};

/**
 * Notifica o Owl (sistema de monitoramento) sobre eventos no GPU Mesh
 * @param {string} action - Ação ou evento sendo notificado
 * @param {Object} payload - Dados adicionais sobre o evento
 */
export function notifyOwl(action, payload = {}) {
  const timestamp = new Date().toISOString();
  console.log(`%c[Owl Notify] ${timestamp} - ${action}`, 'color: #6b57ff; font-weight: bold;', payload);

  // Futuro: integração com backend, Discord, Telegram, webhook etc
  // fetch('/notify-owl', { 
  //   method: 'POST', 
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ action, payload, timestamp }) 
  // })
  
  // Dispara um evento customizado que pode ser capturado por outros componentes
  const event = new CustomEvent('owl-notification', {
    detail: { action, payload, timestamp, level: NOTIFICATION_LEVELS.INFO }
  });
  
  window.dispatchEvent(event);
  
  return { action, timestamp, status: 'sent' };
}

/**
 * Notifica um erro no sistema GPU Mesh
 * @param {string} message - Mensagem de erro
 * @param {Object} data - Dados adicionais sobre o erro
 */
export function notifyError(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.error(`%c[Owl Error] ${timestamp} - ${message}`, 'color: #ef4444; font-weight: bold;', data);
  
  const event = new CustomEvent('owl-notification', {
    detail: { 
      action: 'error', 
      payload: { message, ...data }, 
      timestamp, 
      level: NOTIFICATION_LEVELS.ERROR 
    }
  });
  
  window.dispatchEvent(event);
  
  return { message, timestamp, status: 'error-sent' };
}

/**
 * Notifica um alerta no sistema GPU Mesh
 * @param {string} message - Mensagem de alerta
 * @param {Object} data - Dados adicionais sobre o alerta
 */
export function notifyWarning(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.warn(`%c[Owl Warning] ${timestamp} - ${message}`, 'color: #f59e0b; font-weight: bold;', data);
  
  const event = new CustomEvent('owl-notification', {
    detail: { 
      action: 'warning', 
      payload: { message, ...data }, 
      timestamp, 
      level: NOTIFICATION_LEVELS.WARNING 
    }
  });
  
  window.dispatchEvent(event);
  
  return { message, timestamp, status: 'warning-sent' };
}

/**
 * Notifica um sucesso no sistema GPU Mesh
 * @param {string} message - Mensagem de sucesso
 * @param {Object} data - Dados adicionais sobre o sucesso
 */
export function notifySuccess(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`%c[Owl Success] ${timestamp} - ${message}`, 'color: #10b981; font-weight: bold;', data);
  
  const event = new CustomEvent('owl-notification', {
    detail: { 
      action: 'success', 
      payload: { message, ...data }, 
      timestamp, 
      level: NOTIFICATION_LEVELS.SUCCESS 
    }
  });
  
  window.dispatchEvent(event);
  
  return { message, timestamp, status: 'success-sent' };
}

/**
 * Registra informações de depuração (apenas em ambiente de desenvolvimento)
 * @param {string} message - Mensagem de debug
 * @param {Object} data - Dados adicionais para debug
 */
export function notifyDebug(message, data = {}) {
  if (process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString();
    console.debug(`%c[Owl Debug] ${timestamp} - ${message}`, 'color: #94a3b8;', data);
    
    const event = new CustomEvent('owl-notification', {
      detail: { 
        action: 'debug', 
        payload: { message, ...data }, 
        timestamp, 
        level: NOTIFICATION_LEVELS.DEBUG 
      }
    });
    
    window.dispatchEvent(event);
    
    return { message, timestamp, status: 'debug-sent' };
  }
  
  return { status: 'debug-suppressed' };
}

// Monitora eventos críticos na rede GPU Mesh
window.addEventListener('gpu-mesh:critical-event', (event) => {
  const { type, message, data } = event.detail;
  
  switch (type) {
    case 'node-failure':
      notifyError(`Falha em nó GPU: ${message}`, data);
      break;
    case 'high-temperature':
      notifyWarning(`Temperatura elevada: ${message}`, data);
      break;
    case 'network-congestion':
      notifyWarning(`Congestionamento na rede: ${message}`, data);
      break;
    case 'task-success':
      notifySuccess(`Tarefa completada: ${message}`, data);
      break;
    default:
      notifyOwl(`Evento GPU Mesh: ${type}`, { message, ...data });
  }
});

export default {
  notifyOwl,
  notifyError,
  notifyWarning,
  notifySuccess,
  notifyDebug,
  LEVELS: NOTIFICATION_LEVELS
}; 
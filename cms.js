/**
 * CMS - Sistema de Gestión de Noticias
 * Funcionalidades: Agregar, editar, eliminar y gestionar noticias
 */

// ===== CONFIGURACIÓN =====
const CMS_CONFIG = {
    STORAGE_KEY: 'cms_news_data',
    MAX_NEWS: 50,
    DEFAULT_SOURCE: 'ELONCE'
};

// ===== VARIABLES GLOBALES =====
let newsData = [];
let currentEditingId = null;

// ===== ELEMENTOS DEL DOM =====
const elements = {
    newsForm: document.getElementById('newsForm'),
    newsList: document.getElementById('newsList'),
    totalNews: document.getElementById('totalNews'),
    publishedNews: document.getElementById('publishedNews'),
    draftNews: document.getElementById('draftNews'),
    autoRefresh: document.getElementById('autoRefresh'),
    maxNews: document.getElementById('maxNews'),
    fallbackNews: document.getElementById('fallbackNews')
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Obtiene la fecha actual formateada
 */
function getCurrentDate() {
    return new Date().toISOString();
}

/**
 * Genera un ID único para las noticias
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Valida los datos del formulario
 */
function validateForm(formData) {
    const errors = [];
    
    if (!formData.title || formData.title.trim().length < 5) {
        errors.push('El título debe tener al menos 5 caracteres');
    }
    
    if (!formData.description || formData.description.trim().length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
    }
    
    if (formData.image && !isValidUrl(formData.image)) {
        errors.push('La URL de la imagen no es válida');
    }
    
    if (formData.url && !isValidUrl(formData.url)) {
        errors.push('La URL de la noticia no es válida');
    }
    
    return errors;
}

/**
 * Valida si una URL es válida
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Muestra una notificación
 */
function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
            }
            .notification-success {
                background: #10b981;
            }
            .notification-error {
                background: #ef4444;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== FUNCIONES DE ALMACENAMIENTO =====

/**
 * Carga las noticias desde localStorage
 */
function loadNewsData() {
    try {
        const stored = localStorage.getItem(CMS_CONFIG.STORAGE_KEY);
        if (stored) {
            newsData = JSON.parse(stored);
        } else {
            newsData = [];
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        newsData = [];
    }
}

/**
 * Guarda las noticias en localStorage
 */
function saveNewsData() {
    try {
        localStorage.setItem(CMS_CONFIG.STORAGE_KEY, JSON.stringify(newsData));
        return true;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        showNotification('Error al guardar los datos', 'error');
        return false;
    }
}

/**
 * Sincroniza con el sitio principal
 */
function syncWithMainSite() {
    try {
        // Guardar en una clave que el sitio principal pueda leer
        localStorage.setItem('main_site_news', JSON.stringify(newsData));
        return true;
    } catch (error) {
        console.error('Error al sincronizar:', error);
        return false;
    }
}

// ===== FUNCIONES DE GESTIÓN DE NOTICIAS =====

/**
 * Agrega una nueva noticia
 */
function addNews(formData) {
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return false;
    }
    
    const newNews = {
        id: generateId(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        source: formData.source?.trim() || CMS_CONFIG.DEFAULT_SOURCE,
        image: formData.image?.trim() || '',
        url: formData.url?.trim() || '',
        category: formData.category || 'general',
        status: formData.status || 'published',
        publishedAt: getCurrentDate(),
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate()
    };
    
    newsData.unshift(newNews); // Agregar al inicio
    
    // Limitar el número máximo de noticias
    if (newsData.length > CMS_CONFIG.MAX_NEWS) {
        newsData = newsData.slice(0, CMS_CONFIG.MAX_NEWS);
    }
    
    if (saveNewsData() && syncWithMainSite()) {
        showNotification('Noticia agregada exitosamente');
        updateStats();
        renderNewsList();
        return true;
    }
    
    return false;
}

/**
 * Edita una noticia existente
 */
function editNews(id, formData) {
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return false;
    }
    
    const newsIndex = newsData.findIndex(news => news.id === id);
    if (newsIndex === -1) {
        showNotification('Noticia no encontrada', 'error');
        return false;
    }
    
    newsData[newsIndex] = {
        ...newsData[newsIndex],
        title: formData.title.trim(),
        description: formData.description.trim(),
        source: formData.source?.trim() || CMS_CONFIG.DEFAULT_SOURCE,
        image: formData.image?.trim() || '',
        url: formData.url?.trim() || '',
        category: formData.category || 'general',
        status: formData.status || 'published',
        updatedAt: getCurrentDate()
    };
    
    if (saveNewsData() && syncWithMainSite()) {
        showNotification('Noticia actualizada exitosamente');
        updateStats();
        renderNewsList();
        return true;
    }
    
    return false;
}

/**
 * Elimina una noticia
 */
function deleteNews(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
        return false;
    }
    
    const newsIndex = newsData.findIndex(news => news.id === id);
    if (newsIndex === -1) {
        showNotification('Noticia no encontrada', 'error');
        return false;
    }
    
    newsData.splice(newsIndex, 1);
    
    if (saveNewsData() && syncWithMainSite()) {
        showNotification('Noticia eliminada exitosamente');
        updateStats();
        renderNewsList();
        return true;
    }
    
    return false;
}

/**
 * Limpia todas las noticias
 */
function clearAllNews() {
    if (!confirm('¿Estás seguro de que quieres eliminar TODAS las noticias? Esta acción no se puede deshacer.')) {
        return;
    }
    
    newsData = [];
    
    if (saveNewsData() && syncWithMainSite()) {
        showNotification('Todas las noticias han sido eliminadas');
        updateStats();
        renderNewsList();
    }
}

// ===== FUNCIONES DE RENDERIZADO =====

/**
 * Actualiza las estadísticas
 */
function updateStats() {
    const total = newsData.length;
    const published = newsData.filter(news => news.status === 'published').length;
    const drafts = newsData.filter(news => news.status === 'draft').length;
    
    elements.totalNews.textContent = total;
    elements.publishedNews.textContent = published;
    elements.draftNews.textContent = drafts;
}

/**
 * Renderiza la lista de noticias
 */
function renderNewsList() {
    if (!elements.newsList) return;
    
    if (newsData.length === 0) {
        elements.newsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>No hay noticias</h3>
                <p>Agrega tu primera noticia usando el formulario de arriba.</p>
            </div>
        `;
        return;
    }
    
    const newsHTML = newsData.map(news => `
        <div class="news-item-cms">
            <div class="news-item-header">
                <h3 class="news-item-title">${news.title}</h3>
                <div class="news-item-meta">
                    <span class="news-status ${news.status}">${news.status === 'published' ? 'Publicada' : 'Borrador'}</span>
                    <span class="news-category">${news.category}</span>
                </div>
            </div>
            <p class="news-item-description">${news.description}</p>
            <div class="news-item-details">
                <div>
                    <strong>Fuente:</strong> ${news.source} | 
                    <strong>Creada:</strong> ${new Date(news.createdAt).toLocaleDateString('es-ES')}
                </div>
                <div class="news-item-actions">
                    <button class="btn-small btn-edit" onclick="editNewsForm('${news.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteNews('${news.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.newsList.innerHTML = newsHTML;
}

/**
 * Carga los datos del formulario para edición
 */
function editNewsForm(id) {
    const news = newsData.find(n => n.id === id);
    if (!news) {
        showNotification('Noticia no encontrada', 'error');
        return;
    }
    
    // Llenar el formulario
    document.getElementById('newsTitle').value = news.title;
    document.getElementById('newsDescription').value = news.description;
    document.getElementById('newsSource').value = news.source;
    document.getElementById('newsImage').value = news.image;
    document.getElementById('newsUrl').value = news.url;
    document.getElementById('newsCategory').value = news.category;
    document.getElementById('newsStatus').value = news.status;
    
    // Cambiar el botón de envío
    const submitBtn = elements.newsForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Noticia';
    submitBtn.onclick = (e) => {
        e.preventDefault();
        const formData = getFormData();
        if (editNews(id, formData)) {
            clearForm();
            currentEditingId = null;
        }
    };
    
    currentEditingId = id;
    
    // Scroll al formulario
    elements.newsForm.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Obtiene los datos del formulario
 */
function getFormData() {
    return {
        title: document.getElementById('newsTitle').value,
        description: document.getElementById('newsDescription').value,
        source: document.getElementById('newsSource').value,
        image: document.getElementById('newsImage').value,
        url: document.getElementById('newsUrl').value,
        category: document.getElementById('newsCategory').value,
        status: document.getElementById('newsStatus').value
    };
}

/**
 * Limpia el formulario
 */
function clearForm() {
    elements.newsForm.reset();
    currentEditingId = null;
    
    // Restaurar botón original
    const submitBtn = elements.newsForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Noticia';
    submitBtn.onclick = null;
}

/**
 * Actualiza la lista de noticias
 */
function refreshNewsList() {
    loadNewsData();
    updateStats();
    renderNewsList();
    showNotification('Lista actualizada');
}

// ===== FUNCIONES DE NAVEGACIÓN =====

/**
 * Abre el CMS (llamado desde el sitio principal)
 */
function openCMS() {
    window.open('cms.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

/**
 * Va al sitio principal
 */
function goToMainSite() {
    window.open('index.html', '_blank');
}

// ===== FUNCIONES DE CONFIGURACIÓN =====

/**
 * Carga la configuración
 */
function loadConfig() {
    try {
        const config = JSON.parse(localStorage.getItem('cms_config') || '{}');
        
        if (elements.autoRefresh) {
            elements.autoRefresh.checked = config.autoRefresh !== false;
        }
        
        if (elements.maxNews) {
            elements.maxNews.value = config.maxNews || 10;
        }
        
        if (elements.fallbackNews) {
            elements.fallbackNews.checked = config.fallbackNews !== false;
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

/**
 * Guarda la configuración
 */
function saveConfig() {
    try {
        const config = {
            autoRefresh: elements.autoRefresh?.checked,
            maxNews: parseInt(elements.maxNews?.value) || 10,
            fallbackNews: elements.fallbackNews?.checked
        };
        
        localStorage.setItem('cms_config', JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        return false;
    }
}

// ===== EVENT LISTENERS =====

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Formulario de noticias
    if (elements.newsForm) {
        elements.newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (currentEditingId) {
                const formData = getFormData();
                if (editNews(currentEditingId, formData)) {
                    clearForm();
                }
            } else {
                const formData = getFormData();
                if (addNews(formData)) {
                    clearForm();
                }
            }
        });
    }
    
    // Configuración
    if (elements.autoRefresh) {
        elements.autoRefresh.addEventListener('change', saveConfig);
    }
    
    if (elements.maxNews) {
        elements.maxNews.addEventListener('change', saveConfig);
    }
    
    if (elements.fallbackNews) {
        elements.fallbackNews.addEventListener('change', saveConfig);
    }
    
    // Auto-guardar configuración
    const configInputs = document.querySelectorAll('#autoRefresh, #maxNews, #fallbackNews');
    configInputs.forEach(input => {
        if (input) {
            input.addEventListener('change', saveConfig);
        }
    });
}

// ===== INICIALIZACIÓN =====

/**
 * Inicializa el CMS
 */
function initCMS() {
    console.log('🚀 Inicializando CMS...');
    
    try {
        // Cargar datos y configuración
        loadNewsData();
        loadConfig();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Renderizar interfaz
        updateStats();
        renderNewsList();
        
        console.log('✅ CMS inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar CMS:', error);
        showNotification('Error al inicializar el CMS', 'error');
    }
}

// ===== INICIO DE LA APLICACIÓN =====

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMS);
} else {
    initCMS();
}

// Exportar funciones para uso global
window.CMS = {
    openCMS,
    addNews,
    editNews,
    deleteNews,
    clearAllNews,
    refreshNewsList,
    loadNewsData,
    saveNewsData,
    syncWithMainSite
};

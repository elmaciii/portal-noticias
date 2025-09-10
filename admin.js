/**
 * Panel de Administración - ELONCE
 * Sistema de gestión de contenido para noticias
 */

// ===== VARIABLES GLOBALES =====
let currentTab = 'news';
let isAuthenticated = false;
let currentEditingNews = null;

// ===== CONFIGURACIÓN PROFESIONAL =====
// ADMIN_CONFIG está definido en config.js

// ===== FUNCIONES DE AUTENTICACIÓN =====

/**
 * Verifica si el usuario está autenticado
 */
function checkAuthentication() {
    try {
        const session = localStorage.getItem(ADMIN_CONFIG.SESSION_KEY);
        if (!session) return false;
        
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();
        
        if (now > sessionData.expires) {
            localStorage.removeItem(ADMIN_CONFIG.SESSION_KEY);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        return false;
    }
}

/**
 * Inicia sesión
 */
function login(username, password) {
    if (username === ADMIN_CONFIG.DEFAULT_CREDENTIALS.username && 
        password === ADMIN_CONFIG.DEFAULT_CREDENTIALS.password) {
        
        const sessionData = {
            username: username,
            loginTime: new Date().getTime(),
            expires: new Date().getTime() + ADMIN_CONFIG.SESSION_DURATION
        };
        
        localStorage.setItem(ADMIN_CONFIG.SESSION_KEY, JSON.stringify(sessionData));
        isAuthenticated = true;
        return true;
    }
    return false;
}

/**
 * Cierra sesión
 */
function logout() {
    localStorage.removeItem(ADMIN_CONFIG.SESSION_KEY);
    isAuthenticated = false;
    showLoginForm();
}

/**
 * Muestra el formulario de login
 */
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
}

/**
 * Muestra el panel de administración
 */
function showAdminPanel() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAdminData();
}

// ===== FUNCIONES DE NAVEGACIÓN =====

/**
 * Muestra una pestaña específica
 */
function showTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remover clase active de todos los tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Marcar el tab como activo
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    currentTab = tabName;
    
    // Cargar datos específicos de la pestaña
    switch (tabName) {
        case 'news':
            loadNewsList();
            break;
        case 'stats':
            loadStats();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ===== FUNCIONES DE NOTICIAS =====

/**
 * Carga la lista de noticias
 */
function loadNewsList() {
    try {
        const result = window.Backend.getNews();
        if (result.success) {
            renderNewsList(result.data);
        } else {
            showAlert('Error al cargar noticias: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        showAlert('Error al cargar noticias', 'error');
    }
}

/**
 * Renderiza la lista de noticias
 */
function renderNewsList(news) {
    const newsList = document.getElementById('newsList');
    
    if (news.length === 0) {
        newsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No hay noticias</h3>
                <p>Agrega tu primera noticia usando la pestaña "Agregar Noticia"</p>
            </div>
        `;
        return;
    }
    
    const newsHTML = news.map(article => `
        <div class="news-item-admin">
            <div class="news-item-header">
                <div>
                    <h3 class="news-item-title">${escapeHtml(article.title)}</h3>
                    <div class="news-item-meta">
                        <span><i class="fas fa-folder"></i> ${article.category}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(article.publishedAt)}</span>
                        <span><i class="fas fa-eye"></i> ${article.views || 0} vistas</span>
                        <span><i class="fas fa-heart"></i> ${article.likes || 0} likes</span>
                    </div>
                </div>
                <div>
                    <span class="badge ${article.status === 'published' ? 'badge-success' : 'badge-warning'}">
                        ${article.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                </div>
            </div>
            
            <div class="news-item-description">
                ${escapeHtml(article.description)}
            </div>
            
            <div class="news-item-actions">
                <button class="btn btn-secondary" onclick="editNews('${article.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger" onclick="deleteNews('${article.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
                <button class="btn" onclick="duplicateNews('${article.id}')">
                    <i class="fas fa-copy"></i> Duplicar
                </button>
                ${article.status === 'published' ? 
                    `<button class="btn btn-secondary" onclick="unpublishNews('${article.id}')">
                        <i class="fas fa-eye-slash"></i> Despublicar
                    </button>` :
                    `<button class="btn btn-success" onclick="publishNews('${article.id}')">
                        <i class="fas fa-eye"></i> Publicar
                    </button>`
                }
            </div>
        </div>
    `).join('');
    
    newsList.innerHTML = newsHTML;
}

/**
 * Agrega una nueva noticia
 */
function addNews(newsData) {
    try {
        const result = window.Backend.createNews(newsData);
        if (result.success) {
            showAlert('Noticia creada exitosamente', 'success');
            clearForm();
            loadNewsList();
            // Sincronizar automáticamente
            autoSyncWithGitHub();
        } else {
            showAlert('Error al crear noticia: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al crear noticia:', error);
        showAlert('Error al crear noticia', 'error');
    }
}

/**
 * Edita una noticia existente
 */
function editNews(id) {
    try {
        const result = window.Backend.getNewsById(id);
        if (result.success) {
            currentEditingNews = result.data;
            fillEditForm(result.data);
            showTab('add-news');
        } else {
            showAlert('Error al cargar noticia: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al editar noticia:', error);
        showAlert('Error al editar noticia', 'error');
    }
}

/**
 * Actualiza una noticia
 */
function updateNews(id, updateData) {
    try {
        const result = window.Backend.updateNews(id, updateData);
        if (result.success) {
            showAlert('Noticia actualizada exitosamente', 'success');
            currentEditingNews = null;
            clearForm();
            loadNewsList();
            // Sincronizar automáticamente
            autoSyncWithGitHub();
        } else {
            showAlert('Error al actualizar noticia: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al actualizar noticia:', error);
        showAlert('Error al actualizar noticia', 'error');
    }
}

/**
 * Elimina una noticia
 */
function deleteNews(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
        try {
            const result = window.Backend.deleteNews(id);
            if (result.success) {
                showAlert('Noticia eliminada exitosamente', 'success');
                loadNewsList();
                // Sincronizar automáticamente
                autoSyncWithGitHub();
            } else {
                showAlert('Error al eliminar noticia: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            showAlert('Error al eliminar noticia', 'error');
        }
    }
}

/**
 * Duplica una noticia
 */
function duplicateNews(id) {
    try {
        const result = window.Backend.getNewsById(id);
        if (result.success) {
            const originalNews = result.data;
            const duplicatedNews = {
                ...originalNews,
                title: originalNews.title + ' (Copia)',
                status: 'draft'
            };
            
            const createResult = window.Backend.createNews(duplicatedNews);
            if (createResult.success) {
                showAlert('Noticia duplicada exitosamente', 'success');
                loadNewsList();
            } else {
                showAlert('Error al duplicar noticia: ' + createResult.error, 'error');
            }
        } else {
            showAlert('Error al duplicar noticia: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al duplicar noticia:', error);
        showAlert('Error al duplicar noticia', 'error');
    }
}

/**
 * Publica una noticia
 */
function publishNews(id) {
    try {
        const result = window.Backend.updateNews(id, { 
            status: 'published',
            publishedAt: new Date().toISOString()
        });
        if (result.success) {
            showAlert('Noticia publicada exitosamente', 'success');
            loadNewsList();
            // Sincronizar automáticamente
            autoSyncWithGitHub();
        } else {
            showAlert('Error al publicar noticia: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al publicar noticia:', error);
        showAlert('Error al publicar noticia', 'error');
    }
}

/**
 * Despublica una noticia
 */
function unpublishNews(id) {
    try {
        const result = window.Backend.updateNews(id, { status: 'draft' });
        if (result.success) {
            showAlert('Noticia despublicada exitosamente', 'success');
            loadNewsList();
            syncWithMainSite();
        } else {
            showAlert('Error al despublicar noticia: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error al despublicar noticia:', error);
        showAlert('Error al despublicar noticia', 'error');
    }
}

// ===== FUNCIONES DE FORMULARIO =====

/**
 * Llena el formulario para edición
 */
function fillEditForm(news) {
    document.getElementById('newsTitle').value = news.title;
    document.getElementById('newsDescription').value = news.description;
    document.getElementById('newsContent').value = news.content || news.description;
    document.getElementById('newsCategory').value = news.category;
    document.getElementById('newsSource').value = news.source;
    document.getElementById('newsUrl').value = news.url;
    document.getElementById('newsImageUrl').value = news.image;
    document.getElementById('newsStatus').value = news.status;
    
    // Mostrar preview de imagen si existe
    if (news.image) {
        showImagePreview(news.image);
    }
}

/**
 * Limpia el formulario
 */
function clearForm() {
    document.getElementById('addNewsForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    currentEditingNews = null;
}

/**
 * Maneja la selección de imagen
 */
function handleImageSelection() {
    const fileInput = document.getElementById('newsImage');
    const urlInput = document.getElementById('newsImageUrl');
    
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            showImagePreview(e.target.result);
            urlInput.value = e.target.result;
        };
        
        reader.readAsDataURL(file);
    } else if (urlInput.value) {
        showImagePreview(urlInput.value);
    }
}

/**
 * Muestra preview de imagen
 */
function showImagePreview(imageUrl) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `
        <img src="${imageUrl}" alt="Preview" class="image-preview" 
             onerror="this.style.display='none'">
    `;
}

// ===== FUNCIONES DE ESTADÍSTICAS =====

/**
 * Carga las estadísticas
 */
function loadStats() {
    try {
        const newsResult = window.Backend.getNews();
        const analyticsResult = window.Backend.getAnalytics();
        
        if (newsResult.success) {
            updateStatsDisplay(newsResult.data, analyticsResult);
        } else {
            showAlert('Error al cargar estadísticas', 'error');
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        showAlert('Error al cargar estadísticas', 'error');
    }
}

/**
 * Actualiza la visualización de estadísticas
 */
function updateStatsDisplay(news, analytics) {
    // Estadísticas generales
    document.getElementById('totalNews').textContent = news.length;
    document.getElementById('publishedNews').textContent = news.filter(n => n.status === 'published').length;
    document.getElementById('draftNews').textContent = news.filter(n => n.status === 'draft').length;
    
    // Contar comentarios
    const comments = window.Backend.getComments();
    document.getElementById('totalComments').textContent = comments.length;
    
    // Estadísticas por categoría
    const categoryStats = {};
    news.forEach(article => {
        categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
    });
    
    const categoryStatsHTML = Object.entries(categoryStats).map(([category, count]) => `
        <div class="stat-card">
            <div class="stat-number">${count}</div>
            <div class="stat-label">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
        </div>
    `).join('');
    
    document.getElementById('categoryStats').innerHTML = categoryStatsHTML;
}

// ===== FUNCIONES DE CONFIGURACIÓN =====

/**
 * Carga la configuración
 */
function loadSettings() {
    try {
        const settings = window.Backend.getSettings();
        
        document.getElementById('siteName').value = settings.site_name || '';
        document.getElementById('siteDescription').value = settings.site_description || '';
        document.getElementById('radioUrl').value = settings.radio_url || '';
        document.getElementById('updateInterval').value = settings.update_interval || 60000;
        document.getElementById('autoUpdate').checked = settings.auto_update || false;
        document.getElementById('enableComments').checked = settings.enable_comments !== false;
        document.getElementById('enableAnalytics').checked = settings.enable_analytics !== false;
    } catch (error) {
        console.error('Error al cargar configuración:', error);
        showAlert('Error al cargar configuración', 'error');
    }
}

/**
 * Guarda la configuración
 */
function saveSettings() {
    try {
        const settings = {
            site_name: document.getElementById('siteName').value,
            site_description: document.getElementById('siteDescription').value,
            radio_url: document.getElementById('radioUrl').value,
            update_interval: parseInt(document.getElementById('updateInterval').value),
            auto_update: document.getElementById('autoUpdate').checked,
            enable_comments: document.getElementById('enableComments').checked,
            enable_analytics: document.getElementById('enableAnalytics').checked
        };
        
        const result = window.Backend.setSettings(settings);
        if (result) {
            showAlert('Configuración guardada exitosamente', 'success');
        } else {
            showAlert('Error al guardar configuración', 'error');
        }
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        showAlert('Error al guardar configuración', 'error');
    }
}

// ===== FUNCIONES DE SINCRONIZACIÓN =====

/**
 * Sincroniza con el sitio principal
 */
function syncWithMainSite() {
    try {
        console.log('🔄 Iniciando sincronización con sitio principal...');
        
        // Obtener noticias del CMS
        const cmsResult = window.Backend.getNews({ status: 'published' });
        if (!cmsResult.success) {
            console.error('❌ Error al obtener noticias del CMS:', cmsResult.error);
            showAlert('Error al sincronizar: ' + cmsResult.error, 'error');
            return;
        }
        
        console.log('📝 Noticias del CMS obtenidas:', cmsResult.data.length);
        
        // Guardar en localStorage del sitio principal
        localStorage.setItem('main_site_news', JSON.stringify(cmsResult.data));
        
        // Crear archivo JSON para compartir entre dispositivos
        const cmsData = {
            version: "1.0.0",
            name: "Noticias del CMS",
            description: "Archivo compartido de noticias del CMS",
            lastUpdate: new Date().toISOString(),
            articles: cmsResult.data
        };
        
        // Crear y descargar el archivo cms-news.json
        const blob = new Blob([JSON.stringify(cmsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cms-news.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Sincronización completada. Noticias guardadas en main_site_news y cms-news.json descargado');
        showAlert('Sincronización completada. Archivo cms-news.json descargado para compartir entre dispositivos', 'success');
        
        // Verificar que se guardó correctamente
        const savedData = localStorage.getItem('main_site_news');
        console.log('🔍 Verificación - Datos guardados:', savedData ? 'SÍ' : 'NO');
        
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        showAlert('Error al sincronizar: ' + error.message, 'error');
    }
}

/**
 * Sincronización automática con GitHub (sin descarga)
 */
function autoSyncWithGitHub() {
    try {
        console.log('🔄 Iniciando sincronización automática...');
        
        // Obtener noticias del CMS
        const cmsResult = window.Backend.getNews({ status: 'published' });
        if (!cmsResult.success) {
            console.error('❌ Error al obtener noticias del CMS:', cmsResult.error);
            return;
        }
        
        console.log('📝 Noticias del CMS obtenidas:', cmsResult.data.length);
        
        // Guardar en localStorage del sitio principal
        localStorage.setItem('main_site_news', JSON.stringify(cmsResult.data));
        
        // Crear archivo JSON para compartir entre dispositivos
        const cmsData = {
            version: "1.0.0",
            name: "Noticias del CMS",
            description: "Archivo compartido de noticias del CMS",
            lastUpdate: new Date().toISOString(),
            articles: cmsResult.data
        };
        
        // Crear y descargar el archivo cms-news.json automáticamente
        const blob = new Blob([JSON.stringify(cmsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cms-news.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Sincronización automática completada. Archivo cms-news.json descargado');
        
        // Mostrar instrucciones para subir a GitHub
        showAlert('✅ Cambios guardados. Se descargó cms-news.json. Sube este archivo a GitHub para que todos vean los cambios.', 'success');
        
    } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
        showAlert('Error en sincronización automática: ' + error.message, 'error');
    }
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Muestra una alerta
 */
function showAlert(message, type) {
    const alertDiv = document.getElementById('loginAlert');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.classList.remove('hidden');
    
    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Escapa HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formatea fecha
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Llena credenciales automáticamente
 */
function fillCredentials() {
    document.getElementById('username').value = ADMIN_CONFIG.DEFAULT_CREDENTIALS.username;
    document.getElementById('password').value = ADMIN_CONFIG.DEFAULT_CREDENTIALS.password;
}

/**
 * Actualiza la lista de noticias
 */
function refreshNewsList() {
    loadNewsList();
    showAlert('Lista de noticias actualizada', 'success');
}

/**
 * Carga datos del admin
 */
function loadAdminData() {
    loadNewsList();
    loadStats();
    loadSettings();
}

// ===== EVENT LISTENERS =====

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (login(username, password)) {
            showAdminPanel();
        } else {
            showAlert('Credenciales incorrectas', 'error');
        }
    });
    
    // Add news form
    document.getElementById('addNewsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('newsTitle').value,
            description: document.getElementById('newsDescription').value,
            content: document.getElementById('newsContent').value,
            category: document.getElementById('newsCategory').value,
            source: document.getElementById('newsSource').value,
            url: document.getElementById('newsUrl').value,
            image: document.getElementById('newsImageUrl').value,
            status: document.getElementById('newsStatus').value
        };
        
        if (currentEditingNews) {
            updateNews(currentEditingNews.id, formData);
        } else {
            addNews(formData);
        }
    });
    
    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });
    
    // Image handling
    document.getElementById('newsImage').addEventListener('change', handleImageSelection);
    document.getElementById('newsImageUrl').addEventListener('input', handleImageSelection);
}

// ===== INICIALIZACIÓN =====

/**
 * Inicializa la aplicación
 */
function initAdmin() {
    console.log('🚀 Inicializando Panel de Administración...');
    
    try {
        // Verificar autenticación
        if (checkAuthentication()) {
            isAuthenticated = true;
            showAdminPanel();
        } else {
            showLoginForm();
        }
        
        // Configurar event listeners
        setupEventListeners();
        
        console.log('✅ Panel de Administración inicializado');
        
    } catch (error) {
        console.error('❌ Error al inicializar panel de administración:', error);
        showAlert('Error al inicializar el panel', 'error');
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', initAdmin);

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.Admin = {
    syncWithMainSite,
    loadNewsList,
    addNews,
    editNews,
    updateNews,
    deleteNews,
    duplicateNews,
    publishNews,
    unpublishNews,
    loadStats,
    loadSettings,
    saveSettings,
    clearForm,
    showTab,
    logout
};
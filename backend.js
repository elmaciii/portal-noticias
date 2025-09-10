/**
 * Backend Simulado - Sistema de Noticias
 * Simula un backend real usando LocalStorage
 */

// ===== CONFIGURACIÓN DEL BACKEND PROFESIONAL =====
const BACKEND_CONFIG = {
    version: '2.0.0',
    name: 'Backend Profesional Simulado',
    description: 'Sistema de backend profesional simulado para noticias',
    author: 'Portal de Noticias Profesional',
    lastUpdate: new Date().toISOString(),
    
    // Claves de almacenamiento
    NEWS_KEY: 'backend_news_v2',
    COMMENTS_KEY: 'backend_comments_v2',
    ANALYTICS_KEY: 'backend_analytics_v2',
    USERS_KEY: 'backend_users_v2',
    SETTINGS_KEY: 'backend_settings_v2',
    CATEGORIES_KEY: 'backend_categories_v2',
    
    // Límites profesionales
    MAX_NEWS: 10000,
    MAX_COMMENTS: 50000,
    MAX_ANALYTICS: 100000,
    MAX_USERS: 1000,
    
    // Configuración por defecto profesional
    DEFAULT_SETTINGS: {
        site_name: 'Portal de Noticias Profesional',
        site_description: 'Portal profesional de noticias en tiempo real',
        theme: 'light',
        auto_update: true,
        update_interval: 30000,
        max_news_per_page: 20,
        enable_comments: true,
        enable_analytics: true,
        radio_enabled: true,
        search_enabled: true,
        categories_enabled: true,
        notifications_enabled: true,
        pwa_enabled: true,
        radio_url: 'https://stream-ssl.radiosenlinea.com.ar:18069/'
    }
};

// ===== CLASE BACKEND SIMULADO =====
class SimulatedBackend {
    constructor() {
        this.initializeDefaultData();
        console.log('🚀 Inicializando Backend Simulado...');
    }

    // ===== MÉTODOS DE INICIALIZACIÓN =====
    
    /**
     * Inicializa datos por defecto
     */
    initializeDefaultData() {
        try {
            // Verificar si ya existen datos
            const existingNews = localStorage.getItem(BACKEND_CONFIG.NEWS_KEY);
            const existingSettings = localStorage.getItem(BACKEND_CONFIG.SETTINGS_KEY);
            
            if (!existingNews) {
                this.initializeDefaultNews();
            }
            
            if (!existingSettings) {
                this.setSettings(BACKEND_CONFIG.DEFAULT_SETTINGS);
            }
            
            console.log('✅ Backend inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar backend:', error);
        }
    }

    /**
     * Inicializa noticias por defecto
     */
    initializeDefaultNews() {
        const defaultNews = [
            {
                id: 'default-1',
                title: 'Bienvenido a ELONCE',
                description: 'Tu fuente de noticias confiable las 24 horas del día.',
                content: 'ELONCE te brinda las últimas noticias de Paraná, Argentina y el mundo.',
                url: '#',
                image: 'https://via.placeholder.com/400x200?text=ELONCE',
                source: 'ELONCE',
                category: 'general',
                status: 'published',
                publishedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                views: 0,
                likes: 0,
                shares: 0
            }
        ];
        
        this.saveNews(defaultNews);
    }

    // ===== MÉTODOS DE NOTICIAS =====

    /**
     * Obtiene todas las noticias
     */
    getNews(filters = {}) {
        try {
            const news = JSON.parse(localStorage.getItem(BACKEND_CONFIG.NEWS_KEY) || '[]');
            
            // Aplicar filtros
            let filteredNews = news;
            
            if (filters.category && filters.category !== 'all') {
                filteredNews = filteredNews.filter(article => 
                    article.category === filters.category
                );
            }
            
            if (filters.status) {
                filteredNews = filteredNews.filter(article => 
                    article.status === filters.status
                );
            }
            
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredNews = filteredNews.filter(article => 
                    article.title.toLowerCase().includes(searchTerm) ||
                    article.description.toLowerCase().includes(searchTerm) ||
                    article.content.toLowerCase().includes(searchTerm)
                );
            }
            
            // Ordenar por fecha de publicación (más recientes primero)
            filteredNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            
            // Aplicar paginación
            if (filters.limit) {
                const offset = filters.offset || 0;
                filteredNews = filteredNews.slice(offset, offset + filters.limit);
            }
            
            return {
                success: true,
                data: filteredNews,
                total: news.length,
                filtered: filteredNews.length
            };
        } catch (error) {
            console.error('Error al obtener noticias:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Obtiene una noticia por ID
     */
    getNewsById(id) {
        try {
            const news = JSON.parse(localStorage.getItem(BACKEND_CONFIG.NEWS_KEY) || '[]');
            const article = news.find(item => item.id === id);
            
            if (article) {
                // Incrementar contador de vistas
                article.views = (article.views || 0) + 1;
                this.saveNews(news);
                
                return {
                    success: true,
                    data: article
                };
            } else {
                return {
                    success: false,
                    error: 'Noticia no encontrada',
                    data: null
                };
            }
        } catch (error) {
            console.error('Error al obtener noticia:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Crea una nueva noticia
     */
    createNews(newsData) {
        try {
            const news = JSON.parse(localStorage.getItem(BACKEND_CONFIG.NEWS_KEY) || '[]');
            
            const newArticle = {
                id: this.generateId(),
                title: newsData.title,
                description: newsData.description,
                content: newsData.content || newsData.description,
                url: newsData.url || '#',
                image: newsData.image || 'https://via.placeholder.com/400x200?text=Sin+Imagen',
                source: newsData.source || 'ELONCE',
                category: newsData.category || 'general',
                status: newsData.status || 'published',
                publishedAt: newsData.publishedAt || new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                views: 0,
                likes: 0,
                shares: 0
            };
            
            news.unshift(newArticle); // Agregar al inicio
            
            // Limitar número de noticias
            if (news.length > BACKEND_CONFIG.MAX_NEWS) {
                news.splice(BACKEND_CONFIG.MAX_NEWS);
            }
            
            this.saveNews(news);
            
            return {
                success: true,
                data: newArticle,
                message: 'Noticia creada exitosamente'
            };
        } catch (error) {
            console.error('Error al crear noticia:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Actualiza una noticia existente
     */
    updateNews(id, updateData) {
        try {
            const news = JSON.parse(localStorage.getItem(BACKEND_CONFIG.NEWS_KEY) || '[]');
            const articleIndex = news.findIndex(item => item.id === id);
            
            if (articleIndex === -1) {
                return {
                    success: false,
                    error: 'Noticia no encontrada',
                    data: null
                };
            }
            
            // Actualizar datos
            news[articleIndex] = {
                ...news[articleIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            
            this.saveNews(news);
            
            return {
                success: true,
                data: news[articleIndex],
                message: 'Noticia actualizada exitosamente'
            };
        } catch (error) {
            console.error('Error al actualizar noticia:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Elimina una noticia
     */
    deleteNews(id) {
        try {
            const news = JSON.parse(localStorage.getItem(BACKEND_CONFIG.NEWS_KEY) || '[]');
            const filteredNews = news.filter(item => item.id !== id);
            
            if (filteredNews.length === news.length) {
                return {
                    success: false,
                    error: 'Noticia no encontrada',
                    data: null
                };
            }
            
            this.saveNews(filteredNews);
            
            return {
                success: true,
                message: 'Noticia eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Guarda noticias en localStorage
     */
    saveNews(news) {
        localStorage.setItem(BACKEND_CONFIG.NEWS_KEY, JSON.stringify(news));
    }

    // ===== MÉTODOS DE COMENTARIOS =====

    /**
     * Obtiene comentarios
     */
    getComments(newsId = null) {
        try {
            const comments = JSON.parse(localStorage.getItem(BACKEND_CONFIG.COMMENTS_KEY) || '[]');
            
            if (newsId) {
                return comments.filter(comment => comment.newsId === newsId);
            }
            
            return comments;
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            return [];
        }
    }

    /**
     * Crea un nuevo comentario
     */
    createComment(commentData) {
        try {
            const comments = JSON.parse(localStorage.getItem(BACKEND_CONFIG.COMMENTS_KEY) || '[]');
            
            const newComment = {
                id: this.generateId(),
                newsId: commentData.newsId,
                author: commentData.author || 'Anónimo',
                content: commentData.content,
                timestamp: new Date().toISOString(),
                likes: 0,
                dislikes: 0,
                replies: []
            };
            
            comments.push(newComment);
            
            // Limitar número de comentarios
            if (comments.length > BACKEND_CONFIG.MAX_COMMENTS) {
                comments.splice(BACKEND_CONFIG.MAX_COMMENTS);
            }
            
            this.saveComments(comments);
            
            return {
                success: true,
                data: newComment,
                message: 'Comentario creado exitosamente'
            };
        } catch (error) {
            console.error('Error al crear comentario:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Guarda comentarios en localStorage
     */
    saveComments(comments) {
        localStorage.setItem(BACKEND_CONFIG.COMMENTS_KEY, JSON.stringify(comments));
    }

    // ===== MÉTODOS DE ANALYTICS =====

    /**
     * Registra un evento de analytics
     */
    trackEvent(eventType, eventData = {}) {
        try {
            const analytics = JSON.parse(localStorage.getItem(BACKEND_CONFIG.ANALYTICS_KEY) || '{}');
            
            const event = {
                id: this.generateId(),
                type: eventType,
                data: eventData,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            if (!analytics.events) {
                analytics.events = [];
            }
            
            analytics.events.push(event);
            
            // Limitar número de eventos
            if (analytics.events.length > BACKEND_CONFIG.MAX_ANALYTICS) {
                analytics.events.splice(BACKEND_CONFIG.MAX_ANALYTICS);
            }
            
            // Actualizar contadores
            if (!analytics.counters) {
                analytics.counters = {};
            }
            
            analytics.counters[eventType] = (analytics.counters[eventType] || 0) + 1;
            analytics.lastUpdated = new Date().toISOString();
            
            this.saveAnalytics(analytics);
            
            return {
                success: true,
                message: 'Evento registrado exitosamente'
            };
        } catch (error) {
            console.error('Error al registrar evento:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene estadísticas de analytics
     */
    getAnalytics() {
        try {
            return JSON.parse(localStorage.getItem(BACKEND_CONFIG.ANALYTICS_KEY) || '{}');
        } catch (error) {
            console.error('Error al obtener analytics:', error);
            return {};
        }
    }

    /**
     * Guarda analytics en localStorage
     */
    saveAnalytics(analytics) {
        localStorage.setItem(BACKEND_CONFIG.ANALYTICS_KEY, JSON.stringify(analytics));
    }

    // ===== MÉTODOS DE CONFIGURACIÓN =====

    /**
     * Obtiene configuración
     */
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(BACKEND_CONFIG.SETTINGS_KEY) || '{}');
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            return BACKEND_CONFIG.DEFAULT_SETTINGS;
        }
    }

    /**
     * Actualiza configuración
     */
    setSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            localStorage.setItem(BACKEND_CONFIG.SETTINGS_KEY, JSON.stringify(updatedSettings));
            return updatedSettings;
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            return null;
        }
    }

    // ===== MÉTODOS DE UTILIDAD =====

    /**
     * Genera un ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Limpia todos los datos
     */
    clearAllData() {
        localStorage.removeItem(BACKEND_CONFIG.NEWS_KEY);
        localStorage.removeItem(BACKEND_CONFIG.COMMENTS_KEY);
        localStorage.removeItem(BACKEND_CONFIG.ANALYTICS_KEY);
        localStorage.removeItem(BACKEND_CONFIG.SETTINGS_KEY);
        
        this.initializeDefaultData();
        
        return {
            success: true,
            message: 'Todos los datos han sido limpiados'
        };
    }

    /**
     * Exporta todos los datos
     */
    exportData() {
        try {
            const data = {
                news: JSON.parse(localStorage.getItem(BACKEND_CONFIG.NEWS_KEY) || '[]'),
                comments: JSON.parse(localStorage.getItem(BACKEND_CONFIG.COMMENTS_KEY) || '[]'),
                analytics: JSON.parse(localStorage.getItem(BACKEND_CONFIG.ANALYTICS_KEY) || '{}'),
                settings: JSON.parse(localStorage.getItem(BACKEND_CONFIG.SETTINGS_KEY) || '{}'),
                exportedAt: new Date().toISOString()
            };
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error al exportar datos:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Importa datos
     */
    importData(data) {
        try {
            if (data.news) {
                localStorage.setItem(BACKEND_CONFIG.NEWS_KEY, JSON.stringify(data.news));
            }
            
            if (data.comments) {
                localStorage.setItem(BACKEND_CONFIG.COMMENTS_KEY, JSON.stringify(data.comments));
            }
            
            if (data.analytics) {
                localStorage.setItem(BACKEND_CONFIG.ANALYTICS_KEY, JSON.stringify(data.analytics));
            }
            
            if (data.settings) {
                localStorage.setItem(BACKEND_CONFIG.SETTINGS_KEY, JSON.stringify(data.settings));
            }
            
            return {
                success: true,
                message: 'Datos importados exitosamente'
            };
        } catch (error) {
            console.error('Error al importar datos:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ===== INSTANCIA GLOBAL =====
const backend = new SimulatedBackend();

// ===== EXPORTAR PARA USO GLOBAL =====
if (typeof window !== 'undefined') {
    window.Backend = backend;
    window.BACKEND_CONFIG = BACKEND_CONFIG;
}

// ===== EXPORTAR PARA MÓDULOS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimulatedBackend, BACKEND_CONFIG };
}

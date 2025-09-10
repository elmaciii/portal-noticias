/**
 * Configuración Global del Sistema
 * Centraliza todas las configuraciones de la aplicación
 */

// ===== CONFIGURACIÓN PRINCIPAL PROFESIONAL =====
const APP_CONFIG = {
    // Información de la aplicación
    APP_NAME: 'Portal de Noticias Profesional',
    APP_VERSION: '2.0.0',
    APP_DESCRIPTION: 'Portal profesional de noticias en tiempo real con radio en vivo',
    APP_AUTHOR: 'Portal de Noticias Profesional',
    APP_LAST_UPDATE: new Date().toISOString(),
    
    // URLs y endpoints
    NEWS_API_URL: 'https://gnews.io/api/v4/top-headlines?token=demo&lang=es&max=10',
    RADIO_URL: 'https://stream-ssl.radiosenlinea.com.ar:18069/',
    LOCAL_DATA_URL: './data.json',
    
    // Configuración de actualización
    UPDATE_INTERVAL: 30000, // 30 segundos
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000, // 5 segundos
    SEARCH_DELAY: 300, // 300ms
    
    // Límites de contenido profesionales
    MAX_NEWS: 10000,
    MAX_COMMENTS: 50000,
    MAX_USERS: 1000,
    MAX_ANALYTICS: 100000,
    
    // Configuración de cache
    CACHE_DURATION: 300000, // 5 minutos
    OFFLINE_CACHE_SIZE: 100, // MB
    
    // Configuración de UI
    THEME: {
        DEFAULT: 'light',
        AVAILABLE: ['light', 'dark']
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        ENABLED: true,
        DURATION: 3000,
        POSITION: 'top-right'
    },
    
    // Configuración de PWA
    PWA: {
        ENABLED: true,
        INSTALL_PROMPT: true,
        UPDATE_PROMPT: true
    }
};

// ===== CONFIGURACIÓN DE COLORES =====
const COLOR_CONFIG = {
    PRIMARY: {
        BLUE: '#3b82f6',
        BLUE_DARK: '#2563eb',
        BLUE_LIGHT: '#60a5fa'
    },
    SECONDARY: {
        VIOLET: '#8b5cf6',
        VIOLET_DARK: '#7c3aed',
        VIOLET_LIGHT: '#a78bfa'
    },
    ACCENT: {
        ORANGE: '#f97316',
        ORANGE_DARK: '#ea580c',
        ORANGE_LIGHT: '#fb923c',
        RED: '#ef4444',
        RED_DARK: '#dc2626',
        RED_LIGHT: '#f87171'
    },
    NEUTRAL: {
        WHITE: '#ffffff',
        LIGHT_GRAY: '#f8fafc',
        GRAY: '#64748b',
        DARK_GRAY: '#1e293b',
        BLACK: '#0f172a'
    }
};

// ===== CONFIGURACIÓN DE CATEGORÍAS =====
const CATEGORIES_CONFIG = [
    { id: 'general', name: 'General', icon: 'fas fa-newspaper', color: COLOR_CONFIG.PRIMARY.BLUE },
    { id: 'politica', name: 'Política', icon: 'fas fa-landmark', color: COLOR_CONFIG.ACCENT.RED },
    { id: 'deportes', name: 'Deportes', icon: 'fas fa-futbol', color: COLOR_CONFIG.ACCENT.ORANGE },
    { id: 'economia', name: 'Economía', icon: 'fas fa-chart-line', color: COLOR_CONFIG.SECONDARY.VIOLET },
    { id: 'sociedad', name: 'Sociedad', icon: 'fas fa-users', color: COLOR_CONFIG.PRIMARY.BLUE_LIGHT },
    { id: 'internacional', name: 'Internacional', icon: 'fas fa-globe', color: COLOR_CONFIG.ACCENT.ORANGE_LIGHT },
    { id: 'policiales', name: 'Policiales', icon: 'fas fa-shield-alt', color: COLOR_CONFIG.ACCENT.RED_DARK },
    { id: 'espectaculos', name: 'Espectáculos', icon: 'fas fa-star', color: COLOR_CONFIG.SECONDARY.VIOLET_LIGHT },
    { id: 'tecnologia', name: 'Tecnología', icon: 'fas fa-microchip', color: COLOR_CONFIG.PRIMARY.BLUE_DARK }
];

// ===== CONFIGURACIÓN DE FUENTES =====
const SOURCES_CONFIG = [
    { id: 'elonce', name: 'ELONCE', logo: 'logo.png', color: COLOR_CONFIG.PRIMARY.BLUE },
    { id: 'reuters', name: 'Reuters', logo: 'reuters.png', color: COLOR_CONFIG.ACCENT.RED },
    { id: 'ap', name: 'Associated Press', logo: 'ap.png', color: COLOR_CONFIG.NEUTRAL.DARK_GRAY },
    { id: 'bbc', name: 'BBC News', logo: 'bbc.png', color: COLOR_CONFIG.ACCENT.RED },
    { id: 'cnn', name: 'CNN', logo: 'cnn.png', color: COLOR_CONFIG.ACCENT.RED }
];

// ===== CONFIGURACIÓN DE ADMINISTRACIÓN =====
const ADMIN_CONFIG = {
    // Credenciales por defecto
    DEFAULT_CREDENTIALS: {
        username: 'admin',
        password: 'admin123'
    },
    
    // Configuración de sesión
    SESSION_KEY: 'admin_session_v2',
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
    
    // Configuración de seguridad
    SECURITY: {
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
        PASSWORD_MIN_LENGTH: 6
    },
    
    // Configuración de backup
    BACKUP: {
        AUTO_BACKUP: true,
        BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
        MAX_BACKUPS: 7
    }
};

// ===== CONFIGURACIÓN DE ANALYTICS =====
const ANALYTICS_CONFIG = {
    // Métricas a rastrear
    METRICS: [
        'page_views',
        'article_views',
        'search_queries',
        'radio_plays',
        'user_sessions',
        'comment_interactions'
    ],
    
    // Configuración de eventos
    EVENTS: {
        ARTICLE_VIEW: 'article_view',
        SEARCH_PERFORMED: 'search_performed',
        RADIO_PLAY: 'radio_play',
        COMMENT_ADDED: 'comment_added',
        FILTER_APPLIED: 'filter_applied'
    },
    
    // Configuración de reportes
    REPORTS: {
        DAILY: true,
        WEEKLY: true,
        MONTHLY: true,
        CUSTOM_RANGE: true
    }
};

// ===== CONFIGURACIÓN DE NOTIFICACIONES PUSH =====
const PUSH_CONFIG = {
    // Configuración de VAPID (para notificaciones push reales)
    VAPID_PUBLIC_KEY: 'BEl62iUYgUivxIkv69yViEuiBIa40HI0F2kOjHq7XzQ',
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        NEW_ARTICLE: {
            title: 'Nueva noticia disponible',
            body: 'Hay una nueva noticia que podría interesarte',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png'
        },
        BREAKING_NEWS: {
            title: 'Noticia de última hora',
            body: 'Noticia urgente que requiere tu atención',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [200, 100, 200, 100, 200]
        }
    }
};

// ===== CONFIGURACIÓN DE DESARROLLO =====
const DEV_CONFIG = {
    // Configuración de debug
    DEBUG: {
        ENABLED: false, // Cambiar a true en desarrollo
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        CONSOLE_COLORS: true
    },
    
    // Configuración de testing
    TESTING: {
        MOCK_DATA: true,
        SIMULATE_OFFLINE: false,
        SIMULATE_SLOW_NETWORK: false
    },
    
    // Configuración de performance
    PERFORMANCE: {
        ENABLE_METRICS: true,
        SAMPLE_RATE: 0.1, // 10% de las sesiones
        REPORT_INTERVAL: 60000 // 1 minuto
    }
};

// ===== CONFIGURACIÓN DE INTERNACIONALIZACIÓN =====
const I18N_CONFIG = {
    DEFAULT_LANGUAGE: 'es',
    AVAILABLE_LANGUAGES: [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'pt', name: 'Português', flag: '🇧🇷' }
    ],
    
    // Textos de la aplicación
    TEXTS: {
        es: {
            app_name: 'Noticias en Vivo',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            search_placeholder: 'Buscar noticias...',
            no_results: 'No se encontraron resultados',
            offline_message: 'Sin conexión - Modo offline'
        },
        en: {
            app_name: 'Live News',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            search_placeholder: 'Search news...',
            no_results: 'No results found',
            offline_message: 'No connection - Offline mode'
        }
    }
};

// ===== EXPORTAR CONFIGURACIONES =====
if (typeof window !== 'undefined') {
    // Navegador
    window.APP_CONFIG = APP_CONFIG;
    window.COLOR_CONFIG = COLOR_CONFIG;
    window.CATEGORIES_CONFIG = CATEGORIES_CONFIG;
    window.SOURCES_CONFIG = SOURCES_CONFIG;
    window.ADMIN_CONFIG = ADMIN_CONFIG;
    window.ANALYTICS_CONFIG = ANALYTICS_CONFIG;
    window.PUSH_CONFIG = PUSH_CONFIG;
    window.DEV_CONFIG = DEV_CONFIG;
    window.I18N_CONFIG = I18N_CONFIG;
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = {
        APP_CONFIG,
        COLOR_CONFIG,
        CATEGORIES_CONFIG,
        SOURCES_CONFIG,
        ADMIN_CONFIG,
        ANALYTICS_CONFIG,
        PUSH_CONFIG,
        DEV_CONFIG,
        I18N_CONFIG
    };
}

console.log('⚙️ Configuración cargada:', APP_CONFIG.APP_NAME, 'v' + APP_CONFIG.APP_VERSION);

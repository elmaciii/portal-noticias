/**
 * Aplicación Principal - Noticias en Vivo & Radio
 * Sistema completo de noticias con CMS, radio en vivo y funcionalidades avanzadas
 */

// ===== VARIABLES GLOBALES =====
let allNews = [];
let currentCategory = 'general';
let isRadioPlaying = false;
let searchTimeout;

// ===== CONFIGURACIÓN PROFESIONAL =====
const CONFIG = {
    version: '2.0.0',
    name: 'Portal de Noticias Profesional',
    description: 'Portal profesional de noticias en tiempo real con radio en vivo',
    author: 'Portal de Noticias Profesional',
    lastUpdate: new Date().toISOString(),
    
    // URLs y endpoints
    NEWS_API_URL: 'https://gnews.io/api/v4/top-headlines?token=demo&lang=es&max=10',
    RADIO_URL: 'https://stream-ssl.radiosenlinea.com.ar:18069/',
    LOCAL_DATA_URL: './data.json',
    
    // Configuración de tiempo
    UPDATE_INTERVAL: 60000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000,
    SEARCH_DELAY: 300,
    
    // Características
    features: {
        radio: true,
        comments: true,
        search: true,
        categories: true,
        theme: true,
        pwa: true,
        analytics: true,
        notifications: true,
        offline: true
    },
    
    // API
    api: {
        timeout: 10000,
        retries: 3,
        cache: true
    },
    
    // UI
    ui: {
        animations: true,
        transitions: true,
        effects: true
    }
};

// ===== ELEMENTOS DEL DOM =====
const elements = {
    loadingSpinner: null,
    newsFeed: null,
    searchInput: null,
    searchClear: null,
    themeToggle: null,
    refreshBtn: null,
    radioAudio: null,
    playBtn: null,
    pauseBtn: null,
    stopBtn: null,
    radioStatus: null,
    volumeSlider: null
};

// ===== FUNCIONES DE UTILIDAD =====
function toggleLoading(show) {
    if (elements.loadingSpinner) {
        elements.loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== FUNCIONES DE NOTICIAS =====
async function fetchNews() {
    console.log('🔄 Iniciando carga de noticias...');
    
    try {
        // 1. Intentar cargar desde CMS (localStorage + archivo)
        const cmsNews = await getCMSNews();
        if (cmsNews && cmsNews.length > 0) {
            console.log('✅ Noticias del CMS encontradas:', cmsNews.length);
            return cmsNews;
        }

        // 2. Intentar cargar desde data.json
        try {
            const response = await fetch(CONFIG.LOCAL_DATA_URL);
            if (response.ok) {
                const data = await response.json();
                if (data.articles && data.articles.length > 0) {
                    console.log('✅ Noticias locales cargadas:', data.articles.length);
                    return data.articles;
                }
            }
        } catch (error) {
            console.log('📁 No se pudo cargar data.json (normal si se abre directamente):', error.message);
        }

        // 3. Fallback a noticias hardcodeadas
        console.log('📁 Usando datos hardcodeados (modo offline)');
        return getHardcodedNews();

    } catch (error) {
        console.error('❌ Error al cargar noticias:', error);
        return getHardcodedNews();
    }
}

async function getCMSNews() {
    try {
        // 1. Intentar cargar desde localStorage (dispositivo actual)
        const cmsData = localStorage.getItem('main_site_news');
        if (cmsData) {
            const news = JSON.parse(cmsData);
            console.log('📝 Noticias del CMS desde localStorage:', news.length);
            
            if (Array.isArray(news) && news.length > 0) {
                const validNews = news.filter(article => {
                    return article && 
                           article.title && 
                           article.title.trim() !== '' &&
                           article.description && 
                           article.description.trim() !== '';
                });

                if (validNews.length > 0) {
                    console.log('✅ HAY NOTICIAS DEL CMS (localStorage) - NO MOSTRAR PRECARGADAS');
                    return validNews.map(article => ({
                        id: article.id || Date.now() + Math.random(),
                        title: article.title,
                        description: article.description,
                        url: article.url || '#',
                        image: article.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4=',
                        source: article.source || 'ELONCE',
                        publishedAt: article.publishedAt || new Date().toISOString(),
                        category: article.category || 'general'
                    }));
                }
            }
        }

        // 2. Intentar cargar desde cms-news.json (archivo compartido)
        try {
            const response = await fetch('./cms-news.json');
            if (response.ok) {
                const data = await response.json();
                if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
                    console.log('📝 Noticias del CMS desde archivo:', data.articles.length);
                    
                    const validNews = data.articles.filter(article => {
                        return article && 
                               article.title && 
                               article.title.trim() !== '' &&
                               article.description && 
                               article.description.trim() !== '';
                    });

                    if (validNews.length > 0) {
                        console.log('✅ HAY NOTICIAS DEL CMS (archivo) - NO MOSTRAR PRECARGADAS');
                        return validNews.map(article => ({
                            id: article.id || Date.now() + Math.random(),
                            title: article.title,
                            description: article.description,
                            url: article.url || '#',
                            image: article.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4=',
                            source: article.source || 'ELONCE',
                            publishedAt: article.publishedAt || new Date().toISOString(),
                            category: article.category || 'general'
                        }));
                    }
                }
            }
        } catch (error) {
            console.log('📁 No se pudo cargar cms-news.json:', error.message);
        }

        return null;
    } catch (error) {
        console.error('❌ Error al obtener noticias del CMS:', error);
        return null;
    }
}

function getHardcodedNews() {
    return [
        {
            id: 'auto-1',
            title: 'Portal de Noticias Profesional - Sistema Automático',
            description: 'El sistema de noticias automáticas está funcionando correctamente. Cuando no hay noticias cargadas desde el panel de administración, se muestran estas noticias de respaldo.',
            url: '#',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4=',
            source: 'Sistema Automático',
            publishedAt: new Date(Date.now() - 5 * 60000).toISOString(),
            category: 'general'
        },
        {
            id: 'auto-2',
            title: 'Funcionalidad de CMS Implementada',
            description: 'El panel de administración permite cargar, editar y eliminar noticias. Las noticias del CMS tienen prioridad sobre las automáticas.',
            url: '#',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4=',
            source: 'Sistema Automático',
            publishedAt: new Date(Date.now() - 10 * 60000).toISOString(),
            category: 'tecnologia'
        },
        {
            id: 'auto-3',
            title: 'Radio en Vivo Disponible',
            description: 'El reproductor de radio está integrado y funcional. Puedes escuchar la transmisión en vivo desde cualquier dispositivo.',
            url: '#',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4=',
            source: 'Sistema Automático',
            publishedAt: new Date(Date.now() - 15 * 60000).toISOString(),
            category: 'entretenimiento'
        },
        {
            id: 'auto-4',
            title: 'Diseño Responsive y Profesional',
            description: 'El portal está optimizado para todos los dispositivos con un diseño moderno y profesional que se adapta automáticamente.',
            url: '#',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4=',
            source: 'Sistema Automático',
            publishedAt: new Date(Date.now() - 20 * 60000).toISOString(),
            category: 'tecnologia'
        },
        {
            id: 'auto-5',
            title: 'Sistema de Comentarios Activo',
            description: 'Los usuarios pueden comentar en las noticias, dar likes y respuestas. El sistema incluye moderación automática.',
            url: '#',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4=',
            source: 'Sistema Automático',
            publishedAt: new Date(Date.now() - 25 * 60000).toISOString(),
            category: 'social'
        }
    ];
}

function renderNews(articles) {
    if (!elements.newsFeed) {
        console.error('❌ Elemento newsFeed no encontrado');
        return;
    }

    console.log('📰 Renderizando', articles.length, 'noticias...');

    if (articles.length === 0) {
        elements.newsFeed.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper"></i>
                <h3>No hay noticias disponibles</h3>
                <p>Intenta actualizar la página o verifica tu conexión.</p>
            </div>
        `;
        return;
    }

    const newsHTML = articles.map(article => `
        <article class="news-item" data-category="${article.category || 'general'}">
            <img src="${article.image}" alt="${escapeHtml(article.title)}" class="news-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVsb25jZTwvdGV4dD48L3N2Zz4='">
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-category">${article.category || 'General'}</span>
                    <span class="news-date">${formatDate(article.publishedAt)}</span>
                </div>
                <h2 class="news-title">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(article.title)}
                    </a>
                </h2>
                <p class="news-description">${escapeHtml(article.description)}</p>
                <div class="news-source">Fuente: ${escapeHtml(article.source)}</div>
                
                <div class="news-share-buttons">
                    <button class="share-btn whatsapp-btn" onclick="shareNews('whatsapp', '${escapeHtml(article.title)}', '${article.url || window.location.href}')" title="Compartir en WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="share-btn facebook-btn" onclick="shareNews('facebook', '${escapeHtml(article.title)}', '${article.url || window.location.href}')" title="Compartir en Facebook">
                        <i class="fab fa-facebook"></i>
                    </button>
                    <button class="share-btn twitter-btn" onclick="shareNews('twitter', '${escapeHtml(article.title)}', '${article.url || window.location.href}')" title="Compartir en Twitter">
                        <i class="fab fa-twitter"></i>
                    </button>
                    <button class="share-btn copy-btn" onclick="copyNewsLink('${article.url || window.location.href}')" title="Copiar enlace">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                
                <div class="news-comments-section">
                    <div class="comments-header">
                        <h4><i class="fas fa-comments"></i> Comentarios</h4>
                        <button class="toggle-comments-btn" onclick="toggleComments('${article.id}')">
                            <span class="comments-count" id="comments-count-${article.id}">0</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    <div class="comments-container" id="comments-${article.id}" style="display: none;">
                        <div class="comment-form">
                            <textarea placeholder="Escribe tu comentario..." class="comment-input" id="comment-input-${article.id}"></textarea>
                            <div class="comment-form-actions">
                                <input type="text" placeholder="Tu nombre (opcional)" class="comment-author" id="comment-author-${article.id}">
                                <button class="submit-comment-btn" onclick="submitComment('${article.id}', '${escapeHtml(article.title)}')">
                                    <i class="fas fa-paper-plane"></i> Comentar
                                </button>
                            </div>
                        </div>
                        <div class="comments-list" id="comments-list-${article.id}">
                            <!-- Los comentarios se cargarán aquí -->
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `).join('');

    elements.newsFeed.innerHTML = newsHTML;
    console.log('✅', articles.length, 'noticias renderizadas');
}

async function loadNews() {
    try {
        toggleLoading(true);
        const articles = await fetchNews();
        
        allNews = articles;
        console.log('📰 Guardando', allNews.length, 'noticias para filtrado...');
        
        filterNewsByCategory(currentCategory);
        
        toggleLoading(false);
        console.log('✅ Noticias de respaldo cargadas');
        
    } catch (error) {
        console.error('❌ Error al cargar noticias:', error);
        toggleLoading(false);
    }
}

// ===== FUNCIONES DE FILTRADO =====
function filterNewsByCategory(category) {
    console.log('🔍 Filtrando noticias por categoría:', category);
    
    let filteredNews = allNews;
    
    if (category !== 'general') {
        filteredNews = allNews.filter(article => {
            const articleCategory = article.category ? article.category.toLowerCase() : 'general';
            const searchCategory = category.toLowerCase();
            
            if (articleCategory === searchCategory) {
                return true;
            }
            
            const searchText = `${article.title} ${article.description} ${article.source}`.toLowerCase();
            const keywords = {
                'parana': ['paraná', 'parana', 'local', 'ciudad'],
                'politica': ['política', 'politica', 'gobierno', 'elecciones'],
                'deportes': ['deporte', 'fútbol', 'futbol', 'equipo'],
                'economia': ['economía', 'economia', 'dinero', 'precio'],
                'sociedad': ['sociedad', 'social', 'comunidad'],
                'internacionales': ['internacional', 'mundo', 'global'],
                'policiales': ['policial', 'crimen', 'delito'],
                'espectaculos': ['espectáculo', 'espectaculo', 'show', 'artista'],
                'tecnologia': ['tecnología', 'tecnologia', 'digital', 'app']
            };
            
            if (keywords[searchCategory]) {
                const hasKeyword = keywords[searchCategory].some(keyword => 
                    searchText.includes(keyword)
                );
                if (hasKeyword) {
                    console.log('✅ Noticia encontrada por palabras clave:', article.title);
                    return true;
                }
            }
            
            return false;
        });
    }
    
    console.log('📰 Noticias filtradas para', category + ':', filteredNews.length, 'de', allNews.length);
    renderNews(filteredNews);
}

function changeCategory(category) {
    console.log('🔄 Cambiando a categoría:', category);
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.category === category) {
            link.classList.add('active');
        }
    });
    
    currentCategory = category;
    filterNewsByCategory(category);
}

function setupCategoryNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            changeCategory(category);
        });
    });
}

// ===== FUNCIONES DE BÚSQUEDA =====
function performSearch(query) {
    if (!query.trim()) {
        filterNewsByCategory(currentCategory);
        return;
    }

    const searchResults = allNews.filter(article => {
        const searchText = `${article.title} ${article.description} ${article.source} ${article.category}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });

    renderNews(searchResults);
}

function setupSearch() {
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });
    }

    if (elements.searchClear) {
        elements.searchClear.addEventListener('click', () => {
            elements.searchInput.value = '';
            elements.searchClear.style.display = 'none';
            filterNewsByCategory(currentCategory);
        });
    }
}

// ===== FUNCIONES DE RADIO =====
function initRadioPlayer() {
    console.log('🎵 Inicializando reproductor de radio...');
    
    try {
        const radioAudio = document.getElementById('radioAudio');
        if (radioAudio) {
            radioAudio.src = CONFIG.RADIO_URL;
            radioAudio.preload = 'none';
            elements.radioAudio = radioAudio;
        } else {
            console.log('⚠️ No se encontró elemento de audio');
            return;
        }
        
        if (elements.radioAudio) {
            elements.radioAudio.addEventListener('loadstart', () => {
                console.log('🔄 Cargando stream de radio...');
            });
            
            elements.radioAudio.addEventListener('canplay', () => {
                console.log('✅ Stream de radio listo');
            });
            
            elements.radioAudio.addEventListener('play', () => {
                console.log('▶️ Radio iniciada');
                isRadioPlaying = true;
            });
            
            elements.radioAudio.addEventListener('pause', () => {
                console.log('⏸️ Radio pausada');
                isRadioPlaying = false;
            });
            
            elements.radioAudio.addEventListener('error', (e) => {
                console.error('❌ Error en reproductor de radio:', e);
                isRadioPlaying = false;
            });
        }
        
        console.log('✅ Reproductor de radio inicializado');
        
    } catch (error) {
        console.error('❌ Error al inicializar reproductor de radio:', error);
    }
}

function playRadio() {
    if (elements.radioAudio) {
        elements.radioAudio.play().catch(error => {
            console.error('❌ Error al reproducir radio:', error);
        });
    }
}

function pauseRadio() {
    if (elements.radioAudio) {
        elements.radioAudio.pause();
    }
}

function stopRadio() {
    if (elements.radioAudio) {
        elements.radioAudio.pause();
        elements.radioAudio.currentTime = 0;
    }
}

function setupRadioControls() {
    if (elements.playBtn) {
        elements.playBtn.addEventListener('click', playRadio);
    }
    
    if (elements.pauseBtn) {
        elements.pauseBtn.addEventListener('click', pauseRadio);
    }
    
    if (elements.stopBtn) {
        elements.stopBtn.addEventListener('click', stopRadio);
    }
    
    if (elements.volumeSlider && elements.radioAudio) {
        elements.volumeSlider.addEventListener('input', (e) => {
            elements.radioAudio.volume = e.target.value / 100;
        });
    }
}

// ===== FUNCIONES DE COMPARTIR =====
function shareNews(platform, title, url) {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    
    let shareUrl = '';
    
    switch (platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyNewsLink(url) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Enlace copiado al portapapeles', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(url);
        });
    } else {
        fallbackCopyTextToClipboard(url);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Enlace copiado al portapapeles', 'success');
    } catch (err) {
        showNotification('Error al copiar enlace', 'error');
    }
    
    document.body.removeChild(textArea);
}

// ===== FUNCIONES DE COMENTARIOS =====
function toggleComments(articleId) {
    const container = document.getElementById(`comments-${articleId}`);
    const button = document.querySelector(`[onclick="toggleComments('${articleId}')"]`);
    
    if (container && button) {
        const isVisible = container.style.display !== 'none';
        container.style.display = isVisible ? 'none' : 'block';
        
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        }
        
        if (!isVisible) {
            loadComments(articleId);
        }
    }
}

function submitComment(articleId, articleTitle) {
    const input = document.getElementById(`comment-input-${articleId}`);
    const authorInput = document.getElementById(`comment-author-${articleId}`);
    
    if (!input || !input.value.trim()) return;
    
    const comment = {
        id: Date.now() + Math.random(),
        articleId: articleId,
        articleTitle: articleTitle,
        content: input.value.trim(),
        author: authorInput ? authorInput.value.trim() || 'Anónimo' : 'Anónimo',
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: []
    };
    
    saveComment(comment);
    input.value = '';
    if (authorInput) authorInput.value = '';
    
    loadComments(articleId);
    updateCommentsCount(articleId);
    
    showNotification('Comentario agregado', 'success');
}

function saveComment(comment) {
    try {
        const comments = getComments();
        comments.push(comment);
        localStorage.setItem('news_comments', JSON.stringify(comments));
    } catch (error) {
        console.error('Error al guardar comentario:', error);
    }
}

function getComments() {
    try {
        return JSON.parse(localStorage.getItem('news_comments') || '[]');
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        return [];
    }
}

function loadComments(articleId) {
    const commentsList = document.getElementById(`comments-list-${articleId}`);
    if (!commentsList) return;
    
    const comments = getComments().filter(comment => comment.articleId === articleId);
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</div>';
        return;
    }
    
    const commentsHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-author-info">
                    <div class="comment-avatar">${comment.author.charAt(0).toUpperCase()}</div>
                    <div class="comment-meta">
                        <div class="comment-author-name">${escapeHtml(comment.author)}</div>
                        <div class="comment-date">${formatCommentDate(comment.timestamp)}</div>
                    </div>
                </div>
                <div class="comment-actions">
                    <button class="comment-action-btn like-btn" onclick="likeComment('${comment.id}')" title="Me gusta">
                        <i class="fas fa-thumbs-up"></i> ${comment.likes}
                    </button>
                    <button class="comment-action-btn dislike-btn" onclick="dislikeComment('${comment.id}')" title="No me gusta">
                        <i class="fas fa-thumbs-down"></i> ${comment.dislikes}
                    </button>
                    <button class="comment-action-btn reply-btn" onclick="showReplyForm('${comment.id}')" title="Responder">
                        <i class="fas fa-reply"></i>
                    </button>
                </div>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            <div class="comment-replies" id="replies-${comment.id}">
                ${comment.replies.map(reply => `
                    <div class="reply-item">
                        <div class="reply-header">
                            <div class="reply-avatar">${reply.author.charAt(0).toUpperCase()}</div>
                            <div class="reply-meta">
                                <div class="reply-author">${escapeHtml(reply.author)}</div>
                                <div class="reply-date">${formatCommentDate(reply.timestamp)}</div>
                            </div>
                        </div>
                        <div class="reply-content">${escapeHtml(reply.content)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
                <textarea class="reply-input" id="reply-input-${comment.id}" placeholder="Escribe tu respuesta..."></textarea>
                <div class="reply-form-actions">
                    <button class="submit-reply-btn" onclick="submitReply('${comment.id}', '${articleId}')">Responder</button>
                    <button class="cancel-reply-btn" onclick="hideReplyForm('${comment.id}')">Cancelar</button>
                </div>
            </div>
        </div>
    `).join('');
    
    commentsList.innerHTML = commentsHTML;
}

function updateCommentsCount(articleId) {
    const countElement = document.getElementById(`comments-count-${articleId}`);
    if (countElement) {
        const comments = getComments().filter(comment => comment.articleId === articleId);
        countElement.textContent = comments.length;
    }
}

function likeComment(commentId) {
    const comments = getComments();
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.likes++;
        localStorage.setItem('news_comments', JSON.stringify(comments));
        loadComments(comment.articleId);
    }
}

function dislikeComment(commentId) {
    const comments = getComments();
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.dislikes++;
        localStorage.setItem('news_comments', JSON.stringify(comments));
        loadComments(comment.articleId);
    }
}

function showReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
        form.style.display = 'block';
        const input = document.getElementById(`reply-input-${commentId}`);
        if (input) input.focus();
    }
}

function hideReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
        form.style.display = 'none';
        const input = document.getElementById(`reply-input-${commentId}`);
        if (input) input.value = '';
    }
}

function submitReply(commentId, articleId) {
    const input = document.getElementById(`reply-input-${commentId}`);
    if (!input || !input.value.trim()) return;
    
    const comments = getComments();
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
        const reply = {
            id: Date.now() + Math.random(),
            content: input.value.trim(),
            author: 'Anónimo',
            timestamp: new Date().toISOString()
        };
        
        comment.replies.push(reply);
        localStorage.setItem('news_comments', JSON.stringify(comments));
        loadComments(articleId);
        hideReplyForm(commentId);
        
        showNotification('Respuesta agregada', 'success');
    }
}

function formatCommentDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return date.toLocaleDateString('es-ES');
}

function initializeCommentsSystem() {
    setTimeout(() => {
        document.querySelectorAll('[id^="comments-count-"]').forEach(element => {
            const articleId = element.id.replace('comments-count-', '');
            updateCommentsCount(articleId);
        });
    }, 1000);
}

// ===== FUNCIONES DE TEMA =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = elements.themeToggle?.querySelector('i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showNotification(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'success');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = elements.themeToggle?.querySelector('i');
    if (icon) {
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== FUNCIONES DE NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== FUNCIONES DE INICIALIZACIÓN =====
function getDOMElements() {
    elements.loadingSpinner = document.getElementById('loadingSpinner');
    elements.newsFeed = document.getElementById('newsFeed');
    elements.searchInput = document.getElementById('searchInput');
    elements.searchClear = document.getElementById('searchClear');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.refreshBtn = document.getElementById('refreshBtn');
    elements.radioAudio = document.getElementById('radioAudio');
    elements.playBtn = document.getElementById('playBtn');
    elements.pauseBtn = document.getElementById('pauseBtn');
    elements.stopBtn = document.getElementById('stopBtn');
    elements.radioStatus = document.getElementById('radioStatus');
    elements.volumeSlider = document.getElementById('volumeSlider');
}

function setupEventListeners() {
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', () => {
            elements.refreshBtn.classList.add('rotating');
            loadNews().finally(() => {
                elements.refreshBtn.classList.remove('rotating');
            });
        });
    }
    
    setupSearch();
    setupCategoryNavigation();
    setupRadioControls();
}

async function initApp() {
    console.log('🚀 Iniciando aplicación Noticias en Vivo & Radio...');
    
    try {
        getDOMElements();
        
        const requiredElements = ['newsFeed'];
        const missingElements = requiredElements.filter(id => !elements[id]);
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos del DOM faltantes: ${missingElements.join(', ')}`);
        }
        
        console.log('✅ Elementos del DOM verificados');
        
        loadTheme();
        setupEventListeners();
        console.log('✅ Event listeners configurados');
        
        initRadioPlayer();
        initializeCommentsSystem();
        
        await loadNews();
        
        console.log('✅ Aplicación inicializada correctamente');
        console.log('🎉 ¡Aplicación lista! Disfruta de las noticias y la radio en vivo.');
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        showNotification('Error al inicializar la aplicación', 'error');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', initApp);

// ===== FUNCIONES DE DEBUG (TEMPORALES) =====
// Función para limpiar noticias del CMS y probar sistema automático
window.clearCMSNews = function() {
    localStorage.removeItem('main_site_news');
    console.log('🧹 Noticias del CMS eliminadas. Recargando página...');
    location.reload();
};

// Función para ver el estado actual
window.checkNewsStatus = function() {
    const cmsNews = localStorage.getItem('main_site_news');
    if (cmsNews) {
        const news = JSON.parse(cmsNews);
        console.log('📰 Noticias del CMS encontradas:', news.length);
        console.log('Noticias:', news);
    } else {
        console.log('📰 No hay noticias del CMS - se mostrarán las automáticas');
    }
};

console.log('🔧 Funciones de debug disponibles:');
console.log('- clearCMSNews() - Limpiar noticias del CMS');
console.log('- checkNewsStatus() - Ver estado de noticias');

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.NewsRadioApp = {
    shareNews,
    copyNewsLink,
    toggleComments,
    submitComment,
    likeComment,
    dislikeComment,
    showReplyForm,
    hideReplyForm,
    submitReply,
    initializeCommentsSystem,
    loadNews,
    filterNewsByCategory,
    changeCategory
};

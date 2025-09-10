# Portal de Noticias Profesional

Un portal de noticias moderno y responsive con sistema de CMS, radio en vivo y funcionalidades avanzadas.

## 🚀 Características

- **Sistema de Noticias**: CMS completo para cargar, editar y eliminar noticias
- **Radio en Vivo**: Reproductor integrado con MyCast
- **Diseño Responsive**: Optimizado para todos los dispositivos
- **Sistema de Comentarios**: Comentarios con likes, respuestas y moderación
- **Búsqueda en Tiempo Real**: Filtrado instantáneo de noticias
- **Categorías**: Navegación por categorías de noticias
- **Tema Claro/Oscuro**: Alternancia entre modos de visualización
- **PWA**: Aplicación web progresiva con funcionalidades offline
- **Compartir**: Botones para compartir en redes sociales
- **Notificaciones**: Sistema de notificaciones en tiempo real

## 📱 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Librerías**: jQuery, MyCast (reproductor de radio)
- **Almacenamiento**: LocalStorage
- **PWA**: Service Worker, Manifest
- **Iconos**: Font Awesome 6.4.0
- **Fuentes**: Google Fonts (Inter)

## 🎯 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/portal-noticias.git
```

2. Abre `index.html` en tu navegador o sirve desde un servidor web.

## 🔧 Uso

### Panel de Administración
- Accede a `/admin` para gestionar noticias
- Credenciales por defecto: `admin` / `admin123`
- Funcionalidades: Crear, editar, eliminar noticias

### Funciones de Debug
En la consola del navegador:
- `clearCMSNews()` - Limpiar noticias del CMS
- `checkNewsStatus()` - Ver estado de noticias

## 📂 Estructura del Proyecto

```
portal-noticias/
├── index.html          # Página principal
├── admin.html          # Panel de administración
├── styles.css          # Estilos principales
├── app.js             # Lógica de la aplicación
├── admin.js           # Lógica del panel admin
├── backend.js         # Backend simulado
├── config.js          # Configuración global
├── data.json          # Datos de respaldo
├── manifest.json      # PWA manifest
├── sw.js             # Service Worker
├── icons/            # Iconos PWA
└── README.md         # Este archivo
```

## 🎨 Personalización

### Colores
Los colores se pueden modificar en `styles.css` en la sección de variables CSS:

```css
:root {
    --primary-blue: #1e40af;
    --accent-orange: #f97316;
    --accent-red: #ef4444;
    --accent-violet: #8b5cf6;
}
```

### Configuración
Modifica `config.js` para ajustar:
- URLs de APIs
- Intervalos de actualización
- Configuración de PWA
- Características habilitadas

## 📱 PWA

El portal es una PWA completa con:
- Manifest para instalación
- Service Worker para cache offline
- Iconos adaptativos
- Tema personalizado

## 🔒 Seguridad

- Validación de entrada en formularios
- Sanitización de HTML
- Protección XSS
- Autenticación de administrador

## 📊 Funcionalidades Avanzadas

- **Analytics**: Seguimiento de estadísticas
- **Offline**: Funcionamiento sin conexión
- **Notificaciones**: Sistema de alertas
- **Comentarios**: Sistema completo de interacción
- **Compartir**: Integración con redes sociales

## 🚀 Despliegue

### GitHub Pages
1. Sube el código a GitHub
2. Ve a Settings > Pages
3. Selecciona la rama main
4. Tu sitio estará disponible en `https://tu-usuario.github.io/portal-noticias`

### Servidor Web
Cualquier servidor web estático (Apache, Nginx, etc.)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte o preguntas, abre un issue en GitHub.

---

**Desarrollado con ❤️ para la comunidad**
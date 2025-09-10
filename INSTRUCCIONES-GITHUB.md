# 🚀 INSTRUCCIONES PARA SUBIR A GITHUB

## 📋 PASO A PASO COMPLETO

### 1. CREAR CUENTA EN GITHUB
1. Ve a **https://github.com**
2. Haz clic en **"Sign up"**
3. Completa el formulario de registro
4. Verifica tu email

### 2. CREAR REPOSITORIO
1. Una vez logueado, haz clic en **"New repository"** (botón verde)
2. **Repository name**: `portal-noticias`
3. **Description**: `Portal de noticias profesional con CMS y radio en vivo`
4. Marca **"Public"** (para que sea accesible desde GitHub Pages)
5. **NO marques** "Add a README file" (ya tenemos uno)
6. Haz clic en **"Create repository"**

### 3. SUBIR ARCHIVOS
1. En la página del repositorio, haz clic en **"uploading an existing file"**
2. Arrastra TODOS estos archivos:
   - `index.html`
   - `admin.html`
   - `styles.css`
   - `app.js`
   - `admin.js`
   - `backend.js`
   - `config.js`
   - `data.json`
   - `cms-news.json`
   - `manifest.json`
   - `sw.js`
   - `README.md`
   - `.gitignore`

3. **IMPORTANTE**: También sube la carpeta `icons/` completa
4. Escribe un mensaje de commit: `"Subida inicial del portal de noticias"`
5. Haz clic en **"Commit changes"**

### 4. ACTIVAR GITHUB PAGES
1. Ve a **Settings** (pestaña en tu repositorio)
2. Busca **"Pages"** en el menú lateral izquierdo
3. En **"Source"**, selecciona **"Deploy from a branch"**
4. En **"Branch"**, selecciona **"main"**
5. Haz clic en **"Save"**
6. Espera 2-3 minutos para que se active

### 5. ACCEDER A TU SITIO
Tu sitio estará disponible en:
**https://tu-usuario.github.io/portal-noticias**

## 🔧 CONFIGURAR NOTICIAS DEL CMS

### 1. ACCEDER AL ADMIN
1. Ve a tu sitio: `https://tu-usuario.github.io/portal-noticias`
2. Agrega `/admin` al final: `https://tu-usuario.github.io/portal-noticias/admin`
3. Usa las credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

### 2. CARGAR NOTICIAS
1. Ve a la pestaña **"Agregar Noticia"**
2. Completa el formulario:
   - **Título**: Tu noticia
   - **Descripción**: Descripción de la noticia
   - **Categoría**: Selecciona una categoría
   - **Fuente**: ELONCE
   - **URL**: Deja vacío o pon #
   - **Imagen**: URL de imagen o deja vacío
   - **Estado**: Publicado
3. Haz clic en **"Agregar Noticia"**

### 3. SINCRONIZAR CON EL SITIO
1. Ve a la pestaña **"Noticias"**
2. Haz clic en **"Sincronizar con Sitio Principal"**
3. Se descargará un archivo `cms-news.json`
4. **IMPORTANTE**: Sube este archivo a GitHub:
   - Ve a tu repositorio en GitHub
   - Haz clic en **"Add file" > "Upload files"**
   - Arrastra el archivo `cms-news.json` descargado
   - Escribe commit: `"Actualizar noticias del CMS"`
   - Haz clic en **"Commit changes"**

### 4. VERIFICAR EN EL SITIO
1. Ve a tu sitio principal: `https://tu-usuario.github.io/portal-noticias`
2. Las noticias del CMS deberían aparecer
3. Prueba desde tu celular también

## 📱 PROBAR EN CELULAR

### 1. ABRIR EN CELULAR
1. Abre el navegador en tu celular
2. Ve a: `https://tu-usuario.github.io/portal-noticias`
3. Las noticias del CMS deberían aparecer

### 2. SI NO APARECEN LAS NOTICIAS
1. Verifica que subiste el archivo `cms-news.json` a GitHub
2. Espera 2-3 minutos para que GitHub actualice
3. Refresca la página en el celular

## 🔍 FUNCIONES DE DEBUG

En la consola del navegador (F12):
- `clearCMSNews()` - Limpiar noticias del CMS
- `checkNewsStatus()` - Ver estado de noticias

## 📞 SOLUCIÓN DE PROBLEMAS

### Problema: No aparecen las noticias en el celular
**Solución**: Asegúrate de subir el archivo `cms-news.json` a GitHub

### Problema: Error 404 en GitHub Pages
**Solución**: Espera 5-10 minutos para que se active GitHub Pages

### Problema: No se puede acceder al admin
**Solución**: Verifica que subiste `admin.html` correctamente

### Problema: Estilos no se ven
**Solución**: Verifica que subiste `styles.css` correctamente

## 🎯 CHECKLIST FINAL

- [ ] Cuenta de GitHub creada
- [ ] Repositorio creado
- [ ] Todos los archivos subidos
- [ ] GitHub Pages activado
- [ ] Sitio accesible
- [ ] Admin panel funcional
- [ ] Noticias cargadas en CMS
- [ ] Archivo cms-news.json subido
- [ ] Noticias visibles en sitio principal
- [ ] Noticias visibles en celular

## 🚀 ¡LISTO!

Una vez completado todo, tendrás:
- ✅ Portal de noticias funcionando en GitHub Pages
- ✅ Panel de administración accesible
- ✅ Noticias del CMS visibles en todos los dispositivos
- ✅ Sistema de sincronización funcionando
- ✅ Diseño responsive y profesional

**¡Tu portal de noticias estará completamente funcional y accesible desde cualquier dispositivo!** 🎉

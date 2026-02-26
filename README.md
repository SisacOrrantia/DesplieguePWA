# Task Manager PWA

**Materia:** Desarrollo Web Profesional  
**Institución:** Universidad Tecnológica de Tijuana  
**Docente:** Mike Cardona (@mikecardona076)  
**Alumno:** Germán Sisac Orrantia González  

---

## Descripción del Proyecto

Aplicación web progresiva (PWA) de gestión de tareas construida con **React + Vite + TypeScript**. Permite crear, completar y eliminar tareas con persistencia offline mediante **LocalStorage**, y puede instalarse como aplicación nativa en cualquier dispositivo con soporte de navegador moderno.

**Stack tecnológico:**
- Frontend: React 18 + TypeScript + Vite 5
- Service Worker: Workbox (via vite-plugin-pwa)
- Persistencia: LocalStorage
- Contenedorización: Docker multi-stage (node:alpine → nginx:stable-alpine)
- Web Server: Nginx con TLS 1.3
- SSL: Let's Encrypt / Certbot

---

## Parte 1: Investigación Teórica

### 1. Web App Manifest (`manifest.json`)

El Web App Manifest es un archivo JSON estandarizado por la W3C que le permite al navegador comprender cómo debe instalarse y mostrarse la aplicación cuando se agrega a la pantalla de inicio del dispositivo. Es uno de los tres pilares de una PWA junto con los Service Workers y HTTPS.

#### Propiedades clave

| Propiedad | Descripción técnica |
|---|---|
| `name` | Nombre completo de la aplicación. Usado en pantallas de inicio y gestores de apps. |
| `short_name` | Nombre abreviado (≤12 caracteres recomendado) para iconos de escritorio donde el espacio es limitado. |
| `theme_color` | Define el color de la barra de herramientas del navegador y la barra de estado del sistema operativo cuando la app está activa. Impacta directamente en la experiencia visual de la instalación. |
| `background_color` | Color de fondo mostrado en la **splash screen** (pantalla de carga) mientras la aplicación carga por primera vez, antes de que los estilos CSS se apliquen. |
| `display` | Controla el modo de visualización de la aplicación instalada. |
| `start_url` | URL que se cargará cuando el usuario lance la app desde el icono instalado. |
| `scope` | Define el conjunto de URLs que la app considera "propias". Navegaciones fuera del scope abren el navegador nativo. |
| `icons` | Array de objetos que describen los iconos de la aplicación en múltiples resoluciones. |

#### `display`: `standalone` vs `browser`

```
"display": "standalone"  ← PWA instalable (sin UI del navegador)
"display": "browser"     ← Se abre como pestaña normal del navegador
```

- **`standalone`**: La aplicación corre sin la barra de direcciones ni los controles del navegador. Tiene su propia entrada en el menú de aplicaciones del sistema operativo. Es el modo requerido para que Chrome y otros navegadores muestren el **Install Prompt**.
- **`fullscreen`**: Similar a standalone pero ocupa toda la pantalla, ocultando también la barra de estado del SO.
- **`minimal-ui`**: Igual que standalone pero conserva controles mínimos de navegación (botón atrás, recargar).
- **`browser`**: Comportamiento de pestaña de navegador convencional. No habilita la instalación.

#### El array `icons` y su importancia

```json
{
  "icons": [
    { "src": "icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

El array `icons` es crítico por múltiples razones:

1. **Criterio de instalabilidad**: Chrome requiere como mínimo un icono de 192×192 y uno de 512×512 para mostrar el Install Prompt. Sin estos tamaños, la app no es instalable.
2. **`purpose: "maskable"`**: Con este valor, el navegador puede recortar el icono en diferentes formas (círculo en Android, cuadrado redondeado en iOS) sin mostrar bordes blancos. Se recomienda incluir 40px de "safe zone" alrededor del logo.
3. **Resoluciones múltiples**: Diferentes dispositivos y densidades de pantalla (1x, 2x, 3x) requieren distintos tamaños. Enviar el tamaño correcto evita que el SO escale (y degrade) la imagen.
4. **Splash Screen automática**: En Android, Chrome genera automáticamente la splash screen combinando `background_color`, `theme_color` y el icono de 512×512.

---

### 2. Service Workers

Un Service Worker es un **script JavaScript que corre en un hilo separado** (Web Worker), completamente desconectado del DOM y del hilo principal. Funciona como un **proxy de red programable** entre la aplicación web y la red, interceptando todas las peticiones HTTP que realiza la aplicación.

#### Características fundamentales

- Corre en un contexto de worker separado (no tiene acceso al DOM)
- Es **asíncrono** — utiliza Promises y la Cache API
- Solo funciona bajo **HTTPS** (o `localhost` para desarrollo)
- **Persiste** incluso cuando la aplicación no está abierta
- Controla un **scope** (conjunto de URLs) definido por su ubicación en el servidor

#### Registro del Service Worker

```javascript
// main.tsx — registro en el cliente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then(registration => {
      console.log('SW registrado:', registration.scope)
    })
    .catch(error => {
      console.error('Error al registrar:', error)
    })
}
```

El navegador descarga `sw.js` y lo registra. Si hay un SW previo activo, el nuevo queda en estado `waiting` hasta que todas las pestañas controladas por el SW anterior se cierren.

#### Ciclo de Vida

```
Registro
    │
    ▼
┌─────────────┐
│ Installing  │  ← Se descarga el SW y se ejecuta el evento 'install'
└──────┬──────┘    Aquí se hace el pre-caching de assets críticos
       │
    (waitUntil)
       │
       ▼
┌─────────────┐
│  Waiting    │  ← SW instalado pero esperando que el anterior sea liberado
└──────┬──────┘    skipWaiting() puede forzar la activación inmediata
       │
    (activate)
       │
       ▼
┌─────────────┐
│  Activated  │  ← SW en control. Aquí se limpian caches obsoletas
└──────┬──────┘
       │
    (fetch)
       │
       ▼
┌─────────────┐
│  Fetching   │  ← Intercepta TODAS las peticiones de red
└─────────────┘    Decide si responder desde cache o red
```

**Evento `install`:**
```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1-static').then(cache =>
      cache.addAll(['/index.html', '/manifest.webmanifest', '/icons/icon-192x192.png'])
    )
  )
  self.skipWaiting() // Activar inmediatamente
})
```

**Evento `activate`:**
```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== 'v1-static') // Eliminar caches antiguas
          .map(name => caches.delete(name))
      )
    )
  )
  self.clients.claim() // Tomar control de todas las pestañas abiertas
})
```

**Evento `fetch` (proxy de red):**
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ?? fetch(event.request)
    )
  )
})
```

#### Service Worker como proxy de red

El Service Worker actúa como un **middleware de red** completo. Cuando la aplicación realiza cualquier petición (`fetch`, imágenes, CSS, API calls), el navegador la intercepta primero en el SW antes de que salga a la red. El SW decide:

1. ¿Responder desde cache local? → Respuesta instantánea, funciona offline
2. ¿Ir a la red? → Comportamiento normal, puede guardar respuesta en cache
3. ¿Estrategia híbrida? → Responde desde cache y actualiza en segundo plano

Esto diferencia al SW de un simple caché del navegador: el desarrollador tiene **control programático total** sobre cada petición y respuesta.

---

### 3. Estrategias de Almacenamiento (Caching)

Las estrategias de cache definen **cómo el Service Worker resuelve cada petición**. La elección correcta depende del tipo de recurso y sus requisitos de frescura vs disponibilidad.

#### Comparativa técnica

| Estrategia | Flujo | Cuándo usar | Pros | Contras |
|---|---|---|---|---|
| **Cache First** | Cache → Red*| Assets estáticos versionados | Instantáneo, 100% offline | Datos potencialmente obsoletos |
| **Network First** | Red → Cache† | API calls, datos dinámicos | Siempre fresco cuando hay red | Lento si la red es lenta |
| **Stale-While-Revalidate** | Cache + Red (paralelo) | Contenido que puede ser levemente obsoleto | Rápido Y fresco | Usa ancho de banda extra |
| **Cache Only** | Solo Cache | Assets pre-cacheados en install | Ultra rápido | Sin actualización |
| **Network Only** | Solo Red | Peticiones que no deben cachearse | Siempre fresco | Sin soporte offline |

*Solo va a red si no hay en cache  
†Fallback a cache si la red falla

#### Cache First (Cache Primero)

```
Request → ¿En cache? ─── Sí ──→ Devuelve cache (fin)
                │
               No
                │
            Fetch red → Guarda en cache → Devuelve respuesta
```

**Ideal para:** Archivos JavaScript y CSS versionados por Vite (`/assets/index-abc123.js`), fuentes web, imágenes estáticas. Estos archivos tienen hashes en el nombre, garantizando que si están en cache, son correctos.

```javascript
// Workbox — Cache First
registerRoute(
  ({ request }) => request.destination === 'script',
  new CacheFirst({
    cacheName: 'scripts-cache',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 365 * 24 * 60 * 60 })]
  })
)
```

#### Network First (Red Primero)

```
Request → Fetch red ──→ Éxito: Guarda cache → Devuelve respuesta
                │
             Error de red
                │
            ¿En cache? → Sí → Devuelve cache / No → Error
```

**Ideal para:** Llamadas a APIs REST, datos del usuario, contenido que cambia frecuentemente. Garantiza frescura cuando hay conexión, y disponibilidad offline cuando no la hay.

#### Stale-While-Revalidate (Obsoleto mientras se revalida)

```
Request → ¿En cache? ─── Sí ──→ Devuelve cache INMEDIATAMENTE
                │               + EN PARALELO: fetch red → actualiza cache
               No
                │
            Fetch red → Guarda cache → Devuelve respuesta
```

**Ideal para:** Páginas HTML, contenido de noticias o blogs, perfiles de usuario. El usuario ve contenido inmediatamente (aunque sea ligeramente obsoleto), y en la próxima visita ya tendrá la versión actualizada.

Esta estrategia es la usada por defecto en Workbox para páginas HTML, ya que balancea perfecto entre velocidad de carga y frescura de datos.

---

### 4. Seguridad y TLS

#### ¿Por qué HTTPS es un requisito habilitador para Service Workers?

HTTPS (HTTP sobre TLS) no es simplemente una recomendación de seguridad para las PWAs: es un **requisito técnico obligatorio** impuesto por todos los navegadores modernos.

**Razones técnicas:**

1. **Riesgo del proxy de red**: El Service Worker puede interceptar y modificar CUALQUIER petición de red. Si el SW fuera servido sobre HTTP, un atacante en la red (ataque MITM - Man In The Middle) podría:
   - Reemplazar el archivo `sw.js` legítimo con uno malicioso
   - El SW malicioso quedaría registrado permanentemente en el navegador
   - Interceptaría todas las peticiones del usuario indefinidamente
   - Podría robar credenciales, inyectar código, o redirigir peticiones

2. **Trust model del navegador**: Los navegadores (Chrome, Firefox, Safari) implementan la restricción a nivel de API: `navigator.serviceWorker.register()` simplemente no funciona en contextos no seguros. El método retorna un `Promise` rechazado inmediatamente.

3. **Cache API**: El almacenamiento persistente que habilita la funcionalidad offline también requiere un contexto seguro para prevenir que contenido cacheado malicioso persista en el dispositivo.

4. **IndexedDB y otras Storage APIs**: Las APIs que habilitan capacidades avanzadas offline también están restringidas a contextos seguros.

```
HTTP  → SW bloqueado → No offline → No instalable → No PWA
HTTPS → SW habilitado → Offline OK → Instalable → PWA completa ✓
```

**Excepción de desarrollo**: `localhost` y `127.0.0.1` se tratan como "orígenes seguros" para facilitar el desarrollo local, sin necesidad de configurar un certificado local.

#### Impacto de los certificados en el Install Prompt

El **Install Prompt** (o "Add to Home Screen prompt") es el banner que el navegador muestra automáticamente sugiriendo instalar la PWA. Para que aparezca, deben cumplirse **todos** estos criterios simultáneamente:

| Requisito | Descripción |
|---|---|
| HTTPS válido | El sitio debe tener un certificado SSL vigente y confiable |
| `manifest.json` válido | name, short_name, display: standalone, start_url |
| Íconos 192×192 y 512×512 | Requeridos explícitamente por Chrome |
| Service Worker activo | Con al menos un evento `fetch` registrado |
| No instalada previamente | El navegador no mostrará el prompt si ya fue instalada |

**Consecuencias de un certificado inválido o ausente:**

- El navegador muestra la advertencia "Not Secure" y no muestra el Install Prompt
- Los Service Workers no se registran (el navegador los bloquea silenciosamente)
- Las APIs de almacenamiento persistente (`localStorage`, `IndexedDB`, `Cache API`) pueden ser bloqueadas
- El flag de PWA en Lighthouse fallaría en la categoría "Installable"

**Tipos de certificados usados en la actividad:**

- **Let's Encrypt + Certbot**: Gratuito, automatizable, renovación automática cada 90 días. Ampliamente soportado. Ideal para VPS propios.
- **Certificados IONOS**: IONOS provee certificados SSL propios para los dominios alojados en su infraestructura. Pueden ser configurados desde su panel de control sin necesidad de Certbot.

```nginx
# nginx.conf — TLS 1.3 configurado correctamente
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:...;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
```

---

## Parte 2: Implementación Técnica

### Estructura del Proyecto

```
DesplieguePWA/
├── public/
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png    ← Requerido por Chrome para install prompt
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png    ← Requerido por Chrome para splash screen
│   ├── apple-touch-icon.png
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── AddTaskForm.tsx
│   │   ├── Header.tsx
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   ├── hooks/
│   │   └── useTasks.ts         ← Hook con LocalStorage + estado online/offline
│   ├── types/
│   │   └── Task.ts
│   ├── utils/
│   │   └── storage.ts          ← Persistencia en LocalStorage
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx                ← Registro del Service Worker
├── Dockerfile                  ← Multi-stage build
├── docker-compose.yml
├── nginx.conf                  ← HTTP→HTTPS, headers de seguridad
├── vite.config.ts              ← vite-plugin-pwa con Workbox
├── tsconfig.json
└── package.json
```

### Dockerfile Multi-Etapa

```dockerfile
# Etapa 1: Build con Node Alpine
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# Etapa 2: Producción con Nginx Alpine
FROM nginx:stable-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

**Ventajas del multi-stage build:**
- La imagen final solo contiene Nginx + los archivos estáticos compilados
- No incluye Node.js, npm, código fuente, ni dependencias de desarrollo
- Tamaño de imagen reducido (de ~800MB a ~25MB)
- Superficie de ataque reducida en producción

### Persistencia de Datos

La aplicación utiliza **LocalStorage** para persistir las tareas del usuario:

```typescript
// utils/storage.ts
export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem('pwa_tasks', JSON.stringify(tasks))
}

export const loadTasks = (): Task[] => {
  const data = localStorage.getItem('pwa_tasks')
  return data ? JSON.parse(data) : []
}
```

LocalStorage es síncrono, simple y suficiente para este caso de uso. Para aplicaciones más complejas con grandes volúmenes de datos o consultas asíncronas, se recomendaría **IndexedDB**.

---

## Parte 3: Despliegue en IONOS

### Prerrequisitos

- Servidor VPS en IONOS con Ubuntu 22.04 LTS
- Dominio apuntando al IP del servidor (registro A en DNS)
- Docker y Docker Compose instalados
- Puerto 80 y 443 abiertos en el firewall

### Pasos de Despliegue

```bash
# 1. Clonar repositorio
git clone https://github.com/SisacOrrantia/DesplieguePWA.git
cd DesplieguePWA

# 2. Crear archivo .env con tu dominio
echo "DOMAIN=tu-dominio.com" > .env

# 3. Obtener certificado SSL con Certbot (primera vez)
docker run --rm -it \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email tu@email.com \
  --agree-tos \
  -d tu-dominio.com

# 4. Construir y levantar contenedores
docker compose up -d --build

# 5. Verificar que está corriendo
docker compose ps
curl -I https://tu-dominio.com
```

### Validación con Lighthouse

Una vez desplegado, abre Chrome DevTools → Lighthouse → Generar reporte:

- ✅ **Performance**: ≥90 (Vite genera assets optimizados y comprimidos)
- ✅ **PWA Installable**: Manifest válido + SW activo + HTTPS
- ✅ **PWA Offline**: Service Worker intercepta fetch events
- ✅ **Best Practices**: HTTPS, headers de seguridad configurados

---

## Referencias

- [W3C Web App Manifest Specification](https://www.w3.org/TR/appmanifest/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Documentation — Google](https://developer.chrome.com/docs/workbox)
- [web.dev — Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Nginx SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

*"La implementación correcta de una PWA requiere una sinergia perfecta entre el desarrollo frontend y la configuración de infraestructura."*  
— Mike Cardona, Desarrollo Web Profesional, UTT 2026

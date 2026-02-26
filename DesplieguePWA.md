Actividad: Investigación, Implementación y Despliegue de una PWA
Materia: Desarrollo Web Profesional
Institución: Universidad Tecnológica de Tijuana
Docente: Mike Cardona (@mikecardona076)
Objetivo
Comprender la arquitectura técnica de las Aplicaciones Web Progresivas (PWA) y desplegar un proyecto funcional utilizando Docker en un servidor de IONOS, garantizando la seguridad mediante certificados SSL.
🔍 Parte 1: Investigación Teórica (README.md)
En el archivo README.md de su repositorio, deben documentar técnicamente los siguientes pilares de una PWA:
Web App Manifest (manifest.json):
Explicar el propósito de propiedades como theme_color, background_color, display (standalone vs browser) y la importancia del array de icons.
Service Workers:
Describir el proceso de registro y el ciclo de vida (Installation, Activation, Fetching).
¿Cómo actúan como un proxy de red?
Estrategias de Almacenamiento (Caching):
Comparativa técnica entre Stale-While-Revalidate, Cache First y Network First.
Seguridad y TLS:
¿Por qué HTTPS es un requisito habilitador para los Service Workers?
Impacto de los certificados en el "Install Prompt" del navegador.
🛠️ Parte 2: Implementación Técnica (PWA Test)
1. Desarrollo de la App
Stack: React + Vite + TypeScript.
Funcionalidad: Una aplicación sencilla (ej. Task Manager, Clima, o Notas) que demuestre persistencia de datos (LocalStorage o IndexedDB).
IA: Se permite el uso de Google AI Studio para generar el código base del Service Worker y el manifiesto.
2. Contenedorización con Docker y Nginx
Para evitar errores de despliegue, deben crear un Dockerfile multi-etapa:
Etapa 1 (Build): Usar node:alpine para compilar el proyecto de Vite.
Etapa 2 (Production): Usar nginx:stable-alpine para servir los archivos estáticos generados en /dist.
3. Certificados SSL y Seguridad
Para que la PWA sea instalable en el servidor de IONOS, el sitio DEBE correr bajo HTTPS:
Deben configurar su contenedor o el servidor para utilizar un certificado (pueden usar Certbot / Let's Encrypt o los certificados proporcionados por IONOS).
Configurar Nginx para redirigir el tráfico del puerto 80 al 443.
🚀 Instrucciones de Entrega
1. GitHub
Crear repositorio público: pwa-ionos-nombre-apellido.
Incluir: Código fuente, Dockerfile, nginx.conf y la investigación en el README.md.
Obligatorio: Agregar como colaborador a: mikecardona076.
2. Despliegue en IONOS
La aplicación debe estar corriendo en su instancia de IONOS.
Verificar mediante el panel de "Lighthouse" en Chrome que la app cumple con el check de PWA (Instalable y Offline).
3. Envío por Correo
Enviar a la cuenta del docente con el asunto: "PWA TEST IONOS - [Tu Nombre]":
Link directo a la PWA funcionando (URL con HTTPS).
Enlace al repositorio de GitHub.
✅ Criterios de Evaluación
Criterio Técnico: Uso correcto de TypeScript y Docker.
Criterio PWA: El navegador debe mostrar el icono de "Instalar App".
Criterio de Seguridad: El sitio debe mostrar el candado verde (SSL Válido).
Criterio de Investigación: Documentación profesional y técnica en el README.
"La implementación correcta de una PWA requiere una sinergia perfecta entre el desarrollo frontend y la configuración de infraestructura."

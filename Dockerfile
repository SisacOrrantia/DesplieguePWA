# ============================================================
# Dockerfile — Task Manager PWA
# Germán Sisac Orrantia González — UTT 2026
# ============================================================

# ---- Etapa 1: Build ----------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (caching de capas)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# ---- Etapa 2: Producción -----------------------------------
FROM nginx:stable-alpine AS production

# Eliminar configuración default de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copiar archivos compilados desde la etapa de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puertos HTTP y HTTPS
EXPOSE 80 443

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

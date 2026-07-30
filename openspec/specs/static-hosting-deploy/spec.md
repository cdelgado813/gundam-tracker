# static-hosting-deploy Specification

## Purpose
Cómo se despliega y sirve la app: GitHub Pages con dominio propio, PWA instalable con actualización automática, CI que construye y publica en cada push a `main`.
## Requirements
### Requirement: Sitio estático en GitHub Pages con dominio propio
El proyecto SHALL desplegarse como sitio 100% estático en GitHub Pages, servido bajo un subdominio de `poordevelopers.com` (p. ej. `gundam.poordevelopers.com`) con HTTPS, mediante un registro CNAME gestionado en Cloudflare.

#### Scenario: Despliegue automático
- **WHEN** se hace push a la rama principal del repositorio
- **THEN** GitHub Actions construye la app y publica el resultado en GitHub Pages sin pasos manuales

#### Scenario: Acceso por dominio propio
- **WHEN** un usuario visita `https://gundam.poordevelopers.com`
- **THEN** la app carga con certificado válido y el routing de la SPA funciona también en rutas profundas y recargas

### Requirement: PWA instalable
La aplicación SHALL ser una PWA válida (manifest + service worker) instalable en escritorio y móvil, con precache del shell de la app para arrancar offline.

#### Scenario: Instalación en móvil
- **WHEN** el usuario visita la web desde un navegador móvil compatible
- **THEN** puede instalarla en su pantalla de inicio y abrirla a pantalla completa sin conexión

### Requirement: Sin llamadas del navegador a CardTrader
El sistema SHALL servir catálogo y precios como datos propios de mismo origen (ver `catalog-data-pipeline`); el navegador MUST NOT llamar directamente a `api.cardtrader.com` ni conocer ninguna credencial de esa API.

#### Scenario: Petición a datos propios
- **WHEN** la app necesita catálogo o precios
- **THEN** los obtiene de `/data/*.json` en el propio dominio, sin cabecera de autenticación ni petición cross-origin


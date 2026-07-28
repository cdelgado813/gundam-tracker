# static-hosting-deploy

## ADDED Requirements

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

### Requirement: Acceso a la API de CardTrader desde el navegador
El sistema SHALL verificar el comportamiento CORS de `api.cardtrader.com` desde origen web y, si la API no permite llamadas cross-origin desde navegador, SHALL interponer un proxy propio mínimo (Cloudflare Worker en el mismo dominio) que reenvíe las peticiones con la cabecera Authorization del usuario sin almacenar nada.

#### Scenario: API con CORS permitido
- **WHEN** las llamadas directas desde el navegador a `api.cardtrader.com` funcionan
- **THEN** la app llama a la API directamente sin infraestructura adicional

#### Scenario: API sin CORS
- **WHEN** el navegador bloquea las llamadas directas por CORS
- **THEN** las llamadas se enrutan por `https://gundam-api.poordevelopers.com` (Worker proxy sin estado ni logs de tokens) de forma transparente para el usuario

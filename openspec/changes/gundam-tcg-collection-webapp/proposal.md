# Proposal: Gundam TCG Collection Webapp

## Why

No existe una herramienta ligera, sin cuentas de usuario ni servicios SaaS, para gestionar una colección de cartas de Gundam TCG (Gundam Card Game). CardTrader ya expone toda la información maestra (expansiones, blueprints/cartas, precios de marketplace) vía su API v2, así que la app solo necesita ser un cliente estático inteligente: los datos del usuario (colección, wishlist, listas de trade) viven en el dispositivo con caché y copias de seguridad automáticas.

**Revisión 2026-07-28:** el diseño inicial pedía a cada visitante su propio JWT de CardTrader. Se comprobó que nada de lo que la app lee de CardTrader (catálogo, precios) es específico de una cuenta — son los mismos datos para cualquiera — así que exigir un token por visitante era fricción sin beneficio, y además un riesgo si alguien reutilizaba un token con permisos de venta en su cuenta real. Se sustituyó por un pipeline en CI: el token del propietario vive como secret de GitHub Actions y nunca llega al navegador; ver capacidad `catalog-data-pipeline`.

## What Changes

- Nueva webapp estática (PWA) alojada en GitHub Pages bajo el dominio `poordevelopers.com` (DNS gestionado en Cloudflare), sin backend propio ni SaaS adicional.
- Sin onboarding ni credenciales: la app abre directamente en el catálogo. Un workflow programado de GitHub Actions sincroniza el catálogo y los precios desde CardTrader usando el token del propietario (secret de CI) y los publica como JSON estático junto con el sitio.
- Catálogo maestro de Gundam TCG (expansiones y cartas) servido como datos estáticos propios y cacheado localmente (IndexedDB) con refresco bajo demanda.
- Gestión de colección: añadir/quitar cartas con cantidad, condición e idioma; totales y progreso por expansión; valoración estimada con precios de marketplace.
- Wishlist de cartas deseadas.
- Listas de intercambio (trade lists) de máximo 50 cartas, compartibles con otros usuarios sin servidor: la lista se serializa/comprime en la propia URL (o QR/fichero exportado) y cualquier usuario de la app puede abrirla.
- Persistencia local primero (IndexedDB) con copias de seguridad automáticas exportables (fichero JSON descargable/File System Access API) y restauración.
- Diseño super moderno, oscuro/claro, mobile-first, pensado para reutilizarse después en las apps Android/iOS (fase futura; este change cubre solo la webapp).

## Capabilities

### New Capabilities
- `catalog-data-pipeline`: sincronización en CI (token del propietario como secret) que publica catálogo y precios de Gundam TCG como JSON estático, sin exponer credenciales al navegador.
- `card-catalog`: caché y navegación del maestro de Gundam TCG (expansiones, cartas/blueprints, imágenes, precios) leído de los datos estáticos publicados.
- `collection-management`: gestión de la colección propia (cantidades, condición, idioma, progreso por expansión, valoración estimada).
- `wishlist`: lista de cartas deseadas con acciones rápidas desde el catálogo.
- `trade-lists`: creación de listas de máx. 50 cartas y compartición sin servidor (URL comprimida / QR / export) e importación por otros usuarios.
- `local-persistence-backup`: almacenamiento local (IndexedDB), copias de seguridad automáticas, export/import manual y restauración.
- `static-hosting-deploy`: build y despliegue de la web estática en GitHub Pages con dominio `poordevelopers.com` vía Cloudflare DNS.

### Modified Capabilities

_(ninguna — proyecto nuevo, no hay specs existentes)_

## Impact

- Repositorio nuevo de la webapp (SPA/PWA estática); GitHub Actions para build+deploy a GitHub Pages y un segundo workflow (`sync-catalog.yml`) que sincroniza los datos.
- DNS: registro CNAME en Cloudflare apuntando un subdominio (p. ej. `gundam.poordevelopers.com`) a GitHub Pages.
- Dependencia externa: API CardTrader v2 (`api.cardtrader.com`), llamada únicamente desde el pipeline de CI (Node, no navegador) con el token del propietario como secret de repositorio. El navegador nunca se conecta a CardTrader.
- Sin base de datos ni servicios de servidor: todos los datos del usuario viven en el dispositivo; el catálogo/precios son JSON estático versionado junto con el sitio.
- Ningún visitante necesita credenciales para usar la app.

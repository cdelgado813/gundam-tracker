# Proposal: Gundam TCG Collection Webapp

## Why

No existe una herramienta ligera, sin cuentas de usuario ni servicios SaaS, para gestionar una colección de cartas de Gundam TCG (Gundam Card Game). CardTrader ya expone toda la información maestra (expansiones, blueprints/cartas, precios de marketplace) vía su API v2 con autenticación JWT por usuario, así que la app solo necesita ser un cliente estático inteligente: los datos del usuario (colección, wishlist, listas de trade) viven en el dispositivo con caché y copias de seguridad automáticas.

## What Changes

- Nueva webapp estática (PWA) alojada en GitHub Pages bajo el dominio `poordevelopers.com` (DNS gestionado en Cloudflare), sin backend propio ni SaaS adicional.
- Onboarding tipo tour donde el usuario introduce su propio JWT de CardTrader; ese token autentica todas las llamadas a la API. Re-solicitud del token cuando expira o falla la autenticación.
- Catálogo maestro de Gundam TCG (expansiones y cartas) descargado desde la API de CardTrader y cacheado localmente (IndexedDB) con refresco bajo demanda.
- Gestión de colección: añadir/quitar cartas con cantidad, condición e idioma; totales y progreso por expansión; valoración estimada con precios de marketplace.
- Wishlist de cartas deseadas.
- Listas de intercambio (trade lists) de máximo 50 cartas, compartibles con otros usuarios sin servidor: la lista se serializa/comprime en la propia URL (o QR/fichero exportado) y cualquier usuario de la app puede abrirla.
- Persistencia local primero (IndexedDB) con copias de seguridad automáticas exportables (fichero JSON descargable/File System Access API) y restauración.
- Diseño super moderno, oscuro/claro, mobile-first, pensado para reutilizarse después en las apps Android/iOS (fase futura; este change cubre solo la webapp).

## Capabilities

### New Capabilities
- `jwt-onboarding`: tour de arranque, captura/validación/almacenamiento local del JWT del usuario y re-autenticación cuando el token deja de funcionar.
- `card-catalog`: descarga, caché y navegación del maestro de Gundam TCG (expansiones, cartas/blueprints, imágenes, precios) desde la API de CardTrader.
- `collection-management`: gestión de la colección propia (cantidades, condición, idioma, progreso por expansión, valoración estimada).
- `wishlist`: lista de cartas deseadas con acciones rápidas desde el catálogo.
- `trade-lists`: creación de listas de máx. 50 cartas y compartición sin servidor (URL comprimida / QR / export) e importación por otros usuarios.
- `local-persistence-backup`: almacenamiento local (IndexedDB), copias de seguridad automáticas, export/import manual y restauración.
- `static-hosting-deploy`: build y despliegue de la web estática en GitHub Pages con dominio `poordevelopers.com` vía Cloudflare DNS.

### Modified Capabilities

_(ninguna — proyecto nuevo, no hay specs existentes)_

## Impact

- Repositorio nuevo de la webapp (SPA/PWA estática); GitHub Actions para build+deploy a GitHub Pages.
- DNS: registro CNAME en Cloudflare apuntando un subdominio (p. ej. `gundam.poordevelopers.com`) a GitHub Pages.
- Dependencia externa única: API CardTrader v2 (`api.cardtrader.com`) autenticada con el JWT del propio usuario. Atención a CORS: si la API no permite llamadas desde navegador, se necesitará un proxy mínimo (Cloudflare Worker) — a validar en diseño.
- Sin base de datos ni servicios de servidor: todos los datos del usuario viven en el dispositivo.
- El JWT del usuario se guarda solo localmente; nunca se incluye en URLs compartidas ni backups exportados por defecto.

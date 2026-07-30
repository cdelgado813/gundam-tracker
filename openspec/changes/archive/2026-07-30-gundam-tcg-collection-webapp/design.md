# Design: Gundam TCG Collection Webapp

## Context

Herramienta personal (y compartible) para gestionar la colección de Gundam TCG. La fuente de datos maestros es la API de CardTrader v2 (colección Postman en la raíz del repo: juegos, expansiones, blueprints, marketplace), autenticada con Bearer JWT. **Revisión 2026-07-28:** el diseño original pedía el JWT a cada visitante en un tour de arranque; se comprobó que ninguno de los datos que la app lee de CardTrader es específico de una cuenta (catálogo y precios son públicos, iguales para cualquiera), así que el token del propietario se movió a un secret de CI y la webapp ya no pide ni conoce ningún JWT — ver D3. Restricciones clave:

- Sin SaaS, sin backend propio con estado, sin cuentas de usuario.
- Hosting: GitHub Pages (repo GitHub disponible) + dominio `poordevelopers.com` en Cloudflare (token API en variables de entorno del sistema).
- Todos los datos del usuario viven en el dispositivo, con backups automáticos.
- Primero webapp; Android/iOS más adelante reutilizando lo máximo posible.

## Goals / Non-Goals

**Goals:**
- PWA estática, offline-first, instalable, con diseño moderno mobile-first.
- Catálogo completo de Gundam TCG cacheado localmente; colección, wishlist y trade lists (≤50 cartas) locales.
- Compartición de trade lists sin servidor (URL con payload comprimido / QR / fichero).
- Backups automáticos rotativos + export/import manual.
- Base de código que facilite el port a móvil (Capacitor) sin reescritura.

**Non-Goals:**
- Apps Android/iOS (change futuro; solo se prepara el terreno).
- Compra/venta real vía CardTrader (cart, orders, products) — la app es de gestión, no de trading en el marketplace.
- Sincronización entre dispositivos por servidor, cuentas de usuario, analítica.

## Decisions

### D1. Stack: Vite + React + TypeScript + Tailwind CSS
SPA estática generada con Vite. React por ecosistema y por ser el camino más directo hacia Capacitor (móvil) reutilizando el 100% del código. Tailwind (v4) + Radix UI primitives para conseguir el acabado moderno con dark mode nativo. Alternativas: Svelte/SolidJS (menos ecosistema para el port móvil), Next.js (innecesario: no hay SSR posible en GitHub Pages).

- Estado: Zustand (ligero) + TanStack Query para llamadas a API con caché.
- Persistencia: IndexedDB vía Dexie.js (esquema tipado, migraciones, `liveQuery` para reactividad).

### D2. Datos maestros: pipeline en CI + caché completa en IndexedDB (revisado 2026-07-28)
`scripts/sync-catalog.mjs` corre en GitHub Actions (workflow `sync-catalog.yml`, cron diario + manual) con el token del propietario en el secret `CARDTRADER_JWT`: `GET /games` → localizar Gundam (`game_id 23`) → `GET /expansions` → por expansión `GET /blueprints/export` (filtrando `category_id 272`, cartas sueltas) y `GET /marketplace/products?expansion_id=`. El resultado se publica como JSON estático versionado en el propio repo bajo `webapp/public/data/` (`expansions.json`, `cards/<id>.json`, `prices/<id>.json`, `meta.json`) y se sirve junto con el sitio.

La webapp nunca llama a `api.cardtrader.com`: descarga esos JSON estáticos (mismo origen, sin CORS ni auth) y los normaliza a la tabla `cards` de IndexedDB. Imágenes servidas directamente desde las URLs de CardTrader (públicas, sin auth) con `loading="lazy"`; el service worker las cachea (Cache API, stale-while-revalidate) para uso offline. Precios: el cliente lee `prices/<expansionId>.json` bajo demanda con TTL local de 12 h (los datos en sí solo cambian con cada ejecución del cron); `meta.json` expone cuándo se generó el snapshot para mostrar la antigüedad en Ajustes.

### D3. Sin autenticación de usuario (revisado 2026-07-28, sustituye al diseño original de JWT por visitante)
Se comprobó que la API de CardTrader exige un token válido en *todas* las llamadas, incluidas las de catálogo público — pero nada de lo que la app lee (juegos, expansiones, cartas, precios) es específico de una cuenta: son los mismos datos para cualquiera. Pedir a cada visitante que generase y pegase su propio JWT era, por tanto, fricción de onboarding sin beneficio funcional, además de un riesgo si algún usuario reutilizaba un token con permisos de venta/compra en su cuenta real de CardTrader.

Diseño anterior (retirado): tour de arranque pidiendo el JWT, guardado en IndexedDB, interceptor `Authorization: Bearer`, modal de re-autenticación en 401/403. Todo ese código (`features/onboarding/*`, `lib/api.ts`, `lib/jwt.ts`) se eliminó. La app abre directamente en el catálogo; un banner de bienvenida dismissible (sin bloquear nada) enlaza a `/about`.

### D4. CORS — ya no aplica (RESUELTO 2026-07-28, revisado)
Se verificó que `api.cardtrader.com` permite CORS (`access-control-allow-origin: *`), pero tras D2/D3 esto ya es irrelevante: el navegador nunca llama a esa API directamente. Solo el pipeline de CI (Node, sin navegador) habla con CardTrader.

### D5. Trade lists compartidas por URL fragment
Payload JSON mínimo `{v, name, alias?, items:[{b, q, c?}]}` (blueprint id, cantidad, condición) → compresión con `CompressionStream`/fflate → base64url → `https://gundam.poordevelopers.com/#/t/<payload>`. Con ≤50 cartas el payload comprimido cabe holgadamente en una URL (<1.5 KB típico). El fragmento `#` no viaja al servidor: privacidad total. QR generado localmente (lib `qrcode`) y export a `.json` como alternativas. El receptor resuelve los blueprint ids contra su catálogo local y ve cruces con su wishlist.

### D6. Backups: rotación local + File System Access API
Auto-backup (debounced tras cambios + `visibilitychange`) de las tablas de usuario (colección, wishlist, trade lists) a una tabla `backups` con histórico de 5. Opcionalmente, si el usuario concede una carpeta (File System Access API, Chromium), cada backup se escribe también como `gundam-backup-YYYYMMDD-HHmm.json`. Export/import manual con esquema versionado (`schemaVersion`) y validación con Zod; import ofrece merge o replace.

### D7. Deploy: GitHub Actions → GitHub Pages + Cloudflare DNS
Workflow estándar `actions/deploy-pages` en push a `main`. Fichero `CNAME` con `gundam.poordevelopers.com`; registro CNAME en Cloudflare (DNS only o proxied, empezar DNS-only para dejar que GitHub emita el certificado) creable vía API con el token ya configurado en el sistema. Routing con hash router (`#/`) para evitar el problema de 404 en rutas profundas de GitHub Pages sin hacks.

### D8. Diseño visual
Sistema propio inspirado en estética mecha/Gundam: dark mode por defecto, acentos vivos (rojo/azul Gundam), tipografía display para números de coleccionista, grids de cartas con imágenes protagonistas, micro-interacciones (transiciones de vista, haptics en móvil vía Vibration API). Tokens de diseño en CSS variables para reutilizarlos en las apps nativas.

## Risks / Trade-offs

- [Rate limiting de la API al sincronizar muchas expansiones] → el pipeline de CI descarga secuencialmente con backoff exponencial y una pequeña pausa entre expansiones; corre una vez al día, no por visitante.
- [El navegador puede purgar IndexedDB] → `navigator.storage.persist()` + backups automáticos a carpeta del usuario + export manual destacado.
- [Token del propietario expuesto] → vive solo como secret de GitHub Actions, nunca en el bundle ni en el navegador; el sitio estático no hace ninguna llamada autenticada.
- [Precios desactualizados entre ejecuciones del cron] → `meta.json` expone la fecha de generación y la UI la muestra; TTL local 12 h evita relecturas innecesarias del mismo snapshot.
- [File System Access API no disponible en Firefox/Safari] → degradación a descargas periódicas recordadas + histórico interno de 5 backups.
- [Blueprints de Gundam TCG podrían no incluir imágenes/atributos completos] → verificado en la primera sincronización real; la UI tolera campos ausentes con placeholders.
- [URL compartida depende del formato estable] → payload versionado (`v`) desde el día 1.

## Migration Plan

Proyecto nuevo, sin migración. Orden de despliegue: repo + CI → Pages con dominio → validación CORS (→ Worker si hace falta) → releases incrementales. Rollback = revert del commit en `main`.

## Open Questions

- Nombre final del subdominio (`gundam.poordevelopers.com` propuesto).

**Resueltas (2026-07-28, ver docs/api-notes.md):** CORS abierto (`*`), sin proxy. Gundam es `game_id 23`, cartas = `category_id 272`, 38 expansiones, condiciones reales de CardTrader (`Mint…Poor` con Slightly/Moderately Played), idiomas `en|jp|zh-CN`.

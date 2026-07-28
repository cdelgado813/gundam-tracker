# Design: Gundam TCG Collection Webapp

## Context

Herramienta personal (y compartible) para gestionar la colección de Gundam TCG. La fuente de datos maestros es la API de CardTrader v2 (colección Postman en la raíz del repo: juegos, expansiones, blueprints, marketplace), autenticada con Bearer JWT que cada usuario obtiene de su propia cuenta de CardTrader. Restricciones clave:

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

### D2. Datos maestros: caché completa en IndexedDB
Flujo: `GET /games` → localizar Gundam TCG → `GET /expansions` filtrado por `game_id` → por expansión `GET /blueprints/export?expansion_id=`. Los blueprints se normalizan a una tabla `cards` (id, expansionId, name, collectorNumber, rarity, imageUrl, propiedades). Imágenes servidas desde las URLs de CardTrader con `loading="lazy"`; el service worker las cachea (Cache API, stale-while-revalidate) para uso offline. Precios de marketplace solo bajo demanda con TTL de 24 h y timestamp visible.

### D3. Autenticación: JWT del usuario, solo en local
El JWT se guarda en IndexedDB (no localStorage, para poder pedir persistencia; nunca en cookies). Un interceptor único añade `Authorization: Bearer` y centraliza el manejo de 401/403 → modal de re-captura de token. Validación al introducirlo: parse del payload (`exp`) + `GET /api/v2/info`. El token jamás sale hacia otro dominio ni se incluye en exports/URLs.

### D4. CORS: llamada directa (RESUELTO 2026-07-28)
Verificado con preflight OPTIONS y GET reales: `api.cardtrader.com` responde `access-control-allow-origin: *`, `access-control-allow-headers: authorization` y todos los métodos. **Se llama a la API directamente desde el navegador; no se crea ningún Worker proxy.** La capa de API del cliente mantiene una `baseUrl` configurable por si esto cambiara en el futuro.

### D5. Trade lists compartidas por URL fragment
Payload JSON mínimo `{v, name, alias?, items:[{b, q, c?}]}` (blueprint id, cantidad, condición) → compresión con `CompressionStream`/fflate → base64url → `https://gundam.poordevelopers.com/#/t/<payload>`. Con ≤50 cartas el payload comprimido cabe holgadamente en una URL (<1.5 KB típico). El fragmento `#` no viaja al servidor: privacidad total. QR generado localmente (lib `qrcode`) y export a `.json` como alternativas. El receptor resuelve los blueprint ids contra su catálogo local y ve cruces con su wishlist.

### D6. Backups: rotación local + File System Access API
Auto-backup (debounced tras cambios + `visibilitychange`) de las tablas de usuario (colección, wishlist, trade lists, settings sin JWT) a una tabla `backups` con histórico de 5. Opcionalmente, si el usuario concede una carpeta (File System Access API, Chromium), cada backup se escribe también como `gundam-backup-YYYYMMDD-HHmm.json`. Export/import manual con esquema versionado (`schemaVersion`) y validación con Zod; import ofrece merge o replace.

### D7. Deploy: GitHub Actions → GitHub Pages + Cloudflare DNS
Workflow estándar `actions/deploy-pages` en push a `main`. Fichero `CNAME` con `gundam.poordevelopers.com`; registro CNAME en Cloudflare (DNS only o proxied, empezar DNS-only para dejar que GitHub emita el certificado) creable vía API con el token ya configurado en el sistema. Routing con hash router (`#/`) para evitar el problema de 404 en rutas profundas de GitHub Pages sin hacks.

### D8. Diseño visual
Sistema propio inspirado en estética mecha/Gundam: dark mode por defecto, acentos vivos (rojo/azul Gundam), tipografía display para números de coleccionista, grids de cartas con imágenes protagonistas, micro-interacciones (transiciones de vista, haptics en móvil vía Vibration API). Tokens de diseño en CSS variables para reutilizarlos en las apps nativas.

## Risks / Trade-offs

- [CORS desconocido en CardTrader] → D4: fallback a Worker; se valida en la primera tarea de implementación para no condicionar el resto.
- [Rate limiting de la API al sincronizar muchas expansiones] → descargas secuenciales con backoff exponencial y progreso reanudable por expansión.
- [El navegador puede purgar IndexedDB] → `navigator.storage.persist()` + backups automáticos a carpeta del usuario + export manual destacado en onboarding.
- [JWT en local vulnerable a XSS] → sitio estático sin contenido de terceros inyectable, CSP estricta, sin `dangerouslySetInnerHTML`; riesgo residual aceptado (el token solo da acceso a la cuenta CardTrader del propio usuario).
- [File System Access API no disponible en Firefox/Safari] → degradación a descargas periódicas recordadas + histórico interno de 5 backups.
- [Blueprints de Gundam TCG podrían no incluir imágenes/atributos completos] → verificar en la primera sincronización real; la UI tolera campos ausentes con placeholders.
- [URL compartida depende del formato estable] → payload versionado (`v`) desde el día 1.

## Migration Plan

Proyecto nuevo, sin migración. Orden de despliegue: repo + CI → Pages con dominio → validación CORS (→ Worker si hace falta) → releases incrementales. Rollback = revert del commit en `main`.

## Open Questions

- Nombre final del subdominio (`gundam.poordevelopers.com` propuesto).

**Resueltas (2026-07-28, ver docs/api-notes.md):** CORS abierto (`*`), sin proxy. Gundam es `game_id 23`, cartas = `category_id 272`, 38 expansiones, condiciones reales de CardTrader (`Mint…Poor` con Slightly/Moderately Played), idiomas `en|jp|zh-CN`.

# Tasks: Gundam TCG Collection Webapp

## 1. Validación previa y scaffolding

- [x] 1.1 Verificar con el JWT del usuario el acceso a la API: `GET /info`, `GET /games` (identificar `game_id` de Gundam TCG), `GET /expansions` y un `GET /blueprints/export` de muestra; documentar estructura real de blueprints (imágenes, rarezas, propiedades) en `docs/api-notes.md`
- [x] 1.2 Probar CORS de `api.cardtrader.com` desde origen de navegador; decidir modo directo o proxy (D4) y registrar la decisión en design.md
- [x] 1.3 Crear proyecto `webapp/` con Vite + React + TypeScript + Tailwind v4, ESLint/Prettier, alias de paths y estructura de carpetas (features/, lib/, ui/)
- [x] 1.4 Configurar Dexie.js con esquema tipado: tablas `settings`, `expansions`, `cards`, `prices`, `collection`, `wishlist`, `tradeLists`, `backups`; solicitar `navigator.storage.persist()`

## 2. Capa de API y JWT onboarding

- [x] 2.1 Cliente API con `baseUrl` configurable, interceptor Bearer y manejo centralizado de 401/403 y errores de red
- [x] 2.2 ~~Cloudflare Worker proxy~~ N/A: CORS abierto verificado (1.2), llamada directa sin proxy
- [x] 2.3 Tour de onboarding (pasos de bienvenida + explicación de dónde sacar el JWT) con captura, validación (parse `exp` + `GET /info`) y guardado del token
- [x] 2.4 Modal de re-autenticación disparado por 401/403 o `exp` vencido, con reintento de la operación en curso y modo lectura offline

## 3. Catálogo maestro

- [x] 3.1 Sincronización inicial: games → expansions (Gundam TCG) → blueprints por expansión, con progreso visible, descargas secuenciales con backoff y reanudación por expansión
- [x] 3.2 Normalización de blueprints a tabla `cards` y comprobación diaria en segundo plano de expansiones nuevas con aviso no intrusivo
- [x] 3.3 Vistas de catálogo: grid de expansiones y grid de cartas con lazy-loading de imágenes y virtualización
- [x] 3.4 Búsqueda global (nombre, número de coleccionista, rareza) sobre IndexedDB con índices adecuados (<200 ms)
- [x] 3.5 Detalle de carta: imagen grande, datos maestros, estado en colección/wishlist y acciones rápidas
- [x] 3.6 Precios de marketplace bajo demanda con caché TTL 24 h, timestamp visible y funcionamiento offline con último precio

## 4. Colección, wishlist y trade lists

- [x] 4.1 CRUD de colección (cantidad, condición, idioma; múltiples entradas por carta) con controles +/- rápidos
- [x] 4.2 Vista de colección por expansión: barras de progreso X/Y únicas, totales globales, filtro de faltantes
- [x] 4.3 Valoración estimada de colección con transparencia "basado en N de M" y acción de refresco de precios por lotes
- [x] 4.4 Wishlist: toggle desde catálogo/detalle, vista ordenable con coste estimado y sugerencia de retirada al conseguir una carta
- [x] 4.5 Trade lists: CRUD con límite duro de 50 unidades, añadir desde colección con selector de lista destino
- [x] 4.6 Compartición: serialización versionada + compresión + base64url en fragmento de URL, generación de QR local y export a fichero; fallback automático si excede ~2000 caracteres
- [x] 4.7 Importación de listas: ruta `#/t/<payload>`, resolución contra catálogo local, cruce con wishlist, guardado como lista recibida y aviso de expansiones sin sincronizar

## 5. Persistencia y backups

- [x] 5.1 Auto-backup debounced tras cambios y en `visibilitychange`, histórico rotativo de 5 en tabla `backups` (sin JWT ni catálogo)
- [x] 5.2 Backup adicional a carpeta del usuario vía File System Access API con degradación elegante en Firefox/Safari
- [x] 5.3 Export manual JSON versionado e import con validación Zod, vista previa y modos merge/replace

## 6. PWA, diseño y despliegue

- [x] 6.1 Sistema de diseño: tokens CSS (paleta mecha, dark/light), componentes base (botones, cards, sheets, toasts) con Radix + Tailwind, navegación mobile-first con transiciones
- [x] 6.2 PWA: manifest, iconos, service worker con precache del shell y cache stale-while-revalidate para imágenes de cartas
- [x] 6.3 CSP estricta y revisión de que el JWT nunca aparece en URLs, exports ni logs
- [x] 6.4 Repositorio GitHub + workflow Actions de build y deploy a GitHub Pages con fichero CNAME
- [x] 6.5 Registro CNAME en Cloudflare + HTTPS verificados y forzados. Pendiente del usuario: prueba manual en móvil real (instalar PWA, offline, compartir/importar lista entre dos navegadores)

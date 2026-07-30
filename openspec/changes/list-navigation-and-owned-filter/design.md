## Context

`Shell` (`App.tsx`) renderiza todas las rutas dentro de un único `<main className="min-h-0 flex-1 overflow-y-auto">`: es el único contenedor que hace scroll (no `window`), y no se desmonta entre navegaciones — solo cambian sus hijos vía `<Routes>`. Hoy no hay ninguna gestión de scroll: al navegar, el `scrollTop` de `main` conserva su valor numérico crudo, lo que en la práctica se percibe como "salta arriba" porque `HashRouter` cambia `location.hash` y algunos navegadores tratan ese cambio como una navegación a fragmento (comportamiento nativo de scroll-to-top/anchor, no controlado por la app).

El único filtro de propiedad que existe hoy es `onlyMissing` (booleano local), duplicado de forma independiente en `ExpansionPage` (solo visible si `?from=collection`) y `CustomCollectionDetailPage`. No hay forma de ver "solo lo que ya tienes" en ningún sitio.

Las pestañas de navegación (`nav` en `Shell`) usan `NavLink` estándar: pulsar la pestaña en la que ya estás no dispara navegación (React Router no re-renderiza si la ruta no cambia), así que hoy no pasa nada.

## Goals / Non-Goals

**Goals:**
- Recordar la posición de scroll de `main` por ruta y restaurarla solo al volver atrás (POP), nunca al entrar por primera vez (PUSH) a una pantalla.
- Ofrecer botones flotantes de ir arriba / abajo en cualquier pantalla donde el contenido no quepa entero.
- Al pulsar una pestaña de navegación estando ya dentro de esa sección (incluyendo sub-rutas conocidas, p. ej. `/expansion/:id` pertenece a Catálogo), volver a la raíz de la sección con el scroll y los filtros de búsqueda/rareza reiniciados.
- Un control de propiedad de tres estados (Todas/En propiedad/Faltantes) reutilizable, sustituyendo el `onlyMissing` binario donde ya existe y añadiéndolo donde falta (catálogo, wishlist).

**Non-Goals:**
- No se persiste el scroll entre sesiones (recargar la página): vive en memoria de la sesión de navegación, no en Dexie.
- No se resuelve el reinicio de sección para `/card/:id` (accesible desde catálogo, colección, wishlist o trades por igual): pulsar una pestaña estando en el detalle de una carta simplemente navega a esa sección como ya ocurre hoy; no hay "vuelta a home" mágica desde ahí.
- El filtro de propiedad de tres estados no sustituye el resaltado por color existente (`dimIfMissing` en `CardTile`); son complementarios.

## Decisions

### D1: Memoria de scroll con `sessionStorage` + tipo de navegación de React Router

Hook `useScrollRestoration(scrollRef)` montado una única vez en `Shell`, con acceso al `ref` de `main` y a `useLocation()` / `useNavigationType()` de `react-router-dom`:
- En cada cambio de ruta, antes de aplicar el nuevo contenido, guarda `scrollRef.current.scrollTop` en `sessionStorage` bajo la clave `scroll:${location.pathname}${location.search}` (la ruta que se abandona).
- Tras el cambio, si `navigationType === 'POP'` (atrás/adelante del historial) y existe una entrada guardada para la ruta nueva, restaura `scrollTop` a ese valor (via `requestAnimationFrame` para esperar al layout). Si `navigationType` es `PUSH` o `REPLACE`, deja el scroll en `0` (comportamiento actual, deseado al entrar a algo nuevo).
- **Alternativa descartada**: guardar el scroll en un `Map` en memoria (sin `sessionStorage`). Se descarta porque un refresco de página (recarga manual, actualización de PWA) perdería la posición justo en el caso de uso que más se pidió ("que se guarde"); `sessionStorage` sobrevive a recargas dentro de la misma pestaña sin persistir entre sesiones (no hace falta más).

### D2: Botones flotantes globales en `Shell`, no por página

Un único componente `ScrollEdgeButtons` se monta en `Shell` (no en cada página), recibe el mismo `ref` de `main` que D1, y decide su visibilidad mirando `scrollHeight`/`clientHeight`/`scrollTop` del contenedor:
- Botón "arriba" visible cuando `scrollTop` supera un umbral pequeño (p. ej. 240px).
- Botón "abajo" visible cuando falta más de una pantalla para llegar al final.
- Se posicionan fijos sobre la barra de navegación inferior, en la esquina, para no chocar con `BulkAssignBar` ni los toasts (que ya ocupan `bottom-16`/`bottom-20` centrados).
- **Alternativa descartada**: implementarlo por página (como hoy se hace con `toast`/`BulkAssignBar`). Se descarta por duplicar la misma lógica en 6+ archivos cuando el contenedor de scroll es único y global.

### D3: Reinicio de pestaña por mapa estático de prefijos

`Shell` mantiene un mapa `tabId -> string[]` de rutas que "pertenecen" a cada pestaña (p. ej. Catálogo: `['/', '/expansion']`; Colección: `['/collection', '/collections']`; Wishlist: `['/wishlist']`; Trades: `['/trades']`; Ajustes: `['/settings']`). El `onClick` de cada `NavLink`:
- Calcula si la ruta actual pertenece a esa pestaña (`pathname === to || pathname.startsWith(prefix + '/')` para alguno de sus prefijos).
- Si pertenece, hace `event.preventDefault()` y `navigate(to, { replace: true })` explícito, borra la entrada de `sessionStorage` de esa ruta raíz (para que no se restaure scroll viejo) y fuerza `scrollTop = 0`.
- Si no pertenece, no hace nada especial: el `NavLink` navega de forma normal (ya es "ir al inicio de esa sección" al ser una navegación nueva).
- El reinicio de filtros de búsqueda ocurre gratis en Catálogo (los filtros viven en la URL vía `useSearchParams`, y `navigate('/', { replace: true })` los limpia). Las demás pestañas no tienen filtros persistentes que reiniciar hoy.
- **Alternativa descartada**: usar un `key` global en `<Routes>` para forzar remount. Se descarta porque remontaría también al navegar normalmente entre pestañas distintas, perdiendo el propósito de recordar el scroll de secciones no tocadas.

### D4: Filtro de propiedad como componente controlado de tres estados

`OwnershipFilter` (`webapp/src/ui/`) recibe `value: 'all' | 'owned' | 'missing'`, `onChange`, y `ownedCount`/`missingCount` opcionales para mostrar recuentos. Reemplaza:
- El checkbox `onlyMissing` de `ExpansionPage` y `CustomCollectionDetailPage` (ahora tres opciones en vez de una).
- Se añade de nuevo en `CatalogPage` (resultados de búsqueda) y `WishlistListDetailPage`, donde hoy no existe ningún filtro de propiedad.
- La lógica de filtrado (`visible = cards.filter(...)`) se ajusta en cada página consumidora; el componente en sí no conoce `Card` ni `Dexie`, solo expone el estado de tres botones tipo segmented control.
- **Alternativa descartada**: mantener dos checkboxes independientes ("en propiedad" y "faltantes"). Se descarta porque son mutuamente excluyentes por definición (una carta o la tienes o no) y dos checkboxes independientes permitirían un estado contradictorio sin aportar nada.

## Risks / Trade-offs

- [Riesgo] `sessionStorage` puede crecer con una entrada por ruta visitada en la sesión → Mitigación: claves cortas, valor único (número), y el navegador limpia `sessionStorage` al cerrar la pestaña; volumen irrelevante para esta app.
- [Riesgo] Restaurar scroll antes de que el contenido async (Dexie `useLiveQuery`) haya pintado puede restaurar a una posición que aún no existe → Mitigación: `requestAnimationFrame` doble (uno para el commit de React, otro para el layout) antes de fijar `scrollTop`; si el contenido es más corto que el valor guardado, el navegador simplemente clampa al máximo posible, sin excepción.
- [Trade-off] El reinicio de pestaña usa un mapa estático de prefijos en vez de metadatos por ruta (p. ej. un campo `tab` en la definición de cada `<Route>`) → aceptado por simplicidad; si el número de rutas por sección crece mucho, se puede migrar a metadatos declarativos sin cambiar el comportamiento observado.

## Migration Plan

Sin migración de datos (cambio puramente de UI/cliente). Despliegue estándar: build, smoke test del preview, commit y push a `main` (GitHub Actions ya publica en cada push).

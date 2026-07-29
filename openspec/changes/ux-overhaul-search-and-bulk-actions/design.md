## Context

Séptima iteración de la webapp, centrada en coherencia de interacción. Estado actual: la búsqueda global (texto + chips de rareza, persistida en URL) solo existe en `CatalogPage`; `ExpansionPage`, `CustomCollectionDetailPage` y `WishlistPage` muestran listas sin filtro; la barra de selección (`BulkAssignBar`) es una fila única con 2–3 botones y el recuento como número suelto; las acciones masivas solo suman (+1 propiedad, añadir a colección) salvo «quitar de la colección»; el listado de expansiones del Catálogo muestra `ownedUniques/total`; el detalle de carta muestra el precio del snapshot de CI pero no enlaza a CardTrader.

## Goals / Non-Goals

**Goals:**
- Simetría añadir/quitar en las acciones masivas, con confirmación en las restas.
- Barra de selección con jerarquía visual clara (recuento arriba, acciones en cuadrícula agrupadas por eje).
- Búsqueda + filtro de rareza reutilizables en toda vista con grid de cartas.
- Vista «Todas las cartas» de la colección.
- Home del Catálogo con la búsqueda como protagonista y sin métricas de completado.
- Puente saliente a CardTrader desde el detalle de carta.

**Non-Goals:**
- Persistir en URL los filtros locales de cada vista (solo la home del Catálogo lo necesita, porque es el punto de retorno de «volver»; en las demás vistas el filtro es efímero).
- Compra/carrito dentro de la app: el enlace a CardTrader es saliente (`target="_blank"`), nada más.
- Elegir condición/idioma en acciones masivas (sigue fijo Near Mint/en; el detalle cubre el resto).

## Decisions

### D1. Resta de propiedad en lote: espejo exacto del +1
`removeCardsFromOwned(cardIds)` en `features/collection/data.ts`: por carta, −1 copia priorizando la entrada Near Mint/en (la que crea el +1); si no existe, resta de la entrada con más copias; si la cantidad llega a 0 se elimina la entrada; sin copias, la carta se omite y no cuenta en el resultado. Una única transacción; devuelve cuántas se decrementaron. Racional: el usuario percibe +1/−1 como par simétrico — la resta debe deshacer lo que la suma hace, y degradar con sentido cuando el par no es exacto.

### D2. Barra de selección como hoja inferior con cuadrícula
`BulkAssignBar` se reorganiza: fila superior con «N cartas seleccionadas» + botón cerrar; debajo, cuadrícula 2×2 (o 2×1 según contexto) de botones icono+etiqueta: eje propiedad («+1 en propiedad», «−1 de propiedad») y eje colecciones («Añadir a colección», «Quitar de esta colección» solo con `removeFromCollectionId`). El desplegable de colecciones se mantiene como panel superior anclado. Confirmación (`window.confirm`, consistente con el resto de la app) en «−1 de propiedad» y «Quitar de esta colección», con recuento en el mensaje. La barra sigue sin cerrarse tras cada acción (decisión previa del usuario).

### D3. Filtro en vista: componente `CardListControls` sobre la lista ya cargada
Nuevo componente reutilizable (input de búsqueda + chips de rareza calculados de las cartas visibles de esa vista) que devuelve el predicado aplicado por la vista con `useMemo` — filtra en memoria la lista que la vista ya tiene, sin tocar Dexie ni URL. Se monta en `ExpansionPage`, `CustomCollectionDetailPage`, `AllCardsPage` y `WishlistPage`. `CatalogPage` conserva su mecánica actual (URL + consulta global) porque su búsqueda es sobre todo el maestro y debe sobrevivir al «volver». Los chips de rareza de cada vista muestran solo las rarezas presentes en esa lista.

### D4. «Todas las cartas» como ruta propia, no como pseudo-expansión
`AllCardsPage` en `/collection/all`: todas las cartas con ≥1 copia (join colección→cards), orden por número de coleccionista, contador de copias, `dimIfMissing` irrelevante (todas se poseen) pero mismo modo selección y `CardListControls`. Entrada destacada al inicio de `CollectionPage` («Todas las cartas · N únicas / M copias»). Racional: una ruta propia mantiene `ExpansionPage` sin caso especial de «expansión virtual».

### D5. Catálogo para buscar, no para medir
- Home: bloque hero (título + subtítulo corto + buscador grande con foco visual); chips de rareza debajo.
- Tarjetas de expansión: «N cartas» (total del maestro) en lugar de `owned/total`; se elimina el hook de únicas poseídas de esta vista.
- `ExpansionPage` en modo catálogo (sin `?from=collection`): se oculta la barra de progreso y el contador X/Y; en modo colección se conserva todo tal cual.

### D6. Enlace a CardTrader
Botón secundario «Ver en CardTrader» en el detalle de carta → `https://www.cardtrader.com/cards/<blueprintId>` con `target="_blank" rel="noreferrer"`. Formato verificado (HTTP 200 con blueprint real). Es navegación saliente: la CSP (`connect-src 'self'`) no aplica a enlaces.

## Risks / Trade-offs

- [−1 en lote puede borrar entradas con condición/idioma no estándar si no hay NM/en] → degradación documentada (resta de la entrada con más copias) + confirmación previa con recuento; el detalle de carta permite ajuste fino.
- [Filtro en memoria en listas grandes (Todas las cartas)] → el máximo realista es ~1.8k cartas ya cargadas; filtrar en memoria con `useMemo` es trivial a ese tamaño.
- [CardTrader podría cambiar el formato de URL] → enlace construido en un único helper; fallo = 404 externo, sin impacto en la app.

## Migration Plan

Sin migración de datos. Despliegue normal por push a `main`.

## Open Questions

Ninguna.

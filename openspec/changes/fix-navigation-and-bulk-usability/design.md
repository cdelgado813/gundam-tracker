## Context

La app usa HashRouter con una única ruta de detalle de carta (`/card/:id`) alcanzable desde seis orígenes: resultados de búsqueda del Catálogo, expansión en modo catálogo, expansión en modo colección (`?from=collection`), colección personalizada (`/collections/:id`), wishlist y trade lists. El «volver» del detalle está hardcodeado a `/expansion/:id`, lo que descarta el origen real. El modo selección masiva existe en Catálogo/Expansión con una única acción (añadir a colección personalizada) implementada en `BulkAssignBar`.

Alcance cerrado con el usuario por entrevista (2026-07-28): navegación por historial, doble acción masiva, selección dentro de colecciones personalizadas con quitar-de-colección, +1 rápido en tarjetas de vistas de colección. Descartado: restauración de scroll.

## Goals / Non-Goals

**Goals:**
- «Volver» devuelve siempre al contexto real de origen sin mantener un grafo manual de rutas.
- Marcar en propiedad en bloque y por tarjeta (+1) sin pasar por el detalle.
- Ciclo completo de gestión de una colección personalizada desde su propia página (marcar en propiedad, quitar de la colección).

**Non-Goals:**
- Restauración de posición de scroll (descartado en entrevista).
- Selección masiva en wishlist o trade lists.
- Elegir condición/idioma en las acciones rápidas: siempre Near Mint/en (el detalle sigue disponible para casos finos).

## Decisions

### D1. Volver por historial con fallback (no propagación de `?from=`)
`CardDetailPage` sustituye el `Link` fijo por un botón que llama a `navigate(-1)` cuando hay historial de la propia app (`window.history.state?.idx > 0`, que React Router mantiene) y, si no lo hay (URL directa/recarga), navega a `/expansion/:id`. Ventaja sobre propagar `?from=` por todos los orígenes: cubre los seis puntos de entrada de una vez, conserva query params del origen (p. ej. `?from=collection`) sin serializarlos, y no rompe si aparecen orígenes nuevos. El texto del botón pasa a un genérico «Volver» (el nombre de la expansión ya está en la propia página).

### D2. `BulkAssignBar` con dos acciones y variante por contexto
La barra flotante recibe las acciones como configuración según dónde se monte:
- Catálogo/Expansión: «Marcar en propiedad» + «Añadir a colección personalizada».
- Colección personalizada: «Marcar en propiedad» + «Quitar de esta colección».

«Marcar en propiedad» llama a una nueva `addCardsToOwned(cardIds)` en `features/collection/data.ts` que hace +1 Near Mint/en por carta en una única transacción, fusionando con la entrada existente de esa condición/idioma (misma lógica que `addToCollection`, en lote). «Quitar de esta colección» reutiliza borrado por `[collectionId+cardId]` en lote. Ambas muestran el resultado en el toast existente y cierran el modo selección.

### D3. +1 rápido en la tarjeta, solo en vistas de colección
`CardTile` gana un botón `+1` (esquina inferior derecha, tamaño táctil) visible únicamente cuando `dimIfMissing` está activo — exactamente los contextos de colección: expansión con `?from=collection` y `/collections/:id` — y nunca en modo selección. El botón hace `stopPropagation`/`preventDefault` para no navegar al detalle y llama a `addToCollection(cardId, expansionId, 1, 'Near Mint', 'en')`. El contador ×N existente da el feedback inmediato (reactivo vía liveQuery), sin toast por tarjeta.

### D4. Selección en `CustomCollectionDetailPage`
Mismo patrón ya usado en `ExpansionPage`: botón «Seleccionar» en la cabecera, «Todas/Ninguna», tarjetas en modo checkbox y `BulkAssignBar` en su variante de colección personalizada (D2).

## Risks / Trade-offs

- [`navigate(-1)` puede salirse de la app si el historial es externo] → guardado con `history.state.idx > 0` (índice interno de React Router): con idx 0 se usa el fallback, nunca `-1`.
- [+1 accidental al tocar la tarjeta en móvil] → botón compacto pero con área táctil separada del cuerpo de la tarjeta y sin acción en modo selección; el detalle permite corregir (−).
- [Condición/idioma fijos en acciones rápidas] → decisión consciente de la entrevista: Near Mint/en cubre el caso mayoritario; el formulario del detalle sigue existiendo para el resto.

## Migration Plan

Sin migración de datos. Despliegue normal por push a `main`.

## Open Questions

Ninguna — alcance cerrado en entrevista con el usuario.

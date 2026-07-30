## Why

Dos regresiones de usabilidad detectadas usando la app real (alcance cerrado con el usuario mediante entrevista, 2026-07-28):

1. **La navegación se rompe al volver atrás.** El enlace «volver» del detalle de carta está fijado a `/expansion/:id` sin contexto: si llegas a una carta desde Colección (`?from=collection`), desde una colección personalizada, desde la wishlist o desde una trade list, «volver» te suelta en la expansión en modo catálogo y de ahí a Catálogo — pierdes el sitio, el modo y los filtros desde los que venías.
2. **El modo selección anula el flujo principal.** Al seleccionar cartas para moverlas a una colección personalizada, las tarjetas dejan de ser accionables y la barra masiva solo ofrece una acción (añadir a colección personalizada); no hay manera de marcar en bloque las cartas como **en propiedad**, que es la operación más frecuente al registrar lo que tienes. Registrar copia a copia exige 3 toques por carta pasando por el detalle.

## What Changes

- «Volver» en el detalle de carta usa el historial real del navegador (vuelves exactamente a donde estabas, con su modo y filtros); si no hay historial (URL directa), cae al enlace de la expansión como hasta ahora.
- La barra de selección masiva (Catálogo y Expansión) ofrece dos acciones: **Marcar en propiedad** (+1 copia Near Mint/en de cada carta seleccionada, fusionando con entradas existentes) y **Añadir a colección personalizada** (como hasta ahora).
- El modo selección llega también a la página de una colección personalizada (`/collections/:id`) con acciones **Marcar en propiedad** y **Quitar de esta colección** (solo saca las cartas de la agrupación; no toca propiedad ni otras colecciones).
- Botón **+1 rápido** sobre cada carta en las vistas de colección (expansión con `?from=collection` y colecciones personalizadas): añade una copia Near Mint/en sin abrir el detalle.
- Descartado explícitamente en la entrevista: restauración de posición de scroll al volver.

## Capabilities

### New Capabilities

_(ninguna)_

### Modified Capabilities

- `card-catalog`: el «volver» del detalle de carta pasa a ser contextual (historial real con fallback); la barra de selección masiva gana la acción «Marcar en propiedad».
- `collection-management`: alta rápida de copias con +1 en las tarjetas de vistas de colección; marcado en propiedad en bloque desde la selección masiva.
- `custom-collections`: modo selección dentro de la página de una colección personalizada con «Marcar en propiedad» y «Quitar de esta colección»; +1 rápido en sus tarjetas.

## Impact

- `webapp/src/features/catalog/CardDetailPage.tsx` (volver contextual), `CatalogPage.tsx` y `ExpansionPage.tsx` (acciones de la barra masiva), `webapp/src/features/collections/BulkAssignBar.tsx` (segunda acción y variante para colección personalizada), `CustomCollectionDetailPage.tsx` (modo selección), `webapp/src/ui/CardTile.tsx` (+1 rápido), `webapp/src/features/collection/data.ts` (alta masiva de propiedad).
- Sin cambios de esquema de datos, pipeline de CI ni despliegue.

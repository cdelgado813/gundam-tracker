## Why

Hoy no se pueden borrar las listas de wishlist/trade recibidas de otras personas (solo las propias), no hay forma de renombrar una lista ya creada desde la interfaz (aunque la wishlist lo tiene como requisito, no está expuesto; las trade lists ni siquiera lo contemplan), y los accesos rápidos para crear una lista nueva desde la colección (barra de selección masiva y detalle de carta) le ponen un nombre genérico automático ("Lista N") sin dejar que el usuario elija uno.

## What Changes

- Permitir eliminar listas de wishlist y de trade **recibidas** (`kind: 'received'`), no solo las propias.
- Exponer en la interfaz el renombrado de listas de wishlist propias (la función ya existe pero no tiene UI).
- Añadir renombrado de listas de trade propias (nueva función + UI), igual que wishlist.
- Al crear una lista nueva desde los accesos rápidos de colección (barra de selección masiva y detalle de carta), pedir el nombre en vez de asignar uno genérico automáticamente — mismo patrón ya usado para colecciones personalizadas en esos mismos sitios.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `wishlist-lists`: eliminar listas recibidas (no solo propias); exponer renombrado en la UI; pedir nombre al crear una lista desde los accesos rápidos de colección en vez de generarlo automáticamente.
- `trade-lists`: eliminar listas recibidas (no solo propias); añadir renombrado de listas propias; pedir nombre al crear una lista desde los accesos rápidos de colección en vez de generarlo automáticamente.

## Impact

- `webapp/src/features/wishlist/WishlistListDetailPage.tsx`: quitar la restricción `kind === 'own'` del botón de borrar; añadir acción de renombrar.
- `webapp/src/features/trades/TradeListPage.tsx`: quitar la restricción `kind === 'own'` del botón de borrar; añadir acción de renombrar.
- `webapp/src/features/trades/data.ts`: nueva función `renameTradeList` (espejo de `renameWishlistList`).
- `webapp/src/features/collections/BulkAssignBar.tsx`: los paneles de wishlist y trade lists pasan del auto-nombrado (`Lista N`) al mismo flujo de "nombre + crear" que ya usa el panel de colecciones personalizadas.
- `webapp/src/features/catalog/CardDetailPage.tsx`: revisar el flujo de creación rápida de listas desde el detalle de carta para pedir nombre igual que el resto.
- Sincronización entre dispositivos (`webapp/src/features/sync/tombstones.ts`): el borrado de listas recibidas debe registrar tombstone igual que las propias, para que se propague correctamente.

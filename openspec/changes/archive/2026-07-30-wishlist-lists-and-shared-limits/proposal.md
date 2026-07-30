## Why

La wishlist es hoy una tabla plana sin límite: todo lo que marcas como deseado va a un único cajón, imposible de compartir (no hay «una» wishlist que enviar, es todo o nada y sin cabida garantizada en una URL). Las trade lists, en cambio, ya son listas con nombre, tope de unidades y compartición por URL — justo el patrón que el usuario pide extender a la wishlist. Se verificó antes de diseñar: incluso en el peor caso (100 unidades, con condición, nombre y alias largos) el enlace comprimido ocupa ~1112 caracteres, muy por debajo del límite práctico de 2000 ya usado — subir el tope de 50 a 100 unidades es seguro para ambas listas.

## What Changes

- **Wishlist rehecha como listas con nombre**, igual que las trade lists: el usuario crea una o varias, cada una con tope de **100 unidades**, y dentro añade cartas con cantidad deseada. Se elimina la wishlist plana única.
- **Migración automática**: la wishlist plana existente se convierte en una lista «Mi wishlist» al abrir la app tras la actualización; si superaba 100 unidades, se reparte en varias («Mi wishlist», «Mi wishlist 2», …) sin perder ninguna entrada.
- **Trade lists**: el tope sube de 50 a 100 unidades (`TRADE_LIST_MAX_UNITS`).
- **Wishlist compartible por URL**, con el mismo mecanismo que las trade lists (comprimido en el fragmento, QR y export a fichero como alternativa si no cupiera). Al importar una wishlist ajena, se cruza contra tu propia colección para resaltar qué de lo que esa persona desea ya tienes tú (útil para ofrecer un intercambio), en vez de cruzar contra tu propia wishlist.
- **Codec de compartición generalizado**: un mismo formato de payload (con un campo `kind` que distingue trade/wishlist) para no duplicar la lógica de compresión; enlaces `/t/:payload` ya compartidos siguen funcionando (se asume trade list si el payload no trae `kind`).
- El botón rápido de wishlist en el detalle de carta y en la barra de selección masiva pasa de «añadir/quitar de la wishlist» a un selector de lista (igual que ya existe para trade lists y colecciones personalizadas).

## Capabilities

### New Capabilities

- `wishlist-lists`: creación, edición y borrado de listas de wishlist con nombre y tope de 100 unidades; asignación de cartas con cantidad deseada; compartición por URL/QR/fichero; importación con cruce contra la colección propia.

### Modified Capabilities

- `trade-lists`: el tope de unidades sube de 50 a 100; el codec de compartición se generaliza para soportar ambos tipos de lista sin romper enlaces ya compartidos.
- `card-catalog`: el toggle rápido de wishlist en el detalle de carta pasa a ser un selector de lista, no un interruptor único; el marcador de wishlist en `CardTile` refleja cualquier lista propia.

## Impact

- `webapp/src/lib/db.ts`: nuevas tablas `wishlistLists`/reestructuración de `wishlist`; versión de esquema nueva con función de migración (`upgrade()`) que reparte la wishlist plana existente.
- `webapp/src/features/wishlist/*`: reescritura completa (data.ts, nuevas páginas de índice/detalle, eliminación del toggle único).
- `webapp/src/features/trades/share.ts`: generalizado a codec compartido (posible nueva ubicación, p. ej. `lib/shareCodec.ts`), reutilizado por ambas features.
- `webapp/src/features/collections/BulkAssignBar.tsx`, `webapp/src/features/catalog/CardDetailPage.tsx`, `webapp/src/features/catalog/hooks.ts`: adaptados al modelo de listas múltiples.
- `webapp/src/App.tsx`: nuevas rutas `/wishlist/:id` (detalle) y ruta de importación compartida; `/t/:payload` se mantiene por compatibilidad.
- Nuevas claves de traducción (en/es/ca) para las pantallas de listas de wishlist.
- Sin cambios en el pipeline de datos de CI ni en el despliegue.

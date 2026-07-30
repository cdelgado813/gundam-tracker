## 1. Datos y migración

- [x] 1.1 `lib/db.ts`: tabla `wishlistLists` (`id, name, items: {cardId, quantity}[], kind: 'own'|'received', createdAt, updatedAt`), `WISHLIST_LIST_MAX_UNITS = 100`; subir `TRADE_LIST_MAX_UNITS` a 100
- [x] 1.2 Versión de esquema Dexie nueva con `upgrade()`: lee la tabla `wishlist` vieja, reparte en bloques de 100 en `wishlistLists` con nombres "Mi wishlist", "Mi wishlist 2"…, no crea nada si estaba vacía, elimina la tabla vieja
- [x] 1.3 Verificar la migración con datos sintéticos (0, 30 y 250 entradas) contra IndexedDB antes de dar por buena

## 2. Codec de compartición generalizado

- [x] 2.1 Mover `features/trades/share.ts` a `lib/shareCodec.ts`; payload gana `kind: 't' | 'w'` con retrocompatibilidad (`kind` ausente ⇒ `'t'`)
- [x] 2.2 `features/trades/data.ts` y nuevo `features/wishlist/data.ts` envuelven el codec con su tipo concreto
- [x] 2.3 Verificar con datos reales que un payload de 100 unidades (con y sin condición) se mantiene muy por debajo de `MAX_SHARE_URL_LENGTH`

## 3. Wishlist como listas

- [x] 3.1 `features/wishlist/data.ts`: CRUD de listas (crear, renombrar, eliminar), añadir/quitar cartas respetando el tope de 100, en lote y de una en una
- [x] 3.2 `WishlistListsPage` (índice, patrón `TradesPage`) en `/wishlist`
- [x] 3.3 `WishlistListDetailPage` en `/wishlist/:id`: cartas con precio, orden (nombre/expansión/precio), coste estimado, selección masiva, compartir (enlace/QR/fichero)
- [x] 3.4 Página de importación de wishlist ajena: resuelve cartas contra el catálogo local y resalta las que están en la colección propia del importador
- [x] 3.5 `WishlistListPicker` en `CardDetailPage` (calco de `TradeListPicker`) sustituyendo el toggle único
- [x] 3.6 `BulkAssignBar`: sección «Wishlist» pasa a panel selector de lista (como «Intercambio»), con «Quitar de esta lista» cuando se monta dentro del detalle de una lista de wishlist
- [x] 3.7 `useWishlistSet()` en `features/catalog/hooks.ts` agrega sobre `wishlistLists` con `kind: 'own'` (patrón `useTradeListSet()`)

## 4. Rutas e importación unificada

- [x] 4.1 Ruta `/s/:payload` que decodifica por `kind` y dirige al flujo de importación correspondiente; `/t/:payload` se mantiene apuntando al mismo resolutor
- [x] 4.2 `shareUrlFor` de trade lists y wishlist generan enlaces `/s/:payload`

## 5. Traducciones e i18n

- [x] 5.1 Claves nuevas (en/es/ca) para las pantallas de listas de wishlist, siguiendo el patrón ya usado en trades

## 6. Verificación y despliegue

- [x] 6.1 Build limpio, smoke test del preview, commit y push a `main`

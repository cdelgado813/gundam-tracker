## Context

Estado actual (webapp/src/features/wishlist/, features/trades/, lib/db.ts):
- `db.wishlist`: tabla plana `WishlistEntry {id, cardId, expansionId, desiredQuantity, addedAt}`, sin tope, con índice único por `cardId` (`&cardId`) — una carta solo puede tener una entrada.
- `db.tradeLists`: `TradeList {id, name, authorAlias?, items: {cardId, quantity, condition?}[], kind: 'own'|'received', createdAt, updatedAt}`, tope `TRADE_LIST_MAX_UNITS = 50`, compartición vía `features/trades/share.ts` (deflate + base64url en el fragmento de la URL, `/#/t/<payload>`), con QR y export a fichero como alternativa si supera `MAX_SHARE_URL_LENGTH = 2000`.
- `useWishlistSet()` (features/catalog/hooks.ts) agrega la wishlist plana para pintar la estrella en `CardTile` en cinco vistas distintas; patrón ya existente y análogo para trade lists es `useTradeListSet()`, que agrega `items` de todas las `tradeLists` con `kind: 'own'`.
- El toggle de wishlist en `CardDetailPage` es un botón único (añadir/quitar de «la» wishlist); el de trade lists ya es un selector (`TradeListPicker`) porque siempre hubo múltiples listas.
- `BulkAssignBar` tiene una sección «Wishlist» con dos botones (añadir/quitar en bloque) y una sección «Intercambio» con un selector de lista (panel desplegable) — dos patrones distintos para el mismo tipo de necesidad.

Medido antes de diseñar: con el formato de payload actual, 100 unidades con condición (peor caso) ocupan ~1112 caracteres tras comprimir, frente al límite práctico de 2000 ya usado — hay margen de sobra.

## Goals / Non-Goals

**Goals:**
- Wishlist como listas con nombre, tope 100, compartibles — mismo patrón que trade lists.
- Migración sin pérdida de datos de la wishlist plana existente.
- No duplicar la lógica de compresión/URL entre wishlist y trade lists.
- Trade lists a tope 100 sin romper enlaces ya compartidos.

**Non-Goals:**
- Fusionar wishlist y trade lists en una única tabla/entidad: son conceptualmente distintas (deseo vs. oferta con condición) y unificar el esquema complicaría la migración sin aportar valor real. Se comparte el *codec* de compartición, no el modelo de datos.
- Elegir condición al desear una carta: la wishlist sigue sin condición, solo cantidad deseada (igual que hoy).
- Límite configurable por el usuario: 100 es fijo, igual que 50 lo era.

## Decisions

### D1. Tablas nuevas `wishlistLists` / `wishlistListCards`, no reutilizar `tradeLists`
Mismo shape estructural que `tradeLists` pero sin `condition` en los items (la wishlist no la necesita) y sin `authorAlias` obligatorio en la app (solo al compartir): `WishlistList {id, name, items: {cardId, quantity}[], kind: 'own'|'received', createdAt, updatedAt}`. Tabla separada de `tradeLists` porque son dominios distintos (evita que una migración futura de una tabla arrastre a la otra, y mantiene los índices de Dexie limpios). `WISHLIST_LIST_MAX_UNITS = 100`.

### D2. Migración: `db.version(N).upgrade()` reparte la wishlist plana en listas de ≤100
Dexie permite registrar una función `upgrade(tx)` al declarar la nueva versión del esquema. Se lee toda `wishlist` (tabla vieja), se agrupa en bloques de 100 unidades y se crean como `wishlistLists` con nombre `Mi wishlist`, `Mi wishlist 2`, … Tras la migración se elimina la tabla vieja. Esto corre una única vez, en el propio navegador del usuario, la primera vez que abre la versión nueva — no requiere backend ni intervención manual. Si la wishlist plana estaba vacía, no se crea ninguna lista (evita una «Mi wishlist» vacía fantasma).

### D3. Codec de compartición generalizado con campo `kind`
`features/trades/share.ts` se mueve a `lib/shareCodec.ts` y su payload gana `kind: 't' | 'w'`:
```ts
interface SharePayloadV1 {
  v: 1
  kind: 't' | 'w'
  name: string
  alias?: string
  items: { b: number; q: number; c?: number }[] // c ausente en wishlist
}
```
`encodeList`/`decodeList` quedan genéricos; `features/trades/data.ts` y el nuevo `features/wishlist/data.ts` los envuelven con su tipo concreto. Retrocompatibilidad: los payloads ya compartidos (sin `kind`) se decodifican como `kind: 't'` por defecto — ningún enlace de trade list ya compartido se rompe.

### D4. Import unificado por `kind`, ruta legacy conservada
Nueva ruta `/s/:payload` (compartir genérico) decodifica el payload y, según `kind`, renderiza el flujo de importación de trade list o de wishlist. La ruta `/t/:payload` se mantiene apuntando al mismo resolutor (por los enlaces ya compartidos antes de este change); los enlaces nuevos que genere la app usan `/s/:payload` para ambos tipos.

### D5. Importar una wishlist cruza contra tu colección, no contra la tuya propia
Al abrir la wishlist de otra persona, la app resuelve qué de esas cartas están en tu `collection` (lo que podrías ofrecerle), en vez de cruzar contra tu propia wishlist (que no tendría sentido: dos personas deseando lo mismo no ayuda a intercambiar). Mismo patrón visual que ya usa la importación de trade lists para resaltar coincidencias.

### D6. Selector de lista sustituye al toggle único, en los mismos dos puntos que ya usan trade lists
`CardDetailPage`: el botón «★ Wishlist» se sustituye por un `WishlistListPicker` (calco de `TradeListPicker`: desplegable con las listas propias + «nueva lista»). `BulkAssignBar`: la sección «Wishlist» pasa de dos botones sueltos a un panel selector (como ya tiene «Intercambio»), con una acción adicional «Quitar de esta lista» cuando la barra se monta dentro de la vista de detalle de una lista de wishlist (mismo patrón que `removeFromCollectionId` en colecciones personalizadas). `CardTile` seguirá pintando la estrella si la carta está en *cualquier* lista de wishlist propia, vía un nuevo `useWishlistSet()` que agrega sobre `wishlistLists` (mismo patrón que `useTradeListSet()`).

## Risks / Trade-offs

- [Migración corre en el dispositivo de cada usuario, no de forma centralizada] → aceptable: Dexie ejecuta `upgrade()` de forma transaccional y atómica la primera vez que se abre la app con el esquema nuevo; si falla, la transacción no se aplica y la app cae al esquema anterior en el próximo intento (comportamiento estándar de Dexie).
- [Wishlist plana con más de unas pocas listas de 100 tras repartir] → poco probable dado el uso real de la app hasta ahora, pero el reparto automático lo cubre igualmente sin límite de listas generadas.
- [El toggle único de wishlist era una interacción de un solo toque; el selector añade un paso] → mismo coste que ya se acepta para trade lists y colecciones personalizadas; se mitiga con «nueva lista» inline igual que las otras.
- [Enlaces `/t/:payload` ya compartidos por usuarios de las primeras versiones] → cubiertos explícitamente por D3/D4 (kind por defecto + ruta conservada).

## Migration Plan

1. Desplegar el cambio de esquema con `upgrade()`; cada cliente migra su wishlist plana la primera vez que carga la app nueva.
2. Sin cambios de pipeline ni de despliegue del sitio estático.
3. Rollback: revert del commit; Dexie no soporta downgrade automático de esquema, pero al ser aditivo (nuevas tablas) y no destructivo hasta que el `upgrade()` confirma, el riesgo es bajo.

## Open Questions

Ninguna.

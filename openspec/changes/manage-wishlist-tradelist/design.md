## Context

Wishlist y trade lists comparten forma (`kind: 'own' | 'received'`, límite de 100 unidades, listas en `db.wishlistLists`/`db.tradeLists`). Ya existen `renameWishlistList` (sin UI) y `deleteWishlistList`/borrado inline en las páginas de detalle, restringido a `kind === 'own'`. Trade lists no tiene equivalente de renombrado. La sincronización entre dispositivos (`features/sync/tombstones.ts`) requiere que cada borrado registre un tombstone explícito — ver el borrado de listas ya implementado como referencia del patrón.

Los tres puntos de creación rápida de listas desde colección (`BulkAssignBar.tsx` paneles de wishlist/trade, `CardDetailPage.tsx` pickers de wishlist/trade) auto-generan el nombre `Lista N`. El panel de colecciones personalizadas en `BulkAssignBar.tsx` ya resuelve esto con un input + botón "crear", que sirve de plantilla a replicar.

## Goals / Non-Goals

**Goals:**
- Borrar listas recibidas igual que las propias (mismo botón, sin distinguir `kind`), registrando tombstone para que el borrado se propague entre dispositivos.
- Renombrar listas propias de wishlist y trade desde la UI de detalle.
- Pedir nombre al crear una lista desde los tres accesos rápidos de colección, reutilizando el patrón de input ya usado para colecciones personalizadas.

**Non-Goals:**
- No se cambia el límite de 100 unidades ni el modelo de datos (`WishlistList`/`TradeList` ya tienen `name`).
- No se permite renombrar listas recibidas (son una copia de lo que compartió otra persona; renombrar la propia copia local no tiene un requisito claro y se deja fuera).
- No se toca el formato de compartición/import (codec, QR, URL).

## Decisions

- **Borrado de listas recibidas usa la misma función que las propias**: se quita la condición `kind === 'own'` de los botones de borrar en `WishlistListDetailPage.tsx` y `TradeListPage.tsx`. El tombstone ya se registra ahí mismo tras el `db.*.delete()` (patrón existente); no hace falta lógica nueva de sincronización, solo dejar de bloquear la acción para `received`.
- **Renombrado solo para listas propias**: se añade un botón "renombrar" (icono lápiz + prompt/input inline) visible únicamente cuando `list.kind === 'own'`, igual que el resto de acciones de gestión (compartir, exportar, borrar ya existen condicionados así salvo borrado que ahora se abre a `received`).
- **`renameTradeList` espejo de `renameWishlistList`**: misma firma `(listId: number, name: string) => Promise<void>`, mismo `updatedAt: Date.now()`. Se añade a `trades/data.ts`.
- **Creación con nombre en accesos rápidos de colección**: los paneles de wishlist/trade en `BulkAssignBar.tsx` y los pickers de `CardDetailPage.tsx` cambian de "crear con nombre automático y asignar" a un input de texto + botón crear (mismo flujo ya usado en el panel de colecciones personalizadas de `BulkAssignBar.tsx`), reutilizando su estado local `creating`/`name` como plantilla directa.
- **Sin migración de esquema**: no cambia ningún campo ni índice de Dexie; es únicamente UI + una función nueva (`renameTradeList`) con la misma forma que la ya existente.

## Risks / Trade-offs

- [Borrar una lista recibida que aún no se ha revisado del todo] → Se mantiene el `window.confirm` ya existente antes de borrar, igual que para listas propias; no se añade fricción extra pero tampoco se quita la confirmación.
- [Inconsistencia entre dispositivos si uno tiene código viejo (sin este cambio) y borra una lista recibida usando otro camino] → No aplica: el borrado de recibidas antes simplemente no estaba expuesto en la UI, no había otro camino; el único riesgo es el ya conocido de service worker con código en caché (no es específico de este cambio).

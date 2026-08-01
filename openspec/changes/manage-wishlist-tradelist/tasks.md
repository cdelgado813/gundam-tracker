## 1. Eliminar listas recibidas

- [x] 1.1 `WishlistListDetailPage.tsx`: quitar la condición `kind === 'own'` del bloque de acciones que incluye el botón de borrar, o separar el borrado en su propio bloque visible siempre
- [x] 1.2 `TradeListPage.tsx`: mismo cambio que 1.1
- [x] 1.3 Comprobar manualmente que borrar una lista recibida genera tombstone (reusa `tombstone('wishlistLists'|'tradeLists', list.uuid)` ya presente en esas rutas de borrado)

## 2. Renombrar listas propias

- [x] 2.1 Añadir `renameTradeList(listId: number, name: string): Promise<void>` en `webapp/src/features/trades/data.ts`, espejo de `renameWishlistList`
- [x] 2.2 `WishlistListDetailPage.tsx`: añadir botón/acción de renombrar (visible solo si `kind === 'own'`) que llame a `renameWishlistList`
- [x] 2.3 `TradeListPage.tsx`: añadir el mismo botón/acción de renombrar (visible solo si `kind === 'own'`) que llame a `renameTradeList`
- [x] 2.4 Añadir claves de traducción necesarias (prompt/label de renombrar) en `webapp/src/lib/i18n` o donde estén centralizadas las cadenas de `useT`

## 3. Pedir nombre al crear lista desde accesos rápidos de colección

- [x] 3.1 `BulkAssignBar.tsx`: cambiar el panel de wishlist (`panel === 'wishlists'`) del botón de auto-nombrado a un input de texto + botón "crear", igual que el panel de colecciones personalizadas ya usa (estado `creating`/`name` local al panel)
- [x] 3.2 `BulkAssignBar.tsx`: mismo cambio para el panel de trade lists (`panel === 'trades'`)
- [x] 3.3 `CardDetailPage.tsx`: en `TradeListPicker`, sustituir el nombre automático `Lista N` por un input de texto que el usuario rellena antes de crear
- [x] 3.4 `CardDetailPage.tsx`: mismo cambio en `WishlistListPicker`

## 4. Verificación

- [x] 4.1 Probar manualmente en el navegador: crear, renombrar y borrar una lista propia de wishlist y una de trade
- [x] 4.2 Probar manualmente: importar una lista compartida (recibida) y borrarla (verificado sembrando una fila `kind: 'received'` directamente, equivalente al estado post-importación; el flujo de importación en sí no lo toca este cambio)
- [x] 4.3 Probar manualmente los tres accesos rápidos de creación (barra de selección masiva de wishlist, de trade, y los pickers del detalle de carta) pidiendo nombre
- [x] 4.4 `npm run build` limpio (único chequeo de TypeScript fiable en este proyecto, ver notas de sesiones previas)

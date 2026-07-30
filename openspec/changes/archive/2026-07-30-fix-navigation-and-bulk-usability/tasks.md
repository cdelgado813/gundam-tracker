## 1. Navegación

- [x] 1.1 `CardDetailPage`: sustituir el `Link` fijo de «volver» por botón con `navigate(-1)` cuando `history.state.idx > 0` y fallback a `/expansion/:id`; texto genérico «Volver»
- [x] 1.2 Verificar los seis orígenes: búsqueda, expansión-catálogo, expansión-colección (`?from=collection`), colección personalizada, wishlist y trade list — «volver» devuelve a cada uno con su modo/filtros; URL directa cae a la expansión

## 2. Datos

- [x] 2.1 `features/collection/data.ts`: `addCardsToOwned(cardIds)` — +1 Near Mint/en por carta en una única transacción, fusionando con entradas existentes (reutilizando la lógica de `addToCollection`)
- [x] 2.2 `features/collections/data.ts`: `removeCardsFromCollection(collectionId, cardIds)` — borrado en lote por `[collectionId+cardId]`

## 3. Barra de selección masiva

- [x] 3.1 `BulkAssignBar`: acción «Marcar en propiedad» junto a «Añadir a colección», con toast de resultado y cierre del modo selección
- [x] 3.2 Variante para colección personalizada: «Marcar en propiedad» + «Quitar de esta colección» (configurable por props desde donde se monta)

## 4. Selección en colección personalizada

- [x] 4.1 `CustomCollectionDetailPage`: botón «Seleccionar», «Todas/Ninguna», tarjetas en modo checkbox y `BulkAssignBar` en su variante de colección (patrón de `ExpansionPage`)

## 5. +1 rápido en tarjeta

- [x] 5.1 `CardTile`: botón «+1» visible solo con `dimIfMissing` y fuera del modo selección, con `preventDefault`/`stopPropagation`, llamando a `addToCollection(cardId, expansionId, 1, 'Near Mint', 'en')`
- [x] 5.2 Verificar que el +1 no aparece en Catálogo ni en modo selección, y que el contador ×N reacciona al momento

## 6. Verificación y despliegue

- [x] 6.1 Build limpio, smoke test del preview y push a `main` (deploy automático)

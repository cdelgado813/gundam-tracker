## 1. Datos

- [x] 1.1 `features/collection/data.ts`: `removeCardsFromOwned(cardIds)` — −1 por carta priorizando Near Mint/en, degradando a la entrada con más copias, eliminando entradas a 0, omitiendo cartas sin copias; una transacción; devuelve nº decrementadas

## 2. Barra de selección rediseñada

- [x] 2.1 `BulkAssignBar`: cabecera «N cartas seleccionadas» + cierre; cuadrícula de acciones icono+etiqueta agrupadas por eje (propiedad | colecciones); desplegable de colecciones como panel superior
- [x] 2.2 Acción «−1 de propiedad» con confirmación y recuento en todos los contextos; «Quitar de esta colección» mantiene su confirmación

## 3. Búsqueda y filtro reutilizables

- [x] 3.1 Componente `CardListControls` (input + chips de rareza presentes en la lista) que produce un predicado; filtrado en memoria con `useMemo`
- [x] 3.2 Montarlo en `ExpansionPage` (ambos modos), `CustomCollectionDetailPage` y `WishlistPage`, combinado con los filtros propios de cada vista

## 4. Todas las cartas

- [x] 4.1 `AllCardsPage` en `/collection/all`: join colección→cards, orden por número de coleccionista, contador de copias, `CardListControls` y modo selección con la barra rediseñada
- [x] 4.2 Entrada «Todas las cartas · N únicas · M copias» al inicio de `CollectionPage`

## 5. Catálogo orientado a buscar

- [x] 5.1 Home: bloque hero (título + subtítulo + buscador destacado), chips de rareza debajo
- [x] 5.2 Tarjetas de expansión: «N cartas» en lugar de `owned/total`; retirar el hook de únicas poseídas de esta vista
- [x] 5.3 `ExpansionPage` en modo catálogo: ocultar barra de progreso y contador X/Y (mantener en modo colección)

## 6. CardTrader

- [x] 6.1 Botón «Ver en CardTrader» en `CardDetailPage` → `https://www.cardtrader.com/cards/<blueprintId>`, pestaña nueva

## 7. Verificación y despliegue

- [x] 7.1 Build limpio, smoke test del preview, commit y push a `main`

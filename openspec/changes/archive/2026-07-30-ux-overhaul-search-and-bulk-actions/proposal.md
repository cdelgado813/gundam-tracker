## Why

Tras usar la app con datos reales han aflorado carencias de coherencia que la hacen torpe: las acciones masivas son asimétricas (puedes añadir en bloque pero no quitar), la barra de selección amontona la información sin jerarquía, buscar/filtrar solo existe en la home del Catálogo aunque hay cinco vistas más con grids de cartas, la home es demasiado sobria para ser una herramienta "pensada para buscar", el listado de expansiones del Catálogo muestra progreso de completado (0/23) que contradice su propósito (explorar el maestro, no medir faltantes), no hay puente hacia CardTrader para comprobar precio real o comprar, y la Colección no tiene una vista unificada de todas las cartas poseídas.

## What Changes

- **Acciones masivas simétricas.** La barra de selección ofrece añadir y quitar en ambos ejes: «+1 en propiedad» / «−1 de propiedad» (resta una copia por carta seleccionada, priorizando la entrada Near Mint/en; sin copias, se omite) en todos los contextos, y «Añadir a colección» / «Quitar de esta colección» (esta última solo dentro de una colección personalizada, con confirmación). Las acciones de resta en bloque piden confirmación con recuento.
- **Barra de selección rediseñada.** Deja de ser una fila amontonada: cabecera con recuento («N cartas seleccionadas») y cierre, y debajo una cuadrícula de acciones con icono + etiqueta completa, agrupadas por eje (propiedad | colecciones). Información legible de un vistazo en móvil.
- **Búsqueda y filtro de rareza en todas las vistas con cartas**: vista de expansión, colección personalizada, la nueva vista «Todas mis cartas» y wishlist, mediante un componente reutilizable (input de texto + chips de rareza) que filtra la lista ya cargada de la vista.
- **Colección: agrupación «Todas las cartas»** al inicio, con todas las cartas poseídas en un único grid (con búsqueda/filtro y modo selección como las demás vistas de colección).
- **Catálogo orientado a buscar**: la búsqueda pasa a ser protagonista de la home (bloque hero con título y buscador destacado); el listado de expansiones deja de mostrar progreso «0/23» y muestra el total de cartas («23 cartas»); en la vista de expansión abierta desde Catálogo se oculta también la barra de progreso (se mantiene intacta en modo Colección).
- **Enlace a CardTrader en el detalle de carta**: botón «Ver en CardTrader» hacia `https://www.cardtrader.com/cards/<blueprintId>` (formato verificado con HTTP 200) para comprobar precios reales o comprar.

## Capabilities

### New Capabilities

_(ninguna)_

### Modified Capabilities

- `card-catalog`: home orientada a búsqueda (hero), listado de expansiones sin progreso, vista de expansión sin barra de progreso en modo catálogo, búsqueda/filtro dentro de la vista de expansión, enlace a CardTrader en el detalle de carta, acciones masivas simétricas de propiedad.
- `collection-management`: agrupación «Todas las cartas» en Colección, búsqueda/filtro en las vistas de colección, «−1 de propiedad» en bloque.
- `custom-collections`: búsqueda/filtro dentro de una colección personalizada; barra de selección rediseñada con los dos ejes de acciones.

## Impact

- `webapp/src/features/collections/BulkAssignBar.tsx` (rediseño + acciones nuevas), `features/collection/data.ts` (resta en lote), nuevo componente compartido de búsqueda/filtro en vista (`ui/` o `features/catalog/`), `CatalogPage.tsx` (hero + chips de expansión), `ExpansionPage.tsx`, `CustomCollectionDetailPage.tsx`, `WishlistPage.tsx`, nueva `AllCardsPage` + ruta, `CollectionPage.tsx` (entrada «Todas las cartas»), `CardDetailPage.tsx` (enlace CardTrader + CSP no afecta: es un enlace saliente, no una petición).
- Sin cambios de esquema de datos, pipeline ni despliegue.

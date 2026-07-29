## ADDED Requirements

### Requirement: Agrupación «Todas las cartas» en Colección
La pestaña Colección SHALL ofrecer, antes de las agrupaciones por expansión, una entrada «Todas las cartas» con el total de únicas y copias, que abre una vista con todas las cartas poseídas en un único grid, con búsqueda, filtro de rareza y modo selección como el resto de vistas de colección.

#### Scenario: Ver todas las cartas poseídas
- **WHEN** el usuario abre «Todas las cartas» desde Colección
- **THEN** ve todas sus cartas con contador de copias, ordenadas por número de coleccionista, y puede buscar/filtrar dentro de la lista

#### Scenario: Entrada con totales
- **WHEN** el usuario tiene 120 cartas únicas y 200 copias
- **THEN** la entrada muestra «120 únicas · 200 copias»

### Requirement: Búsqueda y filtro en vistas de colección
Las vistas de colección con grid de cartas (expansión en modo colección, «Todas las cartas» y wishlist) SHALL ofrecer buscador de texto y chips de rareza que filtran la lista en memoria, combinables con los filtros propios de cada vista (p. ej. «solo faltantes»).

#### Scenario: Buscar dentro de la wishlist
- **WHEN** el usuario escribe un nombre en el buscador de la wishlist
- **THEN** la lista se reduce a las cartas deseadas que coinciden

### Requirement: Resta de propiedad en lote como espejo del alta
La operación de resta en lote SHALL ejecutarse en una única transacción y ser el inverso de «+1 en propiedad»: prioriza la entrada Near Mint/en, degrada a la entrada con más copias, elimina entradas a 0 y reporta cuántas cartas se decrementaron.

#### Scenario: Resta que agota una entrada
- **WHEN** una carta seleccionada tiene exactamente 1 copia Near Mint/en y se confirma la resta
- **THEN** la entrada desaparece y la carta vuelve a contar como faltante en las vistas de colección

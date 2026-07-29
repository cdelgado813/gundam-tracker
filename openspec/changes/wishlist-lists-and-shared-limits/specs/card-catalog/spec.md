## ADDED Requirements

### Requirement: Marcador de wishlist en la tarjeta refleja cualquier lista propia
El marcador de "en wishlist" de `CardTile` SHALL activarse si la carta pertenece a cualquiera de las listas de wishlist propias del usuario (ver capacidad `wishlist-lists`), no a una wishlist única.

#### Scenario: Carta deseada en una lista secundaria
- **WHEN** una carta solo está en una lista de wishlist distinta de la primera creada
- **THEN** su marcador de wishlist se muestra activo igualmente en catálogo, expansión, colección personalizada y "todas las cartas"

### Requirement: Selector de lista de wishlist en el detalle de carta
El detalle de carta SHALL ofrecer un selector de lista de wishlist (existente o nueva) en lugar de un interruptor único de "en wishlist / no en wishlist".

#### Scenario: Elegir lista al desear una carta
- **WHEN** el usuario abre el detalle de una carta y no tiene claro en qué lista de wishlist quiere guardarla
- **THEN** puede elegir entre sus listas existentes o crear una nueva sin salir del detalle

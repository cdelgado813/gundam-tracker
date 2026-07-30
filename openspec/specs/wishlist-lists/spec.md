# wishlist-lists Specification

## Purpose
Listas de deseos con nombre y tope de unidades, compartibles por enlace/QR/fichero, con importación que resalta qué de lo que otra persona desea ya tienes en tu colección.
## Requirements
### Requirement: Crear, editar y eliminar listas de wishlist con tope de 100 unidades
La aplicación SHALL permitir crear listas de wishlist con nombre, añadir cartas con cantidad deseada hasta un máximo de 100 unidades por lista (suma de cantidades), y renombrar o eliminar listas existentes.

#### Scenario: Crear una lista
- **WHEN** el usuario crea una lista de wishlist con nombre "Cumpleaños"
- **THEN** la lista queda disponible para añadir cartas, vacía, con tope 100

#### Scenario: Límite alcanzado
- **WHEN** el usuario intenta añadir una carta que haría superar las 100 unidades totales de una lista
- **THEN** la app lo bloquea mostrando cuántas unidades quedan disponibles

### Requirement: Migración sin pérdida de la wishlist plana existente
Al actualizar a esta versión, la aplicación SHALL convertir automáticamente los deseos ya guardados en la wishlist plana anterior en una o varias listas de wishlist («Mi wishlist», «Mi wishlist 2», …), repartidas en bloques de máximo 100 unidades, sin perder ninguna entrada. Si no había deseos guardados, no SHALL crear ninguna lista vacía.

#### Scenario: Wishlist previa por debajo del límite
- **WHEN** un usuario con 30 cartas en su wishlist plana abre la versión nueva
- **THEN** encuentra una única lista "Mi wishlist" con esas 30 cartas

#### Scenario: Wishlist previa por encima del límite
- **WHEN** un usuario con 250 cartas en su wishlist plana abre la versión nueva
- **THEN** encuentra tres listas ("Mi wishlist", "Mi wishlist 2", "Mi wishlist 3") con el total de cartas repartido, ninguna con más de 100 unidades

### Requirement: Compartir y recibir listas de wishlist por URL
La aplicación SHALL permitir compartir una lista de wishlist propia mediante un enlace autocontenido (con QR y export a fichero como alternativa si excede el tamaño práctico de una URL), y permitir importar una lista de wishlist recibida.

#### Scenario: Generar enlace de una wishlist
- **WHEN** el usuario comparte una lista de wishlist con 60 cartas
- **THEN** obtiene una URL autocontenida y su QR, sin que se realice ninguna llamada a servidores propios

### Requirement: Importar una wishlist ajena cruza contra la colección propia
Al importar una lista de wishlist recibida, la aplicación SHALL resolver las cartas contra el catálogo local y resaltar cuáles de ellas están en la colección propia del importador (posibles cartas a ofrecer), no contra su propia wishlist.

#### Scenario: Coincidencias con la colección propia
- **WHEN** el usuario abre una wishlist compartida por otra persona y posee 4 de las cartas que esa persona desea
- **THEN** esas 4 cartas aparecen resaltadas como "las tienes"

### Requirement: Selector de lista al marcar una carta como deseada
El detalle de una carta y la barra de selección masiva SHALL ofrecer un selector de lista de wishlist (existente o nueva) en lugar de un interruptor único de "en wishlist / no en wishlist".

#### Scenario: Añadir una carta a una lista de wishlist desde su detalle
- **WHEN** el usuario abre el detalle de una carta y elige una lista de wishlist del selector
- **THEN** la carta se añade a esa lista concreta con cantidad deseada 1 (o se incrementa si ya estaba)

### Requirement: Indicador de wishlist en el catálogo considera todas las listas propias
El marcador de "en wishlist" sobre una carta SHALL activarse si esa carta está presente en cualquiera de las listas de wishlist propias del usuario.

#### Scenario: Carta en una de varias listas
- **WHEN** una carta está en la lista "Cumpleaños" pero no en "Mi wishlist"
- **THEN** su marcador de wishlist en el catálogo aparece activo igualmente

### Requirement: Filtro de propiedad de tres estados en el detalle de una wishlist
El detalle de una lista de wishlist propia SHALL ofrecer un filtro de tres estados — Todas, En propiedad, Faltantes — para distinguir qué cartas deseadas ya se han conseguido.

#### Scenario: Ver qué deseos ya tienes
- **WHEN** el usuario abre una lista de wishlist y selecciona "En propiedad"
- **THEN** solo se muestran las cartas de esa lista que ya posee en su colección

#### Scenario: Ver qué falta por conseguir
- **WHEN** el usuario selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa lista que todavía no posee


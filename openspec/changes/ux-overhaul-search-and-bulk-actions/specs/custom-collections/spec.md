## ADDED Requirements

### Requirement: Barra de selección con jerarquía clara y acciones en todos los ejes
La barra del modo selección SHALL mostrar una cabecera con el recuento («N cartas seleccionadas») y el cierre, y debajo las acciones agrupadas en secciones etiquetadas por eje, con icono y etiqueta: **Propiedad** («+1 copia», «−1 copia»), **Wishlist** («Añadir», «Quitar»), **Colecciones** («Añadir a colección» y, solo dentro de una colección personalizada, «Quitar de esta») e **Intercambio** («Añadir a lista de trade»). Las acciones destructivas SHALL pedir confirmación con recuento. La barra MUST NOT cerrarse tras ejecutar una acción.

#### Scenario: Dentro de una colección personalizada
- **WHEN** el usuario activa el modo selección en `/collections/:id`
- **THEN** la barra muestra las cuatro secciones con sus acciones y el recuento en cabecera

### Requirement: Añadir y quitar de la wishlist en bloque
La barra de selección SHALL permitir añadir las cartas seleccionadas a la wishlist (omitiendo las que ya estuvieran) y quitarlas de ella (previa confirmación), informando de cuántas se vieron afectadas.

#### Scenario: Añadir con solapamiento
- **WHEN** el usuario añade a wishlist 10 cartas de las que 3 ya estaban
- **THEN** se añaden 7 y el mensaje indica cuántas se añadieron realmente

### Requirement: Añadir a una lista de intercambio en bloque respetando el límite
La barra de selección SHALL permitir añadir las cartas seleccionadas a una lista de intercambio propia (existente o nueva) mediante un selector que muestre la ocupación N/50 de cada lista, respetando el límite duro de 50 unidades e informando de cuántas cartas no cupieron. Las listas llenas SHALL aparecer deshabilitadas y las listas recibidas MUST NOT admitir cartas.

#### Scenario: La selección no cabe entera
- **WHEN** el usuario añade 45 cartas a una lista que ya tiene 10 unidades
- **THEN** entran 40 hasta completar el límite y el mensaje indica que 5 no caben

#### Scenario: Lista llena
- **WHEN** una lista ya tiene 50 unidades
- **THEN** aparece deshabilitada en el selector y no admite más cartas

#### Scenario: Encadenar acciones
- **WHEN** el usuario marca «+1 en propiedad» y después «Quitar de esta colección» sobre la misma selección
- **THEN** ambas se ejecutan sobre las mismas cartas sin re-seleccionar, cada una con su toast

### Requirement: Búsqueda y filtro dentro de una colección personalizada
La página de una colección personalizada SHALL ofrecer buscador de texto y chips de rareza que filtran sus cartas en memoria, combinables con «solo faltantes».

#### Scenario: Encontrar una carta en una colección grande
- **WHEN** el usuario escribe parte del nombre en el buscador de su colección personalizada
- **THEN** el grid se reduce a las coincidencias manteniendo el estado de atenuación de faltantes

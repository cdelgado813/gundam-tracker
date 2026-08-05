## MODIFIED Requirements

### Requirement: Barra de selección con jerarquía clara y acciones en todos los ejes
La barra del modo selección SHALL mostrar una cabecera con el recuento («N cartas seleccionadas») y el cierre, y debajo las acciones agrupadas en secciones etiquetadas por eje, con icono y etiqueta: **Propiedad** («+1 copia», «−1 copia»), **Wishlist** («Añadir», «Quitar»), **Colecciones** («Añadir a colección» y, solo dentro de una colección personalizada, «Quitar de esta») e **Intercambio** («Añadir a lista de trade»). Las acciones destructivas SHALL pedir confirmación con recuento. La barra MUST NOT cerrarse tras ejecutar una acción. Al crear una colección personalizada nueva desde este panel, la app SHALL ofrecer a continuación, de forma explícita, marcar también esas mismas cartas en propiedad, dejando claro que son dos acciones independientes.

#### Scenario: Dentro de una colección personalizada
- **WHEN** el usuario activa el modo selección en `/collections/:id`
- **THEN** la barra muestra las cuatro secciones con sus acciones y el recuento en cabecera

#### Scenario: Crear colección nueva desde la selección y aceptar marcar en propiedad
- **WHEN** el usuario, con 5 cartas seleccionadas, crea una colección personalizada nueva desde el panel de colecciones y elige "marcar también en propiedad"
- **THEN** las 5 cartas quedan asignadas a la colección nueva y además suman +1 copia Near Mint/en cada una en la colección del usuario

#### Scenario: Crear colección nueva y omitir el marcado en propiedad
- **WHEN** el usuario crea una colección personalizada nueva desde el panel de colecciones y elige "no, solo asignar"
- **THEN** las cartas quedan asignadas a la colección nueva sin alterar su colección en propiedad, igual que el comportamiento anterior a este cambio

#### Scenario: Asignar a una colección ya existente no ofrece el paso
- **WHEN** el usuario asigna la selección a una colección personalizada que ya tenía creada (no la crea en ese momento)
- **THEN** la asignación ocurre igual que antes, sin ningún paso adicional de confirmación sobre propiedad

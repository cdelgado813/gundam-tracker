## ADDED Requirements

### Requirement: Modo selección dentro de una colección personalizada
La página de una colección personalizada (`/collections/:id`) SHALL ofrecer el mismo modo selección que las vistas de catálogo (botón «Seleccionar», atajo «Todas/Ninguna», tarjetas como checkbox) con dos acciones masivas: «Marcar en propiedad» (+1 Near Mint/en por carta seleccionada) y «Quitar de esta colección».

#### Scenario: Marcar en propiedad lo conseguido
- **WHEN** el usuario selecciona 5 cartas de su colección personalizada y pulsa «Marcar en propiedad»
- **THEN** cada una suma +1 copia Near Mint/en, el progreso X/Y de la colección se actualiza y el modo selección se cierra

#### Scenario: Quitar cartas de la colección
- **WHEN** el usuario selecciona 3 cartas y pulsa «Quitar de esta colección»
- **THEN** esas cartas dejan de pertenecer a la colección personalizada (su total baja en 3), sin alterar las copias en propiedad, la wishlist ni otras colecciones

#### Scenario: Quitar no borra propiedad
- **WHEN** una carta quitada de la colección personalizada tenía 2 copias en propiedad
- **THEN** sigue teniendo 2 copias en propiedad y sigue apareciendo en la vista de su expansión

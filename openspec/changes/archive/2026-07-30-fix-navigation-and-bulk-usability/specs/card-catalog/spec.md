## ADDED Requirements

### Requirement: Volver contextual desde el detalle de carta
El botón «volver» del detalle de carta SHALL devolver al usuario a la vista exacta desde la que llegó (Colección, colección personalizada, wishlist, trade list, búsqueda o expansión de catálogo), conservando su modo y filtros, usando el historial de navegación. Cuando no exista historial dentro de la app (URL directa o recarga), SHALL navegar a la expansión de la carta como destino de respaldo.

#### Scenario: Volver a Colección
- **WHEN** el usuario llega a una carta desde una expansión abierta en modo Colección y pulsa «volver»
- **THEN** regresa a esa expansión en modo Colección (cartas faltantes atenuadas), no en modo catálogo

#### Scenario: Volver a una colección personalizada
- **WHEN** el usuario llega a una carta desde `/collections/:id` y pulsa «volver»
- **THEN** regresa a esa colección personalizada, no a la expansión de la carta

#### Scenario: URL directa sin historial
- **WHEN** el usuario abre `/card/:id` directamente (enlace compartido o recarga) y pulsa «volver»
- **THEN** navega a la expansión de la carta en modo catálogo

### Requirement: Acción masiva de marcar en propiedad en el catálogo
La barra de selección masiva de Catálogo y Expansión SHALL ofrecer, además de «añadir a colección personalizada», la acción «marcar en propiedad»: añadir una copia (Near Mint, en) de cada carta seleccionada a la colección del usuario, fusionando con la entrada existente de esa condición e idioma si ya la hay.

#### Scenario: Marcar en propiedad varias cartas
- **WHEN** el usuario selecciona 12 cartas y pulsa «Marcar en propiedad»
- **THEN** cada una suma +1 copia Near Mint/en en su colección, se muestra confirmación y el modo selección se cierra

#### Scenario: Carta ya poseída
- **WHEN** una de las cartas seleccionadas ya tenía 2 copias Near Mint/en
- **THEN** pasa a tener 3, sin crear una entrada duplicada

## ADDED Requirements

### Requirement: Filtro de catálogo por colección personalizada
La vista de catálogo (búsqueda y grids de expansión) SHALL ofrecer chips seleccionables para filtrar por colecciones personalizadas (ver capacidad `custom-collections`), combinables con el texto del buscador.

#### Scenario: Buscar dentro de una colección personalizada
- **WHEN** el usuario selecciona una colección personalizada y escribe texto en el buscador
- **THEN** los resultados cumplen ambos criterios (pertenecer a la colección Y coincidir con el texto)

### Requirement: El catálogo nunca atenúa cartas por falta de posesión
Las cartas mostradas en la vista de catálogo (accedida desde la pestaña Catálogo, no desde Colección) SHALL mostrarse siempre con su aspecto normal, independientemente de si el usuario las posee o no. La atenuación visual de "carta faltante" es exclusiva de la vista de colección (ver capacidad `collection-management`).

#### Scenario: Explorar una expansión desde el catálogo
- **WHEN** el usuario abre una expansión desde la pestaña Catálogo
- **THEN** todas las cartas se muestran con color y opacidad normales, tenga o no copias en su colección

#### Scenario: Volver al catálogo tras ver el detalle de una carta
- **WHEN** el usuario llega al detalle de una carta desde el catálogo y vuelve atrás
- **THEN** la vista de expansión sigue sin atenuar ninguna carta

## ADDED Requirements

### Requirement: Filtro de colección propia por colección personalizada
La vista de expansión dentro de Colección SHALL ofrecer chips seleccionables para filtrar por colecciones personalizadas (ver capacidad `custom-collections`), combinables con el filtro existente "solo faltantes".

#### Scenario: Ver faltantes de una colección personalizada
- **WHEN** el usuario activa "solo faltantes" y selecciona la colección personalizada "Unit"
- **THEN** solo se muestran cartas de esa colección que el usuario no posee todavía

### Requirement: La atenuación de cartas faltantes es exclusiva de la vista de colección
Al navegar a la vista de expansión desde Colección, las cartas que el usuario no posee SHALL mostrarse atenuadas (gris, opacidad reducida), como ya ocurre hoy. Este comportamiento MUST NOT activarse cuando se llega a la misma vista desde el Catálogo (ver capacidad `card-catalog`).

#### Scenario: Ver progreso de una expansión desde Colección
- **WHEN** el usuario abre una expansión desde la pestaña Colección
- **THEN** las cartas que no posee aparecen atenuadas y las que sí posee con aspecto normal

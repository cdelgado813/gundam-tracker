## ADDED Requirements

### Requirement: La atenuación de cartas faltantes es exclusiva de las vistas de colección
Al navegar a la vista de expansión desde Colección, las cartas que el usuario no posee SHALL mostrarse atenuadas (gris, opacidad reducida), como ya ocurre hoy. Este comportamiento MUST NOT activarse cuando se llega a la misma vista desde el Catálogo (ver capacidad `card-catalog`). Las colecciones personalizadas (ver capacidad `custom-collections`) siguen el mismo criterio: siempre atenúan lo que falta, por vivir dentro de Colección.

#### Scenario: Ver progreso de una expansión desde Colección
- **WHEN** el usuario abre una expansión desde la pestaña Colección
- **THEN** las cartas que no posee aparecen atenuadas y las que sí posee con aspecto normal

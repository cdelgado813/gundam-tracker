## MODIFIED Requirements

### Requirement: Filtro de propiedad de tres estados en catálogo y expansión
El catálogo (resultados de búsqueda) y la vista de expansión SHALL ofrecer un filtro de tres estados — Todas, En propiedad, Faltantes — independiente de si se llegó desde el contexto de colección (`?from=collection`). Este filtro SHALL respetar la preferencia global de modo playset (ver capacidad `collection-management`): con el modo activo, "En propiedad" requiere 4 o más copias y "Faltantes" incluye cualquier carta con menos de 4.

#### Scenario: Buscar solo lo que ya tienes desde el catálogo
- **WHEN** el usuario busca un término en el catálogo y selecciona "En propiedad"
- **THEN** solo se muestran los resultados de esa búsqueda que ya posee, aunque no haya entrado desde colección

#### Scenario: Ver faltantes en una expansión sin venir de colección
- **WHEN** el usuario abre una expansión directamente desde el catálogo (no desde colección) y selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa expansión que no posee todavía

#### Scenario: Volver a "Todas"
- **WHEN** el usuario tiene activo el filtro "En propiedad" o "Faltantes" y selecciona "Todas"
- **THEN** se muestran de nuevo todos los resultados sin filtrar por propiedad

#### Scenario: Filtro "En propiedad" con modo playset activo
- **WHEN** el modo playset está activo y el usuario selecciona "En propiedad" en el catálogo
- **THEN** solo aparecen las cartas de las que tiene 4 o más copias

#### Scenario: Filtro "Faltantes" con modo playset activo
- **WHEN** el modo playset está activo y el usuario selecciona "Faltantes" en una expansión
- **THEN** aparecen las cartas de las que tiene menos de 4 copias, incluidas las que ya tiene parcialmente

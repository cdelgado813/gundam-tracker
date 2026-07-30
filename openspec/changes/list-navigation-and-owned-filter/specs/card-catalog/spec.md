## ADDED Requirements

### Requirement: Filtro de propiedad de tres estados en catálogo y expansión
El catálogo (resultados de búsqueda) y la vista de expansión SHALL ofrecer un filtro de tres estados — Todas, En propiedad, Faltantes — independiente de si se llegó desde el contexto de colección (`?from=collection`).

#### Scenario: Buscar solo lo que ya tienes desde el catálogo
- **WHEN** el usuario busca un término en el catálogo y selecciona "En propiedad"
- **THEN** solo se muestran los resultados de esa búsqueda que ya posee, aunque no haya entrado desde colección

#### Scenario: Ver faltantes en una expansión sin venir de colección
- **WHEN** el usuario abre una expansión directamente desde el catálogo (no desde colección) y selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa expansión que no posee todavía

#### Scenario: Volver a "Todas"
- **WHEN** el usuario tiene activo el filtro "En propiedad" o "Faltantes" y selecciona "Todas"
- **THEN** se muestran de nuevo todos los resultados sin filtrar por propiedad

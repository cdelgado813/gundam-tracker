## Why

CardTrader no expone el tipo de carta del Gundam Card Game (Unit/Pilot/Command/Base/Resource) en ningún campo de su API — se comprobó contra `blueprints/export` y `marketplace/products` (ver docs/api-notes.md): solo hay `collector_number`, `gundam_rarity`, `condition` e idioma. Por tanto, cualquier clasificación por tipo tiene que ser obra del propio usuario. En vez de resolver esto de forma limitada (un único campo "tipo"), se generaliza en una función más potente: **colecciones personalizadas** — el usuario crea sus propias agrupaciones de cartas (tipos, arcos, favoritas, lo que quiera) y puede filtrar el catálogo y su colección por ellas. Además, la vista de Catálogo atenúa hoy las cartas que faltan igual que la de Colección, lo cual no tiene sentido: en el catálogo se está explorando el maestro, no evaluando qué falta. Por último, la app debe dejar claro de qué proyecto forma parte (poordevelopers.com) y su filosofía: herramientas simples, gratuitas y sin ánimo de lucro.

## What Changes

- Nueva capacidad **colecciones personalizadas**: el usuario crea agrupaciones con nombre y color (p. ej. "Unit", "Pilotos favoritos", "Meta ST"), asigna cualquier carta del catálogo a una o varias, y puede editarlas/eliminarlas. Sin límite de tamaño (a diferencia de las trade lists) y 100% locales.
- Filtro por colección personalizada en el buscador del Catálogo (chips seleccionables, combinable con el texto de búsqueda) — así se resuelve "buscar por tipo de carta" con las etiquetas que el propio usuario defina.
- Filtro por colección personalizada también en la vista de expansión dentro de Colección, junto al filtro de "solo faltantes" ya existente.
- Corrección de comportamiento: las cartas atenuadas (grises, indicando que faltan) solo se muestran así cuando la vista de expansión se abre **desde Colección**; desde Catálogo todas las cartas se ven con su aspecto normal, estén o no en la colección del usuario.
- Referencias a poordevelopers.com y su filosofía (herramientas simples, gratuitas, sin ánimo de lucro, sin tracking) en la página `/about`, con enlace al dominio.

## Capabilities

### New Capabilities
- `custom-collections`: creación, edición y borrado de colecciones personalizadas (nombre, color), asignación de cartas a una o varias, y su uso como filtro en catálogo y colección.
- `project-philosophy`: referencias a poordevelopers.com y su filosofía (herramientas simples, gratuitas, sin ánimo de lucro, sin tracking) en la página `/about`.

### Modified Capabilities
- `card-catalog`: añade filtro por colección personalizada en la búsqueda/navegación del catálogo; aclara que las cartas del catálogo nunca se muestran atenuadas por falta de posesión.
- `collection-management`: añade filtro por colección personalizada en la vista de expansión de la colección propia, donde sí se mantiene la atenuación visual de cartas faltantes.

## Impact

- Nueva tabla local en IndexedDB (`customCollections` + relación carta↔colección), sin cambios en el pipeline de datos de CI (nada de esto depende de CardTrader).
- `webapp/src/ui/CardTile.tsx` y `ExpansionPage.tsx`: la atenuación (`dimIfMissing`) pasa a depender del origen de navegación (Colección vs Catálogo), no de la ruta en sí, ya que ambas comparten `/expansion/:id`.
- `webapp/src/features/about/AboutPage.tsx`: añade sección de filosofía/enlace a poordevelopers.com.
- Sin cambios en el pipeline de sincronización (`scripts/sync-catalog.mjs`) ni en el pipeline de despliegue.

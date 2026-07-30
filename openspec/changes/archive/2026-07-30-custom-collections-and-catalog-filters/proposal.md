## Why

CardTrader no expone el tipo de carta del Gundam Card Game (Unit/Pilot/Command/Base/Resource) en ningún campo de su API — se comprobó contra `blueprints/export` y `marketplace/products` (ver docs/api-notes.md): solo hay `collector_number`, `gundam_rarity`, `condition` e idioma. Sí expone rareza, así que un filtro real por rareza (LR, LR+, etc.) es viable directamente. Para lo que la API no da (tipo de carta y cualquier otra clasificación libre), la solución es que el propio usuario defina sus agrupaciones: **colecciones personalizadas**. Además, la vista de Catálogo atenúa hoy las cartas que faltan igual que la de Colección, lo cual no tiene sentido: en el catálogo se está explorando el maestro, no evaluando qué falta. Por último, la app debe dejar claro de qué proyecto forma parte (poordevelopers.com) y su filosofía: herramientas simples, gratuitas y sin ánimo de lucro.

**Revisión 2026-07-28 (tras primera implementación):** el diseño inicial usaba las colecciones personalizadas como un filtro más del Catálogo (chips de selección sobre el maestro completo). Se corrige: una colección personalizada es una **colección del usuario**, no un filtro de catálogo — su propósito es que el usuario pueda seguir cuántas cartas de las que ha añadido ya posee, igual que el progreso por expansión. Vive dentro de la pestaña Colección, con su propia página de progreso, y deja de aparecer como filtro en Catálogo/Expansión. El filtro "por tipo" que sí pertenece al Catálogo pasa a ser, simplemente, el filtro de rareza que la API ya soporta.

## What Changes

- Nueva capacidad **colecciones personalizadas**: el usuario crea agrupaciones con nombre y color (p. ej. "Unit", "Pilotos favoritos", "Meta ST"), asigna cualquier carta del catálogo a una o varias desde el detalle de carta, y puede editarlas/eliminarlas. Sin límite de tamaño y 100% locales.
- Cada colección personalizada es una **colección con progreso propio** (página `/collections/:id`): muestra cuántas de sus cartas asignadas posee el usuario ya (X/Y), con filtro "solo faltantes" y atenuación de lo que falta — igual que el progreso por expansión. Aparece en una sección "Mis colecciones" dentro de la pestaña Colección.
- Filtro por **rareza** (LR, LR+, C, U, R…) en el buscador del Catálogo, calculado dinámicamente del catálogo sincronizado, combinable con el texto de búsqueda. Resuelve "buscar por tipo de carta" con el único campo de clasificación que la API sí expone.
- Corrección de comportamiento: las cartas atenuadas (grises, indicando que faltan) solo se muestran así en vistas de Colección (expansión propia y colecciones personalizadas); desde Catálogo todas las cartas se ven con su aspecto normal.
- Referencias a poordevelopers.com y su filosofía (herramientas simples, gratuitas, sin ánimo de lucro, sin tracking) en la página `/about`, con enlace al dominio.

## Capabilities

### New Capabilities
- `custom-collections`: creación, edición y borrado de colecciones personalizadas (nombre, color), asignación de cartas a una o varias, y vista de progreso propia (X/Y poseídas) dentro de Colección.
- `project-philosophy`: referencias a poordevelopers.com y su filosofía (herramientas simples, gratuitas, sin ánimo de lucro, sin tracking) en la página `/about`.

### Modified Capabilities
- `card-catalog`: añade filtro por rareza en la búsqueda/navegación del catálogo; aclara que las cartas del catálogo nunca se muestran atenuadas por falta de posesión.
- `collection-management`: aclara que la atenuación de faltantes es exclusiva de las vistas de colección (expansión propia y colecciones personalizadas), nunca del catálogo.

## Impact

- Nueva tabla local en IndexedDB (`customCollections` + relación carta↔colección), sin cambios en el pipeline de datos de CI (nada de esto depende de CardTrader).
- `webapp/src/ui/CardTile.tsx` y `ExpansionPage.tsx`: la atenuación (`dimIfMissing`) pasa a depender del origen de navegación (Colección vs Catálogo), no de la ruta en sí, ya que ambas comparten `/expansion/:id`.
- `webapp/src/features/about/AboutPage.tsx`: añade sección de filosofía/enlace a poordevelopers.com.
- Sin cambios en el pipeline de sincronización (`scripts/sync-catalog.mjs`) ni en el pipeline de despliegue.

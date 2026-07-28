## 1. Modelo de datos

- [x] 1.1 Añadir tablas Dexie `customCollections` (`id, name, color, createdAt, updatedAt`) y `customCollectionCards` (`id, collectionId, cardId, addedAt`) en `lib/db.ts`, con índices por `cardId` y `collectionId`; subir versión de esquema
- [x] 1.2 `features/collections/data.ts`: funciones CRUD (crear, renombrar, cambiar color, eliminar colección; asignar/quitar carta) siguiendo el patrón ya usado en `features/trades/data.ts`

## 2. Gestión de colecciones personalizadas

- [x] 2.1 Sección "Colecciones" en el detalle de carta (`CardDetailPage`): chips togglables de colecciones existentes + acción "nueva colección", igual patrón que `TradeListPicker`
- [x] 2.2 Vista de gestión (crear/renombrar/cambiar color/eliminar colecciones) — puede vivir dentro de Ajustes o como sección de la vista de Colección
- [x] 2.3 Selector de color simple (paleta fija de acentos ya definidos en `index.css`, sin color picker libre)

## 3. Filtros — REVISADO 2026-07-28 (ver proposal.md, design.md D2/D6)

Las colecciones personalizadas dejaron de filtrar Catálogo/Expansión; en su lugar son colecciones
propias con progreso. El filtro real de "tipo de carta" en Catálogo es por rareza.

- [x] ~~3.1 Chips de colecciones personalizadas en `CatalogPage`~~ retirado, sustituido por 7.1
- [x] ~~3.2 Chips de colecciones personalizadas en `ExpansionPage`~~ retirado, no aplica

## 7. Corrección: colecciones personalizadas como colección, filtro real por rareza

- [x] 7.1 `RarityFilterChips` en `CatalogPage`: chips calculados dinámicamente de `db.cards.orderBy('rarity').uniqueKeys()`, multi-selección OR, combinable con el texto de búsqueda
- [x] 7.2 Página `CustomCollectionDetailPage` (`/collections/:id`): cartas asignadas a la colección, progreso X/Y poseídas, "solo faltantes", `dimIfMissing` siempre activo
- [x] 7.3 Sección "Mis colecciones" en `CollectionPage` con progreso resumido, enlazando a `/collections/:id`
- [x] 7.4 Eliminar `CollectionFilterChips` (ya sin uso) y las referencias a filtrar catálogo/expansión por colección personalizada

## 4. Atenuación de faltantes solo desde Colección

- [x] 4.1 Los enlaces a `/expansion/:id` desde `CollectionPage` añaden `?from=collection`; los enlaces desde `CatalogPage` y `CardDetailPage` no lo añaden
- [x] 4.2 `ExpansionPage` lee el query param y solo pasa `dimIfMissing` a `CardTile` cuando `from=collection`
- [x] 4.3 Verificar manualmente ambos flujos: Catálogo → expansión (sin atenuar) y Colección → expansión (atenuado)

## 5. Filosofía de poordevelopers

- [x] 5.1 Sección en `AboutPage` con el mensaje de filosofía (herramientas simples, gratuitas, sin ánimo de lucro, sin tracking) y enlace a `https://poordevelopers.com`

## 6. Backups

- [x] 6.1 Incluir `customCollections` y `customCollectionCards` en el payload de backup/export (`features/backup/backup.ts`), subir `schemaVersion` y actualizar el esquema Zod de import

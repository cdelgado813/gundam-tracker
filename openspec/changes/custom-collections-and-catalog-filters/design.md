## Context

La webapp (repo `webapp/`) usa Dexie/IndexedDB para todos los datos de usuario y consume el catálogo/precios como JSON estático generado en CI (ver change `gundam-tcg-collection-webapp`, capacidad `catalog-data-pipeline`). Ese pipeline lee la API de CardTrader, que no incluye tipo de carta — se confirmó en `docs/api-notes.md` y de nuevo aquí contra `blueprints/export` y `marketplace/products`. Cualquier taxonomía de tipo tiene que vivir solo del lado del cliente, como dato de usuario.

Hoy `CardTile` acepta un prop `dimIfMissing` que `ExpansionPage` activa siempre. `ExpansionPage` (`/expansion/:id`) es la única vista de grid de cartas de una expansión y se llega a ella tanto desde `CatalogPage` (explorar el maestro) como desde `CollectionPage` (ver progreso de lo que tengo). Al no distinguir el origen, atenuar cartas faltantes tiene sentido en el segundo caso pero no en el primero.

## Goals / Non-Goals

**Goals:**
- Permitir clasificar cartas con colecciones personalizadas definidas por el usuario (nombre + color), sin límite de tamaño, sin conexión.
- Filtrar catálogo y colección por esas colecciones personalizadas.
- Que la atenuación visual de "carta que falta" solo aparezca cuando se navega desde Colección.
- Reflejar la filosofía de poordevelopers.com en `/about`.

**Non-Goals:**
- Clasificación automática/oficial del tipo de carta (Unit/Pilot/Command/Base/Resource) contra una fuente de datos real — CardTrader no la tiene; se documenta como mejora futura si aparece una fuente fiable.
- Compartir colecciones personalizadas con otros usuarios (eso ya existe para trade lists; las colecciones personalizadas son organización privada, no intercambio).
- Colecciones "inteligentes" con reglas automáticas (p. ej. "todas las LR"); v1 es asignación manual carta a carta, igual que las trade lists ya implementadas.

## Decisions

### D1. Modelo de datos: colecciones personalizadas como tablas Dexie nuevas
Dos tablas nuevas en `lib/db.ts`:
- `customCollections`: `{ id, name, color, createdAt, updatedAt }`.
- `customCollectionCards`: `{ id, collectionId, cardId, addedAt }` — relación muchos a muchos (una carta puede estar en varias colecciones).

Se modela como tabla de relación separada (no como campo `tags: number[]` embebido en `cards`) porque `cards` se borra y regenera en cada sincronización del catálogo (`syncExpansion` hace `delete` + `bulkPut` por expansión); cualquier dato de usuario embebido ahí se perdería. Las asignaciones deben sobrevivir a resincronizaciones.

Reutiliza el patrón ya existente de `tradeLists`/`tradeListItems` (mismo shape estructural), así que la UI de gestión (crear/renombrar/borrar, añadir/quitar carta) puede calcarse de `features/trades`.

### D2. Filtro por colección: chips seleccionables, combinable con búsqueda de texto
En `CatalogPage`, una fila de chips (una por colección personalizada existente) encima de los resultados; selección múltiple (OR entre colecciones seleccionadas), combinable con el texto del buscador (AND). En `ExpansionPage`, la misma fila de chips junto al checkbox "Solo faltantes" ya existente.

Alternativa descartada: un `<select>` de colección única — las colecciones personalizadas se usan más como etiquetas que como carpetas excluyentes (una carta puede pertenecer a varias), así que multi-selección OR es más fiel al caso de uso.

### D3. Atenuar solo desde Colección: parámetro de navegación, no duplicar ruta
`ExpansionPage` sigue siendo una única ruta `/expansion/:id`, pero los enlaces desde `CollectionPage` añaden `?from=collection`; `ExpansionPage` lee ese query param (`useSearchParams`) y solo entonces pasa `dimIfMissing` a `CardTile`. Los enlaces desde `CatalogPage` (y desde `CardDetailPage` al volver) no lo añaden, por lo que el comportamiento por defecto es "sin atenuar". Se descarta duplicar en dos componentes/rutas (`/expansion/:id` y `/collection/expansion/:id`) porque el resto de la vista (progreso, header, grid) es idéntico; solo cambia ese matiz visual.

### D4. Asignación de cartas a colecciones desde el detalle de carta
`CardDetailPage` gana una sección "Colecciones" junto a wishlist/trade lists: chips togglables de las colecciones existentes + acción "nueva colección". Mismo patrón que el `TradeListPicker` ya implementado.

### D5. Filosofía de poordevelopers en `/about`
Nueva sección en `AboutPage` con el mensaje: herramientas simples, gratuitas y sin ánimo de lucro, sin tracking, para la comunidad — con enlace a `https://poordevelopers.com`. Contenido de texto fijo (no configurable), coherente con que el resto de la página ya es estática.

## Risks / Trade-offs

- [Colecciones personalizadas no se sincronizan entre dispositivos] → coherente con el resto de datos de usuario (100% locales); ya cubierto por el sistema de backup/export existente (`features/backup`), que hay que extender para incluir estas dos tablas nuevas.
- [Proliferación de colecciones vacías o duplicadas] → sin restricción dura en v1; se revisa si hace falta un límite tras ver uso real.
- [El query param `?from=collection` se pierde si el usuario comparte/guarda el enlace directo a una expansión] → aceptable: por defecto (sin el parámetro) el comportamiento es "no atenuar", que es el más seguro/neutro.

## Migration Plan

Sin migración de datos existente (tablas nuevas, vacías por defecto). Al desplegar, los backups previos (sin estas tablas) siguen restaurando correctamente por Dexie (tablas nuevas quedan vacías); el import añade `customCollections`/`customCollectionCards` al payload versionado (`schemaVersion` sube).

## Open Questions

- Ninguna crítica para arrancar la implementación. Queda abierto para el futuro: si aparece una fuente de datos fiable con el tipo oficial de carta del Gundam Card Game, valorar un pipeline de enriquecimiento en CI que la cruce por `collector_number` y pre-rellene colecciones sugeridas (no obligatorias).

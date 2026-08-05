## Context

El filtro de propiedad de tres estados (Todas/En propiedad/Faltantes, componente `OwnershipFilter`) se evalúa de forma idéntica y duplicada en 5 sitios, todos con la misma expresión `(ownership === 'owned') === (owned.get(c.id) ?? 0) > 0`:

- `CatalogPage.tsx` (resultados de búsqueda del catálogo)
- `ExpansionPage.tsx` (vista de expansión, catálogo y colección)
- `AllCardsPage.tsx` («Todas las cartas»)
- `CustomCollectionDetailPage.tsx` (colección personalizada)
- `WishlistListDetailPage.tsx` (detalle de wishlist)

Todos consumen `useOwnedMap()` (`features/catalog/hooks.ts`), que ya expone el recuento exacto de copias por carta (`Map<cardId, quantity>`), no solo un booleano — el umbral "≥1" está codificado en cada punto de consumo, no en el hook.

## Goals / Non-Goals

**Goals:**
- Una preferencia global "modo playset" que, activada, hace que "En propiedad" signifique "≥4 copias" y "Faltantes" signifique "<4 copias", en los 5 puntos de filtro de propiedad de tres estados.
- Desactivada (por defecto), el comportamiento es exactamente el actual.
- Un único punto de verdad para el umbral, para que los 5 sitios no puedan divergir.

**Non-Goals:**
- No cambia el cálculo de progreso por expansión/colección (X únicas/Y total) ni la valoración económica: siguen contando "poseída" como ≥1 copia. Cambiar ese criterio también es una decisión de producto mayor (¿qué significa "100% completa", 1 copia o 4?) que el reporte de usuarios no pide explícitamente y queda fuera de esta iteración.
- No cambia el badge de recuento sobre la tarjeta (`×N`) ni añade una barra de progreso "N/4" por carta — solo el filtro de tres estados.
- No introduce un umbral configurable distinto de 4 (el tamaño real de playset en este juego); no hay UI para elegir "3" o "2".

## Decisions

- **Umbral centralizado en `useOwnedMap`'s consumidores vía un helper único**: se añade `isCardOwned(count: number, playsetMode: boolean): boolean` en `features/catalog/hooks.ts` (`count >= (playsetMode ? PLAYSET_SIZE : 1)`), con `PLAYSET_SIZE = 4` como constante exportada. Los 5 puntos pasan de `(owned.get(c.id) ?? 0) > 0` a `isCardOwned(owned.get(c.id) ?? 0, playsetMode)`.
- **Preferencia global con el mismo patrón que `useListViewMode`**: nuevo store `usePlaysetMode` (zustand) respaldado por `db.settings` bajo la clave `collection.playsetMode` (booleano), con `init()` (cargado en `App.tsx` junto a los demás `init()` de arranque) y `setEnabled(boolean)`.
- **Toggle en Ajustes**: un interruptor en `SettingsPage.tsx`, en una sección nueva o junto a las preferencias existentes (idioma), con texto explicando qué significa ("cuenta una carta como conseguida solo con el playset completo, 4 copias").
- **Sin migración de esquema**: `db.settings` es clave-valor libre, no requiere nueva versión de Dexie.
- **No sincroniza entre dispositivos**: es una preferencia de visualización local (como el idioma de interfaz o list/grid), no un dato de usuario — no pasa por `SyncPayload`.

## Risks / Trade-offs

- [Confusión si el usuario activa el modo playset y no entiende por qué una carta con 2 copias aparece como "faltante"] → El toggle en Ajustes lleva una descripción explícita del umbral (4 copias); further clarity is a follow-up, not blocking.
- [Divergencia futura si alguien añade un sexto punto de filtro sin usar `isCardOwned`] → Mitigado por centralizar el helper en `hooks.ts`, junto a `useOwnedMap`, como el lugar obvio a importar.

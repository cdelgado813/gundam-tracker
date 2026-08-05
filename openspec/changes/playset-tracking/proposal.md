## Why

En el Gundam Card Game (como en otros TCG) un "playset" es el máximo útil de copias de una carta para jugarla, 4 unidades. Usuarios quieren poder marcar como "conseguida" una carta solo cuando tienen el playset completo, no con una sola copia, y ver como "faltante" cualquier carta de la que aún no tengan las 4. Hoy el filtro de propiedad (Todas/En propiedad/Faltantes) y las vistas de colección tratan "poseída" como "≥1 copia" sin excepción.

## What Changes

- Se añade una preferencia global "modo playset" (activable/desactivable desde Ajustes, apagada por defecto) que redefine qué cuenta como "en propiedad" en todo el filtro de tres estados (Todas/En propiedad/Faltantes): con el modo activado, "en propiedad" SHALL requerir ≥4 copias de esa carta, y "faltantes" SHALL incluir cualquier carta con menos de 4 copias (incluidas las que tienen 1-3).
- El cambio afecta a todas las vistas que usan ese filtro: catálogo, colección por expansión, «Todas las cartas», wishlist y colecciones personalizadas.
- Con el modo desactivado (por defecto), el comportamiento es exactamente el actual (≥1 copia = poseída).
- Las barras de progreso (X/Y únicas) y la valoración económica de la colección NO cambian de criterio en esta iteración: siguen contando cualquier carta con ≥1 copia como "poseída" a efectos de progreso — el modo playset solo redefine el filtro de tres estados, no el recuento de progreso.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `collection-management`: el filtro de propiedad de tres estados en las vistas de colección respeta el modo playset cuando está activo.
- `card-catalog`: el filtro de propiedad de tres estados en el catálogo respeta el modo playset cuando está activo.
- `custom-collections`: el filtro de propiedad de tres estados dentro de una colección personalizada respeta el modo playset cuando está activo.
- `wishlist-lists`: el filtro de propiedad de tres estados dentro de una wishlist respeta el modo playset cuando está activo.

## Impact

- Nueva preferencia global persistida en `db.settings` (mismo patrón que `ui.listViewMode`/idioma de interfaz): store `usePlaysetMode` con `init()`/`setEnabled()`.
- Toggle nuevo en `webapp/src/features/backup/SettingsPage.tsx`.
- Los 5 puntos donde hoy se evalúa `(ownership === 'owned') === (owned.get(c.id) ?? 0) > 0` (`CatalogPage.tsx`, `ExpansionPage.tsx`, `AllCardsPage.tsx`, `CustomCollectionDetailPage.tsx`, `WishlistListDetailPage.tsx`) pasan a usar un helper compartido que considera el modo playset.

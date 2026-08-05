## 1. Preferencia global

- [x] 1.1 Crear `webapp/src/lib/usePlaysetMode.ts` (store zustand, patrón de `useListViewMode.ts`): clave `collection.playsetMode` en `db.settings`, `init()`, `setEnabled(boolean)`
- [x] 1.2 Registrar `initPlaysetMode` en `App.tsx` junto a los demás `init()` de arranque

## 2. Helper de umbral centralizado

- [x] 2.1 En `webapp/src/features/catalog/hooks.ts`: exportar `PLAYSET_SIZE = 4` y `isCardOwned(count: number, playsetMode: boolean): boolean`

## 3. Aplicar el helper en los puntos de filtro

- [x] 3.1 `CatalogPage.tsx`: sustituir `(owned.get(c.id) ?? 0) > 0` por `isCardOwned(owned.get(c.id) ?? 0, playsetMode)`
- [x] 3.2 `ExpansionPage.tsx`: mismo cambio
- [x] 3.3 `AllCardsPage.tsx`: no aplica — esta vista solo lista cartas ya poseídas, no tiene filtro de propiedad de tres estados (se descubrió al implementar; el punto 5 del proposal.md sobreestimaba "5 puntos", son 4 reales)
- [x] 3.4 `CustomCollectionDetailPage.tsx`: mismo cambio (confirmado que el progreso X/Y de la colección personalizada sigue usando ≥1, no el helper)
- [x] 3.5 `WishlistListDetailPage.tsx`: mismo cambio
- [x] 3.6 Confirmado que ningún punto de progreso (barras X/Y de expansión, colección personalizada) ni la valoración económica pasan por `isCardOwned` — siguen contando ≥1 copia

## 4. Toggle en Ajustes

- [x] 4.1 `SettingsPage.tsx`: añadir interruptor "Modo playset" con descripción breve, leyendo/escribiendo `usePlaysetMode`
- [x] 4.2 Añadir claves de traducción (es/en/ca) en `webapp/src/lib/i18n.ts`

## 5. Verificación

- [x] 5.1 Probado manualmente: con modo playset desactivado, el filtro de propiedad se comporta igual que antes (carta con 2 copias cuenta como "en propiedad")
- [x] 5.2 Probado manualmente: activado el modo vía Ajustes, una carta con 2 copias aparece en "Faltantes" y no en "En propiedad" en catálogo
- [x] 5.3 Probado manualmente: dadas 4 copias a esa misma carta, pasa a "En propiedad"
- [x] 5.4 Confirmado por código que las barras de progreso (X/Y) y la valoración económica no llaman a `isCardOwned` (no cambian con el modo playset)
- [x] 5.5 `npm run build` limpio

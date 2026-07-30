## 1. Memoria de scroll al volver

- [x] 1.1 `lib/useScrollRestoration.ts`: hook que guarda `scrollTop` de un `ref` en `sessionStorage` por `pathname+search` al cambiar de ruta, y lo restaura solo cuando `useNavigationType()` es `POP`
- [x] 1.2 Montar el hook en `Shell` (`App.tsx`) sobre el `ref` del `<main>` que ya envuelve `<Routes>`
- [ ] 1.3 Verificar manualmente: desplazar catálogo, abrir una carta, volver → posición conservada; entrar a colección desde catálogo → arranca arriba

## 2. Botones flotantes de scroll

- [x] 2.1 `ui/ScrollEdgeButtons.tsx`: componente que observa el `ref` de `main` (scroll + resize) y muestra botón "arriba" y/o "abajo" según posición y si hay overflow
- [x] 2.2 Montarlo una vez en `Shell`, posicionado para no chocar con `BulkAssignBar` ni los toasts existentes
- [ ] 2.3 Verificar que no aparece en pantallas cuyo contenido cabe entero (p. ej. Ajustes)

## 3. Reinicio de sección al repulsar su pestaña

- [x] 3.1 En `Shell`, mapa estático `tabId -> prefijos de ruta` y `onClick` en cada `NavLink` que, si la ruta actual pertenece a esa pestaña, hace `navigate(to, { replace: true })`, limpia la entrada de `sessionStorage` de esa ruta y fuerza `scrollTop = 0`
- [x] 3.2 Verificar: entrar a una expansión desde catálogo, pulsar "Catálogo" de nuevo → vuelve a portada de catálogo sin filtros y arriba del todo (lógica de pertenencia de ruta verificada con casos representativos)
- [x] 3.3 Verificar: pulsar una pestaña distinta a la actual sigue navegando con normalidad (verificado junto a 3.2)

## 4. Filtro de propiedad de tres estados

- [x] 4.1 `ui/OwnershipFilter.tsx`: componente controlado (`value: 'all'|'owned'|'missing'`, `onChange`) tipo segmented control
- [x] 4.2 `CustomCollectionDetailPage.tsx`: sustituir el checkbox `onlyMissing` por `OwnershipFilter`, ajustando el filtrado (`visible`) a los tres estados
- [x] 4.3 `ExpansionPage.tsx`: sustituir `onlyMissing` por `OwnershipFilter` y hacerlo visible siempre (no solo con `?from=collection`)
- [x] 4.4 `CatalogPage.tsx`: añadir `OwnershipFilter` a los resultados de búsqueda (`CardResults`), aplicando el estado sobre `owned`
- [x] 4.5 `WishlistListDetailPage.tsx`: añadir `OwnershipFilter` usando `useOwnedMap()` para saber qué deseos ya se poseen

## 5. Traducciones e i18n

- [x] 5.1 Claves nuevas (en/es/ca) para los tres estados del filtro de propiedad y para los botones de scroll (si llevan `aria-label`/tooltip)

## 6. Verificación y despliegue

- [ ] 6.1 Build limpio, smoke test del preview, commit y push a `main`

## 1. Archivar los cambios completados (orden cronológico)

- [x] 1.1 Archivar `gundam-tcg-collection-webapp`
- [x] 1.2 Archivar `custom-collections-and-catalog-filters`
- [x] 1.3 Archivar `fix-navigation-and-bulk-usability`
- [x] 1.4 Archivar `ux-overhaul-search-and-bulk-actions`
- [x] 1.5 Archivar `i18n-language-selector-and-per-language-prices`
- [x] 1.6 Archivar `wishlist-lists-and-shared-limits`
- [x] 1.7 Archivar `list-navigation-and-owned-filter`
- [x] 1.8 Archivar `landing-welcome-and-donate`
- [x] 1.9 Verificar `openspec/specs/` resultante: coherente con el comportamiento real de la app (sin duplicados ni contradicciones entre capacidades)

## 2. README

- [x] 2.1 `README.md`: qué es Gundam Tracker, enlace a `gundam.poordevelopers.com`, capturas
- [x] 2.2 Stack técnico y arquitectura (Vite/React/TS/Tailwind/Dexie, sin backend, PWA)
- [x] 2.3 Pipeline de datos: CardTrader → CI (`scripts/sync-catalog.mjs`) → JSON estático en `webapp/public/data/`
- [x] 2.4 Cómo correr en local (`webapp/`: `npm install`, `npm run dev`, variables de entorno si aplica)
- [x] 2.5 Mención del flujo de trabajo OpenSpec usado en todo el proyecto, con enlace a `openspec/specs/`

## 3. Licencia

- [x] 3.1 `LICENSE` (MIT) en la raíz

## 4. Metadatos de GitHub

- [x] 4.1 `gh repo edit`: descripción corta, `--homepage https://gundam.poordevelopers.com`, topics relevantes

## 5. Release v1.0.0

- [ ] 5.1 Tag `v1.0.0`
- [ ] 5.2 GitHub Release con notas agrupadas por área (catálogo, colección, wishlist, trades, i18n, PWA, landing/about)

## 6. Verificación final

- [x] 6.1 Confirmar que no hay nada sensible o fuera de lugar en la raíz del repositorio tal como GitHub lo muestra (ya verificado: `jwt.json` y la colección Postman nunca se han commiteado)
- [ ] 6.2 Commit y push del README/LICENSE a `main`

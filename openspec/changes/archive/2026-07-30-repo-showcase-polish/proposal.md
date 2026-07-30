## Why

El repositorio es público pero hoy no lo parece: sin README (GitHub muestra la página en blanco por defecto), sin LICENSE, sin descripción ni URL del sitio en los metadatos de GitHub, sin ningún release/tag pese a 28 commits y una app completa en producción, y con 8 cambios de OpenSpec ya implementados y desplegados que siguen en `openspec/changes/` sin archivar — `openspec/specs/` (la fuente de verdad de lo que la app hace hoy) está vacía. Quien entre al repo desde el enlace del About/README de la landing no encuentra nada que explique qué es esto ni cómo se hizo.

## What Changes

- **README.md** en la raíz: qué es Gundam Tracker, capturas o GIF, stack técnico, cómo correr el proyecto en local, cómo funciona el pipeline de datos (CardTrader → CI → JSON estático), enlace a la app en producción y al flujo de trabajo OpenSpec ya usado en todo el proyecto.
- **LICENSE**: MIT.
- **Metadatos del repositorio en GitHub** (`gh repo edit`): descripción corta, `homepageUrl` apuntando a `gundam.poordevelopers.com`, topics relevantes (`gundam`, `tcg`, `pwa`, `react`, `collection-tracker`...).
- **Archivar los 8 cambios de OpenSpec ya completados** (`custom-collections-and-catalog-filters`, `fix-navigation-and-bulk-usability`, `gundam-tcg-collection-webapp`, `i18n-language-selector-and-per-language-prices`, `landing-welcome-and-donate`, `list-navigation-and-owned-filter`, `ux-overhaul-search-and-bulk-actions`, `wishlist-lists-and-shared-limits`), sincronizando sus specs delta a `openspec/specs/` para que quede como fuente de verdad real del comportamiento actual de la app.
- **Primer release en GitHub: `v1.0.0`**, con notas generadas a partir del historial real de commits (catálogo, colección, wishlist como listas compartibles, trade lists, i18n, precios por idioma, PWA con auto-actualización, landing/about).
- **Limpieza de higiene del repo**: revisar que no haya nada sensible o fuera de lugar en la raíz del repositorio tal como GitHub lo muestra hoy (se comprobó que `jwt.json` y la colección Postman nunca se han subido — ya están en `.gitignore` — pero se deja constancia explícita de esa verificación).

## Capabilities

### New Capabilities
- `repo-presentation`: el repositorio como carta de presentación pública — README, LICENSE, metadatos de GitHub y política de releases.

### Modified Capabilities
- Ninguna: no se toca el comportamiento de la app, solo su presentación pública y el archivado de trabajo de planificación ya implementado.

## Impact

- Nuevos `README.md` y `LICENSE` en la raíz del repositorio.
- `openspec/changes/*` → `openspec/changes/archive/*` para los 8 cambios completados; `openspec/specs/**` pasa de vacío a reflejar las capacidades reales (`card-catalog`, `collection-management`, `custom-collections`, `wishlist-lists`, `trade-lists`, `catalog-data-pipeline`, `ui-localization`, `local-persistence-backup`, `static-hosting-deploy`, `app-navigation`, `welcome-landing`, `support-donation`, `project-philosophy`).
- Metadatos del repositorio en GitHub (descripción, homepage, topics) vía `gh repo edit` — acción directa sobre GitHub, no un archivo del repo.
- Un tag `v1.0.0` y un GitHub Release asociado.
- Sin cambios en `webapp/`, en el pipeline de CI/CD, ni en el comportamiento de la app.

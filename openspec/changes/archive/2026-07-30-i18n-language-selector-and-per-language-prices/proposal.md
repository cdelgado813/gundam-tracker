## Why

Tres carencias independientes:

1. **La app está solo en español, cableado en el JSX.** Es un proyecto público y de código abierto, y el Gundam Card Game tiene comunidad internacional: sin selector de idioma queda cerrado a hispanohablantes.
2. **«Todas las cartas» no tiene medida de progreso**, a diferencia de las expansiones y las colecciones personalizadas, que sí muestran su barra. Es justo la vista donde tendría más sentido: cuánto llevas del juego entero.
3. **La valoración de la colección ignora el idioma de las copias.** Se comprobó contra la API real que CardTrader publica el idioma de cada oferta (`gundam_language`) y que los precios varían muchísimo entre idiomas — una misma carta a 100,62 € en inglés y 50,32 € en chino. Hoy la app guarda el idioma de cada copia que posees pero valora todo con el precio mínimo global, así que la valoración es sistemáticamente incorrecta para quien tenga cartas jp o zh-CN. En el muestreo, la mayoría de cartas de un set tienen oferta en más de un idioma (p. ej. 171 de 195), aunque el volumen en inglés domina.

## What Changes

- **Selector de idioma de la interfaz** (inglés, español, catalán) en Ajustes, con detección inicial por idioma del navegador y caída a inglés. Toda la interfaz pasa por un diccionario de traducciones; la elección se guarda localmente.
- **Barra de progreso global en «Todas las cartas»**: cartas únicas poseídas sobre el total del catálogo sincronizado, con el mismo tratamiento visual que las barras de expansión y colección personalizada. La entrada de Colección muestra ese mismo progreso.
- **Precios por idioma**: el pipeline de CI pasa a publicar, por carta, el precio mínimo de cada idioma (`en`, `jp`, `zh-CN`) además del mínimo global. El detalle de carta muestra el desglose por idioma disponible, y la valoración de la colección usa el precio del idioma de cada copia poseída, cayendo al mínimo global cuando no hay oferta en ese idioma (indicándolo).

## Capabilities

### New Capabilities

- `ui-localization`: diccionario de traducciones, selección de idioma de interfaz (en/es/ca) con detección inicial y persistencia local.

### Modified Capabilities

- `catalog-data-pipeline`: los ficheros de precios publicados incluyen el desglose por idioma además del mínimo global.
- `card-catalog`: el detalle de carta muestra el precio por idioma disponible.
- `collection-management`: barra de progreso global en «Todas las cartas» y en su entrada; la valoración usa el precio del idioma de cada copia con caída documentada al mínimo global.

## Impact

- `scripts/sync-catalog.mjs` y el formato de `webapp/public/data/prices/<id>.json` (campo nuevo `byLanguage`, retrocompatible: los consumidores actuales siguen leyendo `minCents`).
- `webapp/src/lib/db.ts` (esquema de la tabla `prices`, versión nueva), `features/catalog/prices.ts`, `CardDetailPage.tsx`, `AllCardsPage.tsx`, `CollectionPage.tsx`.
- Nuevo módulo de i18n y sustitución de las cadenas cableadas en todas las vistas; nueva sección en Ajustes.
- Sin cambios en despliegue ni en la política de datos (el pipeline sigue corriendo con el token del propietario en CI).

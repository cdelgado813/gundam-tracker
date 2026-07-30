## 1. Infraestructura de i18n

- [x] 1.1 `lib/i18n.ts`: diccionario tipado desde el español (fuente de verdad) con `UiLanguage = 'en' | 'es' | 'ca'`, interpolación `{n}` y claves de plural donde haga falta; el tipado debe fallar en compilación si un idioma deja claves sin traducir
- [x] 1.2 Store del idioma activo (Zustand) persistido en `settings`, con detección inicial por `navigator.language` y caída a inglés; hook `useT()`

## 2. Traducción de la interfaz

- [x] 2.1 Extraer al diccionario las cadenas de navegación, Catálogo, Expansión y detalle de carta
- [x] 2.2 Extraer las de Colección, Todas las cartas, colecciones personalizadas y barra de selección
- [x] 2.3 Extraer las de Wishlist, Trades (incluido compartir/importar), Ajustes y Acerca de
- [x] 2.4 Selector de idioma en Ajustes, etiquetado sin ambigüedad frente al idioma de carta

## 3. Progreso global

- [x] 3.1 Barra de progreso en `AllCardsPage` (únicas poseídas / total del catálogo local)
- [x] 3.2 Mismo progreso y cifras en la entrada «Todas las cartas» de `CollectionPage`

## 4. Precios por idioma

- [x] 4.1 `scripts/sync-catalog.mjs`: calcular `byLanguage` (mínimo y nº de ofertas por idioma) conservando `minCents`; ejecutar y verificar el formato publicado
- [x] 4.2 Esquema Dexie: versión nueva de `prices` con `byLanguage` opcional; `features/catalog/prices.ts` lo propaga tratando `undefined` como «sin desglose»
- [x] 4.3 Detalle de carta: filas de precio por idioma con oferta, resaltando el idioma poseído; sin filas para idiomas sin oferta
- [x] 4.4 Valoración de la colección por idioma de cada copia, con caída al mínimo global y aviso de cuántas copias usaron precio de otro idioma

## 5. Verificación y despliegue

- [x] 5.1 Verificar el cálculo de `byLanguage` y la valoración por idioma con casos reales contra IndexedDB
- [x] 5.2 Build limpio, smoke test del preview, commit, push y ejecución del workflow de sincronización para publicar los precios con desglose

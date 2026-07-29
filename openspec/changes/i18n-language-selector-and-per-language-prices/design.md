## Context

La webapp es una PWA estática con datos de catálogo/precios generados en CI (ver change `gundam-tcg-collection-webapp`). Todas las cadenas de interfaz están cableadas en español dentro del JSX. La tabla `prices` de IndexedDB guarda hoy `{blueprintId, minCents, minNearMintCents, currency, offersCount, fetchedAt}` y se alimenta de `/data/prices/<expansionId>.json`, generado por `scripts/sync-catalog.mjs` a partir de `GET /marketplace/products?expansion_id=`.

Datos verificados contra la API antes de diseñar: cada oferta trae `properties_hash.gundam_language` (`en` | `jp` | `zh-CN`); el volumen está muy sesgado a inglés (p. ej. 12.291 ofertas `en` frente a 336 `jp` y 95 `zh-CN` en gd01), pero la mayoría de cartas tienen oferta en más de un idioma y los precios difieren de forma material (hasta 2× entre idiomas en la misma carta).

Ojo con la colisión de conceptos: **idioma de interfaz** (en/es/ca, nuevo) e **idioma de carta** (en/jp/zh-CN, ya existente en `CardLanguage`) son cosas distintas y no deben mezclarse ni en tipos ni en UI.

## Goals / Non-Goals

**Goals:**
- Interfaz en inglés, español y catalán, con cambio en caliente y persistencia local.
- Progreso global de colección en «Todas las cartas».
- Precio por idioma de carta, visible en el detalle y aplicado a la valoración de la colección.

**Non-Goals:**
- Traducir nombres de carta o de expansión: vienen de CardTrader y solo existen en inglés.
- Localizar formatos de moneda por idioma de interfaz: los precios son en EUR del marketplace europeo; se mantiene el formato `es-ES` para no dar a entender conversión de divisa.
- Librería de i18n pesada (i18next y similares): innecesaria para tres idiomas y un diccionario plano.
- Traducir los documentos de OpenSpec ni el README.

## Decisions

### D1. i18n propia y tipada, sin librería
Módulo `lib/i18n.ts` con un diccionario `Record<UiLanguage, Record<TranslationKey, string>>` donde `TranslationKey` se deriva del diccionario español (fuente de verdad), de modo que **TypeScript falla en compilación si un idioma se deja una clave sin traducir**. Store de Zustand (ya en el proyecto) con el idioma activo, persistido en la tabla `settings` de Dexie junto al resto de preferencias. Hook `useT()` devuelve la función de traducción `t(key, params?)` con interpolación simple `{n}` para los recuentos.

Alternativa descartada: i18next — pesa más que todo el beneficio para 3 idiomas, y su detección de claves ausentes es en runtime, no en compilación.

Selección inicial: `navigator.language` → `es`/`ca` si coincide el prefijo, en caso contrario `en`. El inglés es el idioma por defecto porque el proyecto es público e internacional; la preferencia explícita del usuario siempre gana sobre la detección.

Pluralización: el diccionario incluye claves separadas para singular y plural donde haga falta (`card_one` / `card_other`); las tres lenguas comparten la misma regla (1 vs. resto), así que no hace falta `Intl.PluralRules`.

### D2. Progreso global sobre el catálogo sincronizado
«Todas las cartas» muestra `únicas poseídas / total de cartas en la tabla local`, no sobre el total teórico del juego: el denominador debe ser lo que la app realmente conoce, o el porcentaje mentiría cuando falten expansiones por sincronizar. La entrada en `CollectionPage` muestra la misma barra y cifras, para que el dato sea idéntico dentro y fuera.

### D3. Precios por idioma: campo aditivo, no sustitutivo
`scripts/sync-catalog.mjs` añade a cada entrada de precio `byLanguage: { en?: {minCents, offersCount}, jp?: …, 'zh-CN'?: … }`, conservando `minCents` global. Es aditivo a propósito: los datos publicados son consumidos por navegadores con la app cacheada en service worker, así que una versión antigua debe seguir funcionando contra datos nuevos.

En el cliente, `PriceCache` gana el mismo campo opcional (versión nueva de esquema Dexie; los registros viejos quedan sin `byLanguage` hasta el siguiente refresco, y el código trata `undefined` como «sin desglose»).

### D4. Valoración por idioma de la copia, con caída explícita
La valoración de la colección pasa a resolver, por cada entrada poseída, el precio de `byLanguage[entry.language]`; si no hay oferta en ese idioma, cae a `minCents` global. La UI ya muestra «basado en N de M cartas con precio»; se añade el matiz de cuántas usaron el precio de otro idioma, para no presentar como exacto lo que es una aproximación. Este es el punto del change con más riesgo de engañar al usuario, así que la transparencia es parte del requisito, no un extra.

### D5. Idioma de carta en el detalle
El bloque de precio del detalle muestra una fila por idioma con oferta (`EN 7,04 € · JP 15,21 € · ZH 16,46 €`), resaltando el idioma que el usuario posee si tiene copias. No se inventan filas para idiomas sin oferta.

## Risks / Trade-offs

- [Traducciones incompletas al añadir cadenas nuevas] → el tipado desde el diccionario español hace que falte una clave sea error de compilación, no un texto en blanco en producción.
- [Confusión entre idioma de interfaz e idioma de carta] → tipos distintos (`UiLanguage` vs `CardLanguage`), etiquetas distintas en UI («Idioma de la app» vs «Idioma de la carta») y ningún punto donde se puedan pasar uno por otro.
- [Peso de los ficheros de precios] → el desglose añade como mucho tres pares de números por carta; sobre ~1,1 MB actuales de datos es marginal.
- [Precios jp/zh-CN escasos] → la caída al mínimo global se comunica en la UI en lugar de silenciarse.
- [Datos viejos en clientes con service worker] → campo aditivo (D3), nunca sustitutivo.

## Migration Plan

Versión nueva del esquema Dexie para `prices` (campo opcional, sin migración de datos: los precios se rellenan solos al siguiente refresco). El pipeline se ejecuta manualmente una vez tras desplegar para publicar los datos con desglose. Rollback = revert del commit.

## Open Questions

Ninguna.

# CardTrader API v2 — Notas de verificación (Gundam TCG)

Verificado el 2026-07-28 con el JWT del usuario (app id 23056, user_id 381062). Base: `https://api.cardtrader.com/api/v2`, auth `Authorization: Bearer <jwt>`.

## Identificadores clave

- **Juego Gundam: `game_id = 23`** (`display_name: "Gundam"`).
- **Categoría de cartas sueltas: `category_id = 272` ("Gundam Singles")** — es la única relevante para el catálogo de cartas. El resto (273–287) son sealed/accesorios y se filtran fuera.
- Expansiones: `GET /expansions` devuelve **todas** las de todos los juegos (~3800); filtrar client-side por `game_id === 23` → **38 expansiones Gundam** a fecha de hoy (gd01–gd07, st01–st14, eb01, promos, tokens, etc.).

## Endpoints verificados

| Endpoint | Resultado |
|---|---|
| `GET /info` | 200. Devuelve `{shared_secret, name, id, user_id}` — sirve como validación del JWT |
| `GET /games` | 200. Array plano bajo clave `array` |
| `GET /expansions` | 200. Array plano `[{id, game_id, code, name}]`, sin paginación real |
| `GET /blueprints/export?expansion_id=<id>` | 200. Array completo de blueprints de la expansión (ST-01 → 39 items) |
| `GET /marketplace/products?blueprint_id=<id>` | 200. Objeto `{<blueprint_id>: [ofertas ordenadas por precio asc]}` |

## Estructura de blueprint (cartas: category_id 272)

```jsonc
{
  "id": 341359,                      // blueprint id — clave global de carta
  "name": "Gundam",
  "version": "Foil",                 // null o "Foil" — versiones alternativas son blueprints separados
  "game_id": 23,
  "category_id": 272,
  "expansion_id": 4247,
  "fixed_properties": {
    "collector_number": "ST01-001",
    "gundam_rarity": "LR"            // rarezas vistas: C, U, R, RR, LR, P...
  },
  "editable_properties": [           // condición, signed, altered, gundam_language
    // condition: Mint | Near Mint | Slightly Played | Moderately Played | Played | Poor
    // gundam_language: en | jp | zh-CN
  ],
  "tcg_player_id": 641436,
  "image_url": "https://cardtrader.com/uploads/blueprints/image/341359/preview_....jpg",
  "image": { "url": "...", "show": {...}, "preview": {...}, "social": {...} }, // rutas relativas a cardtrader.com
  "back_image": null
}
```

Notas:
- Los exports incluyen también blueprints de sealed (boosters, decks…) con otros `category_id`; **filtrar por `category_id === 272`** al normalizar a la tabla `cards`.
- `image_url` es absoluta (tamaño preview); `image.show.url` es la versión grande (relativa, prefijar `https://cardtrader.com`).
- Condiciones reales de CardTrader difieren del spec original (usa *Slightly/Moderately Played*, no *Excellent/Good*): la app usará los `possible_values` del blueprint.
- Idiomas Gundam: `en`, `jp`, `zh-CN`.

## Estructura de oferta de marketplace

`GET /marketplace/products?blueprint_id=X` → `{ "X": [ofertas] }`, cada oferta con `price_cents`, `price_currency` (EUR), `quantity`, `properties_hash` (condition, language, rarity…), `user`. Ordenadas por precio ascendente ⇒ **precio mínimo = primera oferta**; precio "de referencia" razonable = mínimo en Near Mint/en.

También admite `?expansion_id=X` para traer ofertas de toda una expansión (útil para valorar la colección por lotes).

## Rate limiting / tamaños

- 38 expansiones × 1 request de export cada una ⇒ sincronización inicial ligera (ST-01: 39 blueprints; sets grandes gd0x: cientos). Sin problemas observados con requests secuenciales.
- Sin cabeceras de rate-limit observadas en estas pruebas; mantener descargas secuenciales con backoff por prudencia (design D2).

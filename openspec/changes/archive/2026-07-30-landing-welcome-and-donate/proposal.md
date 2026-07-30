## Why

Hoy quien entra por primera vez a `gundam.poordevelopers.com` cae directo en el catálogo, sin ningún sitio que explique qué es la app, por qué no pide cuentas, o qué puede hacer con ella — a diferencia de `optcg.poordevelopers.com`, la web de presentación de la herramienta hermana para One Piece TCG, que sí resuelve esto bien. Además, no hay ninguna forma de apoyar el proyecto: el botón de donación (Buy Me a Coffee) que ya existe en la web de OPTCG no tiene equivalente aquí.

## What Changes

- **Pantalla de bienvenida** al abrir la app por primera vez: hero, un resumen visual de qué ofrece (catálogo con precios por idioma, colección valorada, wishlist y listas de intercambio compartibles por enlace, todo local sin cuentas), y un botón "Entrar" que lleva al catálogo. Se recuerda que ya se vio (vía `db.settings`, mismo patrón que el idioma) y no vuelve a aparecer — la URL, la PWA instalada y el resto de la app **no cambian de sitio**: es una pantalla más dentro de la misma app React, no un sitio ni dominio aparte.
- **Botón de apoyo (Buy Me a Coffee)** con el botón amarillo oficial de la marca, enlazando a `buymeacoffee.com/JapaneseWeddingPhotos`: visible en la pantalla de bienvenida y también referenciado en Ajustes, como una sección más junto a copia de seguridad/backup.
- Contenido de la pantalla de bienvenida traducido en los tres idiomas ya soportados (es/en/ca), igual que el resto de la app.
- Tres imágenes reales de cartas de Gundam como elemento visual del hero (aportadas por el usuario), en el mismo espíritu que el "card-stack" de la web de OPTCG pero con la paleta e identidad visual propias de esta app (Chakra Petch, colores hangar/zeon/federation/newtype/haro), no una copia del estilo de OPTCG.

## Capabilities

### New Capabilities
- `welcome-landing`: pantalla de bienvenida mostrada antes del catálogo en la primera visita, con recordatorio persistente de que ya se vio.
- `support-donation`: enlace de apoyo económico (Buy Me a Coffee) visible en la bienvenida y en Ajustes.

### Modified Capabilities
- Ninguna: no se toca el comportamiento de capacidades existentes (catálogo, colección, wishlist, trades, backup), solo se añade una pantalla previa y un enlace nuevo en Ajustes.

## Impact

- `webapp/src/App.tsx`: antes de montar `HashRouter`/`Shell`, comprueba si la bienvenida ya se vio; si no, muestra `LandingPage` en su lugar.
- Nuevo `webapp/src/features/landing/`: `LandingPage.tsx` y el store de persistencia (`useWelcomeSeen.ts`, patrón `useUiLanguage`/`useListViewMode`).
- Nuevo `webapp/src/ui/DonateButton.tsx` (o similar), reutilizado en `LandingPage` y en `SettingsPage.tsx`.
- Assets nuevos en `webapp/public/`: 3 imágenes de cartas y el botón amarillo oficial de Buy Me a Coffee (copiados de las rutas que aportó el usuario, sin modificar el asset de marca).
- Nuevas claves de traducción (en/es/ca) para toda la pantalla de bienvenida y el botón de apoyo.
- Sin cambios en rutas existentes, en Dexie (salvo una entrada nueva en `settings`), ni en el pipeline de datos de CI.

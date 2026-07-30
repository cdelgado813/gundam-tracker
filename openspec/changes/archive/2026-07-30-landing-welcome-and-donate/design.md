## Context

`gundam.poordevelopers.com` es un único despliegue de GitHub Pages (`webapp/dist`) con dominio propio (`CNAME`), PWA instalable y un `sitemap.xml`/`robots.txt` recién publicados apuntando a la raíz como única URL indexable. `App.tsx` monta `HashRouter` directamente; no existe hoy ninguna pantalla previa al catálogo.

La web de referencia (`optcg.poordevelopers.com`) es un sitio estático aparte (HTML/CSS sin build, sin dependencias de terceros) para una app que aún no tiene versión web — ahí "landing" y "producto" son cosas distintas por necesidad. Gundam Tracker es distinto: la app web **es** el producto, ya vive en esa URL, tiene una PWA instalada por usuarios reales y un SEO ya configurado sobre esa misma raíz. Repetir la arquitectura de dos sitios (dominio/subdominio aparte) arriesgaría bookmarks, el scope de la PWA instalada y el sitemap ya publicado — de ahí la decisión (confirmada con el usuario) de que la bienvenida sea una pantalla más dentro de esta misma app React, no un despliegue distinto.

## Goals / Non-Goals

**Goals:**
- Mostrar una pantalla de bienvenida (hero + qué ofrece la app + apoyo económico) antes del catálogo, solo hasta que el usuario pulse "Entrar".
- Que la URL raíz, el scope del service worker y el sitemap sigan apuntando exactamente a lo mismo que hoy — la bienvenida vive en el mismo documento, no en una ruta ni dominio nuevo.
- Reutilizar la identidad visual ya existente de la app (tokens de `index.css`, Chakra Petch, paleta hangar/zeon/federation/newtype/haro) en vez de portar el sistema visual de la web de OPTCG.
- Botón de apoyo (Buy Me a Coffee) con el asset oficial de marca, sin scripts ni requests de terceros salvo al pulsarlo.

**Non-Goals:**
- No se crea ningún sitio estático independiente, subdominio, ni registro DNS nuevo.
- No se replica el contenido legal (privacidad/disclaimer) de la web de OPTCG: esa web menciona un ping de analítica que Gundam Tracker no tiene y no va a incorporar; el aviso de "no afiliado" ya vive en `AboutPage`, no se duplica aquí.
- No se widgetiza Buy Me a Coffee (sin su script embebible): sería una dependencia de terceros nueva y rompería la CSP estricta ya vigente (`script-src 'self'`). Un enlace `<a>` con el botón oficial como imagen basta y no requiere tocar la CSP.

## Decisions

### D1: Gate a nivel de `App()`, no una ruta del router

`App()` carga `useWelcomeSeen().seen` (inicializado desde `db.settings`, patrón idéntico a `useUiLanguage`/`useListViewMode`) antes de decidir qué montar:
- `seen === undefined` (aún cargando la preferencia): no pintar nada todavía (evita parpadeo bienvenida→app).
- `seen === false`: renderizar `<LandingPage onEnter={...} />` en vez de `<HashRouter>`.
- `seen === true`: renderizar `<HashRouter>` como hoy, sin cambios.

`onEnter` marca `db.settings` (`ui.welcomeSeen = true`) y actualiza el estado, lo que desmonta `LandingPage` y monta el router en su lugar — todo dentro del mismo ciclo de vida de React, sin navegación de verdad ni cambio de URL.

**Alternativa descartada**: una ruta `/welcome` dentro del `HashRouter` con redirección. Se descarta porque entonces un enlace profundo directo (`#/card/123` compartido por otra persona) tendría que redirigir primero a `/welcome` y de vuelta, más complejo, y porque el propósito es que la bienvenida se vea *antes* de que exista cualquier concepto de ruta.

### D2: `db.settings` con la misma clave de patrón que idioma/vista

`SETTING_KEY = 'ui.welcomeSeen'`, store Zustand (`useWelcomeSeen`) con `seen: boolean | undefined`, `init()` y `markSeen()` — calco exacto de `useUiLanguage`. `init()` se llama una vez en `App()`, igual que `initLanguage`/`initListViewMode`.

**Alternativa descartada**: `localStorage` directo. Se descarta por coherencia: todo lo demás en la app persiste preferencia de usuario vía `db.settings`, y usar `localStorage` solo aquí introduciría un segundo mecanismo sin necesidad.

### D3: Contenido i18n, no texto fijo

A diferencia de la web de OPTCG (solo inglés), Gundam Tracker ya tiene i18n completo en es/en/ca con chequeo de tipos en compilación. Todo el texto de `LandingPage` y del botón de apoyo se añade como claves nuevas al diccionario (`landing.*`, `support.*`), igual que cualquier otra pantalla.

### D4: Assets de marca copiados tal cual, sin recolorear

El botón de Buy Me a Coffee es un asset de marca con guías de uso (no se recolorea ni se reconstruye en SVG propio): se copia `Buttons & Icons/yellow-button.png` de `bmcbrand/` a `webapp/public/support/` y se usa como `<img>` dentro de un `<a href="https://www.buymeacoffee.com/JapaneseWeddingPhotos" target="_blank" rel="noreferrer">`. Mismo componente (`DonateButton`) reutilizado en `LandingPage` y en una sección nueva de `SettingsPage`.

Las 3 imágenes de cartas aportadas se copian a `webapp/public/landing/` y se usan en un "card-stack" del hero (visual, `aria-hidden`, sin depender de que el catálogo esté sincronizado) — mismo espíritu que el de OPTCG pero solo como decoración estática, no cartas reales del catálogo local.

### D5: Sección de apoyo en Ajustes, junto a backup

`SettingsPage.tsx` gana una sección nueva ("Apoya el proyecto") con `DonateButton`, colocada junto a las secciones existentes de backup/exportación — incorpora el patrón visual `Section` ya usado ahí, sin introducir un componente de sección nuevo.

## Risks / Trade-offs

- [Riesgo] Un usuario que instaló la PWA antes de este cambio verá la bienvenida una vez al actualizar (porque `db.settings` no tiene aún `ui.welcomeSeen`) → Mitigación: aceptado a propósito; es una única pantalla con botón "Entrar" inmediato, coste mínimo, y es coherente con "explicar la app" incluso a quien ya la usa.
- [Riesgo] Mostrar la bienvenida a quien abre un enlace profundo compartido (p. ej. una wishlist compartida `#/s/...`) antes de resolverlo → Mitigación: aceptado; el hash de la URL no se pierde (sigue en `location.hash`, el router aún no se ha montado) y se resuelve en cuanto se pulsa "Entrar", ya que `HashRouter` lee el hash actual al montarse.
- [Trade-off] No hay forma de volver a ver la bienvenida una vez descartada (no se propone un enlace "ver de nuevo" en Ajustes, fuera de alcance de esta propuesta) → aceptable dado que no se pidió; se puede añadir después si hace falta.

## Migration Plan

Sin migración de datos real: una clave nueva en `db.settings`, ausente = `false` (bienvenida no vista) para todo el mundo, incluidas instalaciones existentes. Despliegue estándar: build, smoke test del preview, commit y push a `main`.

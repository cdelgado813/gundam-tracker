## 1. Assets

- [x] 1.1 Copiar las 3 imágenes de cartas aportadas a `webapp/public/landing/` (nombres cortos, sin espacios)
- [x] 1.2 Copiar `Buttons & Icons/yellow-button.png` de `bmcbrand/` a `webapp/public/support/bmc-yellow-button.png`, sin modificarlo

## 2. Persistencia de la preferencia

- [x] 2.1 `lib/useWelcomeSeen.ts`: store Zustand + `db.settings` (`ui.welcomeSeen`), patrón idéntico a `useUiLanguage`/`useListViewMode` (`seen: boolean | undefined`, `init()`, `markSeen()`)

## 3. Componentes

- [x] 3.1 `ui/DonateButton.tsx`: enlace `<a>` a `https://www.buymeacoffee.com/JapaneseWeddingPhotos` (`target="_blank" rel="noreferrer"`) con el botón amarillo oficial como imagen
- [x] 3.2 `features/landing/LandingPage.tsx`: hero con card-stack de las 3 cartas, resumen de qué ofrece la app (catálogo con precios por idioma, colección valorada, wishlist y trade lists compartibles, todo local sin cuentas), `DonateButton`, botón "Entrar" que llama a `markSeen()`
- [x] 3.3 Reutilizar los tokens visuales existentes (`index.css`: hangar/zeon/federation/newtype/haro, Chakra Petch) — sin CSS ni sistema de diseño nuevo

## 4. Integración en App.tsx

- [x] 4.1 `App()`: llamar a `useWelcomeSeen().init()` junto a los demás `init` existentes
- [x] 4.2 Mientras `seen === undefined`, no renderizar nada (evitar parpadeo); si `seen === false`, renderizar `LandingPage`; si `seen === true`, renderizar `HashRouter` como hoy
- [x] 4.3 Verificar que un enlace profundo (`#/s/:payload`) abierto en primera visita se resuelve correctamente tras pulsar "Entrar" (verificado por lectura de código: `location.hash` no se toca hasta montar `HashRouter`, que lee el hash actual al iniciar — sin navegador real para probarlo interactivamente)

## 5. Ajustes

- [x] 5.1 `SettingsPage.tsx`: nueva sección "Apoya el proyecto" con `DonateButton`, junto a las secciones de backup existentes

## 6. Traducciones e i18n

- [x] 6.1 Claves nuevas (en/es/ca) para toda la pantalla de bienvenida (`landing.*`) y el botón de apoyo (`support.*`)

## 7. Verificación y despliegue

- [x] 7.1 Verificar que el `robots.txt`/`sitemap.xml`/CSP existentes siguen intactos (sin rutas ni dominios nuevos)
- [x] 7.2 Build limpio, smoke test del preview (primera visita muestra bienvenida; tras "Entrar" no vuelve a aparecer), commit y push a `main`

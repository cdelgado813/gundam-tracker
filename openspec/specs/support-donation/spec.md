# support-donation Specification

## Purpose
El enlace de apoyo económico (Buy Me a Coffee) visible en la bienvenida, en `/about` y en Ajustes, siempre opcional y sin afectar a ninguna funcionalidad.
## Requirements
### Requirement: Botón de apoyo económico con el asset oficial de Buy Me a Coffee
La aplicación SHALL ofrecer un enlace de apoyo económico (Buy Me a Coffee) usando el botón oficial de la marca, que abre `buymeacoffee.com` en una pestaña nueva sin ninguna llamada de red propia al pulsarlo salvo esa navegación.

#### Scenario: Pulsar el botón de apoyo
- **WHEN** el usuario pulsa el botón de Buy Me a Coffee, ya sea en la bienvenida o en Ajustes
- **THEN** se abre `https://www.buymeacoffee.com/JapaneseWeddingPhotos` en una pestaña nueva

### Requirement: El botón de apoyo aparece en la bienvenida y en Ajustes
La aplicación SHALL mostrar el botón de apoyo tanto en la pantalla de bienvenida como en una sección propia de Ajustes.

#### Scenario: Visible en Ajustes en cualquier momento
- **WHEN** el usuario entra a Ajustes en cualquier momento, no solo en la primera visita
- **THEN** encuentra una sección de apoyo al proyecto con el botón de Buy Me a Coffee


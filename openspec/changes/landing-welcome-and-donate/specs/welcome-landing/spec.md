## ADDED Requirements

### Requirement: Pantalla de bienvenida antes de la primera entrada
La aplicación SHALL mostrar una pantalla de bienvenida (qué es la app, qué ofrece, sin cuentas) en vez del catálogo la primera vez que se abre, en la misma URL y dominio que el resto de la app.

#### Scenario: Primera visita
- **WHEN** un usuario abre `gundam.poordevelopers.com` sin haber visto antes la bienvenida
- **THEN** ve la pantalla de bienvenida en vez del catálogo, con un botón para entrar a la app

#### Scenario: Entrar a la app
- **WHEN** el usuario pulsa el botón de entrar en la pantalla de bienvenida
- **THEN** accede al catálogo con normalidad, sin que la URL de la app haya cambiado de sitio ni de dominio

### Requirement: La bienvenida no vuelve a mostrarse tras verse una vez
La aplicación SHALL recordar que la bienvenida ya se mostró y no volver a mostrarla en visitas posteriores, incluso tras cerrar y reabrir la app o el navegador.

#### Scenario: Segunda visita
- **WHEN** un usuario que ya pulsó "Entrar" anteriormente vuelve a abrir la app en el mismo dispositivo
- **THEN** accede directamente al catálogo, sin ver la bienvenida de nuevo

### Requirement: Un enlace profundo compartido sigue funcionando tras la bienvenida
Si la app se abre mediante un enlace profundo (p. ej. una lista de wishlist o de intercambio compartida) y la bienvenida aún no se ha visto, la aplicación SHALL mostrar primero la bienvenida y, al entrar, resolver ese enlace con normalidad.

#### Scenario: Enlace compartido en primera visita
- **WHEN** alguien sin visitas previas abre un enlace de una lista compartida
- **THEN** ve primero la bienvenida y, al pulsar "Entrar", llega a la pantalla de importación de esa lista, no al catálogo

## ADDED Requirements

### Requirement: Alta rápida de copias desde la tarjeta
En las vistas de colección (expansión abierta desde Colección y colecciones personalizadas), cada tarjeta de carta SHALL ofrecer un botón «+1» que añada una copia (Near Mint, en) a la colección del usuario sin abrir el detalle, con feedback inmediato en el contador de copias de la propia tarjeta. El botón MUST NOT navegar al detalle al pulsarlo y MUST NOT mostrarse en modo selección ni en vistas de catálogo.

#### Scenario: Añadir copia sin abrir el detalle
- **WHEN** el usuario pulsa «+1» sobre una carta faltante en una expansión abierta desde Colección
- **THEN** la carta suma una copia Near Mint/en, su contador pasa a ×1 y deja de mostrarse atenuada, sin cambiar de página

#### Scenario: El +1 no aparece en el catálogo
- **WHEN** el usuario explora la misma expansión desde la pestaña Catálogo
- **THEN** las tarjetas no muestran el botón «+1»

### Requirement: Marcado en propiedad en lote
La aplicación SHALL permitir añadir en una sola operación una copia (Near Mint, en) de cada carta de un conjunto seleccionado, ejecutada en una única transacción y fusionando con las entradas existentes de esa condición e idioma.

#### Scenario: Lote con mezcla de cartas nuevas y ya poseídas
- **WHEN** el usuario marca en propiedad un lote donde algunas cartas ya tenían copias Near Mint/en y otras no
- **THEN** las ya poseídas incrementan su cantidad y las nuevas crean su entrada, sin duplicados

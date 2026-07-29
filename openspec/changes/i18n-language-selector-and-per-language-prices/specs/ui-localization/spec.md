## ADDED Requirements

### Requirement: Selector de idioma de la interfaz
La aplicación SHALL ofrecer en Ajustes un selector del idioma de la interfaz con inglés, español y catalán, aplicable en caliente (sin recargar) y persistido localmente. La preferencia elegida SHALL prevalecer sobre cualquier detección automática.

#### Scenario: Cambiar de idioma
- **WHEN** el usuario selecciona «Català» en Ajustes
- **THEN** toda la interfaz pasa a catalán de inmediato y sigue en catalán al volver a abrir la app

#### Scenario: Primera visita sin preferencia
- **WHEN** un visitante abre la app por primera vez con el navegador en español
- **THEN** la interfaz aparece en español; con el navegador en cualquier otro idioma distinto de catalán, aparece en inglés

### Requirement: Cobertura completa de las traducciones
Todas las cadenas de interfaz visibles SHALL provenir del diccionario de traducciones. El sistema de tipos SHALL impedir que un idioma quede con claves sin traducir, fallando en compilación.

#### Scenario: Clave sin traducir
- **WHEN** se añade una cadena nueva al diccionario de un idioma pero no al de otro
- **THEN** la compilación falla, en lugar de mostrar un texto vacío o en otro idioma en producción

### Requirement: El idioma de la interfaz no se confunde con el idioma de la carta
El idioma de la interfaz (inglés, español, catalán) SHALL ser independiente del idioma de las cartas (`en`, `jp`, `zh-CN`) y ambos SHALL presentarse con etiquetas inequívocas.

#### Scenario: Interfaz en catalán con cartas en inglés
- **WHEN** el usuario tiene la interfaz en catalán y añade una copia en idioma `en`
- **THEN** el cambio de idioma de interfaz no altera el idioma registrado de esa copia

### Requirement: Los datos de CardTrader no se traducen
Los nombres de carta y de expansión SHALL mostrarse tal como los publica CardTrader, sin traducir, en cualquier idioma de interfaz.

#### Scenario: Nombre de carta en interfaz traducida
- **WHEN** el usuario usa la app en catalán
- **THEN** los nombres de carta y expansión siguen apareciendo en su idioma original

# jwt-onboarding

## ADDED Requirements

### Requirement: Tour de arranque con captura de JWT
La aplicación SHALL mostrar, en el primer arranque (cuando no existe JWT almacenado), un tour de bienvenida que explique el propósito de la app y solicite al usuario su JWT de CardTrader antes de permitir el uso de funciones que requieran API.

#### Scenario: Primer arranque sin JWT
- **WHEN** el usuario abre la app y no hay JWT almacenado localmente
- **THEN** se muestra el tour de onboarding con un paso final de introducción del JWT y no se puede acceder al resto de la app hasta completarlo

#### Scenario: Arranque con JWT válido almacenado
- **WHEN** el usuario abre la app y existe un JWT almacenado que no ha expirado
- **THEN** la app salta el onboarding y muestra directamente la pantalla principal

### Requirement: Validación del JWT introducido
La aplicación SHALL validar el JWT introducido decodificando su payload (formato, campo `exp`) y realizando una llamada de prueba a la API de CardTrader (`GET /api/v2/info`) antes de aceptarlo.

#### Scenario: JWT válido
- **WHEN** el usuario pega un JWT bien formado y la llamada de prueba responde 2xx
- **THEN** el token se guarda localmente y el usuario avanza a la app

#### Scenario: JWT inválido o rechazado
- **WHEN** el token está malformado, expirado según `exp`, o la llamada de prueba responde 401/403
- **THEN** se muestra un mensaje de error claro y se permite reintentar sin perder el progreso del tour

### Requirement: Almacenamiento local y exclusivo del JWT
La aplicación SHALL guardar el JWT únicamente en almacenamiento local del dispositivo y MUST NOT incluirlo en URLs, listas compartidas, backups exportados ni enviarlo a ningún dominio distinto del de la API de CardTrader (o su proxy propio).

#### Scenario: Compartir una trade list
- **WHEN** el usuario genera una URL o export de una lista de intercambio
- **THEN** el contenido generado no contiene el JWT ni derivados de él

### Requirement: Re-autenticación cuando el token deja de funcionar
La aplicación SHALL detectar respuestas 401/403 de la API o la expiración del token y solicitar al usuario un nuevo JWT mediante el mismo flujo de captura, preservando todos los datos locales.

#### Scenario: Token expirado durante el uso
- **WHEN** una llamada a la API devuelve 401 o el `exp` del token ya pasó
- **THEN** se muestra el diálogo de re-introducción del JWT y, tras validar el nuevo token, se reintenta la operación en curso

#### Scenario: Uso offline con token expirado
- **WHEN** el token ha expirado pero el usuario solo consulta datos cacheados
- **THEN** la app funciona en modo lectura con datos locales y solo pide el nuevo JWT al intentar una operación que requiera red

## ADDED Requirements

### Requirement: Emparejar dispositivos con un único QR
La aplicación SHALL permitir emparejar dos dispositivos escaneando un único código QR, generado por el primer dispositivo y leído por el segundo, sin pasos adicionales de intercambio.

#### Scenario: Emparejar un dispositivo nuevo
- **WHEN** el usuario pulsa "Vincular dispositivo" en el primero y escanea el QR resultante desde el segundo
- **THEN** ambos dispositivos quedan emparejados sin ninguna acción adicional

### Requirement: El relay nunca ve datos en claro
Todo dato sincronizado SHALL cifrarse en el dispositivo antes de enviarse, con una clave que solo conocen los dispositivos emparejados (compartida en el propio QR); el servidor de sincronización MUST NOT tener forma de descifrar los datos que almacena.

#### Scenario: Inspección del servidor
- **WHEN** se inspecciona lo que el servidor de sincronización almacena para una sesión
- **THEN** solo hay un identificador aleatorio y bytes cifrados, nada legible sobre la colección del usuario

### Requirement: Sincronización continua sin acción manual
Tras el emparejamiento, la aplicación SHALL sincronizar automáticamente los cambios de colección, wishlist, trade lists y colecciones personalizadas entre dispositivos emparejados, sin requerir que ambos estén abiertos a la vez.

#### Scenario: Cambio reflejado más tarde
- **WHEN** el usuario añade una carta en un dispositivo y más tarde abre el otro dispositivo emparejado
- **THEN** la carta aparece también ahí, sin ninguna acción manual de sincronizar

### Requirement: Reconciliación solo en el primer emparejamiento
Si al emparejar dos dispositivos alguno de los dos ya tenía datos propios, la aplicación SHALL preguntar una única vez si usar los datos de un dispositivo, del otro, o combinar ambos, antes de establecer la sincronización continua. Sincronizaciones posteriores SHALL fusionar automáticamente sin preguntar.

#### Scenario: Emparejar dos dispositivos con datos previos
- **WHEN** se emparejan un móvil con colección propia y un PC con colección propia distinta
- **THEN** se muestra una única pantalla para elegir cómo combinarlas, y no vuelve a preguntarse en sincronizaciones futuras

### Requirement: Fusión sin duplicados
La aplicación SHALL fusionar los cambios sincronizados identificando cada entrada por un identificador estable, de forma que sincronizar repetidamente no genere entradas duplicadas.

#### Scenario: Muchos ciclos de sincronización
- **WHEN** dos dispositivos sincronizan repetidamente a lo largo de varias semanas sin cambios conflictivos
- **THEN** ninguna carta, lista o colección personalizada aparece duplicada por el propio proceso de sincronización

### Requirement: Recuperación automática tras inactividad prolongada
Si una sesión de sincronización caduca en el servidor por inactividad, la aplicación SHALL recuperarla automáticamente en el siguiente uso sin requerir un nuevo emparejamiento por QR.

#### Scenario: Vuelta tras varios meses sin sincronizar
- **WHEN** el usuario no ha abierto ninguno de los dos dispositivos emparejados durante más tiempo del que el servidor conserva la sesión
- **THEN** al abrir cualquiera de los dos, la sincronización se restablece sola, con un aviso informativo si hubo cambios que combinar, sin pedir escanear un QR de nuevo

### Requirement: Desvincular un dispositivo
La aplicación SHALL permitir olvidar explícitamente el emparejamiento de sincronización desde Ajustes, deteniendo la sincronización en ese dispositivo hasta que se vuelva a emparejar.

#### Scenario: Dejar de sincronizar un dispositivo
- **WHEN** el usuario pulsa "Olvidar este dispositivo" en Ajustes
- **THEN** ese dispositivo deja de sincronizar y sus datos locales permanecen intactos, sin afectar a los demás dispositivos emparejados

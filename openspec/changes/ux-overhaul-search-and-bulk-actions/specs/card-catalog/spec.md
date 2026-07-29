## ADDED Requirements

### Requirement: Home del Catálogo orientada a la búsqueda
La home del Catálogo SHALL presentar la búsqueda como elemento protagonista (bloque hero con título y buscador destacado) y el listado de expansiones SHALL mostrar el total de cartas de cada una («N cartas») sin ninguna métrica de completado o faltantes.

#### Scenario: Home sin métricas de completado
- **WHEN** el usuario abre la pestaña Catálogo
- **THEN** ve el buscador destacado y cada expansión muestra su total de cartas, sin «X/Y» ni porcentaje

#### Scenario: Vista de expansión desde Catálogo sin progreso
- **WHEN** el usuario abre una expansión desde Catálogo
- **THEN** no se muestra barra de progreso ni contador de poseídas; abierta desde Colección se conserva el progreso como hasta ahora

### Requirement: Búsqueda y filtro dentro de la vista de expansión
La vista de expansión SHALL ofrecer un buscador de texto y chips de rareza que filtran las cartas de esa expansión en memoria; los chips SHALL mostrar solo rarezas presentes en la lista.

#### Scenario: Filtrar dentro de una expansión
- **WHEN** el usuario escribe «gundam» y selecciona el chip «LR» dentro de una expansión
- **THEN** solo se muestran cartas de esa expansión que cumplen ambos criterios

### Requirement: Enlace a CardTrader desde el detalle de carta
El detalle de carta SHALL incluir un enlace «Ver en CardTrader» que abra `https://www.cardtrader.com/cards/<blueprintId>` en una pestaña nueva, para comprobar precios reales o comprar.

#### Scenario: Abrir la carta en CardTrader
- **WHEN** el usuario pulsa «Ver en CardTrader» en el detalle de una carta
- **THEN** se abre la ficha de esa carta en cardtrader.com en una pestaña nueva

### Requirement: Acciones masivas simétricas de propiedad
La barra de selección masiva SHALL ofrecer «+1 en propiedad» y «−1 de propiedad» en todos los contextos donde exista modo selección. La resta SHALL pedir confirmación con el recuento, decrementar una copia por carta priorizando la entrada Near Mint/en (o la de más copias si no existe), eliminar entradas que lleguen a 0 y omitir cartas sin copias.

#### Scenario: Restar una copia en bloque
- **WHEN** el usuario selecciona 8 cartas (5 con copias, 3 sin) y confirma «−1 de propiedad»
- **THEN** las 5 poseídas pierden una copia cada una, las 3 sin copias quedan intactas y el mensaje indica cuántas se decrementaron

#### Scenario: Cancelar la resta
- **WHEN** el usuario pulsa «−1 de propiedad» pero cancela la confirmación
- **THEN** no se modifica ninguna carta

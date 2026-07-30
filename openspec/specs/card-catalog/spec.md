# card-catalog Specification

## Purpose
Explorar el catálogo completo del Gundam Card Game: búsqueda, filtros de rareza y de propiedad, detalle de carta con precios por idioma, y estado (propiedad/wishlist/intercambio) visible en cada tarjeta.
## Requirements
### Requirement: Descarga del maestro de Gundam TCG desde datos estáticos propios
La aplicación SHALL obtener el catálogo maestro desde los JSON estáticos publicados por `catalog-data-pipeline` (`/data/expansions.json`, `/data/cards/<id>.json`), servidos por el mismo origen y sin autenticación.

#### Scenario: Sincronización inicial del catálogo
- **WHEN** el usuario abre la app por primera vez y no hay catálogo cacheado
- **THEN** la app descarga expansiones y cartas automáticamente mostrando progreso por expansión y guarda todo en caché local, sin pedir ninguna credencial

#### Scenario: Fallo de red durante la sincronización
- **WHEN** una descarga de expansión falla
- **THEN** la app conserva lo ya descargado, marca la expansión como pendiente y permite reintentar solo lo que falta

### Requirement: Caché local del catálogo con refresco bajo demanda
La aplicación SHALL servir el catálogo siempre desde la caché local (IndexedDB) y SHALL ofrecer un refresco manual, además de comprobar en segundo plano (máx. una vez al día) si hay expansiones nuevas.

#### Scenario: Navegación offline del catálogo
- **WHEN** el usuario abre el catálogo sin conexión y existe caché
- **THEN** todas las expansiones y cartas cacheadas se muestran con normalidad

#### Scenario: Nueva expansión publicada
- **WHEN** la comprobación en segundo plano detecta una expansión de Gundam TCG no cacheada
- **THEN** la app lo notifica de forma no intrusiva y ofrece descargarla

### Requirement: Navegación y búsqueda del catálogo
La aplicación SHALL permitir explorar el catálogo por expansión y buscar cartas por nombre, número de coleccionista y rareza, mostrando imagen, nombre, expansión y atributos disponibles de cada carta.

#### Scenario: Búsqueda por nombre
- **WHEN** el usuario escribe al menos 2 caracteres en el buscador
- **THEN** se muestran resultados filtrados de la caché local en menos de 200 ms sobre catálogos de decenas de miles de cartas

#### Scenario: Detalle de carta
- **WHEN** el usuario abre una carta
- **THEN** ve imagen ampliada, datos maestros, su estado en colección/wishlist y acciones rápidas (añadir a colección, wishlist o trade list)

### Requirement: Precios de mercado desde datos estáticos propios
La aplicación SHALL obtener precios desde `/data/prices/<expansionId>.json` bajo demanda, cachearlos con marca de tiempo y mostrar la antigüedad del dato (que refleja cuándo el pipeline de CI generó el snapshot, no el momento exacto de la consulta).

#### Scenario: Consulta de precio de una carta
- **WHEN** el usuario abre el detalle de una carta con conexión
- **THEN** se muestra el precio mínimo/medio del marketplace y se cachea con su fecha de obtención

#### Scenario: Precio cacheado sin conexión
- **WHEN** no hay conexión y existe precio cacheado
- **THEN** se muestra el precio cacheado indicando cuándo se obtuvo

### Requirement: Filtro de catálogo por rareza
La vista de catálogo (búsqueda) SHALL ofrecer chips seleccionables para filtrar por rareza (p. ej. C, U, R, LR, LR+, LR++, SP, P…), calculados dinámicamente a partir de las rarezas presentes en el catálogo sincronizado, combinables entre sí (OR) y con el texto del buscador (AND).

#### Scenario: Ver todas las cartas de una rareza
- **WHEN** el usuario selecciona el chip "LR" sin escribir texto de búsqueda
- **THEN** se muestran todas las cartas del catálogo local con rareza LR, ordenadas por nombre

#### Scenario: Combinar rareza y texto
- **WHEN** el usuario selecciona una rareza y además escribe texto en el buscador
- **THEN** los resultados cumplen ambos criterios

#### Scenario: Combinar varias rarezas
- **WHEN** el usuario selecciona más de un chip de rareza
- **THEN** se muestran las cartas que tengan cualquiera de las rarezas seleccionadas

### Requirement: El catálogo nunca atenúa cartas por falta de posesión
Las cartas mostradas en la vista de catálogo (accedida desde la pestaña Catálogo, no desde Colección) SHALL mostrarse siempre con su aspecto normal, independientemente de si el usuario las posee o no. La atenuación visual de "carta faltante" es exclusiva de las vistas de colección (ver capacidades `collection-management` y `custom-collections`).

#### Scenario: Explorar una expansión desde el catálogo
- **WHEN** el usuario abre una expansión desde la pestaña Catálogo
- **THEN** todas las cartas se muestran con color y opacidad normales, tenga o no copias en su colección

#### Scenario: Volver al catálogo tras ver el detalle de una carta
- **WHEN** el usuario llega al detalle de una carta desde el catálogo y vuelve atrás
- **THEN** la vista de expansión sigue sin atenuar ninguna carta

### Requirement: Volver contextual desde el detalle de carta
El botón «volver» del detalle de carta SHALL devolver al usuario a la vista exacta desde la que llegó (Colección, colección personalizada, wishlist, trade list, búsqueda o expansión de catálogo), conservando su modo y filtros, usando el historial de navegación. Cuando no exista historial dentro de la app (URL directa o recarga), SHALL navegar a la expansión de la carta como destino de respaldo.

#### Scenario: Volver a Colección
- **WHEN** el usuario llega a una carta desde una expansión abierta en modo Colección y pulsa «volver»
- **THEN** regresa a esa expansión en modo Colección (cartas faltantes atenuadas), no en modo catálogo

#### Scenario: Volver a una colección personalizada
- **WHEN** el usuario llega a una carta desde `/collections/:id` y pulsa «volver»
- **THEN** regresa a esa colección personalizada, no a la expansión de la carta

#### Scenario: URL directa sin historial
- **WHEN** el usuario abre `/card/:id` directamente (enlace compartido o recarga) y pulsa «volver»
- **THEN** navega a la expansión de la carta en modo catálogo

### Requirement: Acción masiva de marcar en propiedad en el catálogo
La barra de selección masiva de Catálogo y Expansión SHALL ofrecer, además de «añadir a colección personalizada», la acción «marcar en propiedad»: añadir una copia (Near Mint, en) de cada carta seleccionada a la colección del usuario, fusionando con la entrada existente de esa condición e idioma si ya la hay.

#### Scenario: Marcar en propiedad varias cartas
- **WHEN** el usuario selecciona 12 cartas y pulsa «Marcar en propiedad»
- **THEN** cada una suma +1 copia Near Mint/en en su colección, se muestra confirmación y el modo selección se cierra

#### Scenario: Carta ya poseída
- **WHEN** una de las cartas seleccionadas ya tenía 2 copias Near Mint/en
- **THEN** pasa a tener 3, sin crear una entrada duplicada

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

### Requirement: Precio por idioma en el detalle de carta
El detalle de carta SHALL mostrar el precio mínimo de cada idioma con oferta disponible, además del mínimo global, resaltando el idioma que el usuario posee cuando tenga copias de esa carta. No SHALL mostrar filas para idiomas sin oferta.

#### Scenario: Carta con precios dispares por idioma
- **WHEN** una carta cuesta 100,62 € en inglés y 50,32 € en chino
- **THEN** el detalle muestra ambos precios identificados por idioma, en lugar de un único precio

#### Scenario: Copia poseída en un idioma concreto
- **WHEN** el usuario posee una copia en `jp` de una carta con oferta en `en` y `jp`
- **THEN** la fila de `jp` aparece resaltada

#### Scenario: Sin desglose disponible
- **WHEN** los precios cacheados son anteriores al desglose por idioma
- **THEN** se muestra el precio mínimo global como hasta ahora, sin filas por idioma ni error

### Requirement: Marcador de wishlist en la tarjeta refleja cualquier lista propia
El marcador de "en wishlist" de `CardTile` SHALL activarse si la carta pertenece a cualquiera de las listas de wishlist propias del usuario (ver capacidad `wishlist-lists`), no a una wishlist única.

#### Scenario: Carta deseada en una lista secundaria
- **WHEN** una carta solo está en una lista de wishlist distinta de la primera creada
- **THEN** su marcador de wishlist se muestra activo igualmente en catálogo, expansión, colección personalizada y "todas las cartas"

### Requirement: Selector de lista de wishlist en el detalle de carta
El detalle de carta SHALL ofrecer un selector de lista de wishlist (existente o nueva) en lugar de un interruptor único de "en wishlist / no en wishlist".

#### Scenario: Elegir lista al desear una carta
- **WHEN** el usuario abre el detalle de una carta y no tiene claro en qué lista de wishlist quiere guardarla
- **THEN** puede elegir entre sus listas existentes o crear una nueva sin salir del detalle

### Requirement: Filtro de propiedad de tres estados en catálogo y expansión
El catálogo (resultados de búsqueda) y la vista de expansión SHALL ofrecer un filtro de tres estados — Todas, En propiedad, Faltantes — independiente de si se llegó desde el contexto de colección (`?from=collection`).

#### Scenario: Buscar solo lo que ya tienes desde el catálogo
- **WHEN** el usuario busca un término en el catálogo y selecciona "En propiedad"
- **THEN** solo se muestran los resultados de esa búsqueda que ya posee, aunque no haya entrado desde colección

#### Scenario: Ver faltantes en una expansión sin venir de colección
- **WHEN** el usuario abre una expansión directamente desde el catálogo (no desde colección) y selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa expansión que no posee todavía

#### Scenario: Volver a "Todas"
- **WHEN** el usuario tiene activo el filtro "En propiedad" o "Faltantes" y selecciona "Todas"
- **THEN** se muestran de nuevo todos los resultados sin filtrar por propiedad


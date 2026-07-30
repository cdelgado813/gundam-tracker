# collection-management Specification

## Purpose
Gestionar qué cartas posee el usuario: cantidad, condición e idioma por copia, progreso por expansión, valoración de la colección con precios por idioma, y la vista "todas las cartas".
## Requirements
### Requirement: Añadir y editar cartas de la colección
La aplicación SHALL permitir añadir cualquier carta del catálogo a la colección indicando cantidad, condición (Mint/Near Mint/Excellent/Good/Played/Poor) e idioma, y editar o eliminar esas entradas posteriormente. Una misma carta MAY tener varias entradas con distinta condición/idioma.

#### Scenario: Añadir carta desde el catálogo
- **WHEN** el usuario pulsa "añadir a colección" en una carta y confirma cantidad, condición e idioma
- **THEN** la entrada se guarda localmente y el contador de la carta se actualiza al instante en catálogo y colección

#### Scenario: Incremento rápido
- **WHEN** el usuario usa los botones +/- sobre una carta ya poseída
- **THEN** la cantidad se actualiza sin diálogos adicionales

### Requirement: Vista de colección con progreso por expansión
La aplicación SHALL mostrar la colección agrupada por expansión con el progreso de completado (cartas únicas poseídas / total de la expansión) y totales globales (cartas únicas, copias totales).

#### Scenario: Progreso de expansión
- **WHEN** el usuario abre la vista de colección
- **THEN** cada expansión muestra una barra de progreso con "X/Y únicas (Z%)" y el total global aparece en cabecera

#### Scenario: Filtrar faltantes
- **WHEN** el usuario activa el filtro "faltantes" dentro de una expansión
- **THEN** solo se muestran las cartas de las que posee 0 copias

### Requirement: Valoración estimada de la colección
La aplicación SHALL calcular un valor estimado de la colección multiplicando cantidades por los últimos precios de marketplace cacheados, indicando claramente qué parte de la colección carece de precio.

#### Scenario: Valoración con precios parciales
- **WHEN** solo una parte de las cartas tiene precio cacheado
- **THEN** se muestra el valor estimado junto a un aviso "basado en N de M cartas con precio"

#### Scenario: Actualizar valoración
- **WHEN** el usuario pulsa "actualizar precios" en la vista de colección con conexión
- **THEN** la app refresca los precios de las cartas poseídas por lotes (por expansión) y recalcula el total

### Requirement: La atenuación de cartas faltantes es exclusiva de las vistas de colección
Al navegar a la vista de expansión desde Colección, las cartas que el usuario no posee SHALL mostrarse atenuadas (gris, opacidad reducida), como ya ocurre hoy. Este comportamiento MUST NOT activarse cuando se llega a la misma vista desde el Catálogo (ver capacidad `card-catalog`). Las colecciones personalizadas (ver capacidad `custom-collections`) siguen el mismo criterio: siempre atenúan lo que falta, por vivir dentro de Colección.

#### Scenario: Ver progreso de una expansión desde Colección
- **WHEN** el usuario abre una expansión desde la pestaña Colección
- **THEN** las cartas que no posee aparecen atenuadas y las que sí posee con aspecto normal

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

### Requirement: Agrupación «Todas las cartas» en Colección
La pestaña Colección SHALL ofrecer, antes de las agrupaciones por expansión, una entrada «Todas las cartas» con el total de únicas y copias, que abre una vista con todas las cartas poseídas en un único grid, con búsqueda, filtro de rareza y modo selección como el resto de vistas de colección.

#### Scenario: Ver todas las cartas poseídas
- **WHEN** el usuario abre «Todas las cartas» desde Colección
- **THEN** ve todas sus cartas con contador de copias, ordenadas por número de coleccionista, y puede buscar/filtrar dentro de la lista

#### Scenario: Entrada con totales
- **WHEN** el usuario tiene 120 cartas únicas y 200 copias
- **THEN** la entrada muestra «120 únicas · 200 copias»

### Requirement: Búsqueda y filtro en vistas de colección
Las vistas de colección con grid de cartas (expansión en modo colección, «Todas las cartas» y wishlist) SHALL ofrecer buscador de texto y chips de rareza que filtran la lista en memoria, combinables con los filtros propios de cada vista (p. ej. «solo faltantes»).

#### Scenario: Buscar dentro de la wishlist
- **WHEN** el usuario escribe un nombre en el buscador de la wishlist
- **THEN** la lista se reduce a las cartas deseadas que coinciden

### Requirement: Resta de propiedad en lote como espejo del alta
La operación de resta en lote SHALL ejecutarse en una única transacción y ser el inverso de «+1 en propiedad»: prioriza la entrada Near Mint/en, degrada a la entrada con más copias, elimina entradas a 0 y reporta cuántas cartas se decrementaron.

#### Scenario: Resta que agota una entrada
- **WHEN** una carta seleccionada tiene exactamente 1 copia Near Mint/en y se confirma la resta
- **THEN** la entrada desaparece y la carta vuelve a contar como faltante en las vistas de colección

### Requirement: Progreso global en «Todas las cartas»
La vista «Todas las cartas» y su entrada en Colección SHALL mostrar una barra de progreso con las cartas únicas poseídas sobre el total de cartas del catálogo sincronizado localmente, con el mismo tratamiento visual que las barras de expansión y de colección personalizada. El denominador SHALL ser el catálogo que la app conoce, no un total teórico del juego.

#### Scenario: Progreso coherente dentro y fuera
- **WHEN** el usuario posee 120 cartas únicas de un catálogo sincronizado de 1832
- **THEN** tanto la entrada en Colección como la vista muestran «120/1832» con el mismo porcentaje

#### Scenario: Catálogo parcialmente sincronizado
- **WHEN** faltan expansiones por descargar
- **THEN** el denominador refleja solo lo sincronizado, sin presentar un porcentaje falso sobre un total desconocido

### Requirement: Valoración con el precio del idioma de cada copia
La valoración de la colección SHALL usar, para cada copia poseída, el precio del idioma de esa copia; cuando no exista oferta en ese idioma SHALL caer al precio mínimo global. La interfaz SHALL indicar cuántas copias se valoraron con un precio de otro idioma, además del recuento existente de cartas con precio.

#### Scenario: Copias en idiomas distintos
- **WHEN** el usuario posee una copia en `en` y otra en `zh-CN` de una carta con precios distintos por idioma
- **THEN** cada copia se valora con el precio de su idioma, no ambas con el mínimo global

#### Scenario: Idioma sin oferta
- **WHEN** el usuario posee una copia en `jp` de una carta sin ofertas en japonés
- **THEN** se valora con el mínimo global y la interfaz refleja que esa valoración es aproximada


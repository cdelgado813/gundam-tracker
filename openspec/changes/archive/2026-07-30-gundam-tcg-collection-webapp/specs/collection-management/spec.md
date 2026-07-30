# collection-management

## ADDED Requirements

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

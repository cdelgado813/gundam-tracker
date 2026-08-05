## ADDED Requirements

### Requirement: Preferencia global de modo playset
La aplicación SHALL ofrecer una preferencia global "modo playset", desactivada por defecto, persistida entre sesiones y accesible desde Ajustes. Cuando está activa, cualquier filtro de propiedad de tres estados (Todas/En propiedad/Faltantes) en la app SHALL considerar "en propiedad" solo a partir de 4 copias de una carta, y "faltantes" a cualquier carta con menos de 4 copias. Cuando está desactivada, el comportamiento SHALL ser el existente antes de esta capacidad (≥1 copia = en propiedad).

#### Scenario: Activar el modo playset
- **WHEN** el usuario activa "modo playset" desde Ajustes
- **THEN** la preferencia se guarda y se aplica de inmediato a las vistas con filtro de propiedad, sin recargar la app

#### Scenario: Carta con copias parciales bajo modo playset
- **WHEN** el modo playset está activo y una carta tiene 2 de 4 copias
- **THEN** esa carta cuenta como "faltante" en el filtro de tres estados, no como "en propiedad"

#### Scenario: Carta con playset completo
- **WHEN** el modo playset está activo y una carta tiene 4 o más copias
- **THEN** esa carta cuenta como "en propiedad" en el filtro de tres estados

#### Scenario: Desactivar el modo playset
- **WHEN** el usuario desactiva "modo playset"
- **THEN** el filtro de propiedad vuelve a considerar "en propiedad" cualquier carta con al menos 1 copia

## MODIFIED Requirements

### Requirement: Vista de colección con progreso por expansión
La aplicación SHALL mostrar la colección agrupada por expansión con el progreso de completado (cartas únicas poseídas / total de la expansión) y totales globales (cartas únicas, copias totales). El progreso de completado SHALL seguir contando como "poseída" cualquier carta con al menos 1 copia, independientemente del modo playset (ver «Preferencia global de modo playset»); el filtro "faltantes" dentro de una expansión SHALL respetar el modo playset.

#### Scenario: Progreso de expansión
- **WHEN** el usuario abre la vista de colección
- **THEN** cada expansión muestra una barra de progreso con "X/Y únicas (Z%)" y el total global aparece en cabecera

#### Scenario: Filtrar faltantes sin modo playset
- **WHEN** el usuario activa el filtro "faltantes" dentro de una expansión con el modo playset desactivado
- **THEN** solo se muestran las cartas de las que posee 0 copias

#### Scenario: Filtrar faltantes con modo playset activo
- **WHEN** el usuario activa el filtro "faltantes" dentro de una expansión con el modo playset activado
- **THEN** se muestran las cartas de las que posee menos de 4 copias, incluidas las que tienen entre 1 y 3

## MODIFIED Requirements

### Requirement: Búsqueda y filtro dentro de una colección personalizada
La página de una colección personalizada SHALL ofrecer buscador de texto y chips de rareza que filtran sus cartas en memoria, combinables con un filtro de propiedad de tres estados — Todas, En propiedad, Faltantes — en lugar de un único checkbox "solo faltantes". Este filtro SHALL respetar la preferencia global de modo playset (ver capacidad `collection-management`): con el modo activo, "En propiedad" requiere 4 o más copias y "Faltantes" incluye cualquier carta con menos de 4. El progreso X/Y de la colección personalizada NO cambia con el modo playset: sigue contando como poseída cualquier carta con al menos 1 copia.

#### Scenario: Encontrar una carta en una colección grande
- **WHEN** el usuario escribe parte del nombre en el buscador de su colección personalizada
- **THEN** el grid se reduce a las coincidencias manteniendo el estado de atenuación de faltantes

#### Scenario: Ver solo lo que ya tienes de una colección personalizada
- **WHEN** el usuario abre una colección personalizada y selecciona "En propiedad"
- **THEN** solo se muestran las cartas de esa colección que ya posee

#### Scenario: Ver solo lo que falta (comportamiento previo conservado)
- **WHEN** el usuario selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa colección que aún no posee, igual que el checkbox "solo faltantes" anterior

#### Scenario: Ver todas
- **WHEN** el usuario selecciona "Todas"
- **THEN** se muestran todas las cartas de la colección personalizada, tenidas o no

#### Scenario: Filtro de propiedad con modo playset activo
- **WHEN** el modo playset está activo y el usuario selecciona "En propiedad" dentro de una colección personalizada
- **THEN** solo se muestran las cartas de las que tiene 4 o más copias, y "Faltantes" incluye las que tiene con menos de 4

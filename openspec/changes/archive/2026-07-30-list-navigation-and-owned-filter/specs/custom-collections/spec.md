## MODIFIED Requirements

### Requirement: Búsqueda y filtro dentro de una colección personalizada
La página de una colección personalizada SHALL ofrecer buscador de texto y chips de rareza que filtran sus cartas en memoria, combinables con un filtro de propiedad de tres estados — Todas, En propiedad, Faltantes — en lugar de un único checkbox "solo faltantes".

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

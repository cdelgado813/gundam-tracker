## MODIFIED Requirements

### Requirement: Filtro de propiedad de tres estados en colecciones personalizadas
El detalle de una colección personalizada SHALL ofrecer un filtro de tres estados — Todas, En propiedad, Faltantes — en lugar de un único checkbox "solo faltantes".

#### Scenario: Ver solo lo que ya tienes de una colección personalizada
- **WHEN** el usuario abre una colección personalizada y selecciona "En propiedad"
- **THEN** solo se muestran las cartas de esa colección que ya posee

#### Scenario: Ver solo lo que falta (comportamiento previo conservado)
- **WHEN** el usuario selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa colección que aún no posee, igual que el checkbox "solo faltantes" anterior

#### Scenario: Ver todas
- **WHEN** el usuario selecciona "Todas"
- **THEN** se muestran todas las cartas de la colección personalizada, tenidas o no

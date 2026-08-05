## MODIFIED Requirements

### Requirement: Filtro de propiedad de tres estados en el detalle de una wishlist
El detalle de una lista de wishlist propia SHALL ofrecer un filtro de tres estados — Todas, En propiedad, Faltantes — para distinguir qué cartas deseadas ya se han conseguido. Este filtro SHALL respetar la preferencia global de modo playset (ver capacidad `collection-management`): con el modo activo, "En propiedad" requiere 4 o más copias y "Faltantes" incluye cualquier carta con menos de 4.

#### Scenario: Ver qué deseos ya tienes
- **WHEN** el usuario abre una lista de wishlist y selecciona "En propiedad"
- **THEN** solo se muestran las cartas de esa lista que ya posee en su colección

#### Scenario: Ver qué falta por conseguir
- **WHEN** el usuario selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa lista que todavía no posee

#### Scenario: Wishlist con modo playset activo
- **WHEN** el modo playset está activo y el usuario selecciona "En propiedad" en el detalle de una wishlist
- **THEN** solo se muestran las cartas deseadas de las que ya tiene el playset completo (4 o más copias)

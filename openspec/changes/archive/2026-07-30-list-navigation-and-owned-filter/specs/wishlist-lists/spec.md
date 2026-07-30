## ADDED Requirements

### Requirement: Filtro de propiedad de tres estados en el detalle de una wishlist
El detalle de una lista de wishlist propia SHALL ofrecer un filtro de tres estados — Todas, En propiedad, Faltantes — para distinguir qué cartas deseadas ya se han conseguido.

#### Scenario: Ver qué deseos ya tienes
- **WHEN** el usuario abre una lista de wishlist y selecciona "En propiedad"
- **THEN** solo se muestran las cartas de esa lista que ya posee en su colección

#### Scenario: Ver qué falta por conseguir
- **WHEN** el usuario selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa lista que todavía no posee

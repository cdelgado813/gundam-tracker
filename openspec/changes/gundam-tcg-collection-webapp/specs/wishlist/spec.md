# wishlist

## ADDED Requirements

### Requirement: Gestión de la wishlist
La aplicación SHALL permitir añadir y quitar cartas de una wishlist desde el catálogo, el detalle de carta o la vista de colección, con cantidad deseada opcional (por defecto 1).

#### Scenario: Añadir a wishlist
- **WHEN** el usuario pulsa el icono de wishlist en una carta
- **THEN** la carta se marca como deseada al instante y aparece en la vista de wishlist

#### Scenario: Carta deseada conseguida
- **WHEN** el usuario añade a la colección una carta que estaba en la wishlist
- **THEN** la app le ofrece retirarla de la wishlist (o reducir la cantidad deseada)

### Requirement: Vista de wishlist
La aplicación SHALL mostrar la wishlist con imagen, expansión y último precio cacheado de cada carta, ordenable por nombre, expansión o precio, y con coste total estimado.

#### Scenario: Coste estimado de la wishlist
- **WHEN** el usuario abre la wishlist y hay precios cacheados
- **THEN** se muestra el coste total estimado con el mismo criterio de transparencia que la valoración de colección ("basado en N de M")

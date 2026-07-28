## ADDED Requirements

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

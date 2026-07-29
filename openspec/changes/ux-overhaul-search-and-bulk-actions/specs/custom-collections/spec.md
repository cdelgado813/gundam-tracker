## ADDED Requirements

### Requirement: Barra de selección con jerarquía clara y dos ejes de acciones
La barra del modo selección SHALL mostrar una cabecera con el recuento («N cartas seleccionadas») y el cierre, y debajo una cuadrícula de acciones con icono y etiqueta completa, agrupadas por eje: propiedad («+1 en propiedad», «−1 de propiedad») y colecciones («Añadir a colección» y, solo dentro de una colección personalizada, «Quitar de esta colección»). Las acciones destructivas SHALL pedir confirmación con recuento. La barra MUST NOT cerrarse tras ejecutar una acción.

#### Scenario: Dentro de una colección personalizada
- **WHEN** el usuario activa el modo selección en `/collections/:id`
- **THEN** la barra muestra las cuatro acciones en cuadrícula con etiquetas completas y el recuento en cabecera

#### Scenario: Encadenar acciones
- **WHEN** el usuario marca «+1 en propiedad» y después «Quitar de esta colección» sobre la misma selección
- **THEN** ambas se ejecutan sobre las mismas cartas sin re-seleccionar, cada una con su toast

### Requirement: Búsqueda y filtro dentro de una colección personalizada
La página de una colección personalizada SHALL ofrecer buscador de texto y chips de rareza que filtran sus cartas en memoria, combinables con «solo faltantes».

#### Scenario: Encontrar una carta en una colección grande
- **WHEN** el usuario escribe parte del nombre en el buscador de su colección personalizada
- **THEN** el grid se reduce a las coincidencias manteniendo el estado de atenuación de faltantes

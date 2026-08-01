## MODIFIED Requirements

### Requirement: Crear, editar y eliminar listas de wishlist con tope de 100 unidades
La aplicación SHALL permitir crear listas de wishlist con nombre, añadir cartas con cantidad deseada hasta un máximo de 100 unidades por lista (suma de cantidades), y renombrar o eliminar listas existentes. El renombrado SHALL estar disponible solo para listas propias (`kind: 'own'`); el borrado SHALL estar disponible tanto para listas propias como para listas recibidas de otras personas (`kind: 'received'`).

#### Scenario: Crear una lista
- **WHEN** el usuario crea una lista de wishlist con nombre "Cumpleaños"
- **THEN** la lista queda disponible para añadir cartas, vacía, con tope 100

#### Scenario: Límite alcanzado
- **WHEN** el usuario intenta añadir una carta que haría superar las 100 unidades totales de una lista
- **THEN** la app lo bloquea mostrando cuántas unidades quedan disponibles

#### Scenario: Renombrar una lista propia
- **WHEN** el usuario renombra una de sus listas de wishlist propias
- **THEN** la lista pasa a mostrarse con el nuevo nombre en todas las pantallas

#### Scenario: Eliminar una lista propia
- **WHEN** el usuario elimina una de sus listas de wishlist propias
- **THEN** la lista desaparece y, si hay sincronización entre dispositivos activa, el borrado se propaga a los demás dispositivos

#### Scenario: Eliminar una lista recibida
- **WHEN** el usuario elimina una lista de wishlist que había importado de otra persona
- **THEN** la lista desaparece igual que si fuera propia

## ADDED Requirements

### Requirement: Nombre al crear una lista de wishlist desde los accesos rápidos de colección
Al crear una lista de wishlist nueva desde un acceso rápido en el contexto de colección (barra de selección masiva, selector de lista en el detalle de una carta), la aplicación SHALL pedir el nombre de la lista al usuario en lugar de generarlo automáticamente.

#### Scenario: Crear lista desde la barra de selección masiva
- **WHEN** el usuario, con varias cartas seleccionadas en su colección, elige "nueva lista" en el panel de wishlist
- **THEN** se le pide un nombre antes de crear la lista y asignarle las cartas seleccionadas

#### Scenario: Crear lista desde el detalle de una carta
- **WHEN** el usuario, en el detalle de una carta, elige "nueva lista" en el selector de wishlist
- **THEN** se le pide un nombre antes de crear la lista y añadirle esa carta

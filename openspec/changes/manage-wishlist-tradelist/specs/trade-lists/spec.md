## ADDED Requirements

### Requirement: Renombrar y eliminar listas de intercambio
La aplicación SHALL permitir renombrar listas de intercambio propias (`kind: 'own'`) y eliminar tanto listas propias como listas recibidas de otras personas (`kind: 'received'`).

#### Scenario: Renombrar una lista propia
- **WHEN** el usuario renombra una de sus listas de intercambio propias
- **THEN** la lista pasa a mostrarse con el nuevo nombre en todas las pantallas

#### Scenario: Eliminar una lista propia
- **WHEN** el usuario elimina una de sus listas de intercambio propias
- **THEN** la lista desaparece y, si hay sincronización entre dispositivos activa, el borrado se propaga a los demás dispositivos

#### Scenario: Eliminar una lista recibida
- **WHEN** el usuario elimina una lista de intercambio que había importado de otra persona
- **THEN** la lista desaparece igual que si fuera propia

### Requirement: Nombre al crear una lista de intercambio desde los accesos rápidos de colección
Al crear una lista de intercambio nueva desde un acceso rápido en el contexto de colección (barra de selección masiva, selector de lista en el detalle de una carta), la aplicación SHALL pedir el nombre de la lista al usuario en lugar de generarlo automáticamente.

#### Scenario: Crear lista desde la barra de selección masiva
- **WHEN** el usuario, con varias cartas seleccionadas en su colección, elige "nueva lista" en el panel de intercambio
- **THEN** se le pide un nombre antes de crear la lista y asignarle las cartas seleccionadas

#### Scenario: Crear lista desde el detalle de una carta
- **WHEN** el usuario, en el detalle de una carta, elige "nueva lista" en el selector de intercambio
- **THEN** se le pide un nombre antes de crear la lista y añadirle esa carta

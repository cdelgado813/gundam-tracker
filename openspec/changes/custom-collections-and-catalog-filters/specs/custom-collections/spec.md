## ADDED Requirements

### Requirement: Crear, editar y eliminar colecciones personalizadas
La aplicación SHALL permitir al usuario crear colecciones personalizadas con nombre y color, renombrarlas, cambiar su color y eliminarlas. No hay límite de tamaño ni de número de colecciones.

#### Scenario: Crear una colección
- **WHEN** el usuario crea una colección con nombre "Unit" y un color
- **THEN** la colección aparece disponible para asignar cartas, sin cartas asignadas todavía

#### Scenario: Eliminar una colección
- **WHEN** el usuario elimina una colección
- **THEN** desaparece de Colección y las cartas que tenía asignadas dejan de pertenecer a ella, sin afectar a la colección de cartas del usuario (owned) ni a otras colecciones personalizadas

### Requirement: Asignar cartas a una o varias colecciones
La aplicación SHALL permitir asignar cualquier carta del catálogo a una o varias colecciones personalizadas desde el detalle de la carta, y quitarla de las que ya no correspondan. Una carta MAY pertenecer a varias colecciones a la vez. Asignar una carta a una colección personalizada es independiente de poseerla: sirve para definir qué cartas componen esa colección, se posean ya o no.

#### Scenario: Asignar una carta a una colección existente
- **WHEN** el usuario marca una colección personalizada desde el detalle de una carta
- **THEN** la carta queda asignada de inmediato y cuenta en el total de esa colección

#### Scenario: Crear una colección nueva desde el detalle de carta
- **WHEN** el usuario no tiene la colección deseada y elige "nueva colección" desde el detalle de una carta
- **THEN** puede crearla ahí mismo y la carta actual queda asignada a ella automáticamente

### Requirement: Cada colección personalizada es una colección con progreso propio, no un filtro de catálogo
Una colección personalizada SHALL comportarse como una colección más del usuario (accesible desde Colección, no desde Catálogo): muestra sus propias cartas asignadas con el progreso de cuántas posee frente al total asignado, igual que el progreso por expansión.

#### Scenario: Ver el progreso de una colección personalizada
- **WHEN** el usuario abre una colección personalizada con 10 cartas asignadas, de las que posee 4
- **THEN** ve "4/10 (40%)" y cada carta se muestra atenuada si no la posee, igual que en la vista de expansión de Colección

#### Scenario: Filtrar solo faltantes dentro de una colección personalizada
- **WHEN** el usuario activa "solo faltantes" dentro de una colección personalizada
- **THEN** solo se muestran las cartas asignadas a esa colección que aún no posee

#### Scenario: Colección personalizada listada en Colección
- **WHEN** el usuario tiene al menos una colección personalizada creada
- **THEN** aparece en una sección "Mis colecciones" dentro de la pestaña Colección, con su progreso resumido

### Requirement: Las colecciones personalizadas sobreviven a la resincronización del catálogo
Las asignaciones de cartas a colecciones personalizadas SHALL persistir aunque el catálogo maestro (tabla de cartas) se borre y regenere durante una resincronización, ya que se almacenan en una tabla independiente referenciada por id de carta.

#### Scenario: Resincronizar el catálogo
- **WHEN** el usuario fuerza una resincronización completa del catálogo
- **THEN** las colecciones personalizadas y sus asignaciones no se ven alteradas

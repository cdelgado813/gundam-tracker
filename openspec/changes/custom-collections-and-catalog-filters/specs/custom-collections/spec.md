## ADDED Requirements

### Requirement: Crear, editar y eliminar colecciones personalizadas
La aplicación SHALL permitir al usuario crear colecciones personalizadas con nombre y color, renombrarlas, cambiar su color y eliminarlas. No hay límite de tamaño ni de número de colecciones.

#### Scenario: Crear una colección
- **WHEN** el usuario crea una colección con nombre "Unit" y un color
- **THEN** la colección aparece disponible para asignar cartas y como filtro, sin cartas asignadas todavía

#### Scenario: Eliminar una colección
- **WHEN** el usuario elimina una colección
- **THEN** desaparece de todos los filtros y las cartas que tenía asignadas dejan de pertenecer a ella, sin afectar a la colección de cartas del usuario (owned) ni a otras colecciones personalizadas

### Requirement: Asignar cartas a una o varias colecciones
La aplicación SHALL permitir asignar cualquier carta del catálogo a una o varias colecciones personalizadas desde el detalle de la carta, y quitarla de las que ya no correspondan. Una carta MAY pertenecer a varias colecciones a la vez.

#### Scenario: Asignar una carta a una colección existente
- **WHEN** el usuario marca una colección personalizada desde el detalle de una carta
- **THEN** la carta queda asignada de inmediato y cuenta en el total de esa colección

#### Scenario: Crear una colección nueva desde el detalle de carta
- **WHEN** el usuario no tiene la colección deseada y elige "nueva colección" desde el detalle de una carta
- **THEN** puede crearla ahí mismo y la carta actual queda asignada a ella automáticamente

### Requirement: Filtrar catálogo y colección por colecciones personalizadas
La aplicación SHALL permitir filtrar la vista de catálogo (búsqueda y navegación por expansión) y la vista de colección propia por una o varias colecciones personalizadas (combinación OR entre colecciones seleccionadas), combinable con el texto de búsqueda.

#### Scenario: Filtrar el catálogo por una colección
- **WHEN** el usuario selecciona la colección "Pilotos favoritos" en el catálogo
- **THEN** solo se muestran cartas asignadas a esa colección, respetando también el texto de búsqueda si lo hay

#### Scenario: Combinar varias colecciones
- **WHEN** el usuario selecciona más de una colección personalizada como filtro
- **THEN** se muestran las cartas que pertenezcan a cualquiera de las colecciones seleccionadas

### Requirement: Las colecciones personalizadas sobreviven a la resincronización del catálogo
Las asignaciones de cartas a colecciones personalizadas SHALL persistir aunque el catálogo maestro (tabla de cartas) se borre y regenere durante una resincronización, ya que se almacenan en una tabla independiente referenciada por id de carta.

#### Scenario: Resincronizar el catálogo
- **WHEN** el usuario fuerza una resincronización completa del catálogo
- **THEN** las colecciones personalizadas y sus asignaciones no se ven alteradas

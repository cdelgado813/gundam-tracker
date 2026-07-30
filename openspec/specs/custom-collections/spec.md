# custom-collections Specification

## Purpose
Agrupaciones personalizadas de cartas (p. ej. un mazo o una lista de favoritas) con su propio progreso, búsqueda, filtro de propiedad y acciones masivas, independientes del catálogo.
## Requirements
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

### Requirement: Modo selección dentro de una colección personalizada
La página de una colección personalizada (`/collections/:id`) SHALL ofrecer el mismo modo selección que las vistas de catálogo (botón «Seleccionar», atajo «Todas/Ninguna», tarjetas como checkbox) con dos acciones masivas: «Marcar en propiedad» (+1 Near Mint/en por carta seleccionada) y «Quitar de esta colección».

#### Scenario: Marcar en propiedad lo conseguido
- **WHEN** el usuario selecciona 5 cartas de su colección personalizada y pulsa «Marcar en propiedad»
- **THEN** cada una suma +1 copia Near Mint/en, el progreso X/Y de la colección se actualiza y el modo selección se cierra

#### Scenario: Quitar cartas de la colección
- **WHEN** el usuario selecciona 3 cartas y pulsa «Quitar de esta colección»
- **THEN** esas cartas dejan de pertenecer a la colección personalizada (su total baja en 3), sin alterar las copias en propiedad, la wishlist ni otras colecciones

#### Scenario: Quitar no borra propiedad
- **WHEN** una carta quitada de la colección personalizada tenía 2 copias en propiedad
- **THEN** sigue teniendo 2 copias en propiedad y sigue apareciendo en la vista de su expansión

### Requirement: Barra de selección con jerarquía clara y acciones en todos los ejes
La barra del modo selección SHALL mostrar una cabecera con el recuento («N cartas seleccionadas») y el cierre, y debajo las acciones agrupadas en secciones etiquetadas por eje, con icono y etiqueta: **Propiedad** («+1 copia», «−1 copia»), **Wishlist** («Añadir», «Quitar»), **Colecciones** («Añadir a colección» y, solo dentro de una colección personalizada, «Quitar de esta») e **Intercambio** («Añadir a lista de trade»). Las acciones destructivas SHALL pedir confirmación con recuento. La barra MUST NOT cerrarse tras ejecutar una acción.

#### Scenario: Dentro de una colección personalizada
- **WHEN** el usuario activa el modo selección en `/collections/:id`
- **THEN** la barra muestra las cuatro secciones con sus acciones y el recuento en cabecera

### Requirement: Añadir y quitar de la wishlist en bloque
La barra de selección SHALL permitir añadir las cartas seleccionadas a la wishlist (omitiendo las que ya estuvieran) y quitarlas de ella (previa confirmación), informando de cuántas se vieron afectadas.

#### Scenario: Añadir con solapamiento
- **WHEN** el usuario añade a wishlist 10 cartas de las que 3 ya estaban
- **THEN** se añaden 7 y el mensaje indica cuántas se añadieron realmente

### Requirement: Añadir a una lista de intercambio en bloque respetando el límite
La barra de selección SHALL permitir añadir las cartas seleccionadas a una lista de intercambio propia (existente o nueva) mediante un selector que muestre la ocupación N/50 de cada lista, respetando el límite duro de 50 unidades e informando de cuántas cartas no cupieron. Las listas llenas SHALL aparecer deshabilitadas y las listas recibidas MUST NOT admitir cartas.

#### Scenario: La selección no cabe entera
- **WHEN** el usuario añade 45 cartas a una lista que ya tiene 10 unidades
- **THEN** entran 40 hasta completar el límite y el mensaje indica que 5 no caben

#### Scenario: Lista llena
- **WHEN** una lista ya tiene 50 unidades
- **THEN** aparece deshabilitada en el selector y no admite más cartas

#### Scenario: Encadenar acciones
- **WHEN** el usuario marca «+1 en propiedad» y después «Quitar de esta colección» sobre la misma selección
- **THEN** ambas se ejecutan sobre las mismas cartas sin re-seleccionar, cada una con su toast

### Requirement: Búsqueda y filtro dentro de una colección personalizada
La página de una colección personalizada SHALL ofrecer buscador de texto y chips de rareza que filtran sus cartas en memoria, combinables con un filtro de propiedad de tres estados — Todas, En propiedad, Faltantes — en lugar de un único checkbox "solo faltantes".

#### Scenario: Encontrar una carta en una colección grande
- **WHEN** el usuario escribe parte del nombre en el buscador de su colección personalizada
- **THEN** el grid se reduce a las coincidencias manteniendo el estado de atenuación de faltantes

#### Scenario: Ver solo lo que ya tienes de una colección personalizada
- **WHEN** el usuario abre una colección personalizada y selecciona "En propiedad"
- **THEN** solo se muestran las cartas de esa colección que ya posee

#### Scenario: Ver solo lo que falta (comportamiento previo conservado)
- **WHEN** el usuario selecciona "Faltantes"
- **THEN** solo se muestran las cartas de esa colección que aún no posee, igual que el checkbox "solo faltantes" anterior

#### Scenario: Ver todas
- **WHEN** el usuario selecciona "Todas"
- **THEN** se muestran todas las cartas de la colección personalizada, tenidas o no


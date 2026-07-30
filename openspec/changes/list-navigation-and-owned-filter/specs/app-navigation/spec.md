## ADDED Requirements

### Requirement: Memoria de scroll al volver atrás
La aplicación SHALL recordar la posición de scroll del contenedor principal de cada ruta visitada y restaurarla al volver a esa ruta mediante navegación hacia atrás del historial, sin restaurarla al entrar a una ruta por primera vez.

#### Scenario: Volver desde el detalle de una carta
- **WHEN** el usuario desplaza el catálogo hacia abajo, abre el detalle de una carta y pulsa "Volver"
- **THEN** el catálogo se muestra en la misma posición de scroll en la que estaba, no arriba del todo

#### Scenario: Entrar a una sección por primera vez
- **WHEN** el usuario pulsa la pestaña "Colección" viniendo de otra sección
- **THEN** la colección se muestra desde arriba, independientemente de la posición de scroll que tuviera la última vez que se visitó

#### Scenario: La posición sobrevive a un refresco de página
- **WHEN** el usuario refresca la página estando desplazado hacia abajo en una lista y vuelve a esa misma ruta en la misma pestaña del navegador
- **THEN** la posición de scroll se restaura

### Requirement: Botones flotantes de ir arriba y abajo
La aplicación SHALL mostrar botones flotantes para saltar al principio o al final del contenido visible, únicamente cuando el contenido no cabe entero en la pantalla.

#### Scenario: Contenido más largo que la pantalla
- **WHEN** el usuario está en una lista con más contenido del que cabe en la pantalla y se ha desplazado hacia abajo
- **THEN** aparece un botón para volver arriba

#### Scenario: Contenido que cabe entero
- **WHEN** el contenido de la pantalla actual cabe entero sin necesidad de scroll
- **THEN** no se muestra ningún botón flotante de desplazamiento

#### Scenario: Saltar al final
- **WHEN** el usuario pulsa el botón de ir abajo
- **THEN** la vista se desplaza hasta el final del contenido visible

### Requirement: Reinicio de sección al repulsar su pestaña activa
Al pulsar la pestaña de navegación de la sección en la que el usuario ya se encuentra, la aplicación SHALL volver a la raíz de esa sección con el scroll en la parte superior y sus filtros de búsqueda reiniciados.

#### Scenario: Repulsar Catálogo estando dentro de una expansión
- **WHEN** el usuario ha entrado a una expansión concreta desde el catálogo y pulsa la pestaña "Catálogo"
- **THEN** vuelve a la portada del catálogo, arriba del todo, sin ningún filtro de búsqueda aplicado

#### Scenario: Repulsar una pestaña distinta a la actual
- **WHEN** el usuario está en Catálogo y pulsa la pestaña "Colección"
- **THEN** navega a Colección con su comportamiento normal, sin ningún reinicio especial adicional

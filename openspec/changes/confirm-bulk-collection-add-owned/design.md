## Context

`BulkAssignBar.tsx` (barra del modo selección) tiene un panel "colecciones" con un flujo de creación rápida: nombre + color + botón "Crear y añadir" (`createAndAssign`), que crea la colección personalizada y le asigna las cartas seleccionadas (`assignCollection` → `addCardsToCollection`). Esto no toca la colección en propiedad del usuario (`db.collection`) en absoluto — son conceptos independientes por diseño (`custom-collections` ya lo documenta: "Asignar una carta a una colección personalizada es independiente de poseerla"). El problema reportado es de descubribilidad de esa independencia, no del modelo en sí.

## Goals / Non-Goals

**Goals:**
- Que al crear una colección personalizada desde la selección múltiple, el usuario vea explícitamente la opción de también marcar esas cartas en propiedad, sin ambigüedad.
- No forzar el paso: quien no quiera marcarlas en propiedad puede omitirlo con una sola acción.

**Non-Goals:**
- No se cambia el flujo de creación de colección desde el detalle de una carta (`CardDetailPage.tsx`, `CustomCollectionsPicker`) — ahí la ambigüedad no aplica igual porque es una carta a la vez y el usuario ya está en su detalle.
- No se cambia el comportamiento de "asignar a colección existente" (ya seleccionada de la lista, sin crear), solo el de creación nueva.

## Decisions

- **Paso adicional en el mismo panel, no un modal separado**: tras pulsar "Crear y añadir" con éxito, el panel de colecciones sustituye su contenido por una confirmación corta ("¿Marcar también estas N cartas como en propiedad?") con dos botones: "Sí, marcar en propiedad" (llama a `addCardsToOwned` con los mismos ids) y "No, solo asignar" (cierra el paso, deja el panel como estaba). Se evita un modal flotante nuevo por consistencia con el resto de la barra (todo ya vive en paneles inline dentro de la hoja inferior).
- **Reutiliza `addCardsToOwned`**: mismo resultado que pulsar "+1 copia" en la sección Propiedad sobre la misma selección; sin lógica nueva de negocio, solo orquestación de UI.
- **Solo aparece tras crear, no tras asignar a una colección ya existente**: asignar a una colección que el usuario ya conoce no tiene la misma ambigüedad reportada (ya sabe qué hace esa colección); limitar el alcance evita interrumpir el flujo rápido habitual.

## Risks / Trade-offs

- [Añadir un paso extra ralentiza el flujo para quien nunca quiere marcar en propiedad] → El paso se puede omitir con un solo clic ("No, solo asignar") y no bloquea seguir usando la barra.

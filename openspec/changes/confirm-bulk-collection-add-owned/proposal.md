## Why

Usuarios reportan que, al crear una colección personalizada desde la selección múltiple (barra de selección masiva sobre varias cartas), no queda claro que esas cartas NO se añaden también a su colección en propiedad — solo quedan asignadas a la nueva colección personalizada. Esperan una confirmación explícita que les deje elegir también sumar una copia de cada carta a su colección.

## What Changes

- Al crear una colección personalizada nueva desde la barra de selección masiva (acción "crear y añadir"), tras crearla y asignarle las cartas seleccionadas, la app SHALL ofrecer la opción de marcar también esas mismas cartas en propiedad (+1 Near Mint/en cada una), dejando claro que son dos acciones independientes.
- La opción se ofrece como un paso adicional dentro del mismo flujo (no un segundo modal separado que interrumpa), con una acción clara para aceptar y otra para omitirla.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `custom-collections`: al crear una colección personalizada desde el modo selección masiva, la app ofrece explícitamente marcar también las cartas seleccionadas en propiedad, en vez de dejar ambiguo que solo quedan asignadas a la colección.

## Impact

- `webapp/src/features/collections/BulkAssignBar.tsx`: función `createAndAssign` (panel de colecciones) — tras `assignCollection`, ofrecer la opción de marcar en propiedad antes de cerrar el panel.
- Reutiliza `addCardsToOwned` (ya existente en `webapp/src/features/collection/data.ts`), sin cambios de modelo de datos.

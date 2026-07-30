## Why

Navegar listas largas (catálogo, expansión, colecciones, wishlist) hoy tiene tres fricciones: no hay forma de filtrar por "lo que ya tienes" fuera del contexto de colección; volver desde el detalle de una carta te devuelve siempre arriba del todo, perdiendo el sitio en el que estabas; y no hay atajo para saltar al principio/final de una lista larga ni para "reiniciar" una sección (p. ej. Catálogo) si has navegado hondo dentro de ella y quieres empezar de cero.

## What Changes

- **Filtro "en propiedad"**: en catálogo (resultados de búsqueda), expansión, colecciones personalizadas y detalle de wishlist, un control de tres estados (Todas / En propiedad / Faltantes) sustituye al actual toggle binario "solo faltantes" (hoy solo visible en el contexto `?from=collection`). Disponible siempre que la vista tenga datos de propiedad, no solo dentro de colección.
- **Memoria de scroll al volver**: la posición de scroll del contenedor de lista se recuerda por ruta; al volver atrás (navegación hacia atrás del historial) se restaura en vez de saltar arriba. Al entrar por primera vez a una pantalla (navegación hacia delante) sigue empezando arriba, como es natural.
- **Botones flotantes de ir arriba / abajo**: aparecen en cualquier pantalla cuyo contenido no cabe en la pantalla, para saltar al principio o al final sin scrollear a mano.
- **Reinicio al repulsar la pestaña activa**: si pulsas la pestaña de la sección en la que ya estás (p. ej. "Catálogo" estando en catálogo o dentro de una expansión), te lleva a la raíz de esa sección con el scroll y los filtros de búsqueda reiniciados — igual que "tocar dos veces el icono de inicio" en apps nativas.

## Capabilities

### New Capabilities
- `app-navigation`: memoria de scroll por ruta al volver, botones flotantes de ir arriba/abajo, y reinicio de sección al repulsar su pestaña activa.

### Modified Capabilities
- `card-catalog`: el filtro binario "solo faltantes" se generaliza a un filtro de tres estados (Todas/En propiedad/Faltantes) disponible en catálogo y expansión sin depender del contexto `?from=collection`.
- `custom-collections`: `CustomCollectionDetailPage` adopta el mismo filtro de tres estados en vez de su checkbox "solo faltantes" actual.
- `wishlist-lists`: `WishlistListDetailPage` gana el mismo filtro de tres estados para distinguir qué deseos ya posees.

## Impact

- `webapp/src/App.tsx`: contenedor de scroll (`main`) instrumentado con memoria de posición por ruta, botones flotantes globales, y lógica de reinicio en los `NavLink` de pestañas.
- Nuevo `webapp/src/lib/useScrollRestoration.ts` (o similar): hook de memoria de scroll basado en `sessionStorage` + tipo de navegación del router.
- Nuevo componente compartido `webapp/src/ui/OwnershipFilter.tsx`: control de tres estados reutilizado en las vistas afectadas.
- `webapp/src/features/catalog/CatalogPage.tsx`, `ExpansionPage.tsx`, `webapp/src/features/collections/CustomCollectionDetailPage.tsx`, `webapp/src/features/wishlist/WishlistListDetailPage.tsx`: adoptan `OwnershipFilter` en lugar de su filtro de propiedad actual (o lo añaden por primera vez).
- Nuevas claves de traducción (en/es/ca) para los tres estados del filtro y los botones flotantes.
- Sin cambios en el pipeline de datos, en Dexie ni en el backend (no hay backend).

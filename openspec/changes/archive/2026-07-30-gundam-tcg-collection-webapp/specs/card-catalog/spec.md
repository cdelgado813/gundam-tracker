# card-catalog

## ADDED Requirements

### Requirement: Descarga del maestro de Gundam TCG desde datos estáticos propios
La aplicación SHALL obtener el catálogo maestro desde los JSON estáticos publicados por `catalog-data-pipeline` (`/data/expansions.json`, `/data/cards/<id>.json`), servidos por el mismo origen y sin autenticación.

#### Scenario: Sincronización inicial del catálogo
- **WHEN** el usuario abre la app por primera vez y no hay catálogo cacheado
- **THEN** la app descarga expansiones y cartas automáticamente mostrando progreso por expansión y guarda todo en caché local, sin pedir ninguna credencial

#### Scenario: Fallo de red durante la sincronización
- **WHEN** una descarga de expansión falla
- **THEN** la app conserva lo ya descargado, marca la expansión como pendiente y permite reintentar solo lo que falta

### Requirement: Caché local del catálogo con refresco bajo demanda
La aplicación SHALL servir el catálogo siempre desde la caché local (IndexedDB) y SHALL ofrecer un refresco manual, además de comprobar en segundo plano (máx. una vez al día) si hay expansiones nuevas.

#### Scenario: Navegación offline del catálogo
- **WHEN** el usuario abre el catálogo sin conexión y existe caché
- **THEN** todas las expansiones y cartas cacheadas se muestran con normalidad

#### Scenario: Nueva expansión publicada
- **WHEN** la comprobación en segundo plano detecta una expansión de Gundam TCG no cacheada
- **THEN** la app lo notifica de forma no intrusiva y ofrece descargarla

### Requirement: Navegación y búsqueda del catálogo
La aplicación SHALL permitir explorar el catálogo por expansión y buscar cartas por nombre, número de coleccionista y rareza, mostrando imagen, nombre, expansión y atributos disponibles de cada carta.

#### Scenario: Búsqueda por nombre
- **WHEN** el usuario escribe al menos 2 caracteres en el buscador
- **THEN** se muestran resultados filtrados de la caché local en menos de 200 ms sobre catálogos de decenas de miles de cartas

#### Scenario: Detalle de carta
- **WHEN** el usuario abre una carta
- **THEN** ve imagen ampliada, datos maestros, su estado en colección/wishlist y acciones rápidas (añadir a colección, wishlist o trade list)

### Requirement: Precios de mercado desde datos estáticos propios
La aplicación SHALL obtener precios desde `/data/prices/<expansionId>.json` bajo demanda, cachearlos con marca de tiempo y mostrar la antigüedad del dato (que refleja cuándo el pipeline de CI generó el snapshot, no el momento exacto de la consulta).

#### Scenario: Consulta de precio de una carta
- **WHEN** el usuario abre el detalle de una carta con conexión
- **THEN** se muestra el precio mínimo/medio del marketplace y se cachea con su fecha de obtención

#### Scenario: Precio cacheado sin conexión
- **WHEN** no hay conexión y existe precio cacheado
- **THEN** se muestra el precio cacheado indicando cuándo se obtuvo

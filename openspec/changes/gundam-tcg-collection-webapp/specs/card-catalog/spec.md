# card-catalog

## ADDED Requirements

### Requirement: Descarga del maestro de Gundam TCG desde CardTrader
La aplicación SHALL obtener el catálogo maestro desde la API de CardTrader v2: identificar el juego Gundam TCG vía `GET /api/v2/games`, listar sus expansiones vía `GET /api/v2/expansions` (filtrando por `game_id`) y descargar las cartas de cada expansión vía `GET /api/v2/blueprints/export?expansion_id=<id>`.

#### Scenario: Sincronización inicial del catálogo
- **WHEN** el usuario completa el onboarding y no hay catálogo cacheado
- **THEN** la app descarga juego, expansiones y blueprints de Gundam TCG mostrando progreso por expansión y guarda todo en caché local

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

### Requirement: Precios de mercado bajo demanda
La aplicación SHALL obtener precios desde `GET /api/v2/marketplace/products?blueprint_id=<id>` (o por `expansion_id`) solo bajo demanda, cachearlos con marca de tiempo y mostrar la antigüedad del dato.

#### Scenario: Consulta de precio de una carta
- **WHEN** el usuario abre el detalle de una carta con conexión
- **THEN** se muestra el precio mínimo/medio del marketplace y se cachea con su fecha de obtención

#### Scenario: Precio cacheado sin conexión
- **WHEN** no hay conexión y existe precio cacheado
- **THEN** se muestra el precio cacheado indicando cuándo se obtuvo

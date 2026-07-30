# catalog-data-pipeline Specification

## Purpose
Cómo llegan el catálogo y los precios a la app: sincronización periódica en CI desde CardTrader, publicada como JSON estático junto con el sitio, sin backend propio ni credenciales en el navegador.
## Requirements
### Requirement: Sincronización del catálogo en CI sin exponer credenciales
El proyecto SHALL sincronizar el catálogo y los precios de Gundam TCG mediante un script (`scripts/sync-catalog.mjs`) ejecutado en un workflow de GitHub Actions, autenticado con el token del propietario almacenado como secret de repositorio (`CARDTRADER_JWT`). El token MUST NOT llegar nunca al bundle de la webapp ni a ninguna petición hecha desde el navegador.

#### Scenario: Ejecución programada
- **WHEN** se cumple el cron diario configurado en `sync-catalog.yml`
- **THEN** el workflow descarga expansiones, cartas y precios de Gundam desde CardTrader usando el secret, y publica el resultado como JSON en `webapp/public/data/`

#### Scenario: Ejecución manual
- **WHEN** un mantenedor dispara el workflow manualmente (`workflow_dispatch`)
- **THEN** se repite la misma sincronización sin esperar al cron

### Requirement: Publicación como datos estáticos versionados
El pipeline SHALL escribir `expansions.json`, `cards/<expansionId>.json`, `prices/<expansionId>.json` y `meta.json` (con fecha de generación y totales) dentro de `webapp/public/data/`, y SHALL commitear los cambios a `main` para que el despliegue existente a GitHub Pages los publique junto con el resto del sitio.

#### Scenario: Cambios detectados
- **WHEN** el catálogo descargado difiere del ya commiteado
- **THEN** el workflow crea un commit y hace push a `main`, disparando el workflow de deploy existente

#### Scenario: Sin cambios
- **WHEN** los datos descargados son idénticos a los ya publicados
- **THEN** el workflow no crea ningún commit vacío

### Requirement: La webapp consume solo datos propios, sin autenticarse
La webapp SHALL leer el catálogo y los precios exclusivamente desde `/data/*.json` (mismo origen), sin realizar ninguna llamada autenticada a `api.cardtrader.com` desde el navegador, y sin solicitar ninguna credencial al usuario.

#### Scenario: Primera visita
- **WHEN** un visitante abre la app por primera vez, sin haber configurado nada
- **THEN** el catálogo se descarga y funciona igual para cualquier visitante, sin pantalla de login ni token

#### Scenario: Expansión no exportada por falta de cartas sueltas
- **WHEN** una expansión de CardTrader no contiene ningún blueprint de tipo carta suelta (p. ej. solo sealed)
- **THEN** el pipeline la omite de `expansions.json` y no genera ficheros de cartas/precios para ella

### Requirement: Desglose de precios por idioma de carta
El pipeline de sincronización SHALL publicar, para cada carta, el precio mínimo y el número de ofertas de cada idioma presente (`en`, `jp`, `zh-CN`) en un campo `byLanguage`, además del mínimo global existente. El campo SHALL ser aditivo: los ficheros publicados MUST seguir conteniendo `minCents` para no romper clientes con versiones anteriores cacheadas en el service worker.

#### Scenario: Carta con ofertas en varios idiomas
- **WHEN** una carta tiene ofertas en inglés y en chino
- **THEN** su entrada de precio incluye el mínimo de cada idioma junto al mínimo global

#### Scenario: Carta con ofertas en un solo idioma
- **WHEN** una carta solo tiene ofertas en inglés
- **THEN** `byLanguage` contiene únicamente la entrada de inglés, sin claves inventadas para los demás

#### Scenario: Cliente con versión anterior
- **WHEN** un navegador con la app cacheada de antes del cambio lee los datos nuevos
- **THEN** sigue funcionando leyendo `minCents`, ignorando el campo que no conoce


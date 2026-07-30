# catalog-data-pipeline

Sustituye a la capacidad `jwt-onboarding` del diseño original (ver design.md D3): en vez de pedir un
JWT a cada visitante, el catálogo y los precios se publican como datos estáticos generados por CI.

## ADDED Requirements

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

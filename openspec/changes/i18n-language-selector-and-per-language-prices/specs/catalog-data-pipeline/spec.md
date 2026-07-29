## ADDED Requirements

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

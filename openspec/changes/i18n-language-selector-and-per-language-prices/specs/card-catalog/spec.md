## ADDED Requirements

### Requirement: Precio por idioma en el detalle de carta
El detalle de carta SHALL mostrar el precio mínimo de cada idioma con oferta disponible, además del mínimo global, resaltando el idioma que el usuario posee cuando tenga copias de esa carta. No SHALL mostrar filas para idiomas sin oferta.

#### Scenario: Carta con precios dispares por idioma
- **WHEN** una carta cuesta 100,62 € en inglés y 50,32 € en chino
- **THEN** el detalle muestra ambos precios identificados por idioma, en lugar de un único precio

#### Scenario: Copia poseída en un idioma concreto
- **WHEN** el usuario posee una copia en `jp` de una carta con oferta en `en` y `jp`
- **THEN** la fila de `jp` aparece resaltada

#### Scenario: Sin desglose disponible
- **WHEN** los precios cacheados son anteriores al desglose por idioma
- **THEN** se muestra el precio mínimo global como hasta ahora, sin filas por idioma ni error

## MODIFIED Requirements

### Requirement: Creación de listas de intercambio con límite de 50 cartas
La aplicación SHALL permitir crear listas de intercambio con nombre, compuestas por cartas (con cantidad y condición opcional) que el usuario posee, y MUST impedir que una lista supere 100 cartas (sumando cantidades).

#### Scenario: Límite de 100 alcanzado
- **WHEN** el usuario intenta añadir una carta que haría superar las 100 unidades totales
- **THEN** la app lo bloquea mostrando cuántas unidades quedan disponibles

#### Scenario: Añadir desde la colección
- **WHEN** el usuario pulsa "añadir a trade list" en una carta de su colección
- **THEN** puede elegir la lista destino (o crear una nueva) sin salir del contexto

## ADDED Requirements

### Requirement: Codec de compartición común para trade lists y wishlist
El formato de payload compartido SHALL incluir un campo que distinga si la lista es de intercambio o de wishlist, de forma que ambas capacidades reutilicen la misma lógica de compresión/codificación sin duplicarla. Los enlaces de trade list compartidos antes de esta capacidad MUST seguir funcionando, interpretándose como listas de intercambio cuando el payload no incluya ese campo.

#### Scenario: Enlace antiguo sigue funcionando
- **WHEN** alguien abre un enlace de trade list generado por una versión anterior de la app (sin el campo de tipo)
- **THEN** la app lo interpreta correctamente como una lista de intercambio

#### Scenario: Enlace nuevo distingue el tipo
- **WHEN** la app genera un enlace nuevo para una trade list o para una wishlist
- **THEN** el payload indica explícitamente de qué tipo es, y el importador dirige al flujo correcto sin ambigüedad

# trade-lists Specification

## Purpose
Listas de intercambio con nombre y tope de unidades, compartibles por enlace/QR/fichero sin servidor propio, con importación que resalta coincidencias con la wishlist propia.
## Requirements
### Requirement: Creación de listas de intercambio con límite de 100 cartas
La aplicación SHALL permitir crear listas de intercambio con nombre, compuestas por cartas (con cantidad y condición opcional) que el usuario posee, y MUST impedir que una lista supere 100 cartas (sumando cantidades).

#### Scenario: Límite de 100 alcanzado
- **WHEN** el usuario intenta añadir una carta que haría superar las 100 unidades totales
- **THEN** la app lo bloquea mostrando cuántas unidades quedan disponibles

#### Scenario: Añadir desde la colección
- **WHEN** el usuario pulsa "añadir a trade list" en una carta de su colección
- **THEN** puede elegir la lista destino (o crear una nueva) sin salir del contexto

### Requirement: Compartición sin servidor
La aplicación SHALL serializar la lista (ids de blueprint, cantidades, condiciones, nombre de lista y alias opcional del autor) en formato comprimido y codificado dentro del fragmento (`#`) de una URL de la propia app, y SHALL ofrecer además QR generado localmente y export a fichero. El contenido compartido MUST NOT incluir el JWT ni datos de otras listas.

#### Scenario: Generar enlace
- **WHEN** el usuario pulsa "compartir" en una lista
- **THEN** obtiene una URL autocontenida (y su QR) copiable al portapapeles, sin que se haya realizado ninguna llamada a servidores propios

#### Scenario: Lista demasiado grande para URL
- **WHEN** la serialización comprimida excede el tamaño práctico de una URL (~2000 caracteres)
- **THEN** la app ofrece automáticamente el export a fichero o QR multiparte como alternativa

### Requirement: Importación de listas compartidas
La aplicación SHALL abrir URLs/ficheros/QR de listas compartidas, mostrar las cartas resolviéndolas contra el catálogo local y permitir guardar la lista como "recibida", marcando qué cartas de la lista coinciden con la wishlist propia.

#### Scenario: Abrir enlace recibido
- **WHEN** un usuario con la app abre una URL de lista compartida
- **THEN** ve la lista con imágenes y nombres resueltos del catálogo, con las coincidencias de su wishlist destacadas

#### Scenario: Catálogo sin sincronizar
- **WHEN** el receptor aún no tiene cacheada alguna expansión referenciada
- **THEN** la app muestra las cartas pendientes con su id y ofrece sincronizar la expansión que falta

### Requirement: Codec de compartición común para trade lists y wishlist
El formato de payload compartido SHALL incluir un campo que distinga si la lista es de intercambio o de wishlist, de forma que ambas capacidades reutilicen la misma lógica de compresión/codificación sin duplicarla. Los enlaces de trade list compartidos antes de esta capacidad MUST seguir funcionando, interpretándose como listas de intercambio cuando el payload no incluya ese campo.

#### Scenario: Enlace antiguo sigue funcionando
- **WHEN** alguien abre un enlace de trade list generado por una versión anterior de la app (sin el campo de tipo)
- **THEN** la app lo interpreta correctamente como una lista de intercambio

#### Scenario: Enlace nuevo distingue el tipo
- **WHEN** la app genera un enlace nuevo para una trade list o para una wishlist
- **THEN** el payload indica explícitamente de qué tipo es, y el importador dirige al flujo correcto sin ambigüedad


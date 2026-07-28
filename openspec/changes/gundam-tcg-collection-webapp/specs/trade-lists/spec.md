# trade-lists

## ADDED Requirements

### Requirement: Creación de listas de intercambio con límite de 50 cartas
La aplicación SHALL permitir crear listas de intercambio con nombre, compuestas por cartas (con cantidad y condición opcional) que el usuario posee, y MUST impedir que una lista supere 50 cartas (sumando cantidades).

#### Scenario: Límite de 50 alcanzado
- **WHEN** el usuario intenta añadir una carta que haría superar las 50 unidades totales
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

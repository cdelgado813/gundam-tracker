## ADDED Requirements

### Requirement: Progreso global en «Todas las cartas»
La vista «Todas las cartas» y su entrada en Colección SHALL mostrar una barra de progreso con las cartas únicas poseídas sobre el total de cartas del catálogo sincronizado localmente, con el mismo tratamiento visual que las barras de expansión y de colección personalizada. El denominador SHALL ser el catálogo que la app conoce, no un total teórico del juego.

#### Scenario: Progreso coherente dentro y fuera
- **WHEN** el usuario posee 120 cartas únicas de un catálogo sincronizado de 1832
- **THEN** tanto la entrada en Colección como la vista muestran «120/1832» con el mismo porcentaje

#### Scenario: Catálogo parcialmente sincronizado
- **WHEN** faltan expansiones por descargar
- **THEN** el denominador refleja solo lo sincronizado, sin presentar un porcentaje falso sobre un total desconocido

### Requirement: Valoración con el precio del idioma de cada copia
La valoración de la colección SHALL usar, para cada copia poseída, el precio del idioma de esa copia; cuando no exista oferta en ese idioma SHALL caer al precio mínimo global. La interfaz SHALL indicar cuántas copias se valoraron con un precio de otro idioma, además del recuento existente de cartas con precio.

#### Scenario: Copias en idiomas distintos
- **WHEN** el usuario posee una copia en `en` y otra en `zh-CN` de una carta con precios distintos por idioma
- **THEN** cada copia se valora con el precio de su idioma, no ambas con el mínimo global

#### Scenario: Idioma sin oferta
- **WHEN** el usuario posee una copia en `jp` de una carta sin ofertas en japonés
- **THEN** se valora con el mínimo global y la interfaz refleja que esa valoración es aproximada

## ADDED Requirements

### Requirement: README describe el proyecto para dos públicos
El repositorio SHALL tener un `README.md` en la raíz que explique qué es Gundam Tracker, enlace a la app en producción, describa el stack técnico y la arquitectura sin backend, y explique cómo correr el proyecto en local.

#### Scenario: Visitante que solo quiere usar la app
- **WHEN** alguien llega al repositorio desde el enlace del `/about` de la app
- **THEN** encuentra en el README qué es el proyecto y el enlace directo a `gundam.poordevelopers.com`, sin tener que leer código

#### Scenario: Visitante técnico
- **WHEN** un desarrollador quiere entender cómo está construido o correrlo en local
- **THEN** el README documenta el stack (Vite/React/TypeScript/Tailwind/Dexie), el pipeline de datos (CardTrader → CI → JSON estático) y los pasos para levantar el entorno de desarrollo

### Requirement: Licencia explícita
El repositorio SHALL incluir un archivo `LICENSE` en la raíz con una licencia de código abierto reconocida.

#### Scenario: Alguien quiere reutilizar el código
- **WHEN** un desarrollador externo consulta los términos de uso del código
- **THEN** encuentra un `LICENSE` (MIT) en la raíz del repositorio, sin ambigüedad

### Requirement: Metadatos del repositorio en GitHub
El repositorio SHALL tener configurados en GitHub una descripción corta, la URL de la app como `homepage`, y topics que lo describan.

#### Scenario: Repositorio listado en búsquedas o el perfil de GitHub
- **WHEN** alguien ve el repositorio listado en el perfil de GitHub o en resultados de búsqueda
- **THEN** ve una descripción, un enlace a la app funcionando, y topics relevantes, no campos vacíos

### Requirement: Releases versionados con notas legibles
El repositorio SHALL publicar releases de GitHub etiquetados con versión semántica, con notas que resuman las capacidades incluidas de forma legible, no un volcado crudo de commits.

#### Scenario: Primer release
- **WHEN** se publica el primer release del proyecto
- **THEN** queda etiquetado `v1.0.0` con notas agrupadas por área (catálogo, colección, wishlist, trades, i18n, PWA) que reflejan las capacidades reales de la app en ese momento

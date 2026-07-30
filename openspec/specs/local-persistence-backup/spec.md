# local-persistence-backup Specification

## Purpose
Cómo se guardan los datos del usuario: todo vive en IndexedDB del dispositivo (sin cuentas ni servidor propio), con copias de seguridad automáticas y exportación/importación manual.
## Requirements
### Requirement: Persistencia local primero
La aplicación SHALL almacenar todos los datos del usuario (colección, wishlist, trade lists, preferencias) y el catálogo cacheado en IndexedDB, y SHALL solicitar almacenamiento persistente al navegador (`navigator.storage.persist()`) para minimizar el riesgo de borrado automático.

#### Scenario: Escritura inmediata
- **WHEN** el usuario realiza cualquier cambio (añadir carta, editar lista)
- **THEN** el cambio queda persistido en IndexedDB antes de confirmarse visualmente, sin necesidad de acción de guardado

#### Scenario: Funcionamiento offline completo
- **WHEN** el usuario abre la app sin conexión
- **THEN** colección, wishlist, trade lists y catálogo cacheado están disponibles y son editables

### Requirement: Copias de seguridad automáticas
La aplicación SHALL generar automáticamente una copia de seguridad de los datos de usuario (excluyendo el JWT y el catálogo maestro) tras cambios relevantes, conservando un histórico rotativo de al menos las 5 últimas copias en almacenamiento local, y MAY escribirlas además en una carpeta elegida por el usuario mediante File System Access API cuando esté disponible.

#### Scenario: Backup automático tras cambios
- **WHEN** el usuario ha realizado cambios y transcurre el intervalo de auto-backup (o cierra la pestaña)
- **THEN** se guarda una nueva copia con marca de tiempo y se elimina la más antigua si se supera el límite del histórico

#### Scenario: Carpeta de backups configurada
- **WHEN** el usuario ha concedido acceso a una carpeta local para backups
- **THEN** cada backup automático se escribe también como fichero JSON con nombre fechado en esa carpeta

### Requirement: Export e import manual
La aplicación SHALL permitir exportar en cualquier momento un fichero JSON versionado con todos los datos de usuario e importarlo en otro dispositivo/navegador, con vista previa y opción de fusionar o reemplazar.

#### Scenario: Restauración en dispositivo nuevo
- **WHEN** el usuario importa un backup válido en una instalación limpia
- **THEN** la app muestra un resumen (nº de cartas, listas, fecha del backup) y, al confirmar, restaura todos los datos

#### Scenario: Backup corrupto o de versión incompatible
- **WHEN** el fichero importado no valida contra el esquema
- **THEN** la app rechaza la importación con un mensaje claro y no altera los datos existentes


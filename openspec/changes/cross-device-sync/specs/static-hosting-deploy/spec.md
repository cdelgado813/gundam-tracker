## ADDED Requirements

### Requirement: Componente de sincronización desplegado de forma independiente
El servidor de sincronización (relay ciego) SHALL desplegarse como un componente independiente del sitio estático, sin alterar el hosting ni el proceso de despliegue de la aplicación principal.

#### Scenario: Fallo o caída del servicio de sincronización
- **WHEN** el servidor de sincronización no está disponible
- **THEN** el resto de la aplicación (catálogo, colección, wishlist, trades) sigue funcionando con normalidad

### Requirement: Desarrollo y prueba local antes de desplegar
El componente de sincronización SHALL poder desarrollarse y probarse íntegramente en local, sin depender de ninguna cuenta ni recurso real de la plataforma de despliegue, antes de publicarse.

#### Scenario: Probar el flujo completo sin tocar producción
- **WHEN** se está desarrollando una mejora del componente de sincronización
- **THEN** todo el ciclo (emparejar, sincronizar, fusionar) se puede ejecutar y verificar en local, sin afectar a usuarios reales

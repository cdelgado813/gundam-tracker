## Why

Los usuarios piden poder usar Gundam Tracker en el móvil y en el PC con una única fuente de verdad: hoy cada dispositivo tiene su propia base de datos local aislada (por diseño, sin cuentas ni servidor), así que un cambio en uno nunca llega al otro. Se evaluaron varias opciones a coste $0 (transferencia P2P por WebRTC, integración con Google Drive) y se descartaron por no dar sincronización continua real o por depender de una plataforma concreta; la elegida — un relay ciego en Cloudflare Workers + KV — da sincronización de verdad sin romper la promesa central de la app ("sin cuentas, tus datos no salen de tu control"), porque el relay nunca ve los datos en claro.

## What Changes

- **Emparejar dispositivos por QR**: el primer dispositivo genera un ID de sincronización y una clave de cifrado (aleatorios, solo en el cliente) y los muestra como QR; el segundo los escanea. Un único QR, sin ida y vuelta.
- **Sincronización automática y continua** vía un Worker de Cloudflare que solo almacena blobs cifrados en KV, indexados por el ID de sincronización — nunca ve datos en claro, nunca expone un listado de sesiones.
- **Cifrado de extremo a extremo** (WebCrypto, AES-GCM) con la clave compartida por QR; el Worker es una pieza "ciega" de infraestructura, no un backend con acceso a los datos.
- **TTL auto-renovable en KV**: las sesiones inactivas caducan solas (limpieza automática, acota el abuso del endpoint público); el emparejamiento en sí vive en cada dispositivo y sobrevive a esa caducidad — resincronizar tras un hueco largo no exige un QR nuevo.
- **Reconciliación inicial** (merge/reemplazar/usar este dispositivo) solo la primera vez que dos dispositivos con datos previos se emparejan, reutilizando el patrón visual ya existente en Ajustes para restaurar backups. Sincronizaciones posteriores fusionan solas, sin preguntar.
- **Fusión sin duplicados de verdad**: a diferencia de la fusión actual de importar backup (que simplemente añade filas y puede duplicar), la sincronización identifica cada fila por un UUID estable generado en el dispositivo de origen, así que fusionar repetidamente (como pasa constantemente con sync) no acumula duplicados.
- **"Olvidar este dispositivo"** en Ajustes: desvincula explícitamente, borra el emparejamiento local.
- **Probable en local antes de desplegar nada**: el Worker se desarrolla y prueba con `wrangler dev` (Worker + KV completamente emulados en local, sin tocar ninguna cuenta ni recurso real de Cloudflare) antes de publicarlo.

## Capabilities

### New Capabilities
- `cross-device-sync`: emparejamiento por QR, sincronización continua cifrada vía relay ciego, reconciliación inicial, fusión sin duplicados, desvinculación.

### Modified Capabilities
- `local-persistence-backup`: se matiza que los datos pueden salir del dispositivo de forma opcional y cifrada si el usuario activa la sincronización — la promesa de "nunca sale de tu dispositivo" pasa a ser "nunca sale sin cifrar, y nunca a un servidor que pueda leerlo".
- `static-hosting-deploy`: se añade un segundo componente desplegable (el Worker de Cloudflare), independiente del sitio estático en GitHub Pages, con su propio flujo de desarrollo/prueba local.

## Impact

- Nuevo directorio `sync-worker/` en la raíz del repo: el Worker de Cloudflare (TypeScript, `wrangler`), con su propio `package.json`/`wrangler.toml`, independiente de `webapp/`.
- `webapp/src/lib/db.ts`: nueva versión de esquema Dexie añadiendo un `uuid` estable a las tablas sincronizadas (`collection`, `wishlistLists`, `tradeLists`, `customCollections`), generado en creación; migración que rellena `uuid` en filas existentes.
- Nuevo `webapp/src/features/sync/`: emparejamiento (generar/leer QR), cifrado (WebCrypto), cliente HTTP contra el Worker, lógica de fusión por UUID, integración con el ciclo de vida de la app (push al detectar cambios, pull periódico).
- `webapp/src/features/backup/SettingsPage.tsx`: nueva sección "Sincronizar entre dispositivos" (emparejar, estado, olvidar dispositivo).
- Variable de entorno para la URL del Worker (local en desarrollo vía `wrangler dev`, la del despliegue real en producción) — sin credenciales ni secretos en el cliente.
- Sin cambios en el pipeline de datos de CI, en el hosting del sitio estático (GitHub Pages), ni en ninguna capacidad existente de catálogo/colección/wishlist/trades más allá de dar a sus tablas un identificador estable.

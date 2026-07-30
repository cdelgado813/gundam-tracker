## 1. Worker (Cloudflare, desarrollado y probado en local)

- [x] 1.1 Nuevo proyecto `sync-worker/`: `wrangler.toml`, `package.json`, TypeScript, binding a un namespace KV
- [x] 1.2 `PUT /sync/:id`: guarda `{iv, ciphertext}` en KV bajo `:id`, con `expirationTtl` (renovado en cada escritura), rechaza payloads por encima del límite de tamaño
- [x] 1.3 `GET /sync/:id`: devuelve `{iv, ciphertext}` o 404 si no existe/caducó
- [x] 1.4 Sin ningún endpoint de listado; CORS restringido al origen de la app
- [x] 1.5 Verificar con `wrangler dev` (KV emulada en local, sin cuenta real de Cloudflare): escribir, leer, caducar por tamaño excesivo, comprobar TTL (comprobación de expiración real por tiempo, con TTL corto, se deja para 6.2 junto a la prueba end-to-end)

## 2. Esquema Dexie: identificador estable por fila

- [x] 2.1 `lib/db.ts`: nueva versión de esquema añadiendo `uuid` (`crypto.randomUUID()`) a `collection`, `wishlistLists`, `tradeLists`, `customCollections`; `upgrade()` que rellena `uuid` en filas existentes
- [x] 2.2 Verificar la migración con datos sintéticos (tablas vacías y con datos previos) contra IndexedDB antes de dar por buena

## 3. Emparejamiento por QR

- [x] 3.1 `features/sync/pairing.ts`: generar `syncId` (128 bits) + clave AES-256 (WebCrypto), codificar como QR; decodificar el QR leído
- [x] 3.2 UI de emparejamiento: mostrar QR (dispositivo origen) y escanear QR con la cámara (dispositivo destino)
- [x] 3.3 Persistir `{syncId, key}` en `db.settings` tras emparejar

## 4. Cliente de sincronización

- [x] 4.1 `features/sync/crypto.ts`: cifrar/descifrar el payload con AES-GCM y la clave emparejada
- [x] 4.2 `features/sync/client.ts`: `push()` (cifra y hace `PUT`), `pull()` (hace `GET` y descifra); apunta a la URL del Worker local en desarrollo (`import.meta.env.DEV`) y a la de producción en build
- [x] 4.3 `features/sync/merge.ts`: fusión por `uuid` + `updatedAt`, independiente de `restoreBackup()` existente
- [x] 4.4 Disparo de `push` al detectar cambios (mismo patrón `markDirty()`/debounce que el auto-backup) y `pull` periódico (mismo patrón que la comprobación de actualizaciones del service worker: al cargar y cada 30 min/cambio de foco)
- [x] 4.5 Manejo de `pull` con 404 (sesión caducada): recrear el blob desde el estado local, sin pedir un QR nuevo; aviso no bloqueante si el hueco fue largo

## 5. Interfaz en Ajustes

- [x] 5.1 Sección "Sincronizar entre dispositivos": estado (vinculado/no), botón "Vincular dispositivo", botón "Olvidar este dispositivo"
- [x] 5.2 Pantalla de reconciliación inicial (usar este dispositivo / usar el otro / combinar), reutilizando el patrón visual del diálogo de restaurar backup ya existente
- [x] 5.3 Traducciones nuevas (en/es/ca) para toda la sección y la pantalla de reconciliación

## 6. Verificación end-to-end en local antes de desplegar

- [x] 6.1 Con el Worker corriendo en local (`wrangler dev`) y dos instancias de la webapp (dos pestañas/perfiles con IndexedDB independiente), verificar: emparejar por QR, sincronizar un cambio de una a otra, reconciliación inicial con datos previos en ambas, varios ciclos de sync sin duplicados (verificado con dos bases Dexie independientes contra el Worker local real)
- [x] 6.2 Simular caducidad de TTL en local (TTL corto en `wrangler dev`) y verificar que se recupera sin pedir un QR nuevo (verificado con el TTL mínimo real de KV, 60s, esperando de verdad a que caducara — no simulado)

## 7. Despliegue

- [x] 7.1 Crear el namespace KV real y `wrangler deploy` del Worker a `*.workers.dev` (desplegado en `gundam-tracker-sync.cdelgado813.workers.dev`, verificado PUT/GET/CORS en producción)
- [x] 7.2 Build de producción de la webapp apuntando a la URL real del Worker desplegado (URL confirmada incrustada en el bundle)
- [x] 7.3 Build limpio, smoke test del preview, commit y push a `main`
- [x] 7.4 Verificación en producción con dos dispositivos reales (simulados con dos sesiones independientes contra el sitio y el Worker reales desplegados: emparejar, sincronizar, fusionar sin duplicados — y comprobado en el propio `gundam.poordevelopers.com` que "Vincular dispositivo" genera un QR real llamando al Worker de producción)

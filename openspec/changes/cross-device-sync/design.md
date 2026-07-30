## Context

Gundam Tracker no tiene backend: todos los datos de usuario viven en Dexie/IndexedDB, por dispositivo, sin cuentas. Ese es el pilar de identidad del proyecto (repetido en `/about`, en el README, en la política implícita de privacidad) y no se quiere romper solo para resolver sync. Se exploraron tres caminos antes de llegar aquí (ver conversación previa, resumido para que quede constancia en el propio cambio):

1. **Transferencia P2P por WebRTC con doble QR**: sin servidor en absoluto, pero solo sincroniza en el instante exacto en que ambos dispositivos están abiertos a la vez — no es "una fuente de verdad", es "a veces coincide". Descartado como solución de sync continua (podría revisitarse como mecanismo de *transferencia puntual* si algún día hiciera falta, pero no resuelve lo que se pide).
2. **Google Drive `appDataFolder`**: sync real y gratis, pero introduce una dependencia de plataforma (cuenta de Google) y fricción de verificación de OAuth. Funciona igual en iOS y Android (no es un problema de iOS, a diferencia de iCloud), pero ata el proyecto a un proveedor externo con su propia política de cambios.
3. **Relay ciego propio (Cloudflare Worker + KV)** — el elegido: la única opción que da sync continua real, funciona igual en cualquier dispositivo/navegador, y no ata a los usuarios a ninguna cuenta de terceros. El coste es mantener una pieza mínima de infraestructura propia, aunque gratuita y sin acceso a datos en claro.

## Goals / Non-Goals

**Goals:**
- Sincronización continua de verdad: un cambio en un dispositivo llega al otro sin acción manual, incluso si no coinciden abiertos a la vez.
- El relay (Worker + KV) nunca ve datos en claro — cifrado de extremo a extremo con una clave que nunca sale de los dispositivos emparejados.
- Coste $0 de forma sostenida: límites explícitos (TTL, tamaño, sin endpoint de listado) para que el peor caso de abuso sea degradación temporal, nunca factura.
- Emparejar es un único escaneo de QR, no una negociación de varios pasos.
- Todo el flujo — Worker, KV, cifrado, fusión — se puede desarrollar y probar en local (`wrangler dev`) sin tocar la app en producción ni ninguna cuenta real de Cloudflare.
- La fusión automática y repetida (propia de sync) no debe acumular duplicados, a diferencia de la fusión actual de "importar backup" (que si vale para una acción manual ocasional).

**Non-Goals:**
- No es sincronización en tiempo real tipo "ves el cursor del otro dispositivo": es *eventual*, con un retardo de segundos a minutos.
- No se resuelven conflictos campo a campo con precisión de CRDT — la estrategia es "gana la fila completa más reciente por `updatedAt`", suficiente para una app de colección personal, no para edición simultánea intensiva.
- No se sustituye la copia de seguridad local/exportación manual ya existentes: la sincronización es una capa opcional adicional, no un reemplazo.
- No se compra dominio ni se monta un backend de cuentas: el Worker vive en el subdominio gratuito `*.workers.dev`.

## Decisions

### D1: Payload del QR — un único escaneo, no una negociación

El dispositivo que inicia el emparejamiento genera `syncId` (128 bits aleatorios) y `key` (clave AES-256 aleatoria, vía `crypto.subtle.generateKey`), los serializa en un JSON corto (`{v:1, syncId, key}`, `key` exportada como raw bytes en base64url) y los muestra como QR. El segundo dispositivo escanea, decodifica, y ya tiene todo lo necesario para sincronizar — sin respuesta que enviar de vuelta. Cabe de sobra en un único QR (unas pocas decenas de bytes, nada que ver con el tamaño de una oferta SDP de WebRTC).

**Alternativa descartada**: reutilizar el codec de compartición de listas (`lib/shareCodec.ts`) con `fflate`. Se descarta por innecesario — el payload es tan pequeño que comprimirlo no aporta nada; un codec dedicado y más simple (`features/sync/pairing.ts`) es más claro.

### D2: Cifrado de extremo a extremo, el Worker es ciego por diseño

Antes de subir cualquier payload, el cliente lo cifra con AES-GCM (IV aleatorio por escritura) usando `key`. El Worker solo ve `{syncId, iv, ciphertext}` y hace `PUT`/`GET` sobre KV con `syncId` como clave — no tiene ni necesita la clave de descifrado. Esto es lo que hace seguro exponer el endpoint públicamente: aunque alguien más encuentre o adivine un `syncId` (128 bits, inviable por fuerza bruta), obtiene bytes cifrados inútiles sin la clave del QR.

### D3: Límites duros en el Worker para acotar el abuso a "degradación", nunca a coste

- **Sin endpoint de listado**: el Worker solo expone `PUT /sync/:id` y `GET /sync/:id`, nunca "dame todos los IDs".
- **Límite de tamaño** por escritura (p. ej. 2 MB, generoso para cualquier colección real, muy por debajo del límite de valor de KV).
- **TTL renovable**: cada `PUT` fija `expirationTtl` (p. ej. 90 días) sobre esa clave; una sesión activa nunca caduca porque cada sync la renueva. Una sesión abandonada se autodestruye sola — limpieza sin mantenimiento.
- Al estar en el plan gratuito de Cloudflare (Workers/KV), agotar la cuota diaria hace que el Worker deje de responder hasta el día siguiente — nunca genera cargo, porque no hay plan de pago activado.

### D4: El emparejamiento vive en el dispositivo, no en el servidor

Cada dispositivo guarda `{syncId, key}` en `db.settings` tras escanear el QR — de forma permanente, independiente de si el blob en KV caduca. Si el blob caducó por inactividad, el próximo dispositivo que sincronice simplemente no encuentra nada bajo `syncId` y **recrea el blob con su estado actual**, sin pedir un QR nuevo ni preguntar nada al usuario (el otro dispositivo, al sincronizar después, se fusiona contra ese blob recién recreado con la fusión automática de D6). Si el hueco fue largo, se muestra un aviso no bloqueante ("se combinaron cambios tras un tiempo sin sincronizar"), nunca una pregunta.

### D5: Reconciliación inicial — solo la primera vez, reutilizando la UI ya existente

Justo después del primer emparejamiento, si alguno de los dos dispositivos ya tenía datos, se muestra la misma pantalla que ya existe para restaurar un backup (`SettingsPage.tsx`, con el recuento "N entradas de colección, N listas..."), con tres opciones: usar los datos de este dispositivo, usar los del otro, o combinar. Esta pregunta **no vuelve a aparecer** en sincronizaciones posteriores, incluidas las que recrean el blob tras un TTL caducado (ver D4) — para esas, la fusión es siempre automática.

### D6: Fusión por UUID estable, no por "añadir todo"

La fusión de importar backup existente (`restoreBackup(payload, 'merge')`) simplemente hace `bulkAdd` de las filas entrantes — vale para una acción manual y ocasional, pero repetida automáticamente (como hace sync en cada ciclo) acumularía duplicados sin parar. Para sync:
- Las 4 tablas sincronizadas (`collection`, `wishlistLists`, `tradeLists`, `customCollections`) ganan un campo `uuid` (`crypto.randomUUID()`) generado al crear la fila — nueva versión de esquema Dexie con migración que rellena `uuid` en filas existentes.
- Fusionar dos payloads es: por cada fila entrante, si existe una fila local con el mismo `uuid`, se queda la de `updatedAt` más reciente; si no existe, se añade. Determinístico, sin duplicar, sin necesidad de tocar `restoreBackup()` (que sigue igual para importar/exportar manual, sin `uuid` en su contrato público del fichero exportado — el campo es interno, no hace falta exponerlo en el JSON descargable).

**Riesgo aceptado**: si el mismo cartón físico se registra de forma independiente en dos dispositivos *antes* de sincronizar nunca entre ellos, la fusión los ve como dos hechos distintos (no hay UUID compartido) y aparecen como dos filas — la pantalla de reconciliación inicial (D5) es precisamente el momento en que el usuario puede detectarlo y elegir "reemplazar" en vez de "combinar" si prefiere partir de una sola fuente limpia.

### D7: Desarrollo y prueba en local, sin tocar producción

El Worker es un proyecto independiente (`sync-worker/`) con su propio `wrangler.toml`. `wrangler dev` levanta el Worker **y** una KV completamente emulada en local (SQLite bajo el capó, vía Miniflare) — no requiere ninguna cuenta de Cloudflare, namespace real, ni conexión a producción. La webapp apunta a `http://localhost:8787` en desarrollo (`import.meta.env.DEV`) y a la URL real del Worker desplegado (`*.workers.dev`, pública pero no sensible — el secreto está en `syncId`/`key`, nunca en la URL del Worker) en producción, sin ninguna credencial de por medio en ningún caso. Todo el ciclo — emparejar, sincronizar, fusionar, dejar caducar el TTL y ver que se recupera solo — se puede verificar así antes de tocar `wrangler deploy`.

## Risks / Trade-offs

- [Riesgo] Alguien usa el Worker público como almacenamiento gratuito arbitrario → Mitigación: sin listado, TTL auto-limpiante, límite de tamaño; el peor caso es agotar la cuota diaria gratuita un rato, nunca coste ni acceso a datos reales (van cifrados).
- [Riesgo] Migración de esquema Dexie (añadir `uuid`) sobre bases de datos ya en producción → Mitigación: mismo patrón ya usado varias veces en este proyecto (`upgrade()` con backfill), se verifica con datos sintéticos antes de dar por buena, igual que la migración de wishlist a listas.
- [Trade-off] La fusión es "gana el más reciente por fila completa", no por campo → aceptado: para una colección de cartas (cantidad, condición, idioma) es infrecuente y de bajo impacto editar el mismo registro en dos sitios a la vez sin sincronizar entre medias.
- [Trade-off] Cloudflare Workers/KV es una dependencia de plataforma nueva para el proyecto (hasta ahora solo GitHub Pages + CardTrader) → aceptado: es la única de las tres opciones evaluadas que da sync continua real sin atar a los usuarios a una cuenta de terceros.

## Migration Plan

1. Construir y probar el Worker enteramente en local (`wrangler dev`), sin desplegar nada.
2. Migración de esquema Dexie (`uuid` en las 4 tablas) verificada con datos sintéticos, igual que migraciones anteriores del proyecto.
3. Construir el flujo de emparejamiento/sync en la webapp apuntando al Worker local; probar el ciclo completo (emparejar, editar en ambos "dispositivos" simulados, fusionar, forzar caducidad de TTL y comprobar que se recupera sin preguntar) antes de tocar producción.
4. Solo entonces: `wrangler deploy` (namespace KV real, gratuito) y build de producción de la webapp apuntando a la URL desplegada.
5. Sin rollback complejo: si algo falla tras desplegar, basta con no activar la sincronización desde la UI (queda como función opcional, apagada por defecto) — el resto de la app sigue funcionando exactamente igual que hoy.

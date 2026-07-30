/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** URL del Worker de sincronización desplegado (spec cross-device-sync); vacío = sync no configurada. */
  readonly VITE_SYNC_WORKER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

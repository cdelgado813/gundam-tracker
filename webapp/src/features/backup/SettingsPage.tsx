import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { CodeXml, Folder, RotateCw, Upload, Download as DownloadIcon } from 'lucide-react'
import { db } from '@/lib/db'
import { fetchStaticMeta, type StaticMeta } from '@/lib/staticData'
import { useCatalogSync } from '@/features/catalog/sync'
import {
  buildBackupPayload,
  chooseBackupFolder,
  folderBackupSupported,
  getBackupFolderName,
  parseBackup,
  restoreBackup,
  type BackupPayload,
} from './backup'
import { Button } from '@/ui/Button'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-hangar-800 bg-hangar-900 p-4">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-hangar-300">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function SettingsPage() {
  const sync = useCatalogSync()
  const backups = useLiveQuery(() => db.backups.orderBy('createdAt').reverse().toArray()) ?? []
  const [folderName, setFolderName] = useState<string | null>(null)
  const [meta, setMeta] = useState<StaticMeta | null>(null)
  const [pendingImport, setPendingImport] = useState<BackupPayload | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void getBackupFolderName().then(setFolderName)
    void fetchStaticMeta()
      .then(setMeta)
      .catch(() => setMeta(null))
  }, [])

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2500)
    return () => clearTimeout(t)
  }, [msg])

  const exportNow = async () => {
    const payload = await buildBackupPayload()
    const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gundam-tracker-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const onImportFile = async (file: File) => {
    setImportError(null)
    try {
      setPendingImport(parseBackup(await file.text()))
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Fichero inválido')
    }
  }

  const applyImport = async (mode: 'merge' | 'replace') => {
    if (!pendingImport) return
    await restoreBackup(pendingImport, mode)
    setPendingImport(null)
    setMsg('Datos restaurados')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="font-display text-xl font-bold tracking-widest text-hangar-100">AJUSTES</h1>

      <Section title="Catálogo">
        <p className="text-xs text-hangar-300">
          El catálogo y los precios se publican automáticamente desde CardTrader; nadie necesita
          iniciar sesión para usarlos.
        </p>
        {meta && (
          <p className="mt-1 text-xs text-hangar-300">
            Datos publicados: {new Date(meta.generatedAt).toLocaleString('es-ES')} ·{' '}
            {meta.expansionCount} expansiones · {meta.cardCount} cartas.
          </p>
        )}
        <Button
          variant="secondary"
          className="mt-3 gap-1.5"
          disabled={sync.running}
          onClick={() => sync.run(true)}
        >
          <RotateCw size={14} className={sync.running ? 'animate-spin' : undefined} />
          {sync.running ? `Sincronizando ${sync.done}/${sync.total}…` : 'Re-sincronizar todo'}
        </Button>
      </Section>

      <Section title="Copias de seguridad">
        <p className="text-xs text-hangar-300">
          Se guarda una copia automática de colección, wishlist y listas tras cada cambio (histórico
          de 5). El token nunca se incluye.
        </p>
        {folderBackupSupported() ? (
          <div className="mt-3 flex items-center gap-3">
            <Button
              variant="secondary"
              className="gap-1.5"
              onClick={async () => {
                if (await chooseBackupFolder()) {
                  setFolderName(await getBackupFolderName())
                  setMsg('Carpeta configurada')
                }
              }}
            >
              <Folder size={14} />
              {folderName ? `Carpeta: ${folderName}` : 'Elegir carpeta de backups'}
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-haro-400">
            Tu navegador no permite guardar en carpeta automáticamente: usa el export manual.
          </p>
        )}
        {backups.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {backups.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-xs text-hangar-300">
                <span>{new Date(b.createdAt).toLocaleString('es-ES')}</span>
                <button
                  className="text-federation-400 hover:underline"
                  onClick={() => {
                    try {
                      setPendingImport(parseBackup(b.payload))
                      setImportError(null)
                    } catch (err) {
                      setImportError(err instanceof Error ? err.message : 'Backup corrupto')
                    }
                  }}
                >
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Exportar / importar">
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportNow} className="gap-1.5">
            <DownloadIcon size={14} />
            Exportar JSON
          </Button>
          <Button variant="secondary" onClick={() => fileInput.current?.click()} className="gap-1.5">
            <Upload size={14} />
            Importar JSON
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
        {importError && <p className="mt-2 text-sm text-zeon-400">{importError}</p>}
      </Section>

      <Section title="Proyecto">
        <p className="text-xs text-hangar-300">
          Gundam Tracker es de código abierto: aportaciones e informes de error son bienvenidos.
        </p>
        <Link
          to="/about"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-federation-400 hover:underline"
        >
          <CodeXml size={14} />
          Acerca del proyecto y repositorio
        </Link>
      </Section>

      {pendingImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-hangar-700 bg-hangar-900 p-6">
            <h3 className="font-display text-lg font-bold text-hangar-100">Restaurar datos</h3>
            <p className="mt-2 text-sm text-hangar-300">
              Backup del {new Date(pendingImport.exportedAt).toLocaleString('es-ES')}:
            </p>
            <ul className="mt-2 text-sm text-hangar-100">
              <li>· {pendingImport.collection.length} entradas de colección</li>
              <li>· {pendingImport.wishlist.length} cartas en wishlist</li>
              <li>· {pendingImport.tradeLists.length} listas de trade</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => applyImport('merge')}>Fusionar</Button>
              <Button variant="danger" onClick={() => applyImport('replace')}>
                Reemplazar todo
              </Button>
              <Button variant="ghost" onClick={() => setPendingImport(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-hangar-700 px-4 py-2 text-sm shadow-xl">
          {msg}
        </div>
      )}
    </div>
  )
}

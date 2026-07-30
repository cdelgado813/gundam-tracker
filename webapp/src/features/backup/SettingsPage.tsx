import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { CodeXml, Folder, RotateCw, Upload, Download as DownloadIcon } from 'lucide-react'
import { db } from '@/lib/db'
import { fetchStaticMeta, type StaticMeta } from '@/lib/staticData'
import { useCatalogSync } from '@/features/catalog/sync'
import { CustomCollectionsManager } from '@/features/collections/CustomCollectionsManager'
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
import { DonateButton } from '@/ui/DonateButton'
import { useT, useUiLanguage } from '@/lib/useT'
import { UI_LANGUAGES } from '@/lib/i18n'

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
  const t = useT()
  const language = useUiLanguage((s) => s.language)
  const setLanguage = useUiLanguage((s) => s.setLanguage)
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
    const timer = setTimeout(() => setMsg(null), 2500)
    return () => clearTimeout(timer)
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
      setImportError(err instanceof Error ? err.message : t('settings.invalidFile'))
    }
  }

  const applyImport = async (mode: 'merge' | 'replace') => {
    if (!pendingImport) return
    await restoreBackup(pendingImport, mode)
    setPendingImport(null)
    setMsg(t('settings.restored'))
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="font-display text-xl font-bold tracking-widest text-hangar-100">{t('settings.title')}</h1>

      <Section title={t('settings.language')}>
        <p className="mb-3 text-xs text-hangar-300">{t('settings.languageHint')}</p>
        <div className="flex flex-wrap gap-2">
          {UI_LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                language === code
                  ? 'border-federation-500/50 bg-federation-500/15 text-federation-400'
                  : 'border-hangar-700 text-hangar-300 hover:border-hangar-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('settings.catalog')}>
        <p className="text-xs text-hangar-300">{t('settings.catalogHint')}</p>
        {meta && (
          <p className="mt-1 text-xs text-hangar-300">
            {t('settings.publishedData', {
              date: new Date(meta.generatedAt).toLocaleString(),
              expansions: meta.expansionCount,
              cards: meta.cardCount,
            })}
          </p>
        )}
        <Button
          variant="secondary"
          className="mt-3 gap-1.5"
          disabled={sync.running}
          onClick={() => sync.run(true)}
        >
          <RotateCw size={14} className={sync.running ? 'animate-spin' : undefined} />
          {sync.running
            ? t('settings.syncing', { done: sync.done, total: sync.total })
            : t('settings.resync')}
        </Button>
      </Section>

      <Section title={t('settings.customCollections')}>
        <p className="mb-3 text-xs text-hangar-300">{t('settings.customCollectionsHint')}</p>
        <CustomCollectionsManager />
      </Section>

      <Section title={t('settings.backups')}>
        <p className="text-xs text-hangar-300">{t('settings.backupsHint')}</p>
        {folderBackupSupported() ? (
          <div className="mt-3 flex items-center gap-3">
            <Button
              variant="secondary"
              className="gap-1.5"
              onClick={async () => {
                if (await chooseBackupFolder()) {
                  setFolderName(await getBackupFolderName())
                  setMsg(t('settings.folderConfigured'))
                }
              }}
            >
              <Folder size={14} />
              {folderName ? t('settings.folder', { name: folderName }) : t('settings.chooseFolder')}
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-haro-400">
            {t('settings.noFolderSupport')}
          </p>
        )}
        {backups.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {backups.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-xs text-hangar-300">
                <span>{new Date(b.createdAt).toLocaleString()}</span>
                <button
                  className="text-federation-400 hover:underline"
                  onClick={() => {
                    try {
                      setPendingImport(parseBackup(b.payload))
                      setImportError(null)
                    } catch (err) {
                      setImportError(err instanceof Error ? err.message : t('settings.corruptBackup'))
                    }
                  }}
                >
                  {t('settings.restore')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={t('settings.exportImport')}>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportNow} className="gap-1.5">
            <DownloadIcon size={14} />
            {t('settings.exportJson')}
          </Button>
          <Button variant="secondary" onClick={() => fileInput.current?.click()} className="gap-1.5">
            <Upload size={14} />
            {t('settings.importJson')}
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

      <Section title={t('settings.support')}>
        <p className="mb-3 text-xs text-hangar-300">{t('settings.supportHint')}</p>
        <DonateButton />
      </Section>

      <Section title={t('settings.project')}>
        <p className="text-xs text-hangar-300">{t('settings.projectHint')}</p>
        <Link
          to="/about"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-federation-400 hover:underline"
        >
          <CodeXml size={14} />
          {t('settings.aboutLink')}
        </Link>
      </Section>

      {pendingImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-hangar-700 bg-hangar-900 p-6">
            <h3 className="font-display text-lg font-bold text-hangar-100">{t('settings.restoreTitle')}</h3>
            <p className="mt-2 text-sm text-hangar-300">
              {t('settings.restoreFrom', { date: new Date(pendingImport.exportedAt).toLocaleString() })}
            </p>
            <ul className="mt-2 text-sm text-hangar-100">
              <li>· {t('settings.restoreCollection', { n: pendingImport.collection.length })}</li>
              <li>· {t('settings.restoreWishlist', { n: pendingImport.wishlistLists.length })}</li>
              <li>· {t('settings.restoreTrades', { n: pendingImport.tradeLists.length })}</li>
              <li>· {t('settings.restoreCustom', { n: pendingImport.customCollections.length })}</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => applyImport('merge')}>{t('settings.merge')}</Button>
              <Button variant="danger" onClick={() => applyImport('replace')}>
                {t('settings.replaceAll')}
              </Button>
              <Button variant="ghost" onClick={() => setPendingImport(null)}>
                {t('common.cancel')}
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

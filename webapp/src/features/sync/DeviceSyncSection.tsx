import { useState } from 'react'
import QRCode from 'qrcode'
import { QrCode, ScanLine, Unlink } from 'lucide-react'
import { Button } from '@/ui/Button'
import { QrScanner } from '@/ui/QrScanner'
import { useT } from '@/lib/useT'
import { useDeviceSync } from './useDeviceSync'
import { syncConfigured } from './client'

/** Sección de Ajustes para emparejar/gestionar la sincronización entre dispositivos. */
export function DeviceSyncSection() {
  const t = useT()
  const pairing = useDeviceSync((s) => s.pairing)
  const loaded = useDeviceSync((s) => s.loaded)
  const syncing = useDeviceSync((s) => s.syncing)
  const pendingReconciliation = useDeviceSync((s) => s.pendingReconciliation)
  const startPairing = useDeviceSync((s) => s.startPairing)
  const completePairingFromScan = useDeviceSync((s) => s.completePairingFromScan)
  const resolveReconciliation = useDeviceSync((s) => s.resolveReconciliation)
  const forget = useDeviceSync((s) => s.forget)

  const [mode, setMode] = useState<'idle' | 'showQr' | 'scan'>('idle')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!loaded || !syncConfigured()) return null

  const generate = async () => {
    setError(null)
    const qrText = await startPairing()
    const dataUrl = await QRCode.toDataURL(qrText, { width: 320, margin: 1 })
    setQrDataUrl(dataUrl)
    setMode('showQr')
  }

  const onScanResult = async (text: string) => {
    setMode('idle')
    try {
      await completePairingFromScan(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sync.pairError'))
    }
  }

  if (mode === 'showQr' && qrDataUrl) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-hangar-300">{t('sync.showQrHint')}</p>
        <img src={qrDataUrl} alt={t('sync.qrAlt')} className="w-64 rounded-xl border border-hangar-700" />
        <Button variant="secondary" onClick={() => setMode('idle')}>
          {t('common.close')}
        </Button>
      </div>
    )
  }

  if (mode === 'scan') {
    return <QrScanner onResult={onScanResult} onCancel={() => setMode('idle')} />
  }

  if (pairing) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-newtype-400">{syncing ? t('sync.syncingNow') : t('sync.active')}</p>

        {pendingReconciliation && (
          <div className="rounded-xl border border-haro-400/40 bg-haro-400/5 p-3">
            <p className="mb-3 text-sm text-hangar-100">{t('sync.reconcileHint')}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => resolveReconciliation('local')}>{t('sync.useThisDevice')}</Button>
              <Button variant="secondary" onClick={() => resolveReconciliation('remote')}>
                {t('sync.useOtherDevice')}
              </Button>
              <Button variant="secondary" onClick={() => resolveReconciliation('merge')}>
                {t('sync.combine')}
              </Button>
            </div>
          </div>
        )}

        <Button variant="danger" className="w-fit gap-1.5" onClick={() => void forget()}>
          <Unlink size={14} />
          {t('sync.forget')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-hangar-300">{t('sync.hint')}</p>
      <div className="flex flex-wrap gap-2">
        <Button className="gap-1.5" onClick={() => void generate()}>
          <QrCode size={14} />
          {t('sync.generateQr')}
        </Button>
        <Button variant="secondary" className="gap-1.5" onClick={() => setMode('scan')}>
          <ScanLine size={14} />
          {t('sync.scanQr')}
        </Button>
      </div>
      {error && <p className="text-sm text-zeon-400">{error}</p>}
    </div>
  )
}

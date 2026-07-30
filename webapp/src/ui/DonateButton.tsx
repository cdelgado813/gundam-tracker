import { useT } from '@/lib/useT'

const BMC_URL = 'https://www.buymeacoffee.com/JapaneseWeddingPhotos'

/** Botón oficial de Buy Me a Coffee (asset de marca, sin recolorear). */
export function DonateButton({ className = '' }: { className?: string }) {
  const t = useT()
  return (
    <a
      href={BMC_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-block transition hover:opacity-90 ${className}`}
    >
      <img src="/support/bmc-yellow-button.png" alt={t('support.bmcAlt')} className="h-10 w-auto" />
    </a>
  )
}

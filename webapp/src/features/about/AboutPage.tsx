import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CodeXml,
  ExternalLink,
  HandHeart,
  HardDrive,
  Lock,
  Repeat,
  ScanLine,
} from 'lucide-react'
import { Button } from '@/ui/Button'
import { useT } from '@/lib/useT'
import type { TranslationKey } from '@/lib/i18n'

const REPO_URL = 'https://github.com/cdelgado813/gundam-tracker'
const POORDEVELOPERS_URL = 'https://poordevelopers.com'

const points: { Icon: typeof Lock; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { Icon: Lock, titleKey: 'about.noAccounts', bodyKey: 'about.noAccountsBody' },
  { Icon: HardDrive, titleKey: 'about.local', bodyKey: 'about.localBody' },
  { Icon: Repeat, titleKey: 'about.trades', bodyKey: 'about.tradesBody' },
  { Icon: ScanLine, titleKey: 'about.noServer', bodyKey: 'about.noServerBody' },
]

export function AboutPage() {
  const t = useT()
  return (
    <div className="mx-auto max-w-2xl p-4 pb-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100">
        <ArrowLeft size={14} /> {t('about.backToApp')}
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-hangar-100">
          Gundam Tracker
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-hangar-300">{t('about.intro')}</p>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {points.map(({ Icon, titleKey, bodyKey }) => (
          <div key={titleKey} className="rounded-xl border border-hangar-800 bg-hangar-900 p-4">
            <Icon size={18} className="text-federation-400" strokeWidth={1.75} />
            <h2 className="mt-2 font-display text-sm font-bold text-hangar-100">{t(titleKey)}</h2>
            <p className="mt-1 text-xs leading-relaxed text-hangar-300">{t(bodyKey)}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-hangar-700 bg-hangar-900 p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-hangar-300">
          {t('about.openSource')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-hangar-300">{t('about.openSourceBody')}</p>
        <div className="mt-4">
          <Button
            onClick={() => window.open(REPO_URL, '_blank', 'noopener,noreferrer')}
            className="gap-2"
          >
            <CodeXml size={16} />
            {t('about.viewRepo')}
            <ExternalLink size={14} />
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-hangar-700 bg-hangar-900 p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-hangar-300">
          {t('about.philosophy')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-hangar-300">
          {t('about.philosophyPrefix')}{' '}
          <a
            href={POORDEVELOPERS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-federation-400 underline"
          >
            poordevelopers.com
          </a>
          {t('about.philosophyBody')}
        </p>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => window.open(POORDEVELOPERS_URL, '_blank', 'noopener,noreferrer')}
            className="gap-2"
          >
            <HandHeart size={16} />
            poordevelopers.com
            <ExternalLink size={14} />
          </Button>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-hangar-300">
        {t('about.dataCredit')}{' '}
        <a
          href="https://www.cardtrader.com"
          target="_blank"
          rel="noreferrer"
          className="text-federation-400 underline"
        >
          CardTrader
        </a>
        {t('about.notAffiliated')}
      </p>
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CodeXml,
  ExternalLink,
  HandHeart,
  HardDrive,
  Lock,
} from 'lucide-react'
import { Button } from '@/ui/Button'
import { DonateButton } from '@/ui/DonateButton'
import { useT } from '@/lib/useT'
import type { TranslationKey } from '@/lib/i18n'
import { useWelcomeSeen } from '@/lib/useWelcomeSeen'

const REPO_URL = 'https://github.com/cdelgado813/gundam-tracker'
const POORDEVELOPERS_URL = 'https://poordevelopers.com'
const OPTCG_URL = 'https://optcg-collector.poordevelopers.com'

const tiles: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  {
    titleKey: 'landing.tileCatalog',
    bodyKey: 'landing.tileCatalogBody',
  },
  {
    titleKey: 'landing.tilePrices',
    bodyKey: 'landing.tilePricesBody',
  },
  {
    titleKey: 'landing.tileWishlist',
    bodyKey: 'landing.tileWishlistBody',
  },
  {
    titleKey: 'landing.tileTrade',
    bodyKey: 'landing.tileTradeBody',
  },
]

/**
 * Contenido compartido por la pantalla de bienvenida (primera visita, antes del
 * catálogo) y `/about` (accesible en cualquier momento desde Ajustes). Mismo
 * hero/tiles en ambas; `variant="about"` añade lo que la bienvenida no necesita
 * de entrada — repositorio, filosofía del proyecto, crédito de datos — y cambia
 * el CTA por un enlace de vuelta en vez de "Entrar".
 */
export function WelcomeContent({ variant }: { variant: 'welcome' | 'about' }) {
  const t = useT()
  const markSeen = useWelcomeSeen((s) => s.markSeen)
  const isAbout = variant === 'about'

  return (
    <div className="min-h-full overflow-y-auto bg-hangar-950">
      <header className="border-b border-hangar-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          {isAbout ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-display text-sm font-bold tracking-widest text-hangar-100 hover:text-hangar-300"
            >
              <ArrowLeft size={14} />
              {t('about.backToApp')}
            </Link>
          ) : (
            <span className="font-display text-sm font-bold tracking-widest text-hangar-100">
              GUNDAM TRACKER
            </span>
          )}
          <DonateButton />
        </div>
      </header>

      <main>
        <section className="bg-zeon-500 text-white">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:grid-cols-[1.2fr_0.8fr] sm:items-center sm:py-24">
            <div>
              <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
                {t('landing.title')}
              </h1>
              <p className="mt-5 max-w-md text-lg font-medium leading-relaxed">{t('landing.lead')}</p>
              {!isAbout && (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => void markSeen()}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-display text-lg font-bold text-hangar-950 transition hover:bg-hangar-100 active:scale-[.98]"
                  >
                    {t('landing.enter')}
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
              <p className="mt-4 text-base font-semibold">{t('landing.eyebrow')}</p>
            </div>

            <div aria-hidden className="relative mx-auto h-64 w-full max-w-sm sm:h-80">
              <img
                src="/landing/card-amuro-ray.webp"
                alt=""
                className="absolute left-0 top-10 h-52 w-36 -rotate-[14deg] rounded-lg object-cover sm:h-72 sm:w-48"
              />
              <img
                src="/landing/card-heero-yuy.webp"
                alt=""
                className="absolute right-0 top-4 h-52 w-36 rotate-[10deg] rounded-lg object-cover sm:h-72 sm:w-48"
              />
              <img
                src="/landing/card-marida-cruz.webp"
                alt=""
                className="absolute left-1/2 top-0 h-52 w-36 -translate-x-1/2 -rotate-[2deg] rounded-lg object-cover sm:h-72 sm:w-48"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {tiles.map(({ titleKey, bodyKey }) => (
              <div key={titleKey}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-hangar-100 sm:text-3xl">
                  {t(titleKey)}
                </h2>
                <p className="mt-2 max-w-sm text-base leading-relaxed text-hangar-300">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-hangar-900">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <div className="flex items-start gap-3">
              <Lock size={20} className="mt-1 shrink-0 text-zeon-400" strokeWidth={1.75} />
              <div>
                <h2 className="font-display text-2xl font-bold text-hangar-100 sm:text-3xl">
                  {t('landing.honestTitle')}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-hangar-300">{t('landing.honestBody')}</p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3">
              <HardDrive size={20} className="mt-1 shrink-0 text-zeon-400" strokeWidth={1.75} />
              <p className="max-w-2xl text-base leading-relaxed text-hangar-300">{t('landing.localBody')}</p>
            </div>

            {!isAbout && (
              <div className="mt-10">
                <Button onClick={() => void markSeen()} className="gap-2 !px-7 !py-3.5 !text-lg">
                  {t('landing.enter')}
                  <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="font-display text-xl font-bold text-hangar-100">{t('landing.moreApps')}</h2>
          <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-base font-semibold">
            <li>
              <a href={OPTCG_URL} target="_blank" rel="noreferrer" className="text-federation-400 underline">
                One Piece TCG Collector
              </a>
            </li>
            <li>
              <a href={POORDEVELOPERS_URL} target="_blank" rel="noreferrer" className="text-federation-400 underline">
                poordevelopers.com
              </a>
            </li>
          </ul>
        </section>

        {isAbout && (
          <>
            <section className="mx-auto max-w-5xl px-4 pb-6">
              <div className="rounded-xl border border-hangar-700 bg-hangar-900 p-6">
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
              </div>
            </section>

            <section className="mx-auto max-w-5xl px-4 pb-6">
              <div className="rounded-xl border border-hangar-700 bg-hangar-900 p-6">
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
              </div>
            </section>

            <p className="mx-auto max-w-5xl px-4 pb-16 text-center text-xs text-hangar-300">
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
          </>
        )}
      </main>
    </div>
  )
}

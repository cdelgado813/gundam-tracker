import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CodeXml,
  Coins,
  ExternalLink,
  HandHeart,
  HardDrive,
  Layers,
  Lock,
  Repeat,
  Star,
} from 'lucide-react'
import { Button } from '@/ui/Button'
import { DonateButton } from '@/ui/DonateButton'
import { useT } from '@/lib/useT'
import type { TranslationKey } from '@/lib/i18n'
import { useWelcomeSeen } from '@/lib/useWelcomeSeen'

const REPO_URL = 'https://github.com/cdelgado813/gundam-tracker'
const POORDEVELOPERS_URL = 'https://poordevelopers.com'

const tiles: { Icon: typeof Layers; titleKey: TranslationKey; bodyKey: TranslationKey; accent: string }[] = [
  {
    Icon: Layers,
    titleKey: 'landing.tileCatalog',
    bodyKey: 'landing.tileCatalogBody',
    accent: 'text-federation-400',
  },
  {
    Icon: Coins,
    titleKey: 'landing.tilePrices',
    bodyKey: 'landing.tilePricesBody',
    accent: 'text-haro-400',
  },
  {
    Icon: Star,
    titleKey: 'landing.tileWishlist',
    bodyKey: 'landing.tileWishlistBody',
    accent: 'text-haro-400',
  },
  {
    Icon: Repeat,
    titleKey: 'landing.tileTrade',
    bodyKey: 'landing.tileTradeBody',
    accent: 'text-newtype-400',
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
        <section className="mx-auto grid max-w-5xl gap-10 px-4 pb-12 pt-10 sm:grid-cols-2 sm:items-center sm:pt-16">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-zeon-400">
              {t('landing.eyebrow')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-wide text-hangar-100 sm:text-4xl">
              {t('landing.title')}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-hangar-300">{t('landing.lead')}</p>
            {!isAbout && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={() => void markSeen()} className="gap-2">
                  {t('landing.enter')}
                  <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </div>

          <div aria-hidden className="relative mx-auto h-56 w-full max-w-sm sm:h-72">
            <img
              src="/landing/card-amuro-ray.webp"
              alt=""
              className="absolute left-0 top-8 h-48 w-32 -rotate-[14deg] rounded-lg border border-hangar-700 object-cover shadow-2xl sm:h-64 sm:w-44"
            />
            <img
              src="/landing/card-heero-yuy.webp"
              alt=""
              className="absolute right-0 top-2 h-48 w-32 rotate-[10deg] rounded-lg border border-hangar-700 object-cover shadow-2xl sm:h-64 sm:w-44"
            />
            <img
              src="/landing/card-marida-cruz.webp"
              alt=""
              className="absolute left-1/2 top-0 h-48 w-32 -translate-x-1/2 -rotate-[2deg] rounded-lg border border-hangar-700 object-cover shadow-2xl sm:h-64 sm:w-44"
            />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="grid gap-3 sm:grid-cols-2">
            {tiles.map(({ Icon, titleKey, bodyKey, accent }) => (
              <div key={titleKey} className="rounded-xl border border-hangar-800 bg-hangar-900 p-5">
                <Icon size={20} className={accent} strokeWidth={1.75} />
                <h2 className="mt-3 font-display text-sm font-bold text-hangar-100">{t(titleKey)}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-hangar-300">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="rounded-xl border border-hangar-700 border-l-4 border-l-zeon-500 bg-hangar-900 p-6">
            <div className="flex items-start gap-3">
              <Lock size={18} className="mt-0.5 shrink-0 text-hangar-300" strokeWidth={1.75} />
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-widest text-hangar-300">
                  {t('landing.honestTitle')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-hangar-300">{t('landing.honestBody')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <HardDrive size={18} className="mt-0.5 shrink-0 text-hangar-300" strokeWidth={1.75} />
              <p className="text-sm leading-relaxed text-hangar-300">{t('landing.localBody')}</p>
            </div>
          </div>

          {!isAbout && (
            <div className="mt-8 flex justify-center">
              <Button onClick={() => void markSeen()} className="gap-2">
                {t('landing.enter')}
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
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

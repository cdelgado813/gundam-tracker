import { useEffect, useRef } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, Package, Repeat, Settings, Star } from 'lucide-react'
import { useT, useSyncHtmlLang, useUiLanguage } from '@/lib/useT'
import { useScrollRestoration, clearRememberedScroll } from '@/lib/useScrollRestoration'
import { ScrollEdgeButtons } from '@/ui/ScrollEdgeButtons'
import type { TranslationKey } from '@/lib/i18n'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { ExpansionPage } from '@/features/catalog/ExpansionPage'
import { CardDetailPage } from '@/features/catalog/CardDetailPage'
import { CollectionPage } from '@/features/collection/CollectionPage'
import { AllCardsPage } from '@/features/collection/AllCardsPage'
import { CustomCollectionDetailPage } from '@/features/collections/CustomCollectionDetailPage'
import { WishlistListsPage } from '@/features/wishlist/WishlistListsPage'
import { WishlistListDetailPage } from '@/features/wishlist/WishlistListDetailPage'
import { TradesPage } from '@/features/trades/TradesPage'
import { TradeListPage } from '@/features/trades/TradeListPage'
import { ImportPage } from '@/features/share/ImportPage'
import { SettingsPage } from '@/features/backup/SettingsPage'
import { AboutPage } from '@/features/about/AboutPage'
import { WelcomeBanner } from '@/features/about/WelcomeBanner'
import { installAutoBackup } from '@/features/backup/backup'

installAutoBackup()

const tabs: { to: string; labelKey: TranslationKey; Icon: typeof LayoutGrid; prefixes: string[] }[] = [
  { to: '/', labelKey: 'nav.catalog', Icon: LayoutGrid, prefixes: ['/', '/expansion'] },
  { to: '/collection', labelKey: 'nav.collection', Icon: Package, prefixes: ['/collection', '/collections'] },
  { to: '/wishlist', labelKey: 'nav.wishlist', Icon: Star, prefixes: ['/wishlist'] },
  { to: '/trades', labelKey: 'nav.trades', Icon: Repeat, prefixes: ['/trades'] },
  { to: '/settings', labelKey: 'nav.settings', Icon: Settings, prefixes: ['/settings'] },
]

/** ¿La ruta actual pertenece a la sección de esta pestaña? (design D3) */
function belongsToTab(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function Shell() {
  const t = useT()
  const location = useLocation()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLElement>(null)
  useScrollRestoration(mainRef)

  return (
    <div className="flex h-full flex-col">
      <WelcomeBanner />
      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/expansion/:id" element={<ExpansionPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/all" element={<AllCardsPage />} />
          <Route path="/collections/:id" element={<CustomCollectionDetailPage />} />
          <Route path="/wishlist" element={<WishlistListsPage />} />
          <Route path="/wishlist/:id" element={<WishlistListDetailPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/trades/:id" element={<TradeListPage />} />
          <Route path="/s/:payload" element={<ImportPage />} />
          <Route path="/t/:payload" element={<ImportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <ScrollEdgeButtons scrollRef={mainRef} />
      <nav className="border-t border-hangar-800 bg-hangar-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-xl">
          {tabs.map(({ to, labelKey, Icon, prefixes }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={(e) => {
                // Repulsar la pestaña de la sección en la que ya estás la reinicia
                // (scroll arriba + filtros de esa raíz) en vez de no hacer nada.
                if (belongsToTab(location.pathname, prefixes)) {
                  e.preventDefault()
                  clearRememberedScroll(to)
                  navigate(to, { replace: true })
                  mainRef.current?.scrollTo({ top: 0 })
                }
              }}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-display tracking-wide transition ${
                  isActive ? 'text-zeon-400' : 'text-hangar-300 hover:text-hangar-100'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              {t(labelKey)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function App() {
  const initLanguage = useUiLanguage((s) => s.init)
  useSyncHtmlLang()

  useEffect(() => {
    void initLanguage()
  }, [initLanguage])

  return (
    <HashRouter>
      <Routes>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/*" element={<Shell />} />
      </Routes>
    </HashRouter>
  )
}

export default App

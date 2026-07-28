import { useEffect } from 'react'
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { OnboardingTour } from '@/features/onboarding/OnboardingTour'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { ExpansionPage } from '@/features/catalog/ExpansionPage'
import { CardDetailPage } from '@/features/catalog/CardDetailPage'
import { CollectionPage } from '@/features/collection/CollectionPage'
import { WishlistPage } from '@/features/wishlist/WishlistPage'
import { TradesPage } from '@/features/trades/TradesPage'
import { TradeListPage } from '@/features/trades/TradeListPage'
import { ImportTradePage } from '@/features/trades/ImportTradePage'
import { SettingsPage } from '@/features/backup/SettingsPage'
import { installAutoBackup } from '@/features/backup/backup'

installAutoBackup()
import { ReauthModal } from '@/features/onboarding/ReauthModal'
import { useAuth } from '@/features/onboarding/useAuth'

const tabs = [
  { to: '/', label: 'Catálogo', icon: '🗂️' },
  { to: '/collection', label: 'Colección', icon: '📦' },
  { to: '/wishlist', label: 'Wishlist', icon: '⭐' },
  { to: '/trades', label: 'Trades', icon: '🔁' },
  { to: '/settings', label: 'Ajustes', icon: '⚙️' },
]

function Shell() {
  return (
    <div className="flex h-full flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/expansion/:id" element={<ExpansionPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/trades/:id" element={<TradeListPage />} />
          <Route path="/t/:payload" element={<ImportTradePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <nav className="border-t border-hangar-800 bg-hangar-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-xl">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-display tracking-wide transition ${
                  isActive ? 'text-zeon-400' : 'text-hangar-300 hover:text-hangar-100'
                }`
              }
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function App() {
  const status = useAuth((s) => s.status)
  const init = useAuth((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  if (status === 'loading') return null

  return (
    <HashRouter>
      {status === 'unauthenticated' ? <OnboardingTour /> : <Shell />}
      <ReauthModal />
    </HashRouter>
  )
}

export default App

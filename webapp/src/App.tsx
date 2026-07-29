import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { LayoutGrid, Package, Repeat, Settings, Star } from 'lucide-react'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { ExpansionPage } from '@/features/catalog/ExpansionPage'
import { CardDetailPage } from '@/features/catalog/CardDetailPage'
import { CollectionPage } from '@/features/collection/CollectionPage'
import { AllCardsPage } from '@/features/collection/AllCardsPage'
import { CustomCollectionDetailPage } from '@/features/collections/CustomCollectionDetailPage'
import { WishlistPage } from '@/features/wishlist/WishlistPage'
import { TradesPage } from '@/features/trades/TradesPage'
import { TradeListPage } from '@/features/trades/TradeListPage'
import { ImportTradePage } from '@/features/trades/ImportTradePage'
import { SettingsPage } from '@/features/backup/SettingsPage'
import { AboutPage } from '@/features/about/AboutPage'
import { WelcomeBanner } from '@/features/about/WelcomeBanner'
import { installAutoBackup } from '@/features/backup/backup'

installAutoBackup()

const tabs = [
  { to: '/', label: 'Catálogo', Icon: LayoutGrid },
  { to: '/collection', label: 'Colección', Icon: Package },
  { to: '/wishlist', label: 'Wishlist', Icon: Star },
  { to: '/trades', label: 'Trades', Icon: Repeat },
  { to: '/settings', label: 'Ajustes', Icon: Settings },
]

function Shell() {
  return (
    <div className="flex h-full flex-col">
      <WelcomeBanner />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/expansion/:id" element={<ExpansionPage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/all" element={<AllCardsPage />} />
          <Route path="/collections/:id" element={<CustomCollectionDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/trades/:id" element={<TradeListPage />} />
          <Route path="/t/:payload" element={<ImportTradePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <nav className="border-t border-hangar-800 bg-hangar-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-xl">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-display tracking-wide transition ${
                  isActive ? 'text-zeon-400' : 'text-hangar-300 hover:text-hangar-100'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function App() {
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

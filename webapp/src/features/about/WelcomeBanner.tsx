import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { db } from '@/lib/db'

const SEEN_KEY = 'welcome.seen'

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    void db.settings.get(SEEN_KEY).then((row) => setVisible(!row))
  }, [])

  if (!visible) return null

  const dismiss = () => {
    void db.settings.put({ key: SEEN_KEY, value: true })
    setVisible(false)
  }

  return (
    <div className="flex items-start gap-3 border-b border-hangar-800 bg-hangar-900 px-4 py-3 text-sm text-hangar-300">
      <p className="flex-1">
        Bienvenido a Gundam Tracker. Sin cuentas: tu colección, wishlist y listas de intercambio
        viven solo en este dispositivo.{' '}
        <Link to="/about" className="text-federation-400 underline" onClick={dismiss}>
          Sobre el proyecto (código abierto)
        </Link>
        .
      </p>
      <button
        aria-label="Cerrar aviso"
        onClick={dismiss}
        className="shrink-0 text-hangar-300 hover:text-hangar-100"
      >
        <X size={16} />
      </button>
    </div>
  )
}

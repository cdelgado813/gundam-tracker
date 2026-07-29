import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { db } from '@/lib/db'
import { useT } from '@/lib/useT'

const SEEN_KEY = 'welcome.seen'

export function WelcomeBanner() {
  const t = useT()
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
        {t('welcome.text')}{' '}
        <Link to="/about" className="text-federation-400 underline" onClick={dismiss}>
          {t('welcome.aboutLink')}
        </Link>
      </p>
      <button
        aria-label={t('welcome.dismiss')}
        onClick={dismiss}
        className="shrink-0 text-hangar-300 hover:text-hangar-100"
      >
        <X size={16} />
      </button>
    </div>
  )
}

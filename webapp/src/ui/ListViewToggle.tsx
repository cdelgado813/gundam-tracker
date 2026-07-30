import { LayoutGrid, List } from 'lucide-react'
import { useListViewMode } from '@/lib/useListViewMode'
import { useT } from '@/lib/useT'

/** Segmentado lista/cuadrícula compartido por wishlist y trade lists. */
export function ListViewToggle() {
  const t = useT()
  const mode = useListViewMode((s) => s.mode)
  const setMode = useListViewMode((s) => s.setMode)

  return (
    <div className="inline-flex shrink-0 rounded-xl border border-hangar-700 bg-hangar-900 p-0.5">
      <button
        aria-label={t('common.viewList')}
        onClick={() => void setMode('list')}
        className={`rounded-lg p-1.5 transition ${
          mode === 'list' ? 'bg-hangar-700 text-hangar-100' : 'text-hangar-300 hover:text-hangar-100'
        }`}
      >
        <List size={15} />
      </button>
      <button
        aria-label={t('common.viewGrid')}
        onClick={() => void setMode('grid')}
        className={`rounded-lg p-1.5 transition ${
          mode === 'grid' ? 'bg-hangar-700 text-hangar-100' : 'text-hangar-300 hover:text-hangar-100'
        }`}
      >
        <LayoutGrid size={15} />
      </button>
    </div>
  )
}

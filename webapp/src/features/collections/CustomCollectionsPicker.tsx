import { useState } from 'react'
import { FolderPlus, Plus } from 'lucide-react'
import { CUSTOM_COLLECTION_COLORS, type CustomCollectionColor } from '@/lib/db'
import { Button } from '@/ui/Button'
import { useCardCollectionIds, useCustomCollections } from './hooks'
import { createCustomCollection, toggleCardInCollection } from './data'
import { collectionColorClasses } from './colors'

function ColorPicker({
  value,
  onChange,
}: {
  value: CustomCollectionColor
  onChange: (c: CustomCollectionColor) => void
}) {
  return (
    <div className="flex gap-1.5">
      {CUSTOM_COLLECTION_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          onClick={() => onChange(c)}
          className={`h-5 w-5 rounded-full ${collectionColorClasses[c].dot} ${
            value === c ? 'ring-2 ring-hangar-100 ring-offset-2 ring-offset-hangar-800' : ''
          }`}
        />
      ))}
    </div>
  )
}

/** Chips togglables de colecciones + creación inline, para asignar una carta desde su detalle. */
export function CustomCollectionsPicker({ cardId }: { cardId: number }) {
  const collections = useCustomCollections()
  const memberOf = useCardCollectionIds(cardId)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<CustomCollectionColor>('federation')

  const submitNew = async () => {
    if (!name.trim()) return
    const id = await createCustomCollection(name.trim(), color)
    await toggleCardInCollection(id, cardId)
    setName('')
    setCreating(false)
  }

  return (
    <div className="rounded-xl border border-hangar-800 bg-hangar-900 p-4">
      <h3 className="mb-3 font-display text-sm font-bold text-hangar-100">Colecciones</h3>
      <div className="flex flex-wrap gap-1.5">
        {collections.map((c) => {
          const on = memberOf.has(c.id!)
          const colors = collectionColorClasses[c.color]
          return (
            <button
              key={c.id}
              onClick={() => toggleCardInCollection(c.id!, cardId)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                on
                  ? `${colors.activeBg} ${colors.activeText} ${colors.border}`
                  : 'border-hangar-700 text-hangar-300 hover:border-hangar-600'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
              {c.name}
            </button>
          )
        })}
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-hangar-700 px-2.5 py-1 text-xs text-hangar-300 hover:border-hangar-600 hover:text-hangar-100"
          >
            <Plus size={12} />
            Nueva
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-hangar-700 bg-hangar-800 p-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (p. ej. Unit, Favoritas…)"
            className="rounded-lg border border-hangar-700 bg-hangar-900 px-2.5 py-1.5 text-sm focus:border-federation-400 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <ColorPicker value={color} onChange={setColor} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={submitNew} className="gap-1.5">
                <FolderPlus size={14} />
                Crear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

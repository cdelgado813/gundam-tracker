import { useState } from 'react'
import { FolderPlus, Plus, X } from 'lucide-react'
import { CUSTOM_COLLECTION_COLORS, type CustomCollectionColor } from '@/lib/db'
import { Button } from '@/ui/Button'
import { useCustomCollections } from './hooks'
import { addCardsToCollection, createCustomCollection } from './data'
import { collectionColorClasses } from './colors'

/**
 * Barra flotante para mover en bloque las cartas seleccionadas a una colección
 * personalizada (existente o nueva), y salir del modo selección.
 */
export function BulkAssignBar({
  selectedIds,
  onDone,
  onCancel,
}: {
  selectedIds: Set<number>
  onDone: (msg: string) => void
  onCancel: () => void
}) {
  const collections = useCustomCollections()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<CustomCollectionColor>('federation')

  const assign = async (collectionId: number) => {
    const added = await addCardsToCollection(collectionId, [...selectedIds])
    onDone(added > 0 ? `${added} carta${added > 1 ? 's' : ''} añadidas` : 'Ya estaban todas en esa colección')
    setOpen(false)
  }

  const createAndAssign = async () => {
    if (!name.trim()) return
    const id = await createCustomCollection(name.trim(), color)
    await assign(id)
    setName('')
    setCreating(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-hangar-700 bg-hangar-800 p-3 shadow-2xl">
        {open && (
          <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-hangar-700 bg-hangar-800 p-2 shadow-xl">
            {collections.map((c) => {
              const colors = collectionColorClasses[c.color]
              return (
                <button
                  key={c.id}
                  onClick={() => assign(c.id!)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-hangar-700"
                >
                  <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  {c.name}
                </button>
              )
            })}
            {creating ? (
              <div className="mt-1 flex flex-col gap-2 rounded-lg border border-hangar-700 p-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre…"
                  className="rounded-lg border border-hangar-700 bg-hangar-900 px-2.5 py-1.5 text-sm focus:border-federation-400 focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {CUSTOM_COLLECTION_COLORS.map((c) => (
                      <button
                        key={c}
                        aria-label={`Color ${c}`}
                        onClick={() => setColor(c)}
                        className={`h-5 w-5 rounded-full ${collectionColorClasses[c].dot} ${
                          color === c ? 'ring-2 ring-hangar-100 ring-offset-1 ring-offset-hangar-800' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <Button onClick={createAndAssign} className="gap-1.5">
                    <FolderPlus size={14} />
                    Crear y añadir
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-federation-400 hover:bg-hangar-700"
              >
                <Plus size={14} />
                Nueva colección
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-hangar-100">
            {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOpen(!open)}
              disabled={selectedIds.size === 0}
              className="gap-1.5"
            >
              <FolderPlus size={14} />
              Añadir a colección
            </Button>
            <button
              aria-label="Cancelar selección"
              onClick={onCancel}
              className="rounded-lg p-2 text-hangar-300 hover:bg-hangar-700 hover:text-hangar-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { FolderMinus, FolderPlus, PackagePlus, Plus, X } from 'lucide-react'
import { CUSTOM_COLLECTION_COLORS, type CustomCollectionColor } from '@/lib/db'
import { Button } from '@/ui/Button'
import { addCardsToOwned } from '@/features/collection/data'
import { useCustomCollections } from './hooks'
import { addCardsToCollection, createCustomCollection, removeCardsFromCollection } from './data'
import { collectionColorClasses } from './colors'

/**
 * Barra flotante del modo selección (design D2). Acciones:
 * - «Marcar en propiedad»: +1 Near Mint/en por carta seleccionada, siempre disponible.
 * - «A colección»: asignar a una colección personalizada (existente o nueva).
 * - «Quitar»: solo cuando se monta dentro de una colección personalizada
 *   (`removeFromCollectionId`), saca las cartas de esa agrupación.
 */
export function BulkAssignBar({
  selectedIds,
  onDone,
  onCancel,
  removeFromCollectionId,
}: {
  selectedIds: Set<number>
  onDone: (msg: string) => void
  onCancel: () => void
  removeFromCollectionId?: number
}) {
  const collections = useCustomCollections()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<CustomCollectionColor>('federation')

  const none = selectedIds.size === 0

  const markOwned = async () => {
    const n = await addCardsToOwned([...selectedIds])
    onDone(`${n} carta${n !== 1 ? 's' : ''} marcada${n !== 1 ? 's' : ''} en propiedad`)
  }

  const assign = async (collectionId: number) => {
    const added = await addCardsToCollection(collectionId, [...selectedIds])
    onDone(added > 0 ? `${added} carta${added > 1 ? 's' : ''} añadidas` : 'Ya estaban todas en esa colección')
    setOpen(false)
  }

  const removeFromCollection = async () => {
    if (removeFromCollectionId == null) return
    await removeCardsFromCollection(removeFromCollectionId, [...selectedIds])
    onDone(`${selectedIds.size} carta${selectedIds.size !== 1 ? 's' : ''} quitadas de la colección`)
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
          <span className="shrink-0 text-sm text-hangar-100">{selectedIds.size}</span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button onClick={markOwned} disabled={none} className="gap-1.5">
              <PackagePlus size={14} />
              En propiedad
            </Button>
            <Button
              variant="secondary"
              onClick={() => setOpen(!open)}
              disabled={none}
              className="gap-1.5"
            >
              <FolderPlus size={14} />
              A colección
            </Button>
            {removeFromCollectionId != null && (
              <Button variant="danger" onClick={removeFromCollection} disabled={none} className="gap-1.5">
                <FolderMinus size={14} />
                Quitar
              </Button>
            )}
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

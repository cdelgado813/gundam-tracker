import { useState } from 'react'
import { FolderMinus, FolderPlus, PackageMinus, PackagePlus, Plus, X } from 'lucide-react'
import { CUSTOM_COLLECTION_COLORS, type CustomCollectionColor } from '@/lib/db'
import { Button } from '@/ui/Button'
import { addCardsToOwned, removeCardsFromOwned } from '@/features/collection/data'
import { useCustomCollections } from './hooks'
import { addCardsToCollection, createCustomCollection, removeCardsFromCollection } from './data'
import { collectionColorClasses } from './colors'

function ActionButton({
  Icon,
  label,
  danger,
  disabled,
  onClick,
}: {
  Icon: typeof PackagePlus
  label: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40 ${
        danger
          ? 'border-zeon-500/30 text-zeon-400 hover:bg-zeon-500/10'
          : 'border-hangar-600 text-hangar-100 hover:bg-hangar-700'
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </button>
  )
}

/**
 * Hoja inferior del modo selección (design D2): cabecera con recuento y cierre,
 * y cuadrícula de acciones por eje — propiedad (+1/−1) | colecciones (añadir /
 * quitar, esta última solo dentro de una colección personalizada). Las restas
 * piden confirmación con recuento. La hoja no se cierra tras cada acción para
 * poder encadenarlas sobre la misma selección.
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

  const n = selectedIds.size
  const none = n === 0
  const plural = n !== 1 ? 's' : ''

  const markOwned = async () => {
    const done = await addCardsToOwned([...selectedIds])
    onDone(`+1 copia en ${done} carta${done !== 1 ? 's' : ''}`)
  }

  const unmarkOwned = async () => {
    if (!window.confirm(`¿Restar una copia de ${n} carta${plural}? Las que no tengas se omiten.`)) return
    const done = await removeCardsFromOwned([...selectedIds])
    onDone(
      done > 0
        ? `−1 copia en ${done} carta${done !== 1 ? 's' : ''}`
        : 'Ninguna de las seleccionadas tenía copias',
    )
  }

  const assign = async (collectionId: number) => {
    const added = await addCardsToCollection(collectionId, [...selectedIds])
    onDone(added > 0 ? `${added} carta${added > 1 ? 's' : ''} añadidas` : 'Ya estaban todas en esa colección')
    setOpen(false)
  }

  const removeFromCollection = async () => {
    if (removeFromCollectionId == null) return
    if (!window.confirm(`¿Quitar ${n} carta${plural} de esta colección? No afecta a tu propiedad.`)) return
    await removeCardsFromCollection(removeFromCollectionId, [...selectedIds])
    onDone(`${n} carta${plural} quitadas de la colección`)
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

        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-hangar-100">
            {n} carta{plural} seleccionada{plural}
          </span>
          <button
            aria-label="Salir del modo selección"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-hangar-300 hover:bg-hangar-700 hover:text-hangar-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ActionButton Icon={PackagePlus} label="+1 en propiedad" disabled={none} onClick={markOwned} />
          <ActionButton Icon={PackageMinus} label="−1 de propiedad" danger disabled={none} onClick={unmarkOwned} />
          <ActionButton Icon={FolderPlus} label="Añadir a colección" disabled={none} onClick={() => setOpen(!open)} />
          {removeFromCollectionId != null && (
            <ActionButton
              Icon={FolderMinus}
              label="Quitar de esta colección"
              danger
              disabled={none}
              onClick={removeFromCollection}
            />
          )}
        </div>
      </div>
    </div>
  )
}

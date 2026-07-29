import { useState } from 'react'
import {
  FolderMinus,
  FolderPlus,
  PackageMinus,
  PackagePlus,
  Plus,
  Repeat,
  Star,
  StarOff,
  X,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, CUSTOM_COLLECTION_COLORS, type CustomCollectionColor } from '@/lib/db'
import { Button } from '@/ui/Button'
import { addCardsToOwned, removeCardsFromOwned } from '@/features/collection/data'
import { addCardsToWishlist, removeCardsFromWishlist } from '@/features/wishlist/data'
import { addCardsToTradeList, createTradeList, tradeListUnits, TRADE_LIST_MAX_UNITS } from '@/features/trades/data'
import { useCustomCollections } from './hooks'
import { addCardsToCollection, createCustomCollection, removeCardsFromCollection } from './data'
import { collectionColorClasses } from './colors'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-hangar-300">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  )
}

function ActionButton({
  Icon,
  label,
  danger,
  disabled,
  wide,
  onClick,
}: {
  Icon: typeof PackagePlus
  label: string
  danger?: boolean
  disabled?: boolean
  wide?: boolean
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
      } ${wide ? 'col-span-2' : ''}`}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </button>
  )
}

/**
 * Hoja inferior del modo selección: cabecera con recuento y cierre, y las acciones
 * agrupadas por eje — propiedad, colecciones, wishlist e intercambio. Cada eje ofrece
 * añadir y quitar donde tiene sentido. Las acciones destructivas piden confirmación.
 * La hoja no se cierra tras cada acción para poder encadenarlas sobre la misma selección.
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
  const tradeLists = useLiveQuery(() => db.tradeLists.where('kind').equals('own').toArray()) ?? []
  const [panel, setPanel] = useState<'collections' | 'trades' | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<CustomCollectionColor>('federation')

  const ids = [...selectedIds]
  const n = selectedIds.size
  const none = n === 0
  const plural = n !== 1 ? 's' : ''
  const togglePanel = (p: 'collections' | 'trades') => setPanel(panel === p ? null : p)

  const markOwned = async () => {
    const done = await addCardsToOwned(ids)
    onDone(`+1 copia en ${done} carta${done !== 1 ? 's' : ''}`)
  }

  const unmarkOwned = async () => {
    if (!window.confirm(`¿Restar una copia de ${n} carta${plural}? Las que no tengas se omiten.`)) return
    const done = await removeCardsFromOwned(ids)
    onDone(
      done > 0 ? `−1 copia en ${done} carta${done !== 1 ? 's' : ''}` : 'Ninguna tenía copias',
    )
  }

  const addWishlist = async () => {
    const done = await addCardsToWishlist(ids)
    onDone(done > 0 ? `${done} añadida${done !== 1 ? 's' : ''} a wishlist` : 'Ya estaban todas en la wishlist')
  }

  const removeWishlist = async () => {
    if (!window.confirm(`¿Quitar ${n} carta${plural} de la wishlist?`)) return
    const done = await removeCardsFromWishlist(ids)
    onDone(done > 0 ? `${done} quitada${done !== 1 ? 's' : ''} de la wishlist` : 'Ninguna estaba en la wishlist')
  }

  const assignCollection = async (collectionId: number) => {
    const added = await addCardsToCollection(collectionId, ids)
    onDone(added > 0 ? `${added} carta${added > 1 ? 's' : ''} añadidas` : 'Ya estaban todas en esa colección')
    setPanel(null)
  }

  const assignTradeList = async (listId: number) => {
    const { added, skipped } = await addCardsToTradeList(listId, ids)
    onDone(
      skipped > 0
        ? `${added} añadidas · ${skipped} no caben (máx. ${TRADE_LIST_MAX_UNITS})`
        : `${added} carta${added !== 1 ? 's' : ''} añadidas a la lista`,
    )
    setPanel(null)
  }

  const removeFromCollection = async () => {
    if (removeFromCollectionId == null) return
    if (!window.confirm(`¿Quitar ${n} carta${plural} de esta colección? No afecta a tu propiedad.`)) return
    await removeCardsFromCollection(removeFromCollectionId, ids)
    onDone(`${n} carta${plural} quitadas de la colección`)
  }

  const createAndAssign = async () => {
    if (!name.trim()) return
    const id = await createCustomCollection(name.trim(), color)
    await assignCollection(id)
    setName('')
    setCreating(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-hangar-700 bg-hangar-800 p-3 shadow-2xl">
        {panel === 'collections' && (
          <div className="absolute bottom-full left-0 mb-2 max-h-64 w-full overflow-y-auto rounded-xl border border-hangar-700 bg-hangar-800 p-2 shadow-xl">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => assignCollection(c.id!)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-hangar-700"
              >
                <span className={`h-2 w-2 rounded-full ${collectionColorClasses[c.color].dot}`} />
                {c.name}
              </button>
            ))}
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

        {panel === 'trades' && (
          <div className="absolute bottom-full left-0 mb-2 max-h-64 w-full overflow-y-auto rounded-xl border border-hangar-700 bg-hangar-800 p-2 shadow-xl">
            {tradeLists.map((l) => {
              const units = tradeListUnits(l)
              const full = units >= TRADE_LIST_MAX_UNITS
              return (
                <button
                  key={l.id}
                  onClick={() => assignTradeList(l.id!)}
                  disabled={full}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-hangar-700 disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="truncate">{l.name}</span>
                  <span className="shrink-0 font-display text-xs text-hangar-300">
                    {units}/{TRADE_LIST_MAX_UNITS}
                  </span>
                </button>
              )
            })}
            <button
              onClick={async () => {
                const id = await createTradeList(`Lista ${tradeLists.length + 1}`)
                await assignTradeList(id)
              }}
              className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-federation-400 hover:bg-hangar-700"
            >
              <Plus size={14} />
              Nueva lista
            </button>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
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

        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          <Section title="Propiedad">
            <ActionButton Icon={PackagePlus} label="+1 copia" disabled={none} onClick={markOwned} />
            <ActionButton Icon={PackageMinus} label="−1 copia" danger disabled={none} onClick={unmarkOwned} />
          </Section>

          <Section title="Wishlist">
            <ActionButton Icon={Star} label="Añadir" disabled={none} onClick={addWishlist} />
            <ActionButton Icon={StarOff} label="Quitar" danger disabled={none} onClick={removeWishlist} />
          </Section>

          <Section title="Colecciones">
            <ActionButton
              Icon={FolderPlus}
              label="Añadir a colección"
              wide={removeFromCollectionId == null}
              disabled={none}
              onClick={() => togglePanel('collections')}
            />
            {removeFromCollectionId != null && (
              <ActionButton
                Icon={FolderMinus}
                label="Quitar de esta"
                danger
                disabled={none}
                onClick={removeFromCollection}
              />
            )}
          </Section>

          <Section title="Intercambio">
            <ActionButton
              Icon={Repeat}
              label="Añadir a lista de trade"
              wide
              disabled={none}
              onClick={() => togglePanel('trades')}
            />
          </Section>
        </div>
      </div>
    </div>
  )
}

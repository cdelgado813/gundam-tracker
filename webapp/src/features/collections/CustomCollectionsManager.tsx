import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { CUSTOM_COLLECTION_COLORS, type CustomCollection } from '@/lib/db'
import { deleteCustomCollection, recolorCustomCollection, renameCustomCollection } from './data'
import { useCustomCollections } from './hooks'
import { collectionColorClasses } from './colors'

function EditableRow({ collection }: { collection: CustomCollection }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(collection.name)

  const save = async () => {
    if (name.trim() && name.trim() !== collection.name) {
      await renameCustomCollection(collection.id!, name.trim())
    }
    setEditing(false)
  }

  return (
    <li className="flex items-center gap-2 rounded-lg border border-hangar-700 bg-hangar-800 px-3 py-2">
      <div className="flex gap-1">
        {CUSTOM_COLLECTION_COLORS.map((c) => (
          <button
            key={c}
            aria-label={`Color ${c}`}
            onClick={() => recolorCustomCollection(collection.id!, c)}
            className={`h-4 w-4 rounded-full ${collectionColorClasses[c].dot} ${
              collection.color === c ? 'ring-2 ring-hangar-100 ring-offset-1 ring-offset-hangar-800' : ''
            }`}
          />
        ))}
      </div>

      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          onBlur={save}
          className="min-w-0 flex-1 rounded border border-hangar-600 bg-hangar-900 px-2 py-0.5 text-sm focus:outline-none"
        />
      ) : (
        <Link
          to={`/collections/${collection.id}`}
          className="min-w-0 flex-1 truncate text-sm text-hangar-100 hover:text-federation-400 hover:underline"
        >
          {collection.name}
        </Link>
      )}

      <button
        aria-label="Renombrar"
        onClick={() => (editing ? save() : setEditing(true))}
        className="shrink-0 rounded p-1 text-hangar-300 hover:bg-hangar-700 hover:text-hangar-100"
      >
        {editing ? <Check size={14} /> : <Pencil size={14} />}
      </button>
      <button
        aria-label="Eliminar colección"
        onClick={() => {
          if (window.confirm(`¿Eliminar la colección "${collection.name}"?`)) {
            void deleteCustomCollection(collection.id!)
          }
        }}
        className="shrink-0 rounded p-1 text-hangar-300 hover:bg-hangar-700 hover:text-zeon-400"
      >
        <Trash2 size={14} />
      </button>
    </li>
  )
}

/** Gestión de colecciones personalizadas ya creadas: renombrar, recolorear, eliminar. */
export function CustomCollectionsManager() {
  const collections = useCustomCollections()

  if (collections.length === 0) {
    return (
      <p className="text-xs text-hangar-300">
        Aún no tienes colecciones personalizadas. Créalas desde el detalle de cualquier carta.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {collections.map((c) => (
        <EditableRow key={c.id} collection={c} />
      ))}
    </ul>
  )
}

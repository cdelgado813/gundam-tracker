import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { decodeShareList } from '@/lib/shareCodec'
import { ImportTradePage } from '@/features/trades/ImportTradePage'
import { ImportWishlistPage } from '@/features/wishlist/ImportWishlistPage'

/** Enlaces `/s/:payload` (y `/t/:payload` por compatibilidad) dirigen aquí; se resuelve
 * el tipo de lista leyendo `kind` del payload antes de renderizar el flujo correcto. */
export function ImportPage() {
  const { payload } = useParams()
  const kind = useMemo(() => {
    try {
      return decodeShareList(payload ?? '').kind
    } catch {
      return 't' as const
    }
  }, [payload])
  return kind === 'w' ? <ImportWishlistPage /> : <ImportTradePage />
}

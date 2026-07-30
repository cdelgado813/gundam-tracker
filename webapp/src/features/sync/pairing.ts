/**
 * Emparejamiento por QR (design.md D1): un único código, generado por el
 * dispositivo de origen, leído por el destino — sin ida y vuelta. Lleva el id
 * de sincronización y la clave de cifrado; nunca se envían a ningún servidor.
 */

interface PairingPayload {
  v: 1
  id: string
  k: string
}

export interface Pairing {
  syncId: string
  key: CryptoKey
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const byte of bytes) bin += String.fromCharCode(byte)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** El id de sincronización SHALL ser de alta entropía (128 bits) e inadivinable (design.md D3). */
const SYNC_ID_BYTES = 16

/** Genera un emparejamiento nuevo: id + clave AES-256, listos para mostrarse como QR. */
export async function createPairing(): Promise<{ pairing: Pairing; qrText: string }> {
  const idBytes = crypto.getRandomValues(new Uint8Array(SYNC_ID_BYTES))
  const syncId = toBase64Url(idBytes)
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])
  const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', key))
  const payload: PairingPayload = { v: 1, id: syncId, k: toBase64Url(rawKey) }
  return { pairing: { syncId, key }, qrText: JSON.stringify(payload) }
}

/** Decodifica el texto leído de un QR de emparejamiento. Lanza Error si no es válido. */
export async function decodePairing(qrText: string): Promise<Pairing> {
  let payload: PairingPayload
  try {
    payload = JSON.parse(qrText) as PairingPayload
  } catch {
    throw new Error('El código no contiene un emparejamiento válido.')
  }
  if (payload.v !== 1 || typeof payload.id !== 'string' || typeof payload.k !== 'string') {
    throw new Error('El código no contiene un emparejamiento válido.')
  }
  const key = await crypto.subtle.importKey(
    'raw',
    fromBase64Url(payload.k),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
  return { syncId: payload.id, key }
}

/** Exporta la clave para poder guardarla en Dexie (CryptoKey no es clonable estructuralmente ahí). */
export async function exportPairingForStorage(pairing: Pairing): Promise<{ syncId: string; rawKey: string }> {
  const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', pairing.key))
  return { syncId: pairing.syncId, rawKey: toBase64Url(rawKey) }
}

export async function importPairingFromStorage(stored: { syncId: string; rawKey: string }): Promise<Pairing> {
  const key = await crypto.subtle.importKey(
    'raw',
    fromBase64Url(stored.rawKey),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
  return { syncId: stored.syncId, key }
}

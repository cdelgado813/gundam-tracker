/**
 * Cifrado del payload sincronizado (design.md D2): el Worker solo ve
 * `{iv, ciphertext}`, nunca la clave ni el contenido en claro.
 */

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const byte of bytes) bin += String.fromCharCode(byte)
  return btoa(bin)
}

function fromBase64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export interface Envelope {
  v: 1
  iv: string
  ciphertext: string
}

export async function encryptPayload(key: CryptoKey, payload: unknown): Promise<Envelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(payload))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  return { v: 1, iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(encrypted)) }
}

/** Descifra un envelope. Lanza Error si la clave no coincide o está corrupto. */
export async function decryptPayload<T>(key: CryptoKey, envelope: Envelope): Promise<T> {
  const iv = fromBase64(envelope.iv)
  const ciphertext = fromBase64(envelope.ciphertext)
  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  } catch {
    throw new Error('No se pudo descifrar el estado sincronizado (clave incorrecta o dato corrupto).')
  }
  return JSON.parse(new TextDecoder().decode(plaintext)) as T
}

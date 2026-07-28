export interface JwtPayload {
  iss?: string
  sub?: string
  exp?: number
  iat?: number
  name?: string
}

/** Decodifica el payload de un JWT sin verificar firma. Devuelve null si está malformado. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function isJwtExpired(token: string, skewSeconds = 60): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 < Date.now() + skewSeconds * 1000
}

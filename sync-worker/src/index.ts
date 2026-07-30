export interface Env {
  SYNC_KV: KVNamespace
  ALLOWED_ORIGINS: string
  TTL_SECONDS: string
  MAX_BODY_BYTES: string
}

/** IDs de sincronización: 128 bits aleatorios, codificados base64url por el cliente. */
const ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/

interface Envelope {
  v: 1
  iv: string
  ciphertext: string
}

function isEnvelope(value: unknown): value is Envelope {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    v.v === 1 &&
    typeof v.iv === 'string' &&
    v.iv.length > 0 &&
    typeof v.ciphertext === 'string' &&
    v.ciphertext.length > 0
  )
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  const headers: Record<string, string> = { Vary: 'Origin' }
  if (allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'GET, PUT, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
  }
  return headers
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(request, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    const url = new URL(request.url)
    // Sin endpoint de listado a propósito (design.md D3): solo GET/PUT sobre un id conocido.
    const match = /^\/sync\/([A-Za-z0-9_-]+)$/.exec(url.pathname)
    if (!match) {
      return new Response('Not found', { status: 404, headers })
    }
    const id = match[1]!
    if (!ID_PATTERN.test(id)) {
      return new Response('Invalid id', { status: 400, headers })
    }

    if (request.method === 'GET') {
      const value = await env.SYNC_KV.get(id)
      if (value == null) return new Response('Not found', { status: 404, headers })
      return new Response(value, {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    if (request.method === 'PUT') {
      const maxBytes = Number(env.MAX_BODY_BYTES)
      const contentLength = Number(request.headers.get('Content-Length') ?? '0')
      if (contentLength > maxBytes) {
        return new Response('Payload too large', { status: 413, headers })
      }
      const body = await request.text()
      if (body.length > maxBytes) {
        return new Response('Payload too large', { status: 413, headers })
      }
      let parsed: unknown
      try {
        parsed = JSON.parse(body)
      } catch {
        return new Response('Invalid JSON', { status: 400, headers })
      }
      if (!isEnvelope(parsed)) {
        return new Response('Invalid payload shape', { status: 400, headers })
      }
      // TTL renovado en cada escritura (design.md D3/D4): una sesión activa nunca
      // caduca; una abandonada se limpia sola sin mantenimiento manual.
      await env.SYNC_KV.put(id, body, { expirationTtl: Number(env.TTL_SECONDS) })
      return new Response(null, { status: 204, headers })
    }

    return new Response('Method not allowed', { status: 405, headers })
  },
} satisfies ExportedHandler<Env>

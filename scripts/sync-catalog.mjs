#!/usr/bin/env node
/**
 * Sincroniza el catálogo y los precios de Gundam TCG desde CardTrader y los
 * publica como JSON estático en webapp/public/data/.
 *
 * Corre en CI (ver .github/workflows/sync-catalog.yml) con el token del
 * propietario en la variable de entorno CARDTRADER_JWT — nunca se expone al
 * navegador. La webapp solo lee estos ficheros estáticos, sin autenticarse
 * contra CardTrader (docs/api-notes.md documenta por qué es seguro: nada de
 * lo que se sincroniza aquí es específico de una cuenta).
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const JWT = process.env.CARDTRADER_JWT
if (!JWT) {
  console.error('Falta la variable de entorno CARDTRADER_JWT')
  process.exit(1)
}

const API_BASE = 'https://api.cardtrader.com/api/v2'
const GUNDAM_GAME_ID = 23
const SINGLES_CATEGORY_ID = 272
const CDN_BASE = 'https://cardtrader.com'
/** Ofertas publicadas por idioma y carta (las más baratas). Ver toPriceEntry. */
const OFFERS_PER_LANGUAGE = 5

const OUT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'webapp',
  'public',
  'data',
)

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function apiGet(pathname, attempt = 0) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    headers: { Authorization: `Bearer ${JWT}` },
  })
  if (res.ok) return res.json()
  if (attempt >= 3) throw new Error(`${pathname} -> HTTP ${res.status}`)
  await sleep(2 ** attempt * 1000)
  return apiGet(pathname, attempt + 1)
}

function blueprintToCard(bp) {
  const name = bp.version ? `${bp.name} (${bp.version})` : bp.name
  const showUrl = bp.image?.show?.url
  return {
    id: bp.id,
    expansionId: bp.expansion_id,
    name,
    version: bp.version,
    collectorNumber: bp.fixed_properties?.collector_number ?? '',
    rarity: bp.fixed_properties?.gundam_rarity ?? '',
    imageUrlPreview: bp.image_url ?? null,
    imageUrlShow: showUrl ? `${CDN_BASE}${showUrl}` : (bp.image_url ?? null),
    searchName: name.toLowerCase(),
  }
}

function toPriceEntry(blueprintId, offers) {
  const nearMint = offers.find((o) => o.properties_hash?.condition === 'Near Mint')
  // Desglose por idioma de carta: los precios difieren mucho entre en/jp/zh-CN
  // (hasta 2× en la misma carta). Campo aditivo: `minCents` se conserva para no
  // romper clientes con la app cacheada de antes (design D3).
  const byLanguage = {}
  for (const o of offers) {
    const lang = o.properties_hash?.gundam_language
    if (!lang) continue
    const current = byLanguage[lang]
    if (!current) byLanguage[lang] = { minCents: o.price_cents, offersCount: 1, offers: [] }
    else {
      current.offersCount++
      if (o.price_cents < current.minCents) current.minCents = o.price_cents
    }
    // Muestra de las ofertas más baratas de cada idioma (las respuestas vienen
    // ordenadas por precio asc). Publicar TODAS serían ~4 MB; con 5 por idioma
    // se ve oferta real sin inflar el bundle de datos.
    const sample = byLanguage[lang].offers
    if (sample.length < OFFERS_PER_LANGUAGE) {
      sample.push({
        priceCents: o.price_cents,
        quantity: o.quantity,
        condition: o.properties_hash?.condition ?? null,
      })
    }
  }
  return {
    blueprintId: Number(blueprintId),
    minCents: offers[0]?.price_cents ?? null,
    minNearMintCents: nearMint?.price_cents ?? null,
    currency: offers[0]?.price_currency ?? 'EUR',
    offersCount: offers.length,
    ...(Object.keys(byLanguage).length > 0 ? { byLanguage } : {}),
    fetchedAt: Date.now(),
  }
}

async function main() {
  console.log('Descargando expansiones…')
  const allExpansions = await apiGet('/expansions')
  const gundamExpansions = allExpansions.filter((e) => e.game_id === GUNDAM_GAME_ID)
  console.log(`${gundamExpansions.length} expansiones de Gundam encontradas`)

  await mkdir(path.join(OUT_DIR, 'cards'), { recursive: true })
  await mkdir(path.join(OUT_DIR, 'prices'), { recursive: true })
  // limpia expansiones que ya no existan
  for (const dir of ['cards', 'prices']) {
    const known = new Set(gundamExpansions.map((e) => `${e.id}.json`))
    for (const f of await readdir(path.join(OUT_DIR, dir)).catch(() => [])) {
      if (!known.has(f)) await rm(path.join(OUT_DIR, dir, f))
    }
  }

  const expansionsOut = []
  let totalCards = 0

  for (const exp of gundamExpansions) {
    process.stdout.write(`  ${exp.code} (${exp.name})… `)
    const blueprints = await apiGet(`/blueprints/export?expansion_id=${exp.id}`)
    const cards = blueprints.filter((b) => b.category_id === SINGLES_CATEGORY_ID).map(blueprintToCard)

    if (cards.length === 0) {
      console.log('sin cartas jugables, omitida')
      continue
    }

    await writeFile(
      path.join(OUT_DIR, 'cards', `${exp.id}.json`),
      JSON.stringify(cards),
    )

    let priceCount = 0
    try {
      const marketplace = await apiGet(`/marketplace/products?expansion_id=${exp.id}`)
      const prices = Object.entries(marketplace).map(([bpId, offers]) => toPriceEntry(bpId, offers))
      priceCount = prices.length
      await writeFile(path.join(OUT_DIR, 'prices', `${exp.id}.json`), JSON.stringify(prices))
    } catch (err) {
      console.warn(`\n    aviso: sin precios para ${exp.code} (${err.message})`)
      await writeFile(path.join(OUT_DIR, 'prices', `${exp.id}.json`), '[]')
    }

    expansionsOut.push({ id: exp.id, code: exp.code, name: exp.name, cardCount: cards.length })
    totalCards += cards.length
    console.log(`${cards.length} cartas, ${priceCount} con precio`)

    await sleep(300) // buen ciudadano de la API
  }

  expansionsOut.sort((a, b) => a.code.localeCompare(b.code))
  await writeFile(path.join(OUT_DIR, 'expansions.json'), JSON.stringify(expansionsOut))
  await writeFile(
    path.join(OUT_DIR, 'meta.json'),
    JSON.stringify({
      generatedAt: Date.now(),
      expansionCount: expansionsOut.length,
      cardCount: totalCards,
    }),
  )

  console.log(`\nListo: ${expansionsOut.length} expansiones, ${totalCards} cartas.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

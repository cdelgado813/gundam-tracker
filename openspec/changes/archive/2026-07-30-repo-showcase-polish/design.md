## Context

El repo es público desde el principio, pero nunca se ha tratado como escaparate: todo el trabajo se ha hecho a través de OpenSpec (`openspec/changes/<nombre>/{proposal,design,specs,tasks}.md`) sin cerrar el ciclo de `archive`, así que `openspec/specs/` — pensado como la fuente de verdad de qué hace la app hoy — está vacío pese a 8 cambios completados y desplegados. No hay README, LICENSE, ni metadatos de GitHub (descripción, homepage, topics), ni un solo release/tag en 28 commits.

## Goals / Non-Goals

**Goals:**
- Que alguien que llegue al repo desde el enlace de la landing/about entienda en 30 segundos qué es, cómo se ve, y cómo correrlo.
- Que `openspec/specs/` refleje de verdad el estado actual de la app (archivar lo ya hecho).
- Un primer release `v1.0.0` con notas legibles, no un changelog crudo de commits.
- Metadatos de GitHub (descripción, homepage, topics) coherentes con lo que la app ya dice de sí misma en `/about`.

**Non-Goals:**
- No se toca código de `webapp/` ni el pipeline de CI/CD.
- No se añade CONTRIBUTING.md, CODE_OF_CONDUCT.md ni plantillas de issues/PR — la app ya invita a contribuir desde `/about` con un enlace directo al repo; formalizar ese proceso es una decisión aparte, no pedida aquí.
- No se purga historial de git: se verificó que no hay secretos comprometidos (`jwt.json` y la colección Postman nunca se han commiteado), así que no hace falta.

## Decisions

### D1: README orientado a dos públicos, no uno

El README se estructura para dos lectores distintos que llegan por caminos distintos:
1. **Alguien que solo quiere usar la app** (llega desde `/about` → repo): qué es, capturas, enlace directo a `gundam.poordevelopers.com`.
2. **Alguien que quiere entender o tocar el código** (recruiter, colaborador potencial, curioso técnico): stack (Vite/React/TS/Tailwind/Dexie), arquitectura sin backend, pipeline de datos CI (CardTrader → JSON estático), cómo correr en local, y el propio flujo OpenSpec como forma de trabajar documentada de principio a fin.

**Alternativa descartada**: un README mínimo tipo "instrucciones de instalación". Se descarta porque el punto fuerte de este proyecto no es solo el código sino el proceso — 28 commits con specs/design/tasks completos por cambio es material que vale la pena mostrar, no esconder.

### D2: Archivar los 8 cambios antes de escribir el README

El README describe capacidades (catálogo, colección, wishlist, trades, i18n, PWA...) que deberían poder enlazar o basarse en `openspec/specs/` una vez sincronizado — así que el archivado va primero en `tasks.md`. Se usa el flujo ya existente (`openspec archive`, mismo mecanismo que `/opsx:archive`) uno por uno, en orden cronológico de creación, para que el historial de specs quede coherente.

**Riesgo conocido**: `openspec archive` puede fallar o pedir resolución manual si dos changes tocan la misma capacidad con specs delta incompatibles entre sí (p. ej. `wishlist-lists-and-shared-limits` y `list-navigation-and-owned-filter` ambos tocan `wishlist-lists`). Se archivan en orden cronológico precisamente para minimizar ese riesgo, y si el CLI reporta conflicto se resuelve manualmente comparando contra el estado real del código (fuente de verdad última) antes de continuar.

### D3: Release notes escritas a mano a partir del log, no autogeneradas

`gh release create v1.0.0` con notas escritas resumiendo las capacidades reales (agrupadas por área: catálogo/colección/wishlist/trades/i18n/PWA/landing), no el `--generate-notes` automático de GitHub — el historial de commits está en español con mensajes ya descriptivos, pero una release de v1.0.0 merece un resumen legible por alguien que no ha seguido los 28 commits uno a uno.

### D4: Metadatos de GitHub vía `gh repo edit`, no un archivo del repo

Descripción, `homepageUrl` y topics del repositorio se configuran con `gh repo edit --description ... --homepage ... --add-topic ...` — son metadatos de la plataforma GitHub, no contenido versionado; no hay archivo en el repo que los represente.

## Risks / Trade-offs

- [Riesgo] Archivar 8 changes de golpe es una operación con más superficie de fallo que las aplicadas hasta ahora en esta sesión (un solo `apply` a la vez) → Mitigación: uno por uno, verificando `openspec status` tras cada archivado antes de continuar con el siguiente; si algo falla, se pausa y se reporta en vez de forzar.
- [Trade-off] MIT es permisiva — cualquiera puede reempaquetar el código sin obligación de compartir cambios → aceptado explícitamente por el usuario como la opción por defecto para este tipo de proyecto.

## Migration Plan

Sin migración de datos ni de código. Orden de ejecución: (1) archivar changes completados, (2) README + LICENSE, (3) metadatos de GitHub, (4) tag y release `v1.0.0`. Cada paso es independiente y reversible (un README/LICENSE se puede editar después sin más consecuencia; un release de GitHub se puede editar o borrar sin afectar el código).

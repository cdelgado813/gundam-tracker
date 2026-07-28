import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CodeXml,
  ExternalLink,
  HandHeart,
  HardDrive,
  Lock,
  Repeat,
  ScanLine,
} from 'lucide-react'
import { Button } from '@/ui/Button'

const REPO_URL = 'https://github.com/cdelgado813/gundam-tracker'
const POORDEVELOPERS_URL = 'https://poordevelopers.com'

const points = [
  {
    Icon: Lock,
    title: 'Sin cuentas',
    body: 'No hay usuarios ni contraseñas. Nadie necesita ninguna credencial para usar la app.',
  },
  {
    Icon: HardDrive,
    title: 'Todo en local',
    body: 'Colección, wishlist, listas de intercambio y colecciones personalizadas se guardan en tu navegador, con copias de seguridad automáticas.',
  },
  {
    Icon: Repeat,
    title: 'Intercambios sin intermediarios',
    body: 'Comparte listas de hasta 50 cartas mediante un enlace o un código QR generado en tu propio dispositivo.',
  },
  {
    Icon: ScanLine,
    title: 'Sin servidor propio',
    body: 'El catálogo y los precios se sincronizan periódicamente desde CardTrader y se publican como datos estáticos junto con el sitio.',
  },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 pb-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100">
        <ArrowLeft size={14} /> Volver a la app
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-hangar-100">
          Gundam Tracker
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-hangar-300">
          Una herramienta para gestionar tu colección del Gundam Card Game: qué cartas tienes, qué te
          falta, qué quieres conseguir y qué puedes intercambiar. Sin cuentas de usuario, sin
          servicios de pago y sin que tus datos salgan de tu dispositivo.
        </p>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {points.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-hangar-800 bg-hangar-900 p-4">
            <Icon size={18} className="text-federation-400" strokeWidth={1.75} />
            <h2 className="mt-2 font-display text-sm font-bold text-hangar-100">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-hangar-300">{body}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-hangar-700 bg-hangar-900 p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-hangar-300">
          Código abierto
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-hangar-300">
          Todo el código de este proyecto es público y las aportaciones son bienvenidas: informes de
          errores, ideas de funcionalidades o pull requests directos.
        </p>
        <div className="mt-4">
          <Button
            onClick={() => window.open(REPO_URL, '_blank', 'noopener,noreferrer')}
            className="gap-2"
          >
            <CodeXml size={16} />
            Ver el repositorio
            <ExternalLink size={14} />
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-hangar-700 bg-hangar-900 p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-hangar-300">
          Parte de poordevelopers
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-hangar-300">
          Gundam Tracker es un proyecto de{' '}
          <a
            href={POORDEVELOPERS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-federation-400 underline"
          >
            poordevelopers.com
          </a>
          , un colectivo que construye herramientas simples, gratuitas y sin ánimo de lucro. Sin
          publicidad, sin trackear a nadie y sin vender datos: se hace software útil para la
          comunidad, no para el negocio.
        </p>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => window.open(POORDEVELOPERS_URL, '_blank', 'noopener,noreferrer')}
            className="gap-2"
          >
            <HandHeart size={16} />
            poordevelopers.com
            <ExternalLink size={14} />
          </Button>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-hangar-300">
        Datos de cartas y precios de{' '}
        <a
          href="https://www.cardtrader.com"
          target="_blank"
          rel="noreferrer"
          className="text-federation-400 underline"
        >
          CardTrader
        </a>
        . No afiliada a Bandai Namco ni a CardTrader.
      </p>
    </div>
  )
}

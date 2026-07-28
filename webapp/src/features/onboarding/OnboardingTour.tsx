import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, LayoutGrid, Rocket, Repeat, type LucideIcon } from 'lucide-react'
import { Button } from '@/ui/Button'
import { JwtForm } from './JwtForm'

const steps: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: Rocket,
    title: 'Bienvenido, piloto',
    body: 'Gundam Tracker es tu hangar personal: gestiona tu colección del Gundam Card Game, tu wishlist y tus listas de intercambio. Todo vive en este dispositivo — sin cuentas, sin servidores.',
  },
  {
    Icon: LayoutGrid,
    title: 'Tu colección, offline',
    body: 'El catálogo completo de cartas se descarga y se guarda en local: puedes consultar y editar tu colección sin conexión. Los precios de mercado se consultan bajo demanda desde CardTrader.',
  },
  {
    Icon: Repeat,
    title: 'Intercambia sin intermediarios',
    body: 'Crea listas de hasta 50 cartas para tradear y compártelas con un enlace o QR. El enlace contiene la lista entera: nadie más la almacena.',
  },
  {
    Icon: KeyRound,
    title: 'Conecta tu cuenta de CardTrader',
    body: 'La app usa tu propio token (JWT) de CardTrader para leer el catálogo y los precios. Entra en cardtrader.com → Ajustes → API completa, copia el token y pégalo aquí.',
  },
]

export function OnboardingTour() {
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1
  const current = steps[step]

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <current.Icon size={40} strokeWidth={1.5} className="mx-auto text-zeon-400" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-wide text-hangar-100">
            {current.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-hangar-300">{current.body}</p>
        </div>

        {isLast ? (
          <JwtForm />
        ) : (
          <Button className="w-full" onClick={() => setStep(step + 1)}>
            Continuar
          </Button>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <button
              key={s.title}
              aria-label={`Paso ${i + 1}`}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-zeon-500' : 'w-1.5 bg-hangar-600 hover:bg-hangar-300'
              }`}
            />
          ))}
        </div>
      </div>

      <Link to="/about" className="mt-10 text-xs text-hangar-300 hover:text-hangar-100">
        Sobre este proyecto (código abierto)
      </Link>
    </div>
  )
}

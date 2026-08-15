import { Sun } from 'lucide-react'
import { Card } from '@/components/ui'

export function SolarCalculatorPage() {
  return (
    <Card className="flex flex-col items-center gap-3 py-16 text-center">
      <Sun className="h-10 w-10 text-amber-400" />
      <h1 className="text-lg font-semibold text-slate-900">Economia Solar</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Essa calculadora ainda está em construção. Em breve você vai poder estimar a economia com
        energia solar por aqui.
      </p>
    </Card>
  )
}

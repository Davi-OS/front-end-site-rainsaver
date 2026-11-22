import { Alert, Button, Modal } from '@/components/ui'
import { formatBRL } from '@/lib/format'
import type { Plan } from '@/subscription/types'

interface ConfirmSubscriptionModalProps {
  plan: Plan
  open: boolean
  pending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

/** Review step. It collects no payment data: the real payment will be a hosted checkout. */
export function ConfirmSubscriptionModal({ plan, open, pending, error, onConfirm, onClose }: ConfirmSubscriptionModalProps) {
  return (
    <Modal
      title="Confirmar assinatura"
      open={open}
      onClose={() => !pending && onClose()}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Voltar
          </Button>
          <Button onClick={onConfirm} disabled={pending} data-autofocus>
            {pending ? 'Assinando…' : 'Confirmar assinatura'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <Alert variant="error" focusOnMount>
            {error}
          </Alert>
        )}
        <p className="text-sm text-slate-700">
          Plano <strong>{plan.name}</strong>: <strong className="tabular-nums">{formatBRL(plan.priceBRL)}</strong>{' '}
          por&nbsp;{plan.period}. Você navega sem anúncios em todo o site e pode cancelar quando quiser.
        </p>
        <Alert variant="info">
          <strong>Demonstração.</strong> Nenhum pagamento é feito e nenhuma cobrança é criada. A assinatura vale só neste
          navegador.
        </Alert>
      </div>
    </Modal>
  )
}

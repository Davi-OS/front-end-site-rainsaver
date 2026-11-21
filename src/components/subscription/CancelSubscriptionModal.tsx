import { Alert, Button, Modal } from '@/components/ui'
import { formatDate } from '@/lib/format'
import type { Subscription } from '@/subscription/types'

interface CancelSubscriptionModalProps {
  subscription: Subscription
  open: boolean
  pending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

export function CancelSubscriptionModal({ subscription, open, pending, error, onConfirm, onClose }: CancelSubscriptionModalProps) {
  return (
    <Modal
      title="Cancelar assinatura"
      open={open}
      onClose={() => !pending && onClose()}
      footer={
        <>
          {/* The safe choice gets the initial focus. */}
          <Button variant="secondary" onClick={onClose} disabled={pending} data-autofocus>
            Manter assinatura
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'Cancelando…' : 'Cancelar assinatura'}
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
          Você continua sem anúncios até <strong>{formatDate(subscription.periodEnd)}</strong>, o fim do período já
          contratado. Depois dessa data a assinatura termina e os anúncios voltam. Você pode reativar antes disso.
        </p>
      </div>
    </Modal>
  )
}

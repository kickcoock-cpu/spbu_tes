import { createFileRoute } from '@tanstack/react-router'
import DeliveriesConfirmationPage from '@/features/deliveries-management/deliveries-confirmation-page'

export const Route = createFileRoute('/_authenticated/deliveries/confirm/')({
  component: DeliveriesConfirmationPage,
})
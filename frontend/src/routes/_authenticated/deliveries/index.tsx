import { createFileRoute } from '@tanstack/react-router'
import DeliveriesManagementPage from '@/features/deliveries-management/deliveries-management-page'

export const Route = createFileRoute('/_authenticated/deliveries/')({
  component: DeliveriesManagementPage,
})
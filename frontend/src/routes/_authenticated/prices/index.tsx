import { createFileRoute } from '@tanstack/react-router'
import PricesManagementPage from '@/features/prices-management/prices-management-page'

export const Route = createFileRoute('/_authenticated/prices/')({
  component: PricesManagementPage,
})
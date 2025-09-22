import { createFileRoute } from '@tanstack/react-router'
import DepositsManagementPage from '@/features/deposits-management/deposits-management-page'

export const Route = createFileRoute('/_authenticated/deposits/')({
  component: DepositsManagementPage,
})
import { createFileRoute } from '@tanstack/react-router'
import AdjustmentsManagementPage from '@/features/adjustments-management/adjustments-management-page'

export const Route = createFileRoute('/_authenticated/adjustments/')({
  component: AdjustmentsManagementPage,
})

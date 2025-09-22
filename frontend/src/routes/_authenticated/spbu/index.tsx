import { createFileRoute } from '@tanstack/react-router'
import SPBUManagementPage from '@/features/spbu-management/spbu-management-page'

export const Route = createFileRoute('/_authenticated/spbu/')({
  component: SPBUManagementPage,
})
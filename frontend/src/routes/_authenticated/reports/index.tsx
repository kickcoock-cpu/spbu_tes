import { createFileRoute } from '@tanstack/react-router'
import AllReportsPage from '@/features/reports/all-reports-page'

export const Route = createFileRoute('/_authenticated/reports/')({
  component: AllReportsPage,
})
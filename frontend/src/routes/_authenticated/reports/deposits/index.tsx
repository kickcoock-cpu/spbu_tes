import { createFileRoute } from '@tanstack/react-router'
import DepositsReportPage from '@/features/reports/deposits-report-page'

export const Route = createFileRoute('/_authenticated/reports/deposits/')({
  component: DepositsReportPage,
})
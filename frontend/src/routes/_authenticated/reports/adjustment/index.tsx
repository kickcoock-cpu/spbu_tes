import { createFileRoute } from '@tanstack/react-router'
import AdjustmentReportPage from '@/features/reports/adjustment-report-page'

export const Route = createFileRoute('/_authenticated/reports/adjustment/')({
  component: AdjustmentReportPage,
})
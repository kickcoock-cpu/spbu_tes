import { createFileRoute } from '@tanstack/react-router'
import SalesReportPage from '@/features/reports/sales-report-page'

export const Route = createFileRoute('/_authenticated/reports/sales/')({
  component: SalesReportPage,
})
import { createFileRoute } from '@tanstack/react-router'
import DeliveriesReportPage from '@/features/reports/deliveries-report-page'

export const Route = createFileRoute('/_authenticated/reports/deliveries/')({
  component: DeliveriesReportPage,
})
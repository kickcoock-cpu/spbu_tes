import { createFileRoute } from '@tanstack/react-router'
import LedgerReportPage from '@/features/reports/ledger-report-page'

export const Route = createFileRoute('/_authenticated/reports/ledger/')({
  component: LedgerReportPage,
})
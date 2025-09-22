import { createFileRoute } from '@tanstack/react-router'
import { TankList } from './index'

export const Route = createFileRoute('/_authenticated/tanks')({
  component: TankList,
})
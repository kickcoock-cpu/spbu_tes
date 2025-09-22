import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Sale = {
  id: string
  name: string
  email: string
  amount: number
  avatar: string
}

type RecentSalesProps = {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className='space-y-8'>
      {sales.map((sale) => (
        <div key={sale.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={sale.avatar} alt={sale.name} />
            <AvatarFallback>{sale.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{sale.name}</p>
              <p className='text-muted-foreground text-sm'>
                {sale.email}
              </p>
            </div>
            <div className='font-medium'>+${sale.amount.toFixed(2)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

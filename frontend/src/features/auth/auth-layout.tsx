import { Link } from '@tanstack/react-router'
import { SimontoKLogo } from '@/assets/custom/simontok-logo'
import '@/assets/custom/simontok-styles.css'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <Link to='/' className='flex items-center gap-3'>
            <SimontoKLogo size={40} className="simontok-logo" />
            <h1 className='text-3xl font-bold simontok-title'>SimontoK</h1>
          </Link>
        </div>
        <div className='text-center mb-2'>
        </div>
        {children}
      </div>
    </div>
  )
}

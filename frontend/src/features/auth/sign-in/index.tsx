import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4 shadow-lg simontok-card'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl tracking-tight'>Sistem Monitoring BBK</CardTitle>
          <CardDescription className='text-base'>
            Masuk ke akun Anda untuk mengakses sistem monitoring dan manajemen BBM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter className='simontok-footer'>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            Dengan masuk, Anda menyetujui{' '}
            <a
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Syarat Layanan
            </a>{' '}
            dan{' '}
            <a
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Kebijakan Privasi
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}

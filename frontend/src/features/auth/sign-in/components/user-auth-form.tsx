import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { authApi } from '@/lib/api'
import axios from 'axios'

// Updated form schema to accept either email or username
const formSchema = z.object({
  email: z.string().min(1, 'Please enter your email or username'),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Determine if the input is an email or username
      const isEmail = data.email.includes('@')
      
      // Prepare credentials object with the correct field name
      const credentials = {
        password: data.password,
        ...(isEmail ? { email: data.email } : { username: data.email })
      }

      // Call the actual login API
      const response = await authApi.login(credentials)

      // Extract user and token from response
      const { token, data: userData } = response.data

      console.log('Login response data:', response.data);
      console.log('Token received:', token);
      console.log('User data received:', userData);

      // Transform user data to match the expected structure
      const transformedUser = {
        accountNo: userData.username,
        email: userData.email || '',
        name: userData.name || userData.username, // Add name field
        username: userData.username, // Add username field
        role: [userData.Role?.name || 'User'],
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
      }

      console.log('Transformed user:', transformedUser);

      // Set user and access token
      auth.setUser(transformedUser)
      auth.setAccessToken(token)

      // Show success message
      toast.success(`Welcome back, ${transformedUser.email || transformedUser.accountNo}!`)

      // Redirect based on user role:
      // - Operators go to /sales
      // - Super Admin and Admin go to /
      let targetPath = redirectTo || '/'
      
      // If redirectTo is the sign-in page, override it
      if (redirectTo && redirectTo.includes('/sign-in')) {
        targetPath = '/'
      }
      
      // Role-based redirection
      if (transformedUser.role.includes('Operator')) {
        // Operators should always go to /sales page as their home
        targetPath = '/sales'
      } else if (transformedUser.role.includes('Super Admin') || transformedUser.role.includes('Admin')) {
        // Super Admin and Admin should go to dashboard
        targetPath = '/'
      }
      
      // Gunakan navigate untuk redirect
      navigate({ to: targetPath, replace: true })
    } catch (error: any) {
      // Handle error
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please check your credentials and try again.'
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your network connection and try again.'
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your network connection and ensure the backend server is running.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.status === 401) {
          errorMessage = 'Invalid email/username or password. Please try again.'
        } else if (error.response?.status === 400) {
          errorMessage = 'Bad request. Please check your input and try again.'
        } else if (error.response?.status === 404) {
          errorMessage = 'Login endpoint not found. Please check server configuration.'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = `Login failed: ${error.message || 'Unknown error'}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Username</FormLabel>
              <FormControl>
                <Input placeholder='Enter your email or username' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Enter your password' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}

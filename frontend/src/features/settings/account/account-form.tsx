import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { Eye, EyeOff } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/stores/auth-store'
import { userApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/date-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
] as const

const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
  dob: z.date('Please select your date of birth.'),
  language: z.string('Please select a language.'),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const emailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  confirmEmail: z.string().email('Please confirm your email address'),
  password: z.string().min(1, 'Password is required to change email'),
}).refine((data) => data.newEmail === data.confirmEmail, {
  message: "Email addresses don't match",
  path: ["confirmEmail"],
})

type AccountFormValues = z.infer<typeof accountFormSchema>
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
type EmailChangeFormValues = z.infer<typeof emailChangeSchema>

export function AccountForm() {
  const { user, updateAuth } = useAuthStore().auth
  
  // Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.name || '',
      dob: user?.dob ? new Date(user.dob) : new Date(),
      language: user?.language || 'en',
    },
  })

  // Password change form
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Email change form
  const emailForm = useForm<EmailChangeFormValues>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      newEmail: user?.email || '',
      confirmEmail: user?.email || '',
      password: '',
    },
  })

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  async function onAccountSubmit(data: AccountFormValues) {
    try {
      // Call API to update account information
      const response = await userApi.updateProfile({
        name: data.name,
        dob: data.dob.toISOString(),
        language: data.language,
      })
      
      // Update auth store with new user data
      updateAuth(response.data.data)
      
      toast.success('Account settings updated successfully')
    } catch (error: any) {
      console.error('Account update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update account settings')
    }
  }

  async function onPasswordSubmit(data: PasswordChangeFormValues) {
    try {
      // Call API to change password
      await userApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error: any) {
      console.error('Password change error:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  }

  async function onEmailSubmit(data: EmailChangeFormValues) {
    try {
      // Call API to change email
      await userApi.changeEmail({
        newEmail: data.newEmail,
        password: data.password,
      })
      
      toast.success('Email updated successfully. Please check your new email for verification.')
      emailForm.reset({
        newEmail: data.newEmail,
        confirmEmail: data.newEmail,
        password: '',
      })
    } catch (error: any) {
      console.error('Email change error:', error)
      toast.error(error.response?.data?.message || 'Failed to update email')
    }
  }

  async function onDeleteAccount(password: string) {
    try {
      if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return
      }
      
      // Call API to delete account
      await userApi.deleteAccount(password)
      
      toast.success('Account deleted successfully')
      // Redirect to login page
      window.location.href = '/sign-in'
    } catch (error: any) {
      console.error('Account deletion error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete account')
    }
  }

  return (
    <div className="space-y-8">
      {/* Account Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your account settings. Set your preferred language and timezone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className='space-y-6'>
              <FormField
                control={accountForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Your name' {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed on your profile and in emails.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name='dob'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Date of birth</FormLabel>
                    <DatePicker selected={field.value} onSelect={field.onChange} />
                    <FormDescription>
                      Your date of birth is used to calculate your age.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name='language'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Language</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'w-[200px] justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? languages.find(
                                  (language) => language.value === field.value
                                )?.label
                              : 'Select language'}
                            <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[200px] p-0'>
                        <Command>
                          <CommandInput placeholder='Search language...' />
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {languages.map((language) => (
                                <CommandItem
                                  value={language.label}
                                  key={language.value}
                                  onSelect={() => {
                                    accountForm.setValue('language', language.value)
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      'size-4',
                                      language.value === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {language.label}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      This is the language that will be used in the dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Update account</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password regularly to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='space-y-6'>
              <FormField
                control={passwordForm.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showCurrentPassword ? "text" : "password"} 
                          placeholder='Enter your current password' 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showNewPassword ? "text" : "password"} 
                          placeholder='Enter your new password' 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormDescription>
                      Password must be at least 8 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder='Confirm your new password' 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Change Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Email Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
          <CardDescription>
            Update your email address. A verification email will be sent to your new address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className='space-y-6'>
              <FormField
                control={emailForm.control}
                name='newEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder='Enter your new email address' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name='confirmEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder='Confirm your new email address' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showEmailPassword ? "text" : "password"} 
                          placeholder='Enter your password to confirm email change' 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowEmailPassword((prev) => !prev)}
                      >
                        {showEmailPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormDescription>
                      Enter your current password to confirm this change.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Change Email</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all of its contents. This action is not reversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => {
                const password = prompt('Please enter your password to confirm account deletion:')
                if (password) {
                  onDeleteAccount(password)
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

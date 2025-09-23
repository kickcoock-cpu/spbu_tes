import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'accessToken' // Ubah nama cookie menjadi lebih umum
const USER_DATA = 'userData' // New constant for user data

interface AuthUser {
  accountNo: string
  email: string
  name: string
  username: string
  role: string[]
  exp: number
  spbu_id?: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // Safely parse cookie state
  const cookieState = getCookie(ACCESS_TOKEN)
  let initToken = ''
  
  // Try to get user data from localStorage
  let initUser: AuthUser | null = null
  try {
    const storedUser = localStorage.getItem(USER_DATA)
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      
      // Check if user data is still valid (not expired)
      const currentTime = Math.floor(Date.now() / 1000)
      if (parsedUser.exp && parsedUser.exp > currentTime) {
        initUser = parsedUser
      } else {
        // Remove expired user data
        localStorage.removeItem(USER_DATA)
      }
    }
  } catch (e) {
    // Remove corrupted user data
    localStorage.removeItem(USER_DATA)
  }
  
  if (cookieState) {
    try {
      // First try to parse as JSON (for backward compatibility)
      initToken = JSON.parse(cookieState)
    } catch (e) {
      // If parsing fails, use the cookie value as-is
      initToken = cookieState
    }
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) => {
        set((state) => {
          // Store user data in localStorage
          if (user) {
            localStorage.setItem(USER_DATA, JSON.stringify(user))
          } else {
            localStorage.removeItem(USER_DATA)
          }
          return { ...state, auth: { ...state.auth, user } }
        })
      },
      accessToken: initToken,
      setAccessToken: (accessToken) => {
        set((state) => {
          console.log('Setting access token in auth store:', accessToken);
          // Ensure accessToken is a string
          const tokenString = typeof accessToken === 'string' ? accessToken : JSON.stringify(accessToken);
          setCookie(ACCESS_TOKEN, tokenString, 60 * 60 * 24 * 7) // Simpan selama 7 hari
          return { ...state, auth: { ...state.auth, accessToken: tokenString } }
        })
      },
      resetAccessToken: () => {
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        })
      },
      reset: () => {
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          localStorage.removeItem(USER_DATA)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        })
      },
    },
  }
})

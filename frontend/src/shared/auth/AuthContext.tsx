/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type {
  AuthResponse,
  AuthenticatedUser,
  UserRole,
} from '../interfaces/customer.interface'
import { AUTH_STORAGE_KEYS, apiRequest, getStoredAuthToken } from '../utils/api'

interface AuthContextValue {
  hasAnyRole: (roles: UserRole[]) => boolean
  isAuthenticated: boolean
  isInitializing: boolean
  login: (auth: AuthResponse) => void
  logout: () => void
  refreshCurrentUser: () => Promise<void>
  token: null | string
  updateUser: (user: AuthenticatedUser) => void
  user: AuthenticatedUser | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export type { AuthContextValue }

function loadStoredUser(): AuthenticatedUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.user)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthenticatedUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<null | string>(() => getStoredAuthToken())
  const [user, setUser] = useState<AuthenticatedUser | null>(() => loadStoredUser())
  const [isInitializing, setIsInitializing] = useState(() => Boolean(getStoredAuthToken()))

  useEffect(() => {
    let isCancelled = false

    const verifyToken = async () => {
      if (!token) {
        setIsInitializing(false)
        return
      }

      const response = await apiRequest<AuthenticatedUser>('/api/auth/me')

      if (isCancelled) {
        return
      }

      if (response.success && response.data) {
        setUser(response.data)
        window.localStorage.setItem(
          AUTH_STORAGE_KEYS.user,
          JSON.stringify(response.data),
        )
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.token)
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.user)
        setToken(null)
        setUser(null)
      }

      setIsInitializing(false)
    }

    void verifyToken()

    return () => {
      isCancelled = true
    }
  }, [token])

  const login = useCallback((auth: AuthResponse) => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, auth.token)
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(auth.user))
    setToken(auth.token)
    setUser(auth.user)
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.token)
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.user)
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((nextUser: AuthenticatedUser) => {
    setUser(nextUser)
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(nextUser))
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    const response = await apiRequest<AuthenticatedUser>('/api/auth/me')

    if (response.success && response.data) {
      updateUser(response.data)
    }
  }, [updateUser])

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) {
        return false
      }

      return user.roles.some((role) => roles.includes(role))
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      hasAnyRole,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      login,
      logout,
      refreshCurrentUser,
      token,
      updateUser,
      user,
    }),
    [hasAnyRole, isInitializing, login, logout, refreshCurrentUser, token, updateUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import type { UserRole } from '../interfaces/customer.interface'
import { useAuth } from './useAuth'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { hasAnyRole, isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F8FC] text-[#52677F]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[#15558D]">progress_activity</span>
          <span className="text-[14px] font-medium">Loading your session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate replace to="/unauthorized" />
  }

  return <>{children}</>
}

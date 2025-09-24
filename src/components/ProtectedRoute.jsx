// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // ⏳ Chờ xác thực
  if (loading) return <div>Loading...</div>

  // 🚪 Chưa login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 🔑 Nếu có yêu cầu role
  if (requiredRole) {
    if (!user) return <div>Loading user...</div>
    const role = (user.role || '').toUpperCase()
    if (role !== requiredRole.toUpperCase()) {
      console.warn(
        '[ProtectedRoute] ❌ Access denied. Need role:',
        requiredRole,
        'but user role is:',
        role
      )
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

export default ProtectedRoute

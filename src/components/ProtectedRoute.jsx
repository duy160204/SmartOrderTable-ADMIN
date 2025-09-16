// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'  // nhớ đường dẫn đúng

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, loading } = useAuth()
  console.log('[ProtectedRoute] token, user, loading:', { token, user, loading, requiredRole })

  if (loading) return <div>Loading...</div>
  if (!token) return <Navigate to="/login" replace />
  if (requiredRole) {
    if (!user) return <div>Loading user...</div>
    if ((user.role || '').toUpperCase() !== requiredRole) {
      return <Navigate to="/login" replace />
    }
  }
  return children
}

export default ProtectedRoute

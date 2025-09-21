// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div>Loading...</div>
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />

  if (requiredRole) {
    if (!user) return <div>Loading user...</div>
    if ((user.role || '').toUpperCase() !== requiredRole) {
      return <Navigate to="/login" replace />
    }
  }

  return children
}

export default ProtectedRoute

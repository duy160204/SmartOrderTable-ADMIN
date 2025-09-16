// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token')
    console.log('[AuthContext] init token from localStorage:', t)
    return t || null
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[AuthContext] token changed =>', token)
    if (token) {
      const decoded = authService.decodeToken(token)
      if (decoded && decoded.sub) {
        console.log('[AuthContext] Setting user from decoded:', decoded)
        setUser({ username: decoded.sub, role: decoded.role || null })
      } else {
        console.warn('[AuthContext] Decoded token is missing "sub" or "role":', decoded)
        // Không clear token ngay để tránh nháy login-dashboard
        // Có thể giữ token nhưng user null, ProtectedRoute sẽ chờ user
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [token])

  const login = async (username, password) => {
    try {
      const newToken = await authService.login(username, password)
      console.log('[AuthContext.login] Received newToken:', newToken)
      setToken(newToken)
      const decoded = authService.decodeToken(newToken)
      if (decoded && decoded.sub) {
        setUser({ username: decoded.sub, role: decoded.role || null })
      }
      return { success: true }
    } catch (err) {
      console.error('[AuthContext.login] error:', err)
      return { success: false, error: err.message }
    }
  }

  const logout = () => {
    console.log('[AuthContext.logout] Clearing token & user')
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!token,
      isAdmin: user?.role?.toUpperCase() === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

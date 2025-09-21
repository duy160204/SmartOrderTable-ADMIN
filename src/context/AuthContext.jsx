// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null) // accessToken chỉ trong memory
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Khi app mount → xin accessToken từ refreshToken (cookie)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const newToken = await authService.refreshToken()
        if (newToken) {
          setToken(newToken)
          const decoded = authService.decodeToken(newToken)
          setUser({ username: decoded.sub, role: decoded.role || null })
          console.log('[AuthContext] ✅ Session restored:', decoded)
        }
      } catch (err) {
        console.warn('[AuthContext] ⚠️ Refresh token failed:', err.message)
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (username, password) => {
    setLoading(true)
    try {
      const newToken = await authService.login(username, password)
      setToken(newToken)
      const decoded = authService.decodeToken(newToken)
      setUser({ username: decoded.sub, role: decoded.role || null })
      console.log('[AuthContext] ✅ Login success:', decoded)
      return { success: true }
    } catch (err) {
      console.error('[AuthContext] ❌ Login failed:', err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // 👉 logout chỉ reset state, không navigate
  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.warn('[AuthContext] ⚠️ Logout API error:', err.message)
    }
    setToken(null)
    setUser(null)
    console.log('[AuthContext] 🚪 Logged out')
  }

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: (user?.role || '').toUpperCase() === 'ADMIN',
    setToken, // để interceptor update token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

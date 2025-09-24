// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const me = await authService.me()
        setUser(me || null)
        if (me) console.log('[AuthContext] ✅ Session restored:', me)
      } catch (err) {
        console.warn('[AuthContext] ⚠️ Init auth failed:', err.response?.data || err.message)
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
      const ok = await authService.login(username, password)
      if (ok) {
        const me = await authService.me()
        setUser(me)
        console.log('[AuthContext] ✅ Login success:', me)
        return { success: true }
      }
      return { success: false, error: 'Invalid credentials' }
    } catch (err) {
      console.error('[AuthContext] ❌ Login failed:', err.response?.data || err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.warn('[AuthContext] ⚠️ Logout API error:', err.response?.data || err.message)
    }
    setUser(null)
    console.log('[AuthContext] 🚪 Logged out')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: (user?.role || '').toUpperCase() === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
